'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { aggregateParentProgress } = require('./goal-progress-core');

const EVIDENCE = 'https://github.com/example/repo/commit/abc123';

function item(id, overrides = {}) {
  return {
    schema_version: '1.0',
    operation_scope_version: '1.0',
    requested_operations: ['analysis'],
    write_policy: 'READ_ONLY',
    priority_source: 'DEFAULT_POLICY',
    work_item_id: id,
    title: 'Work item ' + id,
    description: 'Evidence-backed test fixture',
    parent_goal_ids: ['G-09'],
    parent_exp_ids: ['EXP-01'],
    parent_cp_ids: ['CP-07'],
    status: 'READY',
    target_repository: 'owner/repo',
    resource_keys: ['module:test-fixture'],
    dependencies: [],
    priority: 50,
    created_at_utc: '2026-11-24T00:00:00.000Z',
    steps: [
      { step_id: 'S1', title: 'Inspect evidence', required: true, validation_status: 'PASS', evidence_refs: [EVIDENCE] }
    ],
    acceptance_criteria: [
      { criterion_id: 'AC1', title: 'Evidence is valid', required: true, validation_status: 'PASS', evidence_refs: [EVIDENCE] }
    ],
    ...overrides
  };
}

function coverage(items, overrides = {}) {
  return {
    issueInventoryComplete: true,
    registryInventoryComplete: true,
    expectedWorkItemIds: items.map(x => x.work_item_id),
    missingWorkItemIds: [],
    unregisteredIssueNumbers: [],
    unmappedWorkItemIds: [],
    issueSnapshotRef: 'issues-snapshot:2026-11-24T00:00:00Z',
    registrySnapshotRef: 'registry-snapshot:abc123',
    ...overrides
  };
}

