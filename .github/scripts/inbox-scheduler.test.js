'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const inbox = require('./inbox-scheduler');

const task = number => ({ number, title: '[FARAST-TASK] Task ' + number, labels: [{ name: 'agent:task' }] });

test('event Issue is first, duplicate page entries are removed, and only task Issues are selected', () => {
  const eventIssue = task(30);
  const selected = inbox.selectIssueBatch({
    eventIssue,
    pageIssues: [task(30), task(12), { number: 8, title: 'ordinary issue', labels: [] }, { number: 9, title: 'pull request', pull_request: {}, labels: [] }, task(11)]
  });
  assert.deepEqual(selected.map(x => x.number), [30, 11, 12]);
});

test('issue batch is bounded even when the page and triggering Issue are both full', () => {
  const page = Array.from({ length: 25 }, (_, i) => task(i + 1));
  const selected = inbox.selectIssueBatch({ eventIssue: task(100), pageIssues: page });
  assert.equal(selected.length, inbox.MAX_ISSUES_PER_BATCH);
  assert.equal(selected[0].number, 100);
});

test('a noisy Issue drains only its oldest bounded command batch', () => {
  const comments = [
    { id: 12, body: '/farast heartbeat chat=x run=y token=1' },
    { id: 10, body: '/farast status' },
    { id: 11, body: '/farast claim chat=x run=y' },
    { id: 13, body: 'ordinary comment' },
    { id: 14, body: '/farast release chat=x run=y token=1' }
  ];
  const selected = inbox.selectPendingCommandComments(comments);
  assert.equal(inbox.MAX_COMMANDS_PER_ISSUE, 3);
  assert.deepEqual(selected.map(x => x.id), [10, 11, 12]);
});

test('coordinator events are isolated by Issue and shared registry writes use non-force CAS', () => {
  const workflowPath = path.join(__dirname, '..', 'workflows', 'farast-coordinator.yml');
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  assert.ok(workflow.includes('group: farast-control-plane-${{ github.event.issue.number || github.event.number || github.event_name }}'));
  assert.ok(workflow.includes('cancel-in-progress: false'));
  assert.ok(workflow.includes('force: false'));
  assert.match(workflow, /registry_cas_conflict/);
  assert.match(workflow, /durable inbox.*replay|durable comment inbox/i);
});

test('replayed command comments are excluded by durable operation identity', () => {
  const comments = [
    { id: 10, body: '/farast status' },
    { id: 11, body: '/farast progress' },
    { id: 12, body: '/farast status' }
  ];
  const selected = inbox.selectPendingCommandComments(comments, { '10': { response_posted: true } }, 10);
  assert.deepEqual(selected.map(x => x.id), [11, 12]);
});

test('same comment ID is selected only once even if duplicate webhook data is supplied', () => {
  const duplicate = { id: 10, body: '/farast status' };
  const selected = inbox.selectPendingCommandComments([duplicate, duplicate], {}, 10);
  assert.deepEqual(selected.map(x => x.id), [10]);
});

test('cursor advances deterministically and wraps after the final partial page', () => {
  assert.equal(inbox.getCursorPage({}), 1);
  assert.equal(inbox.nextCursorPage(1, 25, 25), 2);
  assert.equal(inbox.nextCursorPage(2, 25, 25), 3);
  assert.equal(inbox.nextCursorPage(3, 7, 25), 1);
  assert.equal(inbox.nextCursorPage(1, 0, 25), 1);
});

test('cursor state survives restart and records the completed page boundary', () => {
  const state = {};
  inbox.advanceCursor(state, 4, 25, '2026-11-18T07:00:00.000Z');
  assert.equal(inbox.getCursorPage(state), 5);
  assert.deepEqual(state.inbox_scheduler, {
    version: 1,
    last_page: 4,
    last_page_count: 25,
    page: 5,
    updated_at_utc: '2026-11-18T07:00:00.000Z'
  });
  inbox.advanceCursor(state, 5, 3, '2026-11-18T07:05:00.000Z');
  assert.equal(inbox.getCursorPage(state), 1);
});

