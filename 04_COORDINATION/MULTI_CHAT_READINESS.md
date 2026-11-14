# ارزیابی آمادگی اجرای چندچتی FARAST

آخرین بازبینی: 2026-11-14  
مرجع کد: شاخه `main`؛ SHA جاری را زنده از GitHub بخوانید.  
PR کنترل‌پلین: https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/1

## نتیجه مدیریتی

**وضعیت فعلی: LIVE SINGLE-ACCOUNT SMOKE PASS — MULTI-ACCOUNT E2E NOT VERIFIED**

PR #1 ادغام شده و workflow فرمانی `issue_comment` روی `main` در اجرای زنده موفق بوده است. آزمون زنده تک‌حسابیِ تعارض منبع مشترک و lease هم‌پوشان روی منابع مستقل نیز موفق است؛ با این حال تا اجرای آزمون دو حساب GitHub مستقل و دو نشست ChatGPT جداگانه، آمادگی کامل چندحسابی تأیید نمی‌شود.

## آنچه پیاده‌سازی و در CI بررسی شده است

- یک workflow مرکزی برای فرمان‌های `/farast` با concurrency سراسری single-writer؛ نه قفل جداگانه برای هر Issue.
- Issue comments به‌عنوان inbox پایدار فرمان‌ها و history؛ رجیستری `coordination/locks` منبع حقیقت lease و مالکیت منابع است.
- claim چندمنبعی all-or-none، یک owner فعال برای هر TASK، lease، heartbeat، fencing token، انقضا و reconciliation.
- deduplication بر اساس comment ID و بازیابی پاسخ پس از interruption.
- فرمان‌های claim، heartbeat، release، status، block، unblock، review، reopen و accept.
- نقش‌های OWNER، SENIOR_MANAGER، WORKER و READ_ONLY؛ مدیر ارشد فقط با تفویض صریح و scope دقیق repository/resource فعال می‌شود.
- branch مستقل برای هر RUN، جلوگیری از استفاده مجدد branch و ثبت lineage تحویل.
- کنترل پذیرش PR از نظر branch/repository آخرین REVIEW، merged بودن، و approval مستقل روی head فعلی. approval قدیمی که بعداً با CHANGES_REQUESTED/DISMISSED جایگزین شده باشد پذیرفته نمی‌شود؛ repository مبدأ و مقصد PR نیز باید با مخزن هدف منطبق باشند.
- ۱۷ پرامپت تخصصی مستقل، MASTER-00 و bundle تجمیعی؛ تطبیق محتوای bundle با ۱۸ منبع مستقل در read-back زنده: **۱۸/۱۸ PASS**.
- CI موفق روی head `a02a34b4a4bd45302cbc1cf918f1927ad61a4442`: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43611034691 ؛ ۱۴ آزمون هسته PASS و اعتبارسنجی workflow، JavaScript، JSON/schema و قرارداد ۱۷ پرامپت موفق. CI سبز، آزمون زنده چندحسابی محسوب نمی‌شود.

## مرز مهم تضمین فنی

این نسخه یک **سامانه هماهنگی چندچتی با کنترل مرکزی و پروتکل همکاری** است، نه یک دروازه اجباری که تمام نوشتن‌های مخزن محصول را از نظر رمزنگاری/زیرساختی رهگیری کند.

- GitHub هویت واقعی ChatGPT chat را ارائه نمی‌کند؛ `CHAT_ID` و `RUN_ID` metadata خوداظهاری‌اند. هویت قابل اتکا، حساب GitHub و مجوز آن است.
- workflow مرکزی فقط رجیستری کنترل‌پلین را کنترل می‌کند. اگر یک worker دسترسی مستقیم write به مخزن محصول داشته باشد، GitHub به‌صورت ذاتی هر commit آن worker را با fencing token رجیستری تطبیق نمی‌دهد.
- branch یکتا برای هر RUN و کنترل پذیرش، ریسک تداخل را کاهش می‌دهد؛ اما به‌تنهایی مانع فنی push یا merge یک PR قدیمی در مخزن محصول نمی‌شود.
- بنابراین تا زمانی که branch protection مخزن محصول، محدودیت merge، review مستقل و قواعد لازم اعمال و آزموده نشده‌اند، این سازوکار را تضمین hard-fencing یا ضدعامل متخلف معرفی نمی‌کنیم.
- heartbeat خودکار در پس‌زمینه تضمین‌شده نیست؛ worker باید طبق راهنما فرمان heartbeat را اجرا کند و در صورت ناتوانی در تأیید lease، نوشتن را متوقف کند.

## موانع عملیاتی باقی‌مانده

1. PR #1 در commit `b8cf85cfd6552028750eefa3cff03d844175814c` ادغام شده است؛ اجرای زنده workflow فرمانی و schedule باید تأیید شود.
2. هیچ review مستقل یا review thread برای PR #1 ثبت نشده است. CI سبز جایگزین بازبینی مستقل نیست.
3. branch protection / ruleset شاخه `main` از طریق اتصال فعلی تأیید نشده است.
4. تنظیم GitHub Actions برای اجازه write در مخزن باید توسط مالک بررسی شود.
5. آزمون دو حساب GitHub مستقل در دو نشست ChatGPT، claim هم‌زمان، منبع مشترک و disjoint، قطع اتصال، expiry/takeover و رد token قدیمی هنوز **NOT_RUN** است.
6. برای بررسی PR در مخزن محصول `non`، Secret با نام `FARAST_GITHUB_TOKEN` و مجوز حداقلی read به Pull requests و Metadata لازم است.
7. مخزن کنترل‌پلین فعلاً PUBLIC می‌ماند؛ فقط اطلاعات عمومی و غیرمحرمانه مجاز است.

## وضعیت پس از ادغام PR #1

