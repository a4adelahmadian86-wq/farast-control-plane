# اجرای سلسله‌مراتبی Work Itemها

## مدل هویت و مرزبندی
- هر برگ اجرایی یک GitHub Issue مستقل و یک `WORK_ITEM_ID` پایدار دارد؛ Issue والد فقط گروه‌بندی/تجمیع است و claim نمی‌شود.
- `WORK_ITEM_ID` از Issue number، Chat ID و Run ID مستقل است. شماره Issue مرجع transport است، نه هویت معنایی کار.
- هر اجرای جدید پس از resume، RUN_ID تازه می‌گیرد؛ WORK_ITEM_ID، step IDs و evidenceهای قبلی ثابت می‌مانند.
- Issue-per-leaf با coordinator فعلی سازگار است: قفل یک Issue و قفل سراسری resource keys هر دو اعمال می‌شوند.

## ساختار اجباری هر برگ
از `WORK_ITEM_SCHEMA.json` استفاده کن. هر برگ باید هدف والد، EXP، دامنه، target repository، resource keys، dependencies، priority و منبع اولویت، write_policy، گام‌های اتمی، خروجی هر گام، معیار پذیرش و evidence requirement داشته باشد. اگر این اطلاعات ناقص است، برگ READY نیست.

## انتخاب عادلانه و deterministic

1. snapshot زنده از همه Issueهای باز و بسته، Work Item JSONها، labels/statusها، رجیستری `coordination/locks`، checkpointها و dependency graph بگیر.
2. محدوده را از سربرگ پرامپت تخصصی (`- EXP:` و `- GOAL:`) استخراج کن؛ فقط برگ‌هایی با اشتراک `parent_exp_ids` نامزدند. MASTER-00 عمومی می‌تواند همه هدف‌های باز را ببیند.
3. فقط statusهای `READY`، `IN_PROGRESS` و `CLAIMED` بدون Lease فعال واجد بررسی‌اند. `BLOCKED`، `REVIEW_REQUIRED` و وضعیت‌های terminal حذف شوند.
4. تمام `hard_gates` باید از منبع معتبر `ACCEPTED/PASS` باشند؛ `soft_inputs` gate نیستند. gate مبهم/حل‌نشده یعنی حذف نامزد و ثبت blocker، نه حدس.
5. هر Lease فعال روی همان Issue یا یکی از `resource_keys` نامزد را حذف می‌کند. expiry نامعتبر fail-closed و فعال فرض می‌شود.
6. ابتدا Work Item نیمه‌تمام `IN_PROGRESS/CLAIMED` با checkpoint معتبر یا step PASS دارای evidence را resume کن؛ همان `WORK_ITEM_ID` و step IDs حفظ شوند و فقط remaining steps اجرا شوند.
7. برای بقیه نامزدها `effective_priority = max(0, priority - floor(age_days))` را محاسبه کن؛ سپس با ترتیب `effective_priority` صعودی، `ready_at_utc/created_at_utc` قدیمی‌تر، `WORK_ITEM_ID` و Issue number مرتب کن. priority عدد کمتر یعنی اولویت بالاتر؛ aging روزانه فقط tie/fairness را بهبود می‌دهد و priority مالک را در داده تغییر نمی‌دهد.
8. فقط نامزد اول را با `/farast claim` امتحان کن. Claim موفق CAS و read-back مرجع نهایی است. در conflict/رد/timeout، اثر فرمان را بررسی و در صورت عدم grant نامزد بعدی را امتحان کن؛ رد یک claim کل چت را متوقف نمی‌کند.
9. اگر هیچ leaf واجد شرایطی در محدوده پرامپت نبود، discovery، dependency analysis و evidence audit همان محدوده را read-only ادامه بده. برای ایجاد برگ جدید فقط allocator ثابت `WI-GOAL-ALLOCATOR-001` را با Lease انحصاری بگیر؛ اگر قفل است duplicate نساز و read-only ادامه بده.
10. بعد از هر handoff، review، release یا block صف را دوباره snapshot و انتخاب را تکرار کن. چت تخصصی نباید کار خارج از EXPهای خود را claim کند.

