'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const wi = require('./work-item-core');

function item(overrides = {}) {
  const value = {
    schema_version:'1.0', write_policy:'READ_ONLY', priority_source:'DEFAULT_POLICY', work_item_id:'WI-EXP03-001', title:'Catalog one capability', status:'READY', parent_goal_ids:['G-01'], parent_exp_ids:['EXP-03'], priority:50, created_at_utc:'2026-01-01T00:00:00Z',
    target_repository:'owner/repo',
    resource_keys:['module:catalog'], dependencies:[],
    steps:[
      {step_id:'S1',title:'Inspect source'},
      {step_id:'S2',title:'Record evidence'},
      {step_id:'S3',title:'Validate result'}
    ],
    acceptance_criteria:[
      {criterion_id:'AC1',title:'Evidence is traceable'},
      {criterion_id:'AC2',title:'Independent check is recorded'}
    ],
    ...overrides
  };
  if (Object.prototype.hasOwnProperty.call(overrides,'requested_operations') && overrides.operation_scope_version === undefined) value.operation_scope_version='1.0';
  return value;
}
const operationIds=['control_plane_write','control_plane_merge','control_plane_authorization_change','repository_write','product_implementation','destructive_data_change','database_migration','authorization_change','security_sensitive_change','audit_log_change','architecture_implementation','hosting_deployment','legal_policy_change','merge','acceptance','security_acceptance','production_release'];
function operationGates(overrides={}) {
 return operationIds.map(id=>({id,source_gate_ids:['test-source'],required_work_item_ids:[],owner_authorization_required:false,evidence_requirements:['test evidence'],...(overrides[id]||{})}));
}
function graphWith(nodes,overrides={}) { return {nodes,operation_gates:operationGates(overrides)}; }

const lease={status:'ACTIVE',actor:'alice',chat_id:'chat-a',run_id:'run-a',fencing_token:7,lease_expires_at_utc:'2026-01-01T01:00:00Z'};
const input=(step_id, nowMs=Date.parse('2026-01-01T00:30:00Z'))=>({lease,actor:'alice',chat_id:'chat-a',run_id:'run-a',fencing_token:7,step_id,validation_status:'PASS',evidence_refs:['https://github.com/owner/repo/commit/abc'],nowMs});
const readOnlyGraph=graphWith([{id:'EXP-03',hard_gates:[]}]);

test('parent_work_item_id must be a valid non-self stable ID',()=>{
 assert.throws(()=>wi.validateWorkItem(item({parent_work_item_id:'bad id'})),/invalid parent_work_item_id/);
 assert.throws(()=>wi.validateWorkItem(item({parent_work_item_id:'WI-EXP03-001'})),/invalid parent_work_item_id/);
 assert.equal(wi.validateWorkItem(item({parent_work_item_id:'WI-EXP22-PARENT-001'})),true);
});
test('progress is zero until each step has PASS plus evidence',()=>{
 const x=item(); assert.equal(wi.calculateProgress(x).percentage,0);
 x.steps[0].validation_status='PASS'; assert.equal(wi.calculateProgress(x).percentage,0);
 x.steps[0].evidence_refs=['https://example.test/evidence'];
 assert.equal(wi.calculateProgress(x).percentage,33.33);
});
test('weighted progress requires explicit version and positive weights',()=>{
 const x=item({weighting:{version:'weights-v1'},steps:[{step_id:'A',title:'A',weight:1},{step_id:'B',title:'B',weight:3}]});
 x.steps[0].validation_status='PASS';x.steps[0].evidence_refs=['evidence:A'];
 assert.equal(wi.calculateProgress(x).percentage,25);
 assert.equal(wi.calculateProgress(x).weighting_version,'weights-v1');
});
test('invalid weighting is rejected',()=>assert.throws(()=>wi.calculateProgress(item({weighting:{version:'v1'}})),/positive weights/));
test('stale fencing token cannot record progress',()=>{
 const x=item(); assert.throws(()=>wi.recordStepEvidence(x,{...input('S1'),fencing_token:6}),/stale_or_invalid_fencing_token/);
});
test('step cannot be verified without evidence refs',()=>{
 const x=item(); assert.throws(()=>wi.recordStepEvidence(x,{...input('S1'),evidence_refs:[]}),/evidence_refs_required/);
});
test('only known step can be updated',()=>assert.throws(()=>wi.recordStepEvidence(item(),input('S9')),/unknown_step_id/));
test('duplicate step evidence is idempotent',()=>{
 const x=item(); wi.recordStepEvidence(x,input('S1')); const again=wi.recordStepEvidence(x,input('S1'));
 assert.equal(again.changed,false); assert.equal(wi.calculateProgress(x).verified_steps,1);
});
test('80 percent never implies acceptance; all required criteria and dependencies gate acceptance',()=>{
 const x=item({steps:Array.from({length:5},(_,i)=>({step_id:'S'+i,title:'Step '+i})),acceptance_criteria:[{criterion_id:'AC1',title:'All evidence',validation_status:'PASS',evidence_refs:['e:1']}]});
 for(let i=0;i<4;i++) wi.recordStepEvidence(x,{...input('S'+i),nowMs:Date.parse('2026-01-01T00:30:00Z')});
 assert.equal(wi.calculateProgress(x).percentage,80); assert.equal(wi.calculateProgress(x).can_accept,false);
});
test('selection fails closed without a canonical dependency graph and with a structurally invalid graph',()=>{
 const x=item({work_item_id:'WI-NEW-WRITE-001',write_policy:'WRITE_ALLOWED',target_repository:'owner/repo',requested_operations:['repository_write']});
 const byId=new Map([[x.work_item_id,x]]);
 const nowMs=Date.parse('2026-01-01T00:00:00Z');
 assert.equal(wi.dependencyReady(x,byId,null),false);
 assert.equal(wi.selectNextWorkItem([x],{nowMs}),null);
 const invalid=graphWith([{id:'EXP-03',hard_gates:['implementation']}]);
 assert.equal(wi.selectNextWorkItem([x],{nowMs,dependencyGraph:invalid}),null);
 const valid=graphWith([{id:'EXP-03',hard_gates:[]}],{repository_write:{applies_to_target_repositories:['owner/repo'],required_work_item_ids:[],owner_authorization_required:false}});
 assert.equal(wi.selectNextWorkItem([x],{nowMs,dependencyGraph:valid}).work_item_id,x.work_item_id);
});
test('dependencies block selection until every parent is accepted',()=>{
 const parent=item({work_item_id:'WI-PARENT',status:'IN_PROGRESS'});
 const child=item({work_item_id:'WI-CHILD',dependencies:[{work_item_id:'WI-PARENT'}]});
 assert.equal(wi.selectNextWorkItem([parent,child],{nowMs:Date.parse('2026-01-01T00:00:00Z'),dependencyGraph:readOnlyGraph}).work_item_id,'WI-PARENT');
 parent.status='ACCEPTED';
 assert.equal(wi.selectNextWorkItem([parent,child],{nowMs:Date.parse('2026-01-01T00:00:00Z'),dependencyGraph:readOnlyGraph}).work_item_id,'WI-CHILD');
});
test('active lease and resource conflicts exclude a candidate',()=>{
 const x=item(); const now=Date.parse('2026-01-01T00:30:00Z');
 assert.equal(wi.selectNextWorkItem([x],{nowMs:now,dependencyGraph:readOnlyGraph,leasesByWorkItem:{[x.work_item_id]:lease}}),null);
 assert.equal(wi.selectNextWorkItem([x],{nowMs:now,dependencyGraph:readOnlyGraph,activeLocks:[{resource_key:'module:catalog',lease_expires_at_utc:'2026-01-01T01:00:00Z'}]}),null);
});
test('expired lease makes same stable work item resumable',()=>{
 const x=item({status:'IN_PROGRESS'}); const expired={...lease,lease_expires_at_utc:'2025-12-31T23:00:00Z'};
 assert.equal(wi.selectNextWorkItem([x],{nowMs:Date.parse('2026-01-01T00:00:00Z'),dependencyGraph:readOnlyGraph,leasesByWorkItem:{[x.work_item_id]:expired}}).work_item_id,x.work_item_id);
});
test('resume preserves verified steps and returns only remaining steps',()=>{
 const x=item(); wi.recordStepEvidence(x,input('S1'));wi.recordStepEvidence(x,input('S2'));
 assert.deepEqual(wi.resumePlan(x).completed_step_ids,['S1','S2']);
 assert.deepEqual(wi.resumePlan(x).remaining_step_ids,['S3']);
});
test('checkpoint is bound to a live owner lease',()=>{
 const x=item(); const cp=wi.createCheckpoint(x,{lease,actor:'alice',chat_id:'chat-a',run_id:'run-a',fencing_token:7,nowMs:Date.parse('2026-01-01T00:30:00Z')});
 assert.equal(cp.work_item_id,x.work_item_id); assert.deepEqual(cp.remaining_step_ids,['S1','S2','S3']);
});
test('fairness aging improves old work without changing owner priority',()=>{
 const old=item({work_item_id:'WI-OLD',priority:50,created_at_utc:'2026-01-01T00:00:00Z'});
 const fresh=item({work_item_id:'WI-NEW',priority:49,created_at_utc:'2026-01-02T00:00:00Z'});
 const chosen=wi.selectNextWorkItem([fresh,old],{nowMs:Date.parse('2026-01-04T00:00:00Z'),dependencyGraph:readOnlyGraph});
 assert.equal(chosen.work_item_id,'WI-OLD');
 assert.equal(old.priority,50);
});

