'use strict';

const STATUSES = Object.freeze([
  'BACKLOG','READY','CLAIMED','IN_PROGRESS','BLOCKED','REVIEW_REQUIRED',
  'PARTIALLY_ACCEPTED','ACCEPTED','REJECTED','CANCELLED'
]);
const TERMINAL = new Set(['ACCEPTED','REJECTED','CANCELLED']);
const VALIDATION = new Set(['NOT_RUN','PASS','FAIL','BLOCKED','UNKNOWN']);
const PRODUCT_REPOSITORY = 'a4adelahmadian86-wq/non';
const CONTROL_PLANE_REPOSITORY = 'a4adelahmadian86-wq/farast-control-plane';
const BASE_OPERATIONS = new Set(['analysis','proposal_only','control_plane_write','repository_write']);
const ACTION_OPERATIONS = new Set(['product_implementation','destructive_data_change','database_migration','authorization_change','security_sensitive_change','audit_log_change','architecture_implementation','hosting_deployment','legal_policy_change','merge','acceptance','security_acceptance','production_release']);
const ALL_OPERATIONS = new Set([...BASE_OPERATIONS, ...ACTION_OPERATIONS]);

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
  if (item.requested_operations !== undefined) {
    assert(Array.isArray(item.requested_operations) && item.requested_operations.length > 0, 'requested_operations must be a non-empty array');
    assert(item.requested_operations.every(x => typeof x === 'string' && x.trim()), 'requested_operations must contain non-empty strings');
    assert(new Set(item.requested_operations).size === item.requested_operations.length, 'requested_operations must be unique');
    if (item.write_policy === 'READ_ONLY') assert(item.requested_operations.every(x => x === 'analysis'), 'READ_ONLY Work Items may request analysis only');
    if (item.write_policy === 'WRITE_REQUIRES_OWNER_APPROVAL') assert(item.requested_operations.every(x => x === 'proposal_only'), 'approval-pending Work Items may request proposal_only only');
    if (item.write_policy === 'WRITE_ALLOWED') {
      assert(!item.requested_operations.some(x => x === 'analysis' || x === 'proposal_only'), 'WRITE_ALLOWED Work Items cannot request analysis/proposal-only as their write scope');
      if (item.target_repository === PRODUCT_REPOSITORY) assert(item.requested_operations.includes('product_implementation'), 'NON WRITE_ALLOWED Work Items must declare product_implementation');
      if (item.target_repository === CONTROL_PLANE_REPOSITORY) assert(item.requested_operations.includes('control_plane_write'), 'control-plane writes must declare control_plane_write');
      if (item.target_repository !== PRODUCT_REPOSITORY && item.target_repository !== CONTROL_PLANE_REPOSITORY) assert(item.requested_operations.includes('repository_write'), 'other repository writes must declare repository_write');
    }
  }
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

function defaultRequestedOperations(item) {
  if (Array.isArray(item?.requested_operations)) return item.requested_operations;
  if (item?.write_policy === 'READ_ONLY') return ['analysis'];
  if (item?.write_policy === 'WRITE_REQUIRES_OWNER_APPROVAL') return ['proposal_only'];
  // One-time migration exception: this Work Item introduces the explicit operation contract itself.
  if (item?.write_policy === 'WRITE_ALLOWED' && item?.work_item_id === 'WI-OPERATION-GATE-MODEL-001' &&
      item?.target_repository === CONTROL_PLANE_REPOSITORY) return ['control_plane_write'];
  return [];
}

