# وضعیت راه‌اندازی کنترل‌پلین

**آخرین بازبینی زنده:** 2026-11-14  
**وضعیت:** IMPLEMENTED_ON_REVIEW_BRANCH / NOT_MERGED / EXECUTION_GATES_PENDING

## کارهای انجام‌شده
- ساخت ساختار اسناد بنیادین، اهداف، نقشه راه، تصمیم‌ها، بازخوردها و وضعیت.
- حفظ متن کامل منبع نیازمندی نسخه ۲.۰ در `00_PROJECT_FOUNDATION/SOURCE_REQUIREMENTS_v2.md`.
- ایجاد MASTER-00 و ۱۷ پرامپت مستقل؛ نسخه یکپارچه در `05_PROMPT_LIBRARY/FARAST_EXECUTABLE_PROMPTS_COMPLETE.md` با نسخه 1.2.0.
- ایجاد راهنمای کاربر، Issue templates، پروتکل بازیابی وقفه، checkpoint، گزارش و conventions شواهد.
- ایجاد branch مستقل `coordination/locks` و رجیستری CAS با lease و fencing token.
- probe اولیه stale-SHA/CAS رد شده است؛ این فقط probe اولیه است و جای آزمون دو حساب مستقل را نمی‌گیرد.
- ممیزی ایستای دروازه مشترک هر ۱۷ پرامپت انجام شد: 17/17 PASS.
- GitHub Actions run #59 روی snapshot قبلی `1439bbcc8bd9d6f0945f671d2e8f7eb48a2e49bc` موفق شد؛ سپس run #60 روی commit `e803138c8b0edbf7243c7741023790f40df23e3e` نیز پس از همگام‌سازی وضعیت موفق شد. لینک‌ها: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43589728185 و https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43589789474.

## وضعیت محصول
هیچ‌یک از EXP-01 تا EXP-27 در این bootstrap اجرا نشده است. مخزن محصول `a4adelahmadian86-wq/non` تغییر داده نشده؛ کد سایت، محیط محلی، production، backup/restore، hosting، Voice-typing billing و امنیت عملیاتی هنوز ممیزی نشده‌اند. همه stageهای محصول باید تا زمان جمع‌آوری شواهد واقعی NOT_STARTED/UNKNOWN باقی بمانند.

## وضعیت GitHub
- PR: https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/1
- Branch: `setup/control-plane-bootstrap`
- SHA زنده head و وضعیت ahead/behind را همیشه از metadata و compare زنده PR #1 بخوان؛ SHAهای تاریخی در لینک‌های CI بالا ثبت شده‌اند.
- Lock branch: `coordination/locks`
- PR #1: OPEN، NOT MERGED؛ GitHub API در آخرین بررسی `mergeable=true` و `mergeable_state=clean` گزارش کرد.
- تاریخچه PR و main واگراست؛ آخرین compare نشان داد دو commit روی main شامل sync bundle و revert همان تغییر بودند و تغییر فایل خالصی نسبت به merge-base باقی نمانده است. پیش از merge، compare زنده را دوباره بررسی کن.
- Visibility: PUBLIC؛ مالک فعلاً خصوصی‌سازی را به تعویق انداخته است. تا تغییر visibility فقط کار عمومی و غیرمحرمانه مجاز است.
- Rulesets فهرست‌شده: صفر. وضعیت legacy branch protection از اتصال فعلی قابل خواندن نبود؛ پس فعال‌بودن branch protection تأیید نشده است.
- دسترسی این اتصال به مخزن در زمان بررسی admin/push بود؛ دسترسی سایر حساب‌ها یا چت‌ها جداگانه تأیید نشده است.
- Review submission و inline review thread مستقلی برای PR #1 ثبت نشده بود.

## دروازه‌های باقی‌مانده پیش از اجرای محرمانه/چندحسابی
1. مالک در زمان مناسب visibility را PRIVATE کند و آثار/دسترسی‌ها را بررسی کند.
2. برای هر حساب/اتصال ChatGPT، دسترسی read/write و ابزار Git Data/CAS جداگانه آزمایش شود.
3. branch protection و required check روی main فعال و از طریق تنظیمات زنده تأیید شود.
4. COORD-01 تا COORD-15 و آزمون‌های وقفه/عدم‌تکرار با دو حساب مستقل و fixtureهای آزمایشی اجرا و evidence ثبت شوند.
5. بازبینی مستقل PR #1 انجام شود؛ سپس تصمیم merge فقط با اختیار مالک.
6. پس از merge مجاز، صحت فایل‌ها و CI روی main دوباره بررسی شود.

## وضعیت آزمون
- Static prompt/bootstrap validation: PASS (17/17).
- CI run #59 و #60: PASS.
- Full multi-account CAS contention: NOT_RUN.
- Full interruption/idempotency end-to-end suite: NOT_RUN.
- Private-repository access tests: BLOCKED/NOT_RUN چون مخزن هنوز public است.
- Independent review: NOT_RUN.
- Product audit / production readiness: NOT_STARTED.

**نتیجه:** کتابخانه و کنترل‌پلین روی شاخه PR برای شروع کارهای عمومی و غیرمحرمانه آماده‌اند؛ کنترل‌پلین هنوز merge نشده و برای اجرای محرمانه، چندحسابی قابل اتکا یا production-ready اعلام نمی‌شود.
