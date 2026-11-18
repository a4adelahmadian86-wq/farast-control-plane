'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { selectNextWorkItem, hasActiveConflict, hardGatesSatisfied } = require('./work-item-dispatch-core');

const now = Date.parse('2026-11-15T12:00:00Z');
const item = (overrides = {}) => ({
  issue_number: 10,
  work_item_id: 'WI-10',
  status: 'READY',
  parent_exp_ids: ['EXP-03'],
  resource_keys: ['analysis:exp-03'],
  hard_gates: [],
  priority: 50,
  created_at_utc: '2026-11-14T12:00:00Z',
  steps: [],
  ...overrides
});

test('selects only a leaf in the specialist prompt EXP scope', () => {
  const selected = selectNextWorkItem([
    item({ issue_number: 11, work_item_id: 'WI-11', parent_exp_ids: ['EXP-04'] }),
    item({ issue_number: 12, work_item_id: 'WI-12', parent_exp_ids: ['EXP-03'] })
  ], { scopeExpIds: ['EXP-03'], nowMs: now });
  assert.equal(selected.issue_number, 12);
});

test('resumes verified IN_PROGRESS work before starting a fresh READY leaf', () => {
  const selected = selectNextWorkItem([
    item({ issue_number: 1, work_item_id: 'WI-READY', priority: 1 }),
    item({ issue_number: 2, work_item_id: 'WI-RESUME', status: 'IN_PROGRESS', checkpoint: { work_item_id: 'WI-RESUME' }, priority: 50 })
  ], { nowMs: now });
  assert.equal(selected.work_item_id, 'WI-RESUME');
  assert.equal(selected.selection.resumeRank, 0);
});

test('skips active issue and resource leases, but accepts expired locks', () => {
  const candidate = item({ issue_number: 13, resource_keys: ['analysis:exp-03'] });
  const active = [{ issue_number: 99, resource_key: 'analysis:exp-03', status: 'ACTIVE', lease_expires_at_utc: '2026-11-15T12:30:00Z' }];
  const expired = [{ issue_number: 99, resource_key: 'analysis:exp-03', status: 'ACTIVE', lease_expires_at_utc: '2026-11-15T11:30:00Z' }];
  assert.equal(hasActiveConflict(candidate, active, now), true);
  assert.equal(hasActiveConflict(candidate, expired, now), false);
  assert.equal(selectNextWorkItem([candidate], { activeLocks: active, nowMs: now }), null);
  assert.equal(selectNextWorkItem([candidate], { activeLocks: expired, nowMs: now }).issue_number, 13);
});

test('unresolved hard gates block selection; accepted hard gates pass', () => {
  const candidate = item({ hard_gates: ['EXP-22'] });
  assert.equal(hardGatesSatisfied(candidate, {}), false);
  assert.equal(selectNextWorkItem([candidate], { nowMs: now }), null);
  assert.equal(selectNextWorkItem([candidate], { hardGateStates: { 'EXP-22': 'ACCEPTED' }, nowMs: now }).issue_number, 10);
});

test('terminal and label-blocked tasks are never selected', () => {
  const selected = selectNextWorkItem([
    item({ issue_number: 1, status: 'BLOCKED' }),
    item({ issue_number: 2, labels: ['agent:blocked'] }),
    item({ issue_number: 3, status: 'REVIEW_REQUIRED' }),
    item({ issue_number: 4, labels: ['agent:done'] })
  ], { nowMs: now });
  assert.equal(selected, null);
});

test('priority aging and stable identifiers produce deterministic tie-breaks', () => {
  const selected = selectNextWorkItem([
    item({ issue_number: 2, work_item_id: 'WI-B', priority: 50, created_at_utc: '2026-10-01T00:00:00Z' }),
    item({ issue_number: 3, work_item_id: 'WI-A', priority: 50, created_at_utc: '2026-10-01T00:00:00Z' })
  ], { nowMs: now });
  assert.equal(selected.work_item_id, 'WI-A');
  assert.equal(selected.selection.effectivePriority, 5);
});


