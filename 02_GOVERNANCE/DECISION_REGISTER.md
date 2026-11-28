# دفتر تصمیم‌های مصوب

| ID | تصمیم | وضعیت | یادداشت |
|---|---|---|---|
| DEC-001 | دو حوزه اصلی: محصولات دیجیتال و خدمات هوشمند | مصوب | زیرساخت‌های پشتیبان حوزه سوم نیستند |
| DEC-002 | یک پنل یکپارچه با نمایش مبتنی بر مجوز | مصوب | منو ثابت؛ فضای کاری قابل تنظیم در حدود مجوز |
| DEC-003 | مدیر اصلی مرجع نهایی؛ مدیر ارشد در محدوده تفویض | مصوب | خارج از محدوده فقط پیشنهاد |
| DEC-004 | اشتراک داده بین دپارتمان‌ها بر اساس نیاز و مجوز | مصوب | دسترسی پیش‌فرض گسترده ممنوع |
| DEC-005 | حفظ تاریخچه و داده در تغییر نقش | مصوب | چرخه promotion/demotion باید آزموده شود |
| DEC-006 | پرداخت خودکار با تأیید سمت سرور | مصوب | browser redirect کافی نیست |
| DEC-007 | حریم خصوصی و نگهداری مشروط به قانون | مصوب به‌عنوان baseline | جزئیات حقوقی باید بازبینی شود |
| DEC-008 | میزبانی ارزان/اشتراکی اولویت دارد | ترجیح مصوب | قابلیت واقعی باید اثبات شود |
| DEC-009 | انتشار کم‌اختلال هدف است | هدف | تضمین صفرقطعی داده نشود |
| DEC-010 | قفل منابع بین چت‌ها لازم است | مصوب | قفل اتمیک CAS با fencing token |
| DEC-011 | مخزن کنترل‌پلین مستقل از مخزن محصول باشد | مصوب | `farast-control-plane` |
| DEC-012 | هر چت قبل از شروع زمینه و وضعیت مشترک را از GitHub بخواند | مصوب | فایل‌های مرجع و آخرین commit |
| DEC-013 | پرامپت‌ها مستقل و غیرخطی باشند | مصوب | شماره فقط شناسه است |
| DEC-014 | TASK_ID و checkpoint برای ادامه بین چت‌ها ثابت بماند | مصوب | شروع مجدد و duplicate ممنوع |
| DEC-015 | گزارش و بازخورد در GitHub ثبت شود | مصوب | پاسخ چت کوتاه و دارای لینک |
| DEC-016 | قفل اتمیک all-or-none برای RESOURCE_KEYS | مصوب طراحی | CAS branch `coordination/locks` |
| DEC-017 | هدف کلان تا معیار پذیرش و پیشرفت قابل ردیابی باشد | مصوب | progress فقط از evidence |

تصمیم جدید باید با ID یکتا، صاحب تصمیم، تاریخ، دلیل، شواهد، دامنه اثر، تصمیم جایگزین‌شده و تأیید صریح مالک ثبت شود. عامل حق ندارد پیشنهاد خود را DEC مصوب بنامد.


## ضمیمه ردیابی منبع و نتیجه تصمیم‌ها — snapshot 2026-11-25

> این ضمیمه append-only است. جدول اصلی DEC-001 تا DEC-017 و متن تصمیم‌های مصوب بدون تغییر حفظ شده‌اند. این بخش تصمیم تازه‌ای ایجاد نمی‌کند و فقط پیوندهای قابل اثبات را ثبت می‌کند.

### قاعده provenance

- تنها رکورد بازخورد ثبت‌شده در دفتر فعلی: `FB-20261114-001`.
- DEC-011 تا DEC-017 در همان رکورد به‌صراحت به‌عنوان خروجی آن بازخورد معرفی شده‌اند.
- برای DEC-001 تا DEC-010 هیچ `FB_ID` در دفتر فعلی ثبت نشده است؛ Source Feedback و نگاشت‌های ناموجود آن‌ها `UNMAPPED` است، نه اینکه نبود منبع در کل تاریخچه اثبات شده باشد.
- Goal Tree، CP-01 تا CP-08 را زیر G-09 قرار می‌دهد.
- Work Itemها فقط بر اساس فیلد دقیق `parent_cp_ids` در JSON همان Issue نگاشت شده‌اند. برای CP-01 هیچ leaf دارای `parent_cp_ids=["CP-01"]` در inventory بررسی‌شده پیدا نشد؛ برای آن WID حدس زده نشده است.

### ماتریس provenance و وضعیت اجرا

