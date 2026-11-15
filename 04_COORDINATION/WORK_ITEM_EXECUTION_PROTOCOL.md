# اجرای سلسله‌مراتبی Work Itemها

## مدل هویت و مرزبندی
- هر برگ اجرایی یک GitHub Issue مستقل و یک `WORK_ITEM_ID` پایدار دارد؛ Issue والد فقط گروه‌بندی/تجمیع است و claim نمی‌شود.
- `WORK_ITEM_ID` از Issue number، Chat ID و Run ID مستقل است. شماره Issue مرجع transport است، نه هویت معنایی کار.
- هر اجرای جدید پس از resume، RUN_ID تازه می‌گیرد؛ WORK_ITEM_ID، step IDs و evidenceهای قبلی ثابت می‌مانند.
- Issue-per-leaf با coordinator فعلی سازگار است: قفل یک Issue و قفل سراسری resource keys هر دو اعمال می‌شوند.

## ساختار اجباری هر برگ
از `WORK_ITEM_SCHEMA.json` استفاده کن. هر برگ باید هدف والد، EXP، دامنه، target repository، resource keys، dependencies، priority و منبع اولویت، write_policy، گام‌های اتمی، خروجی هر گام، معیار پذیرش و evidence requirement داشته باشد. اگر این اطلاعات ناقص است، برگ READY نیست.

## انتخاب عادلانه و deterministic
1. ابتدا همه برگ‌های باز و registry فعال را از GitHub بخوان.
2. برگ‌های terminal، BLOCKED، REVIEW_REQUIRED و دارای dependency ناتمام را حذف کن.
3. برگ دارای lease معتبر یا resource conflict را حذف کن.
4. میان نامزدها priority عددی مالک‌تعیین‌شده را با aging روزانه تعدیل کن؛ اولویت مالک را تغییر نده. سپس قدیمی‌ترین ready/created time و در نهایت WORK_ITEM_ID برای tie-break استفاده شود.
5. اگر برگ IN_PROGRESS با lease منقضی یافت شد، همان برگ و checkpoint آن برای resume واجد انتخاب است؛ شناسه را عوض نکن.
6. بعد از انتخاب، فقط با /farast claim روی Issue همان برگ claim بگیر. claim موفق CAS مرجع نهایی است؛ انتخاب محلی مجوز write نیست.
7. اگر هیچ برگ واجد شرایط نبود، درخت هدف و EXPهای ناقص را با Issueهای موجود تطبیق بده. برای ساخت برگ جدید ابتدا Issue allocator با WORK_ITEM_ID ثابت `WI-GOAL-ALLOCATOR-001` را claim کن؛ فقط در اختیار lease آن، WORK_ITEM_ID قطعی بساز و Issueهای leaf را ایجاد کن. اگر allocator موجود/آزاد نیست، duplicate نساز و claim را دور نزن؛ discovery، تحلیل dependency، ممیزی شواهد و آماده‌سازی read-only کارهای مستقل را ادامه بده و بعداً دوباره allocator را بررسی کن. نبود Lease فقط همان کار را متوقف می‌کند، نه کل چت را.

## سیاست نوشتن و اولویت
- `READ_ONLY`: فقط مشاهده/تحلیل/گزارش؛ هیچ تغییر فایل یا PR در target repository مجاز نیست.
- `WRITE_REQUIRES_OWNER_APPROVAL`: فقط پیشنهاد تغییر؛ تا ثبت تأیید صریح مالک هیچ write انجام نشود.
- `WRITE_ALLOWED`: فقط در محدوده مخزن و resourceهای مجاز و پس از claim معتبر.
- برای مخزن محصول `a4adelahmadian86-wq/non`، coordinator فقط `READ_ONLY` را می‌پذیرد تا زمانی که مالک مجوز جداگانه و صریح صادر کند.
- `priority_source=DEFAULT_POLICY` با priority=50 یعنی اولویت برابر و انتخاب FIFO/aging؛ این مقدار رتبه‌بندی مالک نیست. فقط وقتی مالک صریحاً رتبه تعیین کرد `OWNER_ASSIGNED` ثبت شود. `OWNER_ASSIGNED` فقط با تصمیم صریح مالک ثبت شود.

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
