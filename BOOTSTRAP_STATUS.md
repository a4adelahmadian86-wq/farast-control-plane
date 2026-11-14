# وضعیت راه‌اندازی کنترل‌پلین

**آخرین بازبینی زنده:** 2026-11-14  
**وضعیت:** IMPLEMENTED_ON_REVIEW_BRANCH / NOT_MERGED / EXECUTION_GATES_PENDING

## کارهای انجام‌شده
- ساخت ساختار اسناد بنیادین، اهداف، نقشه راه، تصمیم‌ها، بازخوردها و رجیسترهای وضعیت.
- حفظ متن کامل منبع نیازمندی نسخه ۲.۰ در 00_PROJECT_FOUNDATION/SOURCE_REQUIREMENTS_v2.md.
- نگاشت ۱۷ پرامپت به ۲۷ بسته کاری EXP در SPECIALIST_WORKFLOW.md، به‌همراه MASTER-00 و bundle نسخه 1.2.1.
- اصلاح دروازه شروع تمام ۱۷ پرامپت: هر ۱۷ فایل اکنون URL مستقیم START_HERE.md در شاخه setup/control-plane-bootstrap، recovery protocol، MASTER-00، فرمان‌های coordinator و handoff امن، TASK_ID و OPERATION_ID را دارند؛ read-back مستقیم 17/17 PASS.
- اصلاح نگاشت PR-02 به EXP-02؛ EXP-17 فقط زیر PR-14 (EXP-16 تا EXP-18) قرار دارد.
- ایجاد Work Order Schema، Checkpoint Schema، Handoff Protocol، Acceptance Framework، Architecture Coverage و Pull Request Template.
- ایجاد branch مستقل coordination/locks و رجیستری CAS با lease و fencing token؛ probe stale-SHA رد شده است، اما آزمون دو حساب مستقل هنوز انجام نشده.\n- ممیزی workflow قدیمی PR #479 انجام شد؛ قابلیت‌های مفید و نقص issue-level lock در LEGACY_COORDINATOR_MIGRATION.md ثبت شده‌اند. workflow رویدادمحور مستقل `.github/workflows/farast-coordinator.yml` در شاخه PR #1 پیاده‌سازی شده است؛ تا ادغام در default branch عملیاتی نیست.
- افزودن اعتبارسنجی schemaها و قرارداد ref/نگاشت prompt به CI؛ run #84 روی commit 4fb2b07e3d700cb975133602c291acf62fb1035c موفق شد.

## وضعیت محصول
هیچ‌یک از EXP-01 تا EXP-27 اجرا نشده است. مخزن محصول a4adelahmadian86-wq/non در این کار تغییر داده نشده؛ ممیزی محصول، runtime، backup/restore، hosting، Voice-typing billing، امنیت عملیاتی و deployment هنوز اجرا نشده‌اند. Capability Register و Requirements Traceability عمداً خالی‌اند تا کشف واقعی انجام شود؛ این خالی‌بودن به معنی نبود قابلیت/نیاز نیست.

## وضعیت GitHub
- PR: https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/1
- Branch: setup/control-plane-bootstrap
- آخرین head مشاهده‌شده پیش از همگام‌سازی وضعیت coordinator: 4fb2b07e3d700cb975133602c291acf62fb1035c؛ برای head زنده، PR metadata را بخوان.
- PR #1: OPEN، NOT MERGED؛ آخرین metadata mergeable=true و mergeable_state=clean گزارش کرد.
- شاخه پیش‌فرض main فقط README.md دارد؛ تا ادغام PR و تأیید فایل‌ها، مرجع اجرایی همان شاخه pinned بالاست.
- Lock branch: coordination/locks.
- Visibility: PUBLIC؛ مالک فعلاً خصوصی‌سازی را به تعویق انداخته است. فقط کار عمومی/غیرمحرمانه مجاز.
- Rulesets فهرست‌شده: صفر؛ branch protection تأیید نشده و endpoint قدیمی برای اتصال فعلی قابل خواندن نبود.
- Review submission و inline review thread مستقل برای PR #1: صفر.
- Issue #2: OPEN؛ آزمون‌های end-to-end هنوز انجام نشده‌اند.

## وضعیت CI
- CI run #84 روی commit 4fb2b07e3d700cb975133602c291acf62fb1035c SUCCESS شد: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43591651513 . اجرای #84 فایل‌های لازم، JSON، Work Order/Checkpoint schema و نمونه‌ها، ref pinned، هر ۱۷ پرامپت و سند انتقال coordinator قدیمی را پاس کرد. Runهای #80 و #82 روی commitهای میانی به‌علت assertion متنی نامتناسب شکست خورده بودند و در #84 اصلاح شدند. برای هر commit بعدی checks زنده همان SHA را بررسی کن.
- read-back مستقیم ۱۷ پرامپت و بررسی وجود فایل‌های جدید: PASS در سطح منبع.

