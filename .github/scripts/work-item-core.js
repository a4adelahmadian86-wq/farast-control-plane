'use strict';

const STATUSES = Object.freeze([
  'BACKLOG','READY','CLAIMED','IN_PROGRESS','BLOCKED','REVIEW_REQUIRED',
  'PARTIALLY_ACCEPTED','ACCEPTED','REJECTED','CANCELLED'
]);
const TERMINAL = new Set(['ACCEPTED','REJECTED','CANCELLED']);
const VALIDATION = new Set(['NOT_RUN','PASS','FAIL','BLOCKED','UNKNOWN']);
const PRODUCT_REPOSITORY = 'a4adelahmadian86-wq/non';

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
  if (item.target_repository === PRODUCT_REPOSITORY && item.write_policy === 'WRITE_ALLOWED') assert(typeof item.owner_approval_ref === 'string' && item.owner_approval_ref.trim(), 'owner_approval_ref is required for NON WRITE_ALLOWED');
  if (item.write_policy === 'WRITE_REQUIRES_OWNER_APPROVAL') assert(typeof item.owner_approval_ref === 'string' && item.owner_approval_ref.trim(), 'owner_approval_ref is required for approval-gated writes');
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
  if (item.acceptance_weighting) {
    assert(typeof item.acceptance_weighting.version === 'string' && item.acceptance_weighting.version.trim(), 'acceptance weighting version is required');
    assert(item.acceptance_criteria.filter(c => c.required !== false).every(c => Number.isFinite(c.weight) && c.weight > 0), 'all required criteria need positive weights when acceptance weighting is enabled');
  }
  if (item.depth_profile) {
    const depth = item.depth_profile;
    assert(Number.isInteger(item.effort_estimate_minutes) && item.effort_estimate_minutes >= 20 && item.effort_estimate_minutes <= 30, 'deep Work Items need 20-30 minute effort_estimate_minutes');
    assert(typeof item.effort_rationale === 'string' && item.effort_rationale.trim(), 'deep Work Items need effort_rationale');
    assert(typeof depth.profile_version === 'string' && depth.profile_version.trim(), 'depth profile version is required');
    assert(Number.isInteger(depth.min_substantive_steps) && depth.min_substantive_steps >= 6, 'deep Work Items require at least six substantive steps');
    assert(Number.isInteger(depth.min_acceptance_criteria) && depth.min_acceptance_criteria >= 4, 'deep Work Items require at least four acceptance criteria');
    assert(Number.isInteger(depth.min_deliverables) && depth.min_deliverables >= 3, 'deep Work Items require at least three deliverables');
    assert(Number.isInteger(depth.target_effort_minutes) && depth.target_effort_minutes >= 20 && depth.target_effort_minutes <= 30, 'depth target effort must be 20-30 minutes');
    assert(item.steps.filter(s => s.required !== false).length >= depth.min_substantive_steps, 'deep Work Item has too few required steps');
    assert(item.acceptance_criteria.filter(c => c.required !== false).length >= depth.min_acceptance_criteria, 'deep Work Item has too few required acceptance criteria');
    assert(Array.isArray(item.deliverables) && item.deliverables.length >= depth.min_deliverables, 'deep Work Item has too few deliverables');
    for (const step of item.steps.filter(s => s.required !== false)) {
      assert(typeof step.expected_output === 'string' && step.expected_output.trim(), 'deep Work Item steps need expected_output');
      assert(typeof step.evidence_requirement === 'string' && step.evidence_requirement.trim(), 'deep Work Item steps need evidence_requirement');
    }
    for (const criterion of item.acceptance_criteria.filter(c => c.required !== false)) {
      assert(typeof criterion.evidence_requirement === 'string' && criterion.evidence_requirement.trim(), 'deep Work Item criteria need evidence_requirement');
    }
    for (const deliverable of item.deliverables) {
      assert(typeof deliverable.deliverable_id === 'string' && deliverable.deliverable_id.trim(), 'deliverable_id is required');
      assert(typeof deliverable.description === 'string' && deliverable.description.trim(), 'deliverable description is required');
      assert(typeof deliverable.evidence_requirement === 'string' && deliverable.evidence_requirement.trim(), 'deliverable evidence_requirement is required');
    }
  }
  return true;
}

