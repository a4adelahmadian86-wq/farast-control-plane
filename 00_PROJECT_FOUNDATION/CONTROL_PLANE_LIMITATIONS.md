# محدودیت‌ها و مرزهای عملیاتی Control Plane نسخه 1

## وضعیت و تضمین‌های اثبات‌شده
1. مخزن در آخرین بررسی با visibility برابر PUBLIC است. تا زمانی که مالک آن را خصوصی نکرده، فقط آماده‌سازی عمومی و غیرمحرمانه مجاز است؛ secret، credential، PII، dump، داده مشتری یا جزئیات محرمانه کسب‌وکار وارد نشود.
2. قفل منابع با Git ref compare-and-swap، lease و fencing token طراحی و پیاده‌سازی شده است. probe اولیه uniqueness و ردشدن update با SHA قدیمی ثبت شده؛ بااین‌حال رقابت واقعی دو حساب مستقل، چرخه کامل lease/heartbeat/release و سناریوهای stale fencing هنوز end-to-end اثبات نشده‌اند. بنابراین تضمین عملیاتی چندحسابی هنوز مشروط است.
3. GitHub Actions run #58 روی commit `2b0f683c3767a047f8437aad35b818fc562b1dcc` قراردادهای منبع را بررسی کرده است: فایل‌های لازم، JSON، دروازه بازیابی هر ۱۷ پرامپت، فیلد OPERATION_ID در checkpoint و وجود دروازه بازیابی در bundle. این آزمون static/source-level است و کیفیت معنایی، رفتار واقعی چت‌ها، دسترسی حساب‌های دیگر یا اجرای runtime را اثبات نمی‌کند.
4. GitHub تاریخچه و هویت حساب GitHub را ثبت می‌کند، اما به‌تنهایی هویت واقعی هر مکالمه ChatGPT یا استمرار اجرای پس‌زمینه را اثبات نمی‌کند. heartbeat خودکار/پس‌زمینه تضمین‌شده نیست.
5. کنترل‌پلین مخزن کد اجرایی سایت نیست. هیچ‌یک از EXP-01 تا EXP-27 در bootstrap اجرا نشده و هیچ ممیزی سایت، backup/restore، آزمون production، امنیت عملیاتی یا deployment انجام نشده است.
6. وضعیت branch protection هنوز تأیید نشده است. فهرست Rulesets در بررسی فعلی خالی بود؛ endpoint قدیمی Branch Protection برای اتصال حاضر قابل خواندن نبود. تا مشاهده مستقیم تنظیمات، enforcement فنی branch protection و required checks را فعال فرض نکن.
7. PR review نیز هنوز بازبینی مستقل ثبت‌شده ندارد؛ وجود CI سبز جایگزین review انسانی نیست.

## مرز استفاده فعلی
- می‌توان از کتابخانه برای آماده‌سازی عمومی، تحلیل read-only و کارهای غیرمحرمانه استفاده کرد.
- تغییر در مخزن محصول، انتشار، ادغام main، تغییر امنیت/مجوز یا عملیات مخرب همچنان تابع approval صریح و گردش‌کار مربوط است.
- پیش از استفاده محرمانه یا اجرای چندحسابی قابل اتکا، privacy، دسترسی هر حساب، branch protection و آزمون‌های پذیرش باید جداگانه تأیید شوند.

## شواهد
- PR #1: https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/1
- CI run #58: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43589665731
- آزمون‌های چندعاملی: `04_COORDINATION/MULTI_AGENT_REGRESSION_CASES.md`
- وضعیت راه‌اندازی: `../BOOTSTRAP_STATUS.md`
