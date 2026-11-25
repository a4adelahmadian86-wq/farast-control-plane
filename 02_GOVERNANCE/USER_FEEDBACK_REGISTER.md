# دفتر بازخورد مالک محصول

## قواعد
- هر بازخورد یک شناسه `FB-YYYYMMDD-NNN` دارد.
- متن اصلی بازخورد عیناً حفظ شود؛ تفسیر در فیلد جدا باشد.
- هر بازخورد به تصمیم‌ها، اهداف، نیازمندی‌ها و TASKهای متأثر لینک شود.
- وضعیت‌ها: RECEIVED, ANALYZING, ACCEPTED, REJECTED, IMPLEMENTED, VERIFIED.
- بازخورد متناقض، سابقه قبلی را پاک نمی‌کند؛ تصمیم جدید با ارجاع ثبت می‌شود.
- هر چت باید آخرین بازخورد ثبت‌شده را قبل از تصمیم مرتبط بخواند.

## FB-20261114-001 — الزامات اجرای چندچتی و کتابخانه پرامپت

**منبع:** پیام مستقیم مالک محصول در ۱۴ نوامبر ۲۰۲۶.  
**وضعیت:** ACCEPTED؛ به نیازمندی‌های CP-01 تا CP-08 و تصمیم‌های DEC-011 تا DEC-017 تبدیل شده است.

### متن اصلی مالک (عیناً)

1. من می خواهم این پرامت ها را در چت های مختلف و حساب کاربری های مختلف در چت جی بی تی ارسال کنم. پس نباید هربار آنها بروند از اول کار را شروع کنند. باید زیرساختی در گیت هاب جدا از سایت اصلی داشته باشیم که هرکاری می کنند دقیق آنجا گزارش کنند و اگر من بازخورد دادم آن را هم ثبت کنند تا دیگر نیازی به حدس زدن نباشد و وقت زیادی برای بررسی اطلاعات توسط چت ها نرود. همچنین از موازی کاری جلوگیری شود این نکته خیلی مهم است
2. پرامت ها نباید تقدم یا تاخر زمانی داشته باشند و از لحاظ ترتیب اجرا مهم باشد تا من هرکدام از آنها را هرجوری که خواستم بدهم تا بتوان چند تا کار را همزمان انجام داد
3. چتها باید بدانند که سایر کارمندان هم همزمان در حال کار هستند و نباید کار آنها را با خود قاطی کنند یا اختلالی در کاریکدیگر ایجاد کنند
4. ممکن است یک پرامت در اجرا به محدودیت بخورد یا قطع شود و یا من تشخیص دهم که باید ادامه دهد در هر صورت وقتی گفتم ادامه بده یا همان پرامت را به چت دیگری دادم باید بفهد که ادامه دهد نه اینکه از نو بسازد و موازی کاری کند
5. تو باید فرض کنی که آن پرامت را قرار است به کس بدهم که هیچ چیزی نمی داند. پس نیاز است همه مواردی که در شناخت مسئله و نیاز دریافت کرده ای و مسیر را بداند پس یک مورد را هم آماده کن که ابتدا یا انتهای هر پرامت اضافه کنم (به طور ثابت) تا دقیق همه موارد لازم را بداند و آن را خودت در گیت هاب بذار و بجای اینکه من دستی اضافه کنم در پرامتت جوری بنویس که اول برود آن را بخواند و بفهمد و ادامه دهد
6. بعد از اینکه پرامت را می دهم دقیقا باید بداند چکار کند و از من هیچ چیزی نپرسد. نیاز نیست در چت به من گزارش دهد و گزارش نویسی را باید دقیق در گیت هاب انجام دهد تا بقیه بدانند تمرکز را باید روی کار و هدف اصلی بگذارد. راستی فکر می کنم یک زیر ساخت برای گزارش دهی در گیت هاب شاید ناقص داریم این را بررسی کن و تصمیم مناسب را بگیر
7. انگار باید نیاز و مسئله اصلی و نقشه راه هدف نهایی و گام های رسیدن به آن و ورک فلو آن را کامل در گیت داشته باشیم تا دقیقا بدانند باید چکار کنند چه کارهایی انجام شده کجای مسیر هستیم چقدر تا هدف فاصله داریم تیک انجام چه کارهایی خورده و وضعیت هرکدام چطور است و....

