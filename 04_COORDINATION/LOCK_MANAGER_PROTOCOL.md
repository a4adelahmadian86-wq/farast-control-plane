# پروتکل قفل منابع — مرجع طراحی و انتقال به هماهنگ‌کننده تک‌نویسنده

> تغییر عملیاتی مهم: الگوریتم direct-CAS پایین‌تر، روش تاریخی/تشخیصی است و دیگر مجوز نوشتن برای چت‌های worker نیست. فقط workflow مرکزی farast-coordinator.yml مالک نوشتن ACTIVE_LOCKS.json است. تمام workerها باید از فرمان‌های Issue در COORDINATOR_COMMANDS.md استفاده کنند. هیچ عامل دیگری حق نوشتن مستقیم رجیستری را ندارد. اگر workflow فعال/قابل‌دسترسی نباشد، عملیات نوشتنی متوقف می‌شود.

## هدف
جلوگیری از اجرای هم‌زمان تغییرات متعارض توسط چت‌ها/حساب‌ها/کارمندان. قفل‌ها در یک رجیستری مرکزی روی branch مستقل `coordination/locks` نگهداری می‌شوند؛ مخزن محصول تغییر نمی‌کند.

## چرا این روش؟
GitHub refها یکتا هستند و به‌روزرسانی ref با `expected_sha` امکان compare-and-swap می‌دهد. در آزمون اولیه این مخزن:
- ساخت branch آزمایشی `locks/atomic-probe` بار اول موفق شد.
- تلاش دوم برای ساخت همان ref با خطای `422 Reference already exists` رد شد.
- برای رجیستری واقعی از یک branch واحد و CAS استفاده می‌کنیم تا عملیات چندمنبعی و آزادسازی نیز ممکن باشد.
- یک CAS به commit جدید موفق شد؛ تلاش stale بعدی خطا داد و ref روی commit برنده باقی ماند. پاسخ خطای stale از connector opaque بود؛ بنابراین رفتار رقابتی در GitHub با آزمون end-to-end چندحسابی هنوز باید تکمیل شود.

## منبع حقیقت قفل
- Branch: `coordination/locks`
- File: `04_COORDINATION/ACTIVE_LOCKS.json`
- Branch head SHA: از Git ref API در هر عملیات زنده خوانده شود.
- هیچ نسخه cache یا فایل روی branch کاری جایگزین این رجیستری نیست.

## کلید منبع (RESOURCE_KEY)
کلید باید پایدار، دقیق و canonical باشد:
- `module:payments`
- `module:identity`
- `file:app/Services/AuthorizationService.php`
- `schema:orders`
- `api-contract:payment-callback`
- `doc:00_PROJECT_FOUNDATION/APPROVED_REQUIREMENTS.md`

قبل از ثبت، lowercase، trim و slash normalization انجام بده؛ wildcardهای مبهم مثل `module:*` فقط با دلیل و تأیید مجازند. اگر TASK چند منبع دارد، کلیدها را sort و unique کن.

## الگوریتم اتمیک Acquire
**هرگز با خواندن ساده فایل و سپس نوشتن معمولی ادعای قفل نکن.** عملیات باید با CAS روی head branch کامل شود:

1. GET `https://api.github.com/repos/a4adelahmadian86-wq/farast-control-plane/git/ref/heads/coordination/locks` و `current_head_sha` را بگیر.
2. commit جاری را بخوان و `tree.sha` را استخراج کن.
3. فایل `04_COORDINATION/ACTIVE_LOCKS.json` را از branch `coordination/locks` بخوان.
4. زمان UTC فعلی را بگیر. برای همه RESOURCE_KEYها بررسی کن:
   - اگر lock فعال با `lease_expires_at_utc > now` متعلق به TASK دیگری است، acquire کل مجموعه را رد کن؛ هیچ lock جزئی نگذار.
   - اگر lock منقضی است، آن را stale علامت بزن و با ثبت history جایگزین کن.
   - اگر کلیدها آزادند، برای هرکدام lock جدید بساز.
5. `fencing_token` یکتای افزایشی از `next_fencing_token` اختصاص بده؛ برای هر lock مقدار جداگانه.
6. JSON جدید را به blob تبدیل کن؛ tree جدید را با base tree و تنها فایل رجیستری بساز؛ commit جدید با parent = `current_head_sha` ایجاد کن.
7. ref را با `update_ref` و این شروط به‌روزرسانی کن: branch=`coordination/locks`, sha=`new_commit_sha`, force=true, expected_sha=`current_head_sha`.
8. فقط اگر update_ref موفق شد، lock گرفته شده است. اگر خطا/409/422/خطای نامعلوم رخ داد:
   - هرگز فرض نکن lock گرفته‌ای.
   - ref و فایل را دوباره بخوان.
   - حداکثر 3 بار از ابتدا retry کن؛ پس از آن BLOCKED ثبت کن.
9. پس از موفقیت، TASK Issue را با fencing token، resource keys و lease پایان به‌روز کن.

**نکته:** همه منابع یک TASK در یک commit و یک CAS گرفته شوند؛ یا همه گرفته می‌شوند یا هیچ‌کدام. این روش از deadlock ناشی از گرفتن تدریجی چند منبع جلوگیری می‌کند.

