'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('./coordinator-core');
const dispatch = require('./work-item-dispatch-core');

function registry() {
  return { next_fencing_token: 1, locks: [], history: [] };
}

test('automated acceptance requires all check runs and any reported commit statuses to succeed', () => {
  const successRun = [{status:'completed',conclusion:'success'}];
  assert.equal(core.hasSuccessfulChecks(successRun, {state:'success',statuses:[]}), true);
  // GitHub reports combined status as pending when no legacy commit-status contexts exist.
  assert.equal(core.hasSuccessfulChecks(successRun, {state:'pending',statuses:[]}), true);
  assert.equal(core.hasSuccessfulChecks([], {state:'success',statuses:[]}), false);
  assert.equal(core.hasSuccessfulChecks([{status:'completed',conclusion:'success'},{status:'completed',conclusion:'failure'}], {state:'success',statuses:[]}), false);
  assert.equal(core.hasSuccessfulChecks([{status:'in_progress',conclusion:null}], {state:'pending',statuses:[]}), false);
  assert.equal(core.hasSuccessfulChecks(successRun, {state:'failure',statuses:[]}), false);
  assert.equal(core.hasSuccessfulChecks([{status:'completed',conclusion:'neutral'}], {state:'success',statuses:[]}), false);
  assert.equal(core.hasSuccessfulChecks(successRun, {state:'success',statuses:[{state:'success'}]}), true);
  assert.equal(core.hasSuccessfulChecks(successRun, {state:'failure',statuses:[{state:'failure'}]}), false);
  assert.equal(core.hasSuccessfulChecks(successRun, {state:'pending',statuses:[{state:'pending'}]}), false);
});

test('same resource across different Issues grants only one owner', () => {
  const s = registry();
  const a = core.claimResources(s, { issueNumber: 10, taskId: 'GH-10', actor: 'alice', chatId: 'chat-a', runId: 'run-a', targetRepository: 'owner/repo', branch: 'work/GH-10', resourceKeys: ['module:payments'], leaseMinutes: 30, nowMs: 1000 });
  const b = core.claimResources(s, { issueNumber: 11, taskId: 'GH-11', actor: 'bob', chatId: 'chat-b', runId: 'run-b', targetRepository: 'owner/repo', branch: 'work/GH-11', resourceKeys: ['module:payments'], leaseMinutes: 30, nowMs: 1000 });
  assert.equal(a.ok, true);
  assert.equal(b.ok, false);
  assert.equal(b.reason, 'resource_conflict');
  assert.equal(s.locks.length, 1);
});

test('disjoint resources can be claimed concurrently', () => {
  const s = registry();
  const a = core.claimResources(s, { issueNumber: 10, taskId: 'GH-10', actor: 'alice', chatId: 'chat-a', runId: 'run-a', targetRepository: 'owner/repo', branch: 'work/GH-10', resourceKeys: ['module:payments'], leaseMinutes: 30, nowMs: 1000 });
  const b = core.claimResources(s, { issueNumber: 11, taskId: 'GH-11', actor: 'bob', chatId: 'chat-b', runId: 'run-b', targetRepository: 'owner/repo', branch: 'work/GH-11', resourceKeys: ['module:identity'], leaseMinutes: 30, nowMs: 1000 });
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  assert.equal(s.locks.length, 2);
});

test('multi-resource claim is all-or-none when any resource conflicts', () => {
  const s = registry();
  core.claimResources(s, { issueNumber: 10, taskId: 'GH-10', actor: 'alice', chatId: 'chat-a', runId: 'run-a', targetRepository: 'owner/repo', branch: 'work/GH-10', resourceKeys: ['module:payments'], leaseMinutes: 30, nowMs: 1000 });
  const b = core.claimResources(s, { issueNumber: 11, taskId: 'GH-11', actor: 'bob', chatId: 'chat-b', runId: 'run-b', targetRepository: 'owner/repo', branch: 'work/GH-11', resourceKeys: ['module:identity','module:payments'], leaseMinutes: 30, nowMs: 1000 });
  assert.equal(b.ok, false);
  assert.equal(s.locks.length, 1);
  assert.deepEqual(s.locks.map(x => x.resource_key), ['module:payments']);
});