### اثر و پیگیری
- نیازمندی‌های CP: `00_PROJECT_FOUNDATION/CONTROL_PLANE_REQUIREMENTS.md`
- تصمیم‌ها: DEC-011 تا DEC-017
- شواهد: PR https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/1
- باقی‌مانده: خصوصی‌سازی، merge PR، branch protection، دسترسی حساب‌ها و آزمون رقابتی چندحسابی.

## ضمیمه ردیابی بازخورد تا هدف، تصمیم و نتیجه — snapshot 2026-11-25

> این ضمیمه append-only است. متن هفت‌بندی اصلی بالا، شناسه، منبع و وضعیت ACCEPTED تغییر نکرده است. این جدول فقط پیوندهای قابل اثبات را ثبت می‌کند؛ وضعیت ACCEPTED بازخورد به معنی تکمیل همه پیاده‌سازی‌ها نیست.

### شناسه‌ها و وضعیت canonical

- FB_ID: `FB-20261114-001`
- SOURCE: پیام مستقیم مالک محصول در ۱۴ نوامبر ۲۰۲۶؛ شواهد زیرساختی اولیه PR #1.
- RECEIVED_AT_UTC: `2026-11-14` (زمان دقیق ساعت در این register ثبت نشده است).
- OWNER_DECISION: `ACCEPTED` (طبق ثبت صریح منبع؛ approval artifact مستقل دیگری در منابع بررسی‌شده وجود ندارد).
- AFFECTED_GOAL_IDS: `G-09`.
- AFFECTED_CP_IDS: `CP-01, CP-02, CP-03, CP-04, CP-05, CP-06, CP-07, CP-08`.
- RELATED_REQUIREMENT_IDS: `CP-01` تا `CP-08`؛ این‌ها شناسه‌های نیازمندی کنترل‌پلین در CONTROL_PLANE_REQUIREMENTS.md هستند، نه REQ-IDهای جداگانه.
- RELATED_DECISION_IDS: `DEC-011` تا `DEC-017`.
- IMPLEMENTATION_STATUS: `IN_PROGRESS / PARTIAL`; پذیرش بازخورد، پذیرش نهایی همه CPها را اثبات نمی‌کند.
- APPROVAL_EVIDENCE: متن اصلی owner-authored همین رکورد؛ امضای دیجیتال یا approval artifact مستقل ثبت نشده است.

### نگاشت دقیق CP به Work Itemهای canonical

فقط Work Itemهایی فهرست شده‌اند که فیلد `parent_cp_ids` در JSON همان Issue، CP مربوط را صریحاً نشان می‌دهد. برای CP-01 شناسه برگ مستقل قابل اثبات پیدا نشد؛ بنابراین UNMAPPED باقی می‌ماند.

