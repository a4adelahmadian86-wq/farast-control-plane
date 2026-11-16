# FARAST — تفکیک اجرایی ۱ هدف کلان به ۱۷ پرامپت و ۲۷ مأموریت عمیق

نسخه: 2.0.0  
وضعیت: طراحی اجرایی پیشنهادی برای read-back و پذیرش  
مرجع: `01_STRATEGY/GOAL_TREE.md`، `DEPENDENCY_GRAPH.json`، Issueهای #13 تا #39

## 1. قرارداد سلسله‌مراتب

ساختار هدف به‌صورت زیر است و نباید سطوح آن با یکدیگر اشتباه شوند:

1. **G-00 — یک هدف کلان:** تحویل FARAST/NON یکپارچه، امن، پایدار، قابل اعتماد و قابل توسعه، با حفظ قابلیت‌های ارزشمند موجود.
2. **PR-01 تا PR-17 — هفده پرامپت تخصصی:** هر پرامپت یک حوزه مسئولیت و خروجی نهایی مستقل دارد. MASTER-00 هماهنگ‌کننده است و جزو ۱۷ پرامپت تخصصی شمرده نمی‌شود.
3. **EXP-01 تا EXP-27 — بیست‌وهفت مأموریت اجرایی عمیق:** هر EXP یک Work Item مستقل با Issue و WORK_ITEM_ID پایدار است. این‌ها صرفاً عنوان یا چک‌لیست نیستند؛ هرکدام باید طبق استاندارد عمق حداقل ۶ گام substantive، ۴ معیار پذیرش، شواهد و خروجی مستقل داشته باشند.
4. **گام‌ها و معیارها:** هر Work Item به گام‌های قابل انجام و معیارهای قابل اثبات تقسیم می‌شود. این گام‌ها به‌صورت پیش‌فرض Issue مستقل نیستند؛ اگر یک گام خودش ۲۰ تا ۳۰ دقیقه یا بیشتر کار مستقل لازم دارد، آن را با allocator به Work Item فرزند تبدیل کنید.

هیچ‌یک از ۲۷ EXP به‌معنای انجام‌شده نیست. وجود Issue، prompt، سند یا claim فقط وجود ساختار/مالکیت را ثابت می‌کند، نه پیشرفت واقعی.

## 2. نگاشت ۱۷ پرامپت به ۲۷ مأموریت

| پرامپت | مسئولیت تخصصی | مأموریت‌های اجرایی |
|---|---|---|
| PR-01 | خط مبنا و کشف وضعیت واقعی | EXP-01 |
| PR-02 | بکاپ، دوام داده و بازیابی | EXP-02 |
| PR-03 | کشف و کاتالوگ قابلیت‌ها | EXP-03 |
| PR-04 | ردیابی نیازمندی تا قابلیت/کد/آزمون | EXP-04 |
| PR-05 | سناریوهای واقعی و سفرهای کاربر | EXP-05 |
| PR-06 | آزمون و شواهد اجرایی | EXP-06 |
| PR-07 | شکاف و علت ریشه‌ای | EXP-07 |
| PR-08 | تجارت، سفارش، پرداخت و تحویل | EXP-08 |
| PR-09 | خدمات هوشمند و پردازش فایل | EXP-09 |
| PR-10 | معماری فعلی و داده | EXP-10, EXP-11 |
| PR-11 | هویت، نقش، تفویض و مجوز | EXP-12 |
| PR-12 | امنیت، حریم خصوصی، ممیزی و حکمرانی | EXP-13, EXP-14, EXP-19 |
| PR-13 | معماری هدف و trade-off | EXP-15 |
| PR-14 | هاست، عملیات، بکاپ و انتشار کم‌اختلال | EXP-16, EXP-17, EXP-18 |
| PR-15 | اولویت‌بندی و بسته تغییر | EXP-20, EXP-21 |
| PR-16 | آمادگی پیاده‌سازی و رگرسیون | EXP-22, EXP-23 |
| PR-17 | پذیرش، امنیت، انتشار و پایش | EXP-24, EXP-25, EXP-26, EXP-27 |

یک EXP ممکن است به چند هدف سطح اول خدمت کند، اما فقط یک WORK_ITEM_ID اصلی دارد. اگر دو پرامپت به یک EXP ارجاع می‌دهند، آن‌ها باید همان Issue را ادامه دهند یا خروجی‌های غیرمتداخل با resource key جدا تعریف کنند؛ هرگز دو Issue موازی برای یک کار معنایی نسازند.

## 3. فهرست ۲۷ مأموریت و عمق اجرایی مورد انتظار

هر مورد زیر به یک Issue موجود متصل است. شماره Issue و WORK_ITEM_ID از GitHub بازیابی می‌شوند؛ شناسه‌های زیر صرفاً شناسه معنایی EXP هستند و جای WORK_ITEM_ID را نمی‌گیرند.