## دروازه‌های باقی‌مانده
1. تعیین تکلیف توسط مالک: آیا سند ۱۰ مرحله‌ای ۱۲ نوامبر منسوخ است یا باید به‌عنوان لایه/ورک‌فلوی دیگری ادغام شود؟ تا پاسخ، فایل ۲۷ مرحله‌ای مبنای mapping فعلی است، اما تعارض ثبت‌شده باقی می‌ماند.
2. اجرای CI روی head فعلی و رفع هر شکست احتمالی.
3. خصوصی‌سازی در زمان موردنظر مالک و سپس تأیید دسترسی هر حساب/اتصال.
4. فعال‌سازی و راستی‌آزمایی branch protection و required check.
5. اجرای واقعی workflow پس از ادغام PR #1، تنظیم permissions/secrets لازم و آزمون دو حساب مستقل.\n6. اجرای COORD-01 تا COORD-15 و آزمون وقفه/عدم‌تکرار با دو حساب مستقل و fixtureهای آزمایشی.
7. بازبینی مستقل PR #1؛ سپس تصمیم merge فقط با اختیار مالک.
8. پس از merge مجاز، تأیید همه فایل‌ها و CI روی main.

## وضعیت آزمون
- Static source read-back برای ۱۷ پرامپت: PASS (17/17).
- CI روی commit 4fb2b07e3d700cb975133602c291acf62fb1035c: PASS در run #84؛ برای commitهای بعدی وضعیت زنده بررسی شود.
- Multi-account CAS contention: NOT_RUN.
- Full interruption/idempotency E2E: NOT_RUN.
- Private repository access per account: NOT_RUN (مخزن هنوز public است).
- Independent review: NOT_RUN.
- Product audit / production readiness: NOT_STARTED.

**نتیجه:** coordinator و ۱۷ پرامپت روی شاخه PR پیاده‌سازی و CI آن‌ها پاس شده است؛ اما چون PR #1 هنوز merge نشده، workflow در default branch فعال نیست و E2E دو حساب مستقل اجرا نشده است. وضعیت: IMPLEMENTED / NOT YET OPERATIONAL. مخزن public است و استفاده محرمانه مجاز نیست.


## الحاقیه وضعیت coordinator — 2026-11-14
- Workflow چندچتی .github/workflows/farast-coordinator.yml به شاخه setup/control-plane-bootstrap افزوده شد.
- معماری: single-writer سراسری، durable Issue-comment inbox، deduplication بر اساس comment ID، reconciliation زمان‌بندی‌شده، رجیستری مرکزی lease/fencing و review/close gate.
- فرمان‌ها و template: 04_COORDINATION/COORDINATOR_COMMANDS.md و .github/ISSUE_TEMPLATE/farast-task.yml؛ برنامه آزمون: 04_COORDINATION/COORDINATOR_TEST_PLAN.md.
- workerها فقط از فرمان‌های Issue استفاده می‌کنند؛ نوشتن مستقیم ACTIVE_LOCKS.json ممنوع است.
- وضعیت: IMPLEMENTED_ON_REVIEW_BRANCH / NOT_ACTIVE_ON_DEFAULT_BRANCH / E2E_NOT_VERIFIED.
- مانع فعال‌سازی: PR #1 باز و ادغام‌نشده است؛ schedule و workflow_dispatch پس از حضور workflow در default branch قابل استفاده خواهند بود.
- آزمون واقعی دو حساب مستقل و اجرای هم‌زمان هنوز NOT_RUN است.


## یادداشت ممیزی پروتکل قفل — 2026-11-14
پس از یک رویداد RELEASED اولیه، چند commit تکمیلی مربوط به hardening هماهنگ‌کننده پیش از reacquire کردن قفل ثبت شدند. این انحراف از پروتکل ثبت شد؛ در رجیستری coordination/locks رویداد PROTOCOL_DEVIATION_RECORDED وجود دارد. هیچ writer متعارضی در read-back مشاهده نشد، اما این مشاهده اثبات عدم تداخل نیست. برای ادامه کار قفل‌ها دوباره با fencing tokenهای جدید گرفته شدند و پس از تکمیل، آزاد خواهند شد.


