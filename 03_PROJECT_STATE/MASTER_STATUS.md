# وضعیت کلان پروژه — snapshot زنده 2026-11-25T06:15:09Z

> این بخش مرجع وضعیت جاری است و با هر snapshot جدید جایگزین می‌شود. بخش تاریخی پایین‌تر حفظ شده اما وضعیت جاری محسوب نمی‌شود. مرجع حقیقت وضعیت وظایف، GitHub Issues/PRs، پاسخ‌های Coordinator و شواهد دقیق است؛ این فایل به‌تنهایی مجوز اجرا/merge/release نیست.

## وضعیت کنترل‌پلین

- مخزن: `a4adelahmadian86-wq/farast-control-plane`.
- شاخه اصلی: `main`؛ SHA مبنای این snapshot: `f50f6b184e1baa61fd4a5bafc4f020b495b3ff88`.
- PR #1 در commit `b8cf85cfd6552028750eefa3cff03d844175814c` ادغام شده است.
- workflow فرمان‌های `/farast` و رجیستری مرکزی `coordination/locks` در همین مخزن با پاسخ‌های زنده claim/heartbeat/step مشاهده شده‌اند؛ worker مجاز به نوشتن مستقیم رجیستری نیست.
- branch protection، no-bypass ruleset و آزمون واقعی چند حساب مستقل در این snapshot دوباره اثبات نشده‌اند؛ تا زمان read-back اختصاصی UNKNOWN بمانند.
- آخرین branch کاری CP-05 در این snapshot: `work/GH-136-RUN-PR07-G09-CP05-REGISTER-SYNC-20261125-01`؛ branch از SHA اصلی بالا ایجاد شده است.

## شمارنده زنده GitHub

| شاخص | مقدار | مبنای شمارش |
|---|---:|---|
| Issues | 70 | REST API، دو صفحه کامل |
| Issues باز | 40 | state=open |
| Issues بسته | 30 | state=closed |
| شناسه‌های پایدار Work Item | 67 یکتا | فیلد work_item_id یا سربرگ پایدار؛ بدون تکرار |
| Issueهای باز READY | 26 | label زنده؛ شامل #14 که superseded است |
| Issueهای باز LOCKED | 1 | #136، RUN جاری |
| Issueهای باز REVIEW | 8 | label زنده |
| Issueهای باز BLOCKED | 3 | label زنده |
| Issueهای legacy باز بدون WID | 2 | #3 و #2؛ leaf قابل claim نیستند |
| PRها | 67 | REST API |
| PRهای باز | 4 | #134، #132، #129، #127 |
| PRهای ادغام‌شده | 47 | merged_at موجود |
| PRهای بسته بدون merge | 16 | state=closed و merged_at خالی |

### استثناها و تفسیر صحیح inventory

- Issue #14 با وجود state=OPEN و label=agent:ready، طبق comment صریح خودش superseded توسط Issue #66 است؛ #14 فقط برای audit/history حفظ می‌شود و نباید claim یا دوباره فعال شود.
- Issue #108 پیش‌نویس superseded به #109 است و WID مستقل ندارد.
- Issueهای #3 و #2 رکوردهای قدیمی parent/resilience بدون WID هستند و leaf اجرایی محسوب نمی‌شوند.
- 67 WID یکتا در 70 Issue وجود دارد؛ یک WID متعلق به Issue #14 superseded است؛ سه Issue فاقد WID هستند.
- G-09 شامل 30 Issue است: 10 باز و 20 بسته. 10 مورد باز: 4 READY، 1 LOCKED، 3 REVIEW و 2 BLOCKED.

## وضعیت Goalها و EXPها