### EXP-01 — خط مبنا، نسخه و محیط‌ها
- Issue: #13 — `WI-EXP01-BASELINE-001`
- پرامپت: PR-01
- دامنه کار ۲۰–۳۰ دقیقه‌ای:
  1. ثبت SHA و default branch هر مخزن، تفکیک مخزن کنترل‌پلین از مخزن محصول و ثبت زمان مشاهده.
  2. بررسی branchها، PRها، commitهای اخیر، workflowها و وضعیت CI؛ تمایز بین وضعیت فعلی و snapshot تاریخی.
  3. استخراج نسخه runtime و dependencyها فقط از manifest/lockfileهای واقعی؛ نبود فایل یا دسترسی را UNKNOWN بنویس.
  4. ترسیم محیط‌های local/test/staging/production فقط در صورت وجود شواهد؛ ادعای محیط حدسی ممنوع.
  5. مقایسه README، manifest، workflow و شواهد deployment برای یافتن drift و تناقض.
  6. ساخت baseline register، Known Unknowns و فهرست ریسک‌ها با مسیر/commit/URL دقیق.
  7. بازخوانی مستقل تمام ارجاع‌ها و تولید گزارش Markdown و JSON machine-readable.
- خروجی: baseline report، facts JSON، environment/release map، unknowns register.
- پذیرش: دو مخزن جدا؛ هر fact دارای evidence؛ نسخه/محیط حدسی صفر؛ محصول READ_ONLY؛ ناسازگاری‌ها فهرست‌شده.

### EXP-02 — صحت بکاپ و آمادگی بازیابی
- Issue: #14 — `WI-EXP02-BACKUP-RESTORE-001`
- پرامپت: PR-02
- دامنه کار:
  1. شناسایی انواع داده، پایگاه داده، فایل‌های آپلودی، تنظیمات و stateهای بیرونی که نیاز به حفاظت دارند.
  2. یافتن تنظیمات backup، زمان‌بندی، مقصد، مالکیت، رمزنگاری، retention و دسترسی‌ها.
  3. بررسی شواهد اجرای موفق و تشخیص تفاوت backup job success با backup integrity.
  4. بررسی checksum، نسخه‌گذاری، immutability، جداسازی دسترسی و خطر حذف هم‌زمان نسخه پشتیبان.
  5. بررسی آخرین restore test، تاریخ، دامنه، زمان بازیابی و اختلاف آن با RPO/RTO موردنیاز؛ مقادیر نامعلوم را حدس نزن.
  6. طراحی restore drill غیرمخرب در محیط ایزوله و فهرست پیش‌نیازها/مجوزهای لازم.
  7. تولید ماتریس پوشش backup/restore و اولویت شکاف‌ها.
- خروجی: backup inventory، integrity matrix، restore drill plan، RPO/RTO unknowns.
- پذیرش: پوشش داده‌ها روشن؛ شواهد زمان‌دار؛ restore واقعی از backup موفق تفکیک‌شده؛ هیچ restore مخرب یا تغییر محصول انجام نشده.

### EXP-03 — کاتالوگ قابلیت‌های موجود
- Issue: #15 — `WI-EXP03-CAPABILITY-CATALOG-001`
- پرامپت: PR-03
- دامنه کار:
  1. تعیین روش کشف و مرز مخزن/نسخه مورد بررسی.
  2. کشف entry pointهای UI، route، controller، API و commandها.
  3. ردیابی هر مسیر به service، model، job، event، integration و storage.
  4. بررسی permission، feature flag، plan/entitlement و محدودیت نقش برای هر قابلیت.
  5. تطبیق کد با تست، مستندات و شواهد runtime؛ قابلیت صرفاً مستندشده را «موجود و فعال» اعلام نکن.
  6. ثبت وضعیت هر قابلیت: verified, partial, dormant, broken, unknown, deprecated.
  7. حذف duplicateهای معنایی، ساخت شناسه پایدار و گزارش پوشش/شکاف کاتالوگ.
- خروجی: capability catalog، route-to-service map، capability evidence matrix.
- پذیرش: هر قابلیت شناسه و منبع دارد؛ وضعیت با evidence؛ قابلیت‌های پنهان/غیرفعال تفکیک؛ ادعای پوشش کامل بدون روش کشف ممنوع.

### EXP-04 — ردیابی نیازمندی تا قابلیت و آزمون
- Issue: #16 — `WI-EXP04-REQUIREMENT-TRACE-001`
- پرامپت: PR-04
- دامنه کار:
  1. استخراج نیازمندی‌های مصوب از منابع معتبر و تعیین نسخه/مرجع هرکدام.
  2. تخصیص ID پایدار و حفظ متن اصلی/تاریخچه تغییرات.
  3. اتصال نیازمندی به هدف، سناریو، قابلیت و نقش ذی‌نفع.
  4. اتصال capability به route/API/service/model و مسیرهای واقعی اجرا.
  5. اتصال مسیر اجرایی به تست، نتیجه تست و شواهد مشاهده‌پذیر.
  6. علامت‌گذاری requirementهای بدون پیاده‌سازی، بدون تست، متناقض یا فاقد مالک.
  7. بازبینی traceability دوطرفه و گزارش coverage با مخرج شفاف.
