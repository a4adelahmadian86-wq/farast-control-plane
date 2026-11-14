# برنامه آزمون پذیرش هماهنگ‌کننده چندچتی

## سطح ۱ — اعتبارسنجی منبع و workflow
- YAML parse و GitHub Actions workflow validation.
- workflow فقط در یک concurrency group سراسری اجرا شود.
- schedule پنج‌دقیقه‌ای، issue_comment، issues و workflow_dispatch تعریف شده باشد.
- permissions حداقلی: contents:write، issues:write، pull-requests:read.
- همه mutationهای رجیستری از یک مسیر single-writer انجام شوند.
- هیچ worker مستقیم ACTIVE_LOCKS.json را ننویسد.

## سطح ۲ — آزمون‌های منطقی/fixture
- دو Issue متفاوت با RESOURCE_KEY مشترک: فقط یک claim موفق.
- دو Issue با RESOURCE_KEYهای disjoint: هر دو claim موفق.
- چند claim برای یک Issue: فقط یک lease معتبر.
- comment ID تکراری: بدون token یا عملیات تکراری.
- actor غیرمجاز: رد.
- heartbeat با actor/chat/run/token اشتباه: رد.
- release با token قدیمی: رد.
- lease منقضی: پاک‌سازی و ثبت history.
- timeout پس از commit رجیستری و قبل از پاسخ: پاسخ با marker بازیابی شود.
- بسته‌شدن Issue بدون پذیرش: بازگشایی.
- accept بدون PR ادغام‌شده یا approval مستقل روی head فعلی: رد.
- accept معتبر: label done و بسته‌شدن Issue.

## سطح ۳ — آزمون واقعی چندحسابی
- حداقل دو حساب GitHub مستقل و مجاز، از دو نشست ChatGPT جداگانه.
- claim هم‌زمان روی یک RESOURCE_KEY و تأیید اینکه دقیقاً یکی grant می‌گیرد.
- claim هم‌زمان روی منابع disjoint و تأیید موفقیت هر دو.
- قطع اتصال یکی از چت‌ها، انقضای lease و takeover با fencing token جدید.
- ارسال دوباره همان فرمان و تأیید idempotency.
- تلاش عامل قدیمی برای heartbeat/release/write پس از takeover و رد آن.
- تأیید اینکه هر دو حساب دسترسی لازم به مخزن و Actions دارند.

## معیار اعلام آمادگی
هیچ‌یک از آزمون‌های سطح ۳ با fixture یا حساب واحد جایگزین نمی‌شود. تا زمان اجرای آزمون واقعی دو حساب، وضعیت Multi-account E2E برابر NOT_RUN است.
