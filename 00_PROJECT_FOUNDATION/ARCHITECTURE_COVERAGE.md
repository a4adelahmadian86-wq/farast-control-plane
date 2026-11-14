# تطبیق معماری مصوب با فایل‌های مرجع کنترل‌پلین

این سند برای جلوگیری از فایل‌های موازی و دوگانگی منبع حقیقت است. نام فایل‌های اولیه در معماری پیشنهادی ممکن است با نام canonical فعلی متفاوت باشد؛ هر موضوع فقط یک مرجع حقیقت دارد.

| موضوع/نام پیشنهادی اولیه | مرجع canonical فعلی | وضعیت |
|---|---|---|
| PROJECT_CHARTER.md | همین فایل | موجود |
| APPROVED_REQUIREMENTS.md | همین فایل + SOURCE_REQUIREMENTS_v2.md | موجود |
| PRODUCT_SCOPE.md | PROJECT_CHARTER.md و SOURCE_REQUIREMENTS_v2.md، بخش دامنه کسب‌وکار | پوشش معنایی؛ فایل جدا ساخته نشده |
| SPECIALIST_WORKFLOW.md | همین فایل؛ EXP-01 تا EXP-27 | موجود؛ تعارض نسخه قدیمی در KNOWN_UNKNOWN ثبت می‌شود |
| EXPERT_KNOWLEDGE.md | بخش «قواعد دانش ضمنی متخصص» در SPECIALIST_WORKFLOW.md | پوشش معنایی؛ فایل جدا ساخته نشده |
| CONSTRAINTS_AND_UNKNOWN.md | KNOWN_UNKNOWN.md | موجود با نام canonical متفاوت |
| MASTER_GOAL.md | G-00 در GOAL_TREE.md | موجود با نام canonical متفاوت |
| GOAL_TREE.md / ROADMAP.md | همین فایل‌ها + DEPENDENCY_GRAPH.json | موجود |
| ACCEPTANCE_FRAMEWORK.md | 04_COORDINATION/ACCEPTANCE_FRAMEWORK.md | موجود |
| DECISION_REGISTER.md | همین فایل | موجود |
| USER_FEEDBACK_REGISTER.md | همین فایل | موجود |
| CHANGE_HISTORY.md | تاریخچه commit/PR GitHub؛ سیاست در CHANGE_CONTROL.md | تاریخچه Git مرجع است؛ log تکراری ساخته نمی‌شود |
| APPROVAL_RULES.md | CHANGE_CONTROL.md | موجود با نام canonical متفاوت |
| MASTER_STATUS.md / STAGE_LEDGER | MASTER_STATUS.md و EXP_STAGE_LEDGER.csv | موجود |
| CAPABILITY_REGISTER.csv / REQUIREMENTS_TRACEABILITY.csv | همین فایل‌ها | موجود؛ تا اجرای ممیزی خالی و عمداً NOT_STARTED |
| OPEN_GAPS / BLOCKERS | KNOWN_UNKNOWN.md، Issueهای مسدود و گزارش TASK | منبع تجمیعی؛ فایل مستقل فعلاً ندارد |
| METRICS.md | GOAL_STATUS.csv و ACCEPTANCE_FRAMEWORK.md | موجود به‌صورت داده ساخت‌یافته؛ درصد وزنی تا تصویب وزن‌ها ممنوع |
| WORKER_PROTOCOL.md | همین فایل | موجود |
| GLOBAL_LOCK_PROTOCOL.md | LOCK_MANAGER_PROTOCOL.md و LOCK_PROTOCOL.md | موجود؛ LOCK_MANAGER مرجع جزئیات CAS |\n| Event-driven Issue coordinator from PR #479 | LEGACY_COORDINATOR_MIGRATION.md | تحلیل شده اما هنوز به مخزن مستقل منتقل/پیاده‌سازی نشده؛ تصمیم و اجرای جدا لازم است |
| WORK_ORDER_SCHEMA.json | 04_COORDINATION/WORK_ORDER_SCHEMA.json | موجود |
| CHECKPOINT_SCHEMA.json | 04_COORDINATION/CHECKPOINT_SCHEMA.json | موجود |
| HANDOFF_PROTOCOL.md | 04_COORDINATION/HANDOFF_PROTOCOL.md | موجود |
| REGRESSION_CASES.md | MULTI_AGENT_REGRESSION_CASES.md | موجود با نام canonical متفاوت |
| PR template | .github/PULL_REQUEST_TEMPLATE.md | موجود |
| ISSUE templates | .github/ISSUE_TEMPLATE/ | موجود |
| WORK_ORDERS / CHECKPOINTS / REPORTS / EVIDENCE | GitHub Issues و پوشه‌های 06 تا 09 | موجود؛ Issueها منبع وظیفه‌اند |

## تفکیک منبع حقیقت
- GitHub Issue: وضعیت و مالکیت هر TASK.
- PR/commit: تغییرات و تاریخچه immutable.
- رجیسترهای CSV: نمای ردیابی و وضعیت تجمیعی بر اساس شواهد.
- checkpoint: نقطه بازیابی append-only برای یک TASK.
- گزارش: تحلیل و شواهد به commit/environment مشخص.
- تصمیم و بازخورد: رجیسترهای governance؛ تاریخچه قبلی حذف نمی‌شود.

## مواردی که هنوز «پوشش مستند» به معنی «اثبات اجرایی» نیست
- CAS و fencing نیازمند آزمون رقابتی دو حساب مستقل است.
- بازیابی قطع چت و انتقال بین حساب‌ها نیازمند آزمون واقعی است.
- دسترسی هر اتصال GitHub پس از خصوصی‌سازی باید جداگانه تأیید شود.
- EXP-01 تا EXP-27 هنوز اجرا نشده‌اند؛ Capability و Requirements registers تا زمان کشف واقعی عمداً خالی‌اند.
