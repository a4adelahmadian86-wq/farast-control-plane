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
- هرگز branch قبلی را دوباره استفاده نکن؛ هر RUN جدید branch اختصاصی دارد و branch قبلی فقط read-only بررسی می‌شود.
- پیش از فرمان‌ها سیاست `ACTOR_AUTHORIZATION.json` را بخوان؛ SENIOR_MANAGER فقط با `actor_roles` و `resource_key_prefixes` صریح مجاز است.
- timeout، خطا یا lease نامعلوم = STOP WRITES؛ claim موفق و read-back رجیستری شرط هر write است.
- قرارداد قفل را در `LOCK_MANAGER_PROTOCOL.md` بخوان؛ TASK_ID پایدار را حفظ کن و برای هر عملیات OPERATION_ID یکتا داشته باش. نتیجه نامعلوم را AMBIGUOUS ثبت کن و از GitHub read-back بگیر؛ خلاصه چت مرجع حقیقت نیست.
- لینک مستقیم دروازه ورود: https://github.com/a4adelahmadian86-wq/farast-control-plane/blob/main/START_HERE.md .
- branch قبلی را read-only نگه دار؛ target_repository و branch اختصاصی همان RUN باید دقیقاً با پاسخ claim منطبق باشند.
# PR-05_USER_SCENARIOS — سناریوهای کاربران و سفرهای انتهابه‌انتها

- EXP: EXP-05
- GOAL: G-02,G-03,G-04,G-05
- نوع: تحلیل/اقدام تخصصی محدود؛ تغییر فقط در صورت تصریح در مأموریت.
- ورودی اصلی: مخزن محصول + اسناد کنترل‌پلین + وظایف و شواهد قبلی.
- خروجی: گزارش و شواهد در GitHub؛ نه گزارش مفصل در چت.

# PR-05 — مدل‌سازی سناریوهای واقعی کاربران

## مأموریت
سناریوهای end-to-end نقش‌های مشتری، مدیر اصلی، مدیر ارشد، کارمند، پشتیبانی و سایر actorهای اثبات‌شده را از نیازمندی و سیستم موجود استخراج کن.

## مراحل
1. Work Itemهای موجود متناظر با `EXP-05` را از Issueها و WORK_ITEM_IDهای واقعی بازیابی کن؛ شناسه فرضی نساز و سناریوهای موجود را دوباره تولید نکن.
2. actorها و مجوزهای واقعی را از اسناد و کد تفکیک کن؛ نقش فرضی نساز.
3. journeyها را شامل trigger، پیش‌شرط، happy path، alternative، failure، داده، مجوز، اعلان، پرداخت/تغییر وضعیت و نتیجه مدل کن.
4. سناریوهای حساب/OTP/رمز، ارتقا/تنزل، پنل، محصول/پرداخت/تحویل، اشتراک/سهمیه، ویرایشگر هوشمند، پشتیبانی، حذف/بازگردانی و ممیزی را پوشش بده.
5. برای هر گام actor، action، system response، expected state، audit event و acceptance criterion تعریف کن.
6. مسیرهای فاقد اطلاعات را UNKNOWN علامت بزن؛ سؤال فقط اگر تصمیم حیاتی است.

## خروجی
نقشه journey و سناریوهای قابل آزمون با شناسه SCN؛ ماتریس نقش × اقدام × داده؛ فهرست سناریوهای منفی/مرزی. معیار پذیرش: هر سناریو قابل تبدیل به تست و مرتبط با REQ/CAP باشد.

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


**نقش و اختیار فرمان‌ها:** پیش از اجرای هر فرمان، سیاست `04_COORDINATION/ACTOR_AUTHORIZATION.json` را بخوان. OWNER اختیار کامل دارد؛ COLLABORATOR/MEMBER به‌صورت پیش‌فرض WORKER با اختیارات پایه‌اند؛ SENIOR_MANAGER فقط با درج صریح GitHub login در actor_roles و تعیین repositories و resource_key_prefixes در actor_scopes، با تأیید مالک فعال می‌شود؛ READ_ONLY فقط status دارد. فرمان خارج از نقش را اجرا نکن و برای دور زدن محدودیت، نقش را حدس نزن.


## قرارداد اجباری عمق مأموریت و گزارش پیشرفت (نسخه 2.0)
پیش از انتخاب یا اجرای Work Item این اسناد را از main بخوان:
- `01_STRATEGY/EXECUTION_DECOMPOSITION_17x27.md` — نگاشت ۱۷ پرامپت به ۲۷ مأموریت و دامنه تخصصی هر EXP.
- `04_COORDINATION/WORK_ITEM_DEPTH_STANDARD.md` — حداقل عمق و بودجه زمانی هر leaf.
- `04_COORDINATION/PROGRESS_REPORTING_PROTOCOL.md` — فرمول سه درصد پیشرفت و قالب گزارش.

قواعد:
1. یک پرامپت تخصصی را با یک Work Item یکی ندان. ابتدا PROMPT_ID را به EXPهای مربوط و سپس به Issue/WORK_ITEM_IDهای واقعی وصل کن.
2. هدف هر EXP یک مأموریت عمیق ۲۰–۳۰ دقیقه‌ای است؛ حداقل ۶ گام substantive، ۴ معیار پذیرش، ۳ deliverable و شواهد لازم. اگر Issue فعلی این عمق را ندارد، آن را DEPTH_NOT_VERIFIED بدان و قبل از READY/claim طبق allocator آن را غنی‌سازی کن.
3. هر گام باید expected output و evidence requirement داشته باشد. «بررسی کن/گزارش بده» به‌تنهایی گام معتبر نیست.
4. سه درصد EXECUTION_PROGRESS، ACCEPTANCE_PROGRESS و OVERALL_COMPLETION را طبق پروتکل محاسبه کن؛ وضعیت lease جداست. هرگز درصد را از تعداد commit، تعداد فایل یا ادعای چت نساز.
5. Claim فقط مالکیت موقت است؛ شروع، progress یا acceptance محسوب نمی‌شود.
6. اگر کار مسدود است، blocker و کار read-only مستقل را ثبت کن؛ زمان را مصنوعی پر نکن و به مأموریت نامرتبط نپرداز.
7. قبل از پایان یا handoff، checkpoint کامل و NEXT_ACTION دقیق ثبت کن.
