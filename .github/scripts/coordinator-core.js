'use strict';

function isSafeRunId(value) {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value);
}

function roleForActor(policy, actor, association) {
  const role = policy?.actor_roles?.[actor] || policy?.default_association_roles?.[association] || null;
  return Object.prototype.hasOwnProperty.call(policy?.roles || {}, role) ? role : null;
}

function isWithinDelegatedScope(policy, actor, role, targetRepository, resourceKeys) {
  if (role !== 'SENIOR_MANAGER') return true;
  const scope = policy?.actor_scopes?.[actor];
  if (!scope || !Array.isArray(scope.repositories) || !Array.isArray(scope.resource_key_prefixes)) return false;
  if (!scope.repositories.includes(targetRepository)) return false;
  const keys = resourceKeys || [];
  if (!keys.length || !scope.resource_key_prefixes.length) return false;
  return keys.every(key => scope.resource_key_prefixes.some(prefix =>
    key === prefix || key.startsWith(prefix + '/') || key.startsWith(prefix + ':')
  ));
}

function isCommandAllowed(policy, actor, association, command, context = {}) {
  const role = roleForActor(policy, actor, association);
  if (!role || !Array.isArray(policy.roles[role]) || !policy.roles[role].includes(String(command).toLowerCase())) return false;
  return isWithinDelegatedScope(policy, actor, role, context.targetRepository, context.resourceKeys);
}

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

function leaseExpiryState(lock, nowMs = Date.now()) {
  const rawExpiry = lock?.lease_expires_at_utc;
  if (typeof rawExpiry !== 'string') return 'INVALID';
  const match = rawExpiry.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z$/);
  if (!match) return 'INVALID';
  const expiryMs = Date.parse(rawExpiry);
  if (!Number.isFinite(expiryMs)) return 'INVALID';
  const fraction = (match[7] || '').padEnd(3, '0');
  const canonical = match[1] + '-' + match[2] + '-' + match[3] + 'T' +
    match[4] + ':' + match[5] + ':' + match[6] + '.' + fraction + 'Z';
  // Date.parse normalizes some invalid calendar dates (for example Feb 30);
  // require the parsed value to round-trip to the exact UTC timestamp.
  if (new Date(expiryMs).toISOString() !== canonical) return 'INVALID';
  return expiryMs <= nowMs ? 'EXPIRED' : 'ACTIVE';
}

function leaseBlocksClaim(lock, nowMs = Date.now()) {
  // Invalid/missing expiry on a lock in the active registry is never evidence
  // that the lease ended. Keep it blocking until its owner renews/releases it
  // with the matching actor/chat/run/fencing token or it is audited manually.
  return leaseExpiryState(lock, nowMs) !== 'EXPIRED';
}

function expireLocks(state, nowMs = Date.now()) {
  const expired = [];
  const retained = [];
  const invalid = [];
  for (const lock of Array.isArray(state.locks) ? state.locks : []) {
    const leaseState = leaseExpiryState(lock, nowMs);
    if (leaseState === 'EXPIRED') expired.push(lock);
    else {
      retained.push(lock);
      if (leaseState === 'INVALID') invalid.push(lock);
    }
  }
  state.locks = retained;
  state.history ||= [];
  for (const x of expired) state.history.push({
    event: 'LEASE_EXPIRED', issue_number: x.issue_number, resource_key: x.resource_key,
    task_id: x.task_id, run_id: x.run_id, fencing_token: x.fencing_token,
    actor: x.actor, chat_id: x.chat_id, branch: x.branch, target_repository: x.target_repository,
    at_utc: new Date(nowMs).toISOString()
  });
  for (const lock of invalid) {
    const alreadyRecorded = state.history.some(event =>
      event.event === 'LEASE_INVALID' &&
      Number(event.issue_number) === Number(lock.issue_number) &&
      event.resource_key === lock.resource_key &&
      String(event.run_id ?? '') === String(lock.run_id ?? '') &&
      String(event.fencing_token ?? '') === String(lock.fencing_token ?? '')
    );
    if (!alreadyRecorded) state.history.push({
      event: 'LEASE_INVALID', issue_number: lock.issue_number, resource_key: lock.resource_key,
      task_id: lock.task_id, run_id: lock.run_id, fencing_token: lock.fencing_token,
      actor: lock.actor, chat_id: lock.chat_id, branch: lock.branch,
      target_repository: lock.target_repository,
      lease_expires_at_utc: lock.lease_expires_at_utc ?? null,
      at_utc: new Date(nowMs).toISOString()
    });
  }
  return expired;
}

