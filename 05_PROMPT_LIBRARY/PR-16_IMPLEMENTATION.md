# دستور مشترک اجباری همه پرامپت‌های FARAST

این پرامپت مستقل از مکالمه و حساب کاربری است. مرجع حقیقت مخزن کنترل‌پلین، شاخه پیش‌فرض `main` است: https://github.com/a4adelahmadian86-wq/farast-control-plane . PR شماره ۱ در commit `b8cf85cfd6552028750eefa3cff03d844175814c` ادغام شده است. پیش از هر اجرا SHA زنده `main` را بخوان و تمام اسناد را از همان ref دریافت کن؛ هرگز به شاخه قدیمی `setup/control-plane-bootstrap` به‌عنوان مرجع فعال برنگرد.

## دروازه اجباری آغاز، بازیابی و تداوم
پیش از هر اقدام، `START_HERE.md`، `04_COORDINATION/INTERRUPTION_RECOVERY_PROTOCOL.md`، `05_PROMPT_LIBRARY/MASTER-00.md` و `04_COORDINATION/WORK_ITEM_EXECUTION_PROTOCOL.md` را از main بخوان. سپس Issueها، PRها، checkpointها، feedback و branch `coordination/locks` را read-only بررسی کن. حافظه چت و خلاصه خودکار مرجع وضعیت نیستند.

## انتخاب هدف خرد
- محدوده تخصصی را فقط از EXP IDهای سربرگ همین پرامپت استخراج کن؛ فقط Issueهایی که parent_exp_ids با این مجموعه اشتراک دارد نامزدند. MASTER-00 عمومی می‌تواند همه هدف‌های باز را بررسی کند.
- با دریافت همین پرامپت، بدون درخواست شماره Issue یا تخصیص دستی از مالک، صف زنده را طبق الگوریتم MASTER-00 و WORK_ITEM_EXECUTION_PROTOCOL بخوان و خودکار برگ بعدی را انتخاب کن.
- هر برگ اجرایی یک Issue مستقل با WORK_ITEM_ID پایدار است. پیش از ساخت Issue، Issueهای باز و بسته، WORK_ITEM_IDها، dependencyها و resource keys را جست‌وجو کن؛ کار موجود را دوباره نساز.
- ابتدا work item نیمه‌تمام با checkpoint معتبر و lease منقضی/آزاد را برای resume انتخاب کن؛ اگر lease معتبر دارد آن را کنار بگذار. سپس READYهای بدون dependency یا resource conflict را طبق priority مالک، aging روزانه، قدیمی‌ترین ready/created time و WORK_ITEM_ID مرتب کن.
- انتخاب محلی مجوز write نیست؛ فقط پس از CLAIM GRANTED و read-back رجیستری از طریق /farast روی Issue همان برگ اقدام کن. اگر claim رد شد، conflict داشت یا timeout شد، اثر را read-back کن و نامزد بعدی را امتحان کن. اگر هیچ برگ واجد شرایطی در محدوده همین پرامپت نیست، discovery و تحلیل dependency/evidence همان EXPها را read-only ادامه بده؛ allocator فقط با Lease انحصاری، و بدون duplicate.
- Issue والد صرفاً گروه‌بندی و تجمیع است و هرگز claim اجرایی نمی‌گیرد.
- هر Work Item باید `write_policy` داشته باشد: `READ_ONLY`, `WRITE_REQUIRES_OWNER_APPROVAL` یا `WRITE_ALLOWED`. مخزن محصول `a4adelahmadian86-wq/non` به‌صورت پیش‌فرض `READ_ONLY` است؛ `WRITE_ALLOWED` فقط برای Issue ساخته‌شده توسط repository owner، با `owner_approval_ref` دقیقاً برابر URL همان Issue و متن صریح تصمیم مالک در بدنه Issue پذیرفته می‌شود. این مجوز به هیچ Issue دیگری سرایت نمی‌کند.
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
- هرگز branch قبلی را دوباره استفاده نکن؛ هر RUN جدید شناسه یکتا دارد؛ branch اختصاصی فقط برای `WRITE_ALLOWED` صادر می‌شود و branch قبلی فقط read-only بررسی می‌شود.
- پیش از فرمان‌ها سیاست `ACTOR_AUTHORIZATION.json` را بخوان؛ SENIOR_MANAGER فقط با `actor_roles` و `resource_key_prefixes` صریح مجاز است.
- timeout، خطا یا lease نامعلوم = STOP WRITES؛ claim موفق و read-back رجیستری شرط هر write است.
- قرارداد قفل را در `LOCK_MANAGER_PROTOCOL.md` بخوان؛ TASK_ID پایدار را حفظ کن و برای هر عملیات OPERATION_ID یکتا داشته باش. نتیجه نامعلوم را AMBIGUOUS ثبت کن و از GitHub read-back بگیر؛ خلاصه چت مرجع حقیقت نیست.
- لینک مستقیم دروازه ورود: https://github.com/a4adelahmadian86-wq/farast-control-plane/blob/main/START_HERE.md .
- اگر `write_policy=WRITE_ALLOWED` است، target_repository و branch اختصاصی همان RUN باید دقیقاً با پاسخ claim منطبق باشند؛ در `READ_ONLY` و `WRITE_REQUIRES_OWNER_APPROVAL` branch در مخزن هدف نساز؛ branch قبلی را read-only نگه دار.
# PR-16_IMPLEMENTATION — پیاده‌سازی کنترل‌شده و رگرسیون

