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
| Work Item Execution Protocol | استاندارد عمق و گزارش سه‌گانه به پروتکل اجرایی متصل شد |
| START_HERE و Prompt Catalog | لینک‌ها و ترتیب اجرای اسناد افزوده شد |
| Issue Template | ساخت Work Item عمیق را به فرم ایجاد Issue متصل کرد |
| CI validation | اعتبارسنجی نگاشت ۱۷×۲۷، وجود اسناد، قرارداد promptها و schemaهای جدید افزوده شد |

## وضعیت ۲۷ Issue اجرایی

- Issueهای #14 تا #39 (EXP-02 تا EXP-27): **۲۶/۲۶ غنی‌سازی شدند**؛ هرکدام ۷ گام، ۴ معیار پذیرش، ۳ یا ۴ deliverable و effort هدف ۲۵ دقیقه دارند.
- Issue #13 (EXP-01): در زمان این تغییر توسط اجرای مستقل `farast-baseline-chat` با token 57 و lease فعال claim شده بود. برای جلوگیری از تداخل، body و JSON آن تغییر داده نشد. سند decomposition دامنه و ۷ گام کامل EXP-01 را دارد، اما Issue #13 باید پس از release شدن claim به همان قالب ۷ گام/۴ معیار/۳ خروجی ارتقا یابد.
- هیچ‌یک از این Work Itemها به‌دلیل غنی‌سازی، اجراشده یا پذیرفته‌شده محسوب نمی‌شوند؛ وضعیت کار و progress فقط با evidence واقعی تغییر می‌کند.

## اعتبارسنجی

- Read-back زنده نشان داد ۲۶ Issue دارای `effort_estimate_minutes=25`، ۷ گام، ۴ معیار و حداقل ۳ deliverable هستند.
- MASTER-00 و bundle بررسی شدند؛ قرارداد در ۱۸/۱۸ بخش bundle وجود دارد.
- JSON schemaها از GitHub بازخوانی شدند؛ CI باید اعتبارسنجی نهایی را روی PR head اجرا کند.
- آزمون end-to-end واقعی دو حساب مستقل در دامنه این تغییر انجام نشده و ادعای VERIFIED چندحسابی جدید صادر نمی‌شود.

## مرز ایمنی

- هیچ فایل، branch، PR، داده یا محیطی در مخزن محصول `a4adelahmadian86-wq/non` تغییر نکرد.
- این تغییر صرفاً زیرساخت و اسناد control-plane است.
- merge شدن PR و release عملیاتی همچنان تابع review/approval مستقل است.