- خروجی: requirement register، traceability matrix، orphan/contradiction report.
- پذیرش: هیچ requirement حذف نشده؛ لینک دوطرفه قابل ردیابی؛ پوشش با مخرج مشخص؛ وضعیت بدون شاهد UNKNOWN است.

### EXP-05 — سناریوهای واقعی کاربر
- Issue: #17 — `WI-EXP05-USER-SCENARIOS-001`
- پرامپت: PR-05
- دامنه کار:
  1. استخراج actorها و نقش‌ها از نیازمندی و شواهد موجود، بدون فرض‌کردن نقش جدید.
  2. تعریف هدف، trigger، پیش‌شرط، داده ورودی و نتیجه مطلوب هر سناریو.
  3. ترسیم مسیر عادی از ورود تا تکمیل کار و خروجی قابل مشاهده.
  4. افزودن شاخه‌های خطا، لغو، timeout، retry، دسترسی ناکافی و بازیابی.
  5. مشخص‌کردن نقاط handoff بین کاربر، مدیر اصلی، مدیر ارشد، کارمند و سرویس‌ها.
  6. تعیین معیار موفقیت، داده قابل مشاهده و کنترل‌های حریم خصوصی در هر گام.
  7. اولویت‌بندی سناریوها و اتصال به requirement/capability IDs.
- خروجی: scenario catalog، journey maps، exception-flow matrix.
- پذیرش: actorها مستند؛ happy path و failure path؛ نتیجه قابل سنجش؛ traceability کامل.

### EXP-06 — آزمون مبتنی بر شواهد
- Issue: #18 — `WI-EXP06-EVIDENCE-TESTING-001`
- پرامپت: PR-06
- دامنه کار:
  1. کشف frameworkها، test suites، fixtures، CI workflows و محیط‌های قابل اجرا.
  2. ساخت test inventory و نگاشت تست به سناریو/نیازمندی/قابلیت.
  3. انتخاب آزمون‌های read-only و غیرمخرب متناسب با دسترسی واقعی.
  4. اجرای تست فقط در محیط مجاز و ثبت command، commit، زمان، exit code و logs.
  5. تفکیک PASS/FAIL/SKIPPED/NOT_RUN/BLOCKED و تحلیل flaky یا ناقص بودن coverage.
  6. ثبت شواهد خام و خلاصه قابل بازبینی، بدون افشای secret/PII.
  7. تولید coverage matrix و پیشنهاد آزمون‌های مفقود.
- خروجی: test inventory، execution evidence، coverage/gap report.
- پذیرش: هر PASS به run/log متصل؛ تست اجرا نشده هرگز PASS نیست؛ محیط و commit مشخص؛ داده حساس افشا نشده.

### EXP-07 — تحلیل شکاف و علت ریشه‌ای
- Issue: #19 — `WI-EXP07-GAP-ROOT-CAUSE-001`
- پرامپت: PR-07
- دامنه کار:
  1. تثبیت baseline و نیازمندی مرجع برای هر شکاف.
  2. مقایسه رفتار واقعی با انتظار مصوب و ثبت دقیق نقطه اختلاف.
  3. تفکیک symptom، defect، missing capability، configuration issue و unknown.
  4. اجرای تحلیل علت ریشه‌ای با شواهد (توالی رخداد، مسیر کد، تست، لاگ).
  5. شناسایی عوامل مشارکت‌کننده، اثر جانبی، دامنه کاربران و شدت ریسک.
  6. ساخت فرضیه‌های جایگزین و تلاش برای رد/تأیید آن‌ها.
  7. پیشنهاد راهکار با هزینه، ریسک، dependency و معیار اثبات؛ بدون اجرای تغییر.
- خروجی: gap register، root-cause tree، remediation options.
- پذیرش: علت ریشه‌ای از علامت جدا؛ هر نتیجه evidence؛ فرضیه ردنشده مشخص؛ راهکار به نیازمندی متصل.

### EXP-08 — چرخه تجارت، پرداخت و تحویل
- Issue: #20 — `WI-EXP08-COMMERCE-CYCLE-001`
- پرامپت: PR-08
- دامنه کار:
  1. ترسیم catalog/product/price/plan و قواعد تخفیف/اعتبار.
  2. ردیابی cart/order/checkout و lifecycle stateهای سفارش.
  3. ردیابی payment intent، callback/webhook، idempotency و تطبیق تراکنش.
  4. بررسی delivery/entitlement/access grant و رابطه آن با پرداخت موفق/ناموفق.
  5. بررسی refund/cancel/chargeback/expiry و اثر بر دسترسی و حسابداری.
  6. تحلیل race condition، duplicate callback، retry و وضعیت‌های نیمه‌تمام.
  7. ساخت state transition map و فهرست نقاط کنترل/تست.