test('all steps and all required criteria with accepted dependencies make an item eligible for review, not accepted',()=>{
 const x=item();
 for(const step of x.steps) wi.recordStepEvidence(x,{...input(step.step_id)});
 for(const criterion of x.acceptance_criteria) wi.recordCriterionEvidence(x,{
   lease,actor:'alice',chat_id:'chat-a',run_id:'run-a',fencing_token:7,
   criterion_id:criterion.criterion_id,validation_status:'PASS',
   evidence_refs:['https://github.com/owner/repo/commit/criterion'],nowMs:Date.parse('2026-01-01T00:30:00Z')
 });
 const p=wi.calculateProgress(x);
 assert.equal(p.percentage,100);
 assert.equal(p.can_accept,true);
 assert.equal(x.status,'REVIEW_REQUIRED');
});
test('unaccepted dependency prevents acceptance even when all local steps and criteria pass',()=>{
 const x=item({dependencies:[{work_item_id:'WI-PARENT',status:'IN_PROGRESS'}]});
 for(const step of x.steps) wi.recordStepEvidence(x,{...input(step.step_id)});
 for(const criterion of x.acceptance_criteria) wi.recordCriterionEvidence(x,{
   lease,actor:'alice',chat_id:'chat-a',run_id:'run-a',fencing_token:7,
   criterion_id:criterion.criterion_id,validation_status:'PASS',
   evidence_refs:['https://github.com/owner/repo/commit/criterion'],nowMs:Date.parse('2026-01-01T00:30:00Z')
 });
 assert.equal(wi.calculateProgress(x).percentage,100);
 assert.equal(wi.calculateProgress(x).can_accept,false);
 x.dependencies[0].status='ACCEPTED';
 assert.equal(wi.calculateProgress(x).can_accept,true);
});

test('rejects a work item without a required acceptance criterion',()=>{
 const x=item({acceptance_criteria:[{criterion_id:'AC1',title:'Optional only',required:false}]});
 assert.throws(()=>wi.calculateProgress(x),/at least one required acceptance criterion/);
});

test('rejects missing write policy instead of assuming write permission',()=>{
 const x=item(); delete x.write_policy; assert.throws(()=>wi.calculateProgress(x),/invalid write_policy/);
});

const productRepository='a4adelahmadian86-wq/non';
const ownerIssueUrl='https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/51';
const ownerApprovalBody='## Owner authorization and scope\\n**Owner decision (2026-11-16):** The repository owner explicitly approved WRITE_ALLOWED development and strengthening of `a4adelahmadian86-wq/non` in the current ChatGPT conversation.';
const ownerApprovalContext={
 repository_owner:'a4adelahmadian86-wq',
 issue_author:'a4adelahmadian86-wq',
 issue_url:ownerIssueUrl,
 issue_body:ownerApprovalBody
};

test('NON WRITE_ALLOWED requires an owner approval reference',()=>{
 const x=item({target_repository:productRepository,write_policy:'WRITE_ALLOWED',requested_operations:['product_implementation']});
 assert.throws(()=>wi.calculateProgress(x),/owner_approval_ref is required for NON WRITE_ALLOWED/);
 x.owner_approval_ref=ownerIssueUrl;
 assert.doesNotThrow(()=>wi.calculateProgress(x));
});

test('NON WRITE_ALLOWED is accepted only for an owner-authored self-referencing Issue with explicit approval text',()=>{
 const x=item({target_repository:productRepository,write_policy:'WRITE_ALLOWED',owner_approval_ref:ownerIssueUrl,requested_operations:['product_implementation']});
 assert.equal(wi.validateProductWriteAuthorization(x,ownerApprovalContext),true);
 assert.throws(()=>wi.validateProductWriteAuthorization(x,{...ownerApprovalContext,issue_author:'collaborator'}),/owner-authored Issue/);
 assert.throws(()=>wi.validateProductWriteAuthorization(x,{...ownerApprovalContext,issue_url:'https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/52'}),/exactly reference/);
 assert.throws(()=>wi.validateProductWriteAuthorization(x,{...ownerApprovalContext,issue_body:'Owner decision: no WRITE_ALLOWED permission'}),/explicit owner approval statement/);
});

test('NON READ_ONLY and approval-pending Work Items do not authorize product writes',()=>{
 const readOnly=item({target_repository:productRepository,write_policy:'READ_ONLY'});
 assert.doesNotThrow(()=>wi.calculateProgress(readOnly));
 assert.equal(wi.validateProductWriteAuthorization(readOnly,ownerApprovalContext),false);
 const pending=item({target_repository:productRepository,write_policy:'WRITE_REQUIRES_OWNER_APPROVAL',owner_approval_ref:ownerIssueUrl});
 assert.doesNotThrow(()=>wi.calculateProgress(pending));
 assert.equal(wi.validateProductWriteAuthorization(pending,ownerApprovalContext),false);
});

test('WRITE_ALLOWED for unrelated repositories keeps the existing generic validation path',()=>{
 const x=item({target_repository:'owner/repo',write_policy:'WRITE_ALLOWED',requested_operations:['repository_write']});
 assert.doesNotThrow(()=>wi.calculateProgress(x));
});
test('approval-gated writes require an owner approval evidence reference',()=>{
 const x=item({write_policy:'WRITE_REQUIRES_OWNER_APPROVAL'});
 assert.throws(()=>wi.calculateProgress(x),/owner_approval_ref is required/);
 x.owner_approval_ref='https://github.com/owner/repo/issues/1#issuecomment-1';
 assert.doesNotThrow(()=>wi.calculateProgress(x));
});


test('execution, acceptance and overall completion are calculated separately',()=>{
 const x=item();
 for(const step of x.steps) wi.recordStepEvidence(x,{...input(step.step_id)});
 wi.recordCriterionEvidence(x,{lease,actor:'alice',chat_id:'chat-a',run_id:'run-a',fencing_token:7,criterion_id:'AC1',validation_status:'PASS',evidence_refs:['evidence:criterion-1'],nowMs:Date.parse('2026-01-01T00:30:00Z')});
 const p=wi.calculateProgress(x);
 assert.equal(p.execution_percentage,100);
 assert.equal(p.acceptance_percentage,50);
 assert.equal(p.overall_completion_percentage,50);
 assert.equal(p.percentage,100);
 assert.equal(p.can_accept,false);
});

test('versioned acceptance weighting is applied independently from execution weighting',()=>{
 const x=item({
  acceptance_weighting:{version:'acceptance-v1'},
  acceptance_criteria:[
   {criterion_id:'AC1',title:'Critical',weight:3},
   {criterion_id:'AC2',title:'Minor',weight:1}
  ]
 });
 wi.recordCriterionEvidence(x,{lease,actor:'alice',chat_id:'chat-a',run_id:'run-a',fencing_token:7,criterion_id:'AC2',validation_status:'PASS',evidence_refs:['evidence:minor'],nowMs:Date.parse('2026-01-01T00:30:00Z')});
 const p=wi.calculateProgress(x);
 assert.equal(p.acceptance_percentage,25);
 assert.equal(p.acceptance_weighting_version,'acceptance-v1');
 assert.equal(p.overall_completion_percentage,0);
});

test('deep profile rejects a Work Item without substantive depth metadata',()=>{
 const x=item({
  effort_estimate_minutes:25,
  effort_rationale:'Focused discovery and cross-check.',
  depth_profile:{profile_version:'2.0.0',min_substantive_steps:6,min_acceptance_criteria:4,min_deliverables:3,target_effort_minutes:25},
  steps:Array.from({length:6},(_,i)=>({step_id:'S'+i,title:'Step '+i,expected_output:'Output '+i,evidence_requirement:'Evidence '+i})),
  acceptance_criteria:Array.from({length:4},(_,i)=>({criterion_id:'AC'+i,title:'Criterion '+i,evidence_requirement:'Evidence '+i})),
  deliverables:Array.from({length:3},(_,i)=>({deliverable_id:'D'+i,description:'Deliverable '+i,evidence_requirement:'Evidence '+i}))
 });
 assert.doesNotThrow(()=>wi.validateWorkItem(x));
 delete x.steps[0].evidence_requirement;
 assert.throws(()=>wi.validateWorkItem(x),/deep Work Item steps need evidence_requirement/);
});

test('checkpoint stores all three progress dimensions and state counts',()=>{
 const x=item();
 const cp=wi.createCheckpoint(x,{lease,actor:'alice',chat_id:'chat-a',run_id:'run-a',fencing_token:7,nowMs:Date.parse('2026-01-01T00:30:00Z')});
 assert.equal(cp.execution_progress_percentage,0);
 assert.equal(cp.acceptance_progress_percentage,0);
 assert.equal(cp.overall_completion_percentage,0);
 assert.equal(cp.progress_calculation_version,'PROGRESS_V2');
 assert.equal(cp.required_step_counts.not_run,3);
 assert.equal(cp.acceptance_criteria_counts.not_run,2);
});


test('EXP-01 is eligible without EXP-22 ACCEPTED when EXP-22 is only a soft input',()=>{
 const baseline=item({work_item_id:'WI-EXP01-BASELINE-001',parent_exp_ids:['EXP-01']});
 const implementation=item({work_item_id:'WI-EXP22-IMPLEMENTATION-001',parent_exp_ids:['EXP-22'],status:'READY'});
 const graph=graphWith([{id:'EXP-01',hard_gates:[],soft_inputs:['EXP-22']},{id:'EXP-22',hard_gates:[]}]);
 const evaluated=wi.evaluateHardGates(baseline,graph,[baseline,implementation]);
 assert.equal(evaluated.ready,true);
 assert.deepEqual(evaluated.blockers,[]);
 assert.equal(wi.dependencyReady(baseline,new Map([[baseline.work_item_id,baseline],[implementation.work_item_id,implementation]]),graph),true);
});

test('unaccepted EXP hard gate blocks eligibility until the matching Work Item is ACCEPTED',()=>{
 const target=item({work_item_id:'WI-EXP06-TESTING-001',parent_exp_ids:['EXP-06']});
 const dependency=item({work_item_id:'WI-EXP22-IMPLEMENTATION-001',parent_exp_ids:['EXP-22'],status:'IN_PROGRESS'});
 const graph=graphWith([{id:'EXP-06',hard_gates:['EXP-22'],soft_inputs:[]},{id:'EXP-22',hard_gates:[]}]);
 assert.equal(wi.evaluateHardGates(target,graph,[target,dependency]).ready,false);
 dependency.status='ACCEPTED';
 assert.equal(wi.evaluateHardGates(target,graph,[target,dependency]).ready,true);
});

