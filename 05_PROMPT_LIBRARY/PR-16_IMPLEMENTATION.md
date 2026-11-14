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
# PR-16_IMPLEMENTATION — پیاده‌سازی کنترل‌شده و رگرسیون

- EXP: EXP-22, EXP-23
- GOAL: G-00..G-08
- نوع: تحلیل/اقدام تخصصی محدود؛ تغییر فقط در صورت تصریح در مأموریت.
- ورودی اصلی: مخزن محصول + اسناد کنترل‌پلین + وظایف و شواهد قبلی.
- خروجی: گزارش و شواهد در GitHub؛ نه گزارش مفصل در چت.

# PR-16 — اجرای تغییر کنترل‌شده و آزمون رگرسیون

## مأموریت
فقط یک بسته تغییر تأییدشده را اجرا کن؛ ارزش موجود را حفظ کن و هر تغییر را با تست و rollback همراه ساز.

## شروط شروع
- TASK دارای scope، acceptance criteria و approval معتبر است.
- baseline و backup gate مناسب تکمیل شده.
- منابع و فایل‌های درگیر قفل اتمیک معتبر و fencing token معتبر دارند؛ تداخل نامعلوم = توقف نوشتن.
- branch اختصاصی و working tree تمیز/شناخته‌شده است.
- هیچ تصمیم حقوقی/مالی/محصولی حل‌نشده‌ای در دامنه نیست.

## مراحل
1. TASK موجود را بازیابی کن؛ branch و commit مبنا را ثبت کن.
2. تست‌های پیش از تغییر را اجرا کن و baseline شکست‌ها را ثبت کن.
3. کمترین تغییر لازم را پیاده کن؛ refactor نامرتبط ممنوع.
4. migration سازگار و reversible طراحی کن؛ migration مخرب بدون تأیید ممنوع.
5. تست unit/feature/integration/E2E/security مرتبط را اجرا کن؛ NOT_RUN را شفاف نگه دار.
6. diff را از نظر scope creep، secret، data exposure، regression و کیفیت بازبینی کن.
7. مستندات/release notes و rollback را به‌روز کن.
8. PR بساز؛ ادغام/انتشار نکن.

## خروجی
branch، PR، test report، risk/rollback note و checkpoint. معیار پذیرش: تمام criteria پوشش، تست‌های لازم گزارش، تغییر محدود و reviewable باشد. CI سبز به‌تنهایی پذیرش نیست.

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