| CP_ID | AFFECTED_WORK_ITEM_IDS | وضعیت شواهد در snapshot |
|---|---|---|
| CP-01 | UNMAPPED | PR #1 ادغام شده؛ leaf با parent_cp_ids=CP-01 در inventory بررسی‌شده یافت نشد |
| CP-02 | `WI-COORDINATOR-STAGED-ACCEPTANCE-BOOTSTRAP-001` (#119); `WI-NON-PER-REQUEST-AUTH-PROMPT-FIX-002` (#109); `WI-BLOCKED-WORKITEM-REVALIDATION-001` (#107); `WI-DOC-LOCK-PROMPT-CATALOG-SYNC-001` (#106); `WI-LOCK-SCOPE-ISOLATION-001` (#100) | #119/#109/#100 DONE؛ #107 REVIEW؛ #106 BLOCKED |
| CP-03 | `WI-COORDINATOR-STAGED-ACCEPTANCE-BOOTSTRAP-001` (#119); `WI-CP-BRANCH-RULESET-GATE-001` (#113); `WI-CP-CROSSREPO-TOKEN-SCOPE-001` (#111); `WI-NON-PER-REQUEST-AUTH-PROMPT-FIX-002` (#109); `WI-BLOCKED-WORKITEM-REVALIDATION-001` (#107); `WI-DOC-LOCK-PROMPT-CATALOG-SYNC-001` (#106); `WI-LOCK-SCOPE-ISOLATION-001` (#100) | #119/#113/#111/#109/#100 DONE؛ #107 REVIEW؛ #106 BLOCKED |
| CP-04 | `WI-COORDINATOR-STAGED-ACCEPTANCE-BOOTSTRAP-001` (#119); `WI-NON-PER-REQUEST-AUTH-PROMPT-FIX-002` (#109); `WI-BLOCKED-WORKITEM-REVALIDATION-001` (#107); `WI-DOC-LOCK-PROMPT-CATALOG-SYNC-001` (#106); `WI-LOCK-SCOPE-ISOLATION-001` (#100) | #119/#109/#100 DONE؛ #107 REVIEW؛ #106 BLOCKED |
| CP-05 | `WI-CP05-06-REPORT-FEEDBACK-TRACE-AUDIT-001` (#135); `WI-CP05-REGISTER-SYNC-001` (#136) | #135 DONE؛ #136 REVIEW با PR #138 |
| CP-06 | `WI-CP05-06-REPORT-FEEDBACK-TRACE-AUDIT-001` (#135); `WI-CP06-FEEDBACK-TRACE-001` (#137) | #135 DONE؛ #137 در حال اجرا |
| CP-07 | `WI-CP07-GOAL-PROGRESS-AGGREGATION-001` (#128); `WI-CP07-PARENT-AGGREGATION-ENGINE-001` (#130); `WI-CP07-AGGREGATION-CI-COVERAGE-001` (#133) | #128 BLOCKED؛ #130 در 83.33% و منتظر آزمون exact-head؛ #133 REVIEW |
| CP-08 | `WI-NON-PER-REQUEST-AUTH-PROMPT-FIX-002` (#109) | #109 DONE |

### نگاشت هفت بخش بازخورد به خروجی‌ها

1. زمینه مشترک، گزارش GitHub و جلوگیری از تکرار → CP-01/CP-05/CP-06؛ DEC-011/012/015.
2. استقلال و اجرای موازی پرامپت‌ها → CP-02/CP-03؛ DEC-013/016.
3. جداسازی عامل‌های هم‌زمان → CP-03؛ DEC-016.
4. ادامه از checkpoint بدون ساخت کار تکراری → CP-04؛ DEC-014.
5. سربرگ ثابت و قابل استفاده برای عامل تازه‌کار → CP-01/CP-08؛ DEC-011/012؛ CP-08 WID #109؛ CP-01 WID برابر UNMAPPED.
6. اجرای دقیق، ثبت گزارش و حداقل سؤال از مالک → CP-05/CP-06/CP-08؛ DEC-015؛ WIDهای #135/#136/#137/#109.
7. درخت هدف و پیشرفت مبتنی بر شواهد → CP-07؛ DEC-017؛ WIDهای #128/#130/#133.

### Verification evidence

- ممیزی CP-05/CP-06: https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/135#issuecomment-7153527064
- CP-05 register sync و PR باز: https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/136 و https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/138
- CP-06 اجرای traceability: https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/137
- CP-07 گزارش وضعیت: https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/128

### محدودیت‌ها و unknowns

- فقط یک FB record در register فعلی مشاهده شد؛ نبود رکورد دیگر در تمام تاریخچه یا سامانه‌های بیرونی اثبات نشده است.
- DEC-001 تا DEC-010 در register فعلی FB_ID ندارند؛ منبع آن‌ها UNMAPPED است و به FB-20261114-001 منتسب نمی‌شوند.
- CP-01 برگ اجرایی canonical قابل اثبات ندارد؛ برای آن WID حدس زده نشده است.
- نگاشت‌های بالا snapshot زمان‌دارند؛ تغییر بعدی باید با snapshot و evidence جدید append شود.
