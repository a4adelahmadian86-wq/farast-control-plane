# قرارداد فرمان‌های هماهنگ‌کننده چندچتی FARAST

## اصل اجرا
- فایل `04_COORDINATION/ACTIVE_LOCKS.json` فقط توسط workflow `.github/workflows/farast-coordinator.yml` نوشته می‌شود.
- همه فرمان‌ها در کامنت Issue ثبت می‌شوند؛ کامنت صندوق ورودی پایدار و تاریخچه است، نه منبع حقیقت مالکیت.
- هماهنگ‌کننده همه Issueهای FARAST را با یک concurrency group سراسری پردازش می‌کند. اجرای دوره‌ای هر پنج دقیقه فرمان‌های جامانده را بازیابی می‌کند.
- هیچ چت/حسابی حق نوشتن مستقیم در رجیستری قفل ندارد. اگر workflow فعال نیست یا پاسخ معتبر دریافت نشده، نوشتن روی منابع مشترک ممنوع است.
- PR #1 ادغام شده و workflow در main قرار دارد؛ با این حال فعال بودن schedule و مجوز write باید از run زنده Actions تأیید شود.

## ساخت TASK
Issue باید عنوان `[FARAST-TASK]` داشته باشد. فیلد Target repository باید به شکل owner/name تکمیل شود و بخش Resource keys کلیدهای canonical و جداشده با خط جدید داشته باشد. Claim بدون هرکدام رد می‌شود. اگر خالی باشد، Claim رد می‌شود؛ برای هر کار باید دست‌کم یک کلید دقیق ثبت شود. fallback به قفل Issueمحور مجاز نیست.

نمونه:
```text
### Resource keys
module:payments
file:app/Services/PaymentService.php
api-contract:payment-callback
```

## فرمان‌ها
هر فرمان را در یک کامنت مستقل و با یک عملیات بنویسید:

- `/farast claim chat=CHAT_ID run=RUN_ID lease=30`
- `/farast heartbeat chat=CHAT_ID run=RUN_ID token=FENCING_TOKEN lease=30`
- `/farast release chat=CHAT_ID run=RUN_ID token=FENCING_TOKEN`
- `/farast status`
- `/farast progress`
- `/farast step step=STEP_ID result=PASS evidence=https://... token=FENCING_TOKEN chat=CHAT_ID run=RUN_ID`
- `/farast criterion id=CRITERION_ID result=PASS evidence=https://... token=FENCING_TOKEN chat=CHAT_ID run=RUN_ID`
- `/farast checkpoint step=STEP_ID next_action="دستور دقیق بعدی" token=FENCING_TOKEN chat=CHAT_ID run=RUN_ID`
- `/farast block chat=CHAT_ID run=RUN_ID token=FENCING_TOKEN`
- `/farast unblock`
- `/farast review chat=CHAT_ID run=RUN_ID token=FENCING_TOKEN`
- `/farast reopen`
- `/farast accept pr=https://github.com/OWNER/REPO/pull/NUMBER`

مقادیر CHAT_ID و RUN_ID شناسه‌های metadata هستند و هویت واقعی مکالمه را اثبات نمی‌کنند؛ از alias غیرحساس استفاده کنید و شناسه خصوصی مکالمه را در مخزن عمومی ننویسید. هویت مجاز از actor GitHub و author_association بررسی می‌شود.

پاسخ موفق claim باید دقیقاً شامل عبارت **CLAIM GRANTED**، کلیدهای منبع، زمان پایان lease و fencing token باشد. بدون این پاسخ، claim موفق نیست.

