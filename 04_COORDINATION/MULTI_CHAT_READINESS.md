# ارزیابی آمادگی اجرای چندچتی FARAST

آخرین بازبینی: 2026-11-15  
مرجع کد: شاخه `main`؛ SHA جاری را زنده از GitHub بخوانید.  
PR کنترل‌پلین: https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/1

## نتیجه مدیریتی

**وضعیت فعلی: LIVE SINGLE-ACCOUNT SMOKE PASS — MULTI-ACCOUNT E2E NOT VERIFIED**

PR #1 ادغام شده و workflow فرمانی `issue_comment` روی `main` در اجرای زنده موفق بوده است. آزمون زنده تک‌حسابیِ تعارض منبع مشترک و lease هم‌پوشان روی منابع مستقل نیز موفق است؛ با این حال تا اجرای آزمون دو حساب GitHub مستقل و دو نشست ChatGPT جداگانه، آمادگی کامل چندحسابی تأیید نمی‌شود.

## آنچه پیاده‌سازی و در CI بررسی شده است

- یک workflow مرکزی برای فرمان‌های `/farast` با concurrency سراسری single-writer؛ نه قفل جداگانه برای هر Issue.
- Issue comments به‌عنوان inbox پایدار فرمان‌ها و history؛ رجیستری `coordination/locks` منبع حقیقت lease و مالکیت منابع است.
- claim چندمنبعی all-or-none، یک owner فعال برای هر TASK، lease، heartbeat، fencing token، انقضا و reconciliation.
- deduplication بر اساس comment ID و بازیابی پاسخ پس از interruption.
- فرمان‌های claim، heartbeat، release، status، block، unblock، review، reopen و accept.
- نقش‌های OWNER، SENIOR_MANAGER، WORKER و READ_ONLY؛ مدیر ارشد فقط با تفویض صریح و scope دقیق repository/resource فعال می‌شود.
- branch مستقل برای هر RUN، جلوگیری از استفاده مجدد branch و ثبت lineage تحویل.
- کنترل پذیرش PR از نظر branch/repository آخرین REVIEW، merged بودن، و approval مستقل روی head فعلی. approval قدیمی که بعداً با CHANGES_REQUESTED/DISMISSED جایگزین شده باشد پذیرفته نمی‌شود؛ repository مبدأ و مقصد PR نیز باید با مخزن هدف منطبق باشند.
- ۱۷ پرامپت تخصصی مستقل، MASTER-00 و bundle تجمیعی؛ تطبیق محتوای bundle با ۱۸ منبع مستقل در read-back زنده: **۱۸/۱۸ PASS**.
- CI موفق روی head `a02a34b4a4bd45302cbc1cf918f1927ad61a4442`: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43611034691 ؛ ۱۴ آزمون هسته PASS و اعتبارسنجی workflow، JavaScript، JSON/schema و قرارداد ۱۷ پرامپت موفق. CI سبز، آزمون زنده چندحسابی محسوب نمی‌شود.

## مرز مهم تضمین فنی

این نسخه یک **سامانه هماهنگی چندچتی با کنترل مرکزی و پروتکل همکاری** است، نه یک دروازه اجباری که تمام نوشتن‌های مخزن محصول را از نظر رمزنگاری/زیرساختی رهگیری کند.

- GitHub هویت واقعی ChatGPT chat را ارائه نمی‌کند؛ `CHAT_ID` و `RUN_ID` metadata خوداظهاری‌اند. هویت قابل اتکا، حساب GitHub و مجوز آن است.
- workflow مرکزی فقط رجیستری کنترل‌پلین را کنترل می‌کند. اگر یک worker دسترسی مستقیم write به مخزن محصول داشته باشد، GitHub به‌صورت ذاتی هر commit آن worker را با fencing token رجیستری تطبیق نمی‌دهد.
- branch یکتا برای هر RUN و کنترل پذیرش، ریسک تداخل را کاهش می‌دهد؛ اما به‌تنهایی مانع فنی push یا merge یک PR قدیمی در مخزن محصول نمی‌شود.
- بنابراین تا زمانی که branch protection مخزن محصول، محدودیت merge، review مستقل و قواعد لازم اعمال و آزموده نشده‌اند، این سازوکار را تضمین hard-fencing یا ضدعامل متخلف معرفی نمی‌کنیم.
- heartbeat خودکار در پس‌زمینه تضمین‌شده نیست؛ worker باید طبق راهنما فرمان heartbeat را اجرا کند و در صورت ناتوانی در تأیید lease، نوشتن را متوقف کند.

