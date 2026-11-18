# Legacy WRITE_ALLOWED Work Item Scope Migration Report

**Observed:** 2026-11-18 (UTC)  
**Current main baseline:** `e26bf2d5b48e8fdcdf16755a86e8901f1999aa31`  
**Work Item:** `WI-LEGACY-WRITE-SCOPE-MIGRATION-001` (Issue #68)  
**Current run:** `RUN-20261118-LEGACY-SCOPE-MIGRATION-006`  
**Fencing token:** `121`  
**Branch:** `work/GH-68-RUN-20261118-LEGACY-SCOPE-MIGRATION-006`

## 1. Scope and recovery lineage

The prior run recorded S0–S4 and migrated the issue-body metadata. Its advertised branch `work/GH-68-RUN-20261118-LEGACY-SCOPE-MIGRATION-005` was not present in GitHub and had no PR or pushed commit. The previous run therefore had no unmerged source commit to preserve. Its completed Issue-body and registry changes were read back and retained. This fresh branch was created from the current main baseline above; no historical branch was overwritten or force-pushed.

The first post-fix claim attempt on Issue #68 succeeded with the unchanged stable ID. A second chat using a different CHAT_ID attempted to claim the same Issue while token 121 held its resource locks and was denied. A disjoint Work Item (Issue #84, core/test resources) was concurrently claimable by a different chat. This is live evidence of same-resource exclusion and disjoint-resource parallelism.

## 2. Migration target inventory

The original migration target set is exactly Issues **#11, #43, #44, #47, #50, #51, #52 and #58**. Live read-back confirms that every one has an explicit `operation_scope_version: "1.0"` and a non-empty `requested_operations` array.

| Issue | Stable Work Item ID | Write policy | operation_scope_version | requested_operations | Registry state |
|---:|---|---|---|---|---|
| #11 | `WI-GOAL-ALLOCATOR-001` | WRITE_ALLOWED | 1.0 | `control_plane_write` | READY |
| #43 | `WI-PROMPT-AUTORUN-001` | WRITE_ALLOWED | 1.0 | `control_plane_write` | REVIEW_REQUIRED |
| #44 | `WI-READONLY-ROUTING-001` | WRITE_ALLOWED | 1.0 | `control_plane_write` | REVIEW_REQUIRED |
| #47 | `WI-PROMPT-INTEGRATION-001` | WRITE_ALLOWED | 1.0 | `control_plane_write` | IN_PROGRESS |
| #50 | `WI-PROMPT-ENTRY-GUIDE-SYNC-001` | WRITE_ALLOWED | 1.0 | `control_plane_write` | BLOCKED |
| #51 | `WI-NON-IMPLEMENTATION-VERTICAL-SLICE-001` | WRITE_ALLOWED | 1.0 | `product_implementation` | REVIEW_REQUIRED |
| #52 | `WI-NON-WRITE-POLICY-COORDINATOR-001` | WRITE_ALLOWED | 1.0 | `control_plane_write` | REVIEW_REQUIRED |
| #58 | `WI-PR16-SPEC-REPAIR-001` | WRITE_ALLOWED | 1.0 | `control_plane_write` | IN_PROGRESS |

Issue #51 remains the only listed Work Item targeting `a4adelahmadian86-wq/non`; its `owner_approval_ref` remains present and its operation remains exactly `product_implementation`. No product repository file, branch, commit, PR, data or deployment was modified by this migration.

## 3. Extended live open-task inventory

A live search of 40 open task-labelled Issues found 12 explicitly `WRITE_ALLOWED` records. In addition to the original eight above:

| Issue | Stable Work Item ID | Scope | Registry note |
|---:|---|---|---|
| #68 | `WI-LEGACY-WRITE-SCOPE-MIGRATION-001` | 1.0 / `control_plane_write` | CLAIMED under token 121 |
| #81 | `WI-ISSUE-SPEC-EXTRACTION-REPAIR-001` | 1.0 / `control_plane_write` | CLAIMED by a separate chat |
| #84 | `WI-SEMANTIC-DEDUP-DELIVERABLE-SCOPE-001` | 1.0 / `control_plane_write` | PR #86 merged; separate chat is completing acceptance |
| #85 | `WI-SEMANTIC-DUPLICATE-DELIVERABLE-SCOPE-001` | 1.0 / `control_plane_write` | Duplicate candidate of #84; no registry Work Item entry and no active lock |

Issue #85 is not counted as an independent migration target: it was created as a second task for the same semantic-duplicate fix, has overlapping source/module resources with #84, and has already been identified in its comments as superseded by #84. Its scope is versioned, but no duplicate implementation is authorized or performed here.

The remaining open task-labelled Issues are not explicit `WRITE_ALLOWED` records. Explicit `READ_ONLY` Work Items remain analysis-only. Legacy smoke fixtures #5, #7, #8 and #9 have no explicit `write_policy`; the current validator rejects a missing write policy rather than granting write authority. They are outside the eight-item WRITE_ALLOWED migration set and must not be treated as write-authorized.

## 4. Registry and policy verification

- The eight original target Issues and the current Issue #68 body carry the same stable Work Item IDs, policy, operation-scope version and requested operation as their registry entries.
- #51 retains its owner authorization reference and product-only operation scope.
- The other seven original targets request only `control_plane_write`.
- No migration changed stable IDs, target repositories, write policies, owner approvals, resource keys, dependencies, steps, acceptance criteria, status or PR lineage.
- No READ_ONLY task was upgraded to a write policy.
- The semantic duplicate false-positive caused by local D1/D2 labels was corrected in merged PR #86; exact-head CI run `44249107014` passed. A second unique chat's same-Issue claim was denied while this run held the lock.

## 5. Regression evidence and remaining work

The merged PR #86 exact-head Control Plane Validation includes the Work Item core tests, operation-scope/fail-closed checks, local deliverable-ID false-positive regression, true semantic-overlap positive case, stable-ID collision checks and canonical Issue #14 → #66 alias checks.

**S5_REGRESSION:** The migration matrix and registry read-back are complete. The exact-head CI run above is green. The current Issue #68 claim succeeded after the semantic fix, demonstrating that the false-positive duplicate list is gone without editing Issue #68's identity or scope.

**S6_VERIFY_HANDOFF:** This report is the auditable migration record. The remaining step is to read back the report from the branch, open a focused PR, run exact-head Control Plane Validation, and hand off through `/farast review` and `/farast accept`.

## 6. Explicit limitations

- This inventory is a snapshot of 40 open task-labelled Issues at the observation time; newly created tasks must continue to pass the same live scope/registry checks.
- A successful claim and CI simulation do not prove real ChatGPT account creation or background execution.
- The report does not authorize product writes. Issue #51 remains separately gated by its exact owner authorization and product operation scope.
- The duplicate candidate Issue #85 remains open but unregistered; it is not to be claimed or implemented independently of canonical Issue #84.