- هر 10 Goal دارای کار/شواهد جاری یا leaf فعال است؛ Status در `GOAL_STATUS.csv` برابر IN_PROGRESS ثبت می‌شود.
- درصد پیشرفت، تعداد معیارهای تأییدشده و تعداد معیارهای مسدود برای parent Goalها عمداً خالی است؛ معیارهای parent و تجمیع evidence-weighted هنوز با موتور CP-07 روی main اثبات نشده‌اند. از شمارش Issue/PR/commit درصد نساز.
- EXP-05، EXP-06 و EXP-07 دارای Work Item بسته‌شده با label رسمی `agent:done` هستند و در ledger به‌صورت DONE_VERIFIED ثبت می‌شوند.
- سایر EXPها در این snapshot IN_PROGRESS هستند؛ دلیل و Issueهای canonical در `EXP_STAGE_LEDGER.csv` آمده است.
- اختلاف metadata شناخته‌شده: Issue #19 (EXP-07) در JSON خود parent_goal_ids=[G-00] دارد، در حالی که دامنه تخصصی PR-07 و Goal Tree، G-01/G-02/G-06 است. گزارش پذیرفته‌شده این اختلاف را ثبت کرده؛ metadata تاریخی را بی‌ردپا بازنویسی نکن.

## وضعیت CPهای جاری

- **CP-05:** ممیزی CP-05/CP-06 در Issue #135 پذیرفته شد. remediation همگام‌سازی رجیسترها در Issue #136 با WID=`WI-CP05-REGISTER-SYNC-001` در حال اجراست؛ Task Index در branch اختصاصی به‌روزرسانی شده است.
- **CP-06:** remediation ردیابی بازخورد مالک در Issue #137 با WID=`WI-CP06-FEEDBACK-TRACE-001` READY و مستقل از #136 است.
- **CP-07:** Issue #128 در BLOCKED با EXECUTION_PROGRESS=100%، ACCEPTANCE_PROGRESS=80% و OVERALL_COMPLETION=80% است؛ معیار `AC_PARENT_AGGREGATION` تا اثبات suite روی head دقیق PASS نمی‌شود. Issue #130 READY و Issue #133 REVIEW هستند. PR #132 و #134 باز هستند؛ PR #131 بسته و بدون merge است. این snapshot هیچ مجوزی برای merge صادر نمی‌کند.

## وضعیت محصول NON و مرز آمادگی

- در این Work Item هیچ تغییری در مخزن `a4adelahmadian86-wq/non` انجام نشده است.
- CI سبز، کد موجود یا وضعیت Issue به‌تنهایی اثبات اجرای local/production، backup restore واقعی، provider billing، ظرفیت، امنیت عملیاتی یا پذیرش کاربر نیست.
- Backup/restore production، hosting/runtime، voice billing/runtime، legal decisions و production readiness تا زمان شواهد مستقل UNKNOWN یا NOT ESTABLISHED می‌مانند.
- مجوز انتشار، deployment، migration، داده مخرب یا merge از این snapshot استنباط نمی‌شود.

---

> **هشدار:** تمام محتوای زیر یک سابقه تاریخی مورخ 2026-11-14 است. عبارات صفر بودن Issueها، ادغام‌نشدن PR #1، و فعال نبودن workflow فقط وضعیت آن تاریخ را توصیف می‌کنند و نباید به‌عنوان وضعیت جاری استفاده شوند.

## سابقه راه‌اندازی کنترل‌پلین — snapshot تاریخی 2026-11-14 (فقط برای ممیزی)

**وضعیت این سند: CONTROL_PLANE_BOOTSTRAP_IMPLEMENTED_ON_PR_BRANCH / PRODUCT_NOT_AUDITED**

این فایل فقط راه‌اندازی کنترل‌پلین را ثبت می‌کند. به معنی اجرای ممیزی سایت نیست.

- Control-plane repo: initialized on review branch; not merged.
- Product repo: موجود در a4adelahmadian86-wq/non؛ در این کار تغییر نکرده است.
- Master goal: G-00.
- Enabling goal: G-09 (multi-chat control plane).
- EXP work packages: 27; همه NOT_STARTED تا تولید شواهد.
- Prompt catalog: PR-01..PR-17 + MASTER-00؛ bundle v1.2.1.
- Product baseline audit: NOT VERIFIED.
- Control-plane requirements: CP-01..CP-08 recorded.
- Owner feedback: FB-20261114-001 recorded.
- Backup/restore production: UNKNOWN.
- Hosting/runtime: UNKNOWN.
- Voice service billing/runtime: UNKNOWN.
- Security acceptance: NOT TESTED.
- Production readiness: NOT ESTABLISHED.
- Release approval: NOT GRANTED.

