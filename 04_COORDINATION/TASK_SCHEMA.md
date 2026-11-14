# قرارداد استاندارد وظیفه (TASK)

هر GitHub Issue اجرایی باید این بخش‌ها را داشته باشد:

- TASK_ID:
- PROMPT_ID:
- EXP_IDS:
- GOAL_IDS:
- TITLE:
- PURPOSE:
- STATUS:
- OWNER_AGENT:
- RUN_ID:
- CREATED_AT_UTC:
- LAST_CHECKPOINT_UTC:
- BRANCH:
- RESOURCE_KEYS:
- INPUTS:
- SCOPE_IN:
- SCOPE_OUT:
- DEPENDENCIES:
- FACTS:
- ASSUMPTIONS:
- UNKNOWN:
- PLAN:
- ACCEPTANCE_CRITERIA:
- EVIDENCE:
- TESTS:
- RISKS:
- BLOCKERS:
- HUMAN_APPROVAL_REQUIRED:
- NEXT_ACTION:
- HANDOFF:
- RELATED_ISSUES:
- RELATED_PRS:

## وضعیت و ادعا
- NOT_RUN: اجرا نشده.
- PLANNED: برنامه‌ریزی شده.
- RUNNING: در حال اجرا.
- PASS/FAIL/BLOCKED/NOT_APPLICABLE: نتیجه آزمون.
- DONE_UNVERIFIED: خروجی موجود، اما معیار/شواهد/بازبینی کافی نیست.
- DONE_VERIFIED: معیارها و شواهد معتبر و بازبینی لازم تکمیل شده‌اند.

## checkpoint
Checkpoint باید آخرین گام کامل، آخرین گام ناتمام، فایل/commitهای تغییر یافته، فرمان‌ها و نتایج، تست‌ها، شواهد، خطاها، مانع و اقدام بعدی را شامل شود. هیچ راز یا داده شخصی درج نشود.