- EXP: EXP-22, EXP-23
- GOAL: G-00..G-08
- نوع: تحلیل/اقدام تخصصی محدود؛ تغییر فقط در صورت تصریح در مأموریت.
- ورودی اصلی: مخزن محصول + اسناد کنترل‌پلین + وظایف و شواهد قبلی.
- خروجی: گزارش و شواهد در GitHub؛ نه گزارش مفصل در چت.

# PR-16 — اجرای تغییر کنترل‌شده و آزمون رگرسیون

## مأموریت
فقط یک بسته تغییر مجاز و دارای scope را اجرا کن؛ ارزش موجود را حفظ کن و هر تغییر را با تست و rollback همراه ساز.

## شروط شروع
- برای Work Item مخزن محصول `a4adelahmadian86-wq/non`، Coordinator برای بررسی Check Runها/Commit Statusها و ادغام خودکار PR به Secret `FARAST_GITHUB_TOKEN` با دسترسی `checks:read`، `statuses:read` و `pull_requests:write` روی مخزن `non` نیاز دارد. اگر این دسترسی در دسترس نیست، PR را نساز/ادغام نکن و Work Item را BLOCKED با علت دقیق نگه دار؛ ادغام دستی یا دور زدن گیت مجاز نیست.
- TASK دارای scope، acceptance criteria و write_policy معتبر است؛ مجوز نوشتن فقط از Work Item زنده و Claim معتبر می‌آید، نه از تأیید انسانی.
- baseline و backup gate مناسب تکمیل شده.
- منابع و فایل‌های درگیر قفل اتمیک معتبر و fencing token معتبر دارند؛ تداخل نامعلوم = توقف نوشتن.
- branch اختصاصی و working tree تمیز/شناخته‌شده است.
- هیچ تصمیم حقوقی/مالی/محصولی حل‌نشده‌ای در دامنه نیست.

## مراحل
1. TASK موجود را بازیابی کن؛ branch و commit مبنا را ثبت کن.
2. تست‌های پیش از تغییر را اجرا کن و baseline شکست‌ها را ثبت کن.
3. کمترین تغییر لازم را پیاده کن؛ refactor نامرتبط ممنوع.
4. migration سازگار و reversible طراحی کن؛ migration مخرب، تغییر داده برگشت‌ناپذیر و تغییر خارج از scope در این مأموریت ممنوع است؛ اگر لازم شد BLOCKED کن.
5. تست unit/feature/integration/E2E/security مرتبط را اجرا کن؛ NOT_RUN را شفاف نگه دار.
6. diff را از نظر scope creep، secret، data exposure، regression و کیفیت بازبینی کن.
7. مستندات/release notes و rollback را به‌روز کن.
8. PR بساز و لینک آن را در Issue ثبت کن؛ سپس `/farast review chat=CHAT_ID run=RUN_ID token=FENCING_TOKEN` را برای handoff ثبت کن. این وضعیت صرفاً تحویل فنی است و به معنی Review انسانی نیست.
9. پس از آزاد شدن Lease، وقتی Check Runها و Commit Statusهای SHA دقیق head همگی success شدند، خود worker فرمان `/farast accept pr=https://github.com/OWNER/REPO/pull/NUMBER` را اجرا کند. Coordinator پس از کنترل branch lineage، نبود Lease فعال و تمام معیارهای Work Item، PR را خودکار با expected head SHA ادغام و وضعیت را ثبت می‌کند. هیچ بازبین دوم، self-review یا تأیید دستی مالک لازم نیست.

## خروجی
branch، PR، test report، risk/rollback note و checkpoint. معیار پذیرش: تمام criteria پوشش، تست‌های لازم گزارش، تغییر محدود و reviewable باشد. CI سبز روی SHA دقیق لازم است اما کافی نیست؛ تمام stepها، acceptance criteria، evidence و dependencyها نیز باید PASS باشند. پذیرش ماشینی از طریق `/farast accept` انجام می‌شود؛ تأیید انسانی مطالبه یا جعل نمی‌شود.

## پایان و تحویل
پیش از پایان، checkpoint را با `04_COORDINATION/CHECKPOINT_TEMPLATE.md` ثبت کن؛ Issue و PR را به‌روز کن؛ TASK_INDEX و MASTER_STATUS را فقط بر اساس وضعیت اثبات‌شده به‌روزرسانی کن؛ قفل را فقط با فرمان `/farast release` و TASK_ID/RUN_ID/fencing_token خود آزاد کن؛ اگر ابزار لازم در دسترس نیست، وضعیت را مبهم ثبت کن و آزادسازی را ادعا نکن. وضعیت را DONE_VERIFIED نگذار مگر معیار پذیرش و شواهد معتبر کامل باشند. در صورت مانع، BLOCKED را با علت، شواهد و NEXT_ACTION ثبت کن. هیچ مرحله‌ای را برای گرفتن تأیید انسانی متوقف نکن؛ گیت ماشینی ناموفق یا نامعلوم باید fail-closed بماند.


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
