# Capability Discovery — EXP-03

**Work Item:** `WI-EXP03-CATALOG-ARTIFACT-REMEDIATION-001` (control-plane Issue [#126](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/126))  
**Prompt:** `PR-03_CAPABILITY_DISCOVERY`  
**Target product:** `a4adelahmadian86-wq/non`  
**NON source snapshot:** [`main` at `6d87b16018621a14ab5d6f1375939cbfda58390c`](https://github.com/a4adelahmadian86-wq/non/commit/6d87b16018621a14ab5d6f1375939cbfda58390c)  
**Control-plane source snapshot:** [`main` at `f50f6b184e1baa61fd4a5bafc4f020b495b3ff88`](https://github.com/a4adelahmadian86-wq/farast-control-plane/commit/f50f6b184e1baa61fd4a5bafc4f020b495b3ff88)  
**Observed:** 2026-11-24 10:30:42 UTC  
**Execution branch:** `work/GH-126-RUN-PR03-EXP03-CATALOG-20261124-01`  
**Execution policy:** product repository READ_ONLY; only this control-plane artifact Work Item has WRITE_ALLOWED.


## 0. Prior-artifact baseline and lineage

- [Issue #15 draft comment](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/15#issuecomment-7061118490) contained the earlier 15-capability non-Reader draft at NON SHA `90c5d6b0546f9026b401901399ffde3f3106c305`; this remediation rechecked those business families against the newer pinned main SHA above and added the excluded Reader plus other omitted families.
- [Prior CSV on control-plane main](https://github.com/a4adelahmadian86-wq/farast-control-plane/blob/main/03_PROJECT_STATE/CAPABILITY_REGISTER.csv) was header-only at baseline.
- [Prior report path on control-plane main](https://github.com/a4adelahmadian86-wq/farast-control-plane/blob/main/08_REPORTS/CAPABILITY_DISCOVERY.md) was absent (404) at baseline; this branch now creates the report.

## 1. Executive result

The earlier register contained only a header and the prior discovery draft did not include several current route families. This revision replaces the empty register with **27 stable CAP_ID records**, each with actor, inputs/outputs, UI/API route references, server-side authorization, backend components, data references, dependencies, test-source pointers, an allowed evidence status, and source evidence links.

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

After the complete tree and CI evidence pass, the register classifies **19 capabilities as `TESTED_IN_SCOPE`**, **5 as `PARTIAL`**, and **3 as `PRESENT_CODE_ONLY`**. No capability is marked `VERIFIED_RUNTIME`; a successful CI test run is not a substitute for an externally configured production runtime journey.

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

## 2A. Disposition of the 15 legacy draft rows

Each prior Issue #15 capability ID was retained as a business capability and remapped to current stable IDs. Where a prior row bundled multiple journeys, it is deliberately split rather than duplicated.

| Legacy CAP_ID | Current CAP_ID(s) | Disposition |
|---|---|---|
| CAP-AUTH-01 | CAP-AUTH-001 | Retained; current auth routes/controller/test source rechecked. |
| CAP-SEC-02 | CAP-SECURITY-002 | Retained; account security and 2FA routes/controller/test source rechecked. |
| CAP-EDITOR-03 | CAP-EDITOR-004; CAP-EDITOR-AGENT-005; CAP-FEEDBACK-026 | Retained and split into editor/document lifecycle, task agent and feedback evidence pipeline; AI assist remains separately represented by CAP-AI-006. |
| CAP-COMMERCE-04 | CAP-STORE-008; CAP-LIBRARY-009; CAP-READER-010; CAP-COURSE-011 | Retained and split into commerce transaction, purchased library/download, reader and course learning journeys. Reader was excluded from the prior draft and is added here. |
| CAP-PRODUCT-05 | CAP-PRODUCT-012; CAP-PRICE-013 | Retained and split into product intake/review/publication operations and price proposal/margin decision. |
| CAP-WORKSPACE-06 | CAP-WORKSPACE-015 | Retained; canonical workspace documents, sharing, workflows and OCR surfaces rechecked. |
| CAP-RBAC-07 | CAP-RBAC-016; CAP-ADMIN-017 | Retained and split into authorization/scope enforcement and unified administration console. |
| CAP-SUPPORT-08 | CAP-SUPPORT-018 | Retained; ticket/SLA/CSAT and scoped-agent paths rechecked. |
| CAP-COMMS-09 | CAP-COMMS-019 | Retained; messenger and notification journeys rechecked. |
| CAP-STORAGE-10 | CAP-STORAGE-024; CAP-USERFILES-023 | Retained and split into managed storage/backup operations and customer editor-file management. |
| CAP-AI-11 | CAP-AI-006 | Retained; global/editor AI, quota/privacy and product context rechecked. Product content/supervisor functions also appear in CAP-PRODUCT-012. |
| CAP-VOICE-12 | CAP-VOICE-007 | Retained; voice routes, provider router and test-source pointers rechecked. |
| CAP-CRM-13 | CAP-CRM-020 | Retained; customer, follow-up, project and marketing routes/services/test sources rechecked. |
| CAP-CONTENT-14 | CAP-CONTENT-021; CAP-ANNOUNCE-022 | Retained and split into blog/community/discussion and scheduled announcements/social links. |
| CAP-OPS-15 | CAP-OPS-025 | Retained; observability, readiness and scheduler/queue source rechecked. |

Additional supplemental rows beyond the legacy 15 are therefore explicit, not silent replacements: CAP-CANVA-014, CAP-PRICE-013, CAP-READER-010, CAP-COURSE-011, CAP-EDITOR-AGENT-005, CAP-FEEDBACK-026, CAP-USERFILES-023 and CAP-ADMIN-017. Their separate journeys are represented in the register with current-main evidence and test/runtime unknowns preserved.

## 3. Capability catalog and module map

| CAP_ID | Capability / business journey | UI and API surface | Main backend and data | Test source | Status |
|---|---|---|---|---|---|
| CAP-AUTH-001 | Phone/email login, password, OTP registration and reset | `/login`, `/register`, `/forgot-password` | AuthController; SmsService/EmailService; User, OtpChallenge, EmailOtpChallenge | AuthOtpAtomicityTest | PRESENT_CODE_ONLY |
| CAP-SECURITY-002 | Session/device management, password and 2FA | `/workspace/security`, `/two-factor/challenge` | AccountSecurityController; AccountTwoFactorController; session/security-event tables | AccountSecuritySessionsTest | PRESENT_CODE_ONLY |
| CAP-TYPING-003 | Project intake, typing estimate, preflight and billing | `/projects/*`, `/editor/preflight/*` | ProjectController; TypingPreflightController; ProjectBillingService; FarastProject, Order | ProjectWorkflowTest; PricingPolicyTest | PARTIAL |
| CAP-EDITOR-004 | Document editing, save, versions, restore and export | `/editor/*`, `/editor/documents/*` | EditorController; EditorDocumentService; ExportController; TypingDocument, FarastDocument, versions | EditorRuntimeContractTest; EditorExportSmokeTest | PRESENT_CODE_ONLY |
| CAP-EDITOR-AGENT-005 | AI edit planning, approval, commit and undo | `/editor/agent/*` | EditorAgentController; FarastEditorAgent; FarastAgentTask; tool/validation services | Dedicated test source not verified | PRESENT_CODE_ONLY |
| CAP-FEEDBACK-026 | Editor feedback and evidence pipeline | `/editor/feedback` | EditorController; FeedbackPipelineService; AiFeedback; FarastFeedbackEvidence; farast_review_cases | Dedicated feedback-pipeline test source not verified | PRESENT_CODE_ONLY |
| CAP-AI-006 | Global assistant, editor AI, memory/history and product context | `/assistant/*`, `/editor/ai/assist` | GlobalAssistantController; EditorAiAssistService; AiOrchestrator; AiQuotaService; AiPrivacyPolicy; AiProviderRegistry; AiInteraction | EditorAiAssistTest; CommercePhase3Test | PARTIAL |
| CAP-VOICE-007 | Voice status, transcription, synthesis and streaming | `/assistant/voice/*`, `/assistant/transcribe`, `/editor/voice/*` | VoiceController; VoiceTranscriptionService; VoiceProviderRouter; VoiceQuotaManager; VoiceProviderAccount | GlobalAssistantVoiceTest; VoiceSecurityTest; VoiceProviderDashboardIntegrationTest | PARTIAL |
| CAP-STORE-008 | Store browse/search, cart, coupon, checkout, wallet and payment | `/store/*`, `/cart/*`, `/checkout/*`, `/wallet/*` | StoreController; StoreCartController; PaymentController; WalletController; StoreCartService; PricingEngine; Order/Payment/Wallet | CommercePhase3Test; PricingPolicyTest | PRESENT_CODE_ONLY |
| CAP-LIBRARY-009 | Purchased library and secure downloads | `/library`, `/downloads/*` | StoreLibraryController; StorageManager; StoreLibraryItem, StoreDownload | Dedicated test source not verified | PRESENT_CODE_ONLY |
| CAP-READER-010 | Digital product reader, page/audio access and bookmarks | `/store/product/*/reader`, `/store/*/reader-state` | StoreController; StoreReaderStateController; StoreReaderState; StoreProductDocument | Reader-specific test source not verified | PRESENT_CODE_ONLY |
| CAP-COURSE-011 | Course authoring, enrollment, lessons and progress | `/store/*/course*`, `/my-courses/*` | AdminCourseController; StoreCourseLearningController; enrollment/progress services; course tables | StoreCourseLearningTest | PRESENT_CODE_ONLY |
| CAP-PRODUCT-012 | Product files, ingestion, AI review, publication and retry | `/admin/store*`, `/admin/store/operations` | AdminStoreController; AdminProductSupervisorController; AdminProductOperationsController; ProcessProductDocument; ProductSupervisorClient | AdminStoreProductWorkflowTest; ProductPublicationReviewLifecycleTest; ProductLifecycleHealthTest; ProductInfrastructureHealthTest | PRESENT_CODE_ONLY |
| CAP-PRICE-013 | Product price proposal and margin-safe acceptance | `/admin/store/price-proposals`, `/store/price-proposals/*` | StorePriceProposalController; StorePriceProposalService; StoreCouponMarginPolicy; audit/notification services | Dedicated test source not verified | PRESENT_CODE_ONLY |
| CAP-CANVA-014 | Canva OAuth, design listing/create, import and export | `/canva/*`, `/integrations/canva/*` | CanvaController; CanvaService; CanvaConnection; SiteSetting | Canva-specific test source not verified | PARTIAL |
| CAP-WORKSPACE-015 | Workspace documents/folders, sharing and OCR | `/workspace/documents`, `/workspace/folders`, `/workspace/ocr` | PlatformCompletionController document/share actions; EditorDocumentService; workspace document/share data | PlatformCompletionTest; WorkspaceDocumentManagementIntegrityTest; WorkspaceModuleAccessAndBillingIntegrityTest | TESTED_IN_SCOPE |
| CAP-RBAC-016 | Roles, permissions and scoped access | `/admin/access-control/*` | AdminAccessController; AuthorizationService; AdminConsoleService; ResolveAdminScope; Role/Permission/Team/Organization | UnifiedAuthorizationTest; SupportTicketScopedAgentAccessTest | PRESENT_CODE_ONLY |
| CAP-ADMIN-017 | Unified admin console, finance, settings, integrations and audit | `/admin/*` | AdminController; AdminConsoleService; CapabilityService; settings, wallet and user-capability data | UnifiedAuthorizationTest | PRESENT_CODE_ONLY |
| CAP-SUPPORT-018 | Guest/customer tickets, attachments, SLA and CSAT | `/support/*`, `/admin/communications`, `/admin/support-report` | SupportController; SupportTicketService; SupportSlaService; Ticket/TicketMessage | SupportTicketAtomicWorkflowTest; SupportTicketScopedAgentAccessTest | PRESENT_CODE_ONLY |
| CAP-COMMS-019 | Internal messenger and notification inbox | `/messenger/*`, `/workspace/notifications` | MessengerController; NotificationController; MessengerAccessService; NotificationService; Conversation/FarastNotification | InternalMessengerTest; NotificationCenterTest | PRESENT_CODE_ONLY |
| CAP-CRM-020 | Customer profiles, follow-ups, projects and marketing | `/admin/crm/*`, `/admin/store-coupons` | CrmController; CrmProjectController; CrmMarketingController; CrmAudienceService; SmartDiscountMarketingService | CrmCustomerWorkspaceTest; CrmFollowUpQueueTest; CrmMarketingCampaignTest | PRESENT_CODE_ONLY |
| CAP-CONTENT-021 | Blog, community, discussion, report and moderation | `/blog/*`, `/community/*`, `/discussions/*` | BlogController; ContentDiscussionController; ContentDiscussion and moderation data | BlogPagesTest; ContentDiscussionTest | PRESENT_CODE_ONLY |
| CAP-ANNOUNCE-022 | Scheduled announcements and social links | `/announcements`, `/admin/announcements`, `/social` | AnnouncementController; SocialController; AnnouncementService; Announcement/SiteSetting | Dedicated test source not verified | PRESENT_CODE_ONLY |
| CAP-USERFILES-023 | Customer file upload/list/select/delete | `/editor/files` | UserFileController; StorageManager; UserFile/private file metadata | Dedicated test source not verified | PRESENT_CODE_ONLY |
| CAP-STORAGE-024 | Managed storage, volumes, backup and recovery | `/storage/*`, `/admin/storage*` | StorageManager; StorageBackupService; S3CompatibleAdapter; StorageManagedFile/StorageVolume/StorageBackupRun | StorageBackupRecoveryTest; StorageBackupRestoreIntegrationTest | PRESENT_CODE_ONLY |
| CAP-OPS-025 | Observability, readiness and scheduled/queue operations | `/up`, `/ready`, `/observability`, product operations | FarastObservability; console commands; product operations and scheduled jobs | ProductInfrastructureHealthTest; FarastObservabilityTest; ReadinessCheckTest | PARTIAL |
| CAP-WORKFLOW-027 | User-configurable workflow automation and event processing | `/workspace/workflows`; event outbox and scheduled retry | PlatformCompletionController; WorkflowEngine; farast_workflow_events and event-workflow mapping | WorkflowEventDispatchTest; DocumentQueueWorkerScheduleTest | TESTED_IN_SCOPE |

The CSV is the field-complete machine-readable record for all 27 IDs. The table above is a navigation summary; consult the CSV for full input/output, route, permission, dependency, test-source and evidence-pointer fields.



## 3B. Recursive current-main source inventory and route-less capabilities

The Git tree API was read recursively at NON `main` commit `6d87b16018621a14ab5d6f1375939cbfda58390c`. GitHub returned `truncated=false`.

| Source area | Inventory result | Interpretation |
|---|---:|---|
| Complete tree | 1,341 entries; 1,226 blobs | Full path inventory returned without truncation |
| `app/Jobs/` | 4 classes | All four queued jobs are mapped to owning capability rows |
| `app/Events/` and `app/Listeners/` | No such directories | No conventional PHP event/listener classes were present in this tree |
| `database/migrations/` | 134 migrations | Schema evidence; migration presence is not proof that a deployed database has applied them |
| `app/Models/` | 107 model files | Model ownership and data boundaries cross-reference the architecture inventory |
| `docs/` | 40 files | Includes capability, route, controller, model, migration and service architecture inventories plus product/operations documentation |
| `app/Console/` | 23 files | Commands and scheduled operations are separate from HTTP route inventory |
| `app/Services/` | 123 files | Service layer inventory |
| `app/Http/Controllers/` | 56 files | Controller surface inventory |

The four jobs and their capability ownership are:
- `DeliverFarastEmail` → `CAP-COMMS-019` (durable email delivery).
- `GenerateProductDocumentAudio` → `CAP-READER-010` (Reader synchronized audio generation).
- `ProcessProductDocument` → `CAP-PRODUCT-012` (product-document ingestion/review pipeline).
- `RunStorageBackupJob` → `CAP-STORAGE-024` (managed storage backup execution).

The workflow journey is not merely document management: `/workspace/workflows` has its own owner-scoped CRUD/run actions and `workflows.view` / `workflows.manage` authorization; `WorkflowEngine` persists supported business events with idempotency keys and retries unfinished workflow mappings through a scheduled Artisan command. It is therefore separated from `CAP-WORKSPACE-015` as `CAP-WORKFLOW-027`. Test source and current-main PHPUnit execution are linked in the CSV.

Primary evidence: [Git tree at pinned SHA](https://api.github.com/repos/a4adelahmadian86-wq/non/git/trees/6d87b16018621a14ab5d6f1375939cbfda58390c?recursive=1), [WorkflowEngine.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/app/Services/WorkflowEngine.php), [PlatformCompletionController.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/app/Http/Controllers/PlatformCompletionController.php), [WorkflowEventDispatchTest.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/tests/Feature/WorkflowEventDispatchTest.php), [routes/console.php](https://github.com/a4adelahmadian86-wq/non/blob/6d87b16018621a14ab5d6f1375939cbfda58390c/routes/console.php).

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

- Passing CI evidence exists on the exact NON main SHA `6d87b16018621a14ab5d6f1375939cbfda58390c`: run [#45212841665](https://github.com/a4adelahmadian86-wq/non/actions/runs/45212841665) executed `php artisan test --colors=never` successfully; run [#45212841711](https://github.com/a4adelahmadian86-wq/non/actions/runs/45212841711) passed Laravel unit and feature suites, focused MySQL audit/feedback/ledger/product-document tests, admin-product browser E2E, reader browser regression, voice-service contract tests and document-audio smoke. Run [#45212841708](https://github.com/a4adelahmadian86-wq/non/actions/runs/45212841708) passed `FarastEditorAgentTest` and its browser journey. The voice-model smoke job in #45212841711 was **skipped**. The latest check [#45337974958](https://github.com/a4adelahmadian86-wq/non/actions/runs/45337974958) passed Render health/CORS and WebSocket handshake checks on the same SHA; it is not a full application test.
- No browser/runtime session, production-like database, queue worker, scheduler/cron, private storage volume, email/SMS provider, payment gateway, AI provider, voice gateway or Canva OAuth credentials were available for verification.
- A recursive Git tree read at the pinned NON SHA completed with `truncated=false`: 1,341 entries / 1,226 blobs. The bounded source inventory contains 4 `app/Jobs` classes, no `app/Events` or `app/Listeners` directories, 134 migrations, 107 model files, 40 `docs/` files, 23 `app/Console/` files, 123 service files and 56 controller files. The 346 route declarations remain separately enumerated across route modules loaded by `routes/web.php`.
- The four queued jobs are now mapped to their owning capabilities: `DeliverFarastEmail` → communications; `GenerateProductDocumentAudio` → Reader/audio; `ProcessProductDocument` → product ingestion; `RunStorageBackupJob` → managed storage/backup. `routes/console.php` registers the scheduler and worker/retry commands. No event/listener PHP classes exist under the conventional directories; the workflow event pipeline is implemented through `WorkflowEngine` and durable database outbox tables, and is now separately catalogued as `CAP-WORKFLOW-027`.
- This is a complete recursive path inventory, not a claim that every line of all 1,226 source files was manually reviewed. Route-less domain mapping is based on the existing architecture inventories plus targeted inspection of job, workflow, migration, model and documentation evidence. No NON source files were changed.
- The recursive test-path scan corrected several earlier false negatives: `FarastEditorAgentTest`, `FeedbackPipelineSchemaTest` / `FarastFeedbackEvidenceSchemaTest`, `StoreWishlistLibraryExperienceTest`, `StoreDownloadEntitlementIntegrityTest`, `StoreReaderAccessTest`, `StorePriceProposalWorkflowTest` and `CanvaServiceTest` exist. `UploadSecurityServiceTest` and `EnsurePrivateStorageDiskTest` cover shared upload/storage security, but do not by themselves prove the complete user-file journey. No dedicated announcement/social test filename was found in the bounded `tests/` tree.

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

- [CAPABILITY_REGISTER.csv](../03_PROJECT_STATE/CAPABILITY_REGISTER.csv) — 27 unique IDs, 20 columns, all rows have evidence pointers, and all statuses use the permitted vocabulary; current counts are 19 `TESTED_IN_SCOPE`, 5 `PARTIAL`, 3 `PRESENT_CODE_ONLY`.
- [This report](./CAPABILITY_DISCOVERY.md) — method, route inventory, module map, permissions, findings and unresolved evidence gaps.
- No code, migration, product data, NON branch, deployment or release was changed.
- `03_PROJECT_STATE/TASK_INDEX.md` and `03_PROJECT_STATE/MASTER_STATUS.md` were not modified: they are outside this Work Item's exact `resource_keys` (which authorize only the CSV, this report and the capability-catalog artifact module). Updating those aggregate files requires a separately scoped lease; the canonical Issue/PR remain the evidence for this leaf.
- No claim is made that all capabilities are runtime verified. The recursive tree inventory is complete for the pinned commit and the focused CI results are now attached to applicable rows; configured third-party provider journeys, production scheduler/worker operation and full end-user workflows outside CI remain unverified.

## 7A. Control-plane artifact validation CI

The control-plane PR head `6cdc3206c53d7547fdaf7a418f05f2ba6e543062` completed [Control Plane Validation run #45376766633](https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/45376766633) with conclusion **success**. Its completed job included required-file checks, durable inbox scheduler regression fixtures, multi-chat contention/fencing fixtures, hierarchical progress/fairness/resume fixtures, specialist prompt dispatch fixtures, and JSON/bootstrap contract validation.

This CI validates the control-plane artifact branch only. It does **not** establish that NON's application tests ran or that any NON capability works at runtime.

## 8. Acceptance decision

**Not ACCEPTED / not DONE_VERIFIED yet.** The recursive path inventory and current-main CI evidence close the previously documented discovery blocker, and a distinct workflow automation capability is now included. Final acceptance still requires read-back validation of the revised 27-row register/report and confirmation that the complete source-to-capability map has no additional distinct user-facing journeys. Do not infer `VERIFIED_RUNTIME` from CI, or infer acceptance from 100% step execution.
