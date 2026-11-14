# وضعیت راه‌اندازی کنترل‌پلین

**تاریخ بررسی:** 2026-11-14 (زمان commitهای GitHub)  
**وضعیت:** IMPLEMENTED_ON_REVIEW_BRANCH / NOT_MERGED

## کارهای انجام‌شده
- ساخت ساختار مستقل اسناد بنیادین، هدف‌ها، نقشه راه، تصمیم‌ها، بازخوردها و وضعیت.
- حفظ متن کامل منبع نیازمندی نسخه ۲.۰ در `00_PROJECT_FOUNDATION/SOURCE_REQUIREMENTS_v2.md`.
- ایجاد MASTER-00 و ۱۷ پرامپت مستقل؛ متن یکپارچه در `05_PROMPT_LIBRARY/FARAST_EXECUTABLE_PROMPTS_COMPLETE.md`.
- ایجاد راهنمای مبتدی، Issue templates، checkpoint، گزارش و evidence conventions.
- ایجاد branch مستقل `coordination/locks` و رجیستری `ACTIVE_LOCKS.json`.
- probe اولیه uniqueness و CAS انجام شد؛ stale attempt خطا داد و head روی commit برنده باقی ماند. آزمون واقعی دو حساب مستقل هنوز انجام نشده.
- GitHub Actions validation در چندین commit PR با conclusion=success اجرا شد؛ آخرین run مشاهده‌شده روی commit `17cc078cf5ad3ba9120813e0c3c9179a27ba689f` موفق بود. پس از آن چند تغییر مستنداتی دیگر ثبت شده‌اند؛ run نهایی روی آخرین head باید دوباره بررسی شود.

## وضعیت کار محصول
هیچ‌یک از EXP-01 تا EXP-27 در این bootstrap اجرا نشده است. کد سایت، محیط محلی، production، backup/restore، hosting، Voice-typing billing و امنیت عملیاتی ممیزی یا تغییر داده نشده‌اند. همه stageها NOT_STARTED باقی می‌مانند.

## وضعیت GitHub
- PR: https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/1
- Branch: `setup/control-plane-bootstrap`
- Lock branch: `coordination/locks`
- Main: هنوز زیرساخت اصلی را دریافت نکرده؛ PR ادغام نشده است.
- Visibility هنگام بررسی: PUBLIC؛ مالک باید آن را PRIVATE کند.
- branch protection و دسترسی هر حساب ChatGPT باید توسط مالک تنظیم/تأیید شوند.

## موارد باقی‌مانده برای عملیاتی‌شدن
1. تغییر visibility به PRIVATE.
2. بررسی و merge PR #1 به main توسط مالک.
3. اعمال branch protection و required checks.
4. اتصال GitHub به هر حساب ChatGPT و تأیید دسترسی Git Data write.
5. اجرای COORD-01 تا COORD-15 با دو حساب مستقل؛ تا آن زمان قفل CAS طراحی و probe شده اما multi-account contention به‌طور کامل اثبات نشده است.
6. حذف دستی branch آزمایشی `locks/atomic-probe` پس از پایان بررسی، در صورت عدم نیاز.
