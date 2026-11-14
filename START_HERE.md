# START HERE — پروتکل ورود همه عامل‌ها

این فایل دروازه اجباری ورود است. هر چت، حساب، کارمند یا عامل هوش مصنوعی باید پیش از هر اقدام آن را بخواند.

## مرجع شاخه معتبر تا زمان ادغام PR شماره ۱

- PR شماره ۱ در آخرین بررسی باز و ادغام‌نشده است؛ شاخه پیش‌فرض `main` فقط `README.md` دارد و منبع کامل کنترل‌پلین نیست.
- مرجع عملیاتی فعلی: شاخه `setup/control-plane-bootstrap`.
- نشانی مستقیم این فایل در شاخه معتبر: https://github.com/a4adelahmadian86-wq/farast-control-plane/blob/setup/control-plane-bootstrap/START_HERE.md
- تمام مسیرهای نسبی این سند باید از همان شاخه خوانده شوند؛ در GitHub API، `ref=setup/control-plane-bootstrap` را صریح تنظیم کن.
- قبل از هر اجرا وضعیت زنده PR شماره ۱ را بررسی کن. اگر merged شد، وجود همه فایل‌های لازم در `main` را در SHA ادغام‌شده تأیید کن و سپس به main منتقل شو. اگر PR باز است از شاخه بالا استفاده کن؛ اگر بسته و ادغام‌نشده است STOP WRITES.
- تا زمان خصوصی‌سازی، فقط داده عمومی و غیرمحرمانه استفاده کن؛ secrets، PII، داده مشتری و جزئیات محرمانه وارد مخزن نشود.

## اسناد لازم برای فهم زمینه
1. `README.md`
2. `00_PROJECT_FOUNDATION/PROJECT_CHARTER.md`
3. `00_PROJECT_FOUNDATION/APPROVED_REQUIREMENTS.md`
4. متن کامل منبع نیازمندی: `00_PROJECT_FOUNDATION/SOURCE_REQUIREMENTS_v2.md`
5. الزامات کنترل‌پلین چندچتی: `00_PROJECT_FOUNDATION/CONTROL_PLANE_REQUIREMENTS.md`
6. `00_PROJECT_FOUNDATION/SPECIALIST_WORKFLOW.md`
6a. `00_PROJECT_FOUNDATION/ARCHITECTURE_COVERAGE.md` را بخوان تا نام‌های canonical و فایل‌های معادل با معماری پیشنهادی روشن باشد.
7. `00_PROJECT_FOUNDATION/KNOWN_UNKNOWN.md`
8. `01_STRATEGY/GOAL_TREE.md` و `ROADMAP.md`
9. `02_GOVERNANCE/DECISION_REGISTER.md` و `USER_FEEDBACK_REGISTER.md`
10. `03_PROJECT_STATE/MASTER_STATUS.md` و `TASK_INDEX.md`
11. `04_COORDINATION/WORKER_PROTOCOL.md`، `LOCK_PROTOCOL.md`، `LOCK_MANAGER_PROTOCOL.md` و `TASK_SCHEMA.md`
12. `04_COORDINATION/WORK_ORDER_SCHEMA.json`، `CHECKPOINT_SCHEMA.json`، `HANDOFF_PROTOCOL.md` و `ACCEPTANCE_FRAMEWORK.md` را بخوان.
13. `04_COORDINATION/INTERRUPTION_RECOVERY_PROTOCOL.md` را کامل بخوان؛ این سند برای قطع اینترنت، timeout، توقف نشست و پرشدن context لازم‌الاجراست.
14. 04_COORDINATION/LEGACY_COORDINATOR_MIGRATION.md و 04_COORDINATION/COORDINATOR_COMMANDS.md و 04_COORDINATION/COORDINATOR_TEST_PLAN.md را بخوان؛ وضعیت فعال‌سازی workflow را از Actions زنده بررسی کن.
15. `05_PROMPT_LIBRARY/MASTER-00.md` را کامل بخوان و سپس پرامپت تخصصی مربوط را اجرا کن؛ پرامپت تخصصی بدون پروتکل مادر مجاز به نوشتن نیست.
16. `05_PROMPT_LIBRARY/PROMPT_CATALOG.md` و پرامپت تخصصی

ترتیب بالا فقط ترتیب فهم زمینه است، نه ترتیب اجرای PRها.

