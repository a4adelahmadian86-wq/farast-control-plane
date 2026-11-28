'use strict';

const workItemCore = require('./work-item-core');

const TERMINAL_EXCLUSION_STATUSES = new Set(['CANCELLED', 'SUPERSEDED']);
const STATUS_KEYS = Object.freeze([
  'BACKLOG', 'READY', 'CLAIMED', 'IN_PROGRESS', 'BLOCKED',
  'REVIEW_REQUIRED', 'PARTIALLY_ACCEPTED', 'ACCEPTED', 'REJECTED',
  'CANCELLED', 'SUPERSEDED', 'UNKNOWN'
]);
const VALIDATION_KEYS = Object.freeze(['pass', 'fail', 'blocked', 'unknown', 'not_run']);

function compareText(left, right) {
  const a = String(left);
  const b = String(right);
  return a < b ? -1 : a > b ? 1 : 0;
}

function uniqueSorted(values) {
  return [...new Set(values)].sort(compareText);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveWeight(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function emptyCounts() {
  return Object.fromEntries(VALIDATION_KEYS.map(key => [key, 0]));
}

function emptyStatusCounts() {
  return Object.fromEntries(STATUS_KEYS.map(key => [key, 0]));
}

function weightedMetric(leafMetrics, metricKey) {
  if (!leafMetrics.length || leafMetrics.some(row =>
    row[metricKey] === null || !Number.isFinite(row[metricKey]) || !isPositiveWeight(row.weight))) return null;

  // Normalize before summing so valid finite weights cannot overflow either
  // the denominator or metric * weight numerator (for example, 1e308 * 100).
  const maxWeight = leafMetrics.reduce((maximum, row) => Math.max(maximum, row.weight), 0);
  if (!Number.isFinite(maxWeight) || maxWeight <= 0) return null;
  const normalized = leafMetrics.map(row => ({
    metric: row[metricKey],
    weight: row.weight / maxWeight
  }));
  const totalWeight = normalized.reduce((sum, row) => sum + row.weight, 0);
  if (!Number.isFinite(totalWeight) || totalWeight <= 0) return null;
  const weighted = normalized.reduce((sum, row) => sum + row.metric * row.weight, 0);
  if (!Number.isFinite(weighted)) return null;
  return Math.floor((weighted / totalWeight) * 100) / 100;
}

function addValidationCounts(target, source) {
  for (const key of VALIDATION_KEYS) target[key] += Number(source && source[key]) || 0;
}

function hierarchyBlockers(workItems, byId) {
  const blockers = [];
  for (const item of workItems) {
    const parentId = item.parent_work_item_id;
    if (parentId && !byId.has(parentId)) blockers.push('missing_parent_work_item:' + item.work_item_id + ':' + parentId);
  }
  for (const item of workItems) {
    const seen = new Set();
    let current = item;
    while (current && current.parent_work_item_id) {
      if (seen.has(current.work_item_id)) {
        blockers.push('parent_hierarchy_cycle:' + item.work_item_id);
        break;
      }
      seen.add(current.work_item_id);
      current = byId.get(current.parent_work_item_id);
      if (current && seen.has(current.work_item_id)) {
        blockers.push('parent_hierarchy_cycle:' + item.work_item_id);
        break;
      }
    }
  }
  return uniqueSorted(blockers);
}

function aggregateParentProgress(input = {}) {
  const blockers = [];
  const warnings = [];
  const workItems = Array.isArray(input.workItems) ? input.workItems : [];
  const parentGoalId = input.parentGoalId ?? null;
  const parentCpId = input.parentCpId ?? null;
  const coverage = input.coverage && typeof input.coverage === 'object' ? input.coverage : {};
  const approvedExclusions = Array.isArray(input.approvedExclusions) ? input.approvedExclusions : [];

  if (!isNonEmptyString(parentGoalId) && !isNonEmptyString(parentCpId)) {
    blockers.push('parent_goal_or_cp_id_required');
  }
  if (!Array.isArray(input.workItems)) blockers.push('canonical_work_items_array_required');
  if (coverage.issueInventoryComplete !== true) blockers.push('live_issue_inventory_incomplete');
  if (coverage.registryInventoryComplete !== true) blockers.push('canonical_registry_inventory_incomplete');
  if (!Array.isArray(coverage.expectedWorkItemIds)) blockers.push('expected_work_item_ids_required');
  else if (coverage.expectedWorkItemIds.some(value => !isNonEmptyString(value))) blockers.push('invalid_expected_work_item_id');
  for (const key of ['missingWorkItemIds', 'unregisteredIssueNumbers', 'unmappedWorkItemIds']) {
    if (!Array.isArray(coverage[key])) {
      blockers.push(key.replace(/[A-Z]/g, letter => '_' + letter.toLowerCase()) + '_required');
    } else if (coverage[key].length) {
      blockers.push(key.replace(/[A-Z]/g, letter => '_' + letter.toLowerCase()) + ':' + uniqueSorted(coverage[key]).join(','));
    }
  }
  if (!isNonEmptyString(coverage.issueSnapshotRef)) blockers.push('issue_snapshot_ref_required');
  if (!isNonEmptyString(coverage.registrySnapshotRef)) blockers.push('registry_snapshot_ref_required');
  if (input.approvedExclusions !== undefined && !Array.isArray(input.approvedExclusions)) blockers.push('approved_exclusions_must_be_an_array');

  const byId = new Map();
  const duplicateIds = new Set();
  for (const item of workItems) {
    const id = item && item.work_item_id;
    if (!isNonEmptyString(id)) {
      blockers.push('work_item_id_missing');
      continue;
    }
    if (byId.has(id)) duplicateIds.add(id);
    else byId.set(id, item);
  }
  if (duplicateIds.size) blockers.push('duplicate_work_item_ids:' + uniqueSorted([...duplicateIds]).join(','));

  for (const item of workItems) {
    if (!item || typeof item !== 'object') continue;
    try {
      const validationItem = item.status === 'SUPERSEDED' ? { ...item, status: 'CANCELLED' } : item;
      workItemCore.validateWorkItem(validationItem);
    } catch (error) {
      blockers.push('invalid_work_item:' + String(item.work_item_id || 'UNKNOWN') + ':' + String(error.message || error));
    }
  }
  blockers.push(...hierarchyBlockers(workItems.filter(item => item && isNonEmptyString(item.work_item_id)), byId));

  if (isNonEmptyString(parentGoalId) && isNonEmptyString(parentCpId)) {
    const goalCandidates = workItems.filter(item => item && Array.isArray(item.parent_goal_ids) && item.parent_goal_ids.includes(parentGoalId));
    const unclassifiedCpChildren = goalCandidates.filter(item => !Array.isArray(item.parent_cp_ids) || item.parent_cp_ids.length === 0);
    if (unclassifiedCpChildren.length) {
      blockers.push('goal_children_missing_cp_mapping:' + uniqueSorted(unclassifiedCpChildren.map(item => item.work_item_id)).join(','));
    }
  }

  const inScope = workItems.filter(item => {
    if (!item || !Array.isArray(item.parent_goal_ids) || !Array.isArray(item.parent_cp_ids || [])) return false;
    const goalMatch = !isNonEmptyString(parentGoalId) || item.parent_goal_ids.includes(parentGoalId);
    const cpMatch = !isNonEmptyString(parentCpId) || (item.parent_cp_ids || []).includes(parentCpId);
    return goalMatch && cpMatch;
  }).sort((a, b) => compareText(a.work_item_id, b.work_item_id));

  const expectedIds = Array.isArray(coverage.expectedWorkItemIds)
    ? uniqueSorted(coverage.expectedWorkItemIds.filter(isNonEmptyString)) : [];
  if (Array.isArray(coverage.expectedWorkItemIds)) {
    if (new Set(coverage.expectedWorkItemIds).size !== coverage.expectedWorkItemIds.length) {
      blockers.push('duplicate_expected_work_item_ids');
    }
    const actualIds = uniqueSorted(inScope.map(item => item.work_item_id));
    const missing = expectedIds.filter(id => !actualIds.includes(id));
    const unexpected = actualIds.filter(id => !expectedIds.includes(id));
    if (missing.length) blockers.push('expected_work_items_missing:' + missing.join(','));
    if (unexpected.length) blockers.push('unexpected_in_scope_work_items:' + unexpected.join(','));
  }

  const scopedIds = new Set(inScope.map(item => item.work_item_id));
  const parentsWithScopedChildren = new Set(inScope
    .filter(item => item.parent_work_item_id && scopedIds.has(item.parent_work_item_id))
    .map(item => item.parent_work_item_id));
  const leaves = inScope.filter(item => !parentsWithScopedChildren.has(item.work_item_id));
  const nonLeafIds = inScope.filter(item => parentsWithScopedChildren.has(item.work_item_id)).map(item => item.work_item_id);

  const exclusionById = new Map();
  for (const exclusion of approvedExclusions) {
    if (!exclusion || !isNonEmptyString(exclusion.workItemId) || exclusion.approved !== true ||
        !isNonEmptyString(exclusion.reason) || !/^https?:\/\//.test(exclusion.approvalRef)) {
      blockers.push('invalid_approved_exclusion_record');
      continue;
    }
    const excludedItem = byId.get(exclusion.workItemId);
    if (!excludedItem || !leaves.some(item => item.work_item_id === exclusion.workItemId)) {
      blockers.push('approved_exclusion_out_of_scope:' + exclusion.workItemId);
      continue;
    }
    if (!TERMINAL_EXCLUSION_STATUSES.has(excludedItem.status)) {
      blockers.push('approved_exclusion_for_nonterminal_item:' + exclusion.workItemId);
      continue;
    }
    if (exclusionById.has(exclusion.workItemId)) blockers.push('duplicate_approved_exclusion:' + exclusion.workItemId);
    else exclusionById.set(exclusion.workItemId, exclusion);
  }

  const includedLeaves = [];
  const excludedLeaves = [];
  for (const item of leaves) {
    if (TERMINAL_EXCLUSION_STATUSES.has(item.status)) {
      const exclusion = exclusionById.get(item.work_item_id);
      if (exclusion) {
        excludedLeaves.push({
          work_item_id: item.work_item_id,
          status: item.status,
          reason: exclusion.reason,
          approval_ref: exclusion.approvalRef
        });
        continue;
      }
      warnings.push('unapproved_terminal_retained_in_denominator:' + item.work_item_id);
    }
    includedLeaves.push(item);
  }

  const parentWeighting = input.parentWeighting ?? null;
  let weightingVersion = 'EQUAL_LEAVES_V1';
  let weights = new Map(includedLeaves.map(item => [item.work_item_id, 1]));
  if (parentWeighting !== null) {
    if (!parentWeighting || typeof parentWeighting !== 'object' || !isNonEmptyString(parentWeighting.version) ||
        !parentWeighting.weights || typeof parentWeighting.weights !== 'object' || Array.isArray(parentWeighting.weights)) {
      blockers.push('invalid_parent_weighting_contract');
    } else {
      weightingVersion = parentWeighting.version;
      const keys = Object.keys(parentWeighting.weights).sort();
      const includedIds = includedLeaves.map(item => item.work_item_id).sort();
      if (keys.length !== includedIds.length || keys.some((key, index) => key !== includedIds[index])) {
        blockers.push('parent_weighting_must_cover_exactly_included_leaves');
      }
      weights = new Map();
      for (const id of includedIds) {
        const weight = parentWeighting.weights[id];
        if (!isPositiveWeight(weight)) blockers.push('invalid_parent_weight:' + id);
        else weights.set(id, weight);
      }
    }
  }

  const statusCounts = emptyStatusCounts();
  for (const item of includedLeaves) {
    const status = STATUS_KEYS.includes(item.status) ? item.status : 'UNKNOWN';
    statusCounts[status]++;
  }

  const stepCounts = emptyCounts();
  const criterionCounts = emptyCounts();
  const unverifiedPassCounts = { required_steps: 0, acceptance_criteria: 0 };
  const leafMetrics = [];
  if (!blockers.length) {
    for (const item of includedLeaves) {
      const calculationItem = item.status === 'SUPERSEDED' ? { ...item, status: 'CANCELLED' } : item;
      let progress;
      try {
        progress = workItemCore.calculateProgress(calculationItem);
      } catch (error) {
        blockers.push('leaf_progress_invalid:' + item.work_item_id + ':' + String(error.message || error));
        continue;
      }
      const weight = weights.get(item.work_item_id);
      leafMetrics.push({
        work_item_id: item.work_item_id,
        status: item.status,
        weight,
        execution_percentage: progress.execution_percentage,
        acceptance_percentage: progress.acceptance_percentage,
        overall_completion_percentage: progress.overall_completion_percentage,
        required_step_counts: progress.required_step_counts,
        acceptance_criteria_counts: progress.acceptance_criteria_counts
      });
      addValidationCounts(stepCounts, progress.required_step_counts);
      addValidationCounts(criterionCounts, progress.acceptance_criteria_counts);
      const unverifiedSteps = item.steps.filter(step => step.required !== false && step.validation_status === 'PASS' && !workItemCore.evidenceVerified(step)).length;
      const unverifiedCriteria = item.acceptance_criteria.filter(criterion => criterion.required !== false && criterion.validation_status === 'PASS' && !workItemCore.evidenceVerified(criterion)).length;
      unverifiedPassCounts.required_steps += unverifiedSteps;
      unverifiedPassCounts.acceptance_criteria += unverifiedCriteria;
      if (unverifiedSteps || unverifiedCriteria) warnings.push('pass_without_verified_evidence:' + item.work_item_id + ':steps=' + unverifiedSteps + ':criteria=' + unverifiedCriteria);
    }
  }

  const finalBlockers = uniqueSorted(blockers);
  const complete = finalBlockers.length === 0 && includedLeaves.length > 0 && leafMetrics.length === includedLeaves.length;
  const progress = complete
    ? {
        execution_percentage: weightedMetric(leafMetrics, 'execution_percentage'),
        acceptance_percentage: weightedMetric(leafMetrics, 'acceptance_percentage'),
        overall_completion_percentage: weightedMetric(leafMetrics, 'overall_completion_percentage')
      }
    : {
        execution_percentage: null,
        acceptance_percentage: null,
        overall_completion_percentage: null
      };

  if (!includedLeaves.length && !finalBlockers.length) {
    finalBlockers.push('no_leaf_work_items_for_parent');
    progress.execution_percentage = null;
    progress.acceptance_percentage = null;
    progress.overall_completion_percentage = null;
  }
  return {
    schema_version: '1.0',
    parent: { goal_id: parentGoalId, cp_id: parentCpId },
    coverage_status: complete ? 'COMPLETE' : 'INCOMPLETE',
    progress,
    weighting_version: weightingVersion,
    child_counts: {
      in_scope_work_items: inScope.length,
      non_leaf_work_items: nonLeafIds.length,
      leaf_work_items: leaves.length,
      included_leaves: includedLeaves.length,
      approved_exclusions: excludedLeaves.length,
      by_status: statusCounts
    },
    required_step_counts: stepCounts,
    acceptance_criteria_counts: criterionCounts,
    unverified_pass_counts: unverifiedPassCounts,
    included_work_item_ids: uniqueSorted(includedLeaves.map(item => item.work_item_id)),
    non_leaf_work_item_ids: uniqueSorted(nonLeafIds),
    excluded_work_items: excludedLeaves.sort((a, b) => compareText(a.work_item_id, b.work_item_id)),
    leaf_metrics: leafMetrics.sort((a, b) => compareText(a.work_item_id, b.work_item_id)),
    blockers: uniqueSorted(finalBlockers),
    warnings: uniqueSorted(warnings),
    snapshot: {
      issue_snapshot_ref: coverage.issueSnapshotRef || null,
      registry_snapshot_ref: coverage.registrySnapshotRef || null
    }
  };
}

module.exports = { aggregateParentProgress };