## نتیجه اعتبارسنجی چندچتی — 2026-11-14
- آخرین head تأییدشده: e6113207987b93ef7a78913ba487571ad34787bf.
- CI موفق: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43593994379 .
- 8 آزمون fixture هسته coordination موفق شدند: claim متعارض روی منبع مشترک، منابع مستقل، all-or-none، انقضای lease و fencing token جدید، رد مالکیت/token stale، parse کردن target repository/resource keys، approval مستقل روی head فعلی، و تطبیق PR با branch/repository آخرین REVIEW.
- YAML workflow و syntax جاوااسکریپت آن نیز در CI بررسی شده‌اند.
- این نتیجه فقط static/unit validation است؛ workflow روی default branch و آزمون واقعی دو حساب مستقل هنوز NOT RUN است.


## آخرین نتیجه تست چندچتی — 2026-11-14
- هسته coordinator اکنون ۱۰ آزمون fixture دارد؛ آخرین اجرای تأییدشده روی head `4a8a043055ce18e8c36bc3ef4f91a945ad84e6f8` با ۱۰/۱۰ PASS و ۰ FAIL: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43594606065 .
- YAML و syntax جاوااسکریپت workflow نیز در همان CI تأیید شده‌اند.
- این نتیجه unit/static validation است؛ workflow هنوز روی default branch فعال نشده و آزمون واقعی دو حساب مستقل/قطع اتصال/takeover همچنان NOT_RUN است.


## آخرین تأیید چندچتی — 2026-11-14
- Head پیاده‌سازی: ebf5ecdb5fcd13f3c4ba8bca3ab157fca4674b09.
- CI موفق روی همین SHA: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43594945741 و https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43594950344 .
- ۱۱/۱۱ آزمون هسته coordination PASS، ۰ FAIL؛ YAML workflow، syntax JavaScript، قرارداد هر ۱۷ prompt و static assertions نیز PASS.
- هنوز workflow روی default branch فعال نیست؛ اجرای واقعی GitHub Actions، آزمون دو حساب مستقل، interruption و takeover عملیاتی NOT_RUN است.


## مرز اجرایی handoff چندچتی
هماهنگ‌کننده مالکیت منابع و lineage اجرای قبلی را کنترل می‌کند، اما ایجاد branch در مخزن هدف و تعیین commit پایه را خودکار انجام نمی‌دهد. worker جدید باید آخرین checkpoint قابل اثبات را read-only بررسی و branch جدید صادرشده را از آن commit ایجاد کند؛ اگر commit پایه قابل اثبات نیست، نوشتن ممنوع است. آزمون این رفتار در مخزن هدف هنوز end-to-end نشده است.


## وضعیت جاری چندچتی — 2026-11-14
- SHA شاخه فعال را همیشه از PR #1 زنده بخوان؛ hash داخل این سند منبع وضعیت جاری نیست.
- workflow فرمانی در شاخه PR وجود دارد؛ فعال‌سازی schedule و issue_comment نیازمند ادغام PR #1 در default branch است.
- CI موفق روی snapshot ثبت‌شده: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43599689054 ؛ ۱۴/۱۴ تست هسته، اعتبارسنجی workflow/YAML/JavaScript/JSON و قرارداد هر ۱۷ پرامپت موفق.
- هandoff: branch یکتا برای هر RUN، رد branch reuse، بازگرداندن lineage اجرای قبلی؛ ایجاد branch جدید در مخزن هدف هنوز مسئولیت worker و نیازمند آزمون E2E است.
- آزمون واقعی دو حساب GitHub/ChatGPT مستقل، قطع اتصال/takeover و اجرای workflow روی default branch هنوز NOT_RUN.


## تفویض اختیار فرمان‌های چندچتی
سیاست فعال در `04_COORDINATION/ACTOR_AUTHORIZATION.json` اعمال می‌شود: OWNER همه فرمان‌ها را دارد؛ COLLABORATOR/MEMBER به‌صورت پیش‌فرض نقش WORKER می‌گیرند (claim/heartbeat/release/status/block/review) و حق unblock/reopen/accept ندارند. نقش SENIOR_MANAGER تمام فرمان‌ها را فقط پس از درج دقیق GitHub login در `actor_roles` و تأیید مالک دریافت می‌کند. READ_ONLY فقط status دارد. `actor_roles` فعلاً خالی است؛ بنابراین هیچ مدیر ارشدی به‌صورت حدسی مجاز نشده است. تغییر این فایل باید از PR و با تأیید مالک انجام شود.


bundle تجمیعی نسخه 1.3.0 از MASTER-00 و ۱۷ پرامپت مستقل بازتولید شده است؛ تطبیق محتوای هر ۱۸ بخش با منبع مستقل 18/18 PASS. سیاست نقش‌ها و CODEOWNERS برای تغییرات حساس نیز اضافه شده‌اند.