test('expired lease can be replaced with a strictly newer fencing token', () => {
  const s = registry();
  const first = core.claimResources(s, { issueNumber: 10, taskId: 'GH-10', actor: 'alice', chatId: 'chat-a', runId: 'run-a', targetRepository: 'owner/repo', branch: 'work/GH-10', resourceKeys: ['module:payments'], leaseMinutes: 5, nowMs: 1000 });
  core.expireLocks(s, 1000 + 5 * 60000);
  const second = core.claimResources(s, { issueNumber: 11, taskId: 'GH-11', actor: 'bob', chatId: 'chat-b', runId: 'run-b', targetRepository: 'owner/repo', branch: 'work/GH-11', resourceKeys: ['module:payments'], leaseMinutes: 5, nowMs: 1000 + 5 * 60000 });
  assert.equal(second.ok, true);
  assert.ok(second.fencingToken > first.fencingToken);
  const expired = s.history.find(x => x.event === 'LEASE_EXPIRED');
  assert.ok(expired);
  assert.equal(expired.branch, 'work/GH-10');
});

test('malformed and missing active lease expiries fail closed and are audited once', () => {
  const s = registry();
  s.locks.push(
    { resource_key:'module:payments', issue_number:10, task_id:'GH-10', actor:'alice', chat_id:'chat-a', run_id:'run-a', target_repository:'owner/repo', branch:'work/GH-10', fencing_token:7, status:'ACTIVE', lease_expires_at_utc:'not-a-date' },
    { resource_key:'module:identity', issue_number:12, task_id:'GH-12', actor:'carol', chat_id:'chat-c', run_id:'run-c', target_repository:'owner/repo', branch:'work/GH-12', fencing_token:8, status:'ACTIVE' },
    { resource_key:'module:cache', issue_number:14, task_id:'GH-14', actor:'erin', chat_id:'chat-e', run_id:'run-e', target_repository:'owner/repo', branch:'work/GH-14', fencing_token:9, status:'ACTIVE', lease_expires_at_utc:'0' },
    { resource_key:'module:search', issue_number:15, task_id:'GH-15', actor:'frank', chat_id:'chat-f', run_id:'run-f', target_repository:'owner/repo', branch:'work/GH-15', fencing_token:10, status:'ACTIVE', lease_expires_at_utc:'2026-02-30T00:00:00Z' }
  );

  assert.deepEqual(core.expireLocks(s, 1000), []);
  assert.equal(s.locks.length, 4);
  for (const issueNumber of [10, 12, 14, 15]) {
    assert.equal(core.activeForIssue(s, issueNumber, 1000).length, 1);
  }
  assert.equal(s.history.filter(x => x.event === 'LEASE_INVALID').length, 4);

  core.expireLocks(s, 2000);
  assert.equal(s.locks.length, 4);
  assert.equal(s.history.filter(x => x.event === 'LEASE_INVALID').length, 4);

  const sameIssue = core.claimResources(s, {
    issueNumber:10, taskId:'GH-10', actor:'bob', chatId:'chat-b', runId:'run-b',
    targetRepository:'owner/repo', branch:'work/GH-10-run-b',
    resourceKeys:['module:unrelated'], leaseMinutes:30, nowMs:2000
  });
  assert.equal(sameIssue.ok, false);
  assert.equal(sameIssue.reason, 'task_already_claimed');

  const malformedResource = core.claimResources(s, {
    issueNumber:11, taskId:'GH-11', actor:'bob', chatId:'chat-b', runId:'run-b',
    targetRepository:'owner/repo', branch:'work/GH-11',
    resourceKeys:['module:payments'], leaseMinutes:30, nowMs:2000
  });
  assert.equal(malformedResource.ok, false);
  assert.equal(malformedResource.reason, 'resource_conflict');

  const missingResource = core.claimResources(s, {
    issueNumber:13, taskId:'GH-13', actor:'dave', chatId:'chat-d', runId:'run-d',
    targetRepository:'owner/repo', branch:'work/GH-13',
    resourceKeys:['module:identity'], leaseMinutes:30, nowMs:2000
  });
  assert.equal(missingResource.ok, false);
  assert.equal(missingResource.reason, 'resource_conflict');

  for (const [issueNumber, resourceKey] of [[16, 'module:cache'], [17, 'module:search']]) {
    const competing = core.claimResources(s, {
      issueNumber, taskId:'GH-' + issueNumber, actor:'bob', chatId:'chat-b', runId:'run-b',
      targetRepository:'owner/repo', branch:'work/GH-' + issueNumber,
      resourceKeys:[resourceKey], leaseMinutes:30, nowMs:2000
    });
    assert.equal(competing.ok, false);
    assert.equal(competing.reason, 'resource_conflict');
  }
});

