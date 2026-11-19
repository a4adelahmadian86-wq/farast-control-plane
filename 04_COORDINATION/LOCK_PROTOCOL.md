# پروتکل قفل منابع

پروتکل رسمی و کامل قفل در `LOCK_MANAGER_PROTOCOL.md` است. این فایل فقط خلاصه الزام‌هاست.

## الزام
- همه تغییرات نوشتنی روی ماژول/فایل/schema/API contract/سند مشترک نیازمند acquire اتمیک از رجیستری `coordination/locks` هستند.
- منبع حقیقت: `04_COORDINATION/ACTIVE_LOCKS.json` روی branch مستقل `coordination/locks`.
- Acquire، heartbeat و release باید با GitHub Git Data API و `update_ref(expected_sha=...)` انجام شود؛ read-then-write عادی قفل نیست.
- تمام RESOURCE_KEYهای یک TASK باید در یک CAS گرفته شوند یا هیچ‌کدام.
- Lease پیش‌فرض 30 دقیقه؛ heartbeat هر 10 دقیقه و پیش از عملیات طولانی؛ fencing token اجباری.
- پیش از هر commit/PR، اعتبار lease و fencing token را دوباره بررسی کن.
- خطا، timeout یا ابهام در CAS = قفل گرفته نشده؛ STOP WRITES و reload/retry محدود.
- عامل فاقد ابزار GitHub Git Data write باید read-only بماند.
- PR و review همچنان لازم‌اند؛ lock به‌تنهایی مجوز merge/deploy نیست.

## آزمون
probe اولیه branch uniqueness و CAS انجام شد؛ جزئیات/محدودیت‌ها در `LOCK_MANAGER_PROTOCOL.md` ثبت شده است. آزمون رقابتی end-to-end با دو حساب مستقل هنوز تکمیل نشده و باید قبل از اتکای عملیاتی گسترده انجام شود.


## قرارداد فعال چندچتی
این سند فقط سابقه/مبانی پروتکل قفل است. در نسخه اجرایی فعلی، workerها حق اجرای CAS یا نوشتن مستقیم `ACTIVE_LOCKS.json` را ندارند. تمام claim/heartbeat/release از طریق فرمان‌های `/farast` و workflow مرکزی انجام می‌شود. مرجع جاری: `COORDINATOR_COMMANDS.md` و `COORDINATOR_TEST_PLAN.md`.

## تکمیل قرارداد فعال: هویت مکالمه و قفل granular

این بخش مکمل مرجع اجرایی `COORDINATOR_COMMANDS.md` است:

- CHAT_ID باید برای هر مکالمه مستقل تولید شود، در همان مکالمه ثابت بماند و بین چت‌های مختلف کپی نشود. قاعده یک Lease فعال برای هر CHAT_ID فقط همان مکالمه را محدود می‌کند؛ CHAT_ID/RUN_ID هویت واقعی GitHub را اثبات نمی‌کنند.
- کلید `repo:` قفل انحصاری کل مخزن هدف است؛ کلیدهای `dir:` با تمام مسیرهای فرزند تعارض دارند؛ `file:` و `doc:` برای مسیر یکسان معادل‌اند؛ کلیدهای منطقی مانند `module:` فقط با شناسه منطقی یکسان تعارض دارند. منابع دو target_repository متفاوت از هم مستقل‌اند.
- کلید legacy `repo:non:controlled-implementation` یک قفل سراسری NON است و فقط همان کار/دامنه تاریخی را نمایندگی می‌کند؛ برای مأموریت‌های مستقل جدید استفاده نشود.
- نبود پاسخ فرمان، صف Actions یا pending بودن reconciliation به معنی قفل منبع نیست. فقط وضعیت صریح coordinator و snapshot رجیستری، قفل واقعی را تعیین می‌کند. برای هر Issue در هر pass حداکثر ۳ فرمان قدیمی‌تر pending پردازش می‌شود؛ فرمان‌های تکراری همچنان باعث تأخیر می‌شوند.

