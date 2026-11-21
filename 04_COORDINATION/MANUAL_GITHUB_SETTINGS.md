# تنظیمات یک‌باره GitHub که از طریق این اتصال قابل اعمال نبودند

## 1. وضعیت visibility و حالت عمومی امن
در حال حاضر مخزن PUBLIC است و این وضعیت طبق تصمیم فعلی مالک حفظ می‌شود. برای کار عمومی و غیرمحرمانه می‌توان از کنترل‌پلین استفاده کرد، مشروط بر اینکه هیچ secret، credential، PII، داده مشتری، dump یا سند محرمانه وارد مخزن، Issue، comment یا PR نشود. اگر بعداً قرار است اطلاعات محرمانه یا داده داخلی در این مخزن نگهداری شود، پیش از آن باید visibility به private تغییر کند و دسترسی حساب‌ها دوباره بررسی شود. خصوصی‌سازی در این مرحله پیش‌شرط اجرای عمومی/غیرمحرمانه نیست.

## 2. حفاظت شاخه main
Settings → Rules → Rulesets (یا Branches → Branch protection rules):
- هدف: branch `main`.
- Require a pull request before merging.
- Require at least one approval from someone other than the PR author.
- Require review from Code Owners; `.github/CODEOWNERS` مالک مخزن را برای workflowها، هسته coordinator و سیاست دسترسی تعیین می‌کند.
- Dismiss stale approvals when new commits are pushed.
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
- workflow مرکزی `.github/workflows/farast-coordinator.yml` پس از ادغام PR #1 اکنون روی `main` فعال است و اجرای زنده `issue_comment` موفق بوده است. اجرای schedule پنج‌دقیقه‌ای و `workflow_dispatch` هنوز جداگانه باید با run زنده تأیید شود.
- برای پذیرش PR در مخزن عمومی محصول `non`، در مخزن کنترل‌پلین از مسیر Settings → Secrets and variables → Actions یک Repository Secret با نام `FARAST_GITHUB_TOKEN` تعریف کن. مقدار آن یک Fine-grained PAT محدود به همان مخزن مقصد باشد؛ حداقل مجوزها:
  - **Pull requests: write** — خواندن PR و ادغام PR با SHA دقیق head.
  - **Commit statuses: read** — خواندن وضعیت‌های commit روی SHA دقیق.
  - **Contents: read** — فقط برای مسیر جایگزین بررسی ancestry با Compare API.
  - **Metadata: read** — به‌صورت پیش‌فرض برای Fine-grained PAT فراهم است.
  - **Checks:read را به این PAT اضافه نکن**؛ مستندات فعلی GitHub برای List check runs، Fine-grained PAT را به‌عنوان نوع توکن پشتیبانی‌شده فهرست نمی‌کنند. Coordinator برای مخزن cross-repo عمومی Check Runها را بدون احراز هویت می‌خواند. مخزن خصوصی تا پیاده‌سازی GitHub App installation-token با Checks:read عمداً پشتیبانی نمی‌شود و پذیرش آن fail-closed می‌ماند.
- PAT را فقط به مخزن هدف بده؛ Contents write، Actions، Workflows، Administration، Secrets و Issues لازم نیستند. هرگز مقدار توکن را در Issue، فایل، خروجی چت یا log وارد نکن. وجود/مقدار Secret از اتصال فعلی قابل خواندن یا تأیید نیست.

مراجع رسمی GitHub:
- [Fine-grained PAT permissions by REST endpoint](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens)
- [Checks API — List check runs for a Git reference](https://docs.github.com/en/rest/checks/runs#list-check-runs-for-a-git-reference)
- [Commit statuses API](https://docs.github.com/en/rest/commits/statuses#get-the-combined-status-for-a-specific-reference)
- [Pull requests API](https://docs.github.com/en/rest/pulls/pulls)
- [Compare two commits](https://docs.github.com/en/rest/commits/commits#compare-two-commits)
- هر حساب/کارمند/چت باید دسترسی GitHub مستقل و مجاز داشته باشد. نقش GitHub actor و author_association در coordinator بررسی می‌شود؛ CHAT_ID و RUN_ID فقط metadata خوداظهاری‌اند.
- برای branch `coordination/locks` هیچ workflow یا عامل دیگری را به‌عنوان writer فعال نکن. workflow مرکزی تنها writer مجاز است؛ تغییر دستی registry ممنوع.
- پیش از استفاده واقعی، آزمون‌های `04_COORDINATION/COORDINATOR_TEST_PLAN.md` را اجرا و نتایج را در GitHub ثبت کن. حداقل دو حساب مستقل برای اثبات contention و takeover لازم است.


## 6. اجازه نوشتن برای GitHub Actions
در Settings → Actions → General → Workflow permissions بررسی کن که GitHub Actions اجازه write داشته باشد. workflow مرکزی در کنترل‌پلین به contents:write، issues:write و pull-requests:write و به checks:read و statuses:read نیاز دارد؛ این مجوزهای workflow در مخزن کنترل‌پلین جدا از مجوزهای Fine-grained PAT مخزن مقصد هستند. اگر policy مخزن/سازمان write را ممنوع کند، coordinator نمی‌تواند registry یا Issue comments را به‌روزرسانی کند و باید read-only/STOP WRITES بماند.


## تفویض اختیار فرمان‌های چندچتی
سیاست فعال در `04_COORDINATION/ACTOR_AUTHORIZATION.json` اعمال می‌شود: OWNER همه فرمان‌ها را دارد؛ COLLABORATOR/MEMBER به‌صورت پیش‌فرض نقش WORKER می‌گیرند (claim/heartbeat/release/status/block/review) و حق unblock/reopen/accept ندارند. نقش SENIOR_MANAGER تمام فرمان‌ها را فقط پس از درج دقیق GitHub login در `actor_roles` و تعیین دقیق `repositories` و `resource_key_prefixes` در `actor_scopes`، با تأیید مالک دریافت می‌کند؛ خارج از آن scope فرمان رد می‌شود. READ_ONLY فقط status دارد. `actor_roles` فعلاً خالی است؛ بنابراین هیچ مدیر ارشدی به‌صورت حدسی مجاز نشده است. تغییر این فایل باید از PR و با تأیید مالک انجام شود.
