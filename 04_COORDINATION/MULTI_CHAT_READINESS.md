# ارزیابی آمادگی اجرای چندچتی FARAST

آخرین بازبینی: 2026-11-14  
مرجع کد: شاخه `setup/control-plane-bootstrap`؛ SHA جاری را فقط از PR #1 بخوانید.  
PR کنترل‌پلین: https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/1

## نتیجه مدیریتی

**وضعیت: IMPLEMENTED — NOT YET OPERATIONAL — MULTI-ACCOUNT E2E NOT VERIFIED**

معماری و هسته هماهنگ‌کننده چندچتی پیاده‌سازی شده‌اند، اما تا ادغام PR #1 در `main`، اعمال تنظیمات دستی GitHub و اجرای آزمون دو حساب مستقل، استفاده عملیاتی کامل را تأیید نمی‌کنیم.

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
- CI روی آخرین SHA ثبت‌شده در PR: ۱۴ آزمون هسته و اعتبارسنجی workflow، JavaScript، JSON/schema و قرارداد ۱۷ پرامپت. CI سبز، آزمون زنده چندحسابی محسوب نمی‌شود.

## مرز مهم تضمین فنی

این نسخه یک **سامانه هماهنگی چندچتی با کنترل مرکزی و پروتکل همکاری** است، نه یک دروازه اجباری که تمام نوشتن‌های مخزن محصول را از نظر رمزنگاری/زیرساختی رهگیری کند.

- GitHub هویت واقعی ChatGPT chat را ارائه نمی‌کند؛ `CHAT_ID` و `RUN_ID` metadata خوداظهاری‌اند. هویت قابل اتکا، حساب GitHub و مجوز آن است.
- workflow مرکزی فقط رجیستری کنترل‌پلین را کنترل می‌کند. اگر یک worker دسترسی مستقیم write به مخزن محصول داشته باشد، GitHub به‌صورت ذاتی هر commit آن worker را با fencing token رجیستری تطبیق نمی‌دهد.
- branch یکتا برای هر RUN و کنترل پذیرش، ریسک تداخل را کاهش می‌دهد؛ اما به‌تنهایی مانع فنی push یا merge یک PR قدیمی در مخزن محصول نمی‌شود.
- بنابراین تا زمانی که branch protection مخزن محصول، محدودیت merge، review مستقل و قواعد لازم اعمال و آزموده نشده‌اند، این سازوکار را تضمین hard-fencing یا ضدعامل متخلف معرفی نمی‌کنیم.
- heartbeat خودکار در پس‌زمینه تضمین‌شده نیست؛ worker باید طبق راهنما فرمان heartbeat را اجرا کند و در صورت ناتوانی در تأیید lease، نوشتن را متوقف کند.

## موانع عملیاتی باقی‌مانده

1. PR #1 باز و ادغام‌نشده است؛ workflow فرمانی و schedule هنوز در `main` فعال نیستند.
2. هیچ review مستقل یا review thread برای PR #1 ثبت نشده است. CI سبز جایگزین بازبینی مستقل نیست.
3. branch protection / ruleset شاخه `main` هنوز از طریق اتصال فعلی تأیید نشده است.
4. تنظیم GitHub Actions برای اجازه write در مخزن باید توسط مالک بررسی شود.
5. آزمون دو حساب GitHub مستقل در دو نشست ChatGPT، claim هم‌زمان، منبع مشترک و disjoint، قطع اتصال، expiry/takeover و رد token قدیمی هنوز **NOT_RUN** است.
6. برای بررسی PR در مخزن محصول `non`، Secret با نام `FARAST_GITHUB_TOKEN` و مجوز حداقلی read به Pull requests و Metadata لازم است.
7. مخزن کنترل‌پلین فعلاً PUBLIC می‌ماند؛ فقط اطلاعات عمومی و غیرمحرمانه مجاز است.

## معیار عبور به READY

- [ ] PR #1 توسط فردی غیر از نویسنده، مستقل بازبینی و تأیید شود.
- [ ] Ruleset/branch protection شاخه `main` و required checkها فعال و read-back شوند.
- [ ] PR #1 با مجوز مالک ادغام شود؛ سپس تمام فایل‌ها در SHA ادغام‌شده `main` دوباره بررسی شوند.
- [ ] Actions write permission و اجرای workflow، schedule و issue_comment در default branch به‌صورت زنده تأیید شوند.
- [ ] دو حساب مستقل و دو نشست ChatGPT آزمون‌های بخش سطح ۳ در `COORDINATOR_TEST_PLAN.md` را بگذرانند.
- [ ] branch protection و قواعد merge مخزن هدف بررسی شوند؛ تا آن زمان هیچ ادعای hard-fencing مطرح نشود.
- [ ] نتیجه هر آزمون با SHA، زمان، حساب/نقش و شواهد در GitHub ثبت شود.

## استفاده در وضعیت فعلی

برای بازبینی کد و کار عمومی/غیرمحرمانه از شاخه pinned استفاده کنید. برای هر اقدام نوشتنی، تا فعال شدن workflow در default branch و دریافت پاسخ قطعی `CLAIM GRANTED`، فقط read-only بمانید. هیچ secret، credential، PII، داده مشتری یا سند محرمانه در مخزن عمومی ثبت نشود.

راهنماهای مرتبط:
- [START HERE](../START_HERE.md)
- [فرمان‌های coordinator](COORDINATOR_COMMANDS.md)
- [تنظیمات دستی GitHub](MANUAL_GITHUB_SETTINGS.md)
- [برنامه آزمون پذیرش](COORDINATOR_TEST_PLAN.md)
- [محدودیت‌های کنترل‌پلین](../00_PROJECT_FOUNDATION/CONTROL_PLANE_LIMITATIONS.md)
