# پروتکل پخش یک پرامپت واحد میان چند چت FARAST

نسخه 1.0 — وضعیت: IMPLEMENTED IN BRANCH / MULTI-ACCOUNT E2E NOT YET VERIFIED

## هدف و قرارداد کاربر

مالک می‌تواند همین متن واحد MASTER-00 را بدون تغییر، هم‌زمان در چند چت ChatGPT و حتی حساب‌های مستقل ارسال کند. هر چت باید از وضعیت مشترک GitHub بفهمد کدام بخش هنوز آزاد است، فقط همان برگ اجرایی را claim کند و مستقل پیش ببرد. کاربر نباید برای هر چت از قبل شماره وظیفه متفاوت تعیین کند.

این پروتکل تضمین نمی‌کند که هر چت خودکار پیام چت دیگر را ببیند؛ GitHub تنها حافظه/هماهنگ‌کننده مشترک است. هر چت باید قبل از انتخاب و بعد از هر تعارض، GitHub را تازه بخواند.

## پیش‌نیاز اتصال حساب‌ها

- هر حساب ChatGPT باید اتصال GitHub خودش را جداگانه authorize کند؛ صرف ارسال یک prompt، اتصال حساب GitHub را ایجاد نمی‌کند.
- اگر همه چت‌ها از یک GitHub login استفاده کنند، می‌توانند با CHAT_ID/RUN_ID متفاوت رقابت کنند، اما این حالت اثبات چندحسابی GitHub نیست.
- اگر هر چت از GitHub login متفاوت استفاده می‌کند، هر login باید در مخزن کنترل‌پلین collaborator/member یا owner مجاز باشد. coordinator فعلی فقط author_associationهای OWNER، COLLABORATOR و MEMBER را می‌پذیرد؛ دسترسی عمومی به مخزن به‌تنهایی مجوز فرمان نیست.
- توکن یا رمز را در prompt، Issue، comment یا فایل قرار ندهید؛ هر حساب باید از اتصال امن GitHub خودش استفاده کند.
- پیام‌های چت‌های دیگر برای یکدیگر قابل مشاهده نیستند؛ وضعیت مشترک فقط از طریق GitHub، Issueها، registry، branchها و checkpointها بازیابی می‌شود.

## پیش‌نیاز پذیرش PR در مخزن دیگر

برای مخزن عمومی مقصد مانند `a4adelahmadian86-wq/non`، در مخزن کنترل‌پلین Secret با نام `FARAST_GITHUB_TOKEN` تعریف شود. Fine-grained PAT فقط به مخزن مقصد محدود و با Pull requests:write، Commit statuses:read و Contents:read (فقط برای Compare ancestry در مسیر جایگزین) تنظیم شود؛ Metadata:read پیش‌فرض است. Check Runهای مخزن عمومی با درخواست بدون احراز هویت خوانده می‌شوند، چون Fine-grained PAT در مستندات جاری برای Checks API پشتیبانی‌شده فهرست نشده است. مخزن خصوصی تا پیاده‌سازی GitHub App installation-token با Checks:read پشتیبانی نمی‌شود و پذیرش fail-closed است. Secret یا token را در prompt، Issue، comment، فایل یا log قرار ندهید. وجود/مقدار Secret از اتصال چت قابل تأیید نیست.

## حالت BROADCAST

وقتی متن MASTER-00 در چند چت ارسال شده یا کاربر گفته «همین پرامپت را بین چند چت پخش کن»، هر چت وارد همین الگوریتم می‌شود:

