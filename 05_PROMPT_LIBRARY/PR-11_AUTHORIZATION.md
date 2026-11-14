# دستور مشترک اجباری همه پرامپت‌های FARAST

این پرامپت مستقل از مکالمه و حساب کاربری است. **مرجع شروع فعلی** را مستقیماً از این نشانی باز کن: https://github.com/a4adelahmadian86-wq/farast-control-plane/blob/setup/control-plane-bootstrap/START_HERE.md . در زمان آخرین بررسی، PR شماره ۱ باز و ادغام‌نشده بود و شاخه پیش‌فرض `main` فقط `README.md` داشت؛ بنابراین تا وقتی PR ادغام نشده و وجود همه فایل‌ها در `main` تأیید نشده، از شاخه `setup/control-plane-bootstrap` استفاده کن. همه فایل‌های ارجاعی را از همین ref بخوان؛ در GitHub API مقدار `ref=setup/control-plane-bootstrap` را صریح بده. پیش از هر اجرا وضعیت زنده PR شماره ۱ را بررسی کن: اگر ادغام شده، ابتدا وجود فایل‌های لازم در `main` را با SHA ادغام تأیید و سپس به `main` منتقل شو؛ اگر باز است از شاخه فعلی استفاده کن؛ اگر بسته و ادغام‌نشده است نوشتن را متوقف کن. هیچ‌گاه وجود فایل در شاخه پیش‌فرض را حدس نزن. اگر مخزن یا فایل‌ها قابل دسترسی نیستند، صادقانه توقف نوشتن اعلام کن؛ حافظه چت جایگزین منبع حقیقت نیست.


## دروازه اجباری آغاز، بازیابی و تداوم (برای هر چت/حساب)
پیش از اجرای حتی یک مرحله از مأموریت تخصصی، آخرین نسخه این سه سند را مستقیماً از GitHub بخوان: `START_HERE.md`، `04_COORDINATION/INTERRUPTION_RECOVERY_PROTOCOL.md` و `05_PROMPT_LIBRARY/MASTER-00.md`. اجرای این پرامپت بدون خواندن هر سه سند ممنوع است. سپس وضعیت زنده TASK/Issue/PR، آخرین checkpoint، commit و قفل‌ها را بررسی کن. خلاصه خودکار چت و حافظه نشست مرجع حقیقت نیست.

اگر اینترنت/ابزار قطع شد، timeout رخ داد، چت بسته شد یا پنجره زمینه پر شد: نوشتن را متوقف کن؛ نتیجه عملیات آخر را حدس نزن؛ GitHub را برای اثر واقعی بخوان؛ همان TASK_ID را حفظ کن، اما برای هر اجرای جدید RUN_ID و branch اختصاصی تازه بگیر؛ هرگز branch قبلی را دوباره استفاده نکن. برای هر اقدام نوشتنی OPERATION_ID پایدار به‌کار ببر؛ retry فقط پس از read-back و تشخیص NOT_APPLIED مجاز است. وضعیت نامعلوم را AMBIGUOUS ثبت کن و از ایجاد تکراری Issue/branch/PR/commit/file خودداری کن. پیش از هر handoff، checkpoint کامل و NEXT_ACTION دقیق ثبت کن. اگر اسناد یا مجوز GitHub در دسترس نیست، read-only بمان و ادعای نوشتن نکن.

**تداوم:** TASK_ID و آخرین checkpoint را پیدا کن. اگر این کار قبلاً شروع شده، همان TASK_ID و checkpoint را ادامه بده؛ پس از claim جدید فقط branch اختصاصی صادرشده برای RUN جدید را استفاده کن و branch قبلی را read-only نگه دار؛ وظیفه/خروجی مشابه جدید نساز. کارهای تکمیل‌شده را تکرار نکن مگر اعتبارسنجی به علت تغییر شواهد لازم باشد.

**هماهنگی:** Issueها، PRها و RESOURCE_KEYS را بررسی کن. claim/heartbeat/release را فقط با فرمان‌های `/farast` طبق `04_COORDINATION/COORDINATOR_COMMANDS.md` انجام بده. رجیستری `coordination/locks` فقط توسط workflow مرکزی نوشته می‌شود؛ هرگز مستقیم آن را تغییر نده. قفل مبهم، timeout یا خطای coordinator یعنی STOP WRITES و بارگذاری مجدد وضعیت؛ هرگز مالکیت را جعل نکن. کارهای خواندنی و مستقل را ادامه بده. از branch اختصاصی استفاده کن و هرگز مستقیم روی main commit نکن.

**گزارش:** هر اقدام، تصمیم، شواهد، تست، خطا، checkpoint و اقدام بعدی را در GitHub ثبت کن. گزارش مفصل در چت ننویس؛ در چت فقط شناسه وظیفه، وضعیت و لینک گزارش را اعلام کن. اگر ابزار نوشتن GitHub در دسترس نیست، ادعای ثبت نکن.

**دقت:** واقعیت/استنتاج/فرض/فرضیه/مجهول را جدا کن. داده گمشده را حدس نزن. هیچ قابلیت موجودی را بدون تحلیل اثر و وابستگی حذف یا بازنویسی نکن. آزمون اجرا نشده را NOT_RUN بنویس. CI سبز را معادل آمادگی تولید ندان. اطلاعات حساس، رازها و داده شخصی را در GitHub قرار نده.