test('every specialist scope includes the shared G-09 global lane as well as its local EXP lane', () => {
  const global = item({ issue_number:20, work_item_id:'WI-GLOBAL-G09', parent_goal_ids:['G-09'], parent_exp_ids:['EXP-01'], priority:1 });
  const local = item({ issue_number:21, work_item_id:'WI-LOCAL-EXP02', parent_goal_ids:['G-01'], parent_exp_ids:['EXP-02'], priority:10 });
  const outside = item({ issue_number:22, work_item_id:'WI-OUTSIDE-EXP03', parent_goal_ids:['G-01'], parent_exp_ids:['EXP-03'], priority:0 });
  const selected = selectNextWorkItem([outside, local, global], { scopeExpIds:['EXP-02'], nowMs:now });
  assert.equal(selected.work_item_id, 'WI-GLOBAL-G09');
  assert.equal(selected.selection.scopeLane, 'GLOBAL_GOAL');
});

test('a locked G-09 global candidate is skipped and the specialist continues with its local EXP leaf', () => {
  const global = item({ issue_number:30, work_item_id:'WI-GLOBAL-LOCKED', parent_goal_ids:['G-09'], parent_exp_ids:['EXP-01'], resource_keys:['module:g09'], priority:1 });
  const local = item({ issue_number:31, work_item_id:'WI-LOCAL-EXP02', parent_goal_ids:['G-01'], parent_exp_ids:['EXP-02'], resource_keys:['analysis:exp-02'], priority:10 });
  const activeLocks = [{ issue_number:99, resource_key:'module:g09', status:'ACTIVE', lease_expires_at_utc:'2026-11-15T12:30:00Z' }];
  const selected = selectNextWorkItem([global, local], { scopeExpIds:['EXP-02'], activeLocks, nowMs:now });
  assert.equal(selected.work_item_id, 'WI-LOCAL-EXP02');
  assert.equal(selected.selection.scopeLane, 'SPECIALIST_EXP');
});

test('canonical EXP-02 backup recovery suppresses the superseded Issue 14 semantic alias', () => {
  const legacy = item({
    issue_number:14,
    work_item_id:'WI-EXP02-BACKUP-RESTORE-001',
    title:'EXP-02 Backup integrity and restore readiness',
    parent_goal_ids:['G-01'],
    parent_exp_ids:['EXP-02'],
    resource_keys:['analysis:exp-02']
  });
  const canonical = item({
    issue_number:66,
    work_item_id:'WI-EXP02-BACKUP-RECOVERY-001',
    title:'EXP-02 backup, data durability and disaster-recovery assessment',
    parent_goal_ids:['G-01','G-07'],
    parent_exp_ids:['EXP-02'],
    resource_keys:['analysis:exp-02-backup-recovery']
  });
  const selected = selectNextWorkItem([legacy, canonical], { scopeExpIds:['EXP-02'], nowMs:now });
  assert.equal(selected.work_item_id, 'WI-EXP02-BACKUP-RECOVERY-001');
  const blockedCanonical = selectNextWorkItem([legacy, { ...canonical, status:'BLOCKED' }], { scopeExpIds:['EXP-02'], nowMs:now });
  assert.equal(blockedCanonical, null);
});


test('G-09 global coordination is visible to PR-02, PR-16 and PR-17 scopes with safe local fallback', () => {
  const cases = [
    { scopeExpIds:['EXP-02'], localExp:'EXP-02', lockKey:'module:g09-exp02' },
    { scopeExpIds:['EXP-22','EXP-23'], localExp:'EXP-22', lockKey:'module:g09-exp22' },
    { scopeExpIds:['EXP-26'], localExp:'EXP-26', lockKey:'module:g09-exp26' }
  ];
  for (const [index, scenario] of cases.entries()) {
    const global = item({
      issue_number:70 + index * 2,
      work_item_id:'WI-GLOBAL-G09-' + index,
      parent_goal_ids:['G-09'],
      parent_exp_ids:['EXP-01'],
      resource_keys:[scenario.lockKey],
      priority:1
    });
    const local = item({
      issue_number:71 + index * 2,
      work_item_id:'WI-LOCAL-' + scenario.localExp,
      parent_goal_ids:['G-01'],
      parent_exp_ids:[scenario.localExp],
      resource_keys:['analysis:' + scenario.localExp.toLowerCase()],
      priority:10
    });
    const visible = selectNextWorkItem([local, global], { scopeExpIds:scenario.scopeExpIds, nowMs:now });
    assert.equal(visible.work_item_id, global.work_item_id);
    const activeLocks = [{ issue_number:999, resource_key:scenario.lockKey, status:'ACTIVE', lease_expires_at_utc:'2026-11-15T12:30:00Z' }];
    const fallback = selectNextWorkItem([global, local], { scopeExpIds:scenario.scopeExpIds, activeLocks, nowMs:now });
    assert.equal(fallback.work_item_id, local.work_item_id);
  }
});


