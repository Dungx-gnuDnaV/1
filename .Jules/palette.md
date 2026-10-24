## 2026-10-24 - Interactive Header Accessibility
**Learning:** Icon-only buttons and interactive trigger components (such as search buttons, theme toggle switches, notification bells, and dropdown toggles) frequently omit explicit ARIA labels (`aria-label`) and state markers (`aria-expanded`, `aria-haspopup`), making them difficult to navigate for screen reader users.
**Action:** Always verify that every interactive `<button>` in navigation or header components includes a descriptive `aria-label` and dynamic state attributes like `aria-expanded` when toggling menus.