1. شناسه نشست مستقل: برای هر اجرا RUN_ID یکتا بساز؛ CHAT_ID یکتا و پایدار همان چت را نگه دار. این دو شناسه metadata خوداظهاری‌اند و هویت واقعی حساب را ثابت نمی‌کنند.
2. Snapshot مشترک: SHA شاخه main، فهرست Work Itemها، dependencyها، statusها، checkpointها، PRها و رجیستری قفل را از GitHub بخوان. snapshot قدیمی یا حافظه چت مرجع نیست.
3. کشف واحدهای قابل تقسیم: فقط برگ‌های اجرایی (leaf Work Items) نامزد claim هستند. Issue والد/Goal/EXP ظرف گروه‌بندی است، نه واحد claim.
4. انتخاب قطعی: نامزدهای READY یا IN_PROGRESS با lease منقضی را طبق WORK_ITEM_EXECUTION_PROTOCOL.md مرتب کن: dependency حل‌شده، بدون lease فعال، بدون resource conflict، اولویت/aging، زمان ایجاد و WORK_ITEM_ID.
5. Claim اتمیک: فقط روی Issue همان برگ فرمان /farast claim chat=... run=... lease=30 بفرست. فقط CLAIM GRANTED به‌همراه read-back رجیستری معتبر است.
6. توزیع رقابتی: اگر چند چت هم‌زمان یک برگ را انتخاب کردند، فقط برنده claim می‌گیرد. بازنده باید وضعیت زنده را دوباره بخواند و نامزد بعدی را claim کند؛ هرگز با فرض «من هم باید همان کار را انجام بدهم» ادامه ندهد. این چرخه تا claim موفق یا نبود نامزد تکرار می‌شود.
7. اجرای موازی امن: چت‌ها می‌توانند هم‌زمان روی برگ‌های متفاوت کار کنند، مشروط به اینکه claimها granted باشند، resource keyهایشان مستقل باشند، dependencyها آماده باشند و branch هر RUN مجزا باشد. وجود دو Issue متفاوت به‌تنهایی استقلال منابع را ثابت نمی‌کند.
8. عدم تقسیم داخل یک برگ: دو چت هرگز یک WORK_ITEM_ID را هم‌زمان به بخش‌های خودسرانه تقسیم نمی‌کنند. اگر یک هدف بزرگ باید میان N چت توزیع شود، ابتدا allocator تحت claim انحصاری، آن را به N برگ مستقل با parent_work_item_id/goal، دامنه، resource_keys، dependency و acceptance criteria غیرمتداخل تبدیل می‌کند؛ سپس هر برگ جداگانه claim می‌شود. اگر مرزهای غیرمتداخل قابل اثبات نیستند، آن هدف سریالی می‌ماند.
9. نبود کار آزاد: ابتدا allocator ثابت را claim کن و صف را گسترش بده. اگر allocator در اختیار چت دیگری است، claim را دور نزن؛ discovery و تحلیل read-only کارهای مستقل را ادامه بده و بعداً دوباره تلاش کن. توقف کامل فقط وقتی مجاز است که هیچ اقدام مستقل مجاز دیگری وجود نداشته باشد و checkpoint پایدار ثبت شده باشد.
10. پیشرفت و handoff: هر چت step/evidence/checkpoint را با fencing token جاری ثبت می‌کند. قبل از هر write heartbeat لازم است. در interruption، عامل جایگزین همان WORK_ITEM_ID و checkpoint را می‌خواند، پس از claim جدید RUN_ID/token جدید می‌گیرد و فقط remaining steps را انجام می‌دهد.
11. پایان نشست: release یا handoff را ثبت کن؛ وضعیت قفل، branch، commit پایه، checkpoint و next_action باید در GitHub قابل بازیابی باشد.

## حلقه خودگردان مأموریت — رفتار الزامی هر چت

اصل مالک این است: مالک فقط یک پرامپت ثابت را به چند چت می‌دهد؛ هر چت باید مانند عضو فعال یک تیم انسانی، بدون سؤال و بدون انتظار برای تخصیص دستی، از وضعیت واقعی GitHub کار بعدی را پیدا کند و تا سقف محدودیت همان نشست ادامه دهد.

