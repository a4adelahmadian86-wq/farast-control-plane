'use strict';

function resourcesFor(body, issueNumber) {
  const text = body || '';
  const match = text.match(/(?:^|\n)###\s*Resource keys\s*\n([\s\S]*?)(?=\n###|$)/i);
  if (!match) return [];
  return [...new Set(match[1].split(/[\n,;]+/).map(x => x.trim().replace(/^[-*\s]+/, '').toLowerCase()).filter(Boolean))].sort().map(x => x.replace(/\\/g, '/'));
}

function targetRepositoryFor(body) {
  const match = (body || '').match(/(?:^|\n)###\s*Target repository(?: \(owner\/name\))?\s*\n([\s\S]*?)(?=\n###|$)/i);
  const value = match ? match[1].trim().split(/\s+/)[0] : '';
  return /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value) ? value : '';
}

function expireLocks(state, nowMs = Date.now()) {
  const expired = state.locks.filter(x => Date.parse(x.lease_expires_at_utc) <= nowMs);
  state.locks = state.locks.filter(x => Date.parse(x.lease_expires_at_utc) > nowMs);
  for (const x of expired) state.history.push({
    event: 'LEASE_EXPIRED', issue_number: x.issue_number, resource_key: x.resource_key,
    task_id: x.task_id, run_id: x.run_id, fencing_token: x.fencing_token,
    at_utc: new Date(nowMs).toISOString()
  });
  return expired;
}

function activeForIssue(state, issueNumber, nowMs = Date.now()) {
  return state.locks.filter(x => x.issue_number === issueNumber && Date.parse(x.lease_expires_at_utc) > nowMs);
}

function claimResources(state, args) {
  const nowMs = args.nowMs ?? Date.now();
  const keys = [...new Set(args.resourceKeys || [])].sort();
  if (!keys.length) return { ok: false, reason: 'missing_resources' };
  const conflict = state.locks.find(x => keys.includes(x.resource_key) && Date.parse(x.lease_expires_at_utc) > nowMs);
  if (conflict) return { ok: false, reason: 'resource_conflict', conflict };
  const fencingToken = state.next_fencing_token++;
  const acquiredAt = new Date(nowMs).toISOString();
  const expiresAt = new Date(nowMs + args.leaseMinutes * 60000).toISOString();
  for (const key of keys) state.locks.push({
    resource_key: key, issue_number: args.issueNumber, task_id: args.taskId,
    actor: args.actor, agent_alias: args.chatId || args.actor, chat_id: args.chatId,
    run_id: args.runId, target_repository: args.targetRepository, branch: args.branch,
    acquired_at_utc: acquiredAt, heartbeat_at_utc: acquiredAt,
    lease_expires_at_utc: expiresAt, fencing_token: fencingToken, status: 'ACTIVE'
  });
  state.history.push({
    event: 'ACQUIRED', issue_number: args.issueNumber, actor: args.actor,
    chat_id: args.chatId, run_id: args.runId, resource_keys: keys,
    target_repository: args.targetRepository, branch: args.branch,
    fencing_token: fencingToken, at_utc: acquiredAt
  });
  return { ok: true, fencingToken, expiresAt, resourceKeys: keys };
}

function ownsLease(currentLocks, actor, chatId, runId, token) {
  return currentLocks.length > 0 && Number(token) > 0 &&
    currentLocks.every(x => x.actor === actor && x.chat_id === chatId &&
      x.run_id === runId && x.fencing_token === Number(token));
}

function matchesReviewLease(pr, reviewEvent) {
  return !!reviewEvent && reviewEvent.branch === pr.head.ref && reviewEvent.target_repository === pr.head.repo?.full_name;
}

function hasIndependentApproval(reviews, pr, workerActor, acceptActor) {
  return reviews.some(r => r.state === 'APPROVED' &&
    r.commit_id === pr.head.sha &&
    r.user?.login !== pr.user?.login &&
    r.user?.login !== workerActor &&
    r.user?.login !== acceptActor);
}

module.exports = {
  resourcesFor, targetRepositoryFor, expireLocks, activeForIssue,
  claimResources, ownsLease, matchesReviewLease, hasIndependentApproval
};