## قواعد
1. Claim همه RESOURCE_KEYهای Issue را یکجا می‌گیرد یا هیچ‌کدام را؛ هر Issue در هر لحظه فقط یک owner فعال دارد، حتی اگر دو worker منابع disjoint درخواست کنند. branch قبلی یک Issue نیز قابل استفاده مجدد نیست؛ برای هر RUN شناسه یکتا لازم است.
2. یک fencing token برای کل مجموعه منابع یک claim صادر می‌شود.
3. lease پیش‌فرض ۳۰ دقیقه و بازه مجاز ۵ تا ۱۲۰ دقیقه است.
4. heartbeat/release/block/review فقط با actor، chat، run و token منطبق مجاز است؛ accept پس از handoff و بدون Lease فعال اجرا می‌شود و گیت‌های ماشینی/branch lineage را بررسی می‌کند.
5. پایان lease در reconciliation ثبت و قفل منقضی حذف می‌شود.
6. release به معنی اتمام کار نیست؛ review به معنی پذیرش نیست.
7. `/farast accept` فرمان اجرای پذیرش خودکار است: پس از آزاد شدن lease و تحویل Work Item به وضعیت review، Coordinator شاخه و مخزن PR را اعتبارسنجی می‌کند، همه Check Runها و Commit Statusهای SHA دقیق head را می‌سنجد، در صورت موفقیت PR را با SHA مورد انتظار ادغام می‌کند و سپس معیارهای Work Item را بررسی می‌کند. این فرمان به معنی درخواست Review یا تأیید انسانی نیست.
8. accept فقط وقتی مجاز است که Issue در وضعیت review و بدون lease باشد، لینک PR در بدنه Issue ثبت شده باشد، branch lineage معتبر باشد، همه Check Runها روی SHA دقیق head تکمیل و success باشند و تمام Commit Statusهای موجود نیز success باشند. اگر هیچ Commit Status قدیمی ثبت نشده، نبود آن‌ها مانع نیست؛ Check Run موفق همچنان الزامی است. سپس Coordinator PR را ادغام و معیارهای Work Item را بررسی می‌کند. Review انسانی، self-review و تأیید مالک شرط پذیرش نیستند.
9. بستن دستی Issue یا افزودن دستی label agent:done بدون transition موفق accept در operation ledger رد و Issue دوباره باز می‌شود؛ label به‌تنهایی منبع پذیرش نیست.
10. عملیات با شناسه comment یکتا deduplicate می‌شود؛ پاسخ نیمه‌تمام پس از وقفه بازیابی می‌شود.
11. عدم پاسخ، timeout یا خطای workflow هرگز grant محسوب نمی‌شود؛ وضعیت را از رجیستری و Actions run دوباره بخوانید.
12. هر برگ اجرایی یک Issue مستقل با WORK_ITEM_ID پایدار است؛ هنگام claim، coordinator همان WORK_ITEM_ID و فهرست گام‌های تأییدشده/باقی‌مانده را در پاسخ می‌دهد.
13. `/farast step` و `/farast criterion` فقط با lease فعال و evidence reference ثبت می‌شوند؛ `/farast progress` درصد محاسبه‌شده را نشان می‌دهد و `/farast checkpoint` فقط با fencing token معتبر ذخیره می‌شود.
14. `/farast accept` برای Work Item علاوه بر PR ادغام‌شده و گیت‌های ماشینی موفق، همه گام‌ها و معیارهای اجباری و dependencyهای ACCEPTED را لازم دارد؛ ۸۰٪ یا release به‌تنهایی پذیرش نیست.

## محدودیت هویت چندچتی
GitHub هویت واقعی ChatGPT chat را تأیید نمی‌کند. CHAT_ID و RUN_ID خوداظهاری‌اند و فقط برای تشخیص نشست/اجرای worker استفاده می‌شوند. کنترل امنیتی واقعی بر حساب GitHub مجاز، مالکیت lease و fencing token متکی است.


## پیش‌نیاز پذیرش PR در مخزن دیگر
اگر PR مرتبط در مخزنی غیر از farast-control-plane (مانند مخزن محصول non) قرار دارد، در تنظیمات Actions مخزن کنترل‌پلین یک Repository Secret با نام FARAST_GITHUB_TOKEN تعریف کنید. توکن باید فقط دسترسی read به Pull requests و metadata مخزن هدف را داشته باشد. مقدار توکن هرگز در Issue یا فایل مخزن نوشته نشود. بدون این Secret، پذیرش cross-repository عمداً رد می‌شود؛ پس از تنظیم Secret یک فرمان accept جدید ثبت کنید.