- خروجی: commerce sequence/state diagrams، payment-delivery matrix، risk register.
- پذیرش: چرخه انتهابه‌انتها مستند؛ stateها و transitions evidence-backed؛ پرداخت از تحویل تفکیک؛ no live payment action.

### EXP-09 — چرخه خدمات هوشمند و پردازش فایل
- Issue: #21 — `WI-EXP09-AI-SERVICE-CYCLE-001`
- پرامپت: PR-09
- دامنه کار:
  1. کشف ورودی‌ها، فرمت فایل‌ها، محدودیت اندازه و مسیر upload/storage.
  2. ردیابی job creation، queue، worker، provider API و callback.
  3. مستندسازی quota، pricing، subscription/entitlement و محاسبه مصرف.
  4. بررسی timeout، retry، cancellation، partial result و idempotency.
  5. ردیابی output generation، conversion، download، retention و حذف.
  6. بررسی privacy، prompt/file exposure، provider boundaries و هزینه.
  7. ساخت sequence map، failure matrix و سناریوهای تست.
- خروجی: AI service map، quota/cost model، file lifecycle matrix، failure cases.
- پذیرش: مسیر داده و سرویس مستند؛ هزینه/سهمیه evidence-backed؛ failure path پوشش‌داده؛ داده واقعی به provider ارسال نشده.

### EXP-10 — معماری فعلی و وابستگی‌ها
- Issue: #22 — `WI-EXP10-ARCHITECTURE-MAP-001`
- پرامپت: PR-10
- دامنه کار:
  1. شناسایی application entry points، runtime، modules و boundaries.
  2. ترسیم ارتباط UI/API/controller/service/model/job/event.
  3. کشف پایگاه داده، cache، queue، storage و سرویس‌های بیرونی.
  4. ترسیم جریان داده برای سناریوهای اصلی و نقاط اعتماد.
  5. شناسایی coupling، circular dependency، shared state و نقاط شکست واحد.
  6. مقایسه معماری مستندشده با معماری مشاهده‌شده.
  7. تولید context/container/component diagrams و فهرست unknownها.
- خروجی: current-state architecture diagrams، dependency inventory، data-flow map.
- پذیرش: دیاگرام‌ها به فایل/مسیر واقعی متصل؛ اعتماد/مرزها مشخص؛ اختلاف مستندات ثبت؛ هیچ طراحی هدفی به‌جای وضع موجود جا زده نشود.

### EXP-11 — مدل داده و ایمنی migration
- Issue: #23 — `WI-EXP11-DATA-MIGRATION-001`
- پرامپت: PR-10
- دامنه کار:
  1. کشف schema، modelها، relationها، constraintها، indexها و ownership داده.
  2. فهرست migrationها به ترتیب زمانی و تشخیص تغییرهای ناسازگار.
  3. تطبیق migrationها با کدهای مصرف‌کننده و fieldهای legacy.
  4. بررسی nullable/default، uniqueness، foreign key، data volume و lock risk.
  5. تحلیل backward/forward compatibility در deployment مرحله‌ای.
  6. بررسی backup/rollback و مسیر بازیابی در صورت شکست؛ migration اجرا نکن.
  7. تولید schema map، migration matrix و safe rollout proposal.
- خروجی: data model map، migration inventory، compatibility/rollback matrix.
- پذیرش: تمام ریسک‌های data loss/locking ثبت؛ وابستگی کدها مشخص؛ rollback با شواهد؛ هیچ migration اجرا نشده.

### EXP-12 — هویت، نقش و مجوز سمت سرور
- Issue: #24 — `WI-EXP12-IDENTITY-PERMISSION-001`
- پرامپت: PR-11
- دامنه کار:
  1. کشف lifecycle حساب، login، session، recovery و deactivation.
  2. استخراج roleها، permissionها، scopeها و رابطه کاربر با سازمان/دپارتمان.
  3. مدل‌سازی delegation بین مدیر اصلی و مدیر ارشد و محدوده اختیارات.
  4. بررسی server-side authorization در route، policy، service و data query.
  5. بررسی دسترسی مستقیم، privilege escalation، cross-tenant و IDOR risks.
  6. ساخت ماتریس actor × action × resource × scope و تست‌های منفی پیشنهادی.
  7. ثبت شکاف‌ها و پیشنهاد اصلاح بدون تغییر permission.
- خروجی: identity lifecycle، authorization matrix، delegation model، negative-test plan.
- پذیرش: مجوز سمت سرور اثبات؛ تفویض محدود و قابل ممیزی؛ least privilege؛ عدم دسترسی cross-scope بدون شاهد.

