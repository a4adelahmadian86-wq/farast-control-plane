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
- رجیستری CAS روی branch coordination/locks موجود است؛ آزمون رقابتی دو حساب مستقل هنوز لازم است.\n- coordinator رویدادمحور legacy PR #479 هنوز منتقل نشده؛ تا آن زمان قفل مستقیم CAS طبق پروتکل و بدون اتکاء به فرمان‌های /farast انجام می‌شود.
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