## موانع عملیاتی باقی‌مانده

1. PR #1 در commit `b8cf85cfd6552028750eefa3cff03d844175814c` ادغام شده است؛ اجرای زنده workflow فرمانی و schedule باید تأیید شود.
2. هیچ review مستقل یا review thread برای PR #1 ثبت نشده است. CI سبز جایگزین بازبینی مستقل نیست.
3. branch protection / ruleset شاخه `main` از طریق اتصال فعلی تأیید نشده است.
4. تنظیم GitHub Actions برای اجازه write در مخزن باید توسط مالک بررسی شود.
5. آزمون دو حساب GitHub مستقل در دو نشست ChatGPT، claim هم‌زمان، منبع مشترک و disjoint، قطع اتصال، expiry/takeover و رد token قدیمی هنوز **NOT_RUN** است.
6. برای بررسی PR در مخزن محصول `non`، Secret با نام `FARAST_GITHUB_TOKEN` و مجوز حداقلی read به Pull requests و Metadata لازم است.
7. مخزن کنترل‌پلین فعلاً PUBLIC می‌ماند؛ فقط اطلاعات عمومی و غیرمحرمانه مجاز است.

## وضعیت پس از ادغام PR #1

PR #1 در SHA `b8cf85cfd6552028750eefa3cff03d844175814c` ادغام شده است. CI روی main در حال اجرا/اعتبارسنجی پس از merge است؛ وضعیت نهایی را از run زنده بخوانید. شاخه `coordination/locks` و رجیستری موجودند؛ workflow تنها writer مجاز باقی می‌ماند.

## معیار عبور به READY

- [ ] PR #1 توسط فردی غیر از نویسنده، مستقل بازبینی و تأیید شود.
- [ ] Ruleset/branch protection شاخه `main` و required checkها فعال و read-back شوند.
- [x] PR #1 با مجوز صریح مالک ادغام شد؛ فایل‌های مرجع در main باید همچنان read-back شوند.
- [ ] Actions write permission و اجرای workflow، schedule و issue_comment در default branch به‌صورت زنده تأیید شوند.
- [ ] دو حساب مستقل و دو نشست ChatGPT آزمون‌های بخش سطح ۳ در `COORDINATOR_TEST_PLAN.md` را بگذرانند.
- [ ] branch protection و قواعد merge مخزن هدف بررسی شوند؛ تا آن زمان هیچ ادعای hard-fencing مطرح نشود.
- [ ] نتیجه هر آزمون با SHA، زمان، حساب/نقش و شواهد در GitHub ثبت شود.

## استفاده در وضعیت فعلی

برای کار عمومی/غیرمحرمانه از شاخه `main` استفاده کنید. برای هر اقدام نوشتنی، تا فعال شدن workflow در default branch و دریافت پاسخ قطعی `CLAIM GRANTED`، فقط read-only بمانید. هیچ secret، credential، PII، داده مشتری یا سند محرمانه در مخزن عمومی ثبت نشود.

راهنماهای مرتبط:
- [START HERE](../START_HERE.md)
- [فرمان‌های coordinator](COORDINATOR_COMMANDS.md)
- [تنظیمات دستی GitHub](MANUAL_GITHUB_SETTINGS.md)
- [برنامه آزمون پذیرش](COORDINATOR_TEST_PLAN.md)
- [محدودیت‌های کنترل‌پلین](../00_PROJECT_FOUNDATION/CONTROL_PLANE_LIMITATIONS.md)


## Work Item execution

هسته Work Item و دستورات `/farast step`, `/farast criterion`, `/farast progress`, `/farast checkpoint` در `main` موجودند و ۲۰ آزمون اختصاصی آن‌ها در CI موفق است. این نتیجه به معنی اجرای E2E چندحسابی نیست؛ آزمون دو حساب مستقل همچنان NOT_RUN است.


---

## بازبینی زنده و اصلاح وضعیت — 2026-11-14

این بخش وضعیت قبلی همین سند را با شواهد زنده GitHub به‌روزرسانی و موارد متناقض/قدیمی بالا را supersede می‌کند.