function aggregate(items, overrides = {}) {
  return aggregateParentProgress({
    workItems: items,
    parentGoalId: 'G-09',
    parentCpId: 'CP-07',
    coverage: coverage(items),
    ...overrides
  });
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

test('equal-weight aggregation uses evidence-backed leaf metrics and protocol rounding', () => {
  const full = item('WI-TEST-FULL-001');
  const empty = item('WI-TEST-EMPTY-001', {
    steps: [{ step_id: 'S1', title: 'Inspect evidence', required: true }],
    acceptance_criteria: [{ criterion_id: 'AC1', title: 'Evidence is valid', required: true }]
  });
  const result = aggregate([empty, full]);
  assert.equal(result.coverage_status, 'COMPLETE');
  assert.deepEqual(result.progress, {
    execution_percentage: 50,
    acceptance_percentage: 50,
    overall_completion_percentage: 50
  });
  assert.equal(result.child_counts.included_leaves, 2);
  assert.deepEqual(result.included_work_item_ids, ['WI-TEST-EMPTY-001', 'WI-TEST-FULL-001']);
  assert.equal(result.weighting_version, 'EQUAL_LEAVES_V1');
});

test('explicit versioned positive parent weights are applied to all three metrics', () => {
  const halfExecution = item('WI-TEST-HALF-001', {
    steps: [
      { step_id: 'S1', title: 'One', validation_status: 'PASS', evidence_refs: [EVIDENCE] },
      { step_id: 'S2', title: 'Two' }
    ]
  });
  const full = item('WI-TEST-FULL-002');
  const result = aggregate([halfExecution, full], {
    parentWeighting: { version: 'G09_WEIGHTS_V1', weights: {
      'WI-TEST-HALF-001': 1,
      'WI-TEST-FULL-002': 3
    } }
  });
  assert.deepEqual(result.progress, {
    execution_percentage: 87.5,
    acceptance_percentage: 100,
    overall_completion_percentage: 87.5
  });
  assert.equal(result.weighting_version, 'G09_WEIGHTS_V1');
});

test('multi-parent child is included once in each matching parent query', () => {
  const shared = item('WI-TEST-SHARED-001', {
    parent_goal_ids: ['G-09', 'G-10', 'G-09'],
    parent_cp_ids: ['CP-07', 'CP-08']
  });
  const g09 = aggregate([shared]);
  const g10 = aggregateParentProgress({
    workItems: [shared], parentGoalId: 'G-10', parentCpId: 'CP-08', coverage: coverage([shared])
  });
  assert.equal(g09.child_counts.included_leaves, 1);
  assert.equal(g10.child_counts.included_leaves, 1);
  assert.deepEqual(g09.included_work_item_ids, ['WI-TEST-SHARED-001']);
  assert.deepEqual(g10.included_work_item_ids, ['WI-TEST-SHARED-001']);
});

test('blocked and incomplete leaves remain in the denominator and status counts', () => {
  const accepted = item('WI-TEST-ACCEPTED-001', { status: 'ACCEPTED' });
  const blocked = item('WI-TEST-BLOCKED-001', {
    status: 'BLOCKED',
    steps: [{ step_id: 'S1', title: 'Inspect evidence' }],
    acceptance_criteria: [{ criterion_id: 'AC1', title: 'Evidence is valid' }]
  });
  const result = aggregate([accepted, blocked]);
  assert.equal(result.child_counts.included_leaves, 2);
  assert.equal(result.child_counts.by_status.BLOCKED, 1);
  assert.equal(result.progress.execution_percentage, 50);
  assert.equal(result.progress.acceptance_percentage, 50);
});

test('approved cancelled leaf is excluded only with explicit reason and approval reference', () => {
  const accepted = item('WI-TEST-ACCEPTED-002');
  const cancelled = item('WI-TEST-CANCELLED-001', { status: 'CANCELLED' });
  const withoutApproval = aggregate([accepted, cancelled]);
  assert.equal(withoutApproval.child_counts.included_leaves, 2);
  assert.ok(withoutApproval.warnings.includes('unapproved_terminal_retained_in_denominator:WI-TEST-CANCELLED-001'));
  const withApproval = aggregate([accepted, cancelled], {
    approvedExclusions: [{
      workItemId: 'WI-TEST-CANCELLED-001', approved: true,
      reason: 'Owner-approved scope cancellation', approvalRef: 'https://github.com/owner/repo/issues/99'
    }]
  });
  assert.equal(withApproval.child_counts.included_leaves, 1);
  assert.equal(withApproval.child_counts.approved_exclusions, 1);
  assert.deepEqual(withApproval.excluded_work_items[0], {
    work_item_id: 'WI-TEST-CANCELLED-001', status: 'CANCELLED',
    reason: 'Owner-approved scope cancellation', approval_ref: 'https://github.com/owner/repo/issues/99'
  });
});

test('unapproved superseded legacy leaf stays in denominator; approved disposition excludes it', () => {
  const superseded = item('WI-TEST-SUPERSEDED-001', { status: 'SUPERSEDED' });
  const kept = aggregate([superseded]);
  assert.equal(kept.child_counts.included_leaves, 1);
  assert.ok(kept.warnings.includes('unapproved_terminal_retained_in_denominator:WI-TEST-SUPERSEDED-001'));
  const excluded = aggregate([superseded], {
    approvedExclusions: [{ workItemId: 'WI-TEST-SUPERSEDED-001', approved: true,
      reason: 'Superseded by canonical recovery item', approvalRef: 'https://github.com/owner/repo/issues/100' }]
  });
  assert.equal(excluded.child_counts.included_leaves, 0);
  assert.equal(excluded.progress.overall_completion_percentage, null);
  assert.ok(excluded.blockers.includes('no_leaf_work_items_for_parent'));
});

test('parent work item with scoped descendants is not double-counted as a leaf', () => {
  const parent = item('WI-TEST-PARENT-001', { status: 'IN_PROGRESS' });
  const child = item('WI-TEST-CHILD-001', { parent_work_item_id: parent.work_item_id });
  const result = aggregate([parent, child]);
  assert.equal(result.child_counts.in_scope_work_items, 2);
  assert.equal(result.child_counts.non_leaf_work_items, 1);
  assert.equal(result.child_counts.leaf_work_items, 1);
  assert.deepEqual(result.included_work_item_ids, ['WI-TEST-CHILD-001']);
});

test('incomplete Issue or registry inventory fails closed to N/A', () => {
  const only = item('WI-TEST-COVERAGE-001');
  const result = aggregate([only], { coverage: coverage([only], { issueInventoryComplete: false }) });
  assert.equal(result.coverage_status, 'INCOMPLETE');
  assert.deepEqual(result.progress, {
    execution_percentage: null, acceptance_percentage: null, overall_completion_percentage: null
  });
  assert.ok(result.blockers.includes('live_issue_inventory_incomplete'));
});

test('missing expected registry child and unregistered Issue prevent parent percentages', () => {
  const only = item('WI-TEST-COVERAGE-002');
  const result = aggregate([only], { coverage: coverage([only], {
    expectedWorkItemIds: ['WI-TEST-COVERAGE-002', 'WI-TEST-MISSING-001'],
    unregisteredIssueNumbers: [106]
  }) });
  assert.equal(result.progress.execution_percentage, null);
  assert.ok(result.blockers.some(x => x.includes('expected_work_items_missing:WI-TEST-MISSING-001')));
  assert.ok(result.blockers.some(x => x.includes('unregistered_issue_numbers:106')));
});

test('duplicate Work Item IDs fail closed rather than silently choosing a canonical record', () => {
  const first = item('WI-TEST-DUPLICATE-001');
  const second = item('WI-TEST-DUPLICATE-001', { status: 'ACCEPTED' });
  const result = aggregate([first, second]);
  assert.equal(result.progress.overall_completion_percentage, null);
  assert.ok(result.blockers.includes('duplicate_work_item_ids:WI-TEST-DUPLICATE-001'));
});

test('parent hierarchy cycles and missing parent references fail closed', () => {
  const a = item('WI-TEST-CYCLE-A', { parent_work_item_id: 'WI-TEST-CYCLE-B' });
  const b = item('WI-TEST-CYCLE-B', { parent_work_item_id: 'WI-TEST-CYCLE-A' });
  const cycle = aggregate([a, b]);
  assert.equal(cycle.progress.overall_completion_percentage, null);
  assert.ok(cycle.blockers.some(x => x.startsWith('parent_hierarchy_cycle:')));
  const orphan = item('WI-TEST-ORPHAN-001', { parent_work_item_id: 'WI-TEST-MISSING-PARENT' });
  const missing = aggregate([orphan]);
  assert.equal(missing.progress.overall_completion_percentage, null);
  assert.ok(missing.blockers.includes('missing_parent_work_item:WI-TEST-ORPHAN-001:WI-TEST-MISSING-PARENT'));
});

test('PASS without evidence contributes no verified progress', () => {
  const itemWithoutEvidence = item('WI-TEST-NO-EVIDENCE-001', {
    steps: [{ step_id: 'S1', title: 'Pass without evidence', validation_status: 'PASS', evidence_refs: [] }]
  });
  const result = aggregate([itemWithoutEvidence]);
  assert.equal(result.coverage_status, 'COMPLETE');
  assert.equal(result.progress.execution_percentage, 0);
  assert.equal(result.progress.acceptance_percentage, 100);
  assert.equal(result.progress.overall_completion_percentage, 0);
  assert.equal(result.required_step_counts.pass, 0);
  assert.equal(result.unverified_pass_counts.required_steps, 1);
});

test('FAIL, UNKNOWN, BLOCKED and NOT_RUN validation states are counted but never treated as PASS', () => {
  const mixed = item('WI-TEST-VALIDATION-STATES-001', {
    steps: [
      { step_id: 'S1', title: 'Pass', validation_status: 'PASS', evidence_refs: [EVIDENCE] },
      { step_id: 'S2', title: 'Fail', validation_status: 'FAIL', evidence_refs: [EVIDENCE] },
      { step_id: 'S3', title: 'Unknown', validation_status: 'UNKNOWN', evidence_refs: [EVIDENCE] },
      { step_id: 'S4', title: 'Blocked', validation_status: 'BLOCKED', evidence_refs: [EVIDENCE] },
      { step_id: 'S5', title: 'Not run', validation_status: 'NOT_RUN', evidence_refs: [] }
    ],
    acceptance_criteria: [
      { criterion_id: 'AC1', title: 'Pass', validation_status: 'PASS', evidence_refs: [EVIDENCE] },
      { criterion_id: 'AC2', title: 'Fail', validation_status: 'FAIL', evidence_refs: [EVIDENCE] },
      { criterion_id: 'AC3', title: 'Unknown', validation_status: 'UNKNOWN', evidence_refs: [EVIDENCE] },
      { criterion_id: 'AC4', title: 'Blocked', validation_status: 'BLOCKED', evidence_refs: [EVIDENCE] },
      { criterion_id: 'AC5', title: 'Not run', validation_status: 'NOT_RUN', evidence_refs: [] }
    ]
  });
  const result = aggregate([mixed]);
  assert.equal(result.progress.execution_percentage, 20);
  assert.equal(result.progress.acceptance_percentage, 20);
  assert.equal(result.progress.overall_completion_percentage, 20);
  assert.deepEqual(result.required_step_counts, { pass: 1, fail: 1, blocked: 1, unknown: 1, not_run: 1 });
  assert.deepEqual(result.acceptance_criteria_counts, { pass: 1, fail: 1, blocked: 1, unknown: 1, not_run: 1 });
});

test('commit counts, file counts and labels cannot influence parent percentages', () => {
  const baseline = item('WI-TEST-NO-FABRICATION-001');
  const decorated = item('WI-TEST-NO-FABRICATION-001', {
    commit_count: 99999,
    changed_file_count: 99999,
    labels: ['agent:done', 'priority:critical']
  });
  const baselineResult = aggregate([baseline]);
  const decoratedResult = aggregate([decorated]);
  assert.deepEqual(decoratedResult.progress, baselineResult.progress);
  assert.deepEqual(decoratedResult.included_work_item_ids, baselineResult.included_work_item_ids);
});

test('malformed leaf with no required acceptance criterion fails closed to N/A', () => {
  const noCriteria = item('WI-TEST-NO-CRITERIA-001', { acceptance_criteria: [] });
  const result = aggregate([noCriteria]);
  assert.equal(result.coverage_status, 'INCOMPLETE');
  assert.equal(result.progress.execution_percentage, null);
  assert.equal(result.progress.acceptance_percentage, null);
  assert.equal(result.progress.overall_completion_percentage, null);
  assert.ok(result.blockers.some(x => x.startsWith('invalid_work_item:WI-TEST-NO-CRITERIA-001:')));
});

test('G-09 child without explicit CP mapping makes CP-specific aggregate N/A', () => {
  const unclassified = item('WI-TEST-UNCLASSIFIED-CP-001', { parent_cp_ids: undefined });
  const mapped = item('WI-TEST-MAPPED-CP-001');
  const result = aggregate([unclassified, mapped]);
  assert.equal(result.progress.execution_percentage, null);
  assert.ok(result.blockers.includes('goal_children_missing_cp_mapping:WI-TEST-UNCLASSIFIED-CP-001'));
});

test('invalid, incomplete or extra parent weights fail closed', () => {
  const a = item('WI-TEST-WEIGHT-A');
  const b = item('WI-TEST-WEIGHT-B');
  const missingWeight = aggregate([a, b], { parentWeighting: { version: 'v1', weights: { [a.work_item_id]: 1 } } });
  assert.equal(missingWeight.progress.execution_percentage, null);
  assert.ok(missingWeight.blockers.includes('parent_weighting_must_cover_exactly_included_leaves'));
  const zeroWeight = aggregate([a], { parentWeighting: { version: 'v1', weights: { [a.work_item_id]: 0 } } });
  assert.equal(zeroWeight.progress.execution_percentage, null);
  assert.ok(zeroWeight.blockers.includes('invalid_parent_weight:' + a.work_item_id));
});

test('output is deterministic and input records are not mutated', () => {
  const a = item('WI-TEST-DETERMINISTIC-A');
  const b = item('WI-TEST-DETERMINISTIC-B', { status: 'BLOCKED' });
  const firstInput = deepFreeze([a, b]);
  const secondInput = deepFreeze([b, a]);
  const first = aggregate(firstInput);
  const second = aggregate(secondInput);
  assert.deepEqual(first, second);
  assert.equal(a.status, 'READY');
  assert.equal(b.status, 'BLOCKED');
});

test('goal and CP filters are independent and require explicit CP membership', () => {
  const goalOnly = item('WI-TEST-GOAL-ONLY-001', { parent_cp_ids: undefined });
  const cpOnly = item('WI-TEST-CP-ONLY-001', { parent_goal_ids: ['G-10'] });
  const both = item('WI-TEST-GOAL-AND-CP-001');
  const items = [goalOnly, cpOnly, both];
  const goal = aggregateParentProgress({ workItems: items, parentGoalId: 'G-09', coverage: coverage(items, { expectedWorkItemIds: ['WI-TEST-GOAL-ONLY-001', 'WI-TEST-GOAL-AND-CP-001'] }) });
  assert.deepEqual(goal.included_work_item_ids, ['WI-TEST-GOAL-AND-CP-001', 'WI-TEST-GOAL-ONLY-001']);
  const cp = aggregateParentProgress({ workItems: items, parentCpId: 'CP-07', coverage: coverage(items, { expectedWorkItemIds: ['WI-TEST-CP-ONLY-001', 'WI-TEST-GOAL-AND-CP-001'] }) });
  assert.deepEqual(cp.included_work_item_ids, ['WI-TEST-CP-ONLY-001', 'WI-TEST-GOAL-AND-CP-001']);
  const intersection = aggregateParentProgress({ workItems: items, parentGoalId: 'G-09', parentCpId: 'CP-07', coverage: coverage(items, { expectedWorkItemIds: ['WI-TEST-GOAL-AND-CP-001'] }) });
  assert.deepEqual(intersection.included_work_item_ids, ['WI-TEST-GOAL-AND-CP-001']);
});