function validateProductWriteAuthorization(item, context = {}) {
  validateWorkItem(item);
  if (item.target_repository !== PRODUCT_REPOSITORY || item.write_policy !== 'WRITE_ALLOWED') return false;
  assert(typeof context.repository_owner === 'string' && context.repository_owner.trim(), 'repository_owner is required');
  assert(context.issue_author === context.repository_owner, 'NON WRITE_ALLOWED requires an owner-authored Issue');
  assert(typeof context.issue_url === 'string' && context.issue_url.trim() && item.owner_approval_ref === context.issue_url,
    'owner_approval_ref must exactly reference the owner-created Issue');
  const approvalText = String(context.issue_body || '').replace(/[`*]/g, '').toLowerCase();
  assert(approvalText.includes('owner decision') &&
    approvalText.includes('explicitly approved write_allowed') &&
    approvalText.includes(PRODUCT_REPOSITORY),
    'explicit owner approval statement is missing');
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
  const executionPercentage = total === 0 ? 0 : Math.floor((verified / total) * 10000) / 100;

  const requiredCriteria = item.acceptance_criteria.filter(c => c.required !== false);
  const acceptanceWeighted = !!item.acceptance_weighting;
  const criteriaTotal = requiredCriteria.reduce((sum, c) => sum + (acceptanceWeighted ? c.weight : 1), 0);
  const criteriaVerified = requiredCriteria.reduce((sum, c) => sum + (evidenceVerified(c) ? (acceptanceWeighted ? c.weight : 1) : 0), 0);
  const acceptancePercentage = criteriaTotal === 0 ? null : Math.floor((criteriaVerified / criteriaTotal) * 10000) / 100;
  const criteriaPassed = requiredCriteria.length > 0 && requiredCriteria.every(evidenceVerified);
  const allStepsVerified = steps.every(evidenceVerified);
  const dependenciesAccepted = (item.dependencies || []).every(d => d.status === 'ACCEPTED');
  const overallCompletion = acceptancePercentage === null ? null : Math.min(executionPercentage, acceptancePercentage);
  const countStates = records => Object.fromEntries(['PASS','FAIL','BLOCKED','UNKNOWN','NOT_RUN'].map(status => [
    status.toLowerCase(), records.filter(x => (x.validation_status || 'NOT_RUN') === status && (status !== 'PASS' || evidenceVerified(x))).length
  ]));
  return {
    percentage: executionPercentage,
    execution_percentage: executionPercentage,
    acceptance_percentage: acceptancePercentage,
    overall_completion_percentage: overallCompletion,
    verified_steps: steps.filter(evidenceVerified).length,
    total_steps: steps.length,
    verified_criteria: requiredCriteria.filter(evidenceVerified).length,
    total_criteria: requiredCriteria.length,
    verified_weight: verified,
    total_weight: total,
    verified_criteria_weight: criteriaVerified,
    total_criteria_weight: criteriaTotal,
    weighting_version: weighted ? item.weighting.version : 'EQUAL_STEPS_V1',
    acceptance_weighting_version: acceptanceWeighted ? item.acceptance_weighting.version : 'EQUAL_CRITERIA_V1',
    required_step_counts: countStates(steps),
    acceptance_criteria_counts: countStates(requiredCriteria),
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

function primaryExpId(item) {
  const match = /^WI-EXP([0-9]{2})-/i.exec(String(item?.work_item_id || ''));
  if (match) return 'EXP-' + match[1];
  const parentExpIds = [...new Set((item?.parent_exp_ids || []).map(String))];
  return parentExpIds[0] || null;
}

function evaluateHardGates(item, graph, workItems = []) {
  if (!Array.isArray(graph?.nodes)) return { ready: false, exp_id: null, blockers: ['dependency_graph_unavailable'] };
  const expId = primaryExpId(item);
  if (!expId) return { ready: false, exp_id: null, blockers: ['primary_exp_unresolved'] };
  const node = graph.nodes.find(candidate => candidate.id === expId);
  if (!node || !Array.isArray(node.hard_gates)) return { ready: false, exp_id: expId, blockers: ['missing_or_invalid_graph_node:' + expId] };
  const blockers = [];
  for (const gate of node.hard_gates) {
    if (/^EXP-[0-9]{2}$/.test(gate)) {
      const matches = workItems.filter(candidate => primaryExpId(candidate) === gate);
      if (matches.length !== 1) blockers.push(matches.length ? 'ambiguous_hard_gate:' + gate : 'unresolved_hard_gate:' + gate);
      else if (matches[0].status !== 'ACCEPTED') blockers.push('hard_gate_not_accepted:' + gate + ':' + matches[0].status);
    } else {
      // Operational gates need their own authoritative evidence model; never guess their meaning.
      blockers.push('unsupported_hard_gate:' + gate);
    }
  }
  return { ready: blockers.length === 0, exp_id: expId, blockers, soft_inputs_ignored: node.soft_inputs || [] };
}

function dependencyReady(item, byId, dependencyGraph) {
  const explicitDependenciesReady = (item.dependencies || []).every(dep => {
    const parent = byId.get(dep.work_item_id);
    return !!parent && parent.status === 'ACCEPTED';
  });
  if (!explicitDependenciesReady) return false;
  return dependencyGraph ? evaluateHardGates(item, dependencyGraph, [...byId.values()]).ready : true;
}

function selectNextWorkItem(items, options = {}) {
  const nowMs = options.nowMs ?? Date.now();
  const locks = options.activeLocks || [];
  const byId = new Map(items.map(x => [x.work_item_id, x]));
  const eligible = items.filter(item => {
    validateWorkItem(item);
    if (TERMINAL.has(item.status) || item.status === 'BLOCKED' || item.status === 'REVIEW_REQUIRED') return false;
    if (!dependencyReady(item, byId, options.dependencyGraph)) return false;
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
    execution_progress_percentage: progress.execution_percentage,
    acceptance_progress_percentage: progress.acceptance_percentage,
    overall_completion_percentage: progress.overall_completion_percentage,
    required_step_counts: progress.required_step_counts,
    acceptance_criteria_counts: progress.acceptance_criteria_counts,
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
    execution_progress_percentage: plan.execution_progress_percentage,
    acceptance_progress_percentage: plan.acceptance_progress_percentage,
    overall_completion_percentage: plan.overall_completion_percentage,
    progress_calculation_version: 'PROGRESS_V2',
    required_step_counts: plan.required_step_counts,
    acceptance_criteria_counts: plan.acceptance_criteria_counts,
    evidence_refs: unique(input.evidence_refs || []),
    blockers: input.blockers || [],
    owner: { actor: input.actor, chat_id: input.chat_id, fencing_token: input.fencing_token, lease_expires_at_utc: input.lease.lease_expires_at_utc },
    next_action: input.next_action || plan.next_action
  };
}

module.exports = {
  STATUSES, validateWorkItem, validateProductWriteAuthorization, evidenceVerified, calculateProgress, validateLease,
  recordStepEvidence, recordCriterionEvidence, primaryExpId, evaluateHardGates, dependencyReady, selectNextWorkItem,
  resumePlan, createCheckpoint
};
