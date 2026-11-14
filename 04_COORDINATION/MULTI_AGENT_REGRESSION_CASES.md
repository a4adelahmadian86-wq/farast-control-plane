# آزمون‌های رگرسیون هماهنگی چندعامل

هر مورد باید با دو حساب GitHub مستقل و چت‌های مستقل اجرا شود؛ آزمون یک‌حسابی فقط بخشی از رفتار را پوشش می‌دهد.

| ID | سناریو | انتظار |
|---|---|---|
| COORD-01 | دو عامل هم‌زمان یک RESOURCE_KEY را acquire می‌کنند | فقط یک CAS موفق؛ دیگری reload و lock را رد کند |
| COORD-02 | دو عامل مجموعه منابع هم‌پوشان می‌خواهند | تمام مجموعه به‌صورت all-or-none گرفته شود؛ lock جزئی ممنوع |
| COORD-03 | دو عامل منابع مستقل می‌خواهند | هر دو می‌توانند lock جدا بگیرند |
| COORD-04 | عامل اول lease را heartbeat می‌کند | expiry با CAS تمدید شود و fencing token ثابت بماند |
| COORD-05 | lease منقضی و عامل جدید acquire می‌کند | fencing token جدید؛ عامل قدیمی stale و ممنوع‌النوشتن |
| COORD-06 | عامل قدیمی بعد از acquire جدید release می‌زند | token mismatch؛ lock عامل جدید حفظ شود |
| COORD-07 | دو عامل هم‌زمان روی یک revision CAS می‌زنند | یک برنده؛ بازنده reload/retry، نه overwrite |
| COORD-08 | ابزار Git Data write در حساب چت وجود ندارد | فقط read-only؛ هیچ ادعای lock |
| COORD-09 | چت در میانه کار قطع می‌شود | همان TASK_ID و checkpoint بازیابی شود؛ lease تا expiry باقی بماند |
| COORD-10 | پرامپت مشابه پس از تکمیل دوباره ارسال می‌شود | TASK موجود پیدا شود؛ duplicate ایجاد نشود |
| COORD-11 | بازخورد مالک در یک حساب ثبت می‌شود | حساب دیگر متن/شناسه/وضعیت را از رجیستر بخواند |
| COORD-12 | یک PR با منابع قفل‌شده عامل دیگر باز است | عامل دوم از نوشتن همان منابع منع شود |
| COORD-13 | lock branch یا registry unavailable است | STOP WRITES؛ no fallback to cooperative guessing |
| COORD-14 | چت ابزار نوشتن ندارد اما کار تحلیلی دارد | تحلیل read-only ادامه یابد و گزارش محدودیت ثبت شود |
| COORD-15 | عامل در TASK مستقل می‌تواند موازی کار کند | بی‌دلیل منتظر شماره PR یا EXP دیگر نماند |

## معیار عبور
- COORD-01,02,05,06,07 باید با شواهد واقعی CAS و دو هویت مستقل PASS شوند.
- COORD-08,13 باید رفتار fail-closed را اثبات کنند.
- هیچ تستی فقط به‌دلیل وجود workflow یا فایل PASS محسوب نمی‌شود.
- نتایج هر آزمون با تاریخ UTC، repo commit، دو TASK/RUN ID و evidence ثبت شود.


## رگرسیون هدف‌های خرد و resume
| ID | سناریو | انتظار |
|---|---|---|
| WI-01 | دو چت هم‌زمان یک WORK_ITEM_ID را claim می‌کنند | فقط یک claim موفق؛ دیگری برگ آزاد بعدی را انتخاب کند |
| WI-02 | دو WORK_ITEM_ID مستقل و منابع disjoint | هر دو هم‌زمان قابل اجرا باشند |
| WI-03 | child dependency به parent ناتمام وابسته است | child تا ACCEPTED شدن parent انتخاب/پذیرفته نشود |
| WI-04 | ۸ از ۱۰ step با evidence معتبر PASS شده | progress دقیقاً ۸۰٪؛ status هرگز ACCEPTED نیست |
| WI-05 | worker قدیمی پس از takeover step ثبت می‌کند | fencing token قدیمی رد شود و state تغییر نکند |
| WI-06 | interruption بعد از چند step تأییدشده | همان WORK_ITEM_ID resume شود؛ verified stepها تکرار نشوند |
| WI-07 | دو چت برای منابع مشترک و متفاوت | مشترک فقط یک claim؛ disjoint هر دو claim |
| WI-08 | priority برابر و زمان ready متفاوت | FIFO پایدار و aging بدون تغییر priority مالک |
| WI-09 | step بدون evidence یا با نتیجه UNKNOWN | پیشرفت افزایش نیابد و step verified نشود |
| WI-10 | acceptance criterion اجباری ناقص | ACCEPTED ممنوع بماند حتی اگر progress=100% باشد |
| WI-11 | checkpoint با lease معتبر | completed/remaining step IDs و NEXT_ACTION دقیق ثبت شوند |
| WI-12 | checkpoint یا step با token قدیمی | fail-closed؛ هیچ تغییر در رجیستری |

این موارد باید ابتدا در fixture و سپس در آزمون واقعی دو حساب مستقل ثبت شوند؛ fixture به‌تنهایی E2E محسوب نمی‌شود.
