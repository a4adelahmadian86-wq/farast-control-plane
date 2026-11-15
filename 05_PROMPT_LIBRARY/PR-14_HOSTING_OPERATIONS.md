# دستور مشترک اجباری همه پرامپت‌های FARAST

این پرامپت مستقل از مکالمه و حساب کاربری است. مرجع حقیقت مخزن کنترل‌پلین، شاخه پیش‌فرض `main` است: https://github.com/a4adelahmadian86-wq/farast-control-plane . PR شماره ۱ در commit `b8cf85cfd6552028750eefa3cff03d844175814c` ادغام شده است. پیش از هر اجرا SHA زنده `main` را بخوان و تمام اسناد را از همان ref دریافت کن؛ هرگز به شاخه قدیمی `setup/control-plane-bootstrap` به‌عنوان مرجع فعال برنگرد.

## دروازه اجباری آغاز، بازیابی و تداوم
پیش از هر اقدام، `START_HERE.md`، `04_COORDINATION/INTERRUPTION_RECOVERY_PROTOCOL.md`، `05_PROMPT_LIBRARY/MASTER-00.md` و `04_COORDINATION/WORK_ITEM_EXECUTION_PROTOCOL.md` را از main بخوان. سپس Issueها، PRها، checkpointها، feedback و branch `coordination/locks` را read-only بررسی کن. حافظه چت و خلاصه خودکار مرجع وضعیت نیستند.

## انتخاب هدف خرد
- هدف‌های مرتبط را از GOAL_TREE و EXP-01 تا EXP-27 استخراج کن؛ شماره‌ها شناسه‌اند، نه ترتیب اجباری.
- هر برگ اجرایی یک Issue مستقل با WORK_ITEM_ID پایدار است. پیش از ساخت Issue، Issueهای باز و بسته، WORK_ITEM_IDها، dependencyها و resource keys را جست‌وجو کن؛ کار موجود را دوباره نساز.
- ابتدا work item نیمه‌تمام با checkpoint معتبر و lease منقضی/آزاد را برای resume انتخاب کن؛ اگر lease معتبر دارد آن را کنار بگذار. سپس READYهای بدون dependency یا resource conflict را طبق priority مالک، aging روزانه، قدیمی‌ترین ready/created time و WORK_ITEM_ID مرتب کن.
- انتخاب محلی مجوز write نیست؛ فقط پس از claim موفق CAS از طریق /farast روی Issue همان برگ اقدام کن. اگر هیچ برگ آزاد و واجد شرایط نیست، متوقف شو و وضعیت را گزارش کن.
- Issue والد صرفاً گروه‌بندی و تجمیع است و هرگز claim اجرایی نمی‌گیرد.
- هر Work Item باید `write_policy` داشته باشد: `READ_ONLY`, `WRITE_REQUIRES_OWNER_APPROVAL` یا `WRITE_ALLOWED`. مخزن محصول `a4adelahmadian86-wq/non` فقط `READ_ONLY` است تا مجوز جداگانه مالک ثبت شود. WRITE_ALLOWED فقط برای Issue ساخته‌شده توسط repository owner پذیرفته می‌شود.
- `priority_source=DEFAULT_POLICY` و priority=50 یعنی اولویت برابر و FIFO/aging، نه رتبه‌بندی مالک؛ `OWNER_ASSIGNED` فقط با تصمیم صریح مالک.
- اگر هیچ برگ واجد شرایط نبود، EXPهای ناقص و Issueهای موجود را تطبیق بده؛ برای ساخت برگ تازه ابتدا allocator با WORK_ITEM_ID ثابت `WI-GOAL-ALLOCATOR-001` را claim کن. فقط در اختیار lease آن، برگ‌های جدید با شناسه deterministic بساز؛ اگر allocator آزاد نیست، duplicate نساز.

