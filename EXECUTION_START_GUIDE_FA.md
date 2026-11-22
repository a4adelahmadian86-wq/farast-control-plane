# راهنمای شروع اجرای FARAST — وضعیت تأییدشده تا 2026-11-22

آخرین بازبینی: 2026-11-22  
SHA زنده `main` در این بازبینی: `61efcd827bcb867902597538023b64e1908c17b7`  
مرجع حقیقت: شاخه پیش‌فرض `main` مخزن [farast-control-plane](https://github.com/a4adelahmadian86-wq/farast-control-plane). پیش از هر اجرا، SHA زنده `main`، Issueها، PRها، dependencyها و وضعیت lease را دوباره بخوانید.

## 1) حکم آمادگی

**آماده برای اجرای کنترل‌شده و کارهای READ_ONLY: بله.**  
**آماده برای ادعای تأیید کامل چندحسابی/چندنشستی یا تضمین «بدون هیچ اختلال»: خیر؛ این ادعا هنوز با E2E واقعی دو حساب مستقل اثبات نشده است.**

وضعیت فنی تأییدشده در این بازبینی:

- PR #104 با merge commit برابر `18bac691cf08b44d60c416f976478bcb8c9e3dd5` روی `main` ادغام شده است. این اصلاح، گروه هم‌زمانی Actions را به‌ازای هر Issue جدا می‌کند، نوشتن رجیستری مشترک را با fast-forward CAS و `force=false` محافظت می‌کند و فرمان‌های معوق را از inbox پایدار replay می‌کند.
- Issue #100 / `WI-LOCK-SCOPE-ISOLATION-001` پس از عبور از گیت‌های پذیرش، پذیرفته و بسته شده است. دامنه قفل‌های `repo:`، `dir:`، `file:`/`doc:` و کلیدهای منطقی تفکیک شده‌اند؛ کلید repository-wide فقط در همان مخزن انحصاری است.
- CI دقیق head مربوط به PR #104، یعنی `bad9682c878cceecbaa447b93fdcfdbfde87f6ea`، در run [44532472401](https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/44532472401) با نتیجه `success` پایان یافته است.
- آزمون زنده هماهنگ‌کننده با یک هویت GitHub، claim موفق برای منبع مشترک در Issue #7، رد claim رقیب همان منبع در Issue #8 و claim موفق منبع مستقل در Issue #9 را نشان داده است. این آزمون، آزمون دو حساب مستقل ChatGPT/GitHub نیست.
- PR #96 و Issue #47 نیز ادغام/پذیرفته شده‌اند و قرارداد عمق مأموریت، انتخاب خودکار برگ‌های اجرایی، مسیر READ_ONLY و پذیرش ماشینی را به main افزوده‌اند.
- PR #122 با commit `277cf36b319e61c9c7a644ffb91325fee4f6aa22` در merge commit `61efcd827bcb867902597538023b64e1908c17b7` ادغام شده و Issue #119 / `WI-COORDINATOR-STAGED-ACCEPTANCE-BOOTSTRAP-001` در 2026-11-22 با تمام ۷ گام و ۴ معیار پذیرش ACCEPTED شده است. این اصلاح، پذیرش دو مرحله‌ای PRE_MERGE/POST_MERGE و خواندن قواعد با `FARAST_RULESET_READ_TOKEN` را فعال می‌کند.
- Ruleset با نام `main-security-gate` در هر دو مخزن FARAST و NON فعال است؛ هر دو شامل قواعد `pull_request`، `deletion` و `non_fast_forward` هستند و read-back زنده `bypass_actors=[]` را نشان داده است. این facts جایگزین تأیید مستقل branch-protection endpoint یا آزمون دوحسابی نیستند.
- اجرای دستی workflow روی شاخه اصلاحی در run [45021053278](https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/45021053278) با نتیجه `success` پایان یافت؛ Check Runهای دقیق head PR #122 نیز `validate` و `coordinate` هر دو `success` هستند.
- Bundle تجمیعی فعلی نسخه **2.0.1** است و شامل MASTER-00 و ۱۷ پرامپت تخصصی است.

**مواردی که همچنان NOT VERIFIED هستند:**

1. اجرای هم‌زمان واقعی با دو حساب مستقل GitHub و دو نشست مستقل ChatGPT.
2. takeover واقعی پس از انقضای lease و اثبات رد write عامل قدیمی در E2E دوحسابی.
3. اینکه هر تعداد دلخواه چت، بدون محدودیت quota، Actions یا دسترسی، همواره بی‌وقفه پیش بروند.
4. E2E واقعی با دو حساب مستقل ChatGPT/GitHub و دو نشست مستقل هنوز اجرا نشده است؛ بنابراین رفتار هم‌زمان چندحسابی و takeover بین دو حساب NOT VERIFIED باقی می‌ماند.

بنابراین این زیرساخت برای اجرای کنترل‌شده با شواهد و توقف امن آماده است؛ اما نباید آن را چندحسابیِ کاملاً اثبات‌شده یا مصون از هر خطا معرفی کرد.

## 2) نقطه شروع و کتابخانه رسمی

نسخه canonical و کامل برای کپی یکجا:

- [FARAST_EXECUTABLE_PROMPTS_COMPLETE.md — نسخه 2.0.1](05_PROMPT_LIBRARY/FARAST_EXECUTABLE_PROMPTS_COMPLETE.md)
- [PROMPT_CATALOG.md — فهرست و نگاشت پرامپت‌ها](05_PROMPT_LIBRARY/PROMPT_CATALOG.md)
- [MASTER-00 — هماهنگی، بازیابی و تداوم](05_PROMPT_LIBRARY/MASTER-00.md)
- [پروتکل پخش یک پرامپت واحد میان چند چت](04_COORDINATION/SINGLE_PROMPT_MULTI_CHAT_DISPATCH.md)
- [ارزیابی آمادگی چندچتی و محدودیت‌های اثبات](04_COORDINATION/MULTI_CHAT_READINESS.md)
- [START_HERE — دروازه اجباری ورود عامل‌ها](START_HERE.md)

پرامپت‌های تخصصی مستقل:

1. [PR-01 — خط مبنا](05_PROMPT_LIBRARY/PR-01_BASELINE.md)
2. [PR-02 — بکاپ و بازیابی](05_PROMPT_LIBRARY/PR-02_RECOVERY.md)
3. [PR-03 — کشف قابلیت‌ها](05_PROMPT_LIBRARY/PR-03_CAPABILITY_DISCOVERY.md)
4. [PR-04 — ردیابی نیازمندی‌ها](05_PROMPT_LIBRARY/PR-04_TRACEABILITY.md)
5. [PR-05 — سناریوهای کاربر](05_PROMPT_LIBRARY/PR-05_USER_SCENARIOS.md)
6. [PR-06 — آزمون و شواهد](05_PROMPT_LIBRARY/PR-06_EVIDENCE_TESTING.md)
7. [PR-07 — تحلیل شکاف و علت ریشه‌ای](05_PROMPT_LIBRARY/PR-07_GAP_ROOT_CAUSE.md)
8. [PR-08 — تجارت](05_PROMPT_LIBRARY/PR-08_COMMERCE.md)
9. [PR-09 — خدمات هوشمند](05_PROMPT_LIBRARY/PR-09_AI_SERVICES.md)
10. [PR-10 — معماری و داده](05_PROMPT_LIBRARY/PR-10_ARCH_DATA.md)
11. [PR-11 — هویت و مجوزها](05_PROMPT_LIBRARY/PR-11_AUTHORIZATION.md)
12. [PR-12 — امنیت، حریم خصوصی و ممیزی](05_PROMPT_LIBRARY/PR-12_SECURITY_PRIVACY_AUDIT.md)
13. [PR-13 — معماری هدف](05_PROMPT_LIBRARY/PR-13_TARGET_ARCH.md)
14. [PR-14 — میزبانی و عملیات](05_PROMPT_LIBRARY/PR-14_HOSTING_OPERATIONS.md)
15. [PR-15 — اولویت‌بندی](05_PROMPT_LIBRARY/PR-15_PRIORITIZATION.md)
16. [PR-16 — پیاده‌سازی کنترل‌شده](05_PROMPT_LIBRARY/PR-16_IMPLEMENTATION.md)
17. [PR-17 — پذیرش و انتشار](05_PROMPT_LIBRARY/PR-17_ACCEPTANCE_RELEASE.md)

## 3) ترتیب اجرا: اولویت است، نه زنجیره اجباری

ترتیب اولویت مورد تأیید مالک:

PR-01 → PR-02 → PR-03 → PR-04 → PR-05 → PR-06 → PR-07 → PR-08 → PR-09 → PR-10 → PR-11 → PR-12 → PR-13 → PR-14 → PR-15 → PR-16 → PR-17.

این ترتیب فقط اولویت برنامه‌ریزی و تخصیص است. **هر پرامپت را می‌توان مستقل و با هر ترتیب اجرا کرد.** شماره کوچک‌تر، به‌تنهایی dependency یا مانع اجرای شماره بزرگ‌تر نیست. فقط dependency سخت واقعی در `01_STRATEGY/DEPENDENCY_GRAPH.json`، قفل منبع، مجوز نوشتن و hard gateهای همان Work Item می‌توانند اجرا را متوقف کنند. برای ترتیب دقیق و نگاشت EXPها، [OWNER_APPROVED_PROMPT_PRIORITY_ORDER.md](05_PROMPT_LIBRARY/OWNER_APPROVED_PROMPT_PRIORITY_ORDER.md) و [EXECUTION_DECOMPOSITION_17x27.md](01_STRATEGY/EXECUTION_DECOMPOSITION_17x27.md) را بخوانید.

برای یک مأموریت تخصصی، فقط همان PR prompt را کپی کنید؛ لازم نیست MASTER-00 را جداگانه به آن بچسبانید. هر پرامپت تخصصی باید دروازه مشترک و خواندن اسناد canonical را خودش اجرا کند. برای هماهنگی عمومی یا درخواست جدیدی که پرامپت تخصصی مشخصی ندارد، از MASTER-00 استفاده کنید.

## 4) یک پرامپت واحد در چند چت

اگر می‌خواهید یک متن یکسان را به چند چت بدهید، فقط MASTER-00 را بدون تغییر در همه چت‌ها ارسال کنید. هر چت باید به‌طور مستقل:

1. CHAT_ID تصادفی و یکتا برای همان مکالمه تولید کند (ترجیحاً UUID v4) و آن را تا پایان همان مکالمه ثابت نگه دارد.
2. برای هر اجرای جدید RUN_ID یکتا بسازد؛ در resume همان Work Item و checkpoint را حفظ کند.
3. وضعیت زنده GitHub، dependencyها، Work Itemهای آماده، PRها و leaseها را بخواند.
4. فقط یک leaf واجد شرایط را claim کند؛ claim موفق یک چت نباید مانع انتخاب leaf مستقل توسط چت دیگر شود.
5. اگر یک claim به علت تعارض منبع یا رقابت رد شد، علت را از پاسخ coordinator و read-back تشخیص دهد و نامزد مستقل بعدی را بررسی کند؛ رد یک نامزد به معنی قفل کل پروژه نیست.
6. اگر فرمان در صف Actions یا inbox معوق است، آن را قفل منبع گزارش نکند. پاسخ همان comment ID، وضعیت coordinator و snapshot معتبر lease را بررسی کند؛ فرمان تکراری نسازد.
7. پیش از هر write/checkpoint، heartbeat معتبر و fencing token جاری را بررسی کند.
8. پیش از توقف یا handoff، checkpoint پایدار و NEXT_ACTION دقیق ثبت کند.

**مهم:** GitHub میان چت‌های ChatGPT پیام مستقیم منتقل نمی‌کند؛ GitHub Issueها، branchها، checkpointها و رجیستری، حافظه مشترک تیم هستند. هر حساب GitHub باید جداگانه مجوز و اتصال معتبر داشته باشد. شناسه CHAT_ID/RUN_ID شناسه‌های metadata خوداظهاری‌اند و هویت واقعی حساب را اثبات نمی‌کنند. شرایط دقیق در [SINGLE_PROMPT_MULTI_CHAT_DISPATCH.md](04_COORDINATION/SINGLE_PROMPT_MULTI_CHAT_DISPATCH.md) آمده است.

## 5) قواعد قفل و جلوگیری از توقف اشتباه

- `repo:label`: قفل انحصاری کل مخزن هدف؛ فقط برای عملیات واقعاً repository-wide.
- `dir:path`: با تمام فایل‌ها و زیرپوشه‌های همان مسیر تعارض دارد.
- `file:path` و `doc:path`: برای مسیر یکسان با هم تعارض دارند.
- `module:id` و کلیدهای منطقی: فقط با همان نوع و شناسه منطقی تعارض دارند.
- منابع در دو target repository متفاوت، مستقل‌اند.
- برای درخواست جدید NON، ابتدا READ_ONLY discovery انجام دهید و فایل/ماژول‌های واقعی را تعیین کنید؛ سپس resource key دقیق بسازید. کلید legacy `repo:non:controlled-implementation` قفل انحصاری کل NON است و نباید کلید پیش‌فرض درخواست‌های جدید باشد.
- دامنه نامعلوم یا غیرقابل‌تقسیم = READ_ONLY؛ قفل عمومی یا مجوز نوشتن را حدس نزنید.
- یک CHAT_ID فقط یک lease فعال دارد؛ این محدودیت فقط همان مکالمه است، نه همه چت‌ها یا کل پروژه.
- نبود پاسخ، pending بودن workflow یا خطای موقت ابزار به‌تنهایی اثبات قفل نیست. وضعیت را تازه بخوانید و فقط علت صریح coordinator را مبنا قرار دهید.
- workerها حق تغییر مستقیم `04_COORDINATION/ACTIVE_LOCKS.json` یا branch `coordination/locks` را ندارند؛ workflow مرکزی تنها نویسنده رجیستری است.

## 6) مجوز نوشتن روی NON و مخازن دیگر

سیاست پیش‌فرض Work Itemهای محصول `a4adelahmadian86-wq/non` برابر **READ_ONLY** است. درخواست جدید—even اگر مالک در مکالمه اجازه کلی داده باشد—تا وقتی Issue مستقل و معتبر با `WRITE_ALLOWED`، مرجع تأیید مالک و claim تازه نداشته باشد، اجازه تغییر کد ندارد.

Issue #51 یک استثنای محدود و مشخص برای همان Work Item است؛ مجوز آن به Issueهای دیگر، درخواست‌های تازه یا کل مخزن NON منتقل نمی‌شود. برای هر write:
- target repository و resource keys باید با Issue زنده و JSON آن منطبق باشند.
- پاسخ `CLAIM GRANTED`، read-back lease و fencing token لازم است.
- branch فقط همان branch صادرشده برای RUN باشد.
- پیش از write و checkpoint، heartbeat و token دوباره بررسی شوند.
- هیچ merge، deploy، release، migration مخرب، تغییر مالی/امنیتی/حقوقی یا حذف داده بدون مجوز جداگانه انجام نشود.

## 7) بازیابی پس از قطع یا تغییر چت

1. از آخرین checkpoint معتبر و commit تأییدشده در GitHub شروع کنید، نه از حافظه یا خلاصه چت.
2. همان TASK/WORK_ITEM_ID را بازیابی کنید؛ Issue، branch یا خروجی تکراری نسازید.
3. اگر lease قبلی منقضی شده، claim جدید با RUN_ID جدید بگیرید؛ branch قبلی را بدون بررسی lineage تغییر ندهید.
4. اگر وضعیت ابزار یا workflow مبهم است، STOP WRITES؛ ابتدا اثر واقعی فرمان قبلی را در GitHub بررسی کنید.
5. اگر dependency یا منبعی مسدود است، blocker را ثبت کنید و فقط کار مستقل و مجاز دیگری را ادامه دهید.

مراجع اجباری: [INTERRUPTION_RECOVERY_PROTOCOL.md](04_COORDINATION/INTERRUPTION_RECOVERY_PROTOCOL.md)، [WORK_ITEM_EXECUTION_PROTOCOL.md](04_COORDINATION/WORK_ITEM_EXECUTION_PROTOCOL.md)، [COORDINATOR_COMMANDS.md](04_COORDINATION/COORDINATOR_COMMANDS.md)، [ACCEPTANCE_FRAMEWORK.md](04_COORDINATION/ACCEPTANCE_FRAMEWORK.md).

## 8) شواهد، محدودیت‌ها و معیار اعلام پایان

- اصلاح چندچتی و قفل granular: [PR #104](https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/104)، [Issue #100](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/100).
- CI دقیق head اصلاح: [run 44532472401](https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/44532472401).
- ادغام deep prompt / READ_ONLY routing / autonomous selection: [PR #96](https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/96)، [Issue #47](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/47).
- اصلاح پذیرش دو مرحله‌ای و قواعد کم‌دسترسی: [PR #122](https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/122)، [Issue #119](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/119)، [run 45021053278](https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/45021053278).
- آزمون‌های مدل و registry، آزمون واقعی چند حساب مستقل نیستند. هر گزارش باید این دو را صریحاً تفکیک کند.
- branch protection endpoint از اتصال فعلی مجوز read-back نداد؛ بنابراین درباره وضعیت مستقل آن ادعایی نمی‌کنیم. Rulesetهای فعال و بدون bypass در هر دو مخزن مستقیماً read-back شده‌اند. E2E واقعی دو حساب مستقل همچنان فقط پس از اجرای واقعی قابل علامت‌گذاری PASS است.
- هیچ‌کس نباید «صفر خطا»، «تعداد نامحدود چت» یا «چندحسابی کاملاً تأییدشده» را ادعا کند مگر شواهد دقیق آن موجود باشد.
- هر Work Item فقط پس از عبور تمام گام‌ها، معیارهای پذیرش، dependencyها، تست‌های لازم و ثبت checkpoint معتبر پذیرفته می‌شود. Claim یا پیشرفت 100% به‌تنهایی پذیرش نیست.

**قاعده نهایی:** هر چت باید مستقل، با هر ترتیب و بدون تخصیص دستی شروع کند؛ اما هرگز نباید برای پیشروی، قفل واقعی، dependency، مجوز یا شواهد را دور بزند.