test('rightful owner can renew an invalid active lease but stale fencing tokens do not own it', () => {
  const s = registry();
  s.locks.push({
    resource_key:'module:payments', issue_number:10, task_id:'GH-10',
    actor:'alice', chat_id:'chat-a', run_id:'run-a', target_repository:'owner/repo',
    branch:'work/GH-10', fencing_token:7, status:'ACTIVE', lease_expires_at_utc:'invalid'
  });

  const current = core.activeForIssue(s, 10, 1000);
  assert.equal(current.length, 1);
  assert.equal(core.ownsLease(current, 'alice', 'chat-a', 'run-a', 7), true);
  assert.equal(core.ownsLease(current, 'alice', 'chat-a', 'run-a', 6), false);
  assert.equal(core.ownsLease(current, 'bob', 'chat-b', 'run-b', 7), false);

  const renewed = core.renewLease(current, 5, 2000);
  assert.equal(renewed.ok, true);
  assert.equal(current[0].lease_expires_at_utc, renewed.expiresAt);
  assert.equal(core.activeForIssue(s, 10, 2001).length, 1);
});

test('valid future expiry remains active and blocks a competing resource claim', () => {
  const s = registry();
  s.locks.push({
    resource_key:'module:payments', issue_number:10, task_id:'GH-10',
    actor:'alice', chat_id:'chat-a', run_id:'run-a', target_repository:'owner/repo',
    branch:'work/GH-10', fencing_token:7, status:'ACTIVE',
    lease_expires_at_utc:new Date(5000).toISOString()
  });

  assert.deepEqual(core.expireLocks(s, 1000), []);
  assert.equal(core.activeForIssue(s, 10, 1000).length, 1);
  const competing = core.claimResources(s, {
    issueNumber:11, taskId:'GH-11', actor:'bob', chatId:'chat-b', runId:'run-b',
    targetRepository:'owner/repo', branch:'work/GH-11',
    resourceKeys:['module:payments'], leaseMinutes:30, nowMs:2000
  });
  assert.equal(competing.ok, false);
  assert.equal(competing.reason, 'resource_conflict');
});

test('25 workers cannot steal invalid leases and only one can claim a shared resource', () => {
  const invalidState = registry();
  invalidState.locks.push({
    resource_key:'module:shared', issue_number:1, task_id:'GH-1',
    actor:'owner', chat_id:'owner-chat', run_id:'owner-run',
    target_repository:'owner/repo', branch:'work/GH-1', fencing_token:99,
    status:'ACTIVE', lease_expires_at_utc:'malformed'
  });
  const blocked = Array.from({ length:25 }, (_, index) => core.claimResources(invalidState, {
    issueNumber:100 + index, taskId:'GH-' + (100 + index),
    actor:'worker-' + index, chatId:'chat-' + index, runId:'run-' + index,
    targetRepository:'owner/repo', branch:'work/GH-' + (100 + index),
    resourceKeys:['module:shared'], leaseMinutes:30, nowMs:1000
  }));
  assert.equal(blocked.filter(result => result.ok).length, 0);
  assert.equal(invalidState.locks.length, 1);

  const sharedState = registry();
  const shared = Array.from({ length:25 }, (_, index) => core.claimResources(sharedState, {
    issueNumber:200 + index, taskId:'GH-' + (200 + index),
    actor:'worker-' + index, chatId:'chat-' + index, runId:'run-' + index,
    targetRepository:'owner/repo', branch:'work/GH-' + (200 + index),
    resourceKeys:['module:shared'], leaseMinutes:30, nowMs:1000
  }));
  assert.equal(shared.filter(result => result.ok).length, 1);
  assert.equal(shared.filter(result => result.reason === 'resource_conflict').length, 24);
  assert.equal(sharedState.locks.length, 1);

  const disjointState = registry();
  const disjoint = Array.from({ length:25 }, (_, index) => core.claimResources(disjointState, {
    issueNumber:300 + index, taskId:'GH-' + (300 + index),
    actor:'worker-' + index, chatId:'chat-' + index, runId:'run-' + index,
    targetRepository:'owner/repo', branch:'work/GH-' + (300 + index),
    resourceKeys:['module:worker-' + index], leaseMinutes:30, nowMs:1000
  }));
  assert.equal(disjoint.filter(result => result.ok).length, 25);
  assert.equal(disjointState.locks.length, 25);
});

