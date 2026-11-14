'use strict';

const STATUSES = Object.freeze([
  'BACKLOG','READY','CLAIMED','IN_PROGRESS','BLOCKED','REVIEW_REQUIRED',
  'PARTIALLY_ACCEPTED','ACCEPTED','REJECTED','CANCELLED'
]);
const TERMINAL = new Set(['ACCEPTED','REJECTED','CANCELLED']);
const VALIDATION = new Set(['NOT_RUN','PASS','FAIL','BLOCKED','UNKNOWN']);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function unique(values) { return [...new Set(values || [])]; }
function isIso(value) { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }

function validateWorkItem(item) {
  assert(item && typeof item === 'object', 'work item must be an object');
  assert(typeof item.work_item_id === 'string' && /^[A-Z0-9][A-Z0-9._-]{2,63}$/.test(item.work_item_id), 'invalid stable work_item_id');
  assert(item.schema_version === '1.0', 'unsupported schema_version');
  assert(typeof item.title === 'string' && item.title.trim(), 'title is required');
  assert(Array.isArray(item.parent_goal_ids) && item.parent_goal_ids.length > 0, 'parent_goal_ids are required');
  assert(Array.isArray(item.parent_exp_ids) && item.parent_exp_ids.length > 0, 'parent_exp_ids are required');
  assert(Number.isInteger(item.priority) && item.priority >= 0 && item.priority <= 100, 'priority must be an integer from 0 to 100');
  assert(isIso(item.created_at_utc), 'created_at_utc must be an ISO timestamp');
  assert(STATUSES.includes(item.status), 'invalid work item status');
  assert(typeof item.target_repository === 'string' && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(item.target_repository), 'invalid target_repository');
  assert(['READ_ONLY','WRITE_REQUIRES_OWNER_APPROVAL','WRITE_ALLOWED'].includes(item.write_policy), 'invalid write_policy');
  assert(['OWNER_ASSIGNED','DEFAULT_POLICY'].includes(item.priority_source), 'invalid priority_source');
  assert(Array.isArray(item.resource_keys) && item.resource_keys.length > 0, 'resource_keys are required');
  assert(Array.isArray(item.dependencies || []), 'dependencies must be an array');
  assert(Array.isArray(item.steps) && item.steps.length > 0, 'at least one atomic step is required');
  assert(Array.isArray(item.acceptance_criteria) && item.acceptance_criteria.length > 0, 'acceptance criteria are required');
  const ids = new Set();
  assert(item.steps.some(s => s.required !== false), 'at least one required step is needed');
  for (const step of item.steps) {
    assert(typeof step.step_id === 'string' && step.step_id.trim(), 'step_id is required');
    assert(!ids.has(step.step_id), 'duplicate step_id: ' + step.step_id);
    ids.add(step.step_id);
    assert(typeof step.title === 'string' && step.title.trim(), 'step title is required');
    assert(step.required === undefined || typeof step.required === 'boolean', 'step required must be boolean');
    assert(step.validation_status === undefined || VALIDATION.has(step.validation_status), 'invalid step validation_status');
    if (step.weight !== undefined) assert(Number.isFinite(step.weight) && step.weight > 0, 'step weight must be positive');
  }
  const criterionIds = new Set();
  assert(item.acceptance_criteria.some(c => c.required !== false), 'at least one required acceptance criterion is needed');
  for (const criterion of item.acceptance_criteria) {
    assert(typeof criterion.criterion_id === 'string' && criterion.criterion_id.trim(), 'criterion_id is required');
    assert(!criterionIds.has(criterion.criterion_id), 'duplicate criterion_id: ' + criterion.criterion_id);
    criterionIds.add(criterion.criterion_id);
    assert(VALIDATION.has(criterion.validation_status || 'NOT_RUN'), 'invalid criterion validation_status');
    assert(criterion.required === undefined || typeof criterion.required === 'boolean', 'criterion required must be boolean');
  }
  if (item.weighting) {
    assert(typeof item.weighting.version === 'string' && item.weighting.version.trim(), 'weighting version is required');
    assert(item.steps.filter(s => s.required !== false).every(s => Number.isFinite(s.weight) && s.weight > 0), 'all required steps need positive weights when weighting is enabled');
  }
  return true;
}

