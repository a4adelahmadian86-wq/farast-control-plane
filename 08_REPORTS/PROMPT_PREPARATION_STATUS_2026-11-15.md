# گزارش آماده‌سازی ساختار ۱۷×۲۷ FARAST

تاریخ: 2026-11-15  
شاخه اجرا: work/GH-11-RUN-20261115-PROMPT-PREP-01  
Work Item مالک تغییرات: WI-GOAL-ALLOCATOR-001 / Issue #11  
Claim: RUN-20261115-PROMPT-PREP-01، fencing token 58  
مخزن هدف: a4adelahmadian86-wq/farast-control-plane

## ساختار تحویل
- یک هدف کلان G-00.
- ۱۷ پرامپت تخصصی مستقل PR-01 تا PR-17؛ MASTER-00 فقط هماهنگ‌کننده است و جزو ۱۷ پرامپت نیست.
- ۲۷ مأموریت عمیق EXP-01 تا EXP-27.
- هر EXP: هفت گام substantive، حداقل چهار معیار پذیرش، حداقل سه deliverable، evidence requirement و effort هدف ۲۵ دقیقه.
- زمان ۲۰–۳۰ دقیقه effort هدف است، نه الزام به اتلاف زمان.

## اجزای تحویل
| بخش | وضعیت |
|---|---|
| نگاشت ۱۷ پرامپت به ۲۷ EXP | تکمیل؛ هر EXP دامنه، مراحل و خروجی تخصصی دارد |
| MASTER-00 و ۱۷ پرامپت مستقل | قرارداد عمق و پیشرفت در ۱۸/۱۸ فایل درج شده |
| bundle تجمیعی | نسخه 1.9.0؛ از ۱۸ منبع واقعی بازسازی و همگام شده |
| Work Item Schema | effort، depth_profile، deliverables، step evidence و acceptance weighting |
| Checkpoint Schema | سه درصد، نسخه محاسبه و شمارنده‌های گام/معیار |
| Progress engine | محاسبه واقعی سه درصد در work-item-core |
| Coordinator | گزارش سه درصد در progress/step/criterion/checkpoint؛ refresh امن فقط برای OWNER |
| Depth enforcement | اگر depth_profile موجود باشد، core حداقل عمق، effort و evidence را validate می‌کند |
| Issue Template و CI | فرم ایجاد Work Item عمیق و آزمون‌های schema، prompt، چندچتی، progress و refresh |

## وضعیت ۲۷ Issue
Read-back زنده نشان داد **۲۷/۲۷ Issue از #13 تا #39** دارای:
- ۷ گام اجرایی با expected_output و evidence_requirement؛
- حداقل ۴ معیار پذیرش با evidence_requirement؛
- حداقل ۳ deliverable با evidence_requirement؛
- effort_estimate_minutes=25 و depth_profile نسخه 2.0.0.

Issueهای #14 تا #39 در registry هنوز ذخیره نشده‌اند؛ هنگام اولین claim، JSON عمیق را از Issue body می‌خوانند.

### همگام‌سازی registry برای Issue #13
Issue #13 هنگام lease فعال دست‌نخورده ماند و پس از انقضای lease، body/JSON آن به عمق جدید ارتقا یافت. رجیستری مرکزی هنوز نسخه قبلی چهارمرحله‌ای را نگه می‌دارد. فرمان /farast refresh برای همگام‌سازی امن در همین PR پیاده شده، اما تا merge شدن PR #42 روی main فعال نیست. پس از merge، مالک باید /farast refresh را روی Issue #13 اجرا کند؛ این کار progress را به‌صورت خودکار از گام‌ها و معیارهای جدید محاسبه می‌کند. تا آن زمان registry13Steps=4 و Issue body=7 steps است.

## اعتبارسنجی
- بررسی زنده ۲۷/۲۷ Issue: همه ۲۷ مورد با عمق و evidence requirement معتبر.
- CI run #867 روی head commit 7c008e00a0f66a6850525653c4ef07505c4f8906 موفق شد؛ تمام مراحل validate، contention/fencing، progress/resume، JSON/schema و prompt bootstrap PASS شدند.
- پس از آخرین تغییرات گزارش و command refresh، اجرای CI مجدد روی head نهایی PR لازم است.
- آزمون end-to-end واقعی دو حساب مستقل و دو نشست مستقل انجام نشده؛ چندحسابی VERIFIED اعلام نمی‌شود.

## مرز ایمنی
- هیچ فایل، branch، PR، داده یا محیطی در مخزن محصول a4adelahmadian86-wq/non تغییر نکرد.
- هیچ merge، deploy، migration یا تغییر داده عملیاتی انجام نشده است.
- PR #42 باز و merge نشده و review مستقل هنوز ثبت نشده است.

## یادداشت فرایندی
یک فایل گزارش وضعیت در commit جداگانه 2cffae4 به‌اشتباه مستقیماً روی main ایجاد شد؛ این commit فقط شامل سند گزارش است و هیچ کد اجرایی یا داده محصولی را تغییر نداده است. نسخه نهایی و اصلاح‌شده همین گزارش نیز در این PR قرار دارد تا تغییر مستندات در بازبینی نهایی دیده شود.
