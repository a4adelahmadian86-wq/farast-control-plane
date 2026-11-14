# راهنمای شروع اجرای FARAST — نسخه تأییدشده برای شروع کنترل‌شده

آخرین بازبینی: 2026-11-14  
مرجع: شاخه `main`؛ پیش از هر اجرا SHA زنده را از GitHub بخوانید.

## 1) حکم آمادگی

**آماده برای شروع تحلیل و کشف کنترل‌شده (READ_ONLY): بله.**  
**آماده برای ادعای اجرای کامل چندحسابی و نوشتن در محصول: خیر؛ هنوز تأیید نشده است.**

شواهد فعلی:
- PR #1 کنترل‌پلین ادغام شده و workflow فرمانی `issue_comment` روی `main` در آزمون زنده موفق بوده است.
- آزمون زنده تک‌حسابی: یک Work Item منبع مشترک را claim کرد، Work Item دوم برای همان منبع رد شد و Work Item مستقل هم‌زمان lease گرفت.
- CI هسته: coordinator برابر 14/14 و Work Item برابر 20/20؛ آخرین run باید هنگام اجرا دوباره از GitHub خوانده شود.
- 27 Work Item متناظر با EXP-01 تا EXP-27 در Issueهای مستقل وجود دارد؛ 27 شناسه یکتا، JSON معتبر و تطبیق header/schema بررسی شد. همه آن‌ها `agent:ready` هستند.
- Work Itemهای محصول `a4adelahmadian86-wq/non` با سیاست `READ_ONLY` تعریف شده‌اند. هیچ فایل، branch، PR یا داده محصول با این آماده‌سازی تغییر نکرده است.

موارد اثبات‌نشده:
- آزمون دو حساب GitHub مستقل در دو نشست ChatGPT مستقل و قطع/بازگشت واقعی نشست.
- takeover پس از expiry و رد write عامل قدیمی در E2E دوحسابی.
- schedule پنج‌دقیقه‌ای و workflow_dispatch با run زنده.
- branch protection: read-back فعلی `main.protected=false` و repository rulesets برابر `[]` بوده است.
- secret لازم برای بررسی پذیرش PRهای cross-repository از این اتصال قابل مشاهده نیست.

بنابراین هیچ تضمین «صفر خطا» یا آمادگی کامل چندحسابی داده نمی‌شود. این نسخه برای آغاز مرحله کشف READ_ONLY با توقف امن هنگام ابهام آماده است.

## 2) نقطه شروع پیشنهادی

برای اولین اجرا، فقط این پرامپت را در یک چت ارسال کنید:

- [PR-01 — خط مبنا و موجودی محیط](05_PROMPT_LIBRARY/PR-01_BASELINE.md)