function evidenceVerified(record) {
  return record && record.validation_status === 'PASS' &&
    Array.isArray(record.evidence_refs) && record.evidence_refs.length > 0 &&
    record.evidence_refs.every(x => typeof x === 'string' && x.trim());
}

function calculateProgress(item) {
  validateWorkItem(item);
  const steps = item.steps.filter(s => s.required !== false);
  const weighted = !!item.weighting;
  const total = steps.reduce((sum, s) => sum + (weighted ? s.weight : 1), 0);
  const verified = steps.reduce((sum, s) => sum + (evidenceVerified(s) ? (weighted ? s.weight : 1) : 0), 0);
  const percentage = total === 0 ? 0 : Math.floor((verified / total) * 10000) / 100;
  const requiredCriteria = item.acceptance_criteria.filter(c => c.required !== false);
  const criteriaPassed = requiredCriteria.length > 0 && requiredCriteria.every(evidenceVerified);
  const allStepsVerified = steps.every(evidenceVerified);
  const dependenciesAccepted = (item.dependencies || []).every(d => d.status === 'ACCEPTED');
  return {
    percentage, verified_steps: steps.filter(evidenceVerified).length,
    total_steps: steps.length, verified_weight: verified, total_weight: total,
    weighting_version: weighted ? item.weighting.version : 'EQUAL_STEPS_V1',
    all_steps_verified: allStepsVerified,
    all_required_criteria_passed: criteriaPassed,
    dependencies_accepted: dependenciesAccepted,
    can_accept: allStepsVerified && criteriaPassed && dependenciesAccepted
  };
}

function validateLease(lease, actor, chatId, runId, token, nowMs = Date.now()) {
  return !!lease && lease.status === 'ACTIVE' && Date.parse(lease.lease_expires_at_utc) > nowMs &&
    lease.actor === actor && lease.chat_id === chatId && lease.run_id === runId &&
    Number(lease.fencing_token) === Number(token) && Number(token) > 0;
}

function recordStepEvidence(item, input) {
  validateWorkItem(item);
  assert(validateLease(input.lease, input.actor, input.chat_id, input.run_id, input.fencing_token, input.nowMs), 'stale_or_invalid_fencing_token');
  const step = item.steps.find(s => s.step_id === input.step_id);
  assert(step, 'unknown_step_id');
  assert(input.validation_status === 'PASS' || input.validation_status === 'FAIL' || input.validation_status === 'BLOCKED', 'invalid_validation_status');
  assert(Array.isArray(input.evidence_refs) && input.evidence_refs.length > 0 && input.evidence_refs.every(x => typeof x === 'string' && x.trim()), 'evidence_refs_required');
  if (step.validation_status === 'PASS' && evidenceVerified(step)) {
    return { changed: false, reason: 'already_verified', progress: calculateProgress(item) };
  }
  step.validation_status = input.validation_status;
  step.evidence_refs = unique(input.evidence_refs);
  step.validated_at_utc = new Date(input.nowMs ?? Date.now()).toISOString();
  step.validated_by = input.actor;
  step.validation_note = input.note || '';
  return { changed: true, progress: calculateProgress(item) };
}

function recordCriterionEvidence(item, input) {
  validateWorkItem(item);
  assert(validateLease(input.lease, input.actor, input.chat_id, input.run_id, input.fencing_token, input.nowMs), 'stale_or_invalid_fencing_token');
  const criterion = item.acceptance_criteria.find(c => c.criterion_id === input.criterion_id);
  assert(criterion, 'unknown_criterion_id');
  assert(input.validation_status === 'PASS' || input.validation_status === 'FAIL' || input.validation_status === 'BLOCKED', 'invalid_validation_status');
  assert(Array.isArray(input.evidence_refs) && input.evidence_refs.length > 0 && input.evidence_refs.every(x => typeof x === 'string' && x.trim()), 'evidence_refs_required');
  criterion.validation_status = input.validation_status;
  criterion.evidence_refs = unique(input.evidence_refs);
  criterion.validated_at_utc = new Date(input.nowMs ?? Date.now()).toISOString();
  criterion.validated_by = input.actor;
  criterion.validation_note = input.note || '';
  const progress = calculateProgress(item);
  if (progress.can_accept) item.status = 'REVIEW_REQUIRED';
  return { progress };
}