test('stale or mismatched worker cannot renew/release a lease', () => {
  const s = registry();
  const claim = core.claimResources(s, { issueNumber: 10, taskId: 'GH-10', actor: 'alice', chatId: 'chat-a', runId: 'run-a', targetRepository: 'owner/repo', branch: 'work/GH-10', resourceKeys: ['module:payments','file:src/payments.js'], leaseMinutes: 30, nowMs: 1000 });
  const current = core.activeForIssue(s, 10, 1001);
  assert.equal(core.ownsLease(current, 'alice', 'chat-a', 'run-a', claim.fencingToken), true);
  assert.equal(core.ownsLease(current, 'bob', 'chat-b', 'run-b', claim.fencingToken), false);
  assert.equal(core.ownsLease(current, 'alice', 'chat-a', 'run-a', claim.fencingToken - 1), false);
});

test('task parser requires target repository and canonical resource keys', () => {
  const body = '### Target repository (owner/name)\nowner/repo\n\n### Resource keys\nmodule:Payments\nfile:src/Pay.js';
  assert.equal(core.targetRepositoryFor(body), 'owner/repo');
  assert.deepEqual(core.resourcesFor(body, 10), ['file:src/pay.js','module:payments']);
  assert.equal(core.targetRepositoryFor('### Target repository\ninvalid'), '');
  assert.deepEqual(core.resourcesFor('### Resource keys\n', 10), []);
});

test('accepted PR must come from the exact branch and repository recorded by the latest lease review', () => {
  const pr = { head: { ref: 'work/GH-10-run-2', repo: { full_name: 'owner/product' } }, base: { repo: { full_name: 'owner/product' } } };
  const review = { branch: 'work/GH-10-run-2', target_repository: 'owner/product' };
  assert.equal(core.matchesReviewLease(pr, review), true);
  assert.equal(core.matchesReviewLease(pr, { ...review, branch: 'work/GH-10-run-1' }), false);
  assert.equal(core.matchesReviewLease(pr, { ...review, target_repository: 'owner/other' }), false);
  assert.equal(core.matchesReviewLease({ ...pr, base: { repo: { full_name: 'owner/other' } } }, review), false);
  assert.equal(core.matchesReviewLease({ ...pr, head: { ...pr.head, repo: { full_name: 'owner/fork' } } }, review), false);
  assert.equal(core.matchesReviewLease(pr, null), false);
});


test('one Issue cannot have two active workers even when their resource keys are disjoint', () => {
  const s = registry();
  const a = core.claimResources(s, { issueNumber: 10, taskId: 'GH-10', actor: 'alice', chatId: 'chat-a', runId: 'run-a', targetRepository: 'owner/repo', branch: 'work/GH-10-run-a', resourceKeys: ['module:payments'], leaseMinutes: 30, nowMs: 1000 });
  const b = core.claimResources(s, { issueNumber: 10, taskId: 'GH-10', actor: 'bob', chatId: 'chat-b', runId: 'run-b', targetRepository: 'owner/repo', branch: 'work/GH-10-run-b', resourceKeys: ['module:identity'], leaseMinutes: 30, nowMs: 1000 });
  assert.equal(a.ok, true);
  assert.equal(b.ok, false);
  assert.equal(b.reason, 'task_already_claimed');
  assert.equal(s.locks.length, 1);
});


test('valid heartbeat renews every resource lease with one expiry', () => {
  const s = registry();
  const claim = core.claimResources(s, { issueNumber: 10, taskId: 'GH-10', actor: 'alice', chatId: 'chat-a', runId: 'run-a', targetRepository: 'owner/repo', branch: 'work/GH-10-run-a', resourceKeys: ['module:payments','file:src/payments.js'], leaseMinutes: 30, nowMs: 1000 });
  const locks = core.activeForIssue(s, 10, 1001);
  const renewed = core.renewLease(locks, 15, 2000);
  assert.equal(renewed.ok, true);
  assert.equal(renewed.expiresAt, new Date(2000 + 15 * 60000).toISOString());
  assert.ok(locks.every(x => x.heartbeat_at_utc === renewed.heartbeatAt && x.lease_expires_at_utc === renewed.expiresAt));
});