- PR #1 در مخزن کنترل‌پلین **ادغام‌شده** است: https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/1
- شاخه `main` در زمان بازبینی روی commit `8c9d9f160b6294cdfd0d4395e607806b444d4f77` بود.
- اجرای زنده `issue_comment` در workflow مرکزی روی main موفق است؛ نمونه run: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43621665929
- CI اعتبارسنجی main موفق است: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43621164160
- نتایج دقیق CI: coordinator **14/14 PASS**؛ Work Item **20/20 PASS**؛ YAML/JavaScript، فایل‌های ضروری، JSON/schema و قراردادهای prompt bootstrap نیز PASS.
- آزمون زنده سه Issue آزمایشی: Issue #7 منبع مشترک را با token=51 گرفت؛ Issue #8 برای همان resource key با پاسخ resource conflict رد شد؛ Issue #9 منبع مستقل را با token=52 گرفت. بازه lease دو claim موفق هم‌پوشان بود. شواهد و محدودیت‌های این آزمون در [گزارش تفصیلی](../08_REPORTS/MULTI_CHAT_CONCURRENCY_SMOKE_2026-11-14.md) ثبت شده‌اند.
- این سه فرمان با یک actor GitHub اجرا شده‌اند؛ CHAT_ID/RUN_ID مقادیر metadata خوداظهاری‌اند. بنابراین این آزمون **جایگزین دو حساب مستقل نیست**.

### وضعیت معیارها در این بازبینی

- [x] PR #1 ادغام و workflow فرمانی روی default branch فعال است.
- [x] CI اعتبارسنجی روی main موفق است.
- [x] دو Work Item با resource key مشترک: فقط یک claim موفق.
- [x] دو Work Item با resource key مستقل: هر دو lease هم‌پوشان موفق.
- [ ] آزمون با دو حساب GitHub مستقل و دو نشست ChatGPT مستقل.
- [ ] قطع واقعی یکی از نشست‌ها، expiry/takeover در آزمون چندحسابی و رد فرمان‌های عامل قدیمی پس از takeover.
- [ ] فعال‌سازی و read-back قواعد branch protection/ruleset و required checks در مخزن کنترل‌پلین و مخزن هدف؛ در snapshot فعلی `main` دارای `protected=false` و repository rulesets برابر `[]` است.
- [ ] بررسی مستقل PR #1 توسط reviewer غیر از نویسنده؛ CI سبز جایگزین review مستقل نیست.
- [ ] تأیید اجرای schedule پنج‌دقیقه‌ای به‌صورت زنده؛ شواهد فعلی اجرای issue_comment را ثابت می‌کنند، نه schedule.

**نتیجه:** زیرساخت برای smoke test زنده تک‌حسابی و همکاری چند Work Item آماده است؛ وضعیت نهایی همچنان **MULTI-ACCOUNT E2E NOT VERIFIED** است. ادعای hard-fencing تمام مسیرهای مستقیم write در مخزن محصول مجاز نیست.


### یافته‌های تکمیلی تنظیمات و رجیستری زنده

- GitHub branches API برای `main` مقدار `protected=false` برگرداند و repository rulesets برابر `[]` بود؛ بنابراین شاخه اصلی در snapshot فعلی محافظت‌شده نیست. endpoint جزئیات branch protection با اتصال فعلی 403 داد.
- مخزن کنترل‌پلین همچنان Public است.
- رجیستری `04_COORDINATION/ACTIVE_LOCKS.json` روی شاخه مستقل `coordination/locks` نگهداری می‌شود؛ revision زنده هنگام بازبینی 88 بود.
- هنگام این بازبینی، Issue #11 با resource key `coordination:work-item-allocation` در اختیار run فعال `RUN-20261114-ALLOC-01` با fencing token 53 و checkpoint 80% بود. این lease متعلق به alias دیگری بود و در این ادامه تصاحب یا تغییر داده نشد؛ تا release یا expiry باید به آن احترام گذاشت.


## معیار مستقل: یک پرامپت واحد، چند چت

