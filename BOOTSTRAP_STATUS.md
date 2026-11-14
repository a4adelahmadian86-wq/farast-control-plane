# وضعیت راه‌اندازی کنترل‌پلین

**آخرین بازبینی زنده:** 2026-11-14  
**وضعیت:** IMPLEMENTED_ON_REVIEW_BRANCH / NOT_MERGED / EXECUTION_GATES_PENDING

## کارهای انجام‌شده
- ساخت ساختار اسناد بنیادین، اهداف، نقشه راه، تصمیم‌ها، بازخوردها و رجیسترهای وضعیت.
- حفظ متن کامل منبع نیازمندی نسخه ۲.۰ در 00_PROJECT_FOUNDATION/SOURCE_REQUIREMENTS_v2.md.
- نگاشت ۱۷ پرامپت به ۲۷ بسته کاری EXP در SPECIALIST_WORKFLOW.md، به‌همراه MASTER-00 و bundle نسخه 1.2.1.
- اصلاح دروازه شروع تمام ۱۷ پرامپت: هر ۱۷ فایل اکنون URL مستقیم START_HERE.md در شاخه setup/control-plane-bootstrap، recovery protocol، MASTER-00، CAS، TASK_ID و OPERATION_ID را دارند؛ read-back مستقیم 17/17 PASS.
- اصلاح نگاشت PR-02 به EXP-02؛ EXP-17 فقط زیر PR-14 (EXP-16 تا EXP-18) قرار دارد.
- ایجاد Work Order Schema، Checkpoint Schema، Handoff Protocol، Acceptance Framework، Architecture Coverage و Pull Request Template.
- ایجاد branch مستقل coordination/locks و رجیستری CAS با lease و fencing token؛ probe stale-SHA رد شده است، اما آزمون دو حساب مستقل هنوز انجام نشده.\n- ممیزی workflow قدیمی PR #479 انجام شد؛ قابلیت‌های مفید و نقص issue-level lock در LEGACY_COORDINATOR_MIGRATION.md ثبت شده‌اند. workflow رویدادمحور جدید هنوز پیاده‌سازی نشده است.
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
5. تصمیم مالک و پیاده‌سازی/آزمون coordinator رویدادمحور مبتنی بر CAS، طبق LEGACY_COORDINATOR_MIGRATION.md.\n6. اجرای COORD-01 تا COORD-15 و آزمون وقفه/عدم‌تکرار با دو حساب مستقل و fixtureهای آزمایشی.
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

**نتیجه:** اصلاحات bootstrap و پرامپت‌ها روی شاخه PR انجام شده‌اند؛ اما coordinator رویدادمحور هنوز منتقل نشده و سیستم برای اجرای کامل چندچتی/محرمانه آماده و تأییدشده نیست.