function activeForIssue(state, issueNumber, nowMs = Date.now()) {
  return state.locks.filter(x => x.issue_number === issueNumber && leaseBlocksClaim(x, nowMs));
}

function branchForWritePolicy(issueNumber, runId, writePolicy) {
  if (!isSafeRunId(runId)) throw new Error('Invalid RUN_ID for branch allocation');
  if (writePolicy === 'WRITE_ALLOWED') return 'work/GH-' + issueNumber + '-' + runId.replace(/[^A-Za-z0-9._-]/g, '-');
  if (writePolicy === 'READ_ONLY' || writePolicy === 'WRITE_REQUIRES_OWNER_APPROVAL') return null;
  throw new Error('Unknown write_policy; refusing branch allocation');
}

function resolveWritePolicy(liveWorkItem, storedWorkItem) {
  const policy = liveWorkItem?.write_policy || 'READ_ONLY';
  if (!['READ_ONLY', 'WRITE_REQUIRES_OWNER_APPROVAL', 'WRITE_ALLOWED'].includes(policy)) {
    throw new Error('Unknown live write_policy; refusing write authorization');
  }
  if (storedWorkItem) {
    const storedPolicy = storedWorkItem.write_policy || 'READ_ONLY';
    if (storedPolicy !== policy) throw new Error('Registry write_policy differs from live Issue specification; owner refresh required');
    if (storedWorkItem.target_repository && storedWorkItem.target_repository !== liveWorkItem?.target_repository) {
      throw new Error('Registry target_repository differs from live Issue specification; owner refresh required');
    }
    const normalizeKeys = keys => [...new Set((keys || []).map(x =>
      String(x).trim().toLowerCase().split(String.fromCharCode(92)).join('/')
    ))].sort();
    if (JSON.stringify(normalizeKeys(storedWorkItem.resource_keys)) !== JSON.stringify(normalizeKeys(liveWorkItem?.resource_keys))) {
      throw new Error('Registry resource_keys differ from live Issue specification; owner refresh required');
    }
  }
  return policy;
}

function claimResources(state, args) {
  const nowMs = args.nowMs ?? Date.now();
  const keys = [...new Set(args.resourceKeys || [])].sort();
  if (!keys.length) return { ok: false, reason: 'missing_resources' };
  const taskConflict = state.locks.find(x => x.issue_number === args.issueNumber && leaseBlocksClaim(x, nowMs));
  if (taskConflict) return { ok: false, reason: 'task_already_claimed', conflict: taskConflict };
  const branchUsed = !!args.branch && (state.history || []).some(x => x.event === 'ACQUIRED' && x.issue_number === args.issueNumber && x.branch === args.branch);
  if (branchUsed) return { ok: false, reason: 'branch_reuse' };
  // A branchless claim is READ_ONLY or approval-pending: never inherit an old target-repository branch.
  const previousRun = args.branch ? [...(state.history || [])].reverse().find(x => x.issue_number === args.issueNumber && ['RELEASE','REVIEW','BLOCK','LEASE_EXPIRED'].includes(x.event) && x.branch) : null;
  const conflict = state.locks.find(x => keys.includes(x.resource_key) && leaseBlocksClaim(x, nowMs));
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
    previous_branch: previousRun?.branch || null,
    previous_target_repository: previousRun?.target_repository || null,
    previous_run_id: previousRun?.run_id || null,
    fencing_token: fencingToken, at_utc: acquiredAt
  });
  return { ok: true, fencingToken, expiresAt, resourceKeys: keys, previousRun: previousRun ? { branch: previousRun.branch, targetRepository: previousRun.target_repository, runId: previousRun.run_id } : null };
}