پروتکل اجرایی و معیار پذیرش در [SINGLE_PROMPT_MULTI_CHAT_DISPATCH.md](SINGLE_PROMPT_MULTI_CHAT_DISPATCH.md) ثبت شده است. در این مدل، مالک یک نسخه یکسان MASTER-00 را به چند چت می‌دهد؛ چت‌ها از صف مشترک leaf Work Itemها انتخاب می‌کنند و برنده CAS کار را می‌گیرد. چت بازنده پس از read-back به برگ بعدی می‌رود. برای هدفی که هنوز برگ‌های مستقل ندارد، allocator باید زیر claim انحصاری، برگ‌های غیرمتداخل بسازد.

- [ ] ارسال هم‌زمان یک متن یکسان MASTER-00 به دو چت در دو حساب مستقل.
- [ ] توزیع خودکار claimها بین برگ‌های مستقل، بدون تخصیص دستی وظیفه از سوی مالک.
- [ ] آزمون رقابت روی resource مشترک و ادامه چت بازنده روی برگ بعدی.
- [ ] آزمون تقسیم هدف والد به leafهای غیرمتداخل توسط allocator و اجرای هم‌زمان آن‌ها.
- [ ] آزمون interruption، resume با همان WORK_ITEM_ID و token جدید و رد token قدیمی.

**وضعیت این معیار: NOT VERIFIED.** مستندکردن الگوریتم، CI و smoke test تک‌حسابی اثبات اجرای واقعی چندحسابی نیست.


## رفتار عملیاتی پرامپت واحد در حلقه خودگردان

MASTER-00 یک فرمان ثابت برای تمام چت‌هاست؛ هر چت به‌طور مستقل صف مشترک GitHub را می‌خواند، یک برگ آزاد claim می‌کند، کار را ثبت و تحویل می‌دهد و سپس دوباره صف را بررسی می‌کند. تخصیص دستی شماره کار به هر چت لازم نیست. claim ناموفق یا blocker فقط همان نامزد را skip می‌کند؛ discovery و اجرای کارهای مستقل ادامه می‌یابد. در نبود leaf، allocator با شناسه ثابت claim می‌شود؛ اگر allocator مشغول است، چت فقط از ساخت برگ جدید صرف‌نظر کرده و read-only discovery را ادامه می‌دهد. هر نشست پیش از سقف زمینه/زمان checkpoint می‌گذارد.

این رفتار خودگردان در MASTER-00 و پروتکل BROADCAST تعریف شده است، اما پذیرش عملی آن به آزمون هم‌زمان واقعی چند حساب وابسته است.


## به‌روزرسانی پس از PR #40 — 2026-11-15

- PR #40 با عنوان «Add autonomous single-prompt multi-chat execution» ادغام شد: https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/40
- merge commit: `bd99a25ee58da8e8e27dc6269ff36f19ff8cb65d`
- CI روی head نهایی PR، commit `f37f0e75982259d782e9f2606b2a09ee62676f58`، در run شماره `43729840131` با نتیجه **success** تمام شد: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43729840131
- MASTER-00 نسخه 1.8.0 اکنون حلقه خودگردان دارد: کشف کار بعدی از صف مشترک، claim اتمیک، رفتن به برگ بعدی پس از تعارض، ادامه discovery هنگام blocker/اشغال allocator، و checkpoint پیش از محدودیت نشست.
- اتصال GitHub باید در هر حساب ChatGPT جداگانه authorize شود. اگر GitHub loginها متفاوت‌اند، هرکدام باید collaborator/member/owner مخزن باشند؛ فقط public visibility کافی نیست.
- **این موارد هنوز اثبات نشده‌اند:** ارسال هم‌زمان MASTER-00 در دو حساب مستقل ChatGPT، رقابت واقعی دو login GitHub، اجرای هم‌پوشان دو Work Item، و interruption/resume واقعی بین دو حساب. وضعیت MULTI-ACCOUNT E2E و BROADCAST همچنان **NOT VERIFIED** است.


---

## وضعیت مرجع زنده — بازبینی مجدد 2026-11-15 (این بخش بر همه snapshotهای قدیمی بالا مقدم است)

**Snapshot مرجع:** شاخه `main` در commit `84fd40403f8b0f4bfb9695b6be7c7bad44b6e0f6`؛ رجیستری `coordination/locks:04_COORDINATION/ACTIVE_LOCKS.json` در revision `113` و SHA فایل `1a3488db5f0eda2b2af67ce367541e0e9c8929b0`.

### مواردی که اکنون با داده زنده تأیید شده‌اند

