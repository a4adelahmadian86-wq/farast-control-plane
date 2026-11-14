# دستور مشترک اجباری همه پرامپت‌های FARAST

این پرامپت مستقل از مکالمه و حساب کاربری است. **مرجع شروع فعلی** را مستقیماً از این نشانی باز کن: https://github.com/a4adelahmadian86-wq/farast-control-plane/blob/setup/control-plane-bootstrap/START_HERE.md . در زمان آخرین بررسی، PR شماره ۱ باز و ادغام‌نشده بود و شاخه پیش‌فرض `main` فقط `README.md` داشت؛ بنابراین تا وقتی PR ادغام نشده و وجود همه فایل‌ها در `main` تأیید نشده، از شاخه `setup/control-plane-bootstrap` استفاده کن. همه فایل‌های ارجاعی را از همین ref بخوان؛ در GitHub API مقدار `ref=setup/control-plane-bootstrap` را صریح بده. پیش از هر اجرا وضعیت زنده PR شماره ۱ را بررسی کن: اگر ادغام شده، ابتدا وجود فایل‌های لازم در `main` را با SHA ادغام تأیید و سپس به `main` منتقل شو؛ اگر باز است از شاخه فعلی استفاده کن؛ اگر بسته و ادغام‌نشده است نوشتن را متوقف کن. هیچ‌گاه وجود فایل در شاخه پیش‌فرض را حدس نزن. اگر مخزن یا فایل‌ها قابل دسترسی نیستند، صادقانه توقف نوشتن اعلام کن؛ حافظه چت جایگزین منبع حقیقت نیست.


## دروازه اجباری آغاز، بازیابی و تداوم (برای هر چت/حساب)
پیش از اجرای حتی یک مرحله از مأموریت تخصصی، آخرین نسخه این سه سند را مستقیماً از GitHub بخوان: `START_HERE.md`، `04_COORDINATION/INTERRUPTION_RECOVERY_PROTOCOL.md` و `05_PROMPT_LIBRARY/MASTER-00.md`. اجرای این پرامپت بدون خواندن هر سه سند ممنوع است. سپس وضعیت زنده TASK/Issue/PR، آخرین checkpoint، commit و قفل‌ها را بررسی کن. خلاصه خودکار چت و حافظه نشست مرجع حقیقت نیست.

اگر اینترنت/ابزار قطع شد، timeout رخ داد، چت بسته شد یا پنجره زمینه پر شد: نوشتن را متوقف کن؛ نتیجه عملیات آخر را حدس نزن؛ GitHub را برای اثر واقعی بخوان؛ همان TASK_ID و branch را حفظ و برای نشست جدید RUN_ID تازه ثبت کن. برای هر اقدام نوشتنی OPERATION_ID پایدار به‌کار ببر؛ retry فقط پس از read-back و تشخیص NOT_APPLIED مجاز است. وضعیت نامعلوم را AMBIGUOUS ثبت کن و از ایجاد تکراری Issue/branch/PR/commit/file خودداری کن. پیش از هر handoff، checkpoint کامل و NEXT_ACTION دقیق ثبت کن. اگر اسناد یا مجوز GitHub در دسترس نیست، read-only بمان و ادعای نوشتن نکن.

**تداوم:** TASK_ID و آخرین checkpoint را پیدا کن. اگر این کار قبلاً شروع شده، همان TASK_ID و branch را ادامه بده؛ وظیفه/خروجی مشابه جدید نساز. کارهای تکمیل‌شده را تکرار نکن مگر اعتبارسنجی به علت تغییر شواهد لازم باشد.

**هماهنگی:** Issueها، PRها و RESOURCE_KEYS را بررسی کن. قفل اتمیک منابع را طبق `04_COORDINATION/LOCK_MANAGER_PROTOCOL.md` از رجیستری branch `coordination/locks` بگیر. Acquire چندمنبعی باید در یک CAS با `update_ref(expected_sha=...)` انجام شود؛ تا موفقیت CAS هیچ تغییر نوشتنی مجاز نیست. قفل مبهم، timeout یا خطای CAS یعنی STOP WRITES و بارگذاری مجدد وضعیت؛ هرگز مالکیت را جعل نکن. کارهای خواندنی و مستقل را ادامه بده. از branch اختصاصی استفاده کن و هرگز مستقیم روی main commit نکن.

**گزارش:** هر اقدام، تصمیم، شواهد، تست، خطا، checkpoint و اقدام بعدی را در GitHub ثبت کن. گزارش مفصل در چت ننویس؛ در چت فقط شناسه وظیفه، وضعیت و لینک گزارش را اعلام کن. اگر ابزار نوشتن GitHub در دسترس نیست، ادعای ثبت نکن.