## Lease و heartbeat
- Lease پیش‌فرض اولیه: 30 دقیقه.
- Heartbeat پیشنهادی: هر 10 دقیقه و قبل از عملیات طولانی/commit/PR.
- ChatGPT در این معماری تایمر/عامل پس‌زمینه تضمین‌شده ندارد؛ heartbeat خودکار فرض نشود. عامل باید در checkpointها و پیش از هر عملیات نوشتنی lease را تمدید کند. اگر کار طولانی‌تر از lease شد، پیش از ادامه write دوباره acquire/renew کند؛ اگر امکانش نیست، نوشتن را متوقف کند.
- تمدید lease فقط با CAS و تطبیق TASK_ID + RUN_ID + fencing_token انجام شود.
- اگر lease منقضی شد یا تمدید شکست خورد، عامل فوراً نوشتن را متوقف می‌کند.
- زمان‌ها ISO-8601 UTC؛ زمان تخمینی ممنوع.
- اگر عامل قطع شد، lease تا انقضا باقی می‌ماند؛ عامل جدید پس از انقضا می‌تواند با CAS جایگزین کند.

## Release اتمیک
1. رجیستری زنده و head SHA را بخوان.
2. برای هر resource فقط lockی را آزاد کن که TASK_ID، RUN_ID و fencing_token دقیقاً متعلق به همین اجرا باشد.
3. lock را از active list خارج و رویداد RELEASED را به history append کن.
4. blob/tree/commit جدید بساز و با expected_sha قبلی CAS کن.
5. اگر CAS شکست خورد، reload و retry؛ هرگز lock عامل دیگری را آزاد نکن.

## Fencing token و جلوگیری از عامل stale
- هر lock یک fencing_token عددی افزایشی دارد.
- هر checkpoint/PR باید token را ثبت کند.
- پیش از هر commit یا PR، رجیستری را دوباره بخوان و اعتبار token و lease را تأیید کن.
- عامل با token قدیمی حق ادامه write ندارد، حتی اگر هنوز branch کاری‌اش موجود باشد.
- merge/deploy همچنان نیازمند review و approval جداگانه است؛ token به‌تنهایی مجوز merge نیست.

## قالب رجیستری
```json
{
  "schema_version": "1.0",
  "revision": 12,
  "next_fencing_token": 87,
  "locks": [{
    "resource_key": "module:payments",
    "task_id": "FCP-EXP08-001",
    "run_id": "RUN-...",
    "agent_alias": "chat-A",
    "branch": "work/FCP-EXP08-001-payments",
    "acquired_at_utc": "2026-11-14T10:00:00Z",
    "heartbeat_at_utc": "2026-11-14T10:10:00Z",
    "lease_expires_at_utc": "2026-11-14T10:40:00Z",
    "fencing_token": 86,
    "status": "ACTIVE"
  }],
  "history": []
}
```

## ابزارهای لازم
عامل باید توانایی GitHub read/write و این عملیات را داشته باشد: fetch Git ref/commit/blob، create_blob، create_tree، create_commit و update_ref با expected_sha. اگر این ابزارها در حساب/چت در دسترس نیستند، **هیچ تغییر نوشتنی در منابع مشترک انجام نده**؛ فقط تحلیل read-only انجام بده و به مالک اعلام کن این حساب ابزار لازم را ندارد.

## محدودیت و تضمین
این طراحی از Git ref CAS به‌عنوان نقطه هماهنگی اتمیک استفاده می‌کند. با این حال، قبل از اتکا در مقیاس تیم باید آزمون رقابتی واقعی با دو حساب مستقل و چند اجرای هم‌زمان انجام شود؛ نتیجه probe اولیه اثبات کامل رفتار در همه شرایط نیست. GitHub دسترسی/هویت واقعی ChatGPT chat را اثبات نمی‌کند. branch `coordination/locks` باید از حذف تصادفی محافظت شود. مخزن فعلاً public و در حالت public-safe نگه داشته می‌شود؛ هیچ secret، credential، PII یا داده محرمانه نباید در آن قرار گیرد. خصوصی‌سازی فقط پیش از ورود داده محرمانه لازم است.


## منابع مرکزی و جلوگیری از تداخل نوشتن
کلیدهای رزرو شده برای رجیسترهای مشترک:
- `index:MASTER_STATUS`
- `index:TASK_INDEX`
- `index:GOAL_STATUS`
- `index:EXP_STAGE_LEDGER`
- `index:CAPABILITY_REGISTER`
- `index:REQUIREMENTS_TRACEABILITY`
- `governance:USER_FEEDBACK_REGISTER`
- `governance:DECISION_REGISTER`
- `strategy:DEPENDENCY_GRAPH`

اصل single-writer: عامل عادی این فایل‌ها را مستقیم به‌روزرسانی نمی‌کند؛ Issue و گزارش اختصاصی TASK را ثبت می‌کند و تغییر رجیستر مرکزی را به steward یا PR جداگانه تحویل می‌دهد. فقط TASKی که صریحاً مالک همان رجیستر است می‌تواند با قفل کلید مربوطه تغییر پیشنهاد دهد. از آنجا که PR تا زمان merge ممکن است با PR دیگر تعارض داشته باشد، قفل رجیستر مشترک تا تعیین تکلیف PR باید در وضعیت RESERVED_FOR_REVIEW بماند یا تغییر فقط توسط steward تجمیع شود. برای جلوگیری از lease طولانی، روش ترجیحی single-writer steward است.


## مرز پیاده‌سازی فعال
در نسخه فعلی، GitHub Actions workflow تنها writer رجیستری است. workerها نباید CAS یا `updateRef` رجیستری را مستقیماً اجرا کنند؛ claim/heartbeat/release فقط از فرمان‌های `/farast` در Issue انجام می‌شود. این پروتکل CAS، مبنای داخلی workflow مرکزی است، نه مجوز نوشتن مستقیم برای چت‌ها.