function dependencyReady(item, byId) {
  return (item.dependencies || []).every(dep => {
    const parent = byId.get(dep.work_item_id);
    return !!parent && parent.status === 'ACCEPTED';
  });
}

function selectNextWorkItem(items, options = {}) {
  const nowMs = options.nowMs ?? Date.now();
  const locks = options.activeLocks || [];
  const byId = new Map(items.map(x => [x.work_item_id, x]));
  const eligible = items.filter(item => {
    validateWorkItem(item);
    if (TERMINAL.has(item.status) || item.status === 'BLOCKED' || item.status === 'REVIEW_REQUIRED') return false;
    if (!dependencyReady(item, byId)) return false;
    const lease = options.leasesByWorkItem?.[item.work_item_id];
    if (lease && lease.status === 'ACTIVE' && Date.parse(lease.lease_expires_at_utc) > nowMs) return false;
    const keys = new Set(item.resource_keys);
    if (locks.some(lock => keys.has(lock.resource_key) && Date.parse(lock.lease_expires_at_utc) > nowMs)) return false;
    return item.status === 'READY' || item.status === 'BACKLOG' || item.status === 'CLAIMED' || item.status === 'IN_PROGRESS' || item.status === 'PARTIALLY_ACCEPTED';
  });
  const ageHours = item => Math.max(0, (nowMs - Date.parse(item.ready_at_utc || item.created_at_utc || new Date(nowMs).toISOString())) / 3600000);
  const effectivePriority = item => Math.max(0, Number(item.priority ?? 50) - Math.floor(ageHours(item) / 24));
  eligible.sort((a, b) =>
    effectivePriority(a) - effectivePriority(b) ||
    Date.parse(a.ready_at_utc || a.created_at_utc || 0) - Date.parse(b.ready_at_utc || b.created_at_utc || 0) ||
    a.work_item_id.localeCompare(b.work_item_id)
  );
  return eligible[0] || null;
}

function resumePlan(item) {
  validateWorkItem(item);
  const progress = calculateProgress(item);
  return {
    work_item_id: item.work_item_id,
    completed_step_ids: item.steps.filter(evidenceVerified).map(s => s.step_id),
    remaining_step_ids: item.steps.filter(s => s.required !== false && !evidenceVerified(s)).map(s => s.step_id),
    percentage: progress.percentage,
    next_action: item.steps.find(s => s.required !== false && !evidenceVerified(s))?.step_id || 'verify_acceptance_criteria'
  };
}

function createCheckpoint(item, input) {
  validateWorkItem(item);
  assert(validateLease(input.lease, input.actor, input.chat_id, input.run_id, input.fencing_token, input.nowMs), 'stale_or_invalid_fencing_token');
  const plan = resumePlan(item);
  return {
    work_item_id: item.work_item_id,
    run_id: input.run_id,
    checkpoint_version: 1,
    created_at_utc: new Date(input.nowMs ?? Date.now()).toISOString(),
    last_verified_step_id: plan.completed_step_ids.at(-1) || null,
    current_step_id: input.current_step_id || plan.next_action,
    completed_step_ids: plan.completed_step_ids,
    remaining_step_ids: plan.remaining_step_ids,
    progress_percentage: plan.percentage,
    evidence_refs: unique(input.evidence_refs || []),
    blockers: input.blockers || [],
    owner: { actor: input.actor, chat_id: input.chat_id, fencing_token: input.fencing_token, lease_expires_at_utc: input.lease.lease_expires_at_utc },
    next_action: input.next_action || plan.next_action
  };
}

module.exports = {
  STATUSES, validateWorkItem, evidenceVerified, calculateProgress, validateLease,
  recordStepEvidence, recordCriterionEvidence, dependencyReady, selectNextWorkItem,
  resumePlan, createCheckpoint
};