test('Issue close eligibility follows the latest successful state transition, not labels or failed commands', () => {
  const operations = {
    a: { issue_number: 10, command: 'accept', next_status: 'done', at_utc: '2026-11-14T10:00:00Z' },
    b: { issue_number: 10, command: 'status', next_status: null, at_utc: '2026-11-14T10:01:00Z' },
    c: { issue_number: 10, command: 'accept', next_status: null, at_utc: '2026-11-14T10:02:00Z' },
    d: { issue_number: 11, command: 'accept', next_status: 'done', at_utc: '2026-11-14T10:03:00Z' }
  };
  assert.equal(core.latestTaskStatus(operations, 10), 'done');
  operations.e = { issue_number: 10, command: 'reopen', next_status: 'ready', at_utc: '2026-11-14T10:04:00Z' };
  assert.equal(core.latestTaskStatus(operations, 10), 'ready');
  assert.equal(core.latestTaskStatus({}, 10), null);
});


test('a released run cannot reclaim its old branch; new run receives prior handoff lineage', () => {
  const s = registry();
  const first = core.claimResources(s, { issueNumber: 10, taskId: 'GH-10', actor: 'alice', chatId: 'chat-a', runId: 'run-a', targetRepository: 'owner/product', branch: 'work/GH-10-run-a', resourceKeys: ['module:payments'], leaseMinutes: 30, nowMs: 1000 });
  assert.equal(first.ok, true);
  s.locks = [];
  s.history.push({ event: 'REVIEW', issue_number: 10, actor: 'alice', run_id: 'run-a', branch: 'work/GH-10-run-a', target_repository: 'owner/product', at_utc: new Date(2000).toISOString() });
  const stale = core.claimResources(s, { issueNumber: 10, taskId: 'GH-10', actor: 'bob', chatId: 'chat-b', runId: 'run-a', targetRepository: 'owner/product', branch: 'work/GH-10-run-a', resourceKeys: ['module:payments'], leaseMinutes: 30, nowMs: 3000 });
  assert.equal(stale.ok, false);
  assert.equal(stale.reason, 'branch_reuse');
  const next = core.claimResources(s, { issueNumber: 10, taskId: 'GH-10', actor: 'bob', chatId: 'chat-b', runId: 'run-b', targetRepository: 'owner/product', branch: 'work/GH-10-run-b', resourceKeys: ['module:payments'], leaseMinutes: 30, nowMs: 3000 });
  assert.equal(next.ok, true);
  assert.deepEqual(next.previousRun, { runId: 'run-a', branch: 'work/GH-10-run-a', targetRepository: 'owner/product' });
  const acquired = s.history.filter(x => x.event === 'ACQUIRED').at(-1);
  assert.equal(acquired.previous_branch, 'work/GH-10-run-a');
});


test('chat and run identifiers are bounded and branch-safe', () => {
  assert.equal(core.isSafeRunId('chat-01'), true);
  assert.equal(core.isSafeRunId('RUN_20261114.01'), true);
  assert.equal(core.isSafeRunId(''), false);
  assert.equal(core.isSafeRunId('../main'), false);
  assert.equal(core.isSafeRunId('run with spaces'), false);
  assert.equal(core.isSafeRunId('x'.repeat(65)), false);
});