### EXP-13 — امنیت و حریم خصوصی
- Issue: #25 — `WI-EXP13-SECURITY-PRIVACY-001`
- پرامپت: PR-12
- دامنه کار:
  1. تعیین دارایی‌ها، actorها، trust boundary و مسیرهای داده حساس.
  2. ساخت threat model برای auth, API, file, AI, payment, admin و integrations.
  3. بررسی secrets/configuration، logging، error output و exposure risk بدون استخراج secret.
  4. بررسی input validation، injection، CSRF/CORS، SSRF، upload و dependency risks.
  5. بررسی retention، consent، access/deletion، data minimization و sharing boundaries.
  6. رتبه‌بندی احتمال/اثر و ثبت شواهد و confidence هر finding.
  7. پیشنهاد کنترل، روش retest و approval لازم؛ تست مخرب/نفوذ بدون مجوز ممنوع.
- خروجی: threat model، privacy data-flow map، security findings، remediation plan.
- پذیرش: دامنه و محدودیت ارزیابی شفاف؛ finding قابل بازتولید/شاهد؛ secret/PII افشا نشده؛ ادعای compliance قطعی بدون ممیزی ممنوع.

### EXP-14 — audit trail و یکپارچگی شواهد
- Issue: #26 — `WI-EXP14-AUDIT-EVIDENCE-001`
- پرامپت: PR-12
- دامنه کار:
  1. فهرست رخدادهای حساس کسب‌وکار و مدیریتی که باید ثبت شوند.
  2. ردیابی actor, action, target, timestamp, correlation ID و outcome در audit record.
  3. بررسی append-only/tamper evidence، retention، access و separation of duties.
  4. تطبیق logها با عملیات واقعی و شناسایی blind spotها.
  5. بررسی امکان بازسازی chronology یک رخداد و انتساب مسئولیت.
  6. ارزیابی حذف/ویرایش، clock skew، duplicate و missing event risks.
  7. تولید audit coverage matrix و پیشنهاد آزمون integrity.
- خروجی: audit event catalog، evidence integrity matrix، gap report.
- پذیرش: رخداد حساس و actor قابل ردیابی؛ محدودیت logها روشن؛ تمامیت ادعا نشده مگر اثبات؛ داده حساس حداقلی.

### EXP-15 — معماری هدف و گزینه‌ها
- Issue: #27 — `WI-EXP15-TARGET-ARCHITECTURE-001`
- پرامپت: PR-13
- دامنه کار:
  1. تثبیت ورودی‌های EXP-01 تا EXP-14 و فهرست ابهام‌های حل‌نشده.
  2. استخراج drivers، constraints، quality attributes و non-functional requirements.
  3. طراحی حداقل دو گزینه معماری متناسب با شواهد و محدودیت‌های واقعی.
  4. مقایسه هزینه، پیچیدگی، امنیت، توسعه‌پذیری، قابلیت استقرار و lock-in.
  5. طراحی مرز ماژول‌ها، APIها، داده، tenancy و integration boundaries.
  6. تحلیل migration path از وضع موجود و حفظ قابلیت‌های مفید.
  7. ارائه recommendation با ADR، trade-off و موارد نیازمند تصمیم مالک.
- خروجی: target architecture options، ADR، migration roadmap، decision log.
- پذیرش: گزینه‌ها evidence-backed؛ trade-off صریح؛ سازگاری با قیود؛ هیچ گزینه‌ای به‌عنوان تصمیم مصوب جا زده نشود.

### EXP-16 — امکان‌سنجی هاست و استقرار
- Issue: #28 — `WI-EXP16-HOSTING-FEASIBILITY-001`
- پرامپت: PR-14
- دامنه کار:
  1. استخراج runtime، process model، storage، cron/queue و نیازهای شبکه.
  2. شناسایی محدودیت‌های هاست اشتراکی/اقتصادی در برابر VPS/managed services.
  3. مقایسه منابع CPU/RAM/IO، worker، scheduler، filesystem و deployment access.
  4. تحلیل امنیت، backup، TLS، secrets و isolation در هر گزینه.
  5. برآورد هزینه بر اساس قیمت/مصرف قابل استناد و تفکیک تخمین از quote.
  6. بررسی portability، vendor lock-in، scaling و failure recovery.
  7. ارائه گزینه پیشنهادی و آزمایش سازگاری کم‌خطر.
- خروجی: hosting comparison، deployment prerequisites، cost model، feasibility verdict.
- پذیرش: محدودیت‌ها و هزینه مستند؛ فرضیات جدا؛ محیط واقعی حدس زده نشود؛ هیچ تغییر DNS/hosting انجام نشود.