## Branch وظیفه
Coordinator فقط برای `write_policy=WRITE_ALLOWED` مقدار branch را به‌صورت `work/GH-ISSUE_NUMBER-RUN_ID` ثبت می‌کند. برای `READ_ONLY` و `WRITE_REQUIRES_OWNER_APPROVAL` مقدار branch باید null/none باشد و هیچ branch یا PR در target repository ساخته نشود؛ evidence در Issue thread یا محل مجاز control-plane ثبت می‌شود. خود workflow در مخزن هدف branch نمی‌سازد. worker فقط برای `WRITE_ALLOWED` باید branch را در target repository بسازد. اگر `previous_branch` وجود داشت، آن را read-only بررسی و آخرین commit/checkpoint معتبر را تأیید کند؛ سپس branch جدید را از همان commit بسازد. branch قبلی را هرگز تغییر ندهد. اگر checkpoint معتبر قابل تعیین نیست، پیش از هر write متوقف شود. branch استفاده‌شده قبلی برای همان Issue دوباره قابل claim نیست؛ RUN_ID جدید الزامی است. پذیرش PR فقط از branch آخرین رویداد REVIEW همان lease ممکن است.


## تفویض اختیار فرمان‌های چندچتی
سیاست فعال در `04_COORDINATION/ACTOR_AUTHORIZATION.json` اعمال می‌شود: OWNER همه فرمان‌ها را دارد؛ COLLABORATOR/MEMBER به‌صورت پیش‌فرض نقش WORKER می‌گیرند (claim/heartbeat/release/status/block/review/accept) و حق unblock/reopen ندارند. فرمان accept فقط پس از آزاد شدن Lease، ثبت REVIEW، تطبیق branch و repository، موفقیت تمام Check Runها و Commit Statusهای SHA دقیق و پاس شدن معیارهای Work Item پذیرفته می‌شود؛ Coordinator ادغام را خودکار انجام می‌دهد. این مسیر Review انسانی یا تأیید مالک نیست. نقش SENIOR_MANAGER تمام فرمان‌ها را فقط پس از درج دقیق GitHub login در `actor_roles` و تعیین دقیق `repositories` و `resource_key_prefixes` در `actor_scopes`، با تأیید مالک دریافت می‌کند؛ خارج از آن scope فرمان رد می‌شود. READ_ONLY فقط status دارد. `actor_roles` فعلاً خالی است؛ بنابراین هیچ مدیر ارشدی به‌صورت حدسی مجاز نشده است. تغییر این فایل باید از PR و با تأیید مالک انجام شود.


### نمونه تفویض محدود
برای یک مدیر ارشد، هر دو بخش `actor_roles[login]=SENIOR_MANAGER` و `actor_scopes[login]` باید تنظیم شوند. `repositories` فهرست دقیق owner/name و `resource_key_prefixes` پیشوندهای دقیق مانند `module:commerce` یا `file:src/commerce` هستند. claim یا هر فرمان دیگر خارج از هرکدام از این محدوده‌ها رد می‌شود. خالی بودن actor_scopes به معنی عدم تفویض است.


## قالب Work Item
هر Issue برگ باید فیلدهای `Write policy` و `Priority source` و `Work item specification JSON` را طبق `04_COORDINATION/WORK_ITEM_SCHEMA.json` پر کند. WORK_ITEM_ID، resource keys و target repository در JSON باید با فیلدهای Issue منطبق باشند. JSON نامعتبر یا ناقص باید fail-closed بماند. Checkpointهای ماشین‌خوان در رجیستری مرکزی ثبت می‌شوند و schema آن `WORK_ITEM_CHECKPOINT_SCHEMA.json` است.