function validateDependencyGraph(graph) {
  const errors = [];
  if (!graph || typeof graph !== 'object' || !Array.isArray(graph.nodes)) return {valid:false,errors:['dependency_graph_nodes_required']};
  const nodeIds = new Set();
  for (const node of graph.nodes) {
    if (!node || typeof node !== 'object' || !/^EXP-[0-9]{2}$/.test(String(node.id || ''))) { errors.push('invalid_exp_node_id'); continue; }
    if (nodeIds.has(node.id)) errors.push('duplicate_exp_node:' + node.id);
    nodeIds.add(node.id);
    if (!Array.isArray(node.hard_gates)) errors.push('hard_gates_must_be_array:' + node.id);
    else for (const gate of node.hard_gates) if (typeof gate !== 'string' || !/^EXP-[0-9]{2}$/.test(gate)) errors.push('non_exp_hard_gate:' + node.id + ':' + String(gate));
    if (node.soft_inputs !== undefined && (!Array.isArray(node.soft_inputs) || !node.soft_inputs.every(x => typeof x === 'string' && /^EXP-[0-9]{2}$/.test(x))) ) errors.push('invalid_soft_inputs:' + node.id);
  }
  if (graph.operation_gates !== undefined && !Array.isArray(graph.operation_gates)) errors.push('operation_gates_must_be_array');
  const gateIds = new Set();
  for (const gate of graph.operation_gates || []) {
    if (!gate || !ACTION_OPERATIONS.has(gate.id)) { errors.push('unknown_operation_gate:' + String(gate?.id)); continue; }
    if (gateIds.has(gate.id)) errors.push('duplicate_operation_gate:' + gate.id);
    gateIds.add(gate.id);
    if (!Array.isArray(gate.required_work_item_ids) || !gate.required_work_item_ids.every(x => typeof x === 'string' && /^[A-Z0-9][A-Z0-9._-]{2,63}$/.test(x))) errors.push('invalid_required_work_item_ids:' + gate.id);
    if (gate.applies_to_exp_ids !== undefined && (!Array.isArray(gate.applies_to_exp_ids) || !gate.applies_to_exp_ids.every(x => typeof x === 'string' && /^EXP-[0-9]{2}$/.test(x)))) errors.push('invalid_operation_exp_scope:' + gate.id);
    if (gate.applies_to_target_repositories !== undefined && (!Array.isArray(gate.applies_to_target_repositories) || !gate.applies_to_target_repositories.every(x => typeof x === 'string' && x.includes('/')))) errors.push('invalid_operation_repository_scope:' + gate.id);
    if (typeof gate.owner_authorization_required !== 'boolean') errors.push('owner_authorization_required_missing:' + gate.id);
    if (!Array.isArray(gate.evidence_requirements) || !gate.evidence_requirements.length || !gate.evidence_requirements.every(x => typeof x === 'string' && x.trim())) errors.push('evidence_requirements_missing:' + gate.id);
  }
  for (const operation of ACTION_OPERATIONS) if (!(graph.operation_gates || []).some(g => g?.id === operation)) errors.push('operation_gate_definition_missing:' + operation);
  return {valid:errors.length===0,errors};
}

function evaluateOperationGates(item, graph, workItems = [], options = {}) {
  const requested = options.requestedOperations || defaultRequestedOperations(item);
  const blockers = [];
  if (!Array.isArray(requested) || requested.length === 0) blockers.push('requested_operations_required_for_write');
  for (const operation of requested) {
    if (!ALL_OPERATIONS.has(operation)) { blockers.push('unknown_requested_operation:' + operation); continue; }
    if (BASE_OPERATIONS.has(operation)) {
      if (operation === 'analysis' && item.write_policy !== 'READ_ONLY') blockers.push('analysis_operation_requires_read_only:' + operation);
      if (operation === 'proposal_only' && item.write_policy !== 'WRITE_REQUIRES_OWNER_APPROVAL') blockers.push('proposal_operation_policy_mismatch');
      if (operation === 'control_plane_write' && (item.write_policy !== 'WRITE_ALLOWED' || item.target_repository !== CONTROL_PLANE_REPOSITORY)) blockers.push('control_plane_write_scope_mismatch');
      if (operation === 'repository_write' && (item.write_policy !== 'WRITE_ALLOWED' || item.target_repository === PRODUCT_REPOSITORY || item.target_repository === CONTROL_PLANE_REPOSITORY)) blockers.push('repository_write_scope_mismatch');
      continue;
    }
    if (ACTION_OPERATIONS.has(operation) && item.target_repository !== PRODUCT_REPOSITORY) blockers.push('product_action_requires_NON_target:' + operation);
    if (operation === 'product_implementation' && item.write_policy !== 'WRITE_ALLOWED') blockers.push('product_implementation_scope_mismatch');
    const gate = (graph.operation_gates || []).find(g => g.id === operation);
    if (!gate) { blockers.push('operation_gate_definition_missing:' + operation); continue; }
    const repoApplies = !Array.isArray(gate.applies_to_target_repositories) || gate.applies_to_target_repositories.includes(item.target_repository);
    const itemExpIds = new Set((item.parent_exp_ids || [primaryExpId(item)]).map(String));
    const expApplies = !Array.isArray(gate.applies_to_exp_ids) || gate.applies_to_exp_ids.some(id => itemExpIds.has(id));
    if (!repoApplies) continue;
    if (!expApplies) { blockers.push('operation_scope_mismatch:' + operation + ':' + [...itemExpIds].join(',')); continue; }
    if (gate.owner_authorization_required && (item.write_policy !== 'WRITE_ALLOWED' || !String(item.owner_approval_ref || '').trim())) blockers.push('owner_authorization_required:' + operation);
    for (const id of gate.required_work_item_ids) {
      if (id === item.work_item_id) { blockers.push('operation_prerequisite_self_reference:' + operation + ':' + id); continue; }
      const matches = workItems.filter(x => x.work_item_id === id);
      if (matches.length !== 1) blockers.push((matches.length ? 'ambiguous' : 'missing') + '_operation_prerequisite:' + operation + ':' + id);
      else if (matches[0].status !== 'ACCEPTED') blockers.push('operation_prerequisite_not_accepted:' + operation + ':' + id + ':' + matches[0].status);
    }
  }
  return {ready:blockers.length===0,blockers,requested_operations:requested};
}