حلقه اجباری پس از شروع:
1. وضعیت زنده main، Goal Tree، dependency graph، تمام Work Itemهای باز و بسته مرتبط، PRها، checkpointها، evidenceها و رجیستری lease را بخوان.
2. تمام کارهای قبلی را با شواهد تطبیق بده؛ کار تکراری نساز و verified step را دوباره اجرا نکن.
3. مجموعه نامزدهای READY و IN_PROGRESS با lease منقضی را طبق انتخاب deterministic مرتب کن.
4. اولین نامزد مستقل را claim کن. اگر claim رد شد، timeout شد، یا resource conflict داشت، اثر فرمان را read-back کن؛ آن نامزد را فعلاً skip کن و نامزد بعدی را بررسی کن. رد claim به معنی توقف کل چت نیست.
5. اگر یک هدف به دلیل ورودی، dependency یا ابهام مسدود است، فقط همان هدف را BLOCKED/دارای blocker ثبت کن (فقط با مجوز/lease معتبر) و کارهای مستقل دیگر را ادامه بده. ابهام را با حدس پر نکن.
6. پس از هر Work Item پذیرفته‌شده یا release/handoff، حلقه را از مرحله 1 دوباره اجرا کن؛ منتظر دستور «ادامه بده» یا تخصیص کاربر نمان.
7. اگر leaf آزاد وجود ندارد، allocator با WORK_ITEM_ID ثابت WI-GOAL-ALLOCATOR-001 را claim کن. فقط زیر lease انحصاری allocator، هدف‌های ناقص را به برگ‌های کوچک، مستقل، غیرمتداخل و schema-valid تبدیل کن؛ شناسه‌ها deterministic باشند؛ dependency و resource_keys واقعی ثبت شوند؛ سپس Issueها را read-back و allocator را release کن.
8. اگر allocator قفل است یا claim آن ممکن نیست، آن را دور نزن و Issue تکراری نساز. به‌جای توقف کامل، discovery، تحلیل dependency، ممیزی شواهد، شناسایی شکاف‌ها و آماده‌سازی read-only مأموریت‌های مستقل را ادامه بده؛ هیچ write بدون lease نکن. در چرخه بعدی دوباره وضعیت allocator را بررسی کن.
9. وقتی تمام کارهای قابل انجام در این نشست به پایان رسیدند، وضعیت و next_action دقیق را checkpoint کن. در محدودیت زمینه/زمان/پیام ChatGPT نیز پیش از پایان، checkpoint و handoff پایدار ثبت کن. در پیام بعدی یا نشست تازه، همان MASTER-00 باید از checkpoint ادامه دهد.
10. هیچ سؤال یا درخواست انتخابی از مالک مجاز نیست؛ شماره وظیفه را نیز مطالبه نکن. اگر داده‌ای واقعاً مفقود است، مورد را به‌صورت blocker مستند کن و کار مستقل دیگری را انتخاب کن. فقط اقداماتی را انجام بده که مجوزشان روشن است.

این حلقه به معنی اجرای نامحدود خارج از محدودیت‌های ChatGPT نیست؛ عامل باید در هر نوبت تا حد مجاز ادامه دهد و قبل از هر توقف اجباری وضعیت را پایدار کند. پایان یک Work Item پایان مأموریت کلی نیست.

## انتخاب قطعی و خودکار برگ تخصصی

- محدوده هر چت از سربرگ پرامپت تخصصی (`PR-ID`، `parent_exp_ids` و `parent_goal_ids`) استخراج می‌شود؛ همه چت‌ها یک صف جهانی نامحدود را claim نمی‌کنند.
- candidateها فقط leaf Issueهایی هستند که parent_exp_ids آن‌ها با محدوده پرامپت اشتراک دارد، status آن‌ها READY/IN_PROGRESS/CLAIMED است، hard gateهایشان حل شده و هیچ lease/resource conflict فعال ندارند.
- IN_PROGRESS/CLAIMED دارای checkpoint معتبر یا step PASS با evidence ابتدا برای resume انتخاب می‌شود؛ WORK_ITEM_ID ثابت می‌ماند و RUN_ID جدید پس از Claim جدید استفاده می‌شود.
- سپس candidateها با effective_priority=max(0, priority-floor(age_days))، ready_at/created_at قدیمی‌تر، WORK_ITEM_ID و Issue number مرتب می‌شوند.
- hard_gates فقط با evidence معتبر ACCEPTED/PASS حل می‌شوند؛ soft_inputs gate نیستند. gate مبهم نامزد را BLOCKED می‌کند، نه کل نشست را.
- Claim روی اولین نامزد انجام می‌شود. هر رد/conflict/timeout باید read-back شود و سپس نامزد بعدی بررسی شود؛ هیچ write بدون CLAIM GRANTED و fencing token معتبر مجاز نیست.
- اگر هیچ leaf واجد شرایط در محدوده همان PR نبود، چت discovery و evidence audit read-only را ادامه می‌دهد و allocator را فقط با Lease انحصاری به کار می‌گیرد. اگر allocator قفل است، duplicate نساز؛ discovery مستقل ادامه یابد.
- پس از هر Work Item یا handoff، snapshot تازه بگیر و حلقه را تکرار کن. هیچ شماره Issue، انتخاب وظیفه یا «ادامه بده» از مالک مطالبه نشود.