### EXP-17 — عملیات، بکاپ و بازیابی بحران
- Issue: #29 — `WI-EXP17-OPERATIONS-DR-001`
- پرامپت: PR-14
- دامنه کار:
  1. شناسایی operational owner، on-call، escalation و دسترسی‌های اضطراری.
  2. تدوین inventory مانیتورینگ، alerting، logs، metrics و health checks.
  3. ارزیابی backup cadence، retention، restore evidence و DR dependencies.
  4. طراحی incident severity، response, communication و postmortem flow.
  5. تعیین RTO/RPO موردنیاز و مقایسه با شواهد ظرفیت واقعی.
  6. ساخت runbook برای outage، data corruption، credential compromise و provider failure.
  7. تعریف tabletop/restore exercise و معیار قبولی بدون اجرای مخرب.
- خروجی: operations runbook، DR matrix، incident plan، exercise plan.
- پذیرش: مالکیت و escalation روشن؛ بازیابی با شواهد؛ RTO/RPO نامعلوم برچسب‌گذاری؛ هیچ ادعای DR test بدون اجرا.

### EXP-18 — انتشار کم‌اختلال و rollback
- Issue: #30 — `WI-EXP18-LOW-DISRUPTION-RELEASE-001`
- پرامپت: PR-14
- دامنه کار:
  1. مستندسازی release topology و نقاطی که downtime ایجاد می‌کنند.
  2. شناسایی schema/config/API compatibility در releaseهای متوالی.
  3. طراحی staged rollout، canary یا maintenance window متناسب با توان واقعی.
  4. تعریف preflight، health checks، smoke tests و stop conditions.
  5. طراحی rollback و تشخیص تفاوت rollback کد، schema و داده.
  6. تعیین مسئول تصمیم، ارتباطات، پنجره تغییر و approval gates.
  7. اجرای tabletop روی سناریوی شکست و ثبت زمان/نقاط تصمیم.
- خروجی: release playbook، rollback matrix، preflight checklist، tabletop report.
- پذیرش: rollback واقع‌بینانه؛ داده مخرب/irreversible شناسایی؛ approvalها روشن؛ هیچ release واقعی انجام نشده.

### EXP-19 — حکمرانی، تفویض و بازبینی حقوقی
- Issue: #31 — `WI-EXP19-GOVERNANCE-LEGAL-001`
- پرامپت: PR-12
- دامنه کار:
  1. استخراج تصمیم‌ها و قواعد مصوب مالک از اسناد معتبر.
  2. مدل‌سازی authority، delegation، scope، duration و revocation.
  3. تعریف data sharing بر مبنای need-to-know و least privilege بین دپارتمان‌ها.
  4. فهرست تصمیم‌های حساس و مسیر approval، audit و appeal.
  5. شناسایی حوزه‌های حقوقی/قراردادی/حریم خصوصی نیازمند متخصص ذی‌صلاح.
  6. تفکیک fact، policy decision، recommendation و legal question.
  7. تولید governance matrix و فهرست تصمیم‌های باز برای مالک.
- خروجی: governance/delegation matrix، approval map، legal-review questions.
- پذیرش: هیچ سیاست جدیدی بدون approval مصوب نشده؛ حدود اختیار دقیق؛ پرسش حقوقی به‌عنوان نظر حقوقی نهایی عرضه نشده.

### EXP-20 — اولویت‌بندی مبتنی بر شواهد
- Issue: #32 — `WI-EXP20-PRIORITIZATION-001`
- پرامپت: PR-15
- دامنه کار:
  1. پاک‌سازی و deduplicate شکاف‌ها/درخواست‌ها با حفظ شناسه و منبع.
  2. امتیازدهی ارزش کاربر/کسب‌وکار، ریسک، فوریت، هزینه و reversibility.
  3. ثبت dependency و اثر روی قابلیت‌های موجود.
  4. برآورد effort با دامنه/عدم‌قطعیت و تفکیک تخمین از اندازه‌گیری.
  5. اجرای sensitivity analysis روی وزن‌ها و نشان‌دادن اثر تغییر فرضیات.
  6. تفکیک اولویت مالک‌تعیین‌شده از اولویت الگوریتمی.
  7. پیشنهاد roadmap و فهرست تصمیم‌هایی که فقط مالک می‌تواند بگیرد.
- خروجی: scored backlog، prioritization rationale، roadmap options.
- پذیرش: معیار و وزن شفاف؛ تصمیم مالک بازنویسی نشده؛ uncertainty آشکار؛ dependency لحاظ شده.

### EXP-21 — بسته تغییر و مشخصات پذیرش
- Issue: #33 — `WI-EXP21-CHANGE-PACKAGE-001`
- پرامپت: PR-15
- دامنه کار:
  1. انتخاب یک تغییر از backlog مصوب و تعریف problem statement.
  2. تعیین scope in/out، actor، capability و resourceهای درگیر.
  3. ثبت dependency، migration، compatibility و sequencing.
  4. تعریف رفتار قبل/بعد و acceptance criteria قابل آزمون.
  5. طراحی test plan، regression scope و evidence capture.
  6. تحلیل rollback، blast radius، monitoring و owner approval.
  7. تولید change package قابل review و تقسیم به Work Itemهای مستقل.