این پرامپت باید Work Item واقعی `EXP-01` را در Issueها پیدا کند (اکنون Issue #13 / `WI-EXP01-BASELINE-001`)؛ شناسه جدید نسازد؛ مخزن محصول را فقط بخواند؛ و گزارش/شواهد را با checkpoint ثبت کند.

پس از آن، بسته به dependency واقعی و وضعیت Work Itemها:
- [PR-02 — بکاپ و بازیابی](05_PROMPT_LIBRARY/PR-02_RECOVERY.md)
- [PR-03 — کاتالوگ قابلیت‌ها](05_PROMPT_LIBRARY/PR-03_CAPABILITY_DISCOVERY.md)
- [PR-04 — ردیابی نیازمندی‌ها](05_PROMPT_LIBRARY/PR-04_TRACEABILITY.md)
- [PR-05 — سناریوهای کاربر](05_PROMPT_LIBRARY/PR-05_USER_SCENARIOS.md)
- [PR-06 — آزمون و شواهد](05_PROMPT_LIBRARY/PR-06_EVIDENCE_TESTING.md)
- [PR-07 — شکاف و علت ریشه‌ای](05_PROMPT_LIBRARY/PR-07_GAP_ROOT_CAUSE.md)

برای هر مأموریت تخصصی فقط همان PR prompt را کپی کنید؛ لازم نیست MASTER-00 را جداگانه به آن بچسبانید. پرامپت‌های مستقل، دروازه مشترک و الزام خواندن MASTER-00 را در خود دارند.

## 3) کتابخانه کامل پرامپت‌ها

- [فهرست و نگاشت 17 پرامپت](05_PROMPT_LIBRARY/PROMPT_CATALOG.md)
- [MASTER-00 — هماهنگی، بازیابی و تداوم](05_PROMPT_LIBRARY/MASTER-00.md)
- [Bundle کامل نسخه 1.6.1](05_PROMPT_LIBRARY/FARAST_EXECUTABLE_PROMPTS_COMPLETE.md)

پرامپت‌های تخصصی:
- [PR-01 Baseline](05_PROMPT_LIBRARY/PR-01_BASELINE.md)
- [PR-02 Recovery](05_PROMPT_LIBRARY/PR-02_RECOVERY.md)
- [PR-03 Capability Discovery](05_PROMPT_LIBRARY/PR-03_CAPABILITY_DISCOVERY.md)
- [PR-04 Traceability](05_PROMPT_LIBRARY/PR-04_TRACEABILITY.md)
- [PR-05 User Scenarios](05_PROMPT_LIBRARY/PR-05_USER_SCENARIOS.md)
- [PR-06 Evidence Testing](05_PROMPT_LIBRARY/PR-06_EVIDENCE_TESTING.md)
- [PR-07 Gap Root Cause](05_PROMPT_LIBRARY/PR-07_GAP_ROOT_CAUSE.md)
- [PR-08 Commerce](05_PROMPT_LIBRARY/PR-08_COMMERCE.md)
- [PR-09 AI Services](05_PROMPT_LIBRARY/PR-09_AI_SERVICES.md)
- [PR-10 Architecture and Data](05_PROMPT_LIBRARY/PR-10_ARCH_DATA.md)
- [PR-11 Authorization](05_PROMPT_LIBRARY/PR-11_AUTHORIZATION.md)
- [PR-12 Security, Privacy and Audit](05_PROMPT_LIBRARY/PR-12_SECURITY_PRIVACY_AUDIT.md)
- [PR-13 Target Architecture](05_PROMPT_LIBRARY/PR-13_TARGET_ARCH.md)
- [PR-14 Hosting and Operations](05_PROMPT_LIBRARY/PR-14_HOSTING_OPERATIONS.md)
- [PR-15 Prioritization](05_PROMPT_LIBRARY/PR-15_PRIORITIZATION.md)
- [PR-16 Controlled Implementation](05_PROMPT_LIBRARY/PR-16_IMPLEMENTATION.md)
- [PR-17 Acceptance and Release](05_PROMPT_LIBRARY/PR-17_ACCEPTANCE_RELEASE.md)

## 4) قواعد اجرای بدون تداخل

1. پیش از هر اجرا، `START_HERE.md`، این راهنما، `MULTI_CHAT_READINESS.md` و پروتکل interruption را از SHA زنده `main` بخوانید.
2. فقط Work Item واقعی متناظر با EXP را ادامه دهید؛ عنوان، شناسه یا Issue تکراری نسازید.
3. قبل از هر write به کنترل‌پلین، claim را از طریق Issue و فرمان `/farast claim` انجام دهید. فقط CLAIM GRANTED همراه read-back رجیستری مجوز است.
4. قبل از هر write/checkpoint heartbeat معتبر بگیرید. timeout، خطا یا نتیجه مبهم یعنی STOP WRITES.
5. رجیستری `coordination/locks` را مستقیم تغییر ندهید؛ فقط workflow مرکزی نویسنده آن است.
6. چند چت فقط وقتی موازی کار کنند که claimهای جداگانه موفق، resource keys مستقل و dependencyهای حل‌شده داشته باشند.
7. GitHub هویت واقعی ChatGPT chat را تصدیق نمی‌کند؛ CHAT_ID/RUN_ID شناسه‌های metadata خوداظهاری‌اند. آزمون دوحسابی هنوز انجام نشده است.
8. `a4adelahmadian86-wq/non` فقط READ_ONLY است. هیچ branch، فایل، PR، migration یا deploy در محصول نسازید/تغییر ندهید مگر مالک یک Work Item جدید با مجوز صریح و policy مناسب تصویب کند.
9. هرگز secret، token، PII، داده مشتری یا اطلاعات محرمانه را در مخزن عمومی، Issue، comment یا log ثبت نکنید.
10. پایان هر نشست باید checkpoint، شواهد، اقدام بعدی و وضعیت قفل را در GitHub ثبت کند.

## 5) وضعیت منابع و قفل allocator

در snapshot بازبینی، Issue #11 با Work Item ID برابر `WI-GOAL-ALLOCATOR-001` lease فعال داشت. این قفل متعلق به اجرای دیگری است و نباید تصاحب یا آزاد شود. چون 27 برگ EXP از قبل ساخته شده‌اند، برای شروع EXP-01 تا EXP-27 نیازی به ساخت برگ جدید یا تصاحب allocator نیست. اگر بعداً واقعاً برگ جدیدی لازم شد، ابتدا lease و وضعیت allocator را از رجیستری زنده بررسی کنید.

## 6) معیار اعلام پایان

هیچ Work Item را صرفاً به دلیل تولید فایل یا CI سبز DONE_VERIFIED نکنید. فقط با acceptance criteria کامل، شواهد قابل بازبینی، تست‌های لازم، dependencyهای پذیرفته‌شده و checkpoint معتبر می‌توان آن را تکمیل‌شده اعلام کرد. release/merge/deploy همچنان نیازمند تأیید صریح مالک است.

## مراجع وضعیت

- [آمادگی چندچتی](04_COORDINATION/MULTI_CHAT_READINESS.md)
- [پروتکل فرمان‌ها](04_COORDINATION/COORDINATOR_COMMANDS.md)
- [راهنمای تنظیمات دستی GitHub](04_COORDINATION/MANUAL_GITHUB_SETTINGS.md)
- [گزارش آزمون رقابت و قفل](08_REPORTS/MULTI_CHAT_CONCURRENCY_SMOKE_2026-11-14.md)
- [شروع اجباری عامل‌ها](START_HERE.md)