test('non-EXP strings in hard_gates invalidate the graph while soft inputs never gate',()=>{
 const target=item({work_item_id:'WI-EXP01-BASELINE-001',parent_exp_ids:['EXP-01']});
 const unknown=graphWith([{id:'EXP-01',hard_gates:['implementation'],soft_inputs:[]}]);
 assert.equal(wi.evaluateHardGates(target,unknown,[target]).ready,false);
 const softOnly=graphWith([{id:'EXP-01',hard_gates:[],soft_inputs:['EXP-22']},{id:'EXP-22',hard_gates:[]}]);
 assert.equal(wi.evaluateHardGates(target,softOnly,[target]).ready,true);
 assert.equal(wi.evaluateHardGates(target,graphWith([]),[target]).ready,false);
});

test('Work Item selection applies canonical EXP-only hard gates',()=>{
 const baseline=item({work_item_id:'WI-EXP01-BASELINE-001',parent_exp_ids:['EXP-01']});
 const later=item({work_item_id:'WI-EXP22-IMPLEMENTATION-001',parent_exp_ids:['EXP-22'],status:'READY'});
 const graph=graphWith([
  {id:'EXP-01',hard_gates:[],soft_inputs:['EXP-22']},
  {id:'EXP-22',hard_gates:['EXP-21'],soft_inputs:[]},
  {id:'EXP-21',hard_gates:[]}
 ]);
 const selected=wi.selectNextWorkItem([baseline,later],{nowMs:Date.parse('2026-01-01T01:00:00Z'),dependencyGraph:graph});
 assert.equal(selected.work_item_id,baseline.work_item_id);
});

test('READ_ONLY analysis is not blocked by a later product implementation gate',()=>{
 const target=item({work_item_id:'WI-EXP22-READINESS-001',parent_exp_ids:['EXP-22'],target_repository:'a4adelahmadian86-wq/non'});
 const graph=graphWith([{id:'EXP-22',hard_gates:[]},{id:'EXP-23',hard_gates:[]}],{
   product_implementation:{applies_to_exp_ids:['EXP-22'],applies_to_target_repositories:['a4adelahmadian86-wq/non'],required_work_item_ids:['WI-EXP21-CHANGE-PACKAGE-001'],owner_authorization_required:true}
 });
 assert.equal(wi.evaluateHardGates(target,graph,[target]).ready,true);
});

test('NON product implementation requires an explicit operation and accepted exact Work Items',()=>{
 const target=item({work_item_id:'WI-NON-IMPLEMENTATION-VERTICAL-SLICE-001',parent_exp_ids:['EXP-22','EXP-23'],target_repository:'a4adelahmadian86-wq/non',write_policy:'WRITE_ALLOWED',owner_approval_ref:'https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/51',requested_operations:['product_implementation']});
 const prereqs=[
  item({work_item_id:'WI-EXP21-CHANGE-PACKAGE-001',parent_exp_ids:['EXP-21'],status:'ACCEPTED'}),
  item({work_item_id:'WI-EXP22-CONTROLLED-IMPLEMENTATION-001',parent_exp_ids:['EXP-22'],status:'ACCEPTED'}),
  item({work_item_id:'WI-EXP23-REGRESSION-001',parent_exp_ids:['EXP-23'],status:'ACCEPTED'})
 ];
 const graph=graphWith([{id:'EXP-22',hard_gates:[]},{id:'EXP-23',hard_gates:[]}],{
  product_implementation:{applies_to_exp_ids:['EXP-22'],applies_to_target_repositories:['a4adelahmadian86-wq/non'],required_work_item_ids:prereqs.map(x=>x.work_item_id),owner_authorization_required:true}
 });
 assert.equal(wi.evaluateHardGates(target,graph,[target,...prereqs]).ready,true);
 assert.equal(wi.evaluateHardGates(target,graph,[target,...prereqs.slice(0,2)]).ready,false);
});

test('legacy NON WRITE_ALLOWED Work Items without requested_operations fail closed',()=>{
 const target=item({work_item_id:'WI-NON-LEGACY-001',parent_exp_ids:['EXP-22'],target_repository:'a4adelahmadian86-wq/non',write_policy:'WRITE_ALLOWED',owner_approval_ref:'https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/51'});
 const result=wi.evaluateHardGates(target,graphWith([{id:'EXP-22',hard_gates:[]}]),[target]);
 assert.equal(result.ready,false);
 assert.ok(result.blockers.includes('requested_operations_required_for_write'));
});

test('unknown requested operation fails closed',()=>{
 const target=item({requested_operations:['run_untrusted_action']});
 const result=wi.evaluateHardGates(target,graphWith([{id:'EXP-03',hard_gates:[]}]),[target]);
 assert.equal(result.ready,false);
 assert.ok(result.blockers.includes('unknown_requested_operation:run_untrusted_action'));
});

test('WRITE_ALLOWED cannot declare analysis-only scope and versioned scope must be explicit',()=>{
 const x=item({write_policy:'WRITE_ALLOWED',requested_operations:['analysis']});
 assert.throws(()=>wi.validateWorkItem(x),/cannot request analysis/);
 assert.throws(()=>wi.validateWorkItem(item({operation_scope_version:'1.0'})),/must be supplied together/);
});

test('multi-EXP merge gate matches any declared parent EXP and does not self-gate',()=>{
 const target=item({work_item_id:'WI-NON-IMPLEMENTATION-VERTICAL-SLICE-001',parent_exp_ids:['EXP-22','EXP-23'],target_repository:'a4adelahmadian86-wq/non',write_policy:'WRITE_ALLOWED',owner_approval_ref:'https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/51',requested_operations:['product_implementation']});
 const regression=item({work_item_id:'WI-EXP23-REGRESSION-001',parent_exp_ids:['EXP-23'],status:'ACCEPTED'});
 const graph=graphWith([{id:'EXP-22',hard_gates:[]},{id:'EXP-23',hard_gates:[]}],{
   merge:{applies_to_exp_ids:['EXP-23'],applies_to_target_repositories:['a4adelahmadian86-wq/non'],required_work_item_ids:['WI-EXP23-REGRESSION-001'],owner_authorization_required:true}
 });
 assert.equal(wi.evaluateHardGates(target,graph,[target,regression],{requestedOperations:['merge']}).ready,true);
 const selfGate=graphWith([{id:'EXP-22',hard_gates:[]},{id:'EXP-23',hard_gates:[]}],{
  merge:{applies_to_exp_ids:['EXP-23'],applies_to_target_repositories:['a4adelahmadian86-wq/non'],required_work_item_ids:[target.work_item_id],owner_authorization_required:true}
 });
 assert.ok(wi.evaluateHardGates(target,selfGate,[target],{requestedOperations:['merge']}).blockers.some(x=>x.startsWith('operation_prerequisite_self_reference:')));
});

test('control-plane PR merge uses its own scoped operation gate',()=>{
 const target=item({work_item_id:'WI-OPERATION-GATE-MODEL-001',parent_exp_ids:['EXP-01','EXP-22','EXP-23'],target_repository:'a4adelahmadian86-wq/farast-control-plane',write_policy:'WRITE_ALLOWED',operation_scope_version:'1.0',requested_operations:['control_plane_write']});
 const graph=graphWith([{id:'EXP-01',hard_gates:[]},{id:'EXP-22',hard_gates:[]},{id:'EXP-23',hard_gates:[]}],{
  control_plane_write:{applies_to_target_repositories:['a4adelahmadian86-wq/farast-control-plane'],required_work_item_ids:[],owner_authorization_required:false},
  control_plane_merge:{applies_to_target_repositories:['a4adelahmadian86-wq/farast-control-plane'],required_work_item_ids:[],owner_authorization_required:false}
 });
 assert.equal(wi.evaluateHardGates(target,graph,[target]).ready,true);
 assert.equal(wi.evaluateHardGates(target,graph,[target],{requestedOperations:['control_plane_merge']}).ready,true);
});

test('control-plane action and generic repository writes cannot be inferred for unknown targets',()=>{
 const unknown=item({work_item_id:'WI-UNKNOWN-WRITE-001',write_policy:'WRITE_ALLOWED',target_repository:'unknown/repo'});
 const result=wi.evaluateHardGates(unknown,graphWith([{id:'EXP-03',hard_gates:[]}]),[unknown]);
 assert.equal(result.ready,false);
 assert.ok(result.blockers.includes('requested_operations_required_for_write'));
});

test('every registered action operation is fail-closed until its exact prerequisites are ACCEPTED',()=>{
 for(const operation of operationIds){
  const targetRepo=['control_plane_write','control_plane_merge','control_plane_authorization_change'].includes(operation)
    ? 'a4adelahmadian86-wq/farast-control-plane'
    : operation==='repository_write' ? 'other/authorized-repo' : 'a4adelahmadian86-wq/non';
  const requiredId='WI-REQUIRED-'+operation.toUpperCase().replace(/[^A-Z0-9]+/g,'-');
  const target=item({
   work_item_id:'WI-ACTION-'+operation.toUpperCase().replace(/[^A-Z0-9]+/g,'-'),
   parent_exp_ids:['EXP-22','EXP-23'],
   target_repository:targetRepo,
   write_policy:'WRITE_ALLOWED',
   owner_approval_ref:'https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/999',
   requested_operations:[targetRepo==='a4adelahmadian86-wq/non'?'product_implementation':targetRepo==='a4adelahmadian86-wq/farast-control-plane'?'control_plane_write':'repository_write',...(operation===(targetRepo==='a4adelahmadian86-wq/non'?'product_implementation':targetRepo==='a4adelahmadian86-wq/farast-control-plane'?'control_plane_write':'repository_write')?[]:[operation])]
  });
  assert.doesNotThrow(()=>wi.validateWorkItem(target),operation+' has a valid target base write operation');
  const gate=operationGates({
   [operation]:{
    applies_to_exp_ids:['EXP-23'],
    applies_to_target_repositories:[targetRepo],
    required_work_item_ids:[requiredId],
    owner_authorization_required:true
   }
  });
  const graph={nodes:[{id:'EXP-22',hard_gates:[]},{id:'EXP-23',hard_gates:[]}],operation_gates:gate};
  const blocked=wi.evaluateHardGates(target,graph,[target]);
  assert.equal(blocked.ready,false,operation+' must fail closed without its prerequisite');
  assert.ok(blocked.blockers.some(x=>x.includes(requiredId)),operation+' must name the missing exact Work Item');
  const accepted=item({work_item_id:requiredId,parent_exp_ids:['EXP-23'],status:'ACCEPTED'});
  const ready=wi.evaluateHardGates(target,graph,[target,accepted]);
  assert.equal(ready.ready,true,operation+' must pass when exact prerequisites and owner authorization are present');
 }
});

