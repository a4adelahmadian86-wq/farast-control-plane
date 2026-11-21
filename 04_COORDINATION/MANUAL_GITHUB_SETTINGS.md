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
  - **Pull requests: read** — خواندن مشخصات PR مقصد.
  - **Commit statuses: read** — خواندن وضعیت‌های commit روی SHA دقیق.
  - **Contents: write** — GitHub برای endpoint رسمی Merge a pull request این سطح را لازم می‌داند؛ همین سطح Compare ancestry را نیز پوشش می‌دهد.
  - **Metadata: read** — به‌صورت پیش‌فرض برای Fine-grained PAT فراهم است.
  - **Checks:read را به این PAT اضافه نکن**؛ مستندات فعلی GitHub برای List check runs، Fine-grained PAT را به‌عنوان نوع توکن پشتیبانی‌شده فهرست نمی‌کنند. Coordinator برای مخزن cross-repo عمومی Check Runها را بدون احراز هویت می‌خواند. مخزن خصوصی تا پیاده‌سازی GitHub App installation-token با Checks:read عمداً پشتیبانی نمی‌شود و پذیرش آن fail-closed می‌ماند.
- PAT را فقط به مخزن هدف بده؛ Pull requests:write، Actions، Workflows، Administration، Secrets و Issues لازم نیستند. توجه: Contents:write مجوز گسترده‌ای است و امکان نوشتن مستقیم محتوا را هم می‌دهد؛ این سطح را فقط پس از فعال‌سازی و read-back branch protection/ruleset روی شاخه پیش‌فرض مقصد به Secret بده. چون در snapshot زنده `non/main.protected=false` است، تا زمان محافظت شاخه main، Secret را نساز/تنظیم نکن و پذیرش cross-repository را غیرفعال نگه دار. هرگز مقدار توکن را در Issue، فایل، خروجی چت یا log وارد نکن. وجود/مقدار Secret از اتصال فعلی قابل خواندن یا تأیید نیست.

مراجع رسمی GitHub:
- [Fine-grained PAT permissions by REST endpoint](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens)
- [Checks API — List check runs for a Git reference](https://docs.github.com/en/rest/checks/runs#list-check-runs-for-a-git-reference)
- [Commit statuses API](https://docs.github.com/en/rest/commits/statuses#get-the-combined-status-for-a-specific-reference)
- [Pull requests API — Get a pull request and merge a pull request](https://docs.github.com/en/rest/pulls/pulls)
- [Compare two commits](https://docs.github.com/en/rest/commits/commits#compare-two-commits)
- [Get a branch](https://docs.github.com/en/rest/branches/branches#get-a-branch)

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


## قواعد الزامی Ruleset برای شاخه main — قبل از فعال‌سازی توکن

این تنظیم باید جداگانه در هر دو مخزن `a4adelahmadian86-wq/farast-control-plane` و `a4adelahmadian86-wq/non` انجام شود. ابزار متصل فعلی فقط خواندن GitHub را در این endpointها پشتیبانی می‌کند؛ بنابراین خودکار تغییرش نمی‌دهیم.

1. وارد **Settings → Rules → Rulesets → New branch ruleset** شوید.
2. نامی مانند `FARAST-main-protection` انتخاب کنید و **Enforcement status = Active** بگذارید.
3. Target را روی Branches قرار دهید و فقط `main` را هدف بگیرید.
4. این Ruleها را فعال کنید:
   - **Require a pull request before merging**؛ تعداد approval اجباری را **0** بگذارید تا به بازبین انسانی دوم وابسته نشوید.
   - **Block force pushes**.
   - **Restrict deletions**.
5. بخش **Bypass list** باید کاملاً خالی باشد؛ هیچ User، Team، Role یا Integration را اضافه نکنید.
6. Ruleset را ذخیره کنید. هیچ توکن یا secret در این صفحه یا Issue ثبت نکنید.
7. read-back را انجام دهید:
   - Branch API باید `protected=true` برگرداند.
   - Rules for a branch باید rule typeهای `pull_request`، `non_fast_forward` و `deletion` را برگرداند.
   - جزئیات ruleset باید `enforcement=active` و `bypass_actors=[]` را نشان دهد.
8. همین مراحل را برای مخزن دوم نیز انجام دهید.

Coordinator فقط به `protected=true` اکتفا نمی‌کند؛ اکنون ruleهای مؤثر، تعداد approval صفر، فعال بودن ruleset و خالی بودن bypass actors را بررسی می‌کند. اگر GitHub فیلد `bypass_actors` را به‌دلیل نداشتن دسترسی مشاهده‌کننده برنگرداند، پذیرش fail-closed می‌شود. برای عبور از این گیت، سطح Administration:write را صرفاً برای دور زدن خطا به PAT اضافه نکنید؛ ابتدا باید دسترسی امن و read-only لازم برای مشاهده تنظیمات ruleset مشخص شود.

تا وقتی این read-back برای هر دو مخزن موفق نشده، `FARAST_GITHUB_TOKEN` را تنظیم نکنید. این توکن به Contents:write نیاز دارد و بدون قواعد PR-only می‌تواند محتوای شاخه اصلی را مستقیماً تغییر دهد.
