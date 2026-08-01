# Trade Learning Hub — Design System

> Applies to all pages. Built for Tailwind CSS + ShadCN (already in the stack) plus Framer Motion for interaction/motion. Mobile-first: define the mobile value first, then scale up at each breakpoint.

---

## 1. Color Palette

Base: semi-light, off-white/creamish — not pure white, not grey.

| Token | Usage | Example value |
|---|---|---|
| `background` | Page background | `#FAF7F2` (warm off-white) |
| `surface` | Cards, panels | `#FFFFFF` or `#F5F1EA` (slightly distinct from background) |
| `foreground` | Primary text | `#1F1B16` (near-black, warm-toned, not pure black) |
| `muted-foreground` | Secondary text | `#6B6355` |
| `border` | Dividers, card borders | `#E7E0D4` |
| `accent` | Primary CTA/brand color | Charcoal (`#2B2B2B`) **or** Amber (`#B8862B`) **or** Deep Green (`#2F5D50`) — pick one; charcoal reads most "standard/professional," amber/green lean more distinctly "trading/finance" |
| `accent-foreground` | Text on accent background | `#FFFFFF` |
| `success` | Approved/positive states | `#2F6E4F` |
| `warning` | Pending states | `#B8862B` |
| `error` | Rejected/error states | `#B3402A` |

Use the accent color sparingly — CTAs, active states, links, key highlights. Everything else stays neutral so the accent actually stands out.

---

## 2. Typography

- **Headings**: sans-serif (e.g. Inter, Manrope, or similar geometric/grotesk sans) — clean and rich-feeling per your preference.
- **Body text (app UI)**: same sans-serif family, regular weight, for consistency and performance (one font family loaded).
- **Body text (policy/article pages only)**: consider a readable serif (e.g. Source Serif, Lora) at a slightly larger size for a Medium-style reading feel — optional, sans-serif is also fine if you'd rather keep one typeface site-wide.

### Type Scale (mobile → desktop)

| Element | Mobile | Desktop | Weight |
|---|---|---|---|
| H1 (hero) | 32px / 1.2 | 56px / 1.1 | 700 |
| H2 (section) | 26px / 1.25 | 40px / 1.15 | 700 |
| H3 (card/subsection) | 20px / 1.3 | 28px / 1.25 | 600 |
| Body large | 17px / 1.6 | 18px / 1.7 | 400 |
| Body default | 15px / 1.6 | 16px / 1.65 | 400 |
| Small / caption | 13px / 1.5 | 14px / 1.5 | 400–500 |
| Button label | 15px | 16px | 600 |

Scale ratio: roughly 1.25–1.333 between steps, rounded to clean pixel values.

### Article Pages (Policy/Terms)
- Max reading width: `65–75ch`
- Line height: `1.7`
- Paragraph spacing: `1.25em`
- Larger body size than app UI (`17–18px`)

---

## 3. Spacing Scale

Base unit: `4px`. Use multiples: `4, 8, 12, 16, 24, 32, 48, 64, 96`.

| Token | Value | Typical use |
|---|---|---|
| `space-1` | 4px | tight icon/text gaps |
| `space-2` | 8px | inline element gaps |
| `space-3` | 12px | form field gaps |
| `space-4` | 16px | card padding (mobile) |
| `space-6` | 24px | card padding (desktop), section gaps (mobile) |
| `space-8` | 32px | section gaps (desktop) |
| `space-12` | 48px | section vertical padding (mobile) |
| `space-16` | 64px | section vertical padding (desktop) |
| `space-24` | 96px | hero vertical padding (desktop) |

---

## 4. Breakpoints & Layout

| Breakpoint | Width | Notes |
|---|---|---|
| `sm` (mobile) | 375px baseline, up to 639px | single column, stacked nav |
| `md` (tablet) | 640–1023px | 2-column grids where relevant |
| `lg` (desktop) | 1024–1439px | 3-column grids, full nav |
| `xl` (wide) | 1440px+ | max content width applies, extra margin |

- **Max content width**: `1280px`, centered, with side padding of `16px` (mobile) → `24px` (tablet) → `48px` (desktop)
- **Course grid**: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- **Admin tables**: horizontal scroll on mobile rather than column-cramming; card-style row layout below `md` is acceptable for complex tables (orders, students)

---

## 5. Components

- **Buttons**: solid accent for primary actions, outline/ghost for secondary. Consistent height (`44px` desktop, `48px` mobile for tap targets), `8px` corner radius.
- **Cards**: `surface` background, `1px` `border`, `12px` radius, subtle shadow only on hover (avoid heavy default shadows — keep it flat/clean).
- **Forms**: labels above inputs, `8px` gap, clear focus states using the accent color, error states in `error` color with inline message below the field.
- **Modals/popups** (QR payment popup, lesson-return popup): centered, `16px` radius, backdrop blur or dim overlay, close on backdrop click.
- **Progress bar** (PDF lessons, dashboard progress): thin (`6–8px`), rounded, accent-colored fill on `border`-colored track.

---

## 6. Motion (Framer Motion)

Keep it subtle and fast — this is a finance-adjacent, trust-driven product, not a playful consumer app.

- **Durations**: 150–250ms for micro-interactions (hover, button press), 300–400ms for page/section transitions
- **Easing**: `easeOut` for entrances, `easeInOut` for state changes
- **Use motion for**: card hover lift (`translateY(-2px)`), modal enter/exit (fade + slight scale), curriculum accordion expand/collapse, progress bar fill animation, page section fade-in on scroll (once, not repeating)
- **Avoid**: bouncy/springy effects, anything that delays the user from completing a task (e.g. no animation blocking the "Buy Now" click)

---

## 7. Responsive Rules — General Principles
- Design mobile-first: base styles are mobile, use `md:`/`lg:` Tailwind prefixes to scale up, not down
- Touch targets minimum `44x44px` on mobile
- Never rely on hover-only interactions for anything essential (mobile has no hover) — ensure tap equivalents exist (e.g. curriculum accordions expand on tap, not hover)
- Sticky/fixed elements (mobile nav, "Buy Now" bar) should not obscure content — reserve safe-area padding
- Images: always served responsively (appropriate `sizes`/`srcset` via Next.js Image) to avoid oversized mobile payloads