test('command authorization enforces owner-delegated bounded roles', () => {
  const policy = {
    roles: {
      OWNER: ['claim','heartbeat','release','status','block','unblock','review','reopen','accept','refresh'],
      SENIOR_MANAGER: ['claim','heartbeat','release','status','block','unblock','review','reopen','accept'],
      WORKER: ['claim','heartbeat','release','status','block','review','accept'],
      READ_ONLY: ['status']
    },
    default_association_roles: { OWNER: 'OWNER', COLLABORATOR: 'WORKER', MEMBER: 'WORKER' },
    actor_roles: { manager: 'SENIOR_MANAGER', auditor: 'READ_ONLY' },
    actor_scopes: { manager: { repositories: ['owner/product'], resource_key_prefixes: ['module:commerce', 'file:src/commerce'] } }
  };
  assert.equal(core.roleForActor(policy, 'owner', 'OWNER'), 'OWNER');
  assert.equal(core.isCommandAllowed(policy, 'worker', 'COLLABORATOR', 'claim'), true);
  assert.equal(core.isCommandAllowed(policy, 'worker', 'COLLABORATOR', 'accept'), true);
  assert.equal(core.isCommandAllowed(policy, 'owner', 'OWNER', 'refresh'), true);
  assert.equal(core.isCommandAllowed(policy, 'worker', 'COLLABORATOR', 'refresh'), false);
  assert.equal(core.isCommandAllowed(policy, 'manager', 'COLLABORATOR', 'accept'), false);
  assert.equal(core.isCommandAllowed(policy, 'manager', 'COLLABORATOR', 'accept', { targetRepository: 'owner/product', resourceKeys: ['module:commerce', 'file:src/commerce/checkout.js'] }), true);
  assert.equal(core.isCommandAllowed(policy, 'manager', 'COLLABORATOR', 'accept', { targetRepository: 'owner/other', resourceKeys: ['module:commerce'] }), false);
  assert.equal(core.isCommandAllowed(policy, 'manager', 'COLLABORATOR', 'claim', { targetRepository: 'owner/product', resourceKeys: ['module:payments'] }), false);
  assert.equal(core.isCommandAllowed(policy, 'auditor', 'MEMBER', 'status'), true);
  assert.equal(core.isCommandAllowed(policy, 'auditor', 'MEMBER', 'release'), false);
  assert.equal(core.isCommandAllowed(policy, 'outsider', 'NONE', 'claim'), false);
});

 
test('branch allocation is disabled for READ_ONLY and approval-pending Work Items', () => {
  assert.equal(core.branchForWritePolicy(13, 'run-read-only', 'READ_ONLY'), null);
  assert.equal(core.branchForWritePolicy(14, 'run-proposal', 'WRITE_REQUIRES_OWNER_APPROVAL'), null);
  assert.equal(core.branchForWritePolicy(15, 'run-write', 'WRITE_ALLOWED'), 'work/GH-15-run-write');
  assert.throws(() => core.branchForWritePolicy(15, 'run-unknown', 'UNKNOWN'), /Unknown write_policy/);
  assert.throws(() => core.branchForWritePolicy(15, '../main', 'WRITE_ALLOWED'), /Invalid RUN_ID/);
});

