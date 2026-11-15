# استاندارد عمق Work Item در FARAST

نسخه: 2.0.0

## هدف
این استاندارد تضمین می‌کند ۲۷ مأموریت اجراییِ زیر ۱۷ پرامپت، کار واقعی و مستقل باشند؛ نه یک عنوان کلی یا چند bullet سطحی.

## معیار ورود به READY
هر leaf باید همه موارد زیر را داشته باشد:
1. شناسه پایدار WORK_ITEM_ID و یک Issue مستقل؛
2. parent goal، parent prompt و parent EXP؛
3. مسئله، هدف، دامنه داخل/خارج و خروجی قابل تحویل؛
4. target_repository، write_policy، resource_keys و dependencyهای واقعی؛
5. effort estimate هدف ۲۰ تا ۳۰ دقیقه و rationale؛
6. حداقل ۶ گام substantive و مرتب، هرکدام با expected_output و evidence_requirement؛
7. حداقل ۴ معیار پذیرش مستقل و قابل آزمون؛
8. حداقل ۳ deliverable مشخص؛
9. حداقل ۲ نوع evidence مناسب دامنه؛
10. cross-check مستقل، unknowns، ریسک، rollback/stop condition و NEXT_ACTION.

اگر یکی از موارد لازم ناقص است، وضعیت READY مجاز نیست؛ از BACKLOG/NEEDS_DECOMPOSITION استفاده کن یا blocker را ثبت کن.

## تعریف گام substantive
گام substantive باید:
- یک فعالیت شناختی/فنی مشخص انجام دهد؛
- ورودی و روش قابل فهم داشته باشد؛
- خروجی قابل بازبینی تولید کند؛
- معیار PASS/FAIL/UNKNOWN داشته باشد؛
- به evidence ref قابل بازبینی متصل شود.

مواردی مانند «بررسی کن»، «گزارش بده» یا «همه‌چیز را اعتبارسنجی کن» بدون دامنه و خروجی، گام substantive محسوب نمی‌شوند.

## بودجه زمانی
- target_effort_minutes: 20–30 برای یک برگ تخصصی.
- این مقدار effort هدف است، نه الزام به مکث یا طولانی‌کردن مصنوعی.
- اگر کار به علت blocker قابل ادامه نیست، فعالیت‌های مستقل read-only را انجام بده و زمان صرف‌شده/کار واقعی را گزارش کن.
- اگر دامنه بیش از ۳۰ دقیقه است، با allocator به برگ‌های مستقل‌تر تقسیم شود؛ اگر کمتر است، آن را مصنوعی بزرگ نکن.

## قاعده پذیرش
- PASS هر گام/criterion فقط با evidence_refs معتبر.
- ادعای عامل، متن چت، تعداد commit و تعداد فایل evidence محسوب نمی‌شود.
- NOT_RUN، UNKNOWN، BLOCKED و FAIL از PASS متمایز بمانند.
- تمام گام‌های required و criteria required باید PASS باشند و dependencyهای سخت ACCEPTED باشند تا Work Item ACCEPTED شود.
- ۸۰٪ یا ۹۹٪ پیشرفت هرگز پذیرش نیست.

## جلوگیری از تجزیه افراطی
گام‌ها را صرفاً برای افزایش تعداد زیاد نکن. یک گام زمانی به child Work Item تبدیل شود که مالکیت، خروجی، evidence، dependency و ارزش مستقل داشته باشد و بتواند بدون تغییر resourceهای دیگری اجرا شود. در غیر این صورت، همان گام در Work Item والد باقی بماند.

## کنترل چندچتی
- Issue leaf واحد برای هر کار معنایی؛ عدم duplicate با جست‌وجوی باز و بسته.
- هر چت فقط یک leaf را claim می‌کند.
- resource_keys مشترک مانع اجرای موازی هستند.
- Issue والد فقط ظرف تجمیع است و claim نمی‌شود.
- resume همان WORK_ITEM_ID و step IDs را حفظ می‌کند؛ RUN_ID و fencing token تازه می‌گیرد.