function renewLease(currentLocks, leaseMinutes, nowMs = Date.now()) {
  if (!currentLocks.length) return { ok: false };
  const heartbeatAt = new Date(nowMs).toISOString();
  const expiresAt = new Date(nowMs + leaseMinutes * 60000).toISOString();
  for (const lock of currentLocks) {
    lock.heartbeat_at_utc = heartbeatAt;
    lock.lease_expires_at_utc = expiresAt;
  }
  return { ok: true, heartbeatAt, expiresAt };
}

function ownsLease(currentLocks, actor, chatId, runId, token) {
  return currentLocks.length > 0 && Number(token) > 0 &&
    currentLocks.every(x => x.actor === actor && x.chat_id === chatId &&
      x.run_id === runId && x.fencing_token === Number(token));
}

function latestTaskStatus(processedOperations, issueNumber) {
  const transitions = Object.values(processedOperations || {})
    .filter(op => op.issue_number === issueNumber && op.next_status)
    .sort((a, b) => Date.parse(a.at_utc) - Date.parse(b.at_utc));
  return transitions.length ? transitions[transitions.length - 1].next_status : null;
}

function matchesReviewLease(pr, reviewEvent) {
  const target = reviewEvent?.target_repository;
  return !!target &&
    reviewEvent.branch === pr.head?.ref &&
    pr.head?.repo?.full_name === target &&
    pr.base?.repo?.full_name === target;
}

function hasSuccessfulChecks(checkRuns, combinedStatus) {
  const runs = Array.isArray(checkRuns) ? checkRuns : [];
  const statuses = Array.isArray(combinedStatus?.statuses) ? combinedStatus.statuses : [];
  const statusChecksPassed = statuses.length === 0
    ? ['success', 'pending'].includes(combinedStatus?.state)
    : combinedStatus?.state === 'success' && statuses.every(status => status.state === 'success');
  return runs.length > 0 &&
    runs.every(run => run.status === 'completed' && run.conclusion === 'success') &&
    statusChecksPassed;
}

const FARAST_COMMAND_RE = /^\\s*\\/farast\\s+(claim|heartbeat|release|status|progress|step|criterion|checkpoint|block|unblock|review|reopen|accept|refresh)\\b/i;

function pendingCommandComments(comments, processedOperations = {}) {
  const seen = new Set();
  return (comments || []).filter(comment => {
    const id = String(comment?.id ?? '').trim();
    if (!id || seen.has(id) || processedOperations[id]) return false;
    if (!FARAST_COMMAND_RE.test(String(comment?.body || ''))) return false;
    seen.add(id);
    return true;
  }).sort((a, b) => Number(a.id) - Number(b.id) || String(a.id).localeCompare(String(b.id)));
}

function pendingResponseOperations(processedOperations = {}, issueNumber) {
  return Object.entries(processedOperations || {})
    .filter(([, operation]) => operation && operation.response_posted !== true &&
      (issueNumber === undefined || Number(operation.issue_number) === Number(issueNumber)))
    .sort((a, b) => Number(a[0]) - Number(b[0]));
}

function responseMarker(operationId) {
  return '<!-- FARAST_OP_RESPONSE:' + String(operationId) + ' -->';
}

module.exports = {
  isSafeRunId, roleForActor, isWithinDelegatedScope, isCommandAllowed, resourcesFor, targetRepositoryFor, branchForWritePolicy, resolveWritePolicy, expireLocks, activeForIssue,
  claimResources, renewLease, ownsLease, latestTaskStatus, matchesReviewLease, hasSuccessfulChecks,
  pendingCommandComments, pendingResponseOperations, responseMarker
};