## سیاست نوشتن و اولویت
- `READ_ONLY`: فقط مشاهده/تحلیل/گزارش؛ هیچ تغییر فایل یا PR در target repository مجاز نیست.
- `WRITE_REQUIRES_OWNER_APPROVAL`: فقط پیشنهاد تغییر؛ تا ثبت تأیید صریح مالک هیچ write انجام نشود.
- `WRITE_ALLOWED`: فقط در محدوده مخزن و resourceهای مجاز و پس از claim معتبر.
- مخزن محصول `a4adelahmadian86-wq/non` به‌صورت پیش‌فرض `READ_ONLY` است. تنها استثنا یک Work Item با `WRITE_ALLOWED` است که Issue آن را repository owner ساخته، `owner_approval_ref` دقیقاً URL همان Issue است و بدنه Issue تصمیم صریح مالک را ثبت می‌کند. این استثنا فقط همان Issue را پوشش می‌دهد؛ هیچ Work Item قدیمی به‌صورت خودکار ارتقا نمی‌یابد.
- `priority_source=DEFAULT_POLICY` با priority=50 یعنی اولویت برابر و انتخاب FIFO/aging؛ این مقدار رتبه‌بندی مالک نیست. فقط وقتی مالک صریحاً رتبه تعیین کرد `OWNER_ASSIGNED` ثبت شود. `OWNER_ASSIGNED` فقط با تصمیم صریح مالک ثبت شود.

## تخصیص branch بر اساس write_policy
- `WRITE_ALLOWED`: Coordinator یک branch یکتای `work/GH-ISSUE-RUN` صادر می‌کند؛ worker فقط پس از Claim و Heartbeat معتبر آن را در همان target repository می‌سازد.
- `READ_ONLY`: Coordinator باید `branch=none` ثبت کند. worker حق ساخت branch، commit، file یا PR در target repository را ندارد؛ evidence فقط در Issue thread یا artifact location صریحاً مجاز در control-plane ثبت می‌شود.
- `WRITE_REQUIRES_OWNER_APPROVAL`: تا زمان ثبت approval معتبر مالک، مانند READ_ONLY بدون branch و بدون write در target repository رفتار کن؛ فقط proposal در Issue ثبت شود.
- Work Item فاقد policy معتبر یا دارای اختلاف میان Issue form و JSON باید fail-closed شود؛ default سازگار قدیمی فقط READ_ONLY است و هرگز نباید به branch-write تبدیل شود.
- branch lineage و previous_branch فقط برای مسیرهای WRITE_ALLOWED قابل استفاده‌اند؛ claim branchless نباید branch قدیمی محصول را به عامل بعدی تحویل دهد.

## پیشرفت و پذیرش
- هر step فقط با validation_status=PASS و حداقل یک evidence_ref معتبر شمرده می‌شود.
- اگر weighting.version و وزن مثبت برای تمام stepهای اجباری وجود داشته باشد، درصد بر اساس وزن‌هاست؛ در غیر این صورت همه stepهای اجباری هم‌وزن‌اند.
- درصد تا دو رقم اعشار، رو به پایین گرد می‌شود. این درصد فقط پیشرفت است، نه پذیرش.
- ACCEPTED فقط وقتی مجاز است که تمام stepهای اجباری، تمام acceptance criteria اجباری و همه dependencyهای سخت ACCEPTED باشند.
- evidence باید به commit، فایل، تست، گزارش یا منبع قابل بازبینی در GitHub ارجاع دهد؛ متن ادعایی worker به‌تنهایی evidence نیست.
- worker فقط با lease معتبر و fencing token جاری می‌تواند وضعیت step یا checkpoint را ثبت کند.

## قطع اجرا و resume
Checkpoint باید WORK_ITEM_ID، RUN_ID، آخرین step تأییدشده، step جاری، remaining step IDs، درصد محاسبه‌شده، evidence refs، blockers، owner/lease/token و NEXT_ACTION را نگه دارد. پس از interruption:
- GitHub را read-back کن؛ وضعیت نامعلوم را retry نکن.
- همان WORK_ITEM_ID و checkpoint را بازیابی کن.
- پس از claim مجدد، RUN_ID و fencing token جدید را ثبت کن.
- فقط remaining stepها را انجام بده؛ stepهای verified را تکرار نکن مگر evidence نامعتبر/منسوخ شده باشد.
- token قدیمی هیچ write یا تغییر progress مجاز نمی‌کند.

