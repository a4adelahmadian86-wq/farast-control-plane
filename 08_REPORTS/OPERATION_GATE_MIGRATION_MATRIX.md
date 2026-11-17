# FARAST Operational Gate Migration Matrix

**Work Item:** WI-OPERATION-GATE-MODEL-001 (Issue #64)  
**Source snapshot:** main `726ea7a9f80f910a2538bb8e99563193854c255e`  
**Target:** farast-control-plane only  
**Product repository:** no writes, branches, commits, database changes or deployments performed.

## Finding

The v1 dependency evaluator correctly fails closed when a `hard_gates` value is not an EXP ID. However, the canonical graph currently mixes two different concepts:

1. Cross-EXP prerequisites that must be ACCEPTED before another EXP can proceed.
2. Operational gates that apply only when a particular action is requested (for example, a destructive data change, migration, authorization change, merge or production release).

Because the evaluator applies every `hard_gates` entry to the entire Work Item, discovery and planning tasks are blocked by gates for later operations. This is not a safe or usable model.

## Source-backed gate inventory

| EXP | Current `hard_gates` entry | Classification | Evidence-backed disposition |
|---|---|---|---|
| EXP-02 | `destructive-data-change` | Action gate | Move to action-scoped destructive-data-change gate; backup/restore discovery itself remains READ_ONLY |
| EXP-02 | `EXP-26` | Cross-EXP direction appears inverted | Remove as a prerequisite of backup discovery; expose EXP-02 as a prerequisite of the production-release operation only |
| EXP-06 | `EXP-22` | Cross-EXP gate blocks test discovery | Move EXP-22 to soft context; EXP-06 discovery/testing evidence can inform readiness |
| EXP-10 | `EXP-22` | Cross-EXP gate blocks current-architecture discovery | Move EXP-22 to soft context; current architecture discovery can inform readiness |
| EXP-11 | `database-migration` | Action gate | Apply only to a requested database-migration operation; require accepted data-model and backup evidence |
| EXP-12 | `authorization-change` | Action gate | Apply only to an authorization-change operation; require accepted identity/permission assessment and owner authorization |
| EXP-13 | `security-sensitive-change` | Action gate | Apply only to a security-sensitive write; require accepted security/privacy evidence and owner authorization |
| EXP-14 | `audit-log-change` | Action gate | Apply only to audit-log mutation; require accepted audit-integrity evidence and owner authorization |
| EXP-15 | `architecture-implementation` | Action gate | Target-architecture discovery/design remains independent; actual implementation is gated |
| EXP-16 | `hosting-specific-deployment` | Action gate | Hosting inventory/planning remains independent; deployment requires hosting, migration and release evidence |
| EXP-17 | `destructive-data-change`, `production-release` | Action gates | Keep both as operation-specific gates; data-transition planning is not itself a destructive change |
| EXP-18 | `production-release` | Action gate | Monitoring/operations analysis remains independent; production release is gated |
| EXP-19 | `legal-policy-change` | Action gate | Legal/policy analysis remains independent; a policy change requires explicit owner authorization and evidence |
| EXP-21 | `implementation` | Action gate | Prioritization/package preparation is analysis; product implementation is a separate requested operation |
| EXP-22 | `implementation` | Action gate | Readiness/proposal work must be claimable; a product implementation operation remains owner-authorized and scoped |
| EXP-23 | `merge` | Action gate | Regression/compatibility analysis can run before merge; merge itself retains exact-head automated CI and branch-bound handoff |
| EXP-24 | `acceptance` | Action gate | Acceptance is evaluated by the coordinator only when the accept operation is invoked |
| EXP-25 | `security-acceptance` | Action gate | Security acceptance requires accepted security/privacy, audit and regression evidence |
| EXP-26 | `production-release` | Action gate | Release planning/readiness analysis is not a production release; the release operation has its own prerequisites |

The decomposition maps EXP-02 to backup/restore readiness, EXP-06 to evidence-based testing, EXP-10 to current architecture, EXP-15 to target architecture, EXP-22 to implementation readiness, EXP-23 to regression validation, and EXP-24/25/26 to acceptance/security acceptance/production release. Issue #51 explicitly limits its first owner-authorized NON implementation slice: no destructive migration, production release, payment/wallet, authorization, legal/privacy policy or external paid-service action. Issue #52 defines the narrow owner-created Issue authorization exception. These sources support action-scoped rather than blanket EXP gates.

## Proposed v2 contract

- `hard_gates` contains only canonical `EXP-NN` IDs. Every referenced EXP must resolve to exactly one ACCEPTED Work Item; missing/ambiguous/unaccepted references fail closed.
- Operational gate identifiers move to a typed `operation_gates` registry. Each definition declares an operation name, applicable EXP scope, prerequisite EXP IDs, whether owner authorization is required, and the evidence expected.
- Work Items may declare `requested_operations`. If absent, the safe compatibility defaults are:
  - READ_ONLY: `analysis`;
  - WRITE_REQUIRES_OWNER_APPROVAL: `proposal_only`;
  - WRITE_ALLOWED targeting the control-plane: `control_plane_write`;
  - WRITE_ALLOWED targeting NON: `product_implementation`, and the existing exact owner-created Issue authorization rule still applies.
- Analysis, discovery and proposal operations do not inherit gates for future writes/releases. Unknown requested operations, unknown gate IDs, missing prerequisites or missing required owner authorization fail closed for that operation.
- The coordinator checks operation gates during Work Item eligibility/claim, refresh, unblock/reopen and acceptance. The existing READ_ONLY branchless acceptance path and the WRITE_ALLOWED exact-head CI/branch-bound PR acceptance path remain intact.
- No operation gate introduces a second human reviewer. Owner authorization remains the only human decision where the Work Item policy explicitly requires it; all other acceptance checks remain machine-verifiable.

## Conservative prerequisite mapping for operation execution

| Requested operation | Required accepted EXP evidence | Additional machine checks |
|---|---|---|
| `product_implementation` | No blanket EXP prerequisite; task must itself define a bounded scope and safety criteria | Exact owner-created Issue, `WRITE_ALLOWED`, matching `owner_approval_ref`, fresh claim/lease/fencing, rollback and regression evidence |
| `destructive_data_change` | EXP-02 | Owner authorization, verified backup/restore, rollback plan and explicit destructive scope |
| `database_migration` | EXP-11 and EXP-02 | Owner authorization, compatibility and rollback evidence |
| `authorization_change` | EXP-12 | Owner authorization and server-side authorization regression evidence |
| `security_sensitive_change` | EXP-13 and EXP-14 | Owner authorization and security/privacy regression evidence |
| `audit_log_change` | EXP-14 | Owner authorization and audit-integrity evidence |
| `architecture_implementation` | EXP-15 | Owner authorization and architecture/rollback evidence |
| `hosting_deployment` | EXP-16, EXP-17 and EXP-18 | Owner authorization, backup/rollback and monitoring evidence |
| `legal_policy_change` | EXP-19 | Owner decision and source-backed legal/policy evidence; unknown legal conclusions remain UNKNOWN |
| `merge` | EXP-22 and EXP-23 when the operation belongs to those EXPs | Exact-head successful checks and matching branch-bound review handoff; no second human reviewer |
| `acceptance` | EXP-23 when the operation belongs to EXP-24 | All required step/criterion evidence, no active lease, matching review handoff |
| `security_acceptance` | EXP-13, EXP-14 and EXP-23 | Security/audit evidence and machine-verifiable acceptance |
| `production_release` | EXP-02, EXP-17, EXP-18, EXP-23, EXP-24 and EXP-25 | Owner authorization, rollback, monitoring and exact release evidence |

The prerequisite table is deliberately action-scoped. It does not make any of these EXPs a blanket gate for unrelated analysis. Where a future operation has no authoritative evidence or an unknown legal/security condition, that operation remains blocked; discovery and documentation may continue.

## Compatibility notes

- EXP-01 remains independent after PR #60/#61; its baseline report is accepted by the machine-only READ_ONLY path.
- Issue #51 remains the only owner-authorized NON `WRITE_ALLOWED` Work Item. Existing READ_ONLY Work Items #13–#39 are not upgraded.
- Issue #58's control-plane metadata repair is not a product implementation operation and must not be blocked by the `implementation` action gate.
- Issue #34 (EXP-22 readiness) and Issue #35 (EXP-23 regression) are READ_ONLY analysis tasks; their prior blanket blockers are evidence of this defect, not proof that the underlying operations are authorized.
- PR #63 and PR #65 implement/verify READ_ONLY evidence acceptance; those protections must not be weakened by this gate-model change.

## Explicit non-actions

No changes have been made to NON, its database, product branches, deployments, payments, authorization rules, privacy/legal policies or production state. This report is an analysis artifact on the control-plane Work Item branch only.