test('allocator contention falls back to a specialist leaf without creating a duplicate allocator task', () => {
  const allocator = item({
    issue_number:90,
    work_item_id:'WI-GOAL-ALLOCATOR-001',
    parent_goal_ids:['G-09'],
    parent_exp_ids:['EXP-01'],
    resource_keys:['coordination:work-item-allocation'],
    priority:0
  });
  const local = item({
    issue_number:91,
    work_item_id:'WI-LOCAL-EXP02',
    parent_goal_ids:['G-01'],
    parent_exp_ids:['EXP-02'],
    resource_keys:['analysis:exp-02'],
    priority:10
  });
  const activeLocks = [{
    issue_number:92,
    resource_key:'coordination:work-item-allocation',
    status:'ACTIVE',
    lease_expires_at_utc:'2026-11-15T12:30:00Z'
  }];
  const selected = selectNextWorkItem([allocator, local], {
    scopeExpIds:['EXP-02'], activeLocks, nowMs:now
  });
  assert.equal(selected.work_item_id, 'WI-LOCAL-EXP02');
  assert.equal(selected.selection.scopeLane, 'SPECIALIST_EXP');
  assert.equal([allocator, local].filter(x => x.work_item_id === 'WI-GOAL-ALLOCATOR-001').length, 1);
});

test('newly allocated child leaves are discovered dynamically by each matching specialist without manual assignment', () => {
  const allocator = item({
    issue_number:93,
    work_item_id:'WI-GOAL-ALLOCATOR-001',
    status:'IN_PROGRESS',
    parent_goal_ids:['G-09'],
    parent_exp_ids:['EXP-01'],
    resource_keys:['coordination:work-item-allocation'],
    priority:0
  });
  const allocatorLock = [{
    issue_number:93,
    resource_key:'coordination:work-item-allocation',
    status:'ACTIVE',
    lease_expires_at_utc:'2026-11-15T12:30:00Z'
  }];
  const allocatedLeaves = [
    item({
      issue_number:94,
      work_item_id:'WI-DYNAMIC-EXP02-001',
      parent_work_item_id:'WI-GOAL-ALLOCATOR-001',
      parent_goal_ids:['G-09'],
      parent_exp_ids:['EXP-02'],
      title:'Independent EXP-02 backup evidence audit',
      resource_keys:['analysis:dynamic-exp-02'],
      priority:10
    }),
    item({
      issue_number:95,
      work_item_id:'WI-DYNAMIC-EXP22-001',
      parent_work_item_id:'WI-GOAL-ALLOCATOR-001',
      parent_goal_ids:['G-09'],
      parent_exp_ids:['EXP-22'],
      title:'Independent EXP-22 implementation architecture audit',
      resource_keys:['analysis:dynamic-exp-22'],
      priority:10
    })
  ];
  const expandedQueue = [allocator, ...allocatedLeaves];
  const exp02Worker = selectNextWorkItem(expandedQueue, {
    scopeExpIds:['EXP-02'], activeLocks:allocatorLock, nowMs:now
  });
  const exp22Worker = selectNextWorkItem(expandedQueue, {
    scopeExpIds:['EXP-22'], activeLocks:allocatorLock, nowMs:now
  });
  assert.equal(exp02Worker.work_item_id, 'WI-DYNAMIC-EXP02-001');
  assert.equal(exp22Worker.work_item_id, 'WI-DYNAMIC-EXP22-001');
  assert.notEqual(exp02Worker.work_item_id, exp22Worker.work_item_id);
  assert.ok(expandedQueue.filter(x => x.parent_work_item_id === allocator.work_item_id).length === 2);
});