## وضعیت‌ها
BACKLOG, READY, CLAIMED, IN_PROGRESS, BLOCKED, REVIEW_REQUIRED, PARTIALLY_ACCEPTED, ACCEPTED, REJECTED, CANCELLED. وضعیت پیشرفت از وضعیت lease/ownership جداست. RELEASE به معنی ACCEPTED نیست.

## وضعیت عملیاتی
هسته Work Item، schema، template و فرمان‌های `/farast step`, `/farast criterion`, `/farast progress`, `/farast checkpoint` در main ادغام و در smoke test زنده یک حساب/دو CHAT_ID آزموده شده‌اند. این smoke test، آزمون دو حساب مستقل نیست. آزمون واقعی دو حساب مستقل، interruption واقعی بین دو نشست و schedule هنوز gateهای جداگانه‌اند؛ unit/fixture یا دو CHAT_ID با یک حساب جایگزین آن‌ها نیست.


## حلقه پیوسته برای یک پرامپت مشترک

هر چت که MASTER-00 یکسان دریافت می‌کند، پس از پایان یا مسدودشدن هر Work Item باید صف مشترک را دوباره از GitHub بخواند و نامزد بعدی را claim کند. چت‌ها نباید منتظر تخصیص دستی از سوی مالک بمانند. claim بازنده پس از read-back به نامزد بعدی منتقل می‌شود. هدف مسدودشده کنار گذاشته می‌شود، اما تحلیل و اجرای کارهای مستقل مجاز ادامه می‌یابد. در نبود leaf آزاد، allocator ثابت را claim کن؛ اگر allocator در اختیار چت دیگر است، فقط عملیات تخصیص را به تعویق بینداز و read-only discovery را ادامه بده. هیچ سؤال یا درخواست انتخابی از مالک مجاز نیست. پیش از محدودیت نشست/زمینه، checkpoint و next_action دقیق ثبت شود تا همان پرامپت در نوبت بعدی از همان نقطه ادامه دهد.


## استاندارد عمق ۱۷×۲۷ و سه‌گانه پیشرفت (نسخه 2.0)
پیش از READY کردن یا claim هر leaf، `04_COORDINATION/WORK_ITEM_DEPTH_STANDARD.md` و `01_STRATEGY/EXECUTION_DECOMPOSITION_17x27.md` را اجرا کن. هر EXP باید حداقل ۶ گام substantive، ۴ معیار پذیرش، ۳ deliverable، شواهد لازم و effort هدف ۲۰–۳۰ دقیقه داشته باشد. Work Itemهای فعلی که فقط چهار گام عمومی دارند تا زمان غنی‌سازی و read-back، `DEPTH_NOT_VERIFIED` هستند؛ آن‌ها را صرفاً به دلیل وجود Issue، leaf عمیق یا READY معتبر اعلام نکن.

برای هر گزارش/checkpoint سه شاخص جداگانه را طبق `04_COORDINATION/PROGRESS_REPORTING_PROTOCOL.md` محاسبه کن:
- EXECUTION_PROGRESS
- ACCEPTANCE_PROGRESS
- OVERALL_COMPLETION

اگر criteria تعریف نشده یا وزن معتبر نیست، N/A را صریح ثبت کن. claim/lease/owner و blocker مستقل از این درصدها هستند. claim موفق یا branch creation به‌تنهایی progress نیست.

## جایگزینی امن branch پس از ادغام PR

اگر branch اجرای قبلی حذف شده یا PR قبلی بسته/ادغام‌نشده است، branch گمشده را بازسازی یا reuse نکن. اگر یک PR جایگزین قبلاً merge شده، فقط پس از read-back PR و اثبات اینکه merge commit آن ancestor شاخه پیش‌فرض فعلی همان target repository است، می‌توان `main` فعلی را checkpoint جایگزین و مبنای branch جدید دانست. اثبات باید از GitHub Compare بیاید: `base_commit.sha` و `merge_base_commit.sha` برابر merge commit، `behind_by=0` و status برابر `ahead` یا `identical` باشد. این قاعده مجوز پذیرش PR ادغام‌نشده نیست؛ PR باز همچنان باید دقیقاً از branch آخرین رویداد REVIEW همان lease باشد. Coordinator فقط برای PR بسته و واقعاً merged با مخزن head/base برابر target و Check Runهای موفق روی SHA دقیق head استثنای lineage را می‌پذیرد. هر compare ناموفق یا مبهم = STOP WRITES.
