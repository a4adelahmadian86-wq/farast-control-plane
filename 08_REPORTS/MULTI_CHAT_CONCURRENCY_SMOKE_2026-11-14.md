# گزارش شواهد آزمون هماهنگ‌کننده چندچتی — 2026-11-14

## دامنه و مرجع
- مخزن: `a4adelahmadian86-wq/farast-control-plane`
- شاخه: `main`
- commit آزموده‌شده: `8c9d9f160b6294cdfd0d4395e607806b444d4f77`
- PR زیرساخت: [PR #1](https://github.com/a4adelahmadian86-wq/farast-control-plane/pull/1) — ادغام‌شده
- اعتبارسنجی CI روی main: [Run 43621164160](https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43621164160) — موفق

## 1. آزمون‌های خودکار CI
نتیجه اجرای واقعی job اعتبارسنجی:
- `coordinator-core.test.js`: **14/14 PASS**
- `work-item-core.test.js`: **20/20 PASS**
- بررسی فایل‌های ضروری، YAML و syntax جاوااسکریپت workflow: PASS
- اعتبارسنجی JSON/schema و قراردادهای prompt bootstrap: PASS

این آزمون‌ها منطق هسته، تعارض منبع، منابع مستقل، claim چندمنبعی all-or-none، lease و fencing، heartbeat، lineage، مجوزها، progress، evidence، dependency و resume را پوشش می‌دهند. این fixtureها به‌تنهایی آزمون دو حساب مستقل نیستند.

## 2. آزمون زنده از مسیر GitHub Actions
سه Work Item آزمایشی غیرحساس در خود مخزن کنترل‌پلین استفاده شدند. فرمان‌ها از Issue comment عبور کردند و پاسخ‌ها را GitHub Actions تولید کرد:

| مورد | شاهد | نتیجه |
|---|---|---|
| منبع مشترک — A | [Issue #7: claim grant](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/7#issuecomment-6881366706) | `CLAIM GRANTED` برای `module:shared-resource-smoke`؛ fencing token برابر 51 |
| همان منبع — B | [Issue #8: conflict](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/8#issuecomment-6881367075) | claim رد شد؛ پاسخ، Issue #7 و مالک lease را به‌عنوان تعارض گزارش کرد |
| منبع مستقل — C | [Issue #9: claim grant](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/9#issuecomment-6881367486) | `CLAIM GRANTED` برای `module:independent-resource-smoke`؛ fencing token برابر 52 |

دو claim موفق A و C در بازه زمانی هم‌پوشان فعال بودند؛ در عین حال B برای منبع مشترک رد شد. این نتیجه از مسیر واقعی Issue comment و workflow مرکزی به دست آمده، نه صرفاً از unit test.

هر دو lease آزمایشی با فرمان block معتبر آزاد شدند:
- [آزادسازی A](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/7#issuecomment-6881384939)
- [آزادسازی C](https://github.com/a4adelahmadian86-wq/farast-control-plane/issues/9#issuecomment-6881385369)

## 3. مرز دقیق آنچه اثبات شده است
**اثبات‌شده:**
- workflow فرمانی روی `main` فعال است و runهای زنده آن موفق بوده‌اند.
- رجیستری مرکزی در مسیر workflow فرمان‌های claim را پردازش می‌کند.
- دو Work Item با resource key مستقل می‌توانند leaseهای هم‌پوشان داشته باشند.
- دو Work Item با resource key مشترک نمی‌توانند هم‌زمان همان منبع را claim کنند.
- release/block با actor، chat، run و token منطبق انجام شده است.

**اثبات‌نشده / NOT RUN:**
- رقابت واقعی دو حساب GitHub مستقل در دو نشست ChatGPT مستقل.
- takeover پس از قطع واقعی یکی از نشست‌ها، expiry در محیط چندحسابی و رد write/heartbeat عامل قدیمی پس از takeover.
- اعمال و read-back قواعد branch protection/ruleset روی مخزن محصول.
- hard-fencing تمام pushها و mergeها در مخزن محصول؛ workflow کنترل‌پلین به‌تنهایی همه مسیرهای write مستقیم GitHub را رهگیری نمی‌کند.

مقادیر `CHAT_ID` و `RUN_ID` در این آزمون شناسه‌های metadata خوداظهاری بودند. سه alias متفاوت به معنی سه حساب GitHub یا سه نشست ChatGPT مستقل نیستند. آزمون زنده بالا با همان actor GitHub یعنی `a4adelahmadian86-wq` انجام شد.

## 4. نتیجه آمادگی
**وضعیت: SINGLE-ACCOUNT LIVE SMOKE PASS — MULTI-ACCOUNT E2E NOT VERIFIED**

زیرساخت و آزمون‌های تک‌حسابی زنده آماده‌اند؛ اما اعلام آمادگی کامل چندحسابی/چندچتی تا اجرای آزمون سطح ۳ با حداقل دو حساب GitHub مستقل و دو نشست ChatGPT جداگانه مجاز نیست.

## 5. ملاحظات امنیتی
مخزن کنترل‌پلین در زمان این گزارش Public است. فقط داده غیرمحرمانه و aliasهای غیرشخصی در Issueها ثبت شوند. هیچ secret، token، credential، PII یا داده مشتری در مخزن/Issue/کامنت قرار نگیرد.
