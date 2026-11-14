# تنظیمات یک‌باره GitHub که از طریق این اتصال قابل اعمال نبودند

## 1. خصوصی‌کردن مخزن — اقدام فوری مالک
در لحظه ایجاد کنترل‌پلین، visibility مخزن `PUBLIC` بود. چون اسناد نیازمندی، مدل کسب‌وکار و نقشه پروژه در آن ثبت می‌شود:
1. GitHub → مخزن `farast-control-plane` → Settings.
2. General → پایین صفحه Danger Zone.
3. Change repository visibility → Make private.
4. تأیید نهایی GitHub را انجام بده.
5. بعد از تغییر، در Settings یا صفحه مخزن private بودن را بررسی کن.

تا آن زمان هیچ secret، credential، PII، dump یا داده مشتری وارد نشود. چون فایل‌های پروژه قبلاً روی branch عمومی قرار گرفته‌اند، خصوصی‌سازی را فوری انجام بده؛ اگر اطلاعات حساس‌تر از مستندات کسب‌وکار وارد شده، آن‌ها را rotate/revoke کن.

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