test('branchless READ_ONLY claim does not inherit or expose a prior target-repository branch', () => {
  const s = registry();
  const first = core.claimResources(s, {
    issueNumber: 13, taskId: 'GH-13', actor: 'alice', chatId: 'chat-a', runId: 'run-write',
    targetRepository: 'owner/product', branch: 'work/GH-13-run-write',
    resourceKeys: ['analysis:exp-01'], leaseMinutes: 30, nowMs: 1000
  });
  assert.equal(first.ok, true);
  s.locks = [];
  s.history.push({
    event: 'RELEASE', issue_number: 13, actor: 'alice', run_id: 'run-write',
    branch: 'work/GH-13-run-write', target_repository: 'owner/product', at_utc: new Date(2000).toISOString()
  });
  const next = core.claimResources(s, {
    issueNumber: 13, taskId: 'GH-13', actor: 'bob', chatId: 'chat-b', runId: 'run-read-only',
    targetRepository: 'owner/product', branch: null,
    resourceKeys: ['analysis:exp-01'], leaseMinutes: 30, nowMs: 3000
  });
  assert.equal(next.ok, true);
  assert.equal(next.previousRun, null);
  assert.equal(s.locks.at(-1).branch, null);
  assert.equal(s.history.filter(x => x.event === 'ACQUIRED').at(-1).branch, null);
});

 
test('write policy resolution defaults legacy tasks to READ_ONLY and rejects stale registry authorization', () => {
  assert.equal(core.resolveWritePolicy(null, null), 'READ_ONLY');
  assert.equal(core.resolveWritePolicy({ write_policy: 'READ_ONLY' }, { write_policy: undefined }), 'READ_ONLY');
  assert.equal(core.resolveWritePolicy(
    { write_policy: 'WRITE_ALLOWED', target_repository: 'owner/control', resource_keys: ['module:ci'] },
    { write_policy: 'WRITE_ALLOWED', target_repository: 'owner/control', resource_keys: ['module:ci'] }
  ), 'WRITE_ALLOWED');
  assert.equal(core.resolveWritePolicy(
    { write_policy: 'WRITE_REQUIRES_OWNER_APPROVAL', target_repository: 'owner/control', resource_keys: ['module:proposal'] },
    { write_policy: 'WRITE_REQUIRES_OWNER_APPROVAL', target_repository: 'owner/control', resource_keys: ['module:proposal'] }
  ), 'WRITE_REQUIRES_OWNER_APPROVAL');
  assert.throws(() => core.resolveWritePolicy(
    { write_policy: 'READ_ONLY', target_repository: 'owner/product', resource_keys: ['analysis:exp-01'] },
    { write_policy: 'WRITE_ALLOWED', target_repository: 'owner/product', resource_keys: ['analysis:exp-01'] }
  ), /write_policy differs/);
  assert.throws(() => core.resolveWritePolicy(
    { write_policy: 'READ_ONLY', target_repository: 'owner/product', resource_keys: ['analysis:exp-01'] },
    { write_policy: 'READ_ONLY', target_repository: 'owner/control', resource_keys: ['analysis:exp-01'] }
  ), /target_repository differs/);
  assert.throws(() => core.resolveWritePolicy(
    { write_policy: 'READ_ONLY', target_repository: 'owner/product', resource_keys: ['analysis:exp-01'] },
    { write_policy: 'READ_ONLY', target_repository: 'owner/product', resource_keys: ['analysis:other'] }
  ), /resource_keys differ/);
  assert.throws(() => core.resolveWritePolicy(
    { write_policy: 'INVALID', target_repository: 'owner/product', resource_keys: ['analysis:exp-01'] },
    null
  ), /Unknown live write_policy/);
  assert.throws(() => core.resolveWritePolicy(
    null,
    { write_policy: 'WRITE_ALLOWED', target_repository: 'owner/control', resource_keys: ['module:ci'] }
  ), /write_policy differs/);
});


test('durable inbox replays 25 commands across five Issues exactly once and recovers unposted responses', () => {
  const inboxes = Array.from({ length:5 }, (_, issueIndex) => ({
    issue_number:77 + issueIndex,
    comments:Array.from({ length:5 }, (_, commentIndex) => ({
      id:5000 + issueIndex * 5 + commentIndex,
      body:'/farast claim chat=chat-' + issueIndex + '-' + commentIndex + ' run=run-' + issueIndex + '-' + commentIndex
    }))
  }));
  const processed = {};
  const pendingAcrossIssues = () => inboxes.flatMap(inbox =>
    core.pendingCommandComments([...inbox.comments, inbox.comments[0]], processed)
      .map(comment => ({ ...comment, issue_number:inbox.issue_number }))
  );

  // First issue_comment run is replaced after eight commits and before their responses are posted.
  const firstRun = pendingAcrossIssues().slice(0,8);
  assert.equal(firstRun.length, 8);
  for (const comment of firstRun) {
    processed[String(comment.id)] = { issue_number:comment.issue_number, response:'CLAIM RESULT', response_posted:false };
  }
  const recoverable = core.pendingResponseOperations(processed);
  assert.equal(recoverable.length, 8);
  assert.equal(new Set(recoverable.map(([id]) => core.responseMarker(id))).size, 8);
  for (const [id] of recoverable) processed[id].response_posted = true;

  // Replacement/scheduled reconciliation scans all five Issue inboxes and processes only 17 uncommitted IDs.
  const replacementRun = pendingAcrossIssues();
  assert.equal(replacementRun.length, 17);
  for (const comment of replacementRun) {
    processed[String(comment.id)] = { issue_number:comment.issue_number, response:'CLAIM RESULT', response_posted:false };
  }
  const secondRecovery = core.pendingResponseOperations(processed);
  assert.equal(secondRecovery.length, 17);
  for (const [id] of secondRecovery) processed[id].response_posted = true;

  // A later scheduled replay sees all durable comments (including duplicate IDs) and performs no work.
  assert.deepEqual(pendingAcrossIssues(), []);
  assert.equal(core.pendingResponseOperations(processed).length, 0);
  assert.equal(Object.keys(processed).length, 25);
  assert.equal(new Set(Object.keys(processed).map(core.responseMarker)).size, 25);
  assert.ok(Object.values(processed).every(operation => operation.response_posted === true));
  for (const inbox of inboxes) {
    assert.equal(core.pendingResponseOperations(processed, inbox.issue_number).length, 0);
  }
});