## دستورهای غیرقابل‌مذاکره
- هیچ مکالمه قبلی را منبع حقیقت فرض نکن؛ GitHub مرجع مشترک وضعیت است.
- پیش از شروع، وضعیت زنده مخزن، Issueها، PRها، checkpointها، feedback و lock registry را بخوان.
- اگر دسترسی GitHub یا ابزار لازم وجود ندارد، نوشتن ممنوع؛ فقط تحلیل read-only و ثبت محدودیت در پاسخ.
- وظایف مستقل می‌توانند موازی باشند؛ وابستگی و RESOURCE_KEY تعیین‌کننده‌اند، نه شماره PR.
- TASK_ID موجود و آخرین checkpoint را ادامه بده؛ duplicate نساز.
- پیش از هر write، از طریق Issue فرمان /farast claim chat=... run=... lease=30 ثبت کن؛ فقط پاسخ CLAIM GRANTED و read-back رجیستری مجوز نوشتن است.
- چت worker هرگز رجیستری ACTIVE_LOCKS.json را مستقیم تغییر نمی‌دهد؛ workflow مرکزی تنها نویسنده است.
- پیش از هر write/checkpoint، heartbeat با chat/run/token صحیح و read-back انجام بده؛ timeout/عدم پاسخ/ابهام = STOP WRITES.
- دستورها و الگوهای دقیق در 04_COORDINATION/COORDINATOR_COMMANDS.md هستند.
- هر RUN یک branch اختصاصی work/GH-<ISSUE_NUMBER>-<RUN_ID> دارد؛ فقط دارنده lease فعال روی آن write می‌کند. در handoff، اجرای جدید از آخرین commit تأییدشده branch قبلی branch جدید می‌سازد و branch قبلی را تغییر نمی‌دهد؛ مستقیم روی main commit نکن.
- ادغام PR، انتشار، حذف داده، migration مخرب، تغییر امنیت/مجوز، هزینه یا تغییر مالی/حقوقی نیازمند تأیید صریح و ثبت‌شده مالک است.
- secret، token، private key، PII و داده مشتری در Issue/commit/log ممنوع.
- هر اقدام، نتیجه، شواهد، تست، خطا، checkpoint و اقدام بعدی در GitHub ثبت شود.
- اگر چت قطع شد، عامل بعدی همان TASK_ID را بازیابی و از آخرین checkpoint ادامه دهد.

## پروتکل آغاز هر اجرا
1. زمان UTC معتبر را ثبت کن؛ زمان را حدس نزن.
2. branch پیش‌فرض و آخرین commit کنترل‌پلین و محصول را بخوان.
3. وظایف/PRهای مرتبط و کارهای فعال را جست‌وجو کن.
4. duplicate و dependency را بررسی کن.
5. TASK موجود را بازیابی یا Issue جدید بساز.
6. Target repository و RESOURCE_KEYهای دقیق را در Issue ثبت و با فرمان coordinator به‌صورت all-or-none claim کن؛ branch و fencing token صادرشده را در checkpoint نگه دار.
7. branch صادرشده در پاسخ CLAIM GRANTED را دقیقاً در target_repository ثبت‌شده ایجاد/استفاده کن؛ الگو work/GH-<ISSUE_NUMBER>-<RUN_ID> است. در handoff، RUN جدید از آخرین commit تأییدشده branch قبلی branch جدید می‌سازد.
8. checkpoint اولیه و مرحله‌ای ثبت کن.
9. PR و handoff بساز؛ ادغام نکن.

## رفتار مکالمه
تمرکز بر اجرای کار است. سؤال تکراری یا غیرضروری نپرس. فقط وقتی تصمیم/داده حیاتی در اختیار مالک است و پس از جست‌وجوی کامل منابع، یک سؤال دقیق مطرح کن. مجهول غیرحیاتی را ثبت و بخش مستقل را ادامه بده. در چت فقط TASK_ID، وضعیت، مانع حیاتی و لینک GitHub را بده؛ گزارش تفصیلی در GitHub.

## تعریف موفقیت
خروجی، معیار پذیرش، شواهد و وضعیت تست باید روشن باشند. وجود کد، فایل یا CI سبز به‌تنهایی اثبات پذیرش محصول نیست.


## مرز اجرایی handoff چندچتی
هماهنگ‌کننده مالکیت منابع و lineage اجرای قبلی را کنترل می‌کند، اما ایجاد branch در مخزن هدف و تعیین commit پایه را خودکار انجام نمی‌دهد. worker جدید باید آخرین checkpoint قابل اثبات را read-only بررسی و branch جدید صادرشده را از آن commit ایجاد کند؛ اگر commit پایه قابل اثبات نیست، نوشتن ممنوع است. آزمون این رفتار در مخزن هدف هنوز end-to-end نشده است.
