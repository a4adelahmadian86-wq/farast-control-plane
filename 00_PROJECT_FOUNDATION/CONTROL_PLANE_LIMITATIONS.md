# محدودیت‌ها و مرزهای عملیاتی Control Plane نسخه 1

## وضعیت و تضمین‌های اثبات‌شده
1. مخزن در آخرین بررسی PUBLIC است. مالک فعلاً خصوصی‌سازی را به تعویق انداخته؛ تا زمان تغییر visibility فقط کار عمومی و غیرمحرمانه مجاز است. secret، credential، PII، dump، داده مشتری یا جزئیات محرمانه وارد نشود.
2. قفل منابع با Git ref compare-and-swap، lease و fencing token طراحی و در branch مستقل coordination/locks پیاده‌سازی شده است. probe اولیه stale-SHA رد شده؛ رقابت واقعی دو حساب مستقل، چرخه کامل lease/heartbeat/release و stale fencing هنوز end-to-end اثبات نشده‌اند.
3. آخرین CI موفق قابل مشاهده run #62 روی commit 4f83e136059066c719130a26b40ab6343a2e1f09 است: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43589931689 . Run #66 روی commit قدیمی‌تر 55604614ac9dac8839fb06c472e164c28eb4d20b به‌علت assertion بیش‌ازحد سخت درباره تعداد recovery marker در bundle شکست خورد: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43590509141 . آن assertion اصلاح و اعتبارسنجی schemaها اضافه شده، اما برای head فعلی dd87d7f36bf22562a30a264bb141e84ab8f25667 اجرای جدید CI در API مشاهده نشده است؛ بنابراین نتیجه CI روی head فعلی UNVERIFIED است.
4. بررسی مستقیم منبع نشان داد هر ۱۷ پرامپت مستقل، URL شروع pinned به شاخه فعال، پروتکل interruption، MASTER-00، CAS، TASK_ID و OPERATION_ID را دارند: 17/17 PASS در read-back منبع. این بررسی دستی/source-level است، نه آزمون رفتار چت یا CI.
5. schemaهای Work Order و Checkpoint، پروتکل handoff، چارچوب پذیرش و PR template افزوده شده‌اند. اعتبارسنجی خودکار schemaها در workflow تعریف شده، اما اجرای CI روی head فعلی هنوز مشاهده نشده است.
6. مخزن کنترل‌پلین از مخزن محصول مستقل است. هیچ‌یک از EXP-01 تا EXP-27 در bootstrap اجرا نشده و هیچ ممیزی محصول، backup/restore واقعی، آزمون production، امنیت عملیاتی یا deployment انجام نشده است.
7. شاخه پیش‌فرض main در آخرین بررسی فقط README.md داشت؛ PR شماره ۱ باز و ادغام‌نشده است. پرامپت‌ها اکنون به شاخه setup/control-plane-bootstrap pinned شده‌اند. تا ادغام و تأیید وجود فایل‌ها در main، از main به‌عنوان منبع کامل استفاده نکن.
8. وضعیت branch protection هنوز تأیید نشده است. فهرست Rulesets در بررسی فعلی خالی بود؛ endpoint قدیمی Branch Protection برای اتصال حاضر قابل خواندن نبود. enforcement فنی branch protection و required checks را فعال فرض نکن.
9. PR #1 هنوز بازبینی مستقل ثبت‌شده ندارد؛ CI سبز جایگزین review انسانی نیست.
10. دو نسخه ورک‌فلو در منابع موجود است: سند ۱۲ نوامبر در Library ده مرحله EXP دارد؛ SPECIALIST_WORKFLOW.md در مخزن کنترل ۲۷ مرحله دارد. نقشه ۱۷ پرامپتی ارائه‌شده توسط مالک با مدل ۲۷ مرحله‌ای تطبیق دارد؛ تعیین تکلیف نسخه ۱۰ مرحله‌ای نیازمند تأیید مالک است.

## مرز استفاده فعلی
- برای آماده‌سازی عمومی و تحلیل/آزمون غیرمحرمانه می‌توان از شاخه pinned استفاده کرد.
- اجرای نوشتنی روی مخزن عمومی فقط برای داده عمومی و غیرمحرمانه مجاز است؛ secrets، PII، داده مشتری یا اطلاعات محرمانه ممنوع.
- اجرای محرمانه یا چندحسابی قابل اتکا تا زمان خصوصی‌سازی، تأیید دسترسی هر حساب، branch protection و آزمون واقعی دو حساب مجاز/تأییدشده نیست.
- تغییر در مخزن محصول، انتشار، ادغام main، تغییر امنیت/مجوز یا عملیات مخرب همچنان تابع approval صریح و گردش‌کار مربوط است.

## شواهد
- PR #1: https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/1
- آخرین CI موفق قابل مشاهده: run #62، commit 4f83e136059066c719130a26b40ab6343a2e1f09.
- آخرین CI ناموفق قابل مشاهده: run #66، commit 55604614ac9dac8839fb06c472e164c28eb4d20b.
- آزمون‌های چندعاملی: 04_COORDINATION/MULTI_AGENT_REGRESSION_CASES.md
- وضعیت راه‌اندازی: ../BOOTSTRAP_STATUS.md
