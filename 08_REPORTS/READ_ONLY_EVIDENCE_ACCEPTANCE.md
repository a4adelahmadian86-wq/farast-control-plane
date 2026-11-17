# READ_ONLY Evidence-Only Acceptance — Implementation and Handoff

**Work Item:** WI-READONLY-EVIDENCE-ACCEPTANCE-001 (Issue #62)  
**Observation time:** 2026-11-17 UTC  
**Target:** farast-control-plane only  
**Product repository:** NON remained READ_ONLY throughout this Work Item.

## Implemented policy

A Work Item with `write_policy=READ_ONLY` may be accepted without a product-repository PR or branch only when all of the following are true:

1. The live Work Item schema validates.
2. Every required step and acceptance criterion has validation status PASS and at least one evidence reference.
3. All genuine canonical hard gates are satisfied.
4. A matching `/farast review` handoff exists for the same Issue and target repository, with `branch=null`.
5. No active lease remains when acceptance is evaluated.

The coordinator rejects missing or malformed Work Item specifications, missing evidence, failed/incomplete criteria, unresolved hard gates, active leases, mismatched handoff Issue/target, and any branch allocated to a READ_ONLY handoff. The evidence-only evaluator rejects every non-READ_ONLY policy.

Write-capable Work Items retain the existing PR, exact-head successful CI, branch-bound review handoff, hard-gate, and owner-authorization requirements. No second human reviewer or signoff is required; automated checks remain fail-closed.

## Implementation and verification evidence

- PR #63: https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/63
- Merged commit: `c35cc74b42f2934974fa4d33b12202f05a4857ff`
- PR head tested: `8ff6f5296a5de3c26d958885a2d6c795717d52a3`
- Exact-head Control Plane Validation: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/44060310384 — conclusion SUCCESS.
- The initial syntax-check failure on earlier head `46d783353aa7b9dcda522ef0dd6d5ad1aeb3281f` was corrected in later commits; it is not the final tested head.
- Regression coverage includes valid evidence-only READ_ONLY acceptance, active-lease rejection, rejection of write-capable policies, mismatched review handoff, branch allocation rejection, unsatisfied hard gates, and incomplete evidence.
- The final PR was merged by the coordinator's automated acceptance flow. No human review was requested.

## READ_ONLY end-to-end follow-up

Issue #13 (`WI-EXP01-BASELINE-001`) already contains the baseline evidence package:
- 7/7 required steps PASS;
- 5/5 acceptance criteria PASS;
- D1 report, D2 machine-readable facts JSON, D3 environment/release map and D4 known-unknown/risk register are recorded in Issue #13 comment https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/13#issuecomment-6944359408.
- Progress read-back: https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/13#issuecomment-6944491507.
- The prior READ_ONLY handoff was correctly recorded with `branch=null`; no product branch, file, PR, CI setting, database or production data was changed by that Work Item.
- The previous acceptance attempt predated this fix and failed because the old coordinator required a merged PR and branch-bound review. The Issue #13 Work Item must now be freshly claimed, its existing evidence re-read, and the machine-only acceptance path exercised. Do not recreate its evidence or write to NON.

## Scope and safety

This implementation changes only the FARAST control-plane coordinator and tests. It does not grant new product write permission, does not weaken the owner-created Work Item requirement for NON writes, and does not bypass lease/fencing or cross-EXP hard gates.

## Handoff

The remaining action for the baseline stream is to re-claim Issue #13 under a fresh RUN_ID, verify the persisted 7/7 and 5/5 evidence, record a fresh REVIEW handoff with `branch=null`, release the lease, then issue `/farast accept` without a `pr=` argument. The coordinator must accept and close Issue #13 only if every machine gate passes.