PR #1 در SHA `b8cf85cfd6552028750eefa3cff03d844175814c` ادغام شده است. CI روی main در حال اجرا/اعتبارسنجی پس از merge است؛ وضعیت نهایی را از run زنده بخوانید. شاخه `coordination/locks` و رجیستری موجودند؛ workflow تنها writer مجاز باقی می‌ماند.

## معیار عبور به READY

- [ ] PR #1 توسط فردی غیر از نویسنده، مستقل بازبینی و تأیید شود.
- [ ] Ruleset/branch protection شاخه `main` و required checkها فعال و read-back شوند.
- [x] PR #1 با مجوز صریح مالک ادغام شد؛ فایل‌های مرجع در main باید همچنان read-back شوند.
- [ ] Actions write permission و اجرای workflow، schedule و issue_comment در default branch به‌صورت زنده تأیید شوند.
- [ ] دو حساب مستقل و دو نشست ChatGPT آزمون‌های بخش سطح ۳ در `COORDINATOR_TEST_PLAN.md` را بگذرانند.
- [ ] branch protection و قواعد merge مخزن هدف بررسی شوند؛ تا آن زمان هیچ ادعای hard-fencing مطرح نشود.
- [ ] نتیجه هر آزمون با SHA، زمان، حساب/نقش و شواهد در GitHub ثبت شود.

## استفاده در وضعیت فعلی

برای کار عمومی/غیرمحرمانه از شاخه `main` استفاده کنید. برای هر اقدام نوشتنی، تا فعال شدن workflow در default branch و دریافت پاسخ قطعی `CLAIM GRANTED`، فقط read-only بمانید. هیچ secret، credential، PII، داده مشتری یا سند محرمانه در مخزن عمومی ثبت نشود.

راهنماهای مرتبط:
- [START HERE](../START_HERE.md)
- [فرمان‌های coordinator](COORDINATOR_COMMANDS.md)
- [تنظیمات دستی GitHub](MANUAL_GITHUB_SETTINGS.md)
- [برنامه آزمون پذیرش](COORDINATOR_TEST_PLAN.md)
- [محدودیت‌های کنترل‌پلین](../00_PROJECT_FOUNDATION/CONTROL_PLANE_LIMITATIONS.md)


## Work Item execution

درخواست Issue #3 برای هدف‌های خرد در مرحله implementation. Schema و هسته محاسبه progress/resume و دستورات `/farast step`, `/farast criterion`, `/farast progress`, `/farast checkpoint` در شاخه feature توسعه می‌شوند؛ تا merge و CI سبز، آن‌ها را در main عملیاتی فرض نکنید. آزمون دو حساب مستقل همچنان NOT_RUN است.


---

## بازبینی زنده و اصلاح وضعیت — 2026-11-14

این بخش وضعیت قبلی همین سند را با شواهد زنده GitHub به‌روزرسانی و موارد متناقض/قدیمی بالا را supersede می‌کند.

- PR #1 در مخزن کنترل‌پلین **ادغام‌شده** است: https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/1
- شاخه `main` در زمان بازبینی روی commit `8c9d9f160b6294cdfd0d4395e607806b444d4f77` بود.
- اجرای زنده `issue_comment` در workflow مرکزی روی main موفق است؛ نمونه run: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43621665929
- CI اعتبارسنجی main موفق است: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43621164160
- نتایج دقیق CI: coordinator **14/14 PASS**؛ Work Item **20/20 PASS**؛ YAML/JavaScript، فایل‌های ضروری، JSON/schema و قراردادهای prompt bootstrap نیز PASS.
- آزمون زنده سه Issue آزمایشی: Issue #7 منبع مشترک را با token=51 گرفت؛ Issue #8 برای همان resource key با پاسخ resource conflict رد شد؛ Issue #9 منبع مستقل را با token=52 گرفت. بازه lease دو claim موفق هم‌پوشان بود. شواهد و محدودیت‌های این آزمون در [گزارش تفصیلی](../08_REPORTS/MULTI_CHAT_CONCURRENCY_SMOKE_2026-11-14.md) ثبت شده‌اند.
- این سه فرمان با یک actor GitHub اجرا شده‌اند؛ CHAT_ID/RUN_ID مقادیر metadata خوداظهاری‌اند. بنابراین این آزمون **جایگزین دو حساب مستقل نیست**.

### وضعیت معیارها در این بازبینی

- [x] PR #1 ادغام و workflow فرمانی روی default branch فعال است.
- [x] CI اعتبارسنجی روی main موفق است.
- [x] دو Work Item با resource key مشترک: فقط یک claim موفق.
- [x] دو Work Item با resource key مستقل: هر دو lease هم‌پوشان موفق.
- [ ] آزمون با دو حساب GitHub مستقل و دو نشست ChatGPT مستقل.
- [ ] قطع واقعی یکی از نشست‌ها، expiry/takeover در آزمون چندحسابی و رد فرمان‌های عامل قدیمی پس از takeover.
- [ ] read-back قواعد branch protection/ruleset و required checks در مخزن کنترل‌پلین و مخزن هدف.
- [ ] بررسی مستقل PR #1 توسط reviewer غیر از نویسنده؛ CI سبز جایگزین review مستقل نیست.
- [ ] تأیید اجرای schedule پنج‌دقیقه‌ای به‌صورت زنده؛ شواهد فعلی اجرای issue_comment را ثابت می‌کنند، نه schedule.

**نتیجه:** زیرساخت برای smoke test زنده تک‌حسابی و همکاری چند Work Item آماده است؛ وضعیت نهایی همچنان **MULTI-ACCOUNT E2E NOT VERIFIED** است. ادعای hard-fencing تمام مسیرهای مستقیم write در مخزن محصول مجاز نیست.
