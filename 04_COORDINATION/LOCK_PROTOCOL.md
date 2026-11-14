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