test('empty operation prerequisites are valid only with explicit evidence and authorization policy',()=>{
 const target=item({work_item_id:'WI-OPERATION-GATE-MODEL-001',parent_exp_ids:['EXP-01'],target_repository:'a4adelahmadian86-wq/farast-control-plane',write_policy:'WRITE_ALLOWED'});
 const graph=graphWith([{id:'EXP-01',hard_gates:[]}]);
 assert.equal(wi.validateDependencyGraph(graph).valid,true);
 assert.equal(wi.evaluateHardGates(target,graph,[target]).ready,true);
 const malformed=graphWith([{id:'EXP-01',hard_gates:[]}],{control_plane_write:{evidence_requirements:[]}});
 assert.equal(wi.validateDependencyGraph(malformed).valid,false);
});

test('missing operation registry and missing action definition fail closed',()=>{
 const target=item({work_item_id:'WI-NON-IMPLEMENTATION-001',parent_exp_ids:['EXP-22'],target_repository:'a4adelahmadian86-wq/non',write_policy:'WRITE_ALLOWED',owner_approval_ref:'https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/51',requested_operations:['product_implementation']});
 assert.equal(wi.evaluateHardGates(target,{nodes:[{id:'EXP-22',hard_gates:[]}]},[target]).ready,false);
 const incomplete=graphWith([{id:'EXP-22',hard_gates:[]}]).operation_gates.filter(g=>g.id!=='product_implementation');
 assert.equal(wi.evaluateHardGates(target,{nodes:[{id:'EXP-22',hard_gates:[]}],operation_gates:incomplete},[target]).ready,false);
});

test('action gate scope applies to every parent EXP and mismatched target is not silently authorized',()=>{
 const target=item({work_item_id:'WI-NON-IMPLEMENTATION-001',parent_exp_ids:['EXP-22','EXP-23'],target_repository:'a4adelahmadian86-wq/non',write_policy:'WRITE_ALLOWED',owner_approval_ref:'https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/51',requested_operations:['product_implementation','merge']});
 const gate={merge:{applies_to_exp_ids:['EXP-23'],applies_to_target_repositories:['a4adelahmadian86-wq/non'],required_work_item_ids:[],owner_authorization_required:true}};
 const graph=graphWith([{id:'EXP-22',hard_gates:[]},{id:'EXP-23',hard_gates:[]}],gate);
 assert.equal(wi.evaluateHardGates(target,graph,[target],{requestedOperations:['merge']}).ready,true);
 const wrongTarget=item({...target,target_repository:'a4adelahmadian86-wq/farast-control-plane'});
 const wrong=wi.evaluateHardGates(wrongTarget,graph,[wrongTarget],{requestedOperations:['merge']});
 assert.ok(wrong.blockers.includes('operation_target_scope_mismatch:merge:a4adelahmadian86-wq/farast-control-plane'));
});

test('versioned operation scopes require requested_operations while legacy read-only items remain valid',()=>{
 const legacy=item();
 assert.equal(wi.validateWorkItem(legacy),true);
 assert.throws(()=>wi.validateWorkItem(item({operation_scope_version:'1.0'})),/must be supplied together/);
 const current=item({operation_scope_version:'1.0',requested_operations:['analysis']});
 assert.equal(wi.validateWorkItem(current),true);
});

test('target-specific base operation is required before additional action operations',()=>{
 const non=item({target_repository:'a4adelahmadian86-wq/non',write_policy:'WRITE_ALLOWED',owner_approval_ref:'https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/51',requested_operations:['merge']});
 const control=item({target_repository:'a4adelahmadian86-wq/farast-control-plane',write_policy:'WRITE_ALLOWED',requested_operations:['control_plane_merge']});
 assert.throws(()=>wi.validateWorkItem(non),/must include product_implementation/);
 assert.throws(()=>wi.validateWorkItem(control),/must include control_plane_write/);
});

test('primary EXP scope uses the first explicitly ordered parent EXP for cross-cutting Work Items',()=>{
 const x=item({work_item_id:'WI-CROSS-CUTTING-001',parent_exp_ids:['EXP-01','EXP-22','EXP-23']});
 assert.equal(wi.primaryExpId(x),'EXP-01');
});


function fullyVerified(item) {
 item.steps.forEach((step,index)=>{step.validation_status='PASS';step.evidence_refs=['https://example.test/step-'+index];});
 item.acceptance_criteria.forEach((criterion,index)=>{criterion.validation_status='PASS';criterion.evidence_refs=['https://example.test/criterion-'+index];});
 return item;
}
const readonlyReview = {event:'REVIEW',issue_number:13,target_repository:'owner/repo',branch:null};

test('READ_ONLY evidence-only acceptance passes after a valid review handoff without a PR or branch',()=>{
 const x=fullyVerified(item());
 const result=wi.evaluateReadOnlyAcceptance(x,{issueNumber:13,hasActiveLease:false,hardGatesReady:true,reviewEvent:readonlyReview});
 assert.equal(result.ready,true);
 assert.deepEqual(result.blockers,[]);
 assert.equal(result.progress.can_accept,true);
});

test('READ_ONLY evidence-only acceptance fails closed while a lease is active',()=>{
 const x=fullyVerified(item());
 const result=wi.evaluateReadOnlyAcceptance(x,{issueNumber:13,hasActiveLease:true,hardGatesReady:true,reviewEvent:readonlyReview});
 assert.equal(result.ready,false);
 assert.ok(result.blockers.includes('active_lease'));
});

test('READ_ONLY evidence-only acceptance rejects write-capable Work Items',()=>{
 const x=fullyVerified(item({write_policy:'WRITE_ALLOWED',target_repository:'a4adelahmadian86-wq/non',owner_approval_ref:'https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/51',requested_operations:['product_implementation']}));
 const result=wi.evaluateReadOnlyAcceptance(x,{issueNumber:13,hasActiveLease:false,hardGatesReady:true,reviewEvent:readonlyReview});
 assert.equal(result.ready,false);
 assert.ok(result.blockers.includes('write_policy_not_read_only'));
});

test('READ_ONLY evidence-only acceptance requires the latest handoff to be REVIEW for the same Issue and target with no branch',()=>{
 const x=fullyVerified(item());
 const wrongIssue=wi.evaluateReadOnlyAcceptance(x,{issueNumber:13,hasActiveLease:false,hardGatesReady:true,reviewEvent:{...readonlyReview,issue_number:14}});
 const wrongTarget=wi.evaluateReadOnlyAcceptance(x,{issueNumber:13,hasActiveLease:false,hardGatesReady:true,reviewEvent:{...readonlyReview,target_repository:'other/repo'}});
 const allocatedBranch=wi.evaluateReadOnlyAcceptance(x,{issueNumber:13,hasActiveLease:false,hardGatesReady:true,reviewEvent:{...readonlyReview,branch:'work/should-not-exist'}});
 assert.ok(wrongIssue.blockers.includes('review_handoff_issue_mismatch'));
 assert.ok(wrongTarget.blockers.includes('review_handoff_target_mismatch'));
 assert.ok(allocatedBranch.blockers.includes('read_only_handoff_must_not_have_branch'));
});

test('READ_ONLY evidence-only acceptance requires satisfied canonical hard gates',()=>{
 const x=fullyVerified(item());
 const result=wi.evaluateReadOnlyAcceptance(x,{issueNumber:13,hasActiveLease:false,hardGatesReady:false,reviewEvent:readonlyReview});
 assert.equal(result.ready,false);
 assert.ok(result.blockers.includes('hard_gates_not_satisfied'));
});

test('READ_ONLY evidence-only acceptance requires all step and criterion evidence',()=>{
 const x=item();
 const result=wi.evaluateReadOnlyAcceptance(x,{issueNumber:13,hasActiveLease:false,hardGatesReady:true,reviewEvent:readonlyReview});
 assert.equal(result.ready,false);
 assert.ok(result.blockers.includes('required_evidence_incomplete'));
});


test('READ_ONLY evidence-only acceptance rejects malformed Work Item schema',()=>{
 const x=fullyVerified(item({schema_version:'9'}));
 const result=wi.evaluateReadOnlyAcceptance(x,{issueNumber:13,hasActiveLease:false,hardGatesReady:true,reviewEvent:readonlyReview});
 assert.equal(result.ready,false);
 assert.ok(result.blockers.some(blocker=>blocker.startsWith('invalid_work_item:')));
});

test('READ_ONLY evidence-only acceptance rejects a missing or non-REVIEW handoff',()=>{
 const x=fullyVerified(item());
 const missing=wi.evaluateReadOnlyAcceptance(x,{issueNumber:13,hasActiveLease:false,hardGatesReady:true});
 const wrongEvent=wi.evaluateReadOnlyAcceptance(x,{issueNumber:13,hasActiveLease:false,hardGatesReady:true,reviewEvent:{...readonlyReview,event:'RELEASE'}});
 assert.ok(missing.blockers.includes('missing_review_handoff'));
 assert.ok(wrongEvent.blockers.includes('missing_review_handoff'));
});

