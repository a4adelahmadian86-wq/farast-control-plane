# پروتکل تحویل و انتقال کار بین چت‌ها/حساب‌ها

## هدف
انتقال یک TASK موجود به عامل دیگر بدون ساخت وظیفه تکراری، از دست‌رفتن زمینه، یا باقی‌ماندن دو نویسنده هم‌زمان.

## شرط شروع تحویل
- TASK_ID و Issue canonical مشخص باشد.
- آخرین وضعیت Issue، branch، head commit، PR و checkpoint از GitHub زنده خوانده شده باشد.
- هر عملیات مبهم ابتدا read-back و با یکی از وضعیت‌های CONFIRMED / NOT_APPLIED / PARTIAL / AMBIGUOUS / BLOCKED طبقه‌بندی شده باشد.
- هیچ عملیات AMBIGUOUS به عامل بعدی به‌عنوان اقدام قابل retry تحویل نشود.

## محتوای اجباری handoff
1. TASK_ID، PROMPT_ID، RUN_ID قبلی و وضعیت TASK.
2. هدف و دامنه داخل/خارج از کار.
3. آخرین branch و commit SHA تأییدشده.
4. آخرین گام کامل و گام نیمه‌تمام.
5. فایل‌ها/منابع تغییرکرده و OPERATION_IDهای تأییدشده.
6. تست‌های واقعاً اجراشده و نتیجه؛ موارد NOT_RUN جدا.
7. لینک شواهد، گزارش، Issue و PR.
8. واقعیت‌ها، فرض‌ها، مجهولات، ریسک‌ها و موانع.
9. تأییدهای انسانی اخذشده و تأییدهای باقی‌مانده.
10. اقدام بعدی دقیق و قابل اجرا؛ نه عباراتی مانند «ادامه بررسی».
11. وضعیت هر RESOURCE_KEY، fencing token و زمان انقضای lease.

## چرخه انتقال مالکیت
1. عامل فعلی نوشتن را متوقف می‌کند و checkpoint معتبر می‌سازد.
2. عامل فعلی آخرین commit و اثر عملیات را از GitHub دوباره می‌خواند.
3. اگر انتقال به نشست/عامل دیگر انجام می‌شود، عامل فعلی leaseهای متعلق به خودش را با CAS و fencing token دقیق آزاد می‌کند؛ اگر اتصال قطع شده باشد، عامل بعدی تا expiry منتظر می‌ماند یا طبق پروتکل CAS وضعیت lease را بررسی می‌کند.
4. عامل بعدی همان TASK_ID و branch را بازیابی می‌کند، RUN_ID تازه می‌سازد و قبل از نوشتن lease جدید را با all-or-none CAS می‌گیرد.
5. عامل بعدی فقط از NEXT_ACTION checkpoint ادامه می‌دهد و کار کامل‌شده را تکرار نمی‌کند.
6. اگر وضعیت قفل یا آخرین عملیات مبهم است، عامل بعدی read-only می‌ماند تا وضعیت قطعی شود.

## ممنوعیت‌ها
- ساخت TASK/Issue/branch/PR موازی برای همان دامنه.
- انتقال یا جعل fencing token عامل قبلی.
- استفاده از خلاصه چت به‌جای checkpoint.
- overwrite کردن checkpoint تاریخی؛ checkpoint جدید با شناسه/زمان جدید append شود.
- ثبت secret، token، PII یا داده مشتری در handoff.

## قرارداد
ساختار checkpoint باید با `CHECKPOINT_SCHEMA.json` معتبر باشد؛ فیلدهای TASK با `WORK_ORDER_SCHEMA.json` سازگار باشند. قالب مرجع انسانی: `CHECKPOINT_TEMPLATE.md`. گردش کار وظیفه: `WORKER_PROTOCOL.md`.


## Handoff مبتنی بر branch اختصاصی
هر RUN branch تازه و یکتا دارد. claim جدید previous_run/previous_branch/previous_target_repository را برمی‌گرداند. worker جدید branch قبلی را فقط read-only بررسی می‌کند، آخرین checkpoint معتبر را در مخزن هدف تأیید و branch جدید را از همان commit ایجاد می‌کند. coordinator در نسخه فعلی branch مخزن محصول را خودکار ایجاد نمی‌کند. اگر checkpoint مبهم باشد، write متوقف می‌شود.