## ثبت گام، پیشرفت و checkpoint
- گام‌ها و معیارهای پذیرش را با `WORK_ITEM_SCHEMA.json` تعریف کن. برای ثبت گام: `/farast step step=STEP_ID result=PASS evidence=URL token=FENCING_TOKEN chat=CHAT_ID run=RUN_ID`.
- معیار پذیرش: `/farast criterion id=CRITERION_ID result=PASS evidence=URL token=FENCING_TOKEN chat=CHAT_ID run=RUN_ID`.
- پیشرفت: `/farast progress`. checkpoint: `/farast checkpoint step=STEP_ID next_action="دستور دقیق بعدی" token=FENCING_TOKEN chat=CHAT_ID run=RUN_ID`.
- هیچ step/criterion بدون evidence reference و validation PASS تأیید نمی‌شود. درصد از وزن نسخه‌بندی‌شده یا گام‌های هم‌وزن محاسبه می‌شود؛ ۸۰٪ هرگز ACCEPTED نیست.
- پس از interruption همان WORK_ITEM_ID و evidenceهای قبلی را نگه دار؛ RUN_ID و fencing token جدید بگیر و فقط remaining_step_ids را انجام بده. token قدیمی هیچ writeای مجاز نمی‌کند.

## دروازه اجباری هماهنگی چندچتی
- رجیستری `coordination/locks` فقط توسط workflow مرکزی نوشته می‌شود؛ هرگز direct-CAS یا نوشتن مستقیم انجام نده.
- هر RUN جدید شناسه یکتا دارد؛ branch اختصاصی فقط برای `WRITE_ALLOWED` صادر می‌شود و branch قبلی فقط read-only بررسی می‌شود.
- پیش از فرمان‌ها سیاست `ACTOR_AUTHORIZATION.json` را بخوان؛ SENIOR_MANAGER فقط با `actor_roles` و `resource_key_prefixes` صریح مجاز است.
- timeout، خطا یا lease نامعلوم = STOP WRITES؛ claim موفق و read-back رجیستری شرط هر write است.
- قرارداد قفل را در `LOCK_MANAGER_PROTOCOL.md` بخوان؛ TASK_ID پایدار را حفظ کن و برای هر عملیات OPERATION_ID یکتا داشته باش. نتیجه نامعلوم را AMBIGUOUS ثبت کن و از GitHub read-back بگیر؛ خلاصه چت مرجع حقیقت نیست.
- لینک مستقیم دروازه ورود: https://github.com/a4adelahmadian86-wq/farast-control-plane/blob/main/START_HERE.md .
- اگر `write_policy=WRITE_ALLOWED` است، target_repository و branch اختصاصی همان RUN باید دقیقاً با پاسخ claim منطبق باشند؛ در `READ_ONLY` و `WRITE_REQUIRES_OWNER_APPROVAL` branch در مخزن هدف نساز؛ branch قبلی را read-only نگه دار.
# PR-14_HOSTING_OPERATIONS — امکان‌سنجی هاست و عملیات

- EXP: EXP-16, EXP-17, EXP-18
- GOAL: G-07
- نوع: تحلیل/اقدام تخصصی محدود؛ تغییر فقط در صورت تصریح در مأموریت.
- ورودی اصلی: مخزن محصول + اسناد کنترل‌پلین + وظایف و شواهد قبلی.
- خروجی: گزارش و شواهد در GitHub؛ نه گزارش مفصل در چت.

# PR-14 — هاست، استقرار، عملیات و انتشار کم‌اختلال

## مأموریت
امکان‌پذیری میزبانی و عملیات را با توجه به ترجیح هاست اشتراکی کم‌هزینه بررسی کن؛ بدون دسترسی واقعی، وضعیت production را حدس نزن.

## مراحل
1. Work Itemهای موجود متناظر با `EXP-16`, `EXP-17` و `EXP-18` را از Issueها و WORK_ITEM_IDهای واقعی بازیابی کن؛ شناسه فرضی نساز و dependencyها را رعایت کن.
2. نیازمندی‌های runtime را استخراج کن: PHP/runtime version، extensions، DB، cron، queue worker، process lifetime، storage، symlink، shell، dump tools، limits و TLS.
3. این نیازها را با مستندات/پلن هاست واقعی مقایسه کن؛ تبلیغ provider جای آزمون نیست.
4. مسیرهای queue بدون worker دائمی، scheduler، client-side processing و سرویس بیرونی را از نظر امنیت، هزینه و reliability مقایسه کن.
5. deployment pipeline، migration، maintenance mode، cache warmup، health check، rollback و release notes را بررسی کن.
6. ادعای zero downtime را فقط در صورت اثبات در محیط هدف بپذیر؛ هدف را best-effort ثبت کن.
7. برنامه DR/backup/restore و مانیتورینگ را با EXP-02/17 پیوند بده.