test('explicit dependencies are enforced by coordinator hard-gate evaluator',()=>{
 const child=item({dependencies:[{work_item_id:'WI-PARENT'}]});
 const graph=graphWith([{id:'EXP-03',hard_gates:[]}]);
 assert.ok(wi.evaluateHardGates(child,graph,[child]).blockers.includes('unresolved_explicit_dependency:WI-PARENT'));
 const parent=item({work_item_id:'WI-PARENT',status:'READY'});
 assert.ok(wi.evaluateHardGates(child,graph,[child,parent]).blockers.includes('explicit_dependency_not_accepted:WI-PARENT:READY'));
 parent.status='ACCEPTED';
 assert.equal(wi.evaluateHardGates(child,graph,[child,parent]).ready,true);
});
test('stable Work Item IDs are globally unique across Issues and registry even without dependencies',()=>{
 const x=item({work_item_id:'WI-DUPLICATE-GLOBAL-001',dependencies:[]});
 const issues=[{number:101,work_item_id:x.work_item_id},{number:102,work_item_id:x.work_item_id}];
 assert.deepEqual(wi.findDuplicateWorkItemIdIssues(101,x,issues,[]),[102]);
 assert.deepEqual(wi.findDuplicateWorkItemIdIssues(102,x,issues,[]),[101]);
 const registry=[{issue_number:103,work_item_id:x.work_item_id}];
 assert.deepEqual(wi.findDuplicateWorkItemIdIssues(101,x,issues,registry),[102,103]);
 assert.deepEqual(wi.findDuplicateWorkItemIdIssues(104,x,[{number:104,work_item_id:x.work_item_id}],[]),[]);
});
test('duplicate canonical Work Item IDs block explicit dependencies in either order',()=>{
 const child=item({dependencies:[{work_item_id:'WI-PARENT'}]});
 const accepted=item({work_item_id:'WI-PARENT',status:'ACCEPTED'}), ready=item({work_item_id:'WI-PARENT',status:'READY'});
 for(const parents of [[accepted,ready],[ready,accepted]]) assert.ok(wi.evaluateHardGates(child,graphWith([{id:'EXP-03',hard_gates:[]}]),[child,...parents]).blockers.includes('ambiguous_explicit_dependency:WI-PARENT'));
});
test('selection fails closed on missing or malformed ACTIVE lease and lock expiries',()=>{
 const x=item(), now=Date.parse('2026-01-01T00:30:00Z');
 for(const expiry of [undefined,'not-a-date']) {
  assert.equal(wi.selectNextWorkItem([x],{nowMs:now,dependencyGraph:readOnlyGraph,leasesByWorkItem:{[x.work_item_id]:{...lease,lease_expires_at_utc:expiry}}}),null);
  assert.equal(wi.selectNextWorkItem([x],{nowMs:now,dependencyGraph:readOnlyGraph,activeLocks:[{resource_key:'module:catalog',lease_expires_at_utc:expiry}]}),null);
 }
 assert.equal(wi.selectNextWorkItem([x],{nowMs:now,dependencyGraph:readOnlyGraph,leasesByWorkItem:{[x.work_item_id]:{...lease,lease_expires_at_utc:'2025-12-31T23:00:00Z'}}}).work_item_id,x.work_item_id);
 assert.equal(wi.selectNextWorkItem([x],{nowMs:now,dependencyGraph:readOnlyGraph,leasesByWorkItem:{[x.work_item_id]:{...lease,lease_expires_at_utc:'2026-01-01T01:00:00Z'}}}),null);
});
test('operation scope version and requested operations are a symmetric pair',()=>{
 const noVersion=item({requested_operations:['analysis']}); delete noVersion.operation_scope_version;
 assert.throws(()=>wi.validateWorkItem(noVersion),/must be supplied together/);
 assert.throws(()=>wi.validateWorkItem(item({operation_scope_version:'1.0'})),/must be supplied together/);
 assert.equal(wi.validateWorkItem(item({operation_scope_version:'1.0',requested_operations:['analysis']})),true);
});
test('Work Item refresh preserves accepted terminal status while deriving non-terminal status from progress',()=>{
 const complete={can_accept:true,verified_steps:8};
 assert.equal(wi.refreshedStatus('ACCEPTED',complete,true),'ACCEPTED');
 assert.equal(wi.refreshedStatus('REJECTED',complete,true),'REJECTED');
 assert.equal(wi.refreshedStatus('CANCELLED',complete,true),'CANCELLED');
 assert.equal(wi.refreshedStatus('CLAIMED',complete,true),'REVIEW_REQUIRED');
 assert.equal(wi.refreshedStatus('IN_PROGRESS',{can_accept:false,verified_steps:2},true),'IN_PROGRESS');
 assert.equal(wi.refreshedStatus('READY',{can_accept:false,verified_steps:0},true),'READY');
 assert.equal(wi.refreshedStatus('READY',complete,false),'BLOCKED');
});

test('legacy bootstrap Work Items receive only exact enumerated operation scopes',()=>{
 const x=item({work_item_id:'WI-PR16-SPEC-REPAIR-001',target_repository:'a4adelahmadian86-wq/farast-control-plane',write_policy:'WRITE_ALLOWED'});
 const allocator=item({work_item_id:'WI-GOAL-ALLOCATOR-001',target_repository:'a4adelahmadian86-wq/farast-control-plane',write_policy:'WRITE_ALLOWED'});
 const product=item({work_item_id:'WI-NON-IMPLEMENTATION-VERTICAL-SLICE-001',target_repository:'a4adelahmadian86-wq/non',write_policy:'WRITE_ALLOWED',owner_approval_ref:ownerIssueUrl});
 const readonlyAcceptance=item({work_item_id:'WI-READONLY-EVIDENCE-ACCEPTANCE-001',target_repository:'a4adelahmadian86-wq/farast-control-plane',write_policy:'WRITE_ALLOWED'});
 assert.deepEqual(wi.defaultRequestedOperations(x),['control_plane_write']);
 assert.deepEqual(wi.defaultRequestedOperations(allocator),['control_plane_write']);
 assert.deepEqual(wi.defaultRequestedOperations(product),['product_implementation']);
 assert.deepEqual(wi.defaultRequestedOperations(readonlyAcceptance),['control_plane_write']);
 assert.doesNotThrow(()=>wi.validateWorkItem(readonlyAcceptance));
 assert.equal(wi.isBranchlessControlPlaneWorkItem(x),true);
 assert.equal(wi.isBranchlessControlPlaneWorkItem(allocator),true);
 assert.equal(wi.isBranchlessControlPlaneWorkItem(item({...x,work_item_id:'WI-OTHER-METADATA-001'})),false);
 assert.throws(()=>wi.validateWorkItem(item({work_item_id:'WI-UNLISTED-LEGACY-WRITE-001',write_policy:'WRITE_ALLOWED'})),/require operation_scope_version/);
});
test('branchless control-plane acceptance requires evidence, no active lease and matching null-branch review',()=>{
 const x=item({work_item_id:'WI-PR16-SPEC-REPAIR-001',target_repository:'a4adelahmadian86-wq/farast-control-plane',write_policy:'WRITE_ALLOWED'});
 x.steps.forEach((step,i)=>{step.validation_status='PASS';step.evidence_refs=['https://example.test/s'+i];});
 x.acceptance_criteria.forEach((criterion,i)=>{criterion.validation_status='PASS';criterion.evidence_refs=['https://example.test/c'+i];});
 const review={event:'REVIEW',issue_number:58,target_repository:x.target_repository,branch:null};
 assert.equal(wi.evaluateBranchlessMetadataAcceptance(x,{issueNumber:58,hasActiveLease:false,hardGatesReady:true,reviewEvent:review}).ready,true);
 assert.ok(wi.evaluateBranchlessMetadataAcceptance(x,{issueNumber:58,hasActiveLease:true,hardGatesReady:true,reviewEvent:review}).blockers.includes('active_lease'));
 assert.ok(wi.evaluateBranchlessMetadataAcceptance(x,{issueNumber:58,hasActiveLease:false,hardGatesReady:true,reviewEvent:{...review,branch:'work/not-allowed'}}).blockers.includes('branchless_metadata_handoff_must_not_have_branch'));
});
test('durable coordinator inbox uses shared idempotent command and response-recovery helpers',()=>{
  const fs=require('node:fs'), path=require('node:path');
  const workflow=fs.readFileSync(path.join(__dirname,'../workflows/farast-coordinator.yml'),'utf8');
  const start=workflow.indexOf('for (const comment of coordinatorCore.pendingCommandComments(');
  const end=workflow.indexOf('const current = snapshot.state.locks.filter',start);
  assert.ok(start>=0 && end>start);
  const loop=workflow.slice(start,end);
  const handle=loop.indexOf('snapshot = await handleCommand(issue, comment, snapshot);');
  const refetch=loop.indexOf('issue = (await github.rest.issues.get');
  assert.ok(handle>=0 && handle<refetch);
  assert.match(workflow,/coordinatorCore\.pendingResponseOperations/);
  assert.match(workflow,/coordinatorCore\.responseMarker/);
  assert.doesNotMatch(loop,/processed_operations\?\.\[operationId\]/);
});

test('coordinator registry persistence verifies exact commit read-back and guards missing operation records',()=>{
 const fs=require('node:fs'), path=require('node:path');
 const workflow=fs.readFileSync(path.join(__dirname,'../workflows/farast-coordinator.yml'),'utf8');
 assert.match(workflow,/readBack\.refSha\s*===\s*commit\.data\.sha/);
 assert.match(workflow,/latest\?\.processed_operations\?\.\[id\]/);
 assert.match(workflow,/registry_readback_commit_mismatch/);
 assert.match(workflow,/DEPENDENCY_AUTO_UNBLOCKED/);
 assert.match(workflow,/isBranchlessControlPlaneWorkItem/);
 assert.match(workflow,/findDuplicateWorkItemIdIssues/);
 assert.match(workflow,/duplicateWorkItemIds\.length/);
 assert.match(workflow,/findDuplicateWorkItemIdIssues/);
 assert.match(workflow,/state:\s*'all'/);
 assert.match(workflow,/requireChildrenAccepted:\s*true/);
 assert.match(workflow,/allWorkItemsFor/);
 assert.match(workflow,/findDuplicateWorkItemIdIssues/);
 assert.match(workflow,/state:\s*'all'/);
 assert.match(workflow,/requireChildrenAccepted:\s*true/);
 assert.match(workflow,/allWorkItemsFor/);
});

