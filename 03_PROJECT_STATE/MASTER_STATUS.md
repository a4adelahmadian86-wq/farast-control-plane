# وضعیت کلان پروژه — خط مبنای کنترل‌پلین

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
- زیرساخت کنترل‌پلین در PR شماره ۱ روی شاخه setup/control-plane-bootstrap است؛ هنوز merge نشده.
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