- خروجی: change proposal، acceptance spec، test/rollback plan، work breakdown.
- پذیرش: بسته کوچک و قابل review؛ criteria قابل اندازه‌گیری؛ مجوزها صریح؛ هیچ تغییر اجرا نشده.

### EXP-22 — آمادگی پیاده‌سازی کنترل‌شده
- Issue: #34 — `WI-EXP22-CONTROLLED-IMPLEMENTATION-001`
- پرامپت: PR-16
- دامنه کار:
  1. انتخاب بسته تغییر مصوب و بررسی approval معتبر و current.
  2. بررسی hard/soft dependencies و اثبات رفع gateها از منبع زنده.
  3. تأیید branch، commit base، resource keys، write policy و محدوده مجاز.
  4. تعریف pre-change snapshot، backup/rollback و stop conditions.
  5. بررسی test coverage و قابلیت بازگشت قبل از هر write.
  6. تهیه اجرای مرحله‌ای، تقسیم کار و برنامه verification مستقل.
  7. صدور readiness verdict: READY/BLOCKED با شواهد و اقدام بعدی.
- خروجی: implementation readiness dossier، dependency proof، execution/rollback plan.
- پذیرش: approval معتبر؛ همه gateها evidence-backed؛ branch/base قابل اثبات؛ هیچ write بدون مجوز.

### EXP-23 — رگرسیون و سازگاری
- Issue: #35 — `WI-EXP23-REGRESSION-001`
- پرامپت: PR-16
- دامنه کار:
  1. شناسایی رفتارها و contractهای موجودی که باید حفظ شوند.
  2. ساخت regression inventory از سناریو، API، data contract و integration.
  3. بررسی تست‌های موجود و تعیین blind spotها.
  4. طراحی تست‌های مثبت، منفی، boundary، concurrency و failure recovery.
  5. بررسی backward compatibility برای schema، API و داده.
  6. اجرای تست‌های مجاز یا ثبت دقیق NOT_RUN و علت.
  7. تهیه regression evidence report و release-blocking defects.
- خروجی: regression matrix، compatibility report، test evidence.
- پذیرش: قابلیت‌های موجود پوشش دارند؛ تست اجرا نشده PASS نیست؛ breaking change مشخص و approval-gated است.

### EXP-24 — پذیرش محصول و اعتبارسنجی کاربر
- Issue: #36 — `WI-EXP24-PRODUCT-ACCEPTANCE-001`
- پرامپت: PR-17
- دامنه کار:
  1. استخراج سناریوها و outcomeهای کاربر که باید پذیرفته شوند.
  2. تعریف معیار کمی/کیفی و داده لازم برای هر outcome.
  3. ساخت acceptance test با نقش‌ها، پیش‌شرط و test data ایمن.
  4. اجرای آزمون در محیط مجاز یا ثبت محدودیت اجرا.
  5. جمع‌آوری feedback و تفکیک observation از opinion.
  6. ثبت defect، severity، reproduction steps و اثر بر پذیرش.
  7. صدور verdict برای هر criterion و فهرست شروط باقی‌مانده.
- خروجی: acceptance matrix، user validation report، defect/feedback register.
- پذیرش: criteria قابل سنجش؛ نتیجه به شواهد متصل؛ محیط مشخص؛ هیچ feedbackی به‌عنوان approval مالک تفسیر نشده.

### EXP-25 — پذیرش امنیت و تاب‌آوری
- Issue: #37 — `WI-EXP25-SECURITY-RESILIENCE-001`
- پرامپت: PR-17
- دامنه کار:
  1. استخراج security/privacy/resilience controls موردنیاز از threat model و policy.
  2. تعیین روش آزمون ایمن، مجوز، محیط و داده آزمایشی.
  3. طراحی negative tests برای authorization، tenant isolation و data leakage.
  4. طراحی failure tests برای timeout، dependency outage، queue backlog و recovery.
  5. بررسی logging، alerting، auditability و evidence integrity.
  6. اجرای آزمون‌های مجاز یا ثبت NOT_RUN و نیازمندی approval.
  7. ساخت security/resilience acceptance report و فهرست blockerها.
- خروجی: security acceptance matrix، resilience test report، release blockers.
- پذیرش: آزمون‌ها با مجوز و محیط مشخص؛ findingها قابل پیگیری؛ ادعای امنیت کامل ممنوع؛ blockerهای critical باز مانع پذیرش‌اند.

### EXP-26 — آمادگی انتشار کنترل‌شده
- Issue: #38 — `WI-EXP26-CONTROLLED-RELEASE-001`
- پرامپت: PR-17
- دامنه کار:
  1. جمع‌آوری وضعیت جاری change package، PR، CI، reviews و approvals.
  2. تأیید پذیرش محصول، security، regression و dependency gates.
  3. بررسی deployment artifact، configuration، secrets handling و environment target.
  4. تأیید backup، rollback، monitoring و incident ownership.
  5. بررسی هزینه، زمان‌بندی، blast radius و ارتباط با ذی‌نفعان.
  6. اجرای go/no-go checklist و ثبت تصمیم‌های باز.
  7. ارائه release readiness verdict و دستورالعمل توقف/بازگشت؛ deploy نکن.