test('multi-EXP Work Items evaluate hard gates on every declared parent EXP',()=>{
 const target=item({work_item_id:'WI-CROSS-EXP-001',parent_exp_ids:['EXP-03','EXP-22']});
 const graph=graphWith([{id:'EXP-03',hard_gates:[]},{id:'EXP-22',hard_gates:['EXP-21']},{id:'EXP-21',hard_gates:[]}]);
 assert.ok(wi.evaluateHardGates(target,graph,[target]).blockers.includes('unresolved_hard_gate:EXP-21'));
 const dependency=item({work_item_id:'WI-EXP21-CHANGE-PACKAGE-001',parent_exp_ids:['EXP-21'],status:'READY'});
 assert.ok(wi.evaluateHardGates(target,graph,[target,dependency]).blockers.includes('hard_gate_not_accepted:EXP-21:READY'));
 dependency.status='ACCEPTED';
 assert.equal(wi.evaluateHardGates(target,graph,[target,dependency]).ready,true);
});
test('unrelated missing operation gate does not block READ_ONLY analysis',()=>{
 const analysis=item({work_item_id:'WI-EXP03-ANALYSIS-001',parent_exp_ids:['EXP-03']});
 const graph=graphWith([{id:'EXP-03',hard_gates:[]}]);
 graph.operation_gates=graph.operation_gates.filter(x=>x.id!=='production_release');
 assert.equal(wi.evaluateHardGates(analysis,graph,[analysis]).ready,true);
 const release=item({work_item_id:'WI-EXP26-RELEASE-001',parent_exp_ids:['EXP-26'],target_repository:'a4adelahmadian86-wq/non',write_policy:'WRITE_ALLOWED',owner_approval_ref:ownerIssueUrl,requested_operations:['product_implementation','production_release']});
 assert.ok(wi.evaluateHardGates(release,graph,[release]).blockers.includes('operation_gate_definition_missing:production_release'));
});
test('multi-EXP hard gate on secondary parent blocks missing, unaccepted and ambiguous dependencies',()=>{
 const target=item({work_item_id:'WI-CROSS-EXP-002',parent_exp_ids:['EXP-03','EXP-22']});
 const graph=graphWith([{id:'EXP-03',hard_gates:[]},{id:'EXP-22',hard_gates:['EXP-21']},{id:'EXP-21',hard_gates:[]}]);
 const accepted=item({work_item_id:'WI-EXP21-PARENT-001',parent_exp_ids:['EXP-21'],status:'ACCEPTED'});
 const other=item({work_item_id:'WI-EXP21-PARENT-002',parent_exp_ids:['EXP-21'],status:'ACCEPTED'});
 assert.ok(wi.evaluateHardGates(target,graph,[target]).blockers.includes('unresolved_hard_gate:EXP-21'));
 assert.ok(wi.evaluateHardGates(target,graph,[target,{...accepted,status:'READY'}]).blockers.includes('hard_gate_not_accepted:EXP-21:READY'));
 assert.ok(wi.evaluateHardGates(target,graph,[target,accepted,other]).blockers.includes('ambiguous_hard_gate:EXP-21'));
 assert.equal(wi.evaluateHardGates(target,graph,[target,accepted]).ready,true);
});
test('exact legacy WRITE_ALLOWED bootstrap items remain compatible; unlisted legacy writes fail closed',()=>{
 const ids=['WI-GOAL-ALLOCATOR-001','WI-NON-IMPLEMENTATION-VERTICAL-SLICE-001','WI-NON-WRITE-POLICY-COORDINATOR-001','WI-PR16-SPEC-REPAIR-001','WI-OPERATION-GATE-MODEL-001','WI-READONLY-EVIDENCE-ACCEPTANCE-001'];
 for(const id of ids) {
  const product=id==='WI-NON-IMPLEMENTATION-VERTICAL-SLICE-001';
  const x=item({work_item_id:id,target_repository:product?'a4adelahmadian86-wq/non':'a4adelahmadian86-wq/farast-control-plane',write_policy:'WRITE_ALLOWED',...(product?{owner_approval_ref:ownerIssueUrl}:{})});
  assert.doesNotThrow(()=>wi.validateWorkItem(x),id);
 }
 assert.throws(()=>wi.validateWorkItem(item({work_item_id:'WI-UNLISTED-WRITE-001',target_repository:'a4adelahmadian86-wq/farast-control-plane',write_policy:'WRITE_ALLOWED'})),/require operation_scope_version/);
});

test('accepted READ_ONLY acceptance Work Item remains a valid legacy control-plane dependency',()=>{
 const accepted=item({work_item_id:'WI-READONLY-EVIDENCE-ACCEPTANCE-001',target_repository:'a4adelahmadian86-wq/farast-control-plane',write_policy:'WRITE_ALLOWED',status:'ACCEPTED'});
 const dependent=item({work_item_id:'WI-OPERATION-GATE-MODEL-001',target_repository:'a4adelahmadian86-wq/farast-control-plane',write_policy:'WRITE_ALLOWED',dependencies:[{work_item_id:accepted.work_item_id}]});
 const graph=require('../../01_STRATEGY/DEPENDENCY_GRAPH.json');
 assert.equal(wi.validateWorkItem(accepted),true);
 assert.deepEqual(wi.defaultRequestedOperations(accepted),['control_plane_write']);
 assert.equal(wi.evaluateHardGates(dependent,graph,[accepted,dependent]).ready,true);
});

test('secondary EXP tags on a cross-cutting Work Item do not satisfy another EXP hard gate',()=>{
 const target=item({work_item_id:'WI-CROSS-EXP-CHILD-001',parent_exp_ids:['EXP-03']});
 const graph=graphWith([{id:'EXP-03',hard_gates:['EXP-22']},{id:'EXP-22',hard_gates:[]}]);
 const secondaryOnly=item({work_item_id:'WI-CROSS-EXP-PARENT-001',parent_exp_ids:['EXP-01','EXP-22'],status:'ACCEPTED'});
 assert.ok(wi.evaluateHardGates(target,graph,[target,secondaryOnly]).blockers.includes('unresolved_hard_gate:EXP-22'));
 const canonical=item({work_item_id:'WI-EXP22-CANONICAL-001',parent_exp_ids:['EXP-22'],status:'ACCEPTED'});
 assert.equal(wi.evaluateHardGates(target,graph,[target,secondaryOnly,canonical]).ready,true);
});
test('canonical EXP completion waits for every child Work Item and nested descendant',()=>{
 const target=item({work_item_id:'WI-EXP03-DEPENDENT-001',parent_exp_ids:['EXP-03']});
 const graph=graphWith([{id:'EXP-03',hard_gates:['EXP-22']},{id:'EXP-22',hard_gates:[]}]);
 const canonical=item({work_item_id:'WI-EXP22-CANONICAL-001',parent_exp_ids:['EXP-22'],status:'ACCEPTED'});
 const child=item({work_item_id:'WI-EXP22-CHILD-001',parent_exp_ids:['EXP-22'],parent_work_item_id:canonical.work_item_id,status:'ACCEPTED'});
 const grandchild=item({work_item_id:'WI-EXP22-GRANDCHILD-001',parent_exp_ids:['EXP-22'],parent_work_item_id:child.work_item_id,status:'IN_PROGRESS'});
 const blocked=wi.evaluateHardGates(target,graph,[target,canonical,child,grandchild]);
 assert.ok(blocked.blockers.includes('hard_gate_child_work_item_not_accepted:WI-EXP22-GRANDCHILD-001:IN_PROGRESS'));
 grandchild.status='ACCEPTED';
 assert.equal(wi.evaluateHardGates(target,graph,[target,canonical,child,grandchild]).ready,true);
});
test('a parent Work Item cannot be accepted while any child remains unaccepted',()=>{
 const parent=item({work_item_id:'WI-EXP22-CANONICAL-001',parent_exp_ids:['EXP-22'],status:'REVIEW_REQUIRED'});
 const child=item({work_item_id:'WI-EXP22-CHILD-001',parent_exp_ids:['EXP-22'],parent_work_item_id:parent.work_item_id,status:'READY'});
 const graph=graphWith([{id:'EXP-22',hard_gates:[]}]);
 const blocked=wi.evaluateHardGates(parent,graph,[parent,child],{requireChildrenAccepted:true});
 assert.ok(blocked.blockers.includes('child_work_item_not_accepted:WI-EXP22-CHILD-001:READY'));
 child.status='ACCEPTED';
 assert.equal(wi.evaluateHardGates(parent,graph,[parent,child],{requireChildrenAccepted:true}).ready,true);
});
test('a Work Item cannot satisfy its own EXP hard gate through a secondary parent',()=>{
 const target=item({work_item_id:'WI-CROSS-EXP-SELF-001',parent_exp_ids:['EXP-03','EXP-22'],status:'ACCEPTED'});
 const graph=graphWith([{id:'EXP-03',hard_gates:['EXP-22']},{id:'EXP-22',hard_gates:[]}]);
 assert.ok(wi.evaluateHardGates(target,graph,[target]).blockers.includes('unresolved_hard_gate:EXP-22'));
});
test('multi-parent Work Items require every declared EXP node to exist in the graph',()=>{
 const target=item({work_item_id:'WI-CROSS-EXP-MISSING-NODE-001',parent_exp_ids:['EXP-03','EXP-22']});
 const graph=graphWith([{id:'EXP-03',hard_gates:[]}]);
 assert.ok(wi.evaluateHardGates(target,graph,[target]).blockers.includes('missing_or_invalid_graph_node:EXP-22'));
});
test('operation scope rejects unsupported version and one-sided field declarations',()=>{
 const unsupported=item({operation_scope_version:'2.0',requested_operations:['analysis']});
 assert.throws(()=>wi.validateWorkItem(unsupported),/unsupported operation_scope_version/);
 const missingVersion=item({requested_operations:['analysis']});
 delete missingVersion.operation_scope_version;
 assert.throws(()=>wi.validateWorkItem(missingVersion),/must be supplied together/);
 const missingOperations=item({operation_scope_version:'1.0'});
 assert.throws(()=>wi.validateWorkItem(missingOperations),/must be supplied together/);
});
test('versioned prompt-scope Work Item has no legacy implicit operation fallback',()=>{
 const unversioned=item({work_item_id:'WI-PROMPT-OPERATION-SCOPE-001',target_repository:'a4adelahmadian86-wq/farast-control-plane',write_policy:'WRITE_ALLOWED'});
 assert.deepEqual(wi.defaultRequestedOperations(unversioned),[]);
 assert.throws(()=>wi.validateWorkItem(unversioned),/require operation_scope_version/);
 const versioned=item({work_item_id:'WI-PROMPT-OPERATION-SCOPE-001',target_repository:'a4adelahmadian86-wq/farast-control-plane',write_policy:'WRITE_ALLOWED',requested_operations:['control_plane_write']});
 assert.deepEqual(wi.defaultRequestedOperations(versioned),['control_plane_write']);
 assert.doesNotThrow(()=>wi.validateWorkItem(versioned));
});
test('generic repository_write gate supports an explicitly scoped non-product repository',()=>{
 const x=item({work_item_id:'WI-OTHER-REPO-WRITE-001',target_repository:'owner/other-repo',write_policy:'WRITE_ALLOWED',owner_approval_ref:'https://github.com/owner/control-plane/issues/1',requested_operations:['repository_write']});
 const graph=require('../../01_STRATEGY/DEPENDENCY_GRAPH.json');
 const result=wi.evaluateHardGates(x,graph,[x]);
 assert.equal(result.ready,true);
 assert.deepEqual(result.blockers,[]);
});

