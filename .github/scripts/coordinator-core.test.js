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
  assert.equal(s.history.some(x => x.event === 'LEASE_EXPIRED'), true);
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
});


test('accepted PR must come from the exact branch and repository recorded by the latest lease review', () => {
  const pr = { head: { ref: 'work/GH-10-run-2', repo: { full_name: 'owner/product' } } };
  const review = { branch: 'work/GH-10-run-2', target_repository: 'owner/product' };
  assert.equal(core.matchesReviewLease(pr, review), true);
  assert.equal(core.matchesReviewLease(pr, { ...review, branch: 'work/GH-10-run-1' }), false);
  assert.equal(core.matchesReviewLease(pr, { ...review, target_repository: 'owner/other' }), false);
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