## وضعیت راه‌اندازی
- زیرساخت کنترل‌پلین در PR شماره ۱ در commit `b8cf85cfd6552028750eefa3cff03d844175814c` به main ادغام شده است.
- شاخه پیش‌فرض main فقط README دارد؛ پرامپت‌ها به شاخه معتبر pinned شده‌اند.
- رجیستری مرکزی روی branch coordination/locks با lease و fencing token موجود است؛ ۱۲ fixture تست در CI پاس شده‌اند؛ آزمون رقابتی واقعی دو حساب مستقل هنوز NOT_RUN است.\n- قابلیت‌های coordinator از PR #479 به workflow مستقل منتقل و با رجیستری CAS مرکزی بازطراحی شده‌اند؛ workerها فقط از `/farast` استفاده می‌کنند و direct-CAS ممنوع است. workflow تا merge شدن PR #1 در default branch فعال نیست.
- Work Order/Checkpoint schema، Handoff Protocol، Acceptance Framework و Architecture Coverage افزوده شده‌اند.
- Visibility مخزن PUBLIC است؛ فعلاً فقط کار عمومی و غیرمحرمانه.
- Branch protection و review مستقل تأیید نشده‌اند.
- وضعیت تفصیلی: BOOTSTRAP_STATUS.md و 00_PROJECT_FOUNDATION/CONTROL_PLANE_LIMITATIONS.md.

## شمارنده وضعیت وظایف
| وضعیت | تعداد |
|---|---:|
| Backlog | 0 ثبت‌شده |
| Ready | 0 |
| In progress | 0 |
| Blocked | 0 |
| Done verified | 0 |
| Done unverified | 0 |

این شمارنده‌ها تا زمان ایجاد Issueهای واقعی صفر/بدون داده می‌مانند؛ از روی فایل‌های برنامه‌ریزی، پیشرفت محصول استنتاج نشود. درصد وزنی هدف‌ها تا تصویب وزن معیارهای پذیرش محاسبه نمی‌شود.


## به‌روزرسانی هماهنگ‌کننده چندچتی — 2026-11-14
- workflow: .github/workflows/farast-coordinator.yml روی شاخه بازبینی PR #1.
- قرارداد فرمان‌ها: 04_COORDINATION/COORDINATOR_COMMANDS.md؛ template: .github/ISSUE_TEMPLATE/farast-task.yml.
- وضعیت: IMPLEMENTED_ON_REVIEW_BRANCH؛ هنوز روی main فعال نیست.
- Multi-account contention / interruption E2E: NOT_RUN؛ تا اجرای واقعی با دو حساب مستقل، آمادگی کامل تأیید نمی‌شود.


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


## آخرین تأیید چندچتی — 2026-11-14
- Head پیاده‌سازی: ebf5ecdb5fcd13f3c4ba8bca3ab157fca4674b09.
- CI موفق روی همین SHA: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43594945741 و https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43594950344 .
- ۱۱/۱۱ آزمون هسته coordination PASS، ۰ FAIL؛ YAML workflow، syntax JavaScript، قرارداد هر ۱۷ prompt و static assertions نیز PASS.
- هنوز workflow روی default branch فعال نیست؛ اجرای واقعی GitHub Actions، آزمون دو حساب مستقل، interruption و takeover عملیاتی NOT_RUN است.


