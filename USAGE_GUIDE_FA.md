# راهنمای استفاده برای مالک محصول و کاربر مبتدی

## وضعیت فعلی و راه‌اندازی کامل

پیش از اجرای واقعی چندچتی، وضعیت و محدودیت‌های جاری را در [ارزیابی آمادگی چندچتی](04_COORDINATION/MULTI_CHAT_READINESS.md) بررسی کن.

**اکنون:** مخزن PUBLIC است و PR شماره ۱ در commit `b8cf85cfd6552028750eefa3cff03d844175814c` در `main` ادغام شده است؛ `main` مرجع فعال است. برای آزمایش عمومی/غیرمحرمانه از [START_HERE](https://github.com/a4adelahmadian86-wq/farast-control-plane/blob/main/START_HERE.md) شروع کن و همه فایل‌ها را از همان ref بخوان. تا زمان خصوصی‌سازی، اطلاعات محرمانه، secret، PII و داده مشتری ثبت نکن.

**پیش از اجرای چندچتی عمومی و واقعی:** PR شماره ۱ باید مستقل بازبینی و ادغام شود، دسترسی نوشتن GitHub Actions و دسترسی حساب‌های مستقل بررسی شود و آزمون واقعی دو حساب انجام شود. خصوصی‌سازی فقط زمانی لازم است که قرار باشد اطلاعات محرمانه/داخلی نگهداری شود؛ در حالت فعلی public-safe mode حفظ می‌شود.

1. branch coordination/locks را حفظ کن؛ فقط workflow مرکزی farast-coordinator.yml حق نوشتن رجیستری آن را دارد.
2. برای هر حساب/کاربر مستقل، GitHub را جداگانه وصل و دسترسی لازم به Issueها و مخزن کنترل‌پلین را مجاز کن. actor باید در GitHub مجاز و دارای author_association از نوع OWNER/COLLABORATOR/MEMBER باشد؛ سطح فرمان از `04_COORDINATION/ACTOR_AUTHORIZATION.json` تعیین می‌شود. collaborator/member به‌صورت پیش‌فرض WORKER است؛ برای SENIOR_MANAGER باید GitHub login با تأیید مالک در `actor_roles` درج شود و `actor_scopes` مخزن‌های دقیق و پیشوندهای RESOURCE_KEY مجاز را مشخص کند؛ خارج از scope هیچ فرمانی مجاز نیست.
3. تنظیمات Actions write permission و در صورت پذیرش PRهای مخزن دیگر، Secret FARAST_GITHUB_TOKEN را طبق MANUAL_GITHUB_SETTINGS.md تنظیم کن.

## اجرای هر کار
1. وارد چت دلخواه شو.
2. فقط پرامپت مربوط به کار را از `05_PROMPT_LIBRARY/` کپی و ارسال کن. نیازی به چسباندن MASTER-00 یا فایل نیازمندی‌ها نیست؛ متن مشترک درون هر پرامپت تعبیه شده و عامل موظف است فایل‌های مرجع را زنده از GitHub بخواند.
3. شماره پرامپت ترتیب اجرا نیست. هر PR مستقل را هر زمان که خواستی اجرا کن. چند کار فقط وقتی موازی‌اند که dependency و RESOURCE_KEY آن‌ها تعارض نداشته باشد.
4. گزارش مفصل در GitHub نوشته می‌شود؛ پاسخ چت فقط شناسه TASK، وضعیت و لینک خواهد بود.
5. اگر کار قطع شد، در همان چت یا چت دیگری بنویس «ادامه بده» یا همان پرامپت را دوباره بفرست. عامل باید همان TASK_ID، branch و checkpoint را بازیابی کند.
6. بازخورد محصولی را مستقیم در چت بگو؛ پرامپت موظف است متن اصلی را در دفتر بازخورد و GitHub ثبت کند. اگر ابزار نوشتن در دسترس نیست، ثبت را ادعا نمی‌کند.

## اگر چت از تو سؤال کرد
پرامپت‌ها باید اسناد و سوابق را اول بررسی کنند و سؤال تکراری نپرسند. اگر تصمیمی فقط در اختیار مالک است و واقعاً مانع ادامه است، سؤال باید دقیق و حداقلی باشد. در غیر این صورت مجهول ثبت و کار مستقل ادامه می‌یابد.

## اگر دسترسی GitHub نبود
- از عامل بخواه ابزار GitHub را بررسی کند.
- تا اتصال مجاز نشده، هیچ تغییری در فایل مشترک/کد محصول انجام نشود.
- کار read-only ممکن است با شواهد موجود انجام شود؛ نتیجه ثبت‌نشده نباید به‌عنوان نتیجه رسمی تیم تلقی شود.

## انتخاب پرامپت
- شناخت/کاتالوگ/ردیابی: PR-01 تا PR-07.
- حوزه‌های کسب‌وکار: PR-08 و PR-09.
- معماری/امنیت/عملیات: PR-10 تا PR-14.
- برنامه‌ریزی/پیاده‌سازی/پذیرش: PR-15 تا PR-17.

## اصل مهم
هیچ پرامپتی به‌تنهایی اجازه انتشار، حذف داده، migration مخرب، تغییرات مالی/حقوقی/امنیتی یا ادغام main نمی‌دهد. این‌ها نیازمند تأیید ثبت‌شده‌اند.


## وضعیت هماهنگ‌کننده خودکار

workflow جدید .github/workflows/farast-coordinator.yml روی شاخه PR #1 پیاده‌سازی شده است، اما پس از ادغام PR #1 در default branch فعال شده است؛ اجرای زنده و دسترسی write باید بررسی شود. پس از ادغام، اجرای schedule پنج‌دقیقه‌ای، workflow_dispatch و دسترسی‌های Actions باید بررسی شوند.

برای هر وظیفه، در Issue یک بخش Resource keys با کلیدهای دقیق و canonical ثبت کن. سپس از دستورهای 04_COORDINATION/COORDINATOR_COMMANDS.md استفاده کن:
- claim: /farast claim chat=CHAT_ALIAS run=RUN_ID lease=30
- heartbeat: /farast heartbeat chat=CHAT_ALIAS run=RUN_ID token=FENCING_TOKEN lease=30
- پایان کار: /farast review یا /farast release با token صحیح.

فقط پس از پاسخ CLAIM GRANTED و read-back رجیستری اجازه write داری. اگر workflow پاسخ نداد، timeout شد یا روی default branch فعال نبود، STOP WRITES. هیچ چتی حق نوشتن مستقیم ACTIVE_LOCKS.json یا fallback به CAS مستقیم ندارد. برای جزئیات، محدودیت‌ها و برنامه آزمون به COORDINATOR_COMMANDS.md، COORDINATOR_TEST_PLAN.md و LEGACY_COORDINATOR_MIGRATION.md مراجعه کن.

آزمون واقعی دو حساب مستقل و contention هنوز انجام نشده است؛ بنابراین اجرای کامل چندچتی تا پایان این آزمون‌ها تأییدشده محسوب نمی‌شود.


## هدف‌های خرد و ادامه بین چت‌ها
برای هر برگ اجرایی یک Issue مستقل با WORK_ITEM_ID پایدار بساز. دستورهای `/farast step`, `/farast criterion`, `/farast progress`, `/farast checkpoint` برای ثبت evidence، محاسبه درصد و checkpoint هستند. جزئیات انتخاب عادلانه، dependency، resume و وضعیت‌ها در `04_COORDINATION/WORK_ITEM_EXECUTION_PROTOCOL.md` است. این قابلیت تا تکمیل CI و آزمون E2E چندحسابی آماده عملیاتی تلقی نمی‌شود.
