# تنظیمات یک‌باره GitHub که از طریق این اتصال قابل اعمال نبودند

## 1. وضعیت visibility و حالت عمومی امن
در حال حاضر مخزن PUBLIC است و این وضعیت طبق تصمیم فعلی مالک حفظ می‌شود. برای کار عمومی و غیرمحرمانه می‌توان از کنترل‌پلین استفاده کرد، مشروط بر اینکه هیچ secret، credential، PII، داده مشتری، dump یا سند محرمانه وارد مخزن، Issue، comment یا PR نشود. اگر بعداً قرار است اطلاعات محرمانه یا داده داخلی در این مخزن نگهداری شود، پیش از آن باید visibility به private تغییر کند و دسترسی حساب‌ها دوباره بررسی شود. خصوصی‌سازی در این مرحله پیش‌شرط اجرای عمومی/غیرمحرمانه نیست.

## 2. حفاظت شاخه main
Settings → Rules → Rulesets (یا Branches → Branch protection rules):
- هدف: branch `main`.
- Require a pull request before merging.
- حداقل یک approval مستقل (در صورت وجود همکار واجد شرایط).
- Require status checks: `Control Plane Validation / validate`.
- Require conversation resolution.
- Block force pushes و branch deletion.
- Restrict direct pushes به مالک/maintainerهای مجاز.
- Require linear history در صورت سازگاری با روش merge تیم.
- Bypass list حداقلی و فقط برای نقش‌های ضروری.

## 3. حفاظت شاخه قفل
Branch `coordination/locks` منبع registry است. حذف تصادفی آن را محدود کن، اما update ref اتمیک باید برای عامل‌های مجاز امکان‌پذیر بماند. قواعد PR اجباری برای این branch ممکن است با CAS مستقیم تداخل داشته باشد؛ آن را جداگانه و با دقت تنظیم کن.

## 4. دسترسی حساب‌های ChatGPT و همکاران
هر حساب ChatGPT باید GitHub connector/app را جداگانه به مخزن private مجاز کند و دسترسی read/write لازم را داشته باشد. دسترسی یک حساب به حساب دیگر منتقل نمی‌شود. هر چت باید ابزارهای لازم Git Data read/write را بررسی کند؛ در نبود آن فقط read-only.

## وضعیت اعمال
این فایل راهنمای دستی است؛ تنظیمات بالا از طریق ابزار فعلی اعمال نشده‌اند و تا زمان بررسی مالک نباید انجام‌شده فرض شوند.


## 5. هماهنگ‌کننده چندچتی و دسترسی cross-repository
- workflow مرکزی `.github/workflows/farast-coordinator.yml` پس از ادغام PR #1 در default branch فعال می‌شود. پس از merge، GitHub Actions باید برای مخزن فعال باشد و اجرای schedule پنج‌دقیقه‌ای و workflow_dispatch بررسی شود.
- اگر پذیرش باید PRهای مخزن محصول `non` را بررسی کند، در Settings → Secrets and variables → Actions یک Repository Secret با نام `FARAST_GITHUB_TOKEN` تعریف کن. از Fine-grained PAT با دسترسی فقط read به Pull requests و Metadata در مخزن هدف استفاده کن. توکن را در Issue، فایل، خروجی چت یا log وارد نکن.
- هر حساب/کارمند/چت باید دسترسی GitHub مستقل و مجاز داشته باشد. نقش GitHub actor و author_association در coordinator بررسی می‌شود؛ CHAT_ID و RUN_ID فقط metadata خوداظهاری‌اند.
- برای branch `coordination/locks` هیچ workflow یا عامل دیگری را به‌عنوان writer فعال نکن. workflow مرکزی تنها writer مجاز است؛ تغییر دستی registry ممنوع.
- پیش از استفاده واقعی، آزمون‌های `04_COORDINATION/COORDINATOR_TEST_PLAN.md` را اجرا و نتایج را در GitHub ثبت کن. حداقل دو حساب مستقل برای اثبات contention و takeover لازم است.


## 6. اجازه نوشتن برای GitHub Actions
در Settings → Actions → General → Workflow permissions بررسی کن که GitHub Actions اجازه write به محتوا و Issueها داشته باشد؛ workflow خودش دسترسی‌ها را به contents:write و issues:write و pull-requests:read محدود کرده است. اگر policy مخزن/سازمان write را ممنوع کند، coordinator نمی‌تواند registry یا Issue comments را به‌روزرسانی کند و باید read-only/STOP WRITES بماند.


## تفویض اختیار فرمان‌های چندچتی
سیاست فعال در `04_COORDINATION/ACTOR_AUTHORIZATION.json` اعمال می‌شود: OWNER همه فرمان‌ها را دارد؛ COLLABORATOR/MEMBER به‌صورت پیش‌فرض نقش WORKER می‌گیرند (claim/heartbeat/release/status/block/review) و حق unblock/reopen/accept ندارند. نقش SENIOR_MANAGER تمام فرمان‌ها را فقط پس از درج دقیق GitHub login در `actor_roles` و تأیید مالک دریافت می‌کند. READ_ONLY فقط status دارد. `actor_roles` فعلاً خالی است؛ بنابراین هیچ مدیر ارشدی به‌صورت حدسی مجاز نشده است. تغییر این فایل باید از PR و با تأیید مالک انجام شود.