- PR #40 ادغام شده است؛ merge commit `bd99a25ee58da8e8e27dc6269ff36f19ff8cb65d`.
- اعتبارسنجی کنترل‌پلین روی SHA فعلی main در run `43730243174` با نتیجه success تکمیل شده است.
- اجرای زنده coordinator روی همان SHA در runهای `43730884158`, `43730851290`, `43730794344` و `43730277332` موفق است.
- schedule پنج‌دقیقه‌ای در run `43726463983` با نتیجه success اجرا شده است؛ runهای schedule قبلی نیز success هستند.
- workflow در کد، permissions محدود `contents:write`, `issues:write`, `pull-requests:read` را تعریف می‌کند و schedule، issue_comment و workflow_dispatch در فایل workflow وجود دارند. این مورد به‌تنهایی تنظیمات سراسری Actions در GitHub Settings را اثبات نمی‌کند.
- رجیستری زنده revision=113، next_fencing_token=57 و هیچ lock فعال ندارد.
- Issue #11 در حال حاضر lease فعال ندارد. history آن نشان می‌دهد S1 تا S5 و معیارهای AC_UNIQUE، AC_POLICY و AC_RELEASE در اجراهای قبلی ثبت شده‌اند؛ پاسخ coordinator برای AC_RELEASE مقدار `can_accept=true` و progress=100% داده است. با این حال Issue هنوز باز است و هیچ PR/review/accept نهایی برای آن ثبت نشده؛ بنابراین آن را ACCEPTED یا DONE اعلام نکن.
- Issue #11 در سه claim اخیر tokenهای 54، 55 و 56 branchهای جداگانه‌ای را در lineage ثبت کرده است. جست‌وجوی زنده branchها نشان می‌دهد branchهای RUNهای RESUME-01، RESUME-02 و MASTER00-ALLOC-03 در مخزن وجود ندارند. این وضعیت به‌عنوان lineage ناقص/غیرقابل اثبات ثبت می‌شود؛ branch گمشده را نساز یا به‌صورت حدسی بازسازی نکن. هر اجرای نوشتنی بعدی باید پیش از ادامه، checkpoint و commit پایه قابل اثبات را از منبع معتبر پیدا کند؛ در غیر این صورت STOP WRITES.
- Issueهای EXP-01 تا EXP-27 قبلاً به‌صورت Work Itemهای مستقل ایجاد شده‌اند؛ برای شروع تحلیل EXPها نیازی به ساخت مجدد leaf یا تصاحب allocator نیست.

### موانع و محدودیت‌های تأییدنشده

1. شاخه `main` در پاسخ زنده GitHub دارای `protected=false` و `protection.enabled=false` است؛ repository rulesets نیز آرایه خالی `[]` است. بنابراین branch protection/required checks فعال نیستند.
2. هیچ review مستقل یا review thread برای PR #40 در داده زنده وجود ندارد؛ CI سبز جایگزین review مستقل نیست. PR #40 قبلاً merge شده و اکنون نمی‌توان آن را به‌عنوان یک PR باز برای review تلقی کرد.
3. تنظیمات سراسری Actions write permission از API اتصال فعلی قابل خواندن نبود. موفقیت workflow زنده نشان می‌دهد coordinator اکنون قادر به انجام عملیات ثبت‌شده است، اما مقدار دقیق تنظیم Settings را از این snapshot نتیجه‌گیری نکن.
4. آزمون واقعی دو حساب GitHub مستقل در دو نشست ChatGPT مستقل، با loginهای متفاوت، هنوز اجرا نشده است. آزمون‌های تک‌حسابی و CHAT_IDهای متفاوت جایگزین آن نیستند.
5. takeover پس از قطع/انقضای نشست و رد heartbeat/write با token قدیمی در آزمون واقعی دوحسابی هنوز اثبات نشده است.
6. hard-fencing مسیرهای direct-write به مخزن محصول `non` تضمین نشده است. مخزن محصول همچنان READ_ONLY می‌ماند؛ هیچ write در آن انجام نشود.

### حکم عملیاتی

- **LIVE SINGLE-ACCOUNT COORDINATOR: VERIFIED**
- **MAIN CI: PASS**
- **SCHEDULE: LIVE SUCCESS OBSERVED**
- **REGISTRY: NO ACTIVE LEASE**
- **ALLOCATOR ISSUE #11: 100% STEPS/CRITERIA RECORDED, NOT ACCEPTED**
- **MULTI-ACCOUNT / SINGLE-PROMPT BROADCAST E2E: NOT VERIFIED**
- **MAIN BRANCH PROTECTION: NOT ENABLED**
- **PRODUCT REPOSITORY WRITE: NOT AUTHORIZED**

