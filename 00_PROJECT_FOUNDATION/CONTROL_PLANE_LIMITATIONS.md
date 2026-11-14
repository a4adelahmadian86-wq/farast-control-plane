# محدودیت‌ها و مرزهای عملیاتی Control Plane نسخه 1

## وضعیت و تضمین‌های اثبات‌شده
1. مخزن در آخرین بررسی PUBLIC است. مالک فعلاً خصوصی‌سازی را به تعویق انداخته؛ تا زمان تغییر visibility فقط کار عمومی و غیرمحرمانه مجاز است. secret، credential، PII، dump، داده مشتری یا جزئیات محرمانه وارد نشود.
2. قفل منابع با Git ref compare-and-swap، lease و fencing token طراحی و در branch مستقل coordination/locks پیاده‌سازی شده است. probe اولیه stale-SHA رد شده؛ رقابت واقعی دو حساب مستقل، چرخه کامل lease/heartbeat/release و stale fencing هنوز end-to-end اثبات نشده‌اند.
3. آخرین CIهای موفق قابل مشاهده روی commit f3143aeb2bc4ca2a4f5ccad18e613d7f8692ce26 عبارت‌اند از run #73 (pull_request) و run #72 (push): https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43591062893 و https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43591059766 . هر دو job شامل بررسی فایل‌های لازم و اعتبارسنجی JSON، schema نمونه‌ها و قراردادهای ۱۷ پرامپت بودند و SUCCESS شدند. Run #66 روی commit قدیمی‌تر 55604614ac9dac8839fb06c472e164c28eb4d20b به‌علت assertion بیش‌ازحد سخت درباره تعداد recovery marker در bundle شکست خورد؛ assertion اصلاح شد و runهای #72/#73 پس از آن موفق شدند. برای هر commit بعدی، وضعیت CI را از checks زنده همان SHA بخوان؛ این سند جایگزین وضعیت زنده نیست.
4. بررسی مستقیم منبع نشان داد هر ۱۷ پرامپت مستقل، URL شروع pinned به شاخه فعال، پروتکل interruption، MASTER-00، CAS، TASK_ID و OPERATION_ID را دارند: 17/17 PASS در read-back منبع. این بررسی دستی/source-level است، نه آزمون رفتار چت یا CI.
5. schemaهای Work Order و Checkpoint، پروتکل handoff، چارچوب پذیرش و PR template افزوده شده‌اند. اعتبارسنجی خودکار schemaها در workflow تعریف شده، اما اجرای CI روی head فعلی هنوز مشاهده نشده است.
6. مخزن کنترل‌پلین از مخزن محصول مستقل است. هیچ‌یک از EXP-01 تا EXP-27 در bootstrap اجرا نشده و هیچ ممیزی محصول، backup/restore واقعی، آزمون production، امنیت عملیاتی یا deployment انجام نشده است.
7. شاخه پیش‌فرض main در آخرین بررسی فقط README.md داشت؛ PR شماره ۱ باز و ادغام‌نشده است. پرامپت‌ها اکنون به شاخه setup/control-plane-bootstrap pinned شده‌اند. تا ادغام و تأیید وجود فایل‌ها در main، از main به‌عنوان منبع کامل استفاده نکن.
8. وضعیت branch protection هنوز تأیید نشده است. فهرست Rulesets در بررسی فعلی خالی بود؛ endpoint قدیمی Branch Protection برای اتصال حاضر قابل خواندن نبود. enforcement فنی branch protection و required checks را فعال فرض نکن.
9. PR #1 هنوز بازبینی مستقل ثبت‌شده ندارد؛ CI سبز جایگزین review انسانی نیست.
10. سند ۱۲ نوامبر در Library ده مرحله EXP دارد، اما نقشه ۱۷ پرامپتی که مالک در معماری فعلی ارائه/تأیید کرده با SPECIALIST_WORKFLOW.md و ۲۷ EXP این مخزن تطبیق دارد؛ سند ۱۰ مرحله‌ای در سیستم فعلی استفاده نمی‌شود مگر مالک خلاف آن را اعلام کند.\n11. گردش‌کار رویدادمحور PR #479 در مخزن مستقل هنوز منتقل نشده است. قابلیت‌های ارزشمند و نقص‌های آن در 04_COORDINATION/LEGACY_COORDINATOR_MIGRATION.md تحلیل شده‌اند. رجیستری CAS مرکزی موجود است، اما فرمان‌های خودکار Issue/label/review/close هنوز اجرا نمی‌شوند.

## مرز استفاده فعلی
- برای آماده‌سازی عمومی و تحلیل/آزمون غیرمحرمانه می‌توان از شاخه pinned استفاده کرد.
- اجرای نوشتنی روی مخزن عمومی فقط برای داده عمومی و غیرمحرمانه مجاز است؛ secrets، PII، داده مشتری یا اطلاعات محرمانه ممنوع.
- اجرای محرمانه یا چندحسابی قابل اتکا تا زمان خصوصی‌سازی، تأیید دسترسی هر حساب، branch protection و آزمون واقعی دو حساب مجاز/تأییدشده نیست.
- تغییر در مخزن محصول، انتشار، ادغام main، تغییر امنیت/مجوز یا عملیات مخرب همچنان تابع approval صریح و گردش‌کار مربوط است.

## شواهد
- PR #1: https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/1
- CIهای موفق روی commit f3143aeb2bc4ca2a4f5ccad18e613d7f8692ce26: run #73 و #72؛ هر دو SUCCESS. سابقه شکست run #66 روی commit قدیمی‌تر اصلاح شده است.
- آزمون‌های چندعاملی: 04_COORDINATION/MULTI_AGENT_REGRESSION_CASES.md
- وضعیت راه‌اندازی: ../BOOTSTRAP_STATUS.md
