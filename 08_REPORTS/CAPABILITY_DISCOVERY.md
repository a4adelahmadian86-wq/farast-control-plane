# Capability Discovery — EXP-03

**Work Item:** `WI-EXP03-CATALOG-ARTIFACT-REMEDIATION-001` (control-plane Issue [#126](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/126))  
**Prompt:** `PR-03_CAPABILITY_DISCOVERY`  
**Target product:** `a4adelahmadian86-wq/non`  
**NON source snapshot:** `main` at `6d87b16018621a14ab5d6f1375939cbfda58390c`  
**Control-plane source snapshot:** `main` at `f50f6b184e1baa61fd4a5bafc4f020b495b3ff88`  
**Observed:** 2026-11-24 10:30:42 UTC  
**Execution branch:** `work/GH-126-RUN-PR03-EXP03-CATALOG-20261124-01`  
**Execution policy:** product repository READ_ONLY; only this control-plane artifact Work Item has WRITE_ALLOWED.

## 1. Executive result

The earlier register contained only a header and the prior discovery draft did not include several current route families. This revision replaces the empty register with **25 stable CAP_ID records**, each with actor, inputs/outputs, UI/API route references, server-side authorization, backend components, data references, dependencies, test-source pointers, an allowed evidence status, and source evidence links.

The route-led inventory inspected all route modules loaded by the current `routes/web.php` entrypoint:

| Route module | Declarations |
|---|---:|
| `routes/web_core_part1.php` | 88 |
| `routes/web_core_part2.php` | 165 |
| `routes/store_routes.php` | 54 |
| `routes/access_control_routes.php` | 7 |
| `routes/product_operations.php` | 2 |
| `routes/store_price_proposals.php` | 5 |
| `routes/support_extra.php` | 5 |
| `routes/messenger.php` | 12 |
| `routes/notifications.php` | 8 |
| **Total inspected route declarations** | **346** |

The current repository has no `routes/api.php` at the inspected ref (the path lookup returned 404); JSON endpoints are registered in the web route modules. This is not evidence that the application has no APIs.

The register currently classifies 20 capabilities as `PRESENT_CODE_ONLY` and 5 as `PARTIAL`. No capability is marked `TESTED_IN_SCOPE` or `VERIFIED_RUNTIME`, because a passing test run or live runtime observation on the current `main` SHA was not established.

## 2. Method and evidence rules

1. Resolve the current `main` SHA first, then pin source evidence links to that commit. The product baseline for this report is `6d87b16018621a14ab5d6f1375939cbfda58390c`.
2. Enumerate the route modules loaded by `routes/web.php`; trace each capability to the controller and service classes named by those routes.
3. Inspect representative controllers, shared services, authorization middleware, domain/data references, and feature/unit test source files.
4. Distinguish test **source presence** from test **execution**. A test file is not a passing test result.
5. Do not infer a working integration from a controller or SDK client alone. Provider credentials, queue workers, cron, database state, browser journeys and external callbacks require runtime evidence.
6. Record unknowns rather than upgrading a capability's status based on naming or file existence.

Primary route and middleware evidence:
- [routes/web.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/routes/web.php)
- [routes/web_core_part1.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/routes/web_core_part1.php)
- [routes/web_core_part2.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/routes/web_core_part2.php)
- [routes/store_routes.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/routes/store_routes.php)
- [routes/access_control_routes.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/routes/access_control_routes.php)
- [routes/product_operations.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/routes/product_operations.php)
- [routes/store_price_proposals.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/routes/store_price_proposals.php)
- [routes/support_extra.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/routes/support_extra.php)
- [routes/messenger.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/routes/messenger.php)
- [routes/notifications.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/routes/notifications.php)
- [bootstrap/app.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/bootstrap/app.php)
- [routes/console.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/routes/console.php)

## 3. Capability catalog and module map

| CAP_ID | Capability / business journey | UI and API surface | Main backend and data | Test source | Status |
|---|---|---|---|---|---|
| CAP-AUTH-001 | Phone/email login, password, OTP registration and reset | `/login`, `/register`, `/forgot-password` | AuthController; SmsService/EmailService; User, OtpChallenge, EmailOtpChallenge | AuthOtpAtomicityTest | PRESENT_CODE_ONLY |
| CAP-SECURITY-002 | Session/device management, password and 2FA | `/workspace/security`, `/two-factor/challenge` | AccountSecurityController; AccountTwoFactorController; session/security-event tables | AccountSecuritySessionsTest | PRESENT_CODE_ONLY |
| CAP-TYPING-003 | Project intake, typing estimate, preflight and billing | `/projects/*`, `/editor/preflight/*` | ProjectController; TypingPreflightController; ProjectBillingService; FarastProject, Order | ProjectWorkflowTest; PricingPolicyTest | PARTIAL |
| CAP-EDITOR-004 | Document editing, save, versions, restore and export | `/editor/*`, `/editor/documents/*` | EditorController; EditorDocumentService; ExportController; TypingDocument, FarastDocument, versions | EditorRuntimeContractTest; EditorExportSmokeTest | PRESENT_CODE_ONLY |
| CAP-EDITOR-AGENT-005 | AI edit planning, approval, commit and undo | `/editor/agent/*` | EditorAgentController; FarastEditorAgent; FarastAgentTask; tool/validation services | Dedicated test source not verified | PRESENT_CODE_ONLY |
| CAP-AI-006 | Global assistant, editor AI, memory/history and product context | `/assistant/*`, `/editor/ai/assist` | GlobalAssistantController; EditorAiAssistService; AiOrchestrator; AiQuotaService; AiPrivacyPolicy; AiProviderRegistry; AiInteraction | EditorAiAssistTest; CommercePhase3Test | PARTIAL |
| CAP-VOICE-007 | Voice status, transcription, synthesis and streaming | `/assistant/voice/*`, `/assistant/transcribe`, `/editor/voice/*` | VoiceController; VoiceTranscriptionService; VoiceProviderRouter; VoiceQuotaManager; VoiceProviderAccount | GlobalAssistantVoiceTest; VoiceSecurityTest; VoiceProviderDashboardIntegrationTest | PARTIAL |
| CAP-STORE-008 | Store browse/search, cart, coupon, checkout, wallet and payment | `/store/*`, `/cart/*`, `/checkout/*`, `/wallet/*` | StoreController; StoreCartController; PaymentController; WalletController; StoreCartService; PricingEngine; Order/Payment/Wallet | CommercePhase3Test; PricingPolicyTest | PRESENT_CODE_ONLY |
| CAP-LIBRARY-009 | Purchased library and secure downloads | `/library`, `/downloads/*` | StoreLibraryController; StorageManager; StoreLibraryItem, StoreDownload | Dedicated test source not verified | PRESENT_CODE_ONLY |
| CAP-READER-010 | Digital product reader, page/audio access and bookmarks | `/store/product/*/reader`, `/store/*/reader-state` | StoreController; StoreReaderStateController; StoreReaderState; StoreProductDocument | Reader-specific test source not verified | PRESENT_CODE_ONLY |
| CAP-COURSE-011 | Course authoring, enrollment, lessons and progress | `/store/*/course*`, `/my-courses/*` | AdminCourseController; StoreCourseLearningController; enrollment/progress services; course tables | StoreCourseLearningTest | PRESENT_CODE_ONLY |
| CAP-PRODUCT-012 | Product files, ingestion, AI review, publication and retry | `/admin/store*`, `/admin/store/operations` | AdminStoreController; AdminProductSupervisorController; AdminProductOperationsController; ProcessProductDocument; ProductSupervisorClient | AdminStoreProductWorkflowTest; ProductPublicationReviewLifecycleTest; ProductLifecycleHealthTest; ProductInfrastructureHealthTest | PRESENT_CODE_ONLY |
| CAP-PRICE-013 | Product price proposal and margin-safe acceptance | `/admin/store/price-proposals`, `/store/price-proposals/*` | StorePriceProposalController; StorePriceProposalService; StoreCouponMarginPolicy; audit/notification services | Dedicated test source not verified | PRESENT_CODE_ONLY |
| CAP-CANVA-014 | Canva OAuth, design listing/create, import and export | `/canva/*`, `/integrations/canva/*` | CanvaController; CanvaService; CanvaConnection; SiteSetting | Canva-specific test source not verified | PARTIAL |
| CAP-WORKSPACE-015 | Workspace documents/folders, sharing, workflows and OCR | `/workspace/documents`, `/workspace/workflows`, `/workspace/ocr` | PlatformCompletionController; EditorDocumentService; WorkflowEngine; workspace document/share/workflow data | PlatformCompletionTest; ProjectWorkflowTest | PRESENT_CODE_ONLY |
| CAP-RBAC-016 | Roles, permissions and scoped access | `/admin/access-control/*` | AdminAccessController; AuthorizationService; AdminConsoleService; ResolveAdminScope; Role/Permission/Team/Organization | UnifiedAuthorizationTest; SupportTicketScopedAgentAccessTest | PRESENT_CODE_ONLY |
| CAP-ADMIN-017 | Unified admin console, finance, settings, integrations and audit | `/admin/*` | AdminController; AdminConsoleService; CapabilityService; settings, wallet and user-capability data | UnifiedAuthorizationTest | PRESENT_CODE_ONLY |
| CAP-SUPPORT-018 | Guest/customer tickets, attachments, SLA and CSAT | `/support/*`, `/admin/communications`, `/admin/support-report` | SupportController; SupportTicketService; SupportSlaService; Ticket/TicketMessage | SupportTicketAtomicWorkflowTest; SupportTicketScopedAgentAccessTest | PRESENT_CODE_ONLY |
| CAP-COMMS-019 | Internal messenger and notification inbox | `/messenger/*`, `/workspace/notifications` | MessengerController; NotificationController; MessengerAccessService; NotificationService; Conversation/FarastNotification | InternalMessengerTest; NotificationCenterTest | PRESENT_CODE_ONLY |
| CAP-CRM-020 | Customer profiles, follow-ups, projects and marketing | `/admin/crm/*`, `/admin/store-coupons` | CrmController; CrmProjectController; CrmMarketingController; CrmAudienceService; SmartDiscountMarketingService | CrmCustomerWorkspaceTest; CrmFollowUpQueueTest; CrmMarketingCampaignTest | PRESENT_CODE_ONLY |
| CAP-CONTENT-021 | Blog, community, discussion, report and moderation | `/blog/*`, `/community/*`, `/discussions/*` | BlogController; ContentDiscussionController; ContentDiscussion and moderation data | BlogPagesTest; ContentDiscussionTest | PRESENT_CODE_ONLY |
| CAP-ANNOUNCE-022 | Scheduled announcements and social links | `/announcements`, `/admin/announcements`, `/social` | AnnouncementController; SocialController; AnnouncementService; Announcement/SiteSetting | Dedicated test source not verified | PRESENT_CODE_ONLY |
| CAP-USERFILES-023 | Customer file upload/list/select/delete | `/editor/files` | UserFileController; StorageManager; UserFile/private file metadata | Dedicated test source not verified | PRESENT_CODE_ONLY |
| CAP-STORAGE-024 | Managed storage, volumes, backup and recovery | `/storage/*`, `/admin/storage*` | StorageManager; StorageBackupService; S3CompatibleAdapter; StorageManagedFile/StorageVolume/StorageBackupRun | StorageBackupRecoveryTest; StorageBackupRestoreIntegrationTest | PRESENT_CODE_ONLY |
| CAP-OPS-025 | Observability, readiness and scheduled/queue operations | `/up`, `/ready`, `/observability`, product operations | FarastObservability; console commands; product operations and scheduled jobs | ProductInfrastructureHealthTest | PARTIAL |

The CSV is the field-complete machine-readable record for all 25 IDs. The table above is a navigation summary; consult the CSV for full input/output, route, permission, dependency, test-source and evidence-pointer fields.

## 4. Server authorization and role/scope map

The middleware aliases are registered in `bootstrap/app.php`:
- `admin` → AdminOnly
- `admin.scope` → ResolveAdminScope
- `admin.section` → EnsureAdminSection
- `capability` → EnsureCapability
- `permission` → EnsurePermission
- `resource.permission` → EnsureResourcePermission
- `single.editor` → EnsureSingleEditor

The web stack additionally appends EnsureActiveAccount, ResolveAdminScope, TrackAuthenticatedSession and RequireTwoFactorChallenge. This means a route's presence alone does not establish access.

The shared scope service maps admin to `global`, organization manager to `organization`, team supervisor to `team`, and employee/observer to `own`. AdminConsoleService applies RBAC plus section configuration and scopes visible-user queries. Access-control routes additionally require `permission:access.manage`; editor routes use `capability:can_type`, `capability:can_ai`, `capability:can_voice` and resource permissions; store admin routes use `admin.section:store`.

Evidence: [bootstrap/app.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/bootstrap/app.php), [ResolveAdminScope.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/app/Http/Middleware/ResolveAdminScope.php), [AuthorizationService.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/app/Services/AuthorizationService.php), [AdminConsoleService.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/app/Services/AdminConsoleService.php), [CapabilityService.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/app/Services/CapabilityService.php), [access_control_routes.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/routes/access_control_routes.php).

## 5. Findings and material gaps

### Confirmed source-level findings

1. **Typing project type is the only enabled project intake type in the inspected registry.** ProjectInterviewService declares other types (editing, article, book, resume, exam, contract, forms, report, research document, presentation, design, programming and others) with `available=false`. They must not be advertised as active services solely because their names appear in the type map. [ProjectInterviewService.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/app/Services/ProjectInterviewService.php)
2. **AI processing mode limitation:** AiPrivacyPolicy accepts automatic/local/server/external as mode names, but AiOrchestrator currently throws `ai_provider_unavailable` when the resolved mode is not `external`. This is a source-level limitation requiring a separate engineering decision; no code was changed here. [AiPrivacyPolicy.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/app/Services/AI/AiPrivacyPolicy.php) · [AiOrchestrator.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/app/Services/AI/AiOrchestrator.php)
3. **Canva is integration code, not proof of a live connection.** CanvaService requires client id, secret and redirect URI; OAuth state/PKCE and API calls are present, but configured credentials and live round-trip are unknown. [CanvaService.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/app/Services/CanvaService.php)
4. **Reader and course learning are real current route families** and are no longer omitted from the register. Reader page/audio/state and course enrollment/progress are separately represented.
5. **Product intake is a multi-stage subsystem:** upload preflight/confirmation, file/document processing, supervisor review, operations status and retry paths exist. Queue and external supervisor health were not exercised. [ProductDocumentRetryService.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/app/Services/ProductDocumentRetryService.php) · [ProductSupervisorClient.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/app/Services/ProductSupervisorClient.php)
6. **Storage policy is explicit in code:** StorageManager distinguishes critical and non-critical storage and restricts failover to the policy-selected drive. Backup archive verification requires a configured encryption key. Neither property proves an actual backup or restore completed. [StorageManager.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/app/Services/Storage/StorageManager.php) · [StorageBackupService.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/app/Services/Storage/StorageBackupService.php)

### Evidence gaps

- No passing test execution for the current NON `main` commit was returned. Test files are source pointers only. The commit-workflow-run lookup returned no PR-triggered run for this commit, and combined status did not provide a passing current-main check; this is **not** a test failure.
- No browser/runtime session, production-like database, queue worker, scheduler/cron, private storage volume, email/SMS provider, payment gateway, AI provider, voice gateway or Canva OAuth credentials were available for verification.
- The GitHub connector did not expose a recursive repository tree or code-search index for a complete enumeration of route-less Jobs, Events, Listeners, Migrations, Models and documentation. The 346 route declarations are fully enumerated for the route modules loaded by `routes/web.php`, but the route-less/background inventory is not yet exhaustive. This remains the principal blocker to claiming the whole product capability universe is complete.
- Dedicated test sources were not located for editor agent, library/download, reader, price proposals, Canva, announcements/social and user-file management in the inspected paths. This is recorded as unknown test coverage, not as proof that no tests exist anywhere.

## 6. Evidence-status policy

| Status | Applied meaning |
|---|---|
| PRESENT_CODE_ONLY | Route/backend implementation source exists; runtime or current-main test execution is not proven. |
| UI_ONLY | UI route/view exists but no corresponding backend behavior was traced. |
| PARTIAL | A material implementation/configuration limitation or missing end-to-end evidence is identified. |
| TESTED_IN_SCOPE | A focused test was actually run and passed on the exact inspected scope/ref. |
| VERIFIED_RUNTIME | A real runtime journey was observed and its evidence recorded. |
| BROKEN | A reproducible failure was observed; not inferred from missing configuration alone. |
| NOT_FOUND | A specific expected capability was searched for in a bounded scope and not found. |
| UNKNOWN | Available evidence cannot classify the capability reliably. |

## 7. Deliverables and validation

- [CAPABILITY_REGISTER.csv](../03_PROJECT_STATE/CAPABILITY_REGISTER.csv) — 25 unique IDs, 20 columns, all rows have evidence pointers, and all statuses use the permitted vocabulary.
- [This report](./CAPABILITY_DISCOVERY.md) — method, route inventory, module map, permissions, findings and unresolved evidence gaps.
- No code, migration, product data, NON branch, deployment or release was changed.
- No claim is made that all capabilities are runtime verified. The route-led register is usable as a discovery baseline, but the exhaustive route-less background inventory and runtime/test evidence remain open work.

## 8. Acceptance decision

**Not ACCEPTED / not DONE_VERIFIED.** Artifact publication and row-level structural validation can pass, but the completeness criterion remains open until the remaining Jobs/Events/Listeners/Migrations/Models/documentation inventory is enumerated and the required runtime/test evidence is supplied. Do not infer acceptance from 100% step execution or from the presence of the two files.
