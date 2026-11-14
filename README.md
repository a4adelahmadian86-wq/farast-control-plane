# FARAST Control Plane

مرکز کنترل مستقل پروژه FARAST؛ منبع حقیقت مشترک برای چت‌ها، حساب‌ها و همکاران انسانی.

این مخزن از مخزن محصول `a4adelahmadian86-wq/non` جداست. کد اجرایی سایت در اینجا نگهداری نمی‌شود.

## حالت امنیتی فعلی: public-safe
visibility این مخزن طبق تصمیم فعلی مالک `PUBLIC` باقی می‌ماند. استفاده فقط برای داده عمومی و غیرمحرمانه مجاز است؛ هیچ secret، credential، PII، dump، داده مشتری یا سند محرمانه در repo، Issue، comment یا PR ثبت نشود. خصوصی‌سازی فقط پیش از ورود داده محرمانه/داخلی لازم است. راهنما: [تنظیمات دستی GitHub](04_COORDINATION/MANUAL_GITHUB_SETTINGS.md).

## شروع سریع

**مرجع اجرایی فعلی:** PR شماره ۱ در commit `b8cf85cfd6552028750eefa3cff03d844175814c` ادغام شده است؛ شاخه `main` مرجع فعال است. [ورود به START_HERE](https://github.com/a4adelahmadian86-wq/farast-control-plane/blob/main/START_HERE.md). SHA زنده main را پیش از هر اجرا بررسی کن.

**حالت فعلی عمومی:** چون مخزن هنوز PUBLIC است، فقط تحلیل/آزمون عمومی و غیرمحرمانه مجاز است؛ secret، PII، داده مشتری و اطلاعات محرمانه ثبت نکن.
1. branch protection را طبق راهنمای GitHub فعال کن؛ تا پیش از آن PRها را بدون review مستقل merge نکن.
2. برای هر حساب/همکار، GitHub را جداگانه با دسترسی لازم به مخزن کنترل‌پلین و مخزن هدف وصل کن.
3. [START_HERE.md](START_HERE.md) را از شاخه `main` بخوان.
4. منبع نیازمندی‌ها: [SOURCE_REQUIREMENTS_v2.md](00_PROJECT_FOUNDATION/SOURCE_REQUIREMENTS_v2.md).
5. الزامات چندچتی: [CONTROL_PLANE_REQUIREMENTS.md](00_PROJECT_FOUNDATION/CONTROL_PLANE_REQUIREMENTS.md).
6. راهنمای کاربر: [USAGE_GUIDE_FA.md](USAGE_GUIDE_FA.md).
7. پیش از هر write فقط فرمان `/farast claim` را طبق [قرارداد coordinator](04_COORDINATION/COORDINATOR_COMMANDS.md) اجرا کن؛ workerها حق CAS یا نوشتن مستقیم رجیستری را ندارند.
8. نقش‌ها را فقط با تأیید مالک در [ACTOR_AUTHORIZATION.json](04_COORDINATION/ACTOR_AUTHORIZATION.json) تفویض کن.

## کتابخانه پرامپت‌ها
- [کتابخانه کامل قابل کپی](05_PROMPT_LIBRARY/FARAST_EXECUTABLE_PROMPTS_COMPLETE.md)
- [فهرست پرامپت‌ها](05_PROMPT_LIBRARY/PROMPT_CATALOG.md)
- [پرامپت مادر MASTER-00](05_PROMPT_LIBRARY/MASTER-00.md)

## اسناد تکمیلی معماری و پذیرش
- [ارزیابی آمادگی اجرای چندچتی](04_COORDINATION/MULTI_CHAT_READINESS.md)
- [تطبیق معماری مصوب با فایل‌های canonical](00_PROJECT_FOUNDATION/ARCHITECTURE_COVERAGE.md)
- [چارچوب پذیرش و اثبات تکمیل](04_COORDINATION/ACCEPTANCE_FRAMEWORK.md)
- قراردادهای ماشین‌خوان: `04_COORDINATION/WORK_ORDER_SCHEMA.json` و `CHECKPOINT_SCHEMA.json`
- [پروتکل تحویل بین چت‌ها](04_COORDINATION/HANDOFF_PROTOCOL.md)

## منبع حقیقت
- هدف و نقشه راه: `01_STRATEGY/`
- نیازمندی و ورک‌فلو: `00_PROJECT_FOUNDATION/`
- تصمیم‌ها و بازخوردها: `02_GOVERNANCE/`
- وضعیت و ردیابی: `03_PROJECT_STATE/`
- هماهنگی و قفل: `04_COORDINATION/`
- وظایف: GitHub Issues
- پرامپت‌ها: `05_PROMPT_LIBRARY/`
- checkpointها و گزارش‌ها: `07_CHECKPOINTS/` و `08_REPORTS/`

## وضعیت
راه‌اندازی کنترل‌پلین به معنی ممیزی یا تکمیل سایت نیست. تمام EXPها در آغاز NOT_STARTED هستند تا شواهد واقعی تولید شود.

## مخازن
- محصول: https://github.com/a4adelahmadian86-wq/non
- کنترل‌پلین: https://github.com/a4adelahmadian86-wq/farast-control-plane


## هدف‌های خرد و ادامه‌پذیری
پروتکل هدف‌های سلسله‌مراتبی، انتخاب عادلانه، ثبت گام با شواهد، محاسبه پیشرفت و resume بین چت‌ها در `04_COORDINATION/WORK_ITEM_EXECUTION_PROTOCOL.md` قرار دارد. هر برگ اجرایی Issue مستقل و WORK_ITEM_ID پایدار دارد.