| DEC_ID | Source_FB_ID | Affected_CP_IDs | Affected_Goal_IDs | Affected_WORK_ITEM_IDs | Implementation_Status | Verification_Evidence |
|---|---|---|---|---|---|---|
| DEC-001 | UNMAPPED | UNMAPPED | UNMAPPED | UNMAPPED | UNKNOWN | هیچ FB_ID مرتبط در register ثبت نشده |
| DEC-002 | UNMAPPED | UNMAPPED | UNMAPPED | UNMAPPED | UNKNOWN | هیچ FB_ID مرتبط در register ثبت نشده |
| DEC-003 | UNMAPPED | UNMAPPED | UNMAPPED | UNMAPPED | UNKNOWN | هیچ FB_ID مرتبط در register ثبت نشده |
| DEC-004 | UNMAPPED | UNMAPPED | UNMAPPED | UNMAPPED | UNKNOWN | هیچ FB_ID مرتبط در register ثبت نشده |
| DEC-005 | UNMAPPED | UNMAPPED | UNMAPPED | UNMAPPED | UNKNOWN | هیچ FB_ID مرتبط در register ثبت نشده |
| DEC-006 | UNMAPPED | UNMAPPED | UNMAPPED | UNMAPPED | UNKNOWN | هیچ FB_ID مرتبط در register ثبت نشده |
| DEC-007 | UNMAPPED | UNMAPPED | UNMAPPED | UNMAPPED | UNKNOWN | هیچ FB_ID مرتبط در register ثبت نشده |
| DEC-008 | UNMAPPED | UNMAPPED | UNMAPPED | UNMAPPED | UNKNOWN | هیچ FB_ID مرتبط در register ثبت نشده |
| DEC-009 | UNMAPPED | UNMAPPED | UNMAPPED | UNMAPPED | UNKNOWN | هیچ FB_ID مرتبط در register ثبت نشده |
| DEC-010 | UNMAPPED | UNMAPPED | UNMAPPED | UNMAPPED | UNKNOWN | هیچ FB_ID مرتبط در register ثبت نشده |
| DEC-011 | FB-20261114-001 | CP-01 | G-09 | UNMAPPED | PARTIAL / WID_UNMAPPED | [PR #1](https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/1) merged؛ CP-01 leaf mapping در inventory یافت نشد |
| DEC-012 | FB-20261114-001 | CP-01 | G-09 | UNMAPPED | PARTIAL / WID_UNMAPPED | [PR #1](https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/1)؛ CP-01 leaf mapping در inventory یافت نشد |
| DEC-013 | FB-20261114-001 | CP-02 | G-09 | WI-COORDINATOR-STAGED-ACCEPTANCE-BOOTSTRAP-001 (#119); WI-NON-PER-REQUEST-AUTH-PROMPT-FIX-002 (#109); WI-BLOCKED-WORKITEM-REVALIDATION-001 (#107); WI-DOC-LOCK-PROMPT-CATALOG-SYNC-001 (#106); WI-LOCK-SCOPE-ISOLATION-001 (#100) | PARTIAL | [#119](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/119); [#109](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/109); [#107](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/107) REVIEW; [#106](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/106) BLOCKED; [#100](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/100) |
| DEC-014 | FB-20261114-001 | CP-04 | G-09 | WI-COORDINATOR-STAGED-ACCEPTANCE-BOOTSTRAP-001 (#119); WI-NON-PER-REQUEST-AUTH-PROMPT-FIX-002 (#109); WI-BLOCKED-WORKITEM-REVALIDATION-001 (#107); WI-DOC-LOCK-PROMPT-CATALOG-SYNC-001 (#106); WI-LOCK-SCOPE-ISOLATION-001 (#100) | PARTIAL | [#119](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/119); [#109](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/109); [#107](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/107) REVIEW; [#106](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/106) BLOCKED; [#100](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/100) |
| DEC-015 | FB-20261114-001 | CP-05;CP-06 | G-09 | WI-CP05-06-REPORT-FEEDBACK-TRACE-AUDIT-001 (#135); WI-CP05-REGISTER-SYNC-001 (#136); WI-CP06-FEEDBACK-TRACE-001 (#137) | IN_PROGRESS | [#135](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/135) DONE; [#136](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/136) REVIEW / [PR #138](https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/138); [#137](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/137) current RUN |
| DEC-016 | FB-20261114-001 | CP-03 | G-09 | WI-COORDINATOR-STAGED-ACCEPTANCE-BOOTSTRAP-001 (#119); WI-CP-BRANCH-RULESET-GATE-001 (#113); WI-CP-CROSSREPO-TOKEN-SCOPE-001 (#111); WI-NON-PER-REQUEST-AUTH-PROMPT-FIX-002 (#109); WI-BLOCKED-WORKITEM-REVALIDATION-001 (#107); WI-DOC-LOCK-PROMPT-CATALOG-SYNC-001 (#106); WI-LOCK-SCOPE-ISOLATION-001 (#100) | PARTIAL | [#119](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/119); [#113](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/113); [#111](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/111); [#109](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/109); [#107](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/107) REVIEW; [#106](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/106) BLOCKED; [#100](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/100) |
| DEC-017 | FB-20261114-001 | CP-07 | G-09 | WI-CP07-GOAL-PROGRESS-AGGREGATION-001 (#128); WI-CP07-PARENT-AGGREGATION-ENGINE-001 (#130); WI-CP07-AGGREGATION-CI-COVERAGE-001 (#133) | BLOCKED | [#128](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/128) BLOCKED; [#130](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/130) has unresolved AC_TEST_COVERAGE (83.33%) despite stale READY label; [#133](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/133) REVIEW; [PR #132](https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/132) and [PR #134](https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/134) open/unmerged |

### وضعیت کلی FB-20261114-001

- Owner decision: ACCEPTED (طبق متن اصلی مالک؛ متن اصلی بدون تغییر باقی مانده است).
- Implementation status: IN_PROGRESS / PARTIAL؛ پذیرش بازخورد به معنی تکمیل همه CPها نیست.
- Approval evidence: خود پیام owner-authored ثبت‌شده در FB؛ approval artifact مستقل دیگری در منابع بررسی‌شده ثبت نشده است.
- Verification evidence: [ممیزی CP-05/06 در #135](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/135#issuecomment-7153527064)، [PR #138 برای CP-05](https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/138)، و [Issue #137 برای CP-06](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/137).
- این ضمیمه وضعیت‌های جاری را در زمان snapshot ثبت می‌کند؛ هر تغییر بعدی باید با timestamp و evidence جدید append شود.