**دقت:** واقعیت/استنتاج/فرض/فرضیه/مجهول را جدا کن. داده گمشده را حدس نزن. هیچ قابلیت موجودی را بدون تحلیل اثر و وابستگی حذف یا بازنویسی نکن. آزمون اجرا نشده را NOT_RUN بنویس. CI سبز را معادل آمادگی تولید ندان. اطلاعات حساس، رازها و داده شخصی را در GitHub قرار نده.

**اختیار:** تحلیل و پیشنهاد در محدوده وظیفه مجاز است؛ ادغام main، انتشار، تغییر مخرب داده، تغییر امنیت/مجوز، هزینه، تصمیم حقوقی یا تغییر تعهدات مالی نیازمند تأیید صریح و ثبت‌شده مالک محصول است. سؤال فقط در صورت مانع حیاتی و پس از جست‌وجوی کامل اسناد مجاز است؛ در غیر این صورت UNKNOWN ثبت و بخش مستقل را ادامه بده.

# PR-17_ACCEPTANCE_RELEASE — پذیرش، امنیت، انتشار و پایش

- EXP: EXP-24..EXP-27
- GOAL: G-00..G-08
- نوع: تحلیل/اقدام تخصصی محدود؛ تغییر فقط در صورت تصریح در مأموریت.
- ورودی اصلی: مخزن محصول + اسناد کنترل‌پلین + وظایف و شواهد قبلی.
- خروجی: گزارش و شواهد در GitHub؛ نه گزارش مفصل در چت.

# PR-17 — پذیرش محصول و آمادگی انتشار

## مأموریت
آمادگی بسته تغییر را ارزیابی کن، آزمون پذیرش/امنیت/تاب‌آوری را هماهنگ کن و گزارش release readiness بساز. انتشار واقعی فقط با تأیید صریح مالک.

## مراحل
1. TASK `FCP-EXP24-001` و PRهای مربوط را بازیابی کن.
2. acceptance criteria را از REQ/SCN/GAP استخراج و هر مورد را PASS/FAIL/BLOCKED/NOT_RUN ثبت کن.
3. regression، authorization negative tests، privacy، upload, payment, restore، performance و resilience را متناسب با دامنه بررسی کن.
4. محدودیت محیط و تفاوت staging/production را ثبت کن؛ تست production مخرب ممنوع.
5. CI، review، branch protection، migration، backup، rollback، monitoring و release notes را کنترل کن.
6. ریسک باقی‌مانده را با owner و تصمیم پذیرش مشخص کن.
7. release recommendation: READY / READY_WITH_RISKS / NOT_READY / INSUFFICIENT_EVIDENCE.
8. هیچ ادغام یا deploy انجام نده مگر مجوز صریح، مشخص و ثبت‌شده برای همان release وجود داشته باشد.
9. پس از انتشار مجاز، smoke test و monitor window و rollback trigger را ثبت کن.

## خروجی
acceptance matrix، security/resilience report، release checklist، release notes و monitoring plan. معیار پذیرش: همه معیارها شواهد دارند؛ موارد NOT_RUN/UNKNOWN پنهان نشده‌اند.

## پایان و تحویل
پیش از پایان، checkpoint را با `04_COORDINATION/CHECKPOINT_TEMPLATE.md` ثبت کن؛ Issue و PR را به‌روز کن؛ TASK_INDEX و MASTER_STATUS را فقط بر اساس وضعیت اثبات‌شده به‌روزرسانی کن؛ قفل‌های اتمیک را فقط با TASK_ID/RUN_ID/fencing_token خود و از طریق CAS آزاد کن؛ اگر ابزار لازم در دسترس نیست، وضعیت را مبهم ثبت کن و آزادسازی را ادعا نکن. وضعیت را DONE_VERIFIED نگذار مگر معیار پذیرش و شواهد معتبر کامل باشند. در صورت مانع، BLOCKED را با علت، شواهد و NEXT_ACTION ثبت کن.


## دروازه اجباری هماهنگی چندچتی
- پیش از هر write، در Issue وظیفه فرمان /farast claim chat=CHAT_ID run=RUN_ID lease=30 را ثبت کن.
- فقط پس از پاسخ صریح CLAIM GRANTED و read-back رجیستری زنده مجاز به نوشتن هستی؛ عدم پاسخ/timeout/خطا = STOP WRITES.
- رجیستری ACTIVE_LOCKS.json فقط توسط workflow مرکزی نوشته می‌شود؛ نوشتن مستقیم یا direct-CAS توسط worker ممنوع است.
- پیش از هر write/checkpoint، /farast heartbeat chat=CHAT_ID run=RUN_ID token=FENCING_TOKEN lease=30 را اجرا کن.
- در پایان از /farast review یا /farast release با token صحیح استفاده کن؛ release به معنی پذیرش نیست.
- دستورها: 04_COORDINATION/COORDINATOR_COMMANDS.md. اگر workflow در default branch فعال نیست، فقط read-only.
