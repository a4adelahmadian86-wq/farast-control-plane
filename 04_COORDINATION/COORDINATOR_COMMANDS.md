# قرارداد فرمان‌های هماهنگ‌کننده چندچتی FARAST

## اصل اجرا
- فایل `04_COORDINATION/ACTIVE_LOCKS.json` فقط توسط workflow `.github/workflows/farast-coordinator.yml` نوشته می‌شود.
- همه فرمان‌ها در کامنت Issue ثبت می‌شوند؛ کامنت صندوق ورودی پایدار و تاریخچه است، نه منبع حقیقت مالکیت.
- هماهنگ‌کننده همه Issueهای FARAST را با یک concurrency group سراسری پردازش می‌کند. اجرای دوره‌ای هر پنج دقیقه فرمان‌های جامانده را بازیابی می‌کند.
- هیچ چت/حسابی حق نوشتن مستقیم در رجیستری قفل ندارد. اگر workflow فعال نیست یا پاسخ معتبر دریافت نشده، نوشتن روی منابع مشترک ممنوع است.
- این workflow تا ادغام PR کنترل‌پلین در شاخه پیش‌فرض، اجرای schedule را دریافت نمی‌کند؛ در این فاصله فقط منبع پیاده‌سازی/بازبینی است و برای استفاده عملیاتی آماده نیست.

## ساخت TASK
Issue باید عنوان `[FARAST-TASK]` داشته باشد. در بخش Resource keys کلیدهای canonical و جداشده با خط جدید درج شوند. اگر خالی باشد، کلید پیش‌فرض `task:gh-N` فقط همان Issue را محافظت می‌کند و برای منابع مشترک کافی نیست.

نمونه:
```text
### Resource keys
module:payments
file:app/Services/PaymentService.php
api-contract:payment-callback
```

## فرمان‌ها
هر فرمان را در یک کامنت مستقل و با یک عملیات بنویسید:

- `/farast claim chat=CHAT_ID run=RUN_ID lease=30`
- `/farast heartbeat chat=CHAT_ID run=RUN_ID token=FENCING_TOKEN lease=30`
- `/farast release chat=CHAT_ID run=RUN_ID token=FENCING_TOKEN`
- `/farast status`
- `/farast block chat=CHAT_ID run=RUN_ID token=FENCING_TOKEN`
- `/farast unblock`
- `/farast review chat=CHAT_ID run=RUN_ID token=FENCING_TOKEN`
- `/farast reopen`
- `/farast accept pr=https://github.com/OWNER/REPO/pull/NUMBER`

مقادیر CHAT_ID و RUN_ID شناسه‌های metadata هستند و هویت واقعی مکالمه را اثبات نمی‌کنند. هویت مجاز از actor GitHub و author_association بررسی می‌شود.

## قواعد
1. Claim همه RESOURCE_KEYهای Issue را یکجا می‌گیرد یا هیچ‌کدام را.
2. یک fencing token برای کل مجموعه منابع یک claim صادر می‌شود.
3. lease پیش‌فرض ۳۰ دقیقه و بازه مجاز ۵ تا ۱۲۰ دقیقه است.
4. heartbeat/release/block/review فقط با actor، chat، run و token منطبق مجاز است.
5. پایان lease در reconciliation ثبت و قفل منقضی حذف می‌شود.
6. release به معنی اتمام کار نیست؛ review به معنی پذیرش نیست.
7. accept فقط وقتی مجاز است که Issue در وضعیت review و بدون lease باشد و PR مرتبط merged شده و یک reviewer مستقل (نه نویسنده PR و نه worker پذیرش‌دهنده) روی head فعلی approval داده باشد.
8. بستن دستی Issue بدون label پذیرش agent:done رد و Issue دوباره باز می‌شود.
9. عملیات با شناسه comment یکتا deduplicate می‌شود؛ پاسخ نیمه‌تمام پس از وقفه بازیابی می‌شود.
10. عدم پاسخ، timeout یا خطای workflow هرگز grant محسوب نمی‌شود؛ وضعیت را از رجیستری و Actions run دوباره بخوانید.

## محدودیت هویت چندچتی
GitHub هویت واقعی ChatGPT chat را تأیید نمی‌کند. CHAT_ID و RUN_ID خوداظهاری‌اند و فقط برای تشخیص نشست/اجرای worker استفاده می‌شوند. کنترل امنیتی واقعی بر حساب GitHub مجاز، مالکیت lease و fencing token متکی است.