## خروجی
Hosting feasibility matrix، deployment runbook، failure/rollback plan و فهرست داده‌های لازم از مالک. معیار پذیرش: هر قابلیت عملیاتی به پلن و شاهد واقعی متصل باشد.

## پایان و تحویل
پیش از پایان، checkpoint را با `04_COORDINATION/CHECKPOINT_TEMPLATE.md` ثبت کن؛ Issue و PR را به‌روز کن؛ TASK_INDEX و MASTER_STATUS را فقط بر اساس وضعیت اثبات‌شده به‌روزرسانی کن؛ قفل را فقط با فرمان `/farast release` و TASK_ID/RUN_ID/fencing_token خود آزاد کن؛ اگر ابزار لازم در دسترس نیست، وضعیت را مبهم ثبت کن و آزادسازی را ادعا نکن. وضعیت را DONE_VERIFIED نگذار مگر معیار پذیرش و شواهد معتبر کامل باشند. در صورت مانع، BLOCKED را با علت، شواهد و NEXT_ACTION ثبت کن.


## دروازه اجباری هماهنگی چندچتی
- پیش از هر write، در Issue وظیفه فرمان /farast claim chat=CHAT_ID run=RUN_ID lease=30 را ثبت کن.
- فقط پس از پاسخ صریح CLAIM GRANTED و read-back رجیستری زنده مجاز به اقدام هستی؛ target_repository و branch اختصاصی همان RUN را فقط برای `WRITE_ALLOWED` از پاسخ بردار. در READ_ONLY/WRITE_REQUIRES_OWNER_APPROVAL مقدار branch=none است و هیچ write در مخزن هدف مجاز نیست. عدم پاسخ/timeout/خطا = STOP WRITES.
- رجیستری ACTIVE_LOCKS.json فقط توسط workflow مرکزی نوشته می‌شود؛ نوشتن مستقیم یا direct-CAS توسط worker ممنوع است.
- پیش از هر write/checkpoint، /farast heartbeat chat=CHAT_ID run=RUN_ID token=FENCING_TOKEN lease=30 را اجرا کن.
- در پایان از /farast review یا /farast release با token صحیح استفاده کن؛ release به معنی پذیرش نیست.
- دستورها: 04_COORDINATION/COORDINATOR_COMMANDS.md. اگر workflow در default branch فعال نیست، فقط read-only.


**ایمنی چندچتی و handoff:** branch قبلی یک Issue قابل claim مجدد نیست. اگر claim با branch_reuse رد شد، RUN_ID جدید و یکتا انتخاب کن. CLAIM GRANTED بدون read-back وضعیت زنده رجیستری و تطبیق actor/chat/run/token مجوز write نیست. هر RUN فقط branch خودش را تغییر می‌دهد؛ PR پذیرش فقط از branch آخرین REVIEW ثبت‌شده مجاز است.

برای شناخت مبانی فنی رجیستری، `04_COORDINATION/LOCK_MANAGER_PROTOCOL.md` را فقط به‌عنوان شرح پیاده‌سازی داخلی بخوان؛ این سند مجوز CAS یا نوشتن مستقیم worker نیست.


**نقش و اختیار فرمان‌ها:** پیش از اجرای هر فرمان، سیاست `04_COORDINATION/ACTOR_AUTHORIZATION.json` را بخوان. OWNER اختیار کامل دارد؛ COLLABORATOR/MEMBER به‌صورت پیش‌فرض WORKER با اختیارات پایه‌اند؛ SENIOR_MANAGER فقط با درج صریح GitHub login در actor_roles و تعیین repositories و resource_key_prefixes در actor_scopes، با تأیید مالک فعال می‌شود؛ READ_ONLY فقط status دارد. فرمان خارج از نقش را اجرا نکن و برای دور زدن محدودیت، نقش را حدس نزن.