این بخش snapshotهای قدیمی‌تر همین سند را که schedule را NOT_RUN یا workflow زنده را نیازمند تأیید می‌دانند، فقط در مواردی که در بالا با شواهد جدید پوشش داده شده supersede می‌کند. سابقه قدیمی برای audit حفظ شده است.


## وضعیت تکمیلی آزمون استقلال پرامپت‌ها (Issue #67)

- Implementation PR: https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/80
- CI exact-head: الزامی است و وضعیت authoritative همیشه از checkهای head جاری PR #80 خوانده می‌شود؛ SHA و run جاری در Issue #67 ثبت می‌شود، نه در این سند ثابت.
- MASTER-00 و هر ۱۷ پرامپت specialist دارای قرارداد مشترک v2 هستند: اجرای مستقل در هر ترتیب، صف محلی EXP به‌علاوه مسیر جهانی G-09، operation_scope_version=1.0 و requested_operations صریح.
- تست‌های dispatch، hard-gate، lease/fencing، resume/checkpoint، semantic duplicate و bundle parity در CI موفق بوده‌اند؛ تغییر هر commit جدید، نیازمند CI موفق روی همان head جدید است.
- رقابت N=2،5،10،25 در مدل هماهنگ‌کننده آزموده شد؛ یک G-09 مشترک فقط یک برنده می‌گیرد و سایر workerها به برگ‌های محلی مستقل برمی‌گردند. پوشش cross-scope شامل EXP-02، EXP-22/23 و EXP-26 است.
- تست durable inbox شامل ۲۵ فرمان در پنج Issue، interruption پس از commit و پیش از response، replacement/scheduled replay، exactly-once response marker و replay بدون اثر تکراری است.
- Read-back رجیستری زنده نشان داد ۱۸۳ فرمان /farast در Issueهای #64، #67 و #77 پردازش شده و هر ۱۸۳ پاسخ ثبت/ارسال شده‌اند؛ فرمان pending بدون پاسخ باقی نمانده است.
- Issue #66 / WI-EXP02-BACKUP-RECOVERY-001 canonical است؛ detector برای Issue #14 / WI-EXP02-BACKUP-RESTORE-001 نتیجه SUPERSEDED می‌دهد و coordinator claim gate آن را به‌عنوان duplicate رد می‌کند. تاریخچه Issue #14 حذف نمی‌شود.
- **محدودیت اثبات:** N=25 آزمون مدل/شبیه‌سازی با CHAT_IDهای مستقل است، نه E2E با ۲۵ حساب مستقل ChatGPT. اجرای واقعی چند حساب مستقل هنوز انجام نشده؛ هیچ ادعایی درباره auto-spawn یا اجرای پس‌زمینه وجود ندارد.
- محدودیت throughput تابع quota/rate limit سرویس GitHub Actions/API است؛ پروتکل سقف ثابت N ندارد اما throughput نامحدود تضمین نمی‌کند.
- وضعیت Issue #67 تا زمان تکمیل review/accept ماشینی coordinator: implementation PR باز، exact-head CI باید سبز بماند، و هیچ merge/accept پیش از ثبت تمام شواهد مجاز نیست.


---

## به‌روزرسانی زنده — 2026-11-18، اجرای ادامه‌دار Issue #67

