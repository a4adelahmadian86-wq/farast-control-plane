# FARAST Control Plane

مرکز کنترل مستقل پروژه FARAST؛ منبع حقیقت مشترک برای چت‌ها، حساب‌ها و همکاران انسانی.

این مخزن از مخزن محصول `a4adelahmadian86-wq/non` جداست. کد اجرایی سایت در اینجا نگهداری نمی‌شود.

## هشدار امنیتی فوری
در زمان راه‌اندازی، visibility این مخزن `PUBLIC` مشاهده شد. چون اسناد نیازمندی و جزئیات کسب‌وکار در آن قرار دارد، مالک باید فوراً مخزن را PRIVATE کند. تا آن زمان هیچ secret، credential، PII، dump یا داده مشتری وارد نشود. راهنما: [تنظیمات دستی GitHub](04_COORDINATION/MANUAL_GITHUB_SETTINGS.md).

## شروع سریع

**مرجع اجرایی فعلی:** تا زمان ادغام PR شماره ۱، فایل‌ها روی شاخه `setup/control-plane-bootstrap` هستند و `main` فقط README دارد. [ورود مستقیم به START_HERE در شاخه معتبر](https://github.com/a4adelahmadian86-wq/farast-control-plane/blob/setup/control-plane-bootstrap/START_HERE.md). همه لینک‌های نسبی را از همان شاخه باز کن. وضعیت PR را زنده بررسی کن و پس از ادغام، وجود فایل‌ها در main را تأیید کن.

**حالت فعلی عمومی:** چون مخزن هنوز PUBLIC است، فقط تحلیل/آزمون عمومی و غیرمحرمانه مجاز است؛ secret، PII، داده مشتری و اطلاعات محرمانه ثبت نکن.
1. مخزن را PRIVATE کن و branch protection را طبق راهنما فعال کن.
2. برای هر حساب ChatGPT، GitHub connector را جداگانه با دسترسی مناسب به این مخزن وصل کن.
3. [START_HERE.md](START_HERE.md) را بخوان.
4. منبع کامل نیازمندی‌ها: [SOURCE_REQUIREMENTS_v2.md](00_PROJECT_FOUNDATION/SOURCE_REQUIREMENTS_v2.md).
5. الزامات اجرای چندچتی: [CONTROL_PLANE_REQUIREMENTS.md](00_PROJECT_FOUNDATION/CONTROL_PLANE_REQUIREMENTS.md).
6. راهنمای کاربر مبتدی: [USAGE_GUIDE_FA.md](USAGE_GUIDE_FA.md).
7. پیش از هر نوشتن، فقط فرمان `/farast claim` را طبق [قرارداد coordinator](04_COORDINATION/COORDINATOR_COMMANDS.md) اجرا کن؛ workerها حق CAS یا نوشتن مستقیم رجیستری را ندارند.

## کتابخانه پرامپت‌ها
- [کتابخانه کامل قابل کپی](05_PROMPT_LIBRARY/FARAST_EXECUTABLE_PROMPTS_COMPLETE.md)
- [فهرست پرامپت‌ها](05_PROMPT_LIBRARY/PROMPT_CATALOG.md)
- [پرامپت مادر MASTER-00](05_PROMPT_LIBRARY/MASTER-00.md)

## اسناد تکمیلی معماری و پذیرش
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