test('EXP-02 backup recovery does not block the control-plane operation-gate task itself',()=>{
 const graph=require('../../01_STRATEGY/DEPENDENCY_GRAPH.json');
 const gate=graph.operation_gates.find(x=>x.id==='control_plane_write');
 assert.ok(gate);
 assert.ok(!gate.required_work_item_ids.includes('WI-EXP02-BACKUP-RECOVERY-001'));
});
test('high-risk EXP-02 operation gates reference the canonical backup-recovery Work Item',()=>{
 const graph=require('../../01_STRATEGY/DEPENDENCY_GRAPH.json');
 for (const id of ['destructive_data_change','database_migration','production_release']) {
  const gate=graph.operation_gates.find(x=>x.id===id);
  assert.ok(gate.required_work_item_ids.includes('WI-EXP02-BACKUP-RECOVERY-001'),id);
  assert.ok(!gate.required_work_item_ids.includes('WI-EXP02-BACKUP-RESTORE-001'),id);
 }
});
test('legacy READ_ONLY and proposal-only Work Items remain schema-compatible without operation scope',()=>{
 const schema=require('../../04_COORDINATION/WORK_ITEM_SCHEMA.json');
 const legacyIds=["WI-GOAL-ALLOCATOR-001","WI-NON-IMPLEMENTATION-VERTICAL-SLICE-001","WI-NON-WRITE-POLICY-COORDINATOR-001","WI-PR16-SPEC-REPAIR-001","WI-OPERATION-GATE-MODEL-001","WI-CI-001","WI-READONLY-EVIDENCE-ACCEPTANCE-001"];
 const writeScopeRule=schema.allOf.find(rule=>rule.if?.properties?.write_policy?.const==='WRITE_ALLOWED' && rule.then?.required?.includes('operation_scope_version'));
 assert.ok(writeScopeRule);
 assert.equal(schema.required.includes('operation_scope_version'),false);
 assert.equal(schema.required.includes('requested_operations'),false);
 assert.deepEqual(writeScopeRule.if.not.properties.work_item_id.enum,legacyIds);
 assert.equal(wi.validateWorkItem(item()),true);
 assert.equal(wi.validateWorkItem(item({write_policy:'WRITE_REQUIRES_OWNER_APPROVAL',owner_approval_ref:'https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/52'})),true);
 assert.throws(()=>wi.validateWorkItem(item({write_policy:'WRITE_ALLOWED'})),/require operation_scope_version/);
 assert.throws(()=>wi.validateWorkItem(item({work_item_id:'WI-CI-001',target_repository:productRepository,write_policy:'WRITE_ALLOWED',owner_approval_ref:ownerIssueUrl})),/require operation_scope_version/);
});


test('known EXP-02 backup alias resolves Issue 14 to canonical Issue 66 without reversing the relationship', () => {
  const legacy = item({
    work_item_id:'WI-EXP02-BACKUP-RESTORE-001',
    title:'EXP-02 Backup integrity and restore readiness',
    parent_goal_ids:['G-01'],
    parent_exp_ids:['EXP-02'],
    resource_keys:['analysis:exp-02']
  });
  const canonical = item({
    work_item_id:'WI-EXP02-BACKUP-RECOVERY-001',
    title:'EXP-02 backup, data durability and disaster-recovery assessment',
    parent_goal_ids:['G-01','G-07'],
    parent_exp_ids:['EXP-02'],
    resource_keys:['analysis:exp-02-backup-recovery'],
    status:'BLOCKED'
  });
  assert.deepEqual(wi.findSemanticDuplicateWorkItems(legacy, [{ ...canonical, issue_number:66 }]), [{
    issue_number:66,
    work_item_id:'WI-EXP02-BACKUP-RECOVERY-001',
    canonical_work_item_id:'WI-EXP02-BACKUP-RECOVERY-001',
    reason:'explicit_canonical_alias',
    status:'SUPERSEDED',
    superseded:true
  }]);
  assert.deepEqual(wi.findDuplicateWorkItemIdIssues(14, legacy, [{ ...canonical, number:66 }], []), [66]);
  assert.deepEqual(wi.findDuplicateWorkItemIdIssues(66, canonical, [{ ...legacy, number:14 }], []), []);
});

test('Work Item-local D1-D4 deliverable IDs do not create false semantic duplicates', () => {
  const migration = item({
    work_item_id:'WI-LEGACY-WRITE-SCOPE-MIGRATION-001',
    title:'Migrate legacy write-enabled Work Items to versioned operation scope',
    parent_goal_ids:['G-00','G-08'],
    parent_exp_ids:['EXP-22','EXP-23'],
    resource_keys:['module:legacy-write-scope-migration'],
    deliverables:[
      {deliverable_id:'D1',description:'Inventory legacy write policies and authorization references'},
      {deliverable_id:'D2',description:'Map each legacy Work Item to explicit operation scope'},
      {deliverable_id:'D3',description:'Validate policy compatibility and migration safety'},
      {deliverable_id:'D4',description:'Publish migration evidence and recovery handoff'}
    ]
  });
  const reader = item({
    work_item_id:'WI-NON-IMPLEMENTATION-VERTICAL-SLICE-001',
    title:'Persist private reader previews and verify PDF sample boundaries',
    parent_goal_ids:['G-00','G-04','G-05','G-08'],
    parent_exp_ids:['EXP-22','EXP-23'],
    resource_keys:['repo:non:controlled-implementation'],
    deliverables:[
      {deliverable_id:'D1',description:'Select a bounded reader behavior improvement with rollback evidence'},
      {deliverable_id:'D2',description:'Implement private PDF preview persistence in the application'},
      {deliverable_id:'D3',description:'Add reader regression coverage and run exact-head CI'},
      {deliverable_id:'D4',description:'Publish a review-ready product pull request'}
    ],
    created_at_utc:'2026-01-02T00:00:00Z'
  });
  assert.deepEqual(wi.findSemanticDuplicateWorkItems(migration, [{...reader,issue_number:51}]), []);
  assert.deepEqual(wi.findDuplicateWorkItemIdIssues(68, migration, [{...reader,number:51}], []), []);
});

test('shared deliverable descriptions corroborate material overlap but never trigger it alone', () => {
  const unrelated = item({
    work_item_id:'WI-UNRELATED-DELIVERABLE-001',
    title:'Authentication log retention review',
    parent_goal_ids:['G-01'],
    parent_exp_ids:['EXP-02'],
    resource_keys:['analysis:auth-retention'],
    deliverables:[{deliverable_id:'D1',description:'A verified backup integrity evidence report'}],
    created_at_utc:'2026-01-01T00:00:00Z'
  });
  const different = item({
    work_item_id:'WI-DIFFERENT-DELIVERABLE-002',
    title:'Customer notification preference audit',
    parent_goal_ids:['G-01'],
    parent_exp_ids:['EXP-02'],
    resource_keys:['analysis:notification-preferences'],
    deliverables:[{deliverable_id:'D4',description:'A verified backup integrity evidence report'}],
    created_at_utc:'2026-01-02T00:00:00Z'
  });
  assert.deepEqual(wi.findSemanticDuplicateWorkItems(different, [{...unrelated,issue_number:301}]), []);

  const material = item({
    work_item_id:'WI-BACKUP-MATERIAL-DUPLICATE-003',
    title:'Database backup integrity audit and evidence',
    parent_goal_ids:['G-01'],
    parent_exp_ids:['EXP-02'],
    resource_keys:['analysis:separate-backup-resource'],
    deliverables:[{deliverable_id:'D1',description:'A verified backup integrity evidence report'}],
    created_at_utc:'2026-01-03T00:00:00Z'
  });
  const original = item({
    work_item_id:'WI-BACKUP-ORIGINAL-004',
    title:'Database backup integrity verification and evidence',
    parent_goal_ids:['G-01'],
    parent_exp_ids:['EXP-02'],
    resource_keys:['analysis:original-backup-resource'],
    deliverables:[{deliverable_id:'D4',description:'A verified backup integrity evidence report'}],
    created_at_utc:'2026-01-01T00:00:00Z'
  });
  const duplicates = wi.findSemanticDuplicateWorkItems(material, [{...original,issue_number:302}]);
  assert.equal(duplicates.length,1);
  assert.equal(duplicates[0].canonical_work_item_id,original.work_item_id);
});

test('semantic overlap requires shared parent scope plus material resource/title or deliverable overlap', () => {
  const canonical = item({
    work_item_id:'WI-BACKUP-CANONICAL-001',
    title:'Database backup integrity verification',
    parent_goal_ids:['G-01'],
    parent_exp_ids:['EXP-02'],
    resource_keys:['analysis:backup-integrity'],
    created_at_utc:'2026-01-01T00:00:00Z'
  });
  const duplicate = item({
    work_item_id:'WI-BACKUP-DUPLICATE-001',
    title:'Database backup integrity audit',
    parent_goal_ids:['G-01'],
    parent_exp_ids:['EXP-02'],
    resource_keys:['analysis:backup-integrity'],
    created_at_utc:'2026-01-02T00:00:00Z'
  });
  const unrelated = item({
    work_item_id:'WI-RESTORE-UNRELATED-001',
    title:'Authentication log retention review',
    parent_goal_ids:['G-01'],
    parent_exp_ids:['EXP-02'],
    resource_keys:['analysis:auth-retention'],
    created_at_utc:'2026-01-03T00:00:00Z'
  });
  assert.equal(wi.findSemanticDuplicateWorkItems(duplicate, [{ ...canonical, issue_number:201 }])[0].canonical_work_item_id, canonical.work_item_id);
  assert.deepEqual(wi.findSemanticDuplicateWorkItems(unrelated, [{ ...canonical, issue_number:201 }]), []);
});

