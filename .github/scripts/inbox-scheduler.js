'use strict';

const PAGE_SIZE = 25;
const MAX_ISSUES_PER_BATCH = PAGE_SIZE + 1; // event Issue plus one bounded global page
const MAX_COMMANDS_PER_ISSUE = 1;
const MAX_PENDING_RESPONSES_PER_ISSUE = 10;

const COMMAND_RE = /^\s*\/farast\s+(claim|heartbeat|release|status|progress|step|criterion|checkpoint|block|unblock|review|reopen|accept|refresh)\b/i;

function isTaskIssue(issue) {
  if (!issue || issue.pull_request) return false;
  const labels = (issue.labels || []).map(label => typeof label === 'string' ? label : label?.name);
  return String(issue.title || '').startsWith('[FARAST-TASK]') || labels.includes('agent:task');
}

function selectIssueBatch({ eventIssue = null, pageIssues = [], maxIssues = MAX_ISSUES_PER_BATCH } = {}) {
  if (!Number.isInteger(maxIssues) || maxIssues < 1) throw new Error('maxIssues must be a positive integer');
  const selected = [];
  const seen = new Set();
  const add = issue => {
    if (!isTaskIssue(issue)) return;
    const number = Number(issue.number);
    if (!Number.isSafeInteger(number) || number < 1 || seen.has(number)) return;
    seen.add(number);
    selected.push(issue);
  };

  // The triggering Issue gets one bounded opportunity, but cannot monopolize the run.
  add(eventIssue);
  const orderedPage = [...(pageIssues || [])].sort((a, b) => Number(a.number) - Number(b.number));
  for (const issue of orderedPage) {
    if (selected.length >= maxIssues) break;
    add(issue);
  }
  return selected;
}

function selectPendingCommandComments(comments, processedOperations = {}, limit = MAX_COMMANDS_PER_ISSUE) {
  if (!Number.isInteger(limit) || limit < 1) throw new Error('limit must be a positive integer');
  const seen = new Set();
  return (comments || []).filter(comment => {
    const id = String(comment?.id ?? '').trim();
    if (!id || seen.has(id) || processedOperations[id]) return false;
    if (!COMMAND_RE.test(String(comment?.body || ''))) return false;
    seen.add(id);
    return true;
  }).sort((a, b) => Number(a.id) - Number(b.id) || String(a.id).localeCompare(String(b.id))).slice(0, limit);
}

function getCursorPage(state) {
  const page = Number(state?.inbox_scheduler?.page);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function nextCursorPage(currentPage, fetchedCount, pageSize = PAGE_SIZE) {
  if (!Number.isSafeInteger(currentPage) || currentPage < 1) throw new Error('currentPage must be a positive integer');
  if (!Number.isInteger(fetchedCount) || fetchedCount < 0) throw new Error('fetchedCount must be a non-negative integer');
  if (!Number.isInteger(pageSize) || pageSize < 1) throw new Error('pageSize must be a positive integer');
  return fetchedCount < pageSize ? 1 : currentPage + 1;
}

function advanceCursor(state, currentPage, fetchedCount, nowUtc = new Date().toISOString()) {
  state.inbox_scheduler ||= {};
  state.inbox_scheduler.version = 1;
  state.inbox_scheduler.last_page = currentPage;
  state.inbox_scheduler.last_page_count = fetchedCount;
  state.inbox_scheduler.page = nextCursorPage(currentPage, fetchedCount, PAGE_SIZE);
  state.inbox_scheduler.updated_at_utc = nowUtc;
  return state.inbox_scheduler;
}

function recordIssueError(state, issueNumber, error, nowUtc = new Date().toISOString()) {
  state.inbox_scheduler ||= {};
  state.inbox_scheduler.issue_errors ||= {};
  const key = String(issueNumber);
  const reason = String(error?.message || error || 'unknown issue processing error').slice(0, 400);
  const previous = state.inbox_scheduler.issue_errors[key];
  state.inbox_scheduler.issue_errors[key] = {
    reason,
    count: previous && previous.reason === reason ? previous.count + 1 : 1,
    last_seen_at_utc: nowUtc
  };

  const entries = Object.entries(state.inbox_scheduler.issue_errors)
    .sort((a, b) => String(a[1]?.last_seen_at_utc || '').localeCompare(String(b[1]?.last_seen_at_utc || '')));
  while (entries.length > 50) {
    const [oldest] = entries.shift();
    delete state.inbox_scheduler.issue_errors[oldest];
  }
  return state.inbox_scheduler.issue_errors[key];
}

module.exports = {
  PAGE_SIZE,
  MAX_ISSUES_PER_BATCH,
  MAX_COMMANDS_PER_ISSUE,
  MAX_PENDING_RESPONSES_PER_ISSUE,
  isTaskIssue,
  selectIssueBatch,
  selectPendingCommandComments,
  getCursorPage,
  nextCursorPage,
  advanceCursor,
  recordIssueError
};
