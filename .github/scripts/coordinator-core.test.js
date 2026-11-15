'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('./coordinator-core');

function registry() {
  return { next_fencing_token: 1, locks: [], history: [] };
}

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

test('acceptance approval must be current-head and independent of PR author, worker and acceptor', () => {
  const pr = { user: { login: 'author' }, head: { sha: 'head-2' } };
  const base = { state: 'APPROVED', commit_id: 'head-2', user: { login: 'reviewer' } };
  assert.equal(core.hasIndependentApproval([base], pr, 'worker', 'owner'), true);
  assert.equal(core.hasIndependentApproval([{...base, commit_id: 'old-head'}], pr, 'worker', 'owner'), false);
  assert.equal(core.hasIndependentApproval([{...base, user: { login: 'worker' }}], pr, 'worker', 'owner'), false);
  assert.equal(core.hasIndependentApproval([{...base, user: { login: 'author' }}], pr, 'worker', 'owner'), false);
  assert.equal(core.hasIndependentApproval([
    {...base, submitted_at: '2026-11-14T10:00:00Z'},
    {...base, state: 'CHANGES_REQUESTED', submitted_at: '2026-11-14T10:01:00Z'}
  ], pr, 'worker', 'owner'), false);
  assert.equal(core.hasIndependentApproval([
    {...base, commit_id: 'old-head', submitted_at: '2026-11-14T10:00:00Z'},
    {...base, commit_id: 'head-2', submitted_at: '2026-11-14T10:01:00Z'}
  ], pr, 'worker', 'owner'), true);
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
      WORKER: ['claim','heartbeat','release','status','block','review'],
      READ_ONLY: ['status']
    },
    default_association_roles: { OWNER: 'OWNER', COLLABORATOR: 'WORKER', MEMBER: 'WORKER' },
    actor_roles: { manager: 'SENIOR_MANAGER', auditor: 'READ_ONLY' },
    actor_scopes: { manager: { repositories: ['owner/product'], resource_key_prefixes: ['module:commerce', 'file:src/commerce'] } }
  };
  assert.equal(core.roleForActor(policy, 'owner', 'OWNER'), 'OWNER');
  assert.equal(core.isCommandAllowed(policy, 'worker', 'COLLABORATOR', 'claim'), true);
  assert.equal(core.isCommandAllowed(policy, 'worker', 'COLLABORATOR', 'accept'), false);
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