test('response recovery is scoped to the requested Issue and markers are deterministic', () => {
  const operations = {
    '100': { issue_number:77, response:'one', response_posted:false },
    '101': { issue_number:78, response:'two', response_posted:false },
    '102': { issue_number:77, response:'three', response_posted:true }
  };
  assert.deepEqual(core.pendingResponseOperations(operations, 77).map(([id]) => id), ['100']);
  assert.deepEqual(core.pendingResponseOperations(operations, 78).map(([id]) => id), ['101']);
  assert.equal(core.responseMarker(100), core.responseMarker('100'));
});

test('N=2,5,10,25 workers contend for one G-09 global leaf then safely fall back to unique local EXP leaves', () => {
  const makeItem = (issueNumber, workItemId, goalIds, expIds, resourceKey, priority) => ({
    issue_number:issueNumber,
    work_item_id:workItemId,
    status:'READY',
    labels:[],
    parent_goal_ids:goalIds,
    parent_exp_ids:expIds,
    resource_keys:[resourceKey],
    hard_gates:[],
    priority,
    created_at_utc:'2026-11-17T00:00:00Z',
    steps:[]
  });

  for (const workerCount of [2,5,10,25]) {
    const state = registry();
    const global = makeItem(100, 'WI-GLOBAL-G09', ['G-09'], ['EXP-01'], 'module:global-g09', 0);
    const locals = Array.from({ length:workerCount - 1 }, (_, index) =>
      makeItem(101 + index, 'WI-LOCAL-' + String(index + 1).padStart(2,'0'), ['G-01'], ['EXP-02'], 'analysis:local-' + index, 10)
    );
    const items = [global, ...locals];
    // All workers can read the same initial snapshot and nominate the same shared global leaf.
    const initialSelections = Array.from({ length:workerCount }, () =>
      dispatch.selectNextWorkItem(items, { scopeExpIds:['EXP-02'], activeLocks:state.locks, nowMs:1000 })
    );
    assert.ok(initialSelections.every(candidate => candidate?.work_item_id === global.work_item_id));

    const claimed = [];
    for (let index = 0; index < workerCount; index++) {
      let candidate = initialSelections[index];
      let result = core.claimResources(state, {
        issueNumber:candidate.issue_number,
        taskId:'GH-' + candidate.issue_number,
        actor:'owner',
        chatId:'chat-' + index,
        runId:'run-' + workerCount + '-' + index,
        targetRepository:'owner/repo',
        branch:'work/GH-' + candidate.issue_number + '-run-' + workerCount + '-' + index,
        resourceKeys:candidate.resource_keys,
        leaseMinutes:30,
        nowMs:1000
      });
      if (!result.ok) {
        candidate = dispatch.selectNextWorkItem(items, { scopeExpIds:['EXP-02'], activeLocks:state.locks, nowMs:1000 });
        assert.ok(candidate, 'worker must continue to an eligible local leaf after global conflict');
        result = core.claimResources(state, {
          issueNumber:candidate.issue_number,
          taskId:'GH-' + candidate.issue_number,
          actor:'owner',
          chatId:'chat-' + index,
          runId:'run-' + workerCount + '-' + index + '-fallback',
          targetRepository:'owner/repo',
          branch:'work/GH-' + candidate.issue_number + '-run-' + workerCount + '-' + index + '-fallback',
          resourceKeys:candidate.resource_keys,
          leaseMinutes:30,
          nowMs:1000
        });
      }
      assert.equal(result.ok, true);
      claimed.push(candidate.work_item_id);
    }
    assert.equal(claimed.length, workerCount);
    assert.equal(new Set(claimed).size, workerCount);
    assert.equal(claimed.filter(id => id === global.work_item_id).length, 1);
    assert.equal(state.locks.length, workerCount);
  }
});