## ممنوعیت‌ها و رفتار امن

- هرگز بر اساس ترتیب رسیدن پیام‌ها، نام حساب، شماره چت یا حدس، یک وظیفه را به چت خاصی اختصاص نده.
- هرگز مستقیماً coordination/locks یا ACTIVE_LOCKS.json را ویرایش نکن.
- CLAIM ناموفق، timeout، پاسخ مبهم، خطای workflow یا read-back ناسازگار یعنی STOP WRITES؛ ابتدا اثر واقعی را بررسی کن.
- CHAT_ID/RUN_ID جایگزین هویت GitHub نیستند. برای اثبات اجرای چندحسابی، author/login مستقل GitHub باید در شواهد دیده شود.
- چت‌های متعدد می‌توانند READ_ONLY را بدون claim انجام دهند؛ تمام writeهای کنترل‌پلین و محصول تابع write_policy و claim هستند.
- مخزن محصول a4adelahmadian86-wq/non تا تصویب مجوز جداگانه فقط READ_ONLY است.
- هیچ تضمین hard-fencing برای مسیرهای direct write خارج از coordinator ادعا نکن.

## معیار پذیرش BROADCAST

این قابلیت فقط پس از ثبت شواهد واقعی برای تمام موارد زیر پذیرفته می‌شود:

1. یک متن دقیقاً یکسان MASTER-00 به‌طور هم‌زمان در حداقل دو چت و دو حساب مستقل ChatGPT ارسال شود؛ هر دو به GitHub با حساب‌های مستقل متصل باشند.
2. دو حساب برای یک resource key مشترک claim کنند؛ دقیقاً یکی موفق شود و دیگری پس از read-back به برگ مستقل بعدی منتقل شود.
3. دو حساب دو برگ با resource keyهای مستقل را claim کنند و leaseها در زمان هم‌پوشان ACTIVE باشند.
4. هر دو چت یک هدف والد را ببینند؛ allocator برگ‌های غیرمتداخل بسازد و هر چت یک برگ جدا بگیرد؛ هیچ step/evidence تکراری یا نوشتن هم‌زمان روی branch مشترک رخ ندهد.
5. یک نشست پس از checkpoint متوقف شود؛ نشست دیگر پس از release/expiry، همان WORK_ITEM_ID را با RUN_ID و fencing token جدید resume کند.
6. فرمان heartbeat/write با token قدیمی پس از takeover رد شود.
7. هر دو حساب بتوانند وضعیت مشترک و checkpoint نهایی یکدیگر را از GitHub بخوانند و گزارش واحد سازگار تولید کنند.

برای هر مورد SHA، زمان UTC، login واقعی GitHub، Issue، comment ID، RUN_ID، resource keys، fencing token، branch، checkpoint و لینک run ثبت شود. unit test، دو CHAT_ID ساختگی در یک حساب، یا یک run موفق Actions جایگزین این آزمون نیست.

## وضعیت فعلی

پیاده‌سازی مرکزی CAS/lease/fencing، Issue-per-leaf، انتخاب Work Item، checkpoint و resume در main وجود دارد؛ این سند الگوریتم پخش یکسان را صریح می‌کند. آزمون E2E دو حساب مستقل و سناریوی یک‌پرامپت/چندچت هنوز باید اجرا و ثبت شود. تا آن زمان وضعیت NOT VERIFIED باقی می‌ماند.


## قرارداد اجرایی نهایی: هر ترتیب، مسیر G-09 و N چت

