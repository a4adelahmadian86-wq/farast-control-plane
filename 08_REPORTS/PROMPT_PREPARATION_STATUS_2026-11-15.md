# گزارش آماده‌سازی ساختار ۱۷×۲۷ FARAST

تاریخ: 2026-11-15  
شاخه اجرا: `work/GH-11-RUN-20261115-PROMPT-PREP-01`  
Work Item مالک تغییرات: `WI-GOAL-ALLOCATOR-001` / Issue #11  
Claim: `RUN-20261115-PROMPT-PREP-01`, fencing token 58  
مخزن هدف: `a4adelahmadian86-wq/farast-control-plane`

## دامنه تحویل این تغییر

- یک هدف کلان G-00.
- ۱۷ پرامپت تخصصی مستقل PR-01 تا PR-17؛ MASTER-00 نقش هماهنگ‌کننده دارد و جزو ۱۷ پرامپت نیست.
- ۲۷ مأموریت عمیق EXP-01 تا EXP-27، با نگاشت صریح به پرامپت‌ها.
- استاندارد عمق هر leaf: حداقل ۶ گام substantive، ۴ معیار پذیرش، ۳ deliverable، evidence requirement و effort هدف ۲۰–۳۰ دقیقه.
- سه شاخص مستقل پیشرفت: EXECUTION_PROGRESS، ACCEPTANCE_PROGRESS و OVERALL_COMPLETION.
- claim/lease/owner/blocker مستقل از درصد پیشرفت نگه داشته می‌شوند.

## تغییرات انجام‌شده

| بخش | نتیجه |
|---|---|
| سند نگاشت ۱۷×۲۷ | ساخته شد؛ ۲۷ مأموریت با مراحل و خروجی تخصصی |
| استاندارد عمق Work Item | ساخته شد |
| پروتکل گزارش پیشرفت | ساخته شد |
| MASTER-00 | قرارداد عمق و پیشرفت اضافه شد |
| ۱۷ پرامپت تخصصی | قرارداد مشترک به ۱۷/۱۷ فایل مستقل افزوده شد |
| bundle تجمیعی | نسخه 1.9.0؛ ۱۸ منبع (MASTER-00 + ۱۷ prompt) همگام شد |
| Work Item Schema | effort, depth_profile, deliverables, step outputs/evidence و وزن معیارها افزوده شد |
| Checkpoint Schema | سه درصد جداگانه و شمارنده‌های step/criteria افزوده شد |
| Progress engine | محاسبه واقعی سه درصد در work-item-core و گزارش آن در /farast progress/step/criterion/checkpoint پیاده شد |
| Depth enforcement | work-item-core برای Work Itemهایی که depth_profile دارند، عمق ۶/۴/۳، effort و evidence را validate می‌کند |
| Work Item Execution Protocol | استاندارد عمق و گزارش سه‌گانه به پروتکل اجرایی متصل شد |
| START_HERE و Prompt Catalog | لینک‌ها و ترتیب اجرای اسناد افزوده شد |
| Issue Template | ساخت Work Item عمیق را به فرم ایجاد Issue متصل کرد |
| CI validation | اعتبارسنجی نگاشت ۱۷×۲۷، وجود اسناد، قرارداد promptها و schemaهای جدید افزوده شد |

## وضعیت ۲۷ Issue اجرایی

- Issueهای #14 تا #39 (EXP-02 تا EXP-27): **۲۶/۲۶ غنی‌سازی شدند**؛ هرکدام ۷ گام، ۴ معیار پذیرش، ۳ یا ۴ deliverable و effort هدف ۲۵ دقیقه دارند.
- Issue #13 (EXP-01): در read-back نهایی هنوز در اختیار اجرای مستقل `RUN-20261115-EXP01-BASELINE-01` با token 57 بود؛ فرمان claim مجدد این اجرا به‌درستی به‌دلیل جلوگیری از دو نویسنده رد شد. بنابراین body و JSON آن عمداً تغییر نکرده است. طرح تخصصی ۷ گام، معیارها و خروجی‌های EXP-01 در سند decomposition موجود است؛ تبدیل Issue #13 به قالب عمیق فقط پس از handoff یا انقضای قطعی lease و Claim جدید مجاز است.
- هیچ‌یک از این Work Itemها به‌دلیل غنی‌سازی، اجراشده یا پذیرفته‌شده محسوب نمی‌شوند؛ وضعیت کار و progress فقط با evidence واقعی تغییر می‌کند.

## اعتبارسنجی

- Read-back زنده نشان داد ۲۶ Issue دارای `effort_estimate_minutes=25`، ۷ گام، ۴ معیار و حداقل ۳ deliverable هستند.
- MASTER-00 و bundle بررسی شدند؛ قرارداد در ۱۸/۱۸ بخش bundle وجود دارد.
- JSON Schemaهای Work Item و Checkpoint از GitHub بازخوانی شدند و workflow اعتبارسنجی روی آخرین head `3cd423e89b93d6dedad5122da36ef38fa79e7d94` با موفقیت کامل شد: [Control Plane Validation run #865](https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43735999137).
- آزمون end-to-end واقعی دو حساب مستقل در دامنه این تغییر انجام نشده و ادعای VERIFIED چندحسابی جدید صادر نمی‌شود.

## مرز ایمنی

- هیچ فایل، branch، PR، داده یا محیطی در مخزن محصول `a4adelahmadian86-wq/non` تغییر نکرد.
- این تغییر صرفاً زیرساخت و اسناد control-plane است.
- merge شدن PR و release عملیاتی همچنان تابع review/approval مستقل است.


## وضعیت نهایی PR و موانع تحویل

- PR شماره 42 باز و merge نشده است؛ head فعلی `3cd423e89b93d6dedad5122da36ef38fa79e7d94` و CI آخرین commit سبز است.
- بازبینی مستقل هنوز ثبت نشده است؛ فهرست reviews خالی است. بنابراین ادغام خودکار یا تأیید به‌جای بازبین مستقل انجام نشده است.
- آزمون واقعی E2E با دو حساب مستقل و دو نشست مستقل هنوز اجرا نشده؛ قابلیت چندحسابی VERIFIED اعلام نمی‌شود.
- Issue #13 تنها Work Item از ۲۷ مورد است که تبدیل ساختاری آن به عمق جدید به‌دلیل Claim مستقل فعال به تعویق افتاده است. سایر Issueهای #14 تا #39 با read-back زنده دارای ۷ گام، ۴ معیار، حداقل ۳ خروجی و effort هدف ۲۵ دقیقه‌اند.
- مخزن محصول `a4adelahmadian86-wq/non` در تمام این کارها READ_ONLY باقی مانده است.
