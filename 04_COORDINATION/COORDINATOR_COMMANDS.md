# قرارداد فرمان‌های هماهنگ‌کننده چندچتی FARAST

## اصل اجرا
- فایل `04_COORDINATION/ACTIVE_LOCKS.json` فقط توسط workflow `.github/workflows/farast-coordinator.yml` نوشته می‌شود.
- همه فرمان‌ها در کامنت Issue ثبت می‌شوند؛ کامنت صندوق ورودی پایدار و تاریخچه است، نه منبع حقیقت مالکیت.
- هماهنگ‌کننده همه Issueهای FARAST را با یک concurrency group سراسری پردازش می‌کند. اجرای دوره‌ای هر پنج دقیقه فرمان‌های جامانده را بازیابی می‌کند.
- هیچ چت/حسابی حق نوشتن مستقیم در رجیستری قفل ندارد. اگر workflow فعال نیست یا پاسخ معتبر دریافت نشده، نوشتن روی منابع مشترک ممنوع است.
- این workflow تا ادغام PR کنترل‌پلین در شاخه پیش‌فرض، اجرای schedule را دریافت نمی‌کند؛ در این فاصله فقط منبع پیاده‌سازی/بازبینی است و برای استفاده عملیاتی آماده نیست.

## ساخت TASK
Issue باید عنوان `[FARAST-TASK]` داشته باشد. فیلد Target repository باید به شکل owner/name تکمیل شود و بخش Resource keys کلیدهای canonical و جداشده با خط جدید داشته باشد. Claim بدون هرکدام رد می‌شود. اگر خالی باشد، Claim رد می‌شود؛ برای هر کار باید دست‌کم یک کلید دقیق ثبت شود. fallback به قفل Issueمحور مجاز نیست.

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

مقادیر CHAT_ID و RUN_ID شناسه‌های metadata هستند و هویت واقعی مکالمه را اثبات نمی‌کنند؛ از alias غیرحساس استفاده کنید و شناسه خصوصی مکالمه را در مخزن عمومی ننویسید. هویت مجاز از actor GitHub و author_association بررسی می‌شود.

پاسخ موفق claim باید دقیقاً شامل عبارت **CLAIM GRANTED**، کلیدهای منبع، زمان پایان lease و fencing token باشد. بدون این پاسخ، claim موفق نیست.

## قواعد
1. Claim همه RESOURCE_KEYهای Issue را یکجا می‌گیرد یا هیچ‌کدام را؛ هر Issue در هر لحظه فقط یک owner فعال دارد، حتی اگر دو worker منابع disjoint درخواست کنند. branch قبلی یک Issue نیز قابل استفاده مجدد نیست؛ برای هر RUN شناسه یکتا لازم است.
2. یک fencing token برای کل مجموعه منابع یک claim صادر می‌شود.
3. lease پیش‌فرض ۳۰ دقیقه و بازه مجاز ۵ تا ۱۲۰ دقیقه است.
4. heartbeat/release/block/review فقط با actor، chat، run و token منطبق مجاز است.
5. پایان lease در reconciliation ثبت و قفل منقضی حذف می‌شود.
6. release به معنی اتمام کار نیست؛ review به معنی پذیرش نیست.
7. accept فقط وقتی مجاز است که Issue در وضعیت review و بدون lease باشد، لینک PR در بدنه Issue ثبت شده باشد، PR merged شده باشد و یک reviewer مستقل (نه نویسنده PR، نه worker اجراکننده و نه worker پذیرش‌دهنده) روی head فعلی approval داده باشد.
8. بستن دستی Issue یا افزودن دستی label agent:done بدون transition موفق accept در operation ledger رد و Issue دوباره باز می‌شود؛ label به‌تنهایی منبع پذیرش نیست.
9. عملیات با شناسه comment یکتا deduplicate می‌شود؛ پاسخ نیمه‌تمام پس از وقفه بازیابی می‌شود.
10. عدم پاسخ، timeout یا خطای workflow هرگز grant محسوب نمی‌شود؛ وضعیت را از رجیستری و Actions run دوباره بخوانید.

## محدودیت هویت چندچتی
GitHub هویت واقعی ChatGPT chat را تأیید نمی‌کند. CHAT_ID و RUN_ID خوداظهاری‌اند و فقط برای تشخیص نشست/اجرای worker استفاده می‌شوند. کنترل امنیتی واقعی بر حساب GitHub مجاز، مالکیت lease و fencing token متکی است.


## پیش‌نیاز پذیرش PR در مخزن دیگر
اگر PR مرتبط در مخزنی غیر از farast-control-plane (مانند مخزن محصول non) قرار دارد، در تنظیمات Actions مخزن کنترل‌پلین یک Repository Secret با نام FARAST_GITHUB_TOKEN تعریف کنید. توکن باید فقط دسترسی read به Pull requests و metadata مخزن هدف را داشته باشد. مقدار توکن هرگز در Issue یا فایل مخزن نوشته نشود. بدون این Secret، پذیرش cross-repository عمداً رد می‌شود؛ پس از تنظیم Secret یک فرمان accept جدید ثبت کنید.


## Branch وظیفه
Coordinator مقدار branch را به‌صورت work/GH-ISSUE_NUMBER-RUN_ID در رجیستری ثبت می‌کند و در claim بعدی previous_run/previous_branch/previous_target_repository را از history بازمی‌گرداند. خود workflow در مخزن هدف branch نمی‌سازد؛ worker دارنده lease باید target repository و branch را دقیقاً مطابق پاسخ claim بسازد. اگر previous_branch وجود داشت، worker ابتدا آن branch را read-only بررسی کند، آخرین commit تأییدشده/checkpoint را از سابقه کار استخراج و صحت آن را در target repository تأیید کند، سپس branch جدید را از همان commit بسازد؛ branch قبلی را هرگز تغییر ندهد. اگر checkpoint معتبر قابل تعیین نیست، قبل از هر write متوقف و گزارش دهد. branch استفاده‌شده قبلی برای همان Issue دوباره قابل claim نیست؛ RUN_ID جدید الزامی است. پذیرش PR فقط از branch آخرین رویداد REVIEW همان lease ممکن است.


## تفویض اختیار فرمان‌های چندچتی
سیاست فعال در `04_COORDINATION/ACTOR_AUTHORIZATION.json` اعمال می‌شود: OWNER همه فرمان‌ها را دارد؛ COLLABORATOR/MEMBER به‌صورت پیش‌فرض نقش WORKER می‌گیرند (claim/heartbeat/release/status/block/review) و حق unblock/reopen/accept ندارند. نقش SENIOR_MANAGER تمام فرمان‌ها را فقط پس از درج دقیق GitHub login در `actor_roles` و تأیید مالک دریافت می‌کند. READ_ONLY فقط status دارد. `actor_roles` فعلاً خالی است؛ بنابراین هیچ مدیر ارشدی به‌صورت حدسی مجاز نشده است. تغییر این فایل باید از PR و با تأیید مالک انجام شود.