## مرز اجرایی handoff چندچتی
هماهنگ‌کننده مالکیت منابع و lineage اجرای قبلی را کنترل می‌کند، اما ایجاد branch در مخزن هدف و تعیین commit پایه را خودکار انجام نمی‌دهد. worker جدید باید آخرین checkpoint قابل اثبات را read-only بررسی و branch جدید صادرشده را از آن commit ایجاد کند؛ اگر commit پایه قابل اثبات نیست، نوشتن ممنوع است. آزمون این رفتار در مخزن هدف هنوز end-to-end نشده است.


## وضعیت جاری چندچتی — 2026-11-14
- SHA شاخه فعال را همیشه از PR #1 زنده بخوان؛ hash داخل این سند منبع وضعیت جاری نیست.
- workflow فرمانی در شاخه PR وجود دارد؛ فعال‌سازی schedule و issue_comment نیازمند ادغام PR #1 در default branch است.
- CI موفق روی snapshot ثبت‌شده: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43599689054 ؛ ۱۴/۱۴ تست هسته، اعتبارسنجی workflow/YAML/JavaScript/JSON و قرارداد هر ۱۷ پرامپت موفق.
- هandoff: branch یکتا برای هر RUN، رد branch reuse، بازگرداندن lineage اجرای قبلی؛ ایجاد branch جدید در مخزن هدف هنوز مسئولیت worker و نیازمند آزمون E2E است.
- آزمون واقعی دو حساب GitHub/ChatGPT مستقل، قطع اتصال/takeover و اجرای workflow روی default branch هنوز NOT_RUN.


سیاست تفویض اختیار فرمان‌ها در `04_COORDINATION/ACTOR_AUTHORIZATION.json` ثبت شده است؛ نقش پیش‌فرض WORKER به فرمان‌های اجرایی پایه محدود است و فرمان‌های حساس فقط برای OWNER یا actor صریحاً تفویض‌شده فعال‌اند.


bundle تجمیعی نسخه 1.3.0 از MASTER-00 و ۱۷ پرامپت مستقل بازتولید شده است؛ تطبیق محتوای هر ۱۸ بخش با منبع مستقل 18/18 PASS. سیاست نقش‌ها و CODEOWNERS برای تغییرات حساس نیز اضافه شده‌اند.


## ارزیابی نهایی جاری چندچتی — 2026-11-14
- مرجع تفصیلی و معیارهای READY: `04_COORDINATION/MULTI_CHAT_READINESS.md`.
- workflow مرکزی و پروتکل چندچتی در شاخه PR پیاده‌سازی شده‌اند؛ تا ادغام PR #1 در `main` عملیاتی نیستند.
- CI موفق روی head `a02a34b4a4bd45302cbc1cf918f1927ad61a4442`: https://github.com/a4adelahmadian86-wq/farast-control-plane/actions/runs/43611034691 ؛ ۱۴/۱۴ آزمون هسته و validation workflow/YAML/JS/JSON/prompt PASS.
- کتابخانه تجمیعی v1.3.0 با منابع مستقل MASTER-00 و PR-01..PR-17 تطبیق داده شد: ۱۸/۱۸ PASS.
- hard-fencing برای push/merge در مخزن محصول تضمین نشده؛ branch protection و قواعد merge مخزن هدف باید جداگانه اعمال و آزموده شوند.
- PR #1 ادغام شده است؛ branch protection و Actions write permission هنوز read-back نشده‌اند؛ آزمون واقعی دو حساب مستقل و قطع اتصال/takeover NOT_RUN.
- مخزن PUBLIC و در حالت public-safe باقی می‌ماند؛ ورود secret/PII/داده مشتری/محرمانه ممنوع.


## به‌روزرسانی جاری 2026-11-14
- مرجع کد: main؛ merge commit PR #1 برابر `b8cf85cfd6552028750eefa3cff03d844175814c`.
- هدف‌های خرد: Issue #3؛ schema/core/progress/checkpoint implementation در branch `feat/hierarchical-work-items` در حال توسعه و هنوز در main ادغام نشده.
- چندحسابی واقعی: NOT_RUN؛ تا زمان آزمون دو حساب مستقل، READY اعلام نشود.