- هر یک از PR-01 تا PR-17 می‌تواند نقطه شروع مستقل باشد؛ شماره PR ترتیب اجرا یا dependency ایجاد نمی‌کند. فقط hard_gates صریح Work Item معتبرند.
- دامنه نامزد برای هر پرامپت تخصصی = EXPهای سربرگ **OR** parent_goal_ids شامل G-09. مسیر G-09 برای همه ۱۷ پرامپت جهانی است. اگر G-09 قفل/blocked/review باشد، آن نامزد را skip کن و به برگ محلی بعدی برو.
- برای WRITE_ALLOWED، operation_scope_version="1.0" و requested_operations صریح، غیرخالی و یکتا لازم است. control-plane write=control_plane_write؛ NON product write=product_implementation با owner_approval_ref دقیق؛ سایر مخازن=repository_write. READ_ONLY=analysis؛ پیش از owner approval، WRITE_REQUIRES_OWNER_APPROVAL=proposal_only. Merge/release/auth/destructive/migration مجوزهای جداگانه‌اند.
- comment ID صندوق ورودی پایدار و idempotency key است. اجرای مجدد یا scheduled reconciliation فقط commandهای پردازش‌نشده را اجرا می‌کند؛ response ثبت‌شده ولی ارسال‌نشده را بازیابی می‌کند؛ comment تکراری نباید lease یا پاسخ تکراری بسازد.
- N سقف ثابت در قرارداد ندارد؛ آزمون‌های اجباری N=2,5,10,25 هستند. یک resource مشترک فقط یک برنده دارد؛ منابع مستقل می‌توانند هم‌زمان claim شوند؛ بازنده باید read-back کند و نامزد بعدی را انتخاب کند.
- مورد canonical شناخته‌شده: Issue #66 / WI-EXP02-BACKUP-RECOVERY-001؛ Issue #14 / WI-EXP02-BACKUP-RESTORE-001 فقط سابقه superseded است.
- سقف عملی throughput تابع GitHub Actions/API quota است. اجرای مستقل از چت یعنی وضعیت و checkpoint در GitHub ذخیره شود، نه اینکه عامل بدون دسترسی به GitHub یا خارج از quota بتواند پیش برود.

## جلوگیری از برخورد CHAT_ID و قفل سراسری کاذب

- هر مکالمه جدید باید پیش از اولین claim یک CHAT_ID تصادفی مستقل (ترجیحاً UUID v4 یا ۳۲ رقم hex تصادفی) تولید کند. شناسه را در همان مکالمه و checkpoint نگه دار و برای تمام پرامپت‌های همان چت استفاده کن. هر مکالمه جدید شناسه جدید می‌سازد؛ حتی اگر GitHub login مشترک باشد.
- یک CHAT_ID فقط یک Lease فعال می‌تواند داشته باشد؛ این محدودیت نباید به چت‌های دیگر تعمیم داده شود. اگر claim با `chat_conflict` رد شد، همان lock را بررسی کن و بین resume کردن کار خودت و تصادف CHAT_ID تمایز بگذار. فقط یک مکالمه تازه که هیچ Lease فعالی نگرفته می‌تواند شناسه تکراری را قبل از claim موفق با شناسه جدید جایگزین کند.
- پیش از claim نوشتنی، دامنه را به resource keys دقیق محدود کن: `file:path` برای فایل، `dir:path` برای پوشه و فرزندانش، `module:id` برای ماژول منطقی. `repo:label` قفل انحصاری کل target_repository است. کلید legacy `repo:non:controlled-implementation` را برای درخواست جدید تکرار نکن. دامنه نامعلوم = READ_ONLY discovery، نه قفل عمومی NON.
- دو چت با CHAT_IDهای متفاوت و منابع غیرمتداخل می‌توانند هم‌زمان کار کنند؛ تعارض فقط در resource overlap، وابستگی واقعی، مجوز یا یک CHAT_ID مشترک است. رد claim یک نامزد به معنی توقف کل چت نیست.
- هر Issue concurrency group مستقل دارد؛ بنابراین چت‌های روی Issueهای متفاوت می‌توانند فرمان‌های هماهنگ‌کننده را هم‌زمان ارسال کنند. ACTIVE_LOCKS.json یک ref مشترک است و به‌صورت fast-forward CAS با force=false به‌روزرسانی می‌شود؛ در رقابت، فقط یک commit برنده است و فرمان بازنده تا sweep بعدی در inbox پایدار می‌ماند. برای هر Issue در هر pass حداکثر ۳ فرمان قدیمی‌تر پردازش می‌شود. بعد از فرمان پاسخ همان comment ID را بررسی کن؛ نبود پاسخ/صف را قفل منابع گزارش نکن و فرمان تکراری ارسال نکن.

