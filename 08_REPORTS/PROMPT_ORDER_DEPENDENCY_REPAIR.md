# گزارش اصلاح اولویت و گیت‌های وابستگی FARAST

تاریخ: 2026-11-17  
Work Item: [#59 — WI-PROMPT-ORDER-DEPENDENCY-REPAIR-001](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/59)

## خروجی‌های اصلی

- ترتیب تأییدشده مالک PR-01 تا PR-17 در `05_PROMPT_LIBRARY/OWNER_APPROVED_PROMPT_PRIORITY_ORDER.md` ثبت شد. این ترتیب اولویت برنامه‌ریزی است، نه زنجیره وابستگی یا اجرای اجباری.
- EXP-01 از EXP-22 مستقل شد: `hard_gates=[]` و EXP-22 فقط `soft_input` است.
- PR-01، فهرست کتابخانه و Bundle با این قرارداد همگام شدند.
- Work Item core اکنون گیت‌های سخت canonical را ارزیابی می‌کند: گیت EXP باید دقیقاً یک Work Item منطبق داشته و ACCEPTED باشد؛ گیت عملیاتی فاقد مدل شواهد صریح یا گیت حل‌نشده fail-closed می‌شود؛ soft_inputs هرگز مسدودکننده نیستند.
- Coordinator در refresh، claim، unblock/reopen و accept گیت‌های سخت را بررسی می‌کند و نمی‌تواند Work Item مسدود را READY کند.
- آزمون‌های regression برای استقلال EXP-01، گیت ACCEPTED/غیر ACCEPTED، گیت نامعلوم، soft inputs و انتخاب Work Item اضافه شدند.

## PR و آزمون

- PR اولیه [#60](https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/60) از main ساخته شد و CI آن در [Actions #44053069096](https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/44053069096) موفق بود.
- تلاش اولیه پذیرش خودکار PR #60 در [Actions #44054165681](https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/44054165681) به دلیل نقص قدیمی Coordinator شکست خورد: `github.paginate(checks.listForRef)` آرایه برمی‌گرداند، اما کد به اشتباه `checkRuns.data.check_runs` را می‌خواند.
- این PR اصلاح‌شده همان زنجیره تغییرات PR #60 را حفظ می‌کند و خواندن آرایه Check Run را اصلاح می‌کند؛ یک assertion در CI اضافه شده تا این خطا دوباره وارد main نشود. پذیرش نهایی فقط پس از CI دقیق head و read-back نتیجه انجام می‌شود.

## PRهای تاریخی

- PR #42: باز، diverged، 56 commit جلو و 18 commit عقب نسبت به main؛ GitHub آن را dirty گزارش کرده است.
- PR #45: باز، diverged، 49 commit جلو و 17 commit عقب نسبت به main؛ GitHub آن را dirty گزارش کرده است.
- PR #46: بسته و در شاخه PR #45 ادغام شده، نه در main.
- PR #42 و #45 بدون بررسی کامل محتوای منحصربه‌فرد force-update یا بسته نشدند تا کار معتبر از بین نرود. وضعیت تعارض و نیاز به بازپایه‌گذاری امن در Issue #59 ثبت شده است.

## مرزهای ایمنی

هیچ فایل، شاخه، داده، CI setting یا deployment در مخزن محصول `a4adelahmadian86-wq/non` تغییر نکرده است؛ سیاست READ_ONLY حفظ شد. هیچ بازبین انسانی دوم شرط پذیرش نیست. اقداماتی که سیاست/قانون برایشان تأیید خود مالک را لازم می‌کند همچنان مستثنا هستند.
