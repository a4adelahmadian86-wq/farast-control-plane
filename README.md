# FARAST Control Plane

مرکز کنترل مستقل پروژه FARAST؛ منبع حقیقت مشترک برای چت‌ها، حساب‌ها و همکاران انسانی.

این مخزن از مخزن محصول `a4adelahmadian86-wq/non` جداست. کد اجرایی سایت در اینجا نگهداری نمی‌شود.

## هشدار امنیتی فوری
در زمان راه‌اندازی، visibility این مخزن `PUBLIC` مشاهده شد. چون اسناد نیازمندی و جزئیات کسب‌وکار در آن قرار دارد، مالک باید فوراً مخزن را PRIVATE کند. تا آن زمان هیچ secret، credential، PII، dump یا داده مشتری وارد نشود. راهنما: [تنظیمات دستی GitHub](04_COORDINATION/MANUAL_GITHUB_SETTINGS.md).

## شروع سریع
1. مخزن را PRIVATE کن و branch protection را طبق راهنما فعال کن.
2. برای هر حساب ChatGPT، GitHub connector را جداگانه با دسترسی مناسب به این مخزن وصل کن.
3. [START_HERE.md](START_HERE.md) را بخوان.
4. منبع کامل نیازمندی‌ها: [SOURCE_REQUIREMENTS_v2.md](00_PROJECT_FOUNDATION/SOURCE_REQUIREMENTS_v2.md).
5. راهنمای کاربر مبتدی: [USAGE_GUIDE_FA.md](USAGE_GUIDE_FA.md).
6. پیش از هر نوشتن، پروتکل [قفل اتمیک CAS](04_COORDINATION/LOCK_MANAGER_PROTOCOL.md) را اجرا کن.

## کتابخانه پرامپت‌ها
- [کتابخانه کامل قابل کپی](05_PROMPT_LIBRARY/FARAST_EXECUTABLE_PROMPTS_COMPLETE.md)
- [فهرست پرامپت‌ها](05_PROMPT_LIBRARY/PROMPT_CATALOG.md)
- [پرامپت مادر MASTER-00](05_PROMPT_LIBRARY/MASTER-00.md)

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