**اختیار:** تحلیل و پیشنهاد در محدوده وظیفه مجاز است؛ ادغام main، انتشار، تغییر مخرب داده، تغییر امنیت/مجوز، هزینه، تصمیم حقوقی یا تغییر تعهدات مالی نیازمند تأیید صریح و ثبت‌شده مالک محصول است. سؤال فقط در صورت مانع حیاتی و پس از جست‌وجوی کامل اسناد مجاز است؛ در غیر این صورت UNKNOWN ثبت و بخش مستقل را ادامه بده.

# PR-11_AUTHORIZATION — هویت، نقش و مجوزها

- EXP: EXP-12
- GOAL: G-03
- نوع: تحلیل/اقدام تخصصی محدود؛ تغییر فقط در صورت تصریح در مأموریت.
- ورودی اصلی: مخزن محصول + اسناد کنترل‌پلین + وظایف و شواهد قبلی.
- خروجی: گزارش و شواهد در GitHub؛ نه گزارش مفصل در چت.

# PR-11 — ممیزی هویت، مسئولیت و مجوز

## مأموریت
بررسی کن آیا مدل فعلی هویت، حساب، نقش، مسئولیت اصلی/فرعی، دپارتمان، scope و تفویض اختیار با نیازمندی مصوب سازگار است.

## مراحل
1. TASK `FCP-EXP12-001` را بازیابی کن.
2. مدل account lifecycle، phone verification، OTP/password، recovery، suspension/deletion/restore و promotion/demotion را ترسیم کن.
3. legacy role، role assignments، direct grants، allow/deny، scopes و authorization middleware را جدا بررسی کن.
4. ماتریس actor × action × resource × scope و مسیرهای privilege escalation بساز.
5. server-side authorization را از UI visibility جدا آزمون/ارزیابی کن.
6. قاعده مدیر اصلی، مدیر ارشد در محدوده تفویض، پیشنهاد خارج از scope و تأیید نهایی را با کد و تست مقایسه کن.
7. data leakage بین دپارتمان‌ها، تغییر مجوز و اثر فوری آن را بررسی کن.
8. هیچ permission یا role را تغییر نده؛ اصلاحات را با تست منفی پیشنهاد بده.

## خروجی
authorization matrix، lifecycle diagram، gap/risk report و تست‌های لازم. معیار پذیرش: همه ادعاها به policy/code/test وصل و bypassهای محتمل مستند باشند.

## پایان و تحویل
پیش از پایان، checkpoint را با `04_COORDINATION/CHECKPOINT_TEMPLATE.md` ثبت کن؛ Issue و PR را به‌روز کن؛ TASK_INDEX و MASTER_STATUS را فقط بر اساس وضعیت اثبات‌شده به‌روزرسانی کن؛ قفل را فقط با فرمان `/farast release` و TASK_ID/RUN_ID/fencing_token خود آزاد کن؛ اگر ابزار لازم در دسترس نیست، وضعیت را مبهم ثبت کن و آزادسازی را ادعا نکن. وضعیت را DONE_VERIFIED نگذار مگر معیار پذیرش و شواهد معتبر کامل باشند. در صورت مانع، BLOCKED را با علت، شواهد و NEXT_ACTION ثبت کن.


## دروازه اجباری هماهنگی چندچتی
- پیش از هر write، در Issue وظیفه فرمان /farast claim chat=CHAT_ID run=RUN_ID lease=30 را ثبت کن.
- فقط پس از پاسخ صریح CLAIM GRANTED و read-back رجیستری زنده مجاز به نوشتن هستی؛ target_repository و branch اختصاصی همان RUN را عیناً از پاسخ بردار. عدم پاسخ/timeout/خطا = STOP WRITES.
- رجیستری ACTIVE_LOCKS.json فقط توسط workflow مرکزی نوشته می‌شود؛ نوشتن مستقیم یا direct-CAS توسط worker ممنوع است.
- پیش از هر write/checkpoint، /farast heartbeat chat=CHAT_ID run=RUN_ID token=FENCING_TOKEN lease=30 را اجرا کن.
- در پایان از /farast review یا /farast release با token صحیح استفاده کن؛ release به معنی پذیرش نیست.
- دستورها: 04_COORDINATION/COORDINATOR_COMMANDS.md. اگر workflow در default branch فعال نیست، فقط read-only.


**ایمنی چندچتی و handoff:** branch قبلی یک Issue قابل claim مجدد نیست. اگر claim با branch_reuse رد شد، RUN_ID جدید و یکتا انتخاب کن. CLAIM GRANTED بدون read-back وضعیت زنده رجیستری و تطبیق actor/chat/run/token مجوز write نیست. هر RUN فقط branch خودش را تغییر می‌دهد؛ PR پذیرش فقط از branch آخرین REVIEW ثبت‌شده مجاز است.

برای شناخت مبانی فنی رجیستری، `04_COORDINATION/LOCK_MANAGER_PROTOCOL.md` را فقط به‌عنوان شرح پیاده‌سازی داخلی بخوان؛ این سند مجوز CAS یا نوشتن مستقیم worker نیست.


**نقش و اختیار فرمان‌ها:** پیش از اجرای هر فرمان، سیاست `04_COORDINATION/ACTOR_AUTHORIZATION.json` را بخوان. OWNER اختیار کامل دارد؛ COLLABORATOR/MEMBER به‌صورت پیش‌فرض WORKER با اختیارات پایه‌اند؛ SENIOR_MANAGER فقط با درج صریح GitHub login و تأیید مالک فعال می‌شود؛ READ_ONLY فقط status دارد. فرمان خارج از نقش را اجرا نکن و برای دور زدن محدودیت، نقش را حدس نزن.
