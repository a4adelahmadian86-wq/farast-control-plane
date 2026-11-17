'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const wi = require('./work-item-core');

function item(overrides = {}) {
  return {
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
}
const operationIds=['control_plane_write','control_plane_merge','control_plane_authorization_change','repository_write','product_implementation','destructive_data_change','database_migration','authorization_change','security_sensitive_change','audit_log_change','architecture_implementation','hosting_deployment','legal_policy_change','merge','acceptance','security_acceptance','production_release'];
function operationGates(overrides={}) {
 return operationIds.map(id=>({id,source_gate_ids:['test-source'],required_work_item_ids:[],owner_authorization_required:false,evidence_requirements:['test evidence'],...(overrides[id]||{})}));
}
function graphWith(nodes,overrides={}) { return {nodes,operation_gates:operationGates(overrides)}; }

const lease={status:'ACTIVE',actor:'alice',chat_id:'chat-a',run_id:'run-a',fencing_token:7,lease_expires_at_utc:'2026-01-01T01:00:00Z'};
const input=(step_id, nowMs=Date.parse('2026-01-01T00:30:00Z'))=>({lease,actor:'alice',chat_id:'chat-a',run_id:'run-a',fencing_token:7,step_id,validation_status:'PASS',evidence_refs:['https://github.com/owner/repo/commit/abc'],nowMs});

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
test('dependencies block selection until every parent is accepted',()=>{
 const parent=item({work_item_id:'WI-PARENT',status:'IN_PROGRESS'});
 const child=item({work_item_id:'WI-CHILD',dependencies:[{work_item_id:'WI-PARENT'}]});
 assert.equal(wi.selectNextWorkItem([parent,child],{nowMs:Date.parse('2026-01-01T00:00:00Z')}).work_item_id,'WI-PARENT');
 parent.status='ACCEPTED';
 assert.equal(wi.selectNextWorkItem([parent,child],{nowMs:Date.parse('2026-01-01T00:00:00Z')}).work_item_id,'WI-CHILD');
});
test('active lease and resource conflicts exclude a candidate',()=>{
 const x=item(); const now=Date.parse('2026-01-01T00:30:00Z');
 assert.equal(wi.selectNextWorkItem([x],{nowMs:now,leasesByWorkItem:{[x.work_item_id]:lease}}),null);
 assert.equal(wi.selectNextWorkItem([x],{nowMs:now,activeLocks:[{resource_key:'module:catalog',lease_expires_at_utc:'2026-01-01T01:00:00Z'}]}),null);
});
test('expired lease makes same stable work item resumable',()=>{
 const x=item({status:'IN_PROGRESS'}); const expired={...lease,lease_expires_at_utc:'2025-12-31T23:00:00Z'};
 assert.equal(wi.selectNextWorkItem([x],{nowMs:Date.parse('2026-01-01T00:00:00Z'),leasesByWorkItem:{[x.work_item_id]:expired}}).work_item_id,x.work_item_id);
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
 const chosen=wi.selectNextWorkItem([fresh,old],{nowMs:Date.parse('2026-01-04T00:00:00Z')});
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
 const x=item({target_repository:productRepository,write_policy:'WRITE_ALLOWED'});
 assert.throws(()=>wi.calculateProgress(x),/owner_approval_ref is required for NON WRITE_ALLOWED/);
 x.owner_approval_ref=ownerIssueUrl;
 assert.doesNotThrow(()=>wi.calculateProgress(x));
});

test('NON WRITE_ALLOWED is accepted only for an owner-authored self-referencing Issue with explicit approval text',()=>{
 const x=item({target_repository:productRepository,write_policy:'WRITE_ALLOWED',owner_approval_ref:ownerIssueUrl});
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
 const x=item({target_repository:'owner/repo',write_policy:'WRITE_ALLOWED'});
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
 const graph=graphWith([{id:'EXP-01',hard_gates:[],soft_inputs:['EXP-22']}]);
 const evaluated=wi.evaluateHardGates(baseline,graph,[baseline,implementation]);
 assert.equal(evaluated.ready,true);
 assert.deepEqual(evaluated.blockers,[]);
 assert.equal(wi.dependencyReady(baseline,new Map([[baseline.work_item_id,baseline],[implementation.work_item_id,implementation]]),graph),true);
});

test('unaccepted EXP hard gate blocks eligibility until the matching Work Item is ACCEPTED',()=>{
 const target=item({work_item_id:'WI-EXP06-TESTING-001',parent_exp_ids:['EXP-06']});
 const dependency=item({work_item_id:'WI-EXP22-IMPLEMENTATION-001',parent_exp_ids:['EXP-22'],status:'IN_PROGRESS'});
 const graph=graphWith([{id:'EXP-06',hard_gates:['EXP-22'],soft_inputs:[]}]);
 assert.equal(wi.evaluateHardGates(target,graph,[target,dependency]).ready,false);
 dependency.status='ACCEPTED';
 assert.equal(wi.evaluateHardGates(target,graph,[target,dependency]).ready,true);
});

test('non-EXP strings in hard_gates invalidate the graph while soft inputs never gate',()=>{
 const target=item({work_item_id:'WI-EXP01-BASELINE-001',parent_exp_ids:['EXP-01']});
 const unknown=graphWith([{id:'EXP-01',hard_gates:['implementation'],soft_inputs:[]}]);
 assert.equal(wi.evaluateHardGates(target,unknown,[target]).ready,false);
 const softOnly=graphWith([{id:'EXP-01',hard_gates:[],soft_inputs:['EXP-22','EXP-99']}]);
 assert.equal(wi.evaluateHardGates(target,softOnly,[target]).ready,true);
 assert.equal(wi.evaluateHardGates(target,graphWith([]),[target]).ready,false);
});

test('Work Item selection applies canonical EXP-only hard gates',()=>{
 const baseline=item({work_item_id:'WI-EXP01-BASELINE-001',parent_exp_ids:['EXP-01']});
 const later=item({work_item_id:'WI-EXP22-IMPLEMENTATION-001',parent_exp_ids:['EXP-22'],status:'READY'});
 const graph=graphWith([
  {id:'EXP-01',hard_gates:[],soft_inputs:['EXP-22']},
  {id:'EXP-22',hard_gates:['EXP-21'],soft_inputs:[]}
 ]);
 const selected=wi.selectNextWorkItem([baseline,later],{nowMs:Date.parse('2026-01-01T01:00:00Z'),dependencyGraph:graph});
 assert.equal(selected.work_item_id,baseline.work_item_id);
});

test('READ_ONLY analysis is not blocked by a later product implementation gate',()=>{
 const target=item({work_item_id:'WI-EXP22-READINESS-001',parent_exp_ids:['EXP-22'],target_repository:'a4adelahmadian86-wq/non'});
 const graph=graphWith([{id:'EXP-22',hard_gates:[]}],{
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
 const graph=graphWith([{id:'EXP-22',hard_gates:[]}],{
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
 assert.throws(()=>wi.validateWorkItem(item({operation_scope_version:'1.0'})),/requires requested_operations/);
});

test('multi-EXP merge gate matches any declared parent EXP and does not self-gate',()=>{
 const target=item({work_item_id:'WI-NON-IMPLEMENTATION-VERTICAL-SLICE-001',parent_exp_ids:['EXP-22','EXP-23'],target_repository:'a4adelahmadian86-wq/non',write_policy:'WRITE_ALLOWED',owner_approval_ref:'https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/51',requested_operations:['product_implementation']});
 const regression=item({work_item_id:'WI-EXP23-REGRESSION-001',parent_exp_ids:['EXP-23'],status:'ACCEPTED'});
 const graph=graphWith([{id:'EXP-22',hard_gates:[]}],{
  merge:{applies_to_exp_ids:['EXP-23'],applies_to_target_repositories:['a4adelahmadian86-wq/non'],required_work_item_ids:['WI-EXP23-REGRESSION-001'],owner_authorization_required:true}
 });
 assert.equal(wi.evaluateHardGates(target,graph,[target,regression],{requestedOperations:['merge']}).ready,true);
 const selfGate=graphWith([{id:'EXP-23',hard_gates:[]}],{
  merge:{applies_to_exp_ids:['EXP-23'],applies_to_target_repositories:['a4adelahmadian86-wq/non'],required_work_item_ids:[target.work_item_id],owner_authorization_required:true}
 });
 assert.ok(wi.evaluateHardGates(target,selfGate,[target],{requestedOperations:['merge']}).blockers.some(x=>x.startsWith('operation_prerequisite_self_reference:')));
});

test('control-plane PR merge uses its own scoped operation gate',()=>{
 const target=item({work_item_id:'WI-OPERATION-GATE-MODEL-001',parent_exp_ids:['EXP-01','EXP-22','EXP-23'],target_repository:'a4adelahmadian86-wq/farast-control-plane',write_policy:'WRITE_ALLOWED'});
 const graph=graphWith([{id:'EXP-01',hard_gates:[]}],{
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
  const graph={nodes:[{id:'EXP-22',hard_gates:[]}],operation_gates:gate};
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
 const graph=graphWith([{id:'EXP-22',hard_gates:[]}],gate);
 assert.equal(wi.evaluateHardGates(target,graph,[target],{requestedOperations:['merge']}).ready,true);
 const wrongTarget=item({...target,target_repository:'a4adelahmadian86-wq/farast-control-plane'});
 const wrong=wi.evaluateHardGates(wrongTarget,graph,[wrongTarget],{requestedOperations:['merge']});
 assert.ok(wrong.blockers.includes('operation_target_scope_mismatch:merge:a4adelahmadian86-wq/farast-control-plane'));
});

test('versioned operation scopes require requested_operations while legacy read-only items remain valid',()=>{
 const legacy=item();
 assert.equal(wi.validateWorkItem(legacy),true);
 assert.throws(()=>wi.validateWorkItem(item({operation_scope_version:'1.0'})),/versioned operation scope requires requested_operations/);
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
 const x=fullyVerified(item({write_policy:'WRITE_ALLOWED'}));
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
