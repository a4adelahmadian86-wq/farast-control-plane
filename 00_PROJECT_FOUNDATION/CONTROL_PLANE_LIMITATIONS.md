# محدودیت‌ها و مرزهای عملیاتی Control Plane نسخه 1

## وضعیت و تضمین‌های اثبات‌شده
1. مخزن در آخرین بررسی PUBLIC است. مالک فعلاً خصوصی‌سازی را به تعویق انداخته؛ تا زمان تغییر visibility فقط کار عمومی و غیرمحرمانه مجاز است. secret، credential، PII، dump، داده مشتری یا جزئیات محرمانه وارد نشود.
2. قفل منابع با Git ref compare-and-swap، lease و fencing token طراحی و در branch مستقل coordination/locks پیاده‌سازی شده است. probe اولیه stale-SHA رد شده؛ رقابت واقعی دو حساب مستقل، چرخه کامل lease/heartbeat/release و stale fencing هنوز end-to-end اثبات نشده‌اند.
3. CI run #84 روی commit 4fb2b07e3d700cb975133602c291acf62fb1035c با SUCCESS پایان یافت: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43591651513 . این اجرا فایل‌های لازم، JSON و هر دو schema با نمونه معتبر، قراردادهای ۱۷ پرامپت، ref شاخه، نگاشت PR-02/PR-14 و سند ممیزی coordinator قدیمی را بررسی کرد. Runهای #80 و #82 روی commitهای میانی به‌علت assertion متنی نامتناسب درباره عبارت Issueمحور شکست خوردند؛ assertion اصلاح شد و #84 موفق شد. برای هر commit بعدی، وضعیت CI را از checks زنده همان SHA بخوان؛ این سند جایگزین وضعیت زنده نیست.
4. بررسی مستقیم منبع نشان داد هر ۱۷ پرامپت مستقل، URL شروع pinned به شاخه فعال، پروتکل interruption، MASTER-00، CAS، TASK_ID و OPERATION_ID را دارند: 17/17 PASS در read-back منبع. این بررسی دستی/source-level است، نه آزمون رفتار چت یا CI.
5. schemaهای Work Order و Checkpoint، پروتکل handoff، چارچوب پذیرش و PR template افزوده شده‌اند. اعتبارسنجی خودکار schemaها در workflow تعریف شده، اما اجرای CI روی head فعلی هنوز مشاهده نشده است.
6. مخزن کنترل‌پلین از مخزن محصول مستقل است. هیچ‌یک از EXP-01 تا EXP-27 در bootstrap اجرا نشده و هیچ ممیزی محصول، backup/restore واقعی، آزمون production، امنیت عملیاتی یا deployment انجام نشده است.
7. شاخه پیش‌فرض main در آخرین بررسی فقط README.md داشت؛ PR شماره ۱ باز و ادغام‌نشده است. پرامپت‌ها اکنون به شاخه setup/control-plane-bootstrap pinned شده‌اند. تا ادغام و تأیید وجود فایل‌ها در main، از main به‌عنوان منبع کامل استفاده نکن.
8. وضعیت branch protection هنوز تأیید نشده است. فهرست Rulesets در بررسی فعلی خالی بود؛ endpoint قدیمی Branch Protection برای اتصال حاضر قابل خواندن نبود. enforcement فنی branch protection و required checks را فعال فرض نکن.
9. PR #1 هنوز بازبینی مستقل ثبت‌شده ندارد؛ CI سبز جایگزین review انسانی نیست.
10. سند ۱۲ نوامبر در Library ده مرحله EXP دارد، اما نقشه ۱۷ پرامپتی که مالک در معماری فعلی ارائه/تأیید کرده با SPECIALIST_WORKFLOW.md و ۲۷ EXP این مخزن تطبیق دارد؛ سند ۱۰ مرحله‌ای در سیستم فعلی استفاده نمی‌شود مگر مالک خلاف آن را اعلام کند.\n11. workflow رویدادمحور جدید .github/workflows/farast-coordinator.yml روی شاخه بازبینی ایجاد شده است. فرمان‌های /farast، رجیستری مرکزی single-writer، deduplication، reconciliation و review/close gate در منبع پیاده‌سازی شده‌اند؛ اما چون PR #1 هنوز ادغام نشده، schedule روی default branch فعال نیست و workflow هنوز عملیاتی محسوب نمی‌شود.

## مرز استفاده فعلی
- برای آماده‌سازی عمومی و تحلیل/آزمون غیرمحرمانه می‌توان از شاخه pinned استفاده کرد.
- اجرای نوشتنی روی مخزن عمومی فقط برای داده عمومی و غیرمحرمانه مجاز است؛ secrets، PII، داده مشتری یا اطلاعات محرمانه ممنوع.
- اجرای محرمانه یا چندحسابی قابل اتکا تا زمان خصوصی‌سازی، تأیید دسترسی هر حساب، branch protection و آزمون واقعی دو حساب مجاز/تأییدشده نیست.
- تغییر در مخزن محصول، انتشار، ادغام main، تغییر امنیت/مجوز یا عملیات مخرب همچنان تابع approval صریح و گردش‌کار مربوط است.

## شواهد
- PR #1: https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/1
- CIهای موفق روی commit f3143aeb2bc4ca2a4f5ccad18e613d7f8692ce26: run #73 و #72؛ هر دو SUCCESS. سابقه شکست run #66 روی commit قدیمی‌تر اصلاح شده است.
- آزمون‌های چندعاملی: 04_COORDINATION/MULTI_AGENT_REGRESSION_CASES.md
- وضعیت راه‌اندازی: ../BOOTSTRAP_STATUS.md


## وضعیت چندچتی پس از پیاده‌سازی coordinator (2026-11-14)
- منبع workflow: .github/workflows/farast-coordinator.yml در شاخه setup/control-plane-bootstrap.
- قرارداد فرمان‌ها: 04_COORDINATION/COORDINATOR_COMMANDS.md؛ برنامه آزمون: 04_COORDINATION/COORDINATOR_TEST_PLAN.md.
- single-writer سراسری برای رجیستری، durable comment inbox و reconciliation پنج‌دقیقه‌ای طراحی شده‌اند.
- این موارد هنوز روی default branch فعال نشده‌اند؛ PR #1 باز و ادغام‌نشده است.
- CI روی head جدید و آزمون fixture باید بررسی شود. آزمون واقعی دو حساب مستقل هنوز اثبات نشده است.


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