- PR ادامه‌دهنده: https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/83
- شاخه اجرای جاری: `work/GH-67-RUN-20261118-PROMPT-DISPATCH-RESUME-001`
- SHA جاری و وضعیت CI باید همیشه از metadata زنده PR #83 و checkهای همان head خوانده شود؛ SHA یا run جاری را در این سند ثابت نکن تا پس از handoff کهنه نشود.
- آخرین اجرای موفق پیش از این به‌روزرسانی، run `44247484021` روی head `e7c3ffe83083dbdeb9d3c361c62e4dd2377f213c` بود؛ تمام مراحل coordinator contention/fencing، Work Item resume/progress، dispatch، JSON/schema، قرارداد ۱۷ prompt و bundle parity موفق شدند. این run فقط برای همان SHA معتبر است؛ هر commit بعدی نیازمند CI موفق روی head تازه است.
- PR #80 شاخه اجرای قبلی است و نباید با PR جاری اشتباه شود؛ branch قبلی دست‌نخورده مانده است. PR #80 پس از پذیرش ماشینی PR #83 به‌عنوان مسیر superseded بسته خواهد شد.
- پوشش تکمیلی جدید: allocator contention به برگ محلی fallback می‌کند؛ برگ‌های فرزند تازه‌افزوده‌شده بر اساس EXP تخصصی کشف می‌شوند و به‌اشتباه به‌عنوان کار جهانی G-09 به همه promptها نمایش داده نمی‌شوند.
- اجرای N=2،5،10،25، replay صندوق ورودی ۲۵ فرمان، پاسخ idempotent، stale/invalid/expired fencing و semantic duplicate در این شاخه همچنان آزمون مدل/شبیه‌سازی هستند؛ CI موفق، آزمون واقعی چند حساب ChatGPT مستقل نیست.
- آزمون دو حساب مستقل ChatGPT/GitHub، takeover واقعی میان دو نشست و hard-fencing مسیر direct-write خارج از coordinator همچنان **NOT VERIFIED** هستند. هیچ ادعای ایجاد خودکار چت یا ادامه در پس‌زمینه وجود ندارد.
- یک اجرای میانی CI با run `44247203711` به‌دلیل fixture اشتباهِ هدف G-09 روی دو برگ تخصصی شکست خورد. fixture اصلاح شد: برگ EXP-02 در G-01 و برگ EXP-22 در G-08 قرار گرفتند تا فقط worker متناظر آن‌ها را از مسیر محلی انتخاب کند؛ run `44247484021` روی head `e7c3ffe83083dbdeb9d3c361c62e4dd2377f213c` سپس موفق شد. این run پس از commitهای بعدی، صرفاً سابقه است و جایگزین CI head جاری نیست.

---

## به‌روزرسانی زنده — 2026-11-18 — صندوق فرمان سراسری و عدالت بین Issueها (Issue #89)

**وضعیت پیاده‌سازی:** در شاخه اختصاصی work/GH-89-RUN-20261118-GLOBAL-INBOX-FAIRNESS-002 پیاده‌سازی شده؛ آزمون مستقل محلی ماژول ۹/۹ PASS است. وضعیت CI دقیق head پس از ساخت PR باید جداگانه ثبت شود و تا آن زمان این مورد را CI-VERIFIED اعلام نکن.

- هر issue_comment، schedule و workflow_dispatch اکنون باید همان مسیر global inbox را اجرا کند: Issue محرک در اولویت، سپس یک صفحه حداکثر ۲۵تایی از Issueهای باز با ترتیب created ASC.
- cursor پایدار در رجیستری مرکزی و فیلد inbox_scheduler.page ذخیره می‌شود؛ cursor فقط پس از تکمیل batch پیش می‌رود و صفحه ناقص نهایی به صفحه اول wrap می‌شود.
- سقف پردازش هر Issue در هر run یک فرمان pending است؛ حداکثر ۱۰ پاسخ pending نیز در هر Issue بازیابی می‌شود. این سقف، fairness بین Issueها را در برابر یک منبع پرحجم حفظ می‌کند.
- idempotency با processed_operations[comment_id] حفظ می‌شود. interruption قبل از cursor commit همان صفحه را replay می‌کند؛ interruption پس از commit عملیات و قبل از پاسخ، مسیر pending-response را بازیابی می‌کند.
- خطای پردازش یک Issue در inbox_scheduler.issue_errors ثبت می‌شود و batch سایر Issueها ادامه می‌یابد؛ خطای رجیستری مرکزی fail-closed باقی می‌ماند.
- **محدودیت:** این مسیر صف جهانی bounded است و throughput نامحدود یا زمان پاسخ ثابت تضمین نمی‌کند. schedule پنج‌دقیقه‌ای و quota سرویس GitHub روی زمان رسیدن نوبت بعدی اثر دارند.
- این تست‌ها اثبات اجرای واقعی N حساب ChatGPT نیستند. E2E دو یا چند حساب مستقل، takeover واقعی میان دو نشست و hard-fencing خارج از coordinator همچنان NOT VERIFIED باقی می‌مانند.