## Write policy اجباری
- `READ_ONLY`: مجاز به read/analysis/evidence gathering هستی، نه file write یا PR در مخزن هدف.
- `WRITE_REQUIRES_OWNER_APPROVAL`: فقط proposal بساز؛ پیش از تأیید صریح مالک هیچ write نکن.
- `WRITE_ALLOWED`: تنها در scope مجاز و با lease/fencing معتبر write کن.
- `a4adelahmadian86-wq/non` به‌صورت پیش‌فرض READ_ONLY است. تنها `WRITE_ALLOWED` برای Issue ساخته‌شده توسط repository owner با `owner_approval_ref` دقیقاً برابر URL همان Issue و متن صریح تصمیم مالک پذیرفته می‌شود؛ این مجوز فقط همان Issue را پوشش می‌دهد.
- priority=50 با `DEFAULT_POLICY` اولویت خنثی است؛ FIFO و aging tie-break می‌کنند. رتبه‌بندی اختصاصی فقط با `OWNER_ASSIGNED` ثبت شود.

ساخت Work Item جدید فقط زیر قفل allocator با شناسه ثابت `WI-GOAL-ALLOCATOR-001` مجاز است. ابتدا Issueهای موجود و WORK_ITEM_IDها را جست‌وجو کن؛ سپس allocator را claim کن، leafهای جدید را با شناسه deterministic بساز و پس از read-back قفل را release کن. هیچ دو چتی نباید هم‌زمان pool را گسترش دهند.


## Refresh کردن مشخصات Work Item (فقط مالک)
اگر body یک Issue تغییر کرد و نسخه قبلی همان WORK_ITEM_ID در registry ذخیره شده است، به‌روزرسانی Issue body به‌تنهایی registry را جایگزین نمی‌کند. پس از اطمینان از نبود lease فعال، مالک می‌تواند در همان Issue فرمان زیر را ثبت کند:

`/farast refresh`

- فقط نقش OWNER مجاز است؛ worker/manager این فرمان را ندارند.
- هر lease فعال، refresh را رد می‌کند.
- WORK_ITEM_ID باید ثابت بماند.
- شواهد گام‌ها و معیارهایی که شناسه‌شان بدون تغییر مانده حفظ می‌شوند؛ شواهد گام‌های حذف‌شده به گام جدید منتقل نمی‌شوند.
- مشخصات جدید با schema/core validation بررسی می‌شود؛ اگر عمق یا evidence requirement ناقص باشد refresh رد می‌شود.
- پس از refresh، progress سه‌گانه از ساختار جدید محاسبه و وضعیت READY/IN_PROGRESS/REVIEW_REQUIRED تعیین می‌شود.
- refresh پذیرش یا اجرای کار نیست؛ فقط همگام‌سازی تعریف Work Item بین Issue و registry است.

## پذیرش امن PR جایگزین ادغام‌شده

- قاعده اصلی برای PR باز یا ادغام‌نشده تغییر نمی‌کند: `head.ref` باید دقیقاً با branch آخرین رویداد `REVIEW` همان lease و مخزن target یکسان باشد.
- فقط برای PR جایگزینی که از قبل `closed` و `merged=true` است، Coordinator می‌تواند عدم تطابق branch تاریخی را بپذیرد؛ مشروط بر اینکه مخزن head و base دقیقاً با `target_repository` یکسان باشند، `base.ref` شاخه پیش‌فرض همان مخزن باشد و `merge_commit_sha` خالی نباشد.
- Coordinator باید با GitHub Compare ثابت کند `merge_commit_sha` ancestor شاخه پیش‌فرض فعلی است: `base_commit.sha` و `merge_base_commit.sha` هر دو باید دقیقاً برابر merge commit باشند، `behind_by=0` و status فقط `ahead` یا `identical` باشد.
- Check Runها و Commit Statusهای SHA دقیق `pr.head.sha` همچنان باید موفق باشند؛ hard gate، dependency، operation gate، Issue link و نبود lease فعال نیز بدون تغییر الزامی‌اند.
- PR باز/ادغام‌نشده، fork، مخزن متفاوت، base branch متفاوت، compare ناموفق/مبهم یا merge commit غیرancestor هرگز از این استثنا عبور نمی‌کند. حالت lineage در operation ledger با `EXACT_REVIEW_BRANCH` یا `MERGED_REPLACEMENT_ANCESTOR` ثبت می‌شود.