function evaluateHardGates(item, graph, workItems = [], options = {}) {
  const checked = validateDependencyGraph(graph);
  if (!checked.valid) return {ready:false,exp_id:primaryExpId(item),blockers:checked.errors.map(x=>'invalid_dependency_graph:'+x),dependency_blockers:checked.errors,operation_blockers:[]};
  const expId = primaryExpId(item);
  if (!expId) return {ready:false,exp_id:null,blockers:['primary_exp_unresolved'],dependency_blockers:['primary_exp_unresolved'],operation_blockers:[]};
  const node = graph.nodes.find(x=>x.id===expId);
  if (!node || !Array.isArray(node.hard_gates)) return {ready:false,exp_id:expId,blockers:['missing_or_invalid_graph_node:'+expId],dependency_blockers:['missing_or_invalid_graph_node:'+expId],operation_blockers:[]};
  const dependencyBlockers = [];
  for (const gate of node.hard_gates) {
    const matches = workItems.filter(x=>primaryExpId(x)===gate);
    if (matches.length!==1) dependencyBlockers.push((matches.length?'ambiguous':'unresolved')+'_hard_gate:'+gate);
    else if (matches[0].status!=='ACCEPTED') dependencyBlockers.push('hard_gate_not_accepted:'+gate+':'+matches[0].status);
  }
  const operations = evaluateOperationGates(item,graph,workItems,options);
  const blockers = [...dependencyBlockers,...operations.blockers];
  return {ready:blockers.length===0,exp_id:expId,blockers,dependency_blockers:dependencyBlockers,operation_blockers:operations.blockers,requested_operations:operations.requested_operations,soft_inputs_ignored:node.soft_inputs||[]};
}

function evaluateReadOnlyAcceptance(item, options = {}) {
  const blockers = [];
  try {
    validateWorkItem(item);
  } catch (error) {
    return { ready: false, blockers: ['invalid_work_item:' + String(error.message || error)], progress: null };
  }
  if (item.write_policy !== 'READ_ONLY') blockers.push('write_policy_not_read_only');
  if (options.hasActiveLease === true) blockers.push('active_lease');
  if (options.hardGatesReady !== true) blockers.push('hard_gates_not_satisfied');
  const handoff = options.reviewEvent;
  if (!handoff || handoff.event !== 'REVIEW') blockers.push('missing_review_handoff');
  else {
    if (Number(handoff.issue_number) !== Number(options.issueNumber)) blockers.push('review_handoff_issue_mismatch');
    if (handoff.target_repository !== item.target_repository) blockers.push('review_handoff_target_mismatch');
    if (handoff.branch !== null && handoff.branch !== undefined) blockers.push('read_only_handoff_must_not_have_branch');
  }
  const progress = calculateProgress(item);
  if (!progress.can_accept) blockers.push('required_evidence_incomplete');
  return { ready: blockers.length === 0, blockers, progress };
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
  recordStepEvidence, recordCriterionEvidence, primaryExpId, defaultRequestedOperations, validateDependencyGraph, evaluateOperationGates, evaluateHardGates, evaluateReadOnlyAcceptance, dependencyReady, selectNextWorkItem,
  resumePlan, createCheckpoint
};
