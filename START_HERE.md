# START HERE — پروتکل ورود همه عامل‌ها

این فایل دروازه اجباری ورود است. هر چت، حساب، کارمند یا عامل هوش مصنوعی باید پیش از هر اقدام آن را بخواند.

## اسناد لازم برای فهم زمینه
1. `README.md`
2. `00_PROJECT_FOUNDATION/PROJECT_CHARTER.md`
3. `00_PROJECT_FOUNDATION/APPROVED_REQUIREMENTS.md`
4. متن کامل منبع نیازمندی: `00_PROJECT_FOUNDATION/SOURCE_REQUIREMENTS_v2.md`
5. `00_PROJECT_FOUNDATION/SPECIALIST_WORKFLOW.md`
6. `00_PROJECT_FOUNDATION/KNOWN_UNKNOWN.md`
7. `01_STRATEGY/GOAL_TREE.md` و `ROADMAP.md`
8. `02_GOVERNANCE/DECISION_REGISTER.md` و `USER_FEEDBACK_REGISTER.md`
9. `03_PROJECT_STATE/MASTER_STATUS.md` و `TASK_INDEX.md`
10. `04_COORDINATION/WORKER_PROTOCOL.md`، `LOCK_PROTOCOL.md`، `LOCK_MANAGER_PROTOCOL.md` و `TASK_SCHEMA.md`
11. `05_PROMPT_LIBRARY/PROMPT_CATALOG.md` و پرامپت تخصصی

ترتیب بالا فقط ترتیب فهم زمینه است، نه ترتیب اجرای PRها.

## دستورهای غیرقابل‌مذاکره
- هیچ مکالمه قبلی را منبع حقیقت فرض نکن؛ GitHub مرجع مشترک وضعیت است.
- پیش از شروع، وضعیت زنده مخزن، Issueها، PRها، checkpointها، feedback و lock registry را بخوان.
- اگر دسترسی GitHub یا ابزار لازم وجود ندارد، نوشتن ممنوع؛ فقط تحلیل read-only و ثبت محدودیت در پاسخ.
- وظایف مستقل می‌توانند موازی باشند؛ وابستگی و RESOURCE_KEY تعیین‌کننده‌اند، نه شماره PR.
- TASK_ID موجود و آخرین checkpoint را ادامه بده؛ duplicate نساز.
- پیش از هر نوشتن در فایل/ماژول/schema/API مشترک، همه RESOURCE_KEYها را با CAS در branch `coordination/locks` یکجا acquire کن.
- فقط update_ref موفق با expected_sha قفل را تأیید می‌کند. خطا/timeout/ابهام = STOP WRITES.
- Lease، heartbeat و fencing token را رعایت کن؛ قبل از هر commit/PR اعتبار token را دوباره بررسی کن.
- هر چت branch اختصاصی داشته باشد؛ مستقیم روی main commit نکن.
- ادغام PR، انتشار، حذف داده، migration مخرب، تغییر امنیت/مجوز، هزینه یا تغییر مالی/حقوقی نیازمند تأیید صریح و ثبت‌شده مالک است.
- secret، token، private key، PII و داده مشتری در Issue/commit/log ممنوع.
- هر اقدام، نتیجه، شواهد، تست، خطا، checkpoint و اقدام بعدی در GitHub ثبت شود.
- اگر چت قطع شد، عامل بعدی همان TASK_ID را بازیابی و از آخرین checkpoint ادامه دهد.

## پروتکل آغاز هر اجرا
1. زمان UTC معتبر را ثبت کن؛ زمان را حدس نزن.
2. branch پیش‌فرض و آخرین commit کنترل‌پلین و محصول را بخوان.
3. وظایف/PRهای مرتبط و کارهای فعال را جست‌وجو کن.
4. duplicate و dependency را بررسی کن.
5. TASK موجود را بازیابی یا Issue جدید بساز.
6. RESOURCE_KEYها را canonicalize و به‌صورت all-or-none با CAS قفل کن.
7. در branch اختصاصی `work/<TASK_ID>-<slug>` کار کن.
8. checkpoint اولیه و مرحله‌ای ثبت کن.
9. PR و handoff بساز؛ ادغام نکن.

## رفتار مکالمه
تمرکز بر اجرای کار است. سؤال تکراری یا غیرضروری نپرس. فقط وقتی تصمیم/داده حیاتی در اختیار مالک است و پس از جست‌وجوی کامل منابع، یک سؤال دقیق مطرح کن. مجهول غیرحیاتی را ثبت و بخش مستقل را ادامه بده. در چت فقط TASK_ID، وضعیت، مانع حیاتی و لینک GitHub را بده؛ گزارش تفصیلی در GitHub.

## تعریف موفقیت
خروجی، معیار پذیرش، شواهد و وضعیت تست باید روشن باشند. وجود کد، فایل یا CI سبز به‌تنهایی اثبات پذیرش محصول نیست.
