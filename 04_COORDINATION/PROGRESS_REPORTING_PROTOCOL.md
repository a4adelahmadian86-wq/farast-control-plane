# پروتکل گزارش و محاسبه پیشرفت FARAST

نسخه: 2.0.0

## اصل
سه شاخص مستقل و اجباری گزارش شوند: EXECUTION_PROGRESS، ACCEPTANCE_PROGRESS و OVERALL_COMPLETION. وضعیت Claim/Lease/Owner/Blocker شاخص چهارم و مستقل است؛ آن را با درصد انجام اشتباه نکن.

## 1. EXECUTION_PROGRESS
درصد گام‌های اجرایی required که validation_status=PASS و حداقل یک evidence_ref معتبر دارند.
- اگر وزن معتبر و نسخه‌بندی‌شده برای تمام گام‌های required موجود است: مجموع وزن گام‌های PASS تقسیم بر مجموع وزن گام‌های required.
- در غیر این صورت گام‌های required هم‌وزن‌اند.
- NOT_RUN/UNKNOWN/BLOCKED/FAIL در صورت required بودن در صورت کسر صفرند.
- گام optional از مخرج حذف می‌شود.
- عدد تا دو رقم اعشار و رو به پایین گرد شود.

## 2. ACCEPTANCE_PROGRESS
درصد معیارهای پذیرش required که validation_status=PASS و evidence معتبر دارند.
- از وزن‌های معتبر و versioned استفاده کن؛ در غیر این صورت criteria هم‌وزن‌اند.
- اگر معیارهای پذیرش هنوز تعریف نشده‌اند یا schema ناقص است، N/A گزارش کن؛ هرگز ۰ یا ۱۰۰ حدسی نساز.
- PASS بدون evidence معتبر پذیرفته نیست.

## 3. OVERALL_COMPLETION
برای یک Work Item:
- اگر EXECUTION_PROGRESS یا ACCEPTANCE_PROGRESS برابر N/A است: OVERALL_COMPLETION=N/A.
- در غیر این صورت: min(EXECUTION_PROGRESS, ACCEPTANCE_PROGRESS).
- فقط وقتی OVERALL_COMPLETION=100 و همه dependencyهای سخت ACCEPTED و هیچ blocker/approval gate باز نیست، وضعیت می‌تواند ACCEPTED شود.
- وضعیت ACCEPTED علاوه بر درصد، به تمام required steps و criteria نیاز دارد؛ درصد به‌تنهایی مجوز پذیرش نیست.

برای parent goal یا prompt:
- هر child leaf با وزن برنامه‌ریزی‌شده نسخه‌بندی‌شده تجمیع شود؛ اگر وزن وجود ندارد، leafها هم‌وزن‌اند.
- leafهای خارج از scope از مخرج حذف نشوند مگر scope change مصوب شده باشد.
- BLOCKED leaf در مخرج باقی می‌ماند و progress واقعی خود را حفظ می‌کند؛ blocker جدا گزارش می‌شود.
- cancelled/superseded فقط با دلیل و approval مستند از مخرج خارج شود.

## 4. قالب گزارش اجباری
هر checkpoint/status/report باید شامل موارد زیر باشد:
- TASK_ID, WORK_ITEM_ID, PROMPT_ID, EXP_ID, RUN_ID
- snapshot SHA/ref و زمان UTC
- EXECUTION_PROGRESS / ACCEPTANCE_PROGRESS / OVERALL_COMPLETION
- تعداد required steps: PASS / FAIL / BLOCKED / UNKNOWN / NOT_RUN
- تعداد required criteria با همین تفکیک
- completed outputs و evidence refs
- blockerها و اثر آن‌ها
- claim state، owner، chat_id، fencing token و lease expiry (یا NONE)
- branch و commit پایه/آخرین commit
- last verified step، current step، remaining step IDs
- next action دقیق و شرط ادامه

## 5. گزارش ۱۷ پرامپت و هدف کلان
داشبورد parent نباید درصد پرامپت‌ها را از تعداد Issueها یا claimها بسازد. محاسبه باید از leafهای canonical و criteria/steps تأییدشده انجام شود. هر prompt علاوه بر سه درصد باید تعداد leafهای total/ready/in_progress/blocked/accepted را نشان دهد.

## 6. اعتبارسنجی و ضدتقلب
- درصد دستی وارد نشود؛ از ledger/schema/Issue evidence محاسبه شود.
- claim موفق، branch ساخته‌شده، comment یا شروع اجرا progress نیست.
- گزارش فاقد evidence ref باید UNVERIFIED باشد.
- اگر تعداد/وزن criteria نامعلوم است، ACCEPTANCE_PROGRESS=N/A.
- هر تغییر وزن باید weighting.version جدید و دلیل داشته باشد؛ وزن گذشته را بی‌صدا بازنویسی نکن.