test('an accepted semantic duplicate is always preferred as the canonical Work Item', () => {
  const candidate = item({
    work_item_id:'WI-CANDIDATE-001',
    title:'Database backup integrity verification',
    parent_goal_ids:['G-01'],
    parent_exp_ids:['EXP-02'],
    resource_keys:['analysis:backup-integrity'],
    created_at_utc:'2025-01-01T00:00:00Z'
  });
  const accepted = item({
    work_item_id:'WI-ACCEPTED-001',
    title:'Database backup integrity audit',
    parent_goal_ids:['G-01'],
    parent_exp_ids:['EXP-02'],
    resource_keys:['analysis:backup-integrity'],
    status:'ACCEPTED',
    created_at_utc:'2026-01-01T00:00:00Z'
  });
  const duplicates = wi.findSemanticDuplicateWorkItems(candidate, [{ ...accepted, issue_number:202 }]);
  assert.equal(duplicates[0].canonical_work_item_id, accepted.work_item_id);
});


test('Work Item-local D1-D4 labels do not make independent EXP tasks semantic duplicates', () => {
  const migration = item({
    issue_number:68,
    work_item_id:'WI-LEGACY-WRITE-SCOPE-MIGRATION-001',
    title:'Migrate all active legacy WRITE_ALLOWED Work Items to explicit versioned operation scope',
    parent_goal_ids:['G-09'],
    parent_exp_ids:['EXP-01','EXP-22','EXP-23'],
    resource_keys:['module:legacy-operation-scope-migration','issue:11','issue:43','issue:44','issue:47','issue:50','issue:51','issue:52','issue:58'],
    deliverables:[
      {deliverable_id:'D1',description:'Complete legacy WRITE_ALLOWED inventory and operation mapping'},
      {deliverable_id:'D2',description:'Minimal versioned operation-scope migration'},
      {deliverable_id:'D3',description:'Allocator and registry synchronization proof'},
      {deliverable_id:'D4',description:'Regression and CI report'}
    ]
  });
  const unrelated = [
    item({
      issue_number:13,
      work_item_id:'WI-EXP01-BASELINE-001',
      title:'EXP-01 Baseline and environment inventory',
      parent_goal_ids:['G-01'],
      parent_exp_ids:['EXP-01'],
      resource_keys:['analysis:exp-01'],
      deliverables:[
        {deliverable_id:'D1',description:'Baseline environment inventory'},
        {deliverable_id:'D2',description:'Source and capability map'},
        {deliverable_id:'D3',description:'Current-state evidence report'},
        {deliverable_id:'D4',description:'Baseline risks and assumptions'}
      ]
    }),
    item({
      issue_number:34,
      work_item_id:'WI-EXP22-CONTROLLED-IMPLEMENTATION-001',
      title:'EXP-22 Controlled implementation readiness and proposal',
      parent_goal_ids:['G-08'],
      parent_exp_ids:['EXP-22'],
      resource_keys:['analysis:exp-22-readiness'],
      deliverables:[
        {deliverable_id:'D1',description:'Implementation readiness matrix'},
        {deliverable_id:'D2',description:'Controlled proposal'},
        {deliverable_id:'D3',description:'Risk and rollback plan'}
      ]
    }),
    item({
      issue_number:59,
      work_item_id:'WI-PROMPT-ORDER-DEPENDENCY-REPAIR-001',
      title:'Implement approved prompt priority order and repair dependency refresh semantics',
      parent_goal_ids:['G-09'],
      parent_exp_ids:['EXP-01'],
      resource_keys:['module:prompt-priority'],
      deliverables:[
        {deliverable_id:'D1',description:'Prompt priority order'},
        {deliverable_id:'D2',description:'Dependency graph repair'},
        {deliverable_id:'D3',description:'Refresh behavior tests'},
        {deliverable_id:'D4',description:'Execution order report'}
      ]
    })
  ];
  assert.deepEqual(wi.findSemanticDuplicateWorkItems(migration, unrelated), []);
  assert.deepEqual(wi.findDuplicateWorkItemIdIssues(68, migration, unrelated, []), []);
});

test('meaningful deliverable descriptions can corroborate a duplicate even when local IDs differ', () => {
  const canonical = item({
    issue_number:201,
    work_item_id:'WI-BACKUP-MATRIX-CANONICAL-001',
    title:'Prepare database backup recovery evidence matrix',
    parent_goal_ids:['G-01'],
    parent_exp_ids:['EXP-02'],
    resource_keys:['module:backup-recovery'],
    deliverables:[{deliverable_id:'D1',description:'Database backup recovery evidence matrix'}]
  });
  const duplicate = item({
    issue_number:202,
    work_item_id:'WI-BACKUP-MATRIX-DUPLICATE-001',
    title:'Audit database backup recovery evidence matrix',
    parent_goal_ids:['G-01'],
    parent_exp_ids:['EXP-02'],
    resource_keys:['module:backup-recovery'],
    deliverables:[{deliverable_id:'BACKUP_MATRIX',description:'Database backup recovery evidence matrix'}]
  });
  const matches = wi.findSemanticDuplicateWorkItems(duplicate, [canonical]);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].canonical_work_item_id, canonical.work_item_id);
});


test('Work Item-local D1-D4 deliverable IDs do not create cross-Work-Item semantic duplicates', () => {
  const migration = item({
    work_item_id:'WI-LEGACY-WRITE-SCOPE-MIGRATION-001',
    title:'Migrate legacy write-enabled Work Items to versioned operation scope',
    parent_goal_ids:['G-09'],
    parent_exp_ids:['EXP-01'],
    resource_keys:['module:legacy-operation-scope-migration'],
    deliverables:[
      {deliverable_id:'D1',description:'Complete before and after migration inventory'},
      {deliverable_id:'D2',description:'Minimal versioned operation scope updates'},
      {deliverable_id:'D3',description:'Allocator bootstrap and registry synchronization proof'},
      {deliverable_id:'D4',description:'Regression and policy compatibility report'}
    ]
  });
  const baseline = item({
    work_item_id:'WI-EXP01-BASELINE-001',
    title:'Establish verified product and control-plane baseline inventory',
    parent_goal_ids:['G-09'],
    parent_exp_ids:['EXP-01'],
    resource_keys:['analysis:exp-01'],
    deliverables:[
      {deliverable_id:'D1',description:'Repository and branch snapshot'},
      {deliverable_id:'D2',description:'Runtime and dependency inventory'},
      {deliverable_id:'D3',description:'Environment and release evidence matrix'},
      {deliverable_id:'D4',description:'Baseline findings and unknowns report'}
    ]
  });
  assert.deepEqual(
    wi.findSemanticDuplicateWorkItems(migration, [{...baseline,issue_number:13}]),
    []
  );
  assert.deepEqual(
    wi.findDuplicateWorkItemIdIssues(68,migration,[{...baseline,number:13}],[]),
    []
  );
});

test('different Work Items may reuse generic local deliverable labels without semantic collision', () => {
  const left = item({
    work_item_id:'WI-COMMERCE-CATALOG-001',
    title:'Design product catalog and purchase flows',
    parent_goal_ids:['G-09'],
    parent_exp_ids:['EXP-08'],
    resource_keys:['module:commerce-catalog'],
    deliverables:[
      {deliverable_id:'D1',description:'Catalog entity and attribute model'},
      {deliverable_id:'D2',description:'Purchase flow requirements'}
    ]
  });
  const right = item({
    work_item_id:'WI-AI-TYPING-001',
    title:'Specify AI-assisted typing service workflows',
    parent_goal_ids:['G-09'],
    parent_exp_ids:['EXP-08'],
    resource_keys:['module:ai-typing'],
    deliverables:[
      {deliverable_id:'D1',description:'AI typing interaction scenarios'},
      {deliverable_id:'D2',description:'Service quality and safety requirements'}
    ]
  });
  assert.deepEqual(wi.findSemanticDuplicateWorkItems(left,[{...right,issue_number:208}]),[]);
});


test('parent_cp_ids is distinct optional metadata and legacy Work Items remain valid', () => {
  const legacy = item();
  assert.equal(wi.validateWorkItem(legacy), true);
  const cpLinked = item({ parent_cp_ids:['CP-02','CP-03'] });
  assert.equal(wi.validateWorkItem(cpLinked), true);
  assert.throws(() => wi.validateWorkItem(item({ parent_cp_ids:'CP-02' })), /parent_cp_ids/);
  assert.throws(() => wi.validateWorkItem(item({ parent_cp_ids:['CP-02','CP-02'] })), /parent_cp_ids must be unique/);
  assert.throws(() => wi.validateWorkItem(item({ parent_cp_ids:['bad cp id'] })), /invalid parent_cp_ids/);
});

test('allocation_provenance validates the canonical allocator and exact field types', () => {
  const provenance = {
    allocator_work_item_id:'WI-GOAL-ALLOCATOR-001',
    allocator_issue_number:11,
    actor:'owner',
    chat_id:'allocator-chat',
    run_id:'allocator-run',
    fencing_token:77,
    branch:null,
    allocated_at_utc:'2026-11-18T06:05:00.000Z'
  };
  assert.equal(wi.validateWorkItem(item({ allocation_provenance:provenance })), true);
  assert.throws(() => wi.validateWorkItem(item({
    allocation_provenance:{ ...provenance, fencing_token:0 }
  })), /invalid allocation_provenance fencing_token/);
  assert.throws(() => wi.validateWorkItem(item({
    allocation_provenance:{ ...provenance, allocator_issue_number:12 }
  })), /invalid allocation_provenance allocator_issue_number/);
  assert.throws(() => wi.validateWorkItem(item({
    allocation_provenance:{ ...provenance, actor:'bad actor' }
  })), /invalid allocation_provenance actor/);
  assert.throws(() => wi.validateWorkItem(item({
    allocation_provenance:{ ...provenance, allocated_at_utc:'not-a-date' }
  })), /allocated_at_utc must be an ISO timestamp/);
  assert.throws(() => wi.validateWorkItem(item({
    allocation_provenance:{ ...provenance, extra:'not-allowed' }
  })), /invalid allocation_provenance fields/);
});
