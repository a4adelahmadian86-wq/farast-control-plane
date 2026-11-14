# برنامه آزمون پذیرش هماهنگ‌کننده چندچتی

## سطح ۱ — اعتبارسنجی منبع و workflow
- YAML parse و GitHub Actions workflow validation.
- workflow فقط در یک concurrency group سراسری اجرا شود.
- schedule پنج‌دقیقه‌ای، issue_comment، issues و workflow_dispatch تعریف شده باشد.
- permissions حداقلی: contents:write، issues:write، pull-requests:read.
- همه mutationهای رجیستری از یک مسیر single-writer انجام شوند.
- هیچ worker مستقیم ACTIVE_LOCKS.json را ننویسد.

## سطح ۲ — آزمون‌های منطقی/fixture
- Issue فاقد Target repository یا Resource keys: claim باید رد شود.
- Claim موفق: target_repository و branch اختصاصی همان RUN در همه lockهای ثبت‌شده قرار بگیرند.
- handoff با RUN_ID جدید: coordinator lineage قبلی را برگرداند و branch_reuse را رد کند؛ worker پس از تأیید checkpoint، branch جدید و مستقل را در مخزن هدف بسازد؛ branch قبلی تغییر نکند (این بخش E2E است، نه unit fixture).
- accept از branch یا target repository غیر از آخرین رویداد REVIEW: رد شود.
- accept با PR که در بدنه Issue لینک نشده: رد شود.
- دو Issue متفاوت با RESOURCE_KEY مشترک: فقط یک claim موفق.
- دو Issue با RESOURCE_KEYهای disjoint: هر دو claim موفق.
- دو worker روی یک Issue با RESOURCE_KEYهای disjoint: claim دوم رد شود؛ یک TASK فقط یک owner فعال دارد.
- چند claim برای یک Issue: فقط یک lease معتبر.
- comment ID تکراری: بدون token یا عملیات تکراری.
- actor غیرمجاز: رد.
- heartbeat با actor/chat/run/token اشتباه: رد.
- heartbeat معتبر: expiry تمدید و event آن در history مرکزی ثبت شود.
- release با token قدیمی: رد.
- lease منقضی: پاک‌سازی و ثبت history.
- timeout پس از commit رجیستری و قبل از پاسخ: پاسخ با marker بازیابی شود.
- بسته‌شدن Issue بدون پذیرش: بازگشایی.
- accept بدون PR ادغام‌شده یا approval مستقل روی head فعلی: رد.
- بستن دستی Issue یا افزودن دستی label agent:done بدون عملیات accept موفق در ledger: Issue دوباره باز شود.
- پس از accept موفق، Issue بازمانده بر اثر interruption: reconciliation آن را ببندد؛ پس از فرمان reopen موفق، دیگر خودکار بسته نشود.
- accept معتبر: label done و بسته‌شدن Issue.

## سطح ۳ — آزمون واقعی چندحسابی
- حداقل دو حساب GitHub مستقل و مجاز، از دو نشست ChatGPT جداگانه.
- claim هم‌زمان روی یک RESOURCE_KEY و تأیید اینکه دقیقاً یکی grant می‌گیرد.
- claim هم‌زمان روی منابع disjoint و تأیید موفقیت هر دو.
- قطع اتصال یکی از چت‌ها، انقضای lease و takeover با fencing token جدید.
- ارسال دوباره همان فرمان و تأیید idempotency.
- تلاش عامل قدیمی برای heartbeat/release/write پس از takeover و رد آن.
- تأیید اینکه هر دو حساب دسترسی لازم به مخزن و Actions دارند.

## معیار اعلام آمادگی
هیچ‌یک از آزمون‌های سطح ۳ با fixture یا حساب واحد جایگزین نمی‌شود. تا زمان اجرای آزمون واقعی دو حساب، وضعیت Multi-account E2E برابر NOT_RUN است.


## آزمون‌های خودکار اجراشونده در CI
فایل .github/scripts/coordinator-core.test.js با Node.js test runner اجرا می‌شود و ۱۴ آزمون fixture این رفتارها را پوشش می‌دهند: تعارض دو Issue روی منبع مشترک، موفقیت منابع مستقل، acquire چندمنبعی all-or-none، یک owner فعال برای هر Issue، انقضای lease و fencing token جدید، رد token/actor stale، parse کردن target repository و resource keys، approval مستقل روی head فعلی، تطبیق PR با branch/repository آخرین REVIEW، تمدید یکپارچه heartbeat برای همه منابع و محاسبه close eligibility از آخرین transition موفق ledger، جلوگیری از branch reuse و انتقال lineage، و اعتبارسنجی طول/قالب CHAT_ID و RUN_ID، و نقش‌های OWNER/SENIOR_MANAGER/WORKER/READ_ONLY. این آزمون‌ها منطق هسته را اعتبارسنجی می‌کنند و جای آزمون واقعی GitHub Actions و دو حساب مستقل را نمی‌گیرند.


## آزمون lineage و جلوگیری از stale branch
- پس از RELEASE/REVIEW/LEASE_EXPIRED، claim با RUN_ID قبلی باید با `branch_reuse` رد شود. شناسه‌های chat/run باید فقط از حروف/اعداد/نقطه/underscore/hyphen و حداکثر ۶۴ نویسه باشند.
- claim با RUN_ID جدید باید previous_run/previous_branch/previous_target_repository را دقیقاً از آخرین handoff همان Issue برگرداند.
- worker جدید باید branch جدید را از checkpoint معتبر branch قبلی بسازد؛ این مرحله در workflow خودکار نیست و باید در آزمون end-to-end در target repository مشاهده شود.


سیاست تفویض اختیار فرمان‌ها در `04_COORDINATION/ACTOR_AUTHORIZATION.json` ثبت شده است؛ نقش پیش‌فرض WORKER به فرمان‌های اجرایی پایه محدود است و فرمان‌های حساس فقط برای OWNER یا actor صریحاً تفویض‌شده فعال‌اند.
