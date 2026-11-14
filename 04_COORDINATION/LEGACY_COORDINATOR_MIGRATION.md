# ممیزی و برنامه انتقال هماهنگ‌کننده قدیمی از PR #479

## منبع بررسی‌شده
- مخزن: a4adelahmadian86-wq/non
- PR: https://github.com/a4adelahmadian86-wq/non/pull/479
- شاخه: work/farast-multi-chat-team-infrastructure
- فایل workflow: .github/workflows/farast-agent-coordination.yml
- SHA فایل workflow در شاخه بررسی‌شده: ddb795d1e630451e80f697509d0ef789b6fe9196

این فایل فقط خوانده و تحلیل شده است؛ هیچ تغییری در مخزن محصول یا PR #479 اعمال نشده است.

## قابلیت‌های ارزشمند که باید حفظ شوند
1. واکنش به رویدادهای Issues: opened، reopened و closed.
2. واکنش به کامنت فرمان‌دار issue_comment.
3. فرمان‌های /farast claim، heartbeat، release، status، block، unblock، review و reopen.
4. ایجاد/مدیریت labelهای وضعیت وظیفه.
5. بررسی author_association و رد فرمان از حسابی که collaborator/member/owner شناخته نمی‌شود.
6. ثبت RUN، تلاش‌ها، زمان شروع/پایان، retry و metrics.
7. جلوگیری از بستن Issue پیش از مرحله review.
8. الزام PR ادغام‌شده و approval بازبین مستقل روی head فعلی پیش از accepted/closed شدن TASK.
9. ثبت وضعیت ماشین‌خوان در کامنت‌های Issue برای تاریخچه و handoff.

## نقص‌هایی که نباید منتقل شوند
1. concurrency در workflow قدیمی بر اساس شماره همان Issue است؛ دو Issue متفاوت که یک فایل/ماژول/API مشترک دارند، با آن از هم محافظت نمی‌شوند.
2. منبع lock در JSON marker داخل کامنت‌های همان Issue ذخیره می‌شود؛ رجیستری سراسری منابع نیست.
3. lease قدیمی به TASK/Issue محدود است و RESOURCE_KEYهای چندگانه، acquire all-or-none و fencing token سراسری ندارد.
4. GitHub Actions concurrency تضمین FIFO نیست؛ نبود پاسخ workflow هرگز grant یا denial محسوب نمی‌شود.
5. chat_id و run_id ورودی خوداظهاری‌اند؛ GitHub هویت واقعی مکالمه ChatGPT را اثبات نمی‌کند.
6. Universal prompt و Prompt Execution Playbook همان PR، ورک‌فلوی ۱۰مرحله‌ای و دامنه محصول قدیمی‌تری را بیان می‌کنند. این متن‌ها با نقشه ۱۷ پرامپتی/۲۷ EXP و دامنه مصوب فعلی یکسان نیستند و نباید بدون بازنویسی وارد مخزن کنترل شوند.

## وضعیت معادل در کنترل‌پلین مستقل
- رجیستری مرکزی CAS در branch coordination/locks و فایل 04_COORDINATION/ACTIVE_LOCKS.json ایجاد شده است.
- RESOURCE_KEY، lease و fencing token در LOCK_MANAGER_PROTOCOL.md تعریف شده‌اند.
- Issue templates و قراردادهای Work Order/Checkpoint موجودند.
- اما workflow رویدادمحور برای مدیریت خودکار claim/heartbeat/release/status/labels/review/close هنوز در مخزن مستقل پیاده‌سازی نشده است.
- بنابراین اکنون قفل مرکزی از طریق پروتکل Git Data CAS قابل استفاده است، ولی گردش‌کار فرمانی و lifecycle خودکار PR #479 هنوز منتقل نشده است.

## طرح انتقال پیشنهادی
اگر مالک انتقال را تأیید کند، یک workflow مستقل در farast-control-plane ساخته شود که:
1. رویدادهای Issue و فرمان‌های /farast را مدیریت کند.
2. Issue را منبع اصلی TASK و کامنت‌ها را تاریخچه/نمای وضعیت نگه دارد؛ کامنت Issue هرگز منبع حقیقت lock نباشد.
3. تمام claim/heartbeat/release را فقط روی ACTIVE_LOCKS.json در branch coordination/locks اعمال کند.
4. همه RESOURCE_KEYهای یک TASK را در یک commit اتمیک با compare-and-swap بگیرد یا هیچ‌کدام را نگیرد.
5. برای چند Issue متعارض، از CAS سراسری استفاده کند؛ concurrency per-issue فقط برای مرتب‌سازی فرمان‌های همان Issue باشد.
6. OPERATION_ID را از شناسه یکتای کامنت/رویداد بسازد تا تحویل مجدد همان event اثر تکراری ایجاد نکند.
7. actor GitHub را برای authorization بررسی کند؛ chat_id را صرفاً metadata خوداظهاری بداند.
8. lease، fencing token، actor، run، branch و resource keys را در پاسخ coordinator اعلام کند.
9. پاسخ timeout/ناموجود را grant تلقی نکند؛ عامل باید رجیستری و Actions run را read-back کند.
10. review/close gate قدیمی را حفظ کند: فقط PR مرتبط، merged، و approval مستقل روی head فعلی می‌تواند به DONE_VERIFIED منتهی شود.
11. state comment و label را فقط projection قابل بازسازی از Issue/registry بداند، نه lock source.
12. ۲۷ EXP و ۱۷ پرامپت فعلی را مصرف کند؛ هیچ مرحله ۱۰تایی یا دامنه قدیمی را وارد نکند.