- خروجی: release dossier، go/no-go record، rollback/monitoring checklist.
- پذیرش: approval مالک صریح و current؛ CI/review evidence روی head جاری؛ همه blockerهای release حل یا پذیرفته‌شده؛ بدون approval هیچ deploy/merge.

### EXP-27 — پایش، شاخص‌ها و بهبود مستمر
- Issue: #39 — `WI-EXP27-MONITORING-IMPROVEMENT-001`
- پرامپت: PR-17
- دامنه کار:
  1. استخراج outcomeهای محصول و شاخص‌های سلامت عملیاتی.
  2. تعریف metric، event، source، owner، cadence و آستانه هشدار.
  3. بررسی پوشش dashboard، alert routing، noise و missing telemetry.
  4. اتصال رخداد، شکایت و feedback به incident/requirement/backlog.
  5. طراحی چرخه review، root cause، corrective action و verification.
  6. بررسی privacy و data minimization در telemetry.
  7. تعریف بهبودهای اولویت‌دار و سنجش اثر قبل/بعد.
- خروجی: metrics catalog، observability gap map، continuous-improvement loop.
- پذیرش: metricها تعریف و مالک دارند؛ منبع داده مشخص؛ alert قابل اقدام؛ بهبود با outcome سنجیده می‌شود.

## 4. استاندارد زمان و عمق

- هدف برنامه‌ریزی هر EXP: **۲۰ تا ۳۰ دقیقه کار تخصصی واقعی** برای یک چت، نه صرفاً زمان تولید متن.
- هر Work Item باید حداقل ۶ گام substantive، ۴ معیار پذیرش، ۳ خروجی قابل بازبینی، حداقل ۲ نوع شاهد و حداقل یک مرحله cross-check داشته باشد.
- اگر گام‌ها به دلیل dependency/دسترسی مسدودند، زمان را با انتظار تلف نکن؛ تحلیل مستقل، کشف شواهد، طراحی آزمون و مستندسازی blocker را انجام بده. پیشرفت را فقط به‌اندازه کار واقعاً انجام‌شده ثبت کن.
- زمان هدف، حداقل/حداکثر اجباری نیست. عامل نباید برای رسیدن به ۲۰ دقیقه کار مصنوعی بسازد یا کار را بی‌جهت طولانی کند. اگر کار با شواهد کامل زودتر تمام شد، effort واقعی و دلیل را ثبت کن.
- اگر یک EXP به‌طور واقعی بیش از ۳۰ دقیقه است، آن را به چند برگ مستقل با parent_work_item_id، resource_keys و dependency روشن تقسیم کن. اگر کمتر است، با کار بی‌ربط بزرگش نکن.
- یک چت فقط یک برگ اجرایی را claim می‌کند. موازی‌سازی بین برگ‌های مستقل و resourceهای disjoint مجاز است.

## 5. وضعیت موجود در برابر وضعیت موردنیاز

- ساختار موجود شامل ۱۷ prompt و ۲۷ Issue با شناسه EXP است؛ این ساختار حفظ می‌شود.
- متن فعلی بعضی Issueها هنوز چهار مرحله عمومی S0_GATE/S1_DISCOVER/S2_VALIDATE/S3_REPORT دارد؛ این به‌تنهایی استاندارد عمق فوق را اثبات نمی‌کند.
- تا وقتی Issue body یا مرجع task plan با جزئیات فوق read-back و schema validation نشده، آن EXP را **DEPTH_NOT_VERIFIED** در نظر بگیر؛ صرفاً به دلیل وجود Issue آن را READY عمیق اعلام نکن.
- پرامپت تخصصی، نقشه راه اجراست؛ Issue leaf مرجع مالکیت و پیشرفت؛ این سند مرجع عمق و دامنه تخصصی؛ registry مرجع lease؛ evidence مرجع پذیرش است.

## 6. قیود ایمنی و تصمیم

- مخزن محصول `a4adelahmadian86-wq/non` تا مجوز مستقل و صریح مالک، READ_ONLY باقی می‌ماند.
- این سند مجوز اجرای migration، پرداخت، انتشار، تغییر permission، حذف داده، تست نفوذ یا تغییر production نیست.
- hard gateها از `DEPENDENCY_GRAPH.json` خوانده شوند؛ جهت و وضعیت آن‌ها با evidence بررسی شود. dependency را صرفاً از شماره EXP نتیجه‌گیری نکن.
- تغییرات در control-plane نیز باید claim/heartbeat معتبر، branch اختصاصی و PR داشته باشند. ادغام PR و فعال‌کردن release نیازمند approval جداگانه است.
