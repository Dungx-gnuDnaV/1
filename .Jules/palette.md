## 2026-10-28 - ARIA Attributes on Header Controls and Modals
**Learning:** Icon-only buttons and menu trigger pills in header navigation often rely on tooltips/titles, missing accessible names (`aria-label`) and state disclosures (`aria-expanded`, `aria-haspopup`) needed by screen reader users.
**Action:** Always complement visual tooltips with explicit `aria-label` attributes and include `aria-expanded` / `aria-haspopup` state management for dropdown triggers.
