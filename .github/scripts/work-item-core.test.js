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

test('product repository Work Items cannot declare write access without a new owner policy',()=>{
 const x=item({target_repository:'a4adelahmadian86-wq/non',write_policy:'WRITE_ALLOWED'});
 assert.throws(()=>wi.calculateProgress(x),/NON product repository is READ_ONLY/);
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
