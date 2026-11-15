'use strict';

const TERMINAL = new Set(['ACCEPTED', 'REJECTED', 'CANCELLED', 'BLOCKED', 'REVIEW_REQUIRED', 'PARTIALLY_ACCEPTED']);

function normalize(value) {
  return String(value || '').trim().toUpperCase();
}

function normalizeKeys(values) {
  return [...new Set((values || []).map(value => String(value).trim().toLowerCase().split(String.fromCharCode(92)).join('/')))].sort();
}

function lockIsActive(lock, nowMs) {
  if (!lock || lock.status !== 'ACTIVE') return false;
  const expiry = Date.parse(lock.lease_expires_at_utc || '');
  // Invalid expiry is fail-closed: treat the lock as active until read-back resolves it.
  return !Number.isFinite(expiry) || expiry > nowMs;
}

function hasActiveConflict(item, locks, nowMs) {
  const itemKeys = new Set(normalizeKeys(item.resource_keys));
  return (locks || []).some(lock => {
    if (!lockIsActive(lock, nowMs)) return false;
    if (Number(lock.issue_number) === Number(item.issue_number)) return true;
    return normalizeKeys([lock.resource_key]).some(key => itemKeys.has(key));
  });
}

function hardGatesSatisfied(item, hardGateStates) {
  return (item.hard_gates || []).every(gate => {
    const state = hardGateStates?.[gate];
    return state === true || normalize(state) === 'ACCEPTED' || normalize(state) === 'PASS';
  });
}

function selectNextWorkItem(items, options = {}) {
  const nowMs = Number.isFinite(options.nowMs) ? options.nowMs : Date.now();
  const scope = new Set((options.scopeExpIds || []).map(String));
  const locks = options.activeLocks || [];
  const gates = options.hardGateStates || {};
  const candidates = [];

  for (const item of items || []) {
    const status = normalize(item.status);
    if (!['READY', 'IN_PROGRESS', 'CLAIMED'].includes(status)) continue;
    if ((item.labels || []).some(label => ['agent:blocked', 'agent:review', 'agent:done'].includes(String(label).toLowerCase()))) continue;
    if (scope.size && !(item.parent_exp_ids || []).some(exp => scope.has(String(exp)))) continue;
    if (!hardGatesSatisfied(item, gates)) continue;
    if (hasActiveConflict(item, locks, nowMs)) continue;

    const createdAt = Date.parse(item.ready_at_utc || item.created_at_utc || item.created_at || '');
    const stableCreatedAt = Number.isFinite(createdAt) ? createdAt : nowMs;
    const ageDays = Math.max(0, Math.floor((nowMs - stableCreatedAt) / 86400000));
    const priority = Number.isFinite(Number(item.priority)) ? Number(item.priority) : 50;
    const effectivePriority = Math.max(0, priority - ageDays);
    const hasCheckpoint = !!item.checkpoint && item.checkpoint.work_item_id === item.work_item_id;
    const hasVerifiedSteps = (item.steps || []).some(step => normalize(step.validation_status) === 'PASS' && (step.evidence_refs || []).length > 0);
    const resumeRank = ['IN_PROGRESS', 'CLAIMED'].includes(status) && (hasCheckpoint || hasVerifiedSteps) ? 0 : 1;

    candidates.push({
      ...item,
      selection: { resumeRank, effectivePriority, ageDays, stableCreatedAt }
    });
  }

  candidates.sort((a, b) =>
    a.selection.resumeRank - b.selection.resumeRank ||
    a.selection.effectivePriority - b.selection.effectivePriority ||
    a.selection.stableCreatedAt - b.selection.stableCreatedAt ||
    String(a.work_item_id || '').localeCompare(String(b.work_item_id || '')) ||
    Number(a.issue_number || 0) - Number(b.issue_number || 0)
  );
  return candidates[0] || null;
}

module.exports = { lockIsActive, hasActiveConflict, hardGatesSatisfied, selectNextWorkItem };