## آزمون‌های پذیرش لازم پیش از فعال‌سازی
- دو Issue متفاوت با یک RESOURCE_KEY: فقط یک claim موفق.
- دو Issue با RESOURCE_KEYهای disjoint: هر دو claim موفق.
- دو claim هم‌زمان روی یک Issue: فقط یک مالک.
- retry همان comment/event ID: بدون lock/کامنت/تلاش تکراری.
- heartbeat توسط actor/run اشتباه: رد شود.
- release با fencing token قدیمی: رد شود.
- lease منقضی و claim جدید: token افزایشی جدید؛ token قدیمی بی‌اثر.
- command از author_association غیرمجاز: رد شود.
- workflow timeout/عدم پاسخ: هیچ عامل ادعای grant نکند.
- close بدون review یا بدون PR مستقل merged: Issue باز بماند.
- current-head approval از worker خودی: برای پذیرش کافی نباشد.
- توقف/تعویض چت: همان TASK_ID و آخرین checkpoint ادامه یابد.

## وضعیت
NOT_IMPLEMENTED / OWNER_DECISION_REQUIRED

این سند ثبت می‌کند چه چیزی از PR #479 باید حفظ و چه چیزی باید جایگزین شود. تا پیش از تصمیم مالک و پیاده‌سازی/آزمون، کنترل‌پلین را دارای coordinator خودکار کامل معرفی نکن.


## وضعیت انتقال در 2026-11-14
- پیاده‌سازی جدید در .github/workflows/farast-coordinator.yml روی شاخه setup/control-plane-bootstrap ایجاد شده است.
- قابلیت‌ها: Issue opened/reopened/closed، کامنت فرمان‌دار، claim/heartbeat/release/status/block/unblock/review/reopen/accept، label lifecycle، author_association، lease و fencing token، deduplication بر اساس comment ID، بازیابی پاسخ نیمه‌تمام و review/close gate.
- قفل Issueمحور قدیمی حذف شده؛ رجیستری مرکزی تنها منبع مالکیت منابع است. concurrency سراسری single-writer جای concurrency صرفاً per-Issue را گرفته است.
- کامنت‌ها فقط inbox/history هستند؛ هیچ JSON lock marker در کامنت منبع حقیقت نیست.
- صف Actions ممکن است pending run را جایگزین کند؛ issue comments durable inbox هستند و schedule پنج‌دقیقه‌ای reconciliation لازم است. schedule فقط پس از حضور workflow در default branch اجرا می‌شود.
- PR #1 باید مستقل بازبینی و با مجوز مالک ادغام شود تا workflow عملیاتی شود. آزمون واقعی دو حساب مستقل و contention هنوز انجام نشده است.

وضعیت پیاده‌سازی: IMPLEMENTED_ON_REVIEW_BRANCH / NOT_ACTIVE_ON_DEFAULT_BRANCH / E2E_NOT_VERIFIED


## نتیجه اعتبارسنجی چندچتی — 2026-11-14
- آخرین head تأییدشده: e6113207987b93ef7a78913ba487571ad34787bf.
- CI موفق: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43593994379 .
- 8 آزمون fixture هسته coordination موفق شدند: claim متعارض روی منبع مشترک، منابع مستقل، all-or-none، انقضای lease و fencing token جدید، رد مالکیت/token stale، parse کردن target repository/resource keys، approval مستقل روی head فعلی، و تطبیق PR با branch/repository آخرین REVIEW.
- YAML workflow و syntax جاوااسکریپت آن نیز در CI بررسی شده‌اند.
- این نتیجه فقط static/unit validation است؛ workflow روی default branch و آزمون واقعی دو حساب مستقل هنوز NOT RUN است.


## آخرین نتیجه تست چندچتی — 2026-11-14
- هسته coordinator اکنون ۱۰ آزمون fixture دارد؛ آخرین اجرای تأییدشده روی head `4a8a043055ce18e8c36bc3ef4f91a945ad84e6f8` با ۱۰/۱۰ PASS و ۰ FAIL: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43594606065 .
- YAML و syntax جاوااسکریپت workflow نیز در همان CI تأیید شده‌اند.
- این نتیجه unit/static validation است؛ workflow هنوز روی default branch فعال نشده و آزمون واقعی دو حساب مستقل/قطع اتصال/takeover همچنان NOT_RUN است.