test('issue processing errors are isolated, counted, and bounded for audit', () => {
  const state = {};
  inbox.recordIssueError(state, 42, new Error('bad Work Item'), '2026-11-18T07:00:00.000Z');
  assert.deepEqual({
    version: state.inbox_scheduler.version,
    page: state.inbox_scheduler.page,
    last_page: state.inbox_scheduler.last_page,
    last_page_count: state.inbox_scheduler.last_page_count,
    updated_at_utc: state.inbox_scheduler.updated_at_utc
  }, {
    version: 1, page: 1, last_page: 1, last_page_count: 0,
    updated_at_utc: '2026-11-18T07:00:00.000Z'
  });
  inbox.recordIssueError(state, 42, new Error('bad Work Item'), '2026-11-18T07:05:00.000Z');
  assert.deepEqual(state.inbox_scheduler.issue_errors['42'], {
    reason: 'bad Work Item',
    count: 2,
    last_seen_at_utc: '2026-11-18T07:05:00.000Z'
  });
  for (let n = 1; n <= 60; n++) {
    inbox.recordIssueError(state, n, new Error('issue ' + n), '2026-11-18T08:' + String(n).padStart(2, '0') + ':00.000Z');
  }
  assert.equal(Object.keys(state.inbox_scheduler.issue_errors).length, 50);
  assert.ok(state.inbox_scheduler.issue_errors['60']);
});

test('a bounded issue page lets other Issues progress despite a noisy command source', () => {
  const selectedIssues = inbox.selectIssueBatch({ pageIssues: [task(1), task(2), task(3)] });
  const pendingByIssue = {
    1: [{ id: 1, body: '/farast status' }, { id: 2, body: '/farast status' }, { id: 3, body: '/farast status' }],
    2: [{ id: 4, body: '/farast claim chat=b run=b' }],
    3: [{ id: 5, body: '/farast progress' }]
  };
  const processed = selectedIssues.map(issue => ({
    issue: issue.number,
    comments: inbox.selectPendingCommandComments(pendingByIssue[issue.number], {}, inbox.MAX_COMMANDS_PER_ISSUE).map(x => x.id)
  }));
  assert.deepEqual(processed, [
    { issue: 1, comments: [1] },
    { issue: 2, comments: [4] },
    { issue: 3, comments: [5] }
  ]);
});

test('a command on another Issue is included when a different Issue triggers reconciliation', () => {
  const selected = inbox.selectIssueBatch({
    eventIssue: task(90),
    pageIssues: [task(89), task(90)]
  });
  assert.deepEqual(selected.map(x => x.number), [90, 89]);
  const pendingOnOtherIssue = inbox.selectPendingCommandComments(
    [{ id: 700, body: '/farast status' }],
    {},
    inbox.MAX_COMMANDS_PER_ISSUE
  );
  assert.deepEqual(pendingOnOtherIssue.map(x => x.id), [700]);
});

test('a cancelled run replays its page without reapplying an already committed command', () => {
  const state = { inbox_scheduler: { version: 1, page: 2 } };
  const comments = [
    { id: 20, body: '/farast status' },
    { id: 21, body: '/farast progress' }
  ];
  const firstAttempt = inbox.selectPendingCommandComments(comments, {}, 1);
  assert.deepEqual(firstAttempt.map(x => x.id), [20]);

  // Simulate a crash after the operation ledger commit but before cursor advancement.
  const processedOperations = { '20': { response_posted: false, issue_number: 89 } };
  assert.equal(inbox.getCursorPage(state), 2);
  const replayAttempt = inbox.selectPendingCommandComments(comments, processedOperations, 1);
  assert.deepEqual(replayAttempt.map(x => x.id), [21]);
  assert.equal(inbox.getCursorPage(state), 2);

  inbox.advanceCursor(state, 2, 25, '2026-11-18T07:45:00.000Z');
  assert.equal(inbox.getCursorPage(state), 3);
});

