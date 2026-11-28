# فهرست زنده وظایف FARAST — snapshot 2026-11-25T06:11:05Z

> **مرجع حقیقت:** GitHub Issues و پاسخ‌های Coordinator؛ این فایل فقط نمایه است. هر وضعیت از snapshot زنده زیر استخراج شده است و باید در هر refresh مجدداً خوانده شود.
> **Control-plane main:** `f50f6b184e1baa61fd4a5bafc4f020b495b3ff88`.
> **روش:** REST API تمام Issueها در دو صفحه (۱ و ۲) خوانده شد؛ PRها جداگانه از endpoint PR خوانده شدند. WID فقط از فیلد `work_item_id` در JSON مشخصات یا سربرگ پایدار استخراج شد، نه از متن provenance.

## خلاصه inventory

- GitHub Issues: **70** کل؛ **40 OPEN** و **30 CLOSED**.
- شناسه‌های پایدار Work Item: **67 یکتا**؛ شناسه تکراری در این snapshot یافت نشد.
- سه Issue بدون WID: #108 (draft superseded)، #3 و #2 (legacy parent records، غیرقابل claim به‌عنوان leaf).
- وضعیت label در Issueهای باز: READY=26، LOCKED=1، REVIEW=8، BLOCKED=3؛ دو Issue legacy (#3/#2) بدون label اجرایی‌اند.
- **استثنای مهم:** Issue #14 در GitHub هنوز OPEN و دارای label `agent:ready` است، اما طبق سابقه صریح مالک و comment همان Issue، superseded توسط Issue #66 است؛ در این index به‌درستی `SUPERSEDED` طبقه‌بندی شده و نباید claim یا دوباره فعال شود.
- Issue #108 draft superseded به #109 است و فقط برای تاریخچه نگه داشته می‌شود.
- G-09: **30** Issue؛ 10 باز و 20 بسته. در میان G-09 باز: READY=4, LOCKED=1, REVIEW=3, BLOCKED=2.
- Pull Requests: **67** کل؛ 4 باز، 47 ادغام‌شده، 16 بسته بدون merge.
- PRهای باز: [#134](https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/134), [#132](https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/132), [#129](https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/129), [#127](https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/127).
- PR #131 بسته و بدون merge است؛ PR #132 و #134 جایگزین‌های فعال CP-07 هستند. PR #1 ادغام شده است.

## فهرست همه Issueها

| Issue | WORK_ITEM_ID | Parent Goals | Parent EXPs | Parent CPs | وضعیت FARAST | GitHub | عنوان | توضیح |
|---|---|---|---|---|---|---|---|---|
| [#137](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/137) | `WI-CP06-FEEDBACK-TRACE-001` | G-09 | EXP-01 | CP-06 | **READY** | OPEN | [FARAST-TASK] CP-06 owner feedback to decision and outcome traceability | Independent CP-06 leaf; READY |
| [#136](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/136) | `WI-CP05-REGISTER-SYNC-001` | G-09 | EXP-01 | CP-05 | **CLAIMED** | OPEN | [FARAST-TASK] CP-05 reporting register synchronization and anti-drift validation | Active RUN 01; branch work/GH-136-RUN-PR07-G09-CP05-REGISTER-SYNC-20261125-01; token 210 |
| [#135](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/135) | `WI-CP05-06-REPORT-FEEDBACK-TRACE-AUDIT-001` | G-09 | EXP-01 | CP-05,CP-06 | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Audit CP-05 reporting evidence and CP-06 owner-feedback traceability | — |
| [#133](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/133) | `WI-CP07-AGGREGATION-CI-COVERAGE-001` | G-09 | EXP-01 | CP-07 | **REVIEW** | OPEN | [FARAST-TASK] Add conditional CI execution for CP-07 parent aggregation regression tests | — |
| [#130](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/130) | `WI-CP07-PARENT-AGGREGATION-ENGINE-001` | G-09 | EXP-01 | CP-07 | **READY** | OPEN | [FARAST-TASK] CP-07 evidence-backed parent goal and CP aggregation engine | — |
| [#128](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/128) | `WI-CP07-GOAL-PROGRESS-AGGREGATION-001` | G-09 | EXP-01 | CP-07 | **BLOCKED** | OPEN | [FARAST-TASK] Audit CP-07 goal hierarchy and evidence-backed progress aggregation | — |
| [#126](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/126) | `WI-EXP03-CATALOG-ARTIFACT-REMEDIATION-001` | G-01 | EXP-03 | — | **REVIEW** | OPEN | [FARAST-TASK] EXP-03 Capability catalog artifact remediation and completeness | — |
| [#119](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/119) | `WI-COORDINATOR-STAGED-ACCEPTANCE-BOOTSTRAP-001` | G-09 | EXP-01 | CP-02,CP-03,CP-04 | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Bootstrap two-phase coordinator acceptance and least-privilege ruleset verification | — |
| [#115](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/115) | `WI-EDITOR-AUTOSAVE-INFLIGHT-RACE-001` | G-00,G-04,G-05,G-08 | EXP-22,EXP-23 | — | **BLOCKED** | OPEN | [FARAST-TASK] Prevent Editor autosave responses from clearing newer in-flight edits | — |
| [#113](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/113) | `WI-CP-BRANCH-RULESET-GATE-001` | G-09 | EXP-01 | CP-03 | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Require active PR-only rulesets and no bypass before coordinator merge | — |
| [#111](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/111) | `WI-CP-CROSSREPO-TOKEN-SCOPE-001` | G-09 | EXP-01 | CP-03 | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Correct and regression-test cross-repository PR acceptance token permissions | — |
| [#109](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/109) | `WI-NON-PER-REQUEST-AUTH-PROMPT-FIX-002` | G-09,G-08 | EXP-21,EXP-22,EXP-23 | CP-02,CP-03,CP-04,CP-08 | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Make explicit per-request NON authorization executable in fresh chats | — |
| [#108](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/108) | `—` | — | — | — | **SUPERSEDED** | CLOSED | Superseded draft — authorization prompt Work Item (see Issue #109) | Superseded draft; see canonical Issue #109 |
| [#107](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/107) | `WI-BLOCKED-WORKITEM-REVALIDATION-001` | G-09 | EXP-01 | CP-02,CP-03,CP-04 | **REVIEW** | OPEN | [FARAST-TASK] Repair coordinator command replay and revalidation for corrected blocked Work Items | — |
| [#106](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/106) | `WI-DOC-LOCK-PROMPT-CATALOG-SYNC-001` | G-09 | EXP-01 | CP-02,CP-03,CP-04 | **BLOCKED** | OPEN | [FARAST-TASK] Remove stale coordinator lock guidance and align prompt catalog with bundle 2.0.1 | — |
| [#100](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/100) | `WI-LOCK-SCOPE-ISOLATION-001` | G-09 | EXP-01 | CP-02,CP-03,CP-04 | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Repair multi-chat identity and granular resource-lock isolation | — |
| [#90](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/90) | `WI-CP-ALLOCATOR-CHAT-GATE-001` | G-09 | EXP-01 | - Expected output | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Enforce allocator provenance and one active lease per chat | — |
| [#89](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/89) | `WI-CP-GLOBAL-INBOX-FAIRNESS-001` | G-09 | EXP-01 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Implement global fair replay for the durable command inbox | — |
| [#85](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/85) | `WI-SEMANTIC-DUPLICATE-DELIVERABLE-SCOPE-001` | G-09 | EXP-21,EXP-23 | — | **READY** | OPEN | [FARAST-TASK] Fix false-positive semantic duplicate detection for generic deliverable identifiers | — |
| [#84](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/84) | `WI-SEMANTIC-DEDUP-DELIVERABLE-SCOPE-001` | G-09 | EXP-01 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Prevent false semantic duplicate detection from local deliverable IDs | — |
| [#81](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/81) | `WI-ISSUE-SPEC-EXTRACTION-REPAIR-001` | G-09 | EXP-01,EXP-22,EXP-23 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Repair Issue #67 Work Item JSON extraction and preserve prompt-dispatch lineage | — |
| [#77](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/77) | `WI-LEGACY-WRITE-SCOPE-COMPAT-001` | G-00,G-09 | EXP-01 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Preserve accepted legacy Work Item operation scope and bounded coordinator replay | — |
| [#69](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/69) | `WI-COORDINATOR-LEASE-EXPIRY-FAIL-CLOSED-001` | G-09 | EXP-01,EXP-26 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Fail closed on malformed active lease expiry in coordinator | — |
| [#68](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/68) | `WI-LEGACY-WRITE-SCOPE-MIGRATION-001` | G-09 | EXP-01,EXP-22,EXP-23 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Migrate legacy write-enabled Work Items to versioned operation scope | — |
| [#67](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/67) | `WI-PROMPT-OPERATION-SCOPE-001` | G-09 | EXP-01,EXP-21,EXP-23,EXP-26 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Synchronize operation-scope contract across all prompts and prove N-chat dispatch | — |
| [#66](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/66) | `WI-EXP02-BACKUP-RECOVERY-001` | G-01,G-07 | EXP-02 | — | **REVIEW** | OPEN | [FARAST-TASK] EXP-02 backup, data durability and disaster-recovery assessment | — |
| [#64](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/64) | `WI-OPERATION-GATE-MODEL-001` | G-00,G-09 | EXP-01,EXP-02,EXP-11,EXP-12,EXP-13,EXP-14,EXP-15,EXP-16,EXP-17,EXP-18,EXP-19,EXP-21,EXP-22,EXP-23,EXP-24,EXP-25,EXP-26 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Separate cross-EXP dependencies from action-scoped operational gates | — |
| [#62](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/62) | `WI-READONLY-EVIDENCE-ACCEPTANCE-001` | G-00,G-09 | EXP-01,EXP-24,EXP-27 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Enable machine-only evidence acceptance for READ_ONLY Work Items | — |
| [#59](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/59) | `WI-PROMPT-ORDER-DEPENDENCY-REPAIR-001` | G-00,G-09 | EXP-01 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Implement approved prompt priority order and repair dependency/refresh semantics | — |
| [#58](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/58) | `WI-PR16-SPEC-REPAIR-001` | G-00,G-08 | EXP-22,EXP-23 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Repair deep Work Item schema compatibility for EXP-22/EXP-23 | — |
| [#52](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/52) | `WI-NON-WRITE-POLICY-COORDINATOR-001` | G-00,G-08 | EXP-22 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Enable narrowly owner-authorized NON product Work Items | — |
| [#51](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/51) | `WI-NON-IMPLEMENTATION-VERTICAL-SLICE-001` | G-00,G-04,G-05,G-08 | EXP-22,EXP-23 | — | **REVIEW** | OPEN | [FARAST-TASK] NON first owner-authorized implementation vertical slice | — |
| [#50](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/50) | `WI-PROMPT-ENTRY-GUIDE-SYNC-001` | G-09 | EXP-01 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Synchronize official execution guide with canonical prompt bundle 2.0.1 | — |
| [#47](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/47) | `WI-PROMPT-INTEGRATION-001` | G-09 | EXP-21,EXP-23,EXP-26 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Integrate deep prompt standard, READ_ONLY routing and autonomous Work Item selection | — |
| [#44](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/44) | `WI-READONLY-ROUTING-001` | G-09 | EXP-01 | — | **REVIEW** | OPEN | [FARAST-TASK] Enforce READ_ONLY repository isolation in coordinator branch routing | — |
| [#43](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/43) | `WI-PROMPT-AUTORUN-001` | G-09 | EXP-01 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] Autonomous specialist-prompt bootstrap, queue selection and execution | — |
| [#39](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/39) | `WI-EXP27-MONITORING-IMPROVEMENT-001` | G-08 | EXP-27 | — | **READY** | OPEN | [FARAST-TASK] EXP-27 Monitoring, metrics and continuous improvement | — |
| [#38](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/38) | `WI-EXP26-CONTROLLED-RELEASE-001` | G-07 | EXP-26 | — | **READY** | OPEN | [FARAST-TASK] EXP-26 Controlled release readiness | — |
| [#37](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/37) | `WI-EXP25-SECURITY-RESILIENCE-001` | G-06,G-08 | EXP-25 | — | **READY** | OPEN | [FARAST-TASK] EXP-25 Security and resilience verification plan | — |
| [#36](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/36) | `WI-EXP24-PRODUCT-ACCEPTANCE-001` | G-02,G-04,G-05,G-08 | EXP-24 | — | **READY** | OPEN | [FARAST-TASK] EXP-24 Product acceptance criteria and user validation | — |
| [#35](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/35) | `WI-EXP23-REGRESSION-001` | G-04,G-05,G-08 | EXP-23 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] EXP-23 Regression and compatibility validation | — |
| [#34](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/34) | `WI-EXP22-CONTROLLED-IMPLEMENTATION-001` | G-00 | EXP-22 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] EXP-22 Controlled implementation readiness and proposal | — |
| [#33](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/33) | `WI-EXP21-CHANGE-PACKAGE-001` | G-08 | EXP-21 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] EXP-21 Change package and acceptance specification | — |
| [#32](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/32) | `WI-EXP20-PRIORITIZATION-001` | G-08 | EXP-20 | — | **READY** | OPEN | [FARAST-TASK] EXP-20 Evidence-based prioritization framework | — |
| [#31](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/31) | `WI-EXP19-GOVERNANCE-LEGAL-001` | G-06 | EXP-19 | — | **READY** | OPEN | [FARAST-TASK] EXP-19 Governance, delegation and legal review inventory | — |
| [#30](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/30) | `WI-EXP18-LOW-DISRUPTION-RELEASE-001` | G-07 | EXP-18 | — | **READY** | OPEN | [FARAST-TASK] EXP-18 Low-disruption deployment and rollback strategy | — |
| [#29](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/29) | `WI-EXP17-OPERATIONS-DR-001` | G-01,G-07 | EXP-17 | — | **READY** | OPEN | [FARAST-TASK] EXP-17 Operations, backup and disaster recovery | — |
| [#28](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/28) | `WI-EXP16-HOSTING-FEASIBILITY-001` | G-07 | EXP-16 | — | **READY** | OPEN | [FARAST-TASK] EXP-16 Hosting and deployment feasibility | — |
| [#27](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/27) | `WI-EXP15-TARGET-ARCHITECTURE-001` | G-03,G-05 | EXP-15 | — | **READY** | OPEN | [FARAST-TASK] EXP-15 Target architecture options and trade-offs | — |
| [#26](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/26) | `WI-EXP14-AUDIT-EVIDENCE-001` | G-06 | EXP-14 | — | **READY** | OPEN | [FARAST-TASK] EXP-14 Audit trail and evidence integrity | — |
| [#25](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/25) | `WI-EXP13-SECURITY-PRIVACY-001` | G-06 | EXP-13 | — | **READY** | OPEN | [FARAST-TASK] EXP-13 Security and privacy assessment | — |
| [#24](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/24) | `WI-EXP12-IDENTITY-PERMISSION-001` | G-03 | EXP-12 | — | **READY** | OPEN | [FARAST-TASK] EXP-12 Identity, roles and authorization boundaries | — |
| [#23](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/23) | `WI-EXP11-DATA-MIGRATION-001` | G-00 | EXP-11 | — | **READY** | OPEN | [FARAST-TASK] EXP-11 Data model and migration safety | — |
| [#22](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/22) | `WI-EXP10-ARCHITECTURE-MAP-001` | G-03 | EXP-10 | — | **READY** | OPEN | [FARAST-TASK] EXP-10 Current architecture and dependency map | — |
| [#21](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/21) | `WI-EXP09-AI-SERVICE-CYCLE-001` | G-05 | EXP-09 | — | **READY** | OPEN | [FARAST-TASK] EXP-09 AI and intelligent service lifecycle | — |
| [#20](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/20) | `WI-EXP08-COMMERCE-CYCLE-001` | G-04 | EXP-08 | — | **REVIEW** | OPEN | [FARAST-TASK] EXP-08 Commerce, payment and delivery lifecycle | — |
| [#19](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/19) | `WI-EXP07-GAP-ROOT-CAUSE-001` | G-00 | EXP-07 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] EXP-07 Gap analysis and root-cause investigation | — |
| [#18](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/18) | `WI-EXP06-EVIDENCE-TESTING-001` | G-02 | EXP-06 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] EXP-06 Evidence-based test coverage | — |
| [#17](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/17) | `WI-EXP05-USER-SCENARIOS-001` | G-02 | EXP-05 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] EXP-05 Real user scenarios and end-to-end flows | — |
| [#16](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/16) | `WI-EXP04-REQUIREMENT-TRACE-001` | G-01 | EXP-04 | — | **READY** | OPEN | [FARAST-TASK] EXP-04 Requirement-to-capability traceability | — |
| [#15](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/15) | `WI-EXP03-CAPABILITY-CATALOG-001` | G-01 | EXP-03 | — | **REVIEW** | OPEN | [FARAST-TASK] EXP-03 Existing capability catalog | — |
| [#14](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/14) | `WI-EXP02-BACKUP-RESTORE-001` | G-01 | EXP-02 | — | **SUPERSEDED** | OPEN | [FARAST-TASK] EXP-02 Backup integrity and restore readiness | Owner-declared superseded by canonical Issue #66; retained for history; do not claim |
| [#13](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/13) | `WI-EXP01-BASELINE-001` | G-01 | EXP-01 | — | **DONE_VERIFIED** | CLOSED | [FARAST-TASK] EXP-01 Baseline and environment inventory | — |
| [#11](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/11) | `WI-GOAL-ALLOCATOR-001` | G-09 | EXP-01 | — | **READY** | OPEN | [FARAST-TASK] Goal allocator and unique Work Item backlog maintenance | — |
| [#9](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/9) | `WI-CP-INDEPENDENT-C` | G-CP-CONCURRENCY-SMOKE | EXP-01 | — | **READY** | OPEN | [FARAST-SMOKE] Independent-resource parallel C | — |
| [#8](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/8) | `WI-CP-SHARED-B` | G-CP-CONCURRENCY-SMOKE | EXP-01 | — | **READY** | OPEN | [FARAST-SMOKE] Shared-resource contention B | — |
| [#7](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/7) | `WI-CP-SHARED-A` | G-CP-CONCURRENCY-SMOKE | EXP-01 | — | **READY** | OPEN | [FARAST-SMOKE] Shared-resource contention A | — |
| [#5](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/5) | `WI-CP-SMOKE-001` | G-CP-SMOKE | EXP-01 | — | **READY** | OPEN | [FARAST-TASK] FCP coordinator activation smoke test 2026-11-14 | — |
| [#3](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/3) | `—` | — | — | — | **BACKLOG** | OPEN | FCP-GOAL-EXECUTION-001 — Hierarchical work items, atomic allocation, evidence progress and cross-chat resume | Legacy parent issue without stable WORK_ITEM_ID; not claimable as a leaf |
| [#2](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/2) | `—` | — | — | — | **BACKLOG** | OPEN | FCP-CP-RESILIENCE-001 — Validate interruption and context-loss recovery | Legacy parent issue without stable WORK_ITEM_ID; not claimable as a leaf |

## قواعد نگهداری

- `READY/CLAIMED/IN_PROGRESS/BLOCKED/REVIEW/DONE_VERIFIED/DONE_UNVERIFIED/SUPERSEDED/BACKLOG` وضعیت کاری این نمایه‌اند؛ وضعیت GitHub در ستون جدا ثبت شده است.
- Issue والد، legacy یا smoke test را leaf اجرایی فرض نکن مگر WID و مشخصات مستقل معتبر داشته باشد.
- Issue superseded را حذف نکن؛ تاریخچه حفظ شود و canonical جایگزین در ستون توضیح ثبت شود.
- بسته‌شدن Issue به‌تنهایی proof پذیرش نیست؛ `DONE_VERIFIED` در این snapshot فقط از label رسمی `agent:done` و state بسته استخراج شده است.
- هیچ درصد parent از تعداد Issue/PR/commit محاسبه نمی‌شود. پیشرفت هدف‌ها فقط با معیارهای وزن‌دار و شواهد معتبر، طبق `PROGRESS_REPORTING_PROTOCOL.md`، قابل محاسبه است.
