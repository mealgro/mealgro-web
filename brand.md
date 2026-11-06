# Mealgro web — brand reference

The reference for every change to mealgro.com: the marketing site, the vendor
portal (`/account`) and the affiliate area (`/affiliate`). It describes what is
already in this repo. When you add a page, copy the closest existing pattern
listed here instead of inventing a new one.

The site has **two surfaces that share one brand**:

| Surface | Pages | Styling |
| --- | --- | --- |
| Marketing | `/`, `/vendors`, `/riders`, `/about`, `/contact`, `/terms`, `/privacy`, `/account-deletion`, `/affiliate` (public), `/status`, `_error` | Scoped `<style>` per component, some Tailwind utilities, big display type |
| App | `/account/*` (vendor portal), `/affiliate/(app)/*` (affiliate area) | The shared `p-*` classes in `components/portal/portal.css` (+ `components/affiliate/affiliate.css`), dense UI type |

Both use the same font, the same red, the same near-black ink and the same logo.

---

## Tokens

There is no Tailwind theme or global CSS-variable file. Colours are written in
component CSS; the app surface has real variables on `.portal`. Use these exact
values.

### Colour

| Role | Value | Where it's defined / used |
| --- | --- | --- |
| **Brand red** (primary, CTAs, active nav, accents, hero backgrounds) | `#D62300` | everywhere; `--brand` in `portal.css`, `--brand-red` in about/contact/legal pages |
| Brand red, pressed/hover | `#BD1F00` | `.p-btn--primary:hover`, base `a:hover` in `pages/tailwind.css` |
| Brand red, soft tint (chips, step cards, active nav pill) | `#FDECE8` (or `rgba(214, 35, 0, 0.08)` on paper) | `--brand-soft`; `--brand-red-soft` |
| Logo red / illustration red | `#FF2509` | `assets/logo.svg`, food-section accents (`LocationSection`, `DownloadNowSection`, `VehicleSection`). Don't use it for UI — UI red is `#D62300` |
| Accent yellow (FAQ panels, legal highlights) | `#FFE100` | `components/*/FAQSection.vue`, `--brand-yellow` |
| Ink (body and headings, marketing) | `#121212` | home/vendors/riders sections, dark CTA buttons |
| Ink (editorial + app) | `#17130F` | `--ink` in `portal.css` and about/contact/legal pages |
| Nav ink | `#0E172B` | `Navigation.vue`, `NavDropdown.vue` only |
| Muted text | `#6B635B` (≈ `rgba(23, 19, 15, 0.64)`) | `--muted`, `--ink-soft` |
| Grey copy on light sections | `#8D8A8A` | home/vendors marketing paragraphs |
| Pure black (hero bands, Download CTA, footer) | `#000000` | `HeroSection`, `Footer` |
| Paper (light page background) | `#F6F6F6` | marketing sections, `--paper`, `--bg` in `portal.css` |
| Surface / card | `#FFFFFF` | `--surface`, `--card` |
| Line (borders) | `#E8E2DC` (app), `rgba(23, 19, 15, 0.12)` (editorial), `#E5E5E5` / `#D9D9D9` (marketing) | `--line`, `--paper-line` |
| Success | `#17803D` on `#E4F5EA` | `--ok`, `--ok-soft` |
| Warning | `#B45309` on `#FDF1DC` (banner text `#7A3D06`) | `--warn`, `--warn-soft`, `.aff-banner` |
| Error | `#B42318` on `#FDE8E6` | `--bad`, `--bad-soft` |

### Radius

| Use | Value |
| --- | --- |
| Pills, badges, chips, round buttons | `999px` |
| Marketing CTA buttons | `16px`–`20px` (hero Download `20px`, affiliate landing `16px`) |
| Marketing feature cards / panels | `22px`–`24px` (large decorative panels go up to `40px`–`54px`) |
| Nav bar, dropdown | `16px` bar, `12px` menu, `8px` items |
| App cards (`.p-card`) | `14px` |
| App buttons, inputs, tabs | `10px` (tab buttons inside `8px`) |

### Spacing and layout

- Marketing content width: `max-width: 1100px`–`1400px`, side gutter `clamp(16px, 5vw, 72px)`; sections `88px` vertical (`64px` under 860px).
- Desktop nav sits absolutely at `top: 20px`, centred, white bar `801px × 83px`.
- App shell: fixed `232px` sidebar, main padding `28px 32px 64px`, content `max-width: 1040px`. Under `860px` the sidebar becomes a drawer behind a `52px` sticky top bar; main padding `20px 16px`.
- App rhythm: `.p-stack` / `.p-row` gap `12px`, `.p-grid` gap `14px`, card padding `18px`.

### Shadows

- Nav dropdown: `0 10px 30px rgba(14, 23, 43, 0.12)`
- Toasts: `0 6px 24px rgba(0, 0, 0, 0.15)`
- Active tab: `0 1px 2px rgba(0, 0, 0, 0.08)`
- FAQ tab: `4px 4px 8px rgba(0, 0, 0, 0.15)`

Cards otherwise use a 1px border, not a shadow.

---

## Typography

**One family everywhere: MADE Tommy Soft**, loaded by `pages/fonts.css`
(weights 100–900, plus an Outline family for decoration) and applied globally in
`pages/tailwind.css` and `pages/+Layout.vue`. The app surface sets it on
`.portal`. The only other face is monospace (`--mono`) for small labels and
codes on the editorial pages.

The font has no 600 weight; `font-weight: 600` renders as 700. Prefer 400, 500,
700, 800.

### Marketing scale

| Role | Size | Weight |
| --- | --- | --- |
| Hero headline | `clamp(36px, 6vw, 64px)` (home hero up to `96px`) | 800, `line-height: 1.05`, `letter-spacing: -0.5px` |
| Section heading (h2) | `clamp(30px, 4vw, 44px)` | 800 |
| Card heading (h3) | `22px`–`28px` | 700 |
| Lead paragraph | `clamp(17px, 2vw, 20px)`, `line-height: 1.5` | 400 |
| Body | `16px`–`17px`, `line-height: 1.55` | 400 |
| Eyebrow | `15px`, uppercase, `letter-spacing: 0.14em` | 700 |
| Nav link | `14px` (`12px` under 1024px) | 400 |
| CTA button | `20px` (`18px` on phones) / hero `16px`–`18px` | 500 |

### App scale (`portal.css`)

| Role | Size | Weight |
| --- | --- | --- |
| Page title (`.portal h1`) | `22px` | 600 |
| Section title (`.portal h2`) | `15px` | 600 |
| Body | `14px`, `line-height: 1.45` | 400 |
| Field label (`.p-field > span`) | `13px` | 600 |
| Table header | `12px`, muted | 600 |
| Stat number (`.p-stat strong`) | `26px` | 700 |
| Badge | `12px` | 600 |
| Hint / small | `12px`, muted | 400 |

Affiliate pages bump buttons and inputs to `15px` (`.aff .p-btn`, `.aff .p-input`).

---

## Components to reuse

### Shared (marketing)

| Pattern | File | Notes |
| --- | --- | --- |
| Desktop nav | `components/shared/Navigation.vue` | White rounded bar, links from `navLinks.ts`. Hidden ≤1024px |
| Nav links (single source) | `components/shared/navLinks.ts` | Add a page here; `children` makes a dropdown |
| Nav dropdown | `components/shared/NavDropdown.vue` | Hover/focus/tap menu; item hover `#FFF1EE` bg + red text |
| Mobile menu | `components/shared/MobileMenu.vue` | Round toggle button + sheet of links from `navLinks.ts`, shown ≤1024px. Each hero places `<MobileMenu />` next to its own logo; the sheet is fixed just under the button. Never copy the markup |
| Global logo | `pages/+Layout.vue` | Desktop only, top-left; white by default, red via `.global-logo--red` on light pages (add the path to `isRedLogoPage`) |
| Status page | `pages/status/+Page.vue` | Card on paper with the logo (phones), red eyebrow, `--ok`/`--warn`/`--bad` states |
| Footer | `components/shared/Footer.vue` | Black, logo, link columns, red "Your next food journey starts here" band with Download button |
| FAQ | `components/{home,vendors}/FAQSection.vue`, `components/riders/FAQRiders.vue` | Yellow `#FFE100` panels, pill tabs |
| Download CTA | `.download-btn` in `HeroSection.vue` | Black, `20px` radius, App Store + Play icons from `assets/download/` |
| Affiliate landing blocks | `pages/affiliate/+Page.vue` | `.btn` (`--dark` `#121212`, `--ghost` white outline on red, `--red`), `.step` cards on brand-soft, `.facts` with red left rule, dark `.join` card. The template for any new program/landing page |

### App (`components/portal/portal.css`)

Wrap the page in `.portal` (the shells do it for you).

| Class | What |
| --- | --- |
| `.p-brand` | Logo (`assets/logo.svg`, 72px) with the area name in `<small>` under it. Use it for every app header and sign-in screen |
| `.p-card` | White card, 1px line, `14px` radius, `18px` padding |
| `.p-btn` | Default (white, bordered). Modifiers: `--primary` (red), `--danger` (red text), `--sm` (32px). Affiliate adds `--block` |
| `.p-field` + `.p-input` | Label `<span>` above input; red border on focus; `aria-invalid="true"` turns it red in the affiliate area |
| `.p-badge` | Pill status: `--ok`, `--warn`, `--bad`, `--brand`, default grey |
| `.p-alert` | Inline message: error by default, `--warn`, `--ok` |
| `.p-table` in `.p-scroll` | Data table; rows with `.is-clickable` get hover |
| `.p-tabs` | Segmented control (`button[aria-pressed]`) |
| `.p-stat` | Big number + muted label |
| `.p-page-head` | Title + actions row (the shells render it from the `title` prop and `#actions` slot) |
| `.p-row`, `.p-between`, `.p-stack`, `.p-grid`, `.p-muted` | Layout helpers |
| `.p-card--flush`, `.p-pad`, `.p-input--auto` | Card around a table (6px padding), padded message inside it, select that sizes to its content |
| `.p-mt-xs` 6px, `.p-mt` 24px, `.p-mb-xs` 4px, `.p-mb-sm` 12px, `.p-mb` 14px, `.p-ml-sm` 8px | Spacing between blocks; use these, never `style=""` |

| Component | File |
| --- | --- |
| Vendor portal frame (sidebar, branch switcher, toasts) | `components/portal/PortalShell.vue` |
| Affiliate frame (sidebar, code card, pause/suspended banners, terms gate) | `components/affiliate/AffiliateShell.vue`, `AffiliateLayout.vue` |
| Modal | `components/portal/Modal.vue` |
| Orders table / order detail | `components/portal/OrdersTable.vue`, `OrderDetail.vue` |
| Email-code step (OTP) | `components/affiliate/CodeStep.vue` (`.aff-otp`) |
| Banners | `.aff-banner` (warn), `.aff-banner--bad`; `components/affiliate/PauseBanner.vue` |
| Toasts | `lib/portal/toast.ts`, `lib/affiliate/toast.ts` (rendered by the shells) |
| Empty list | `.aff-empty`; lists `.aff-list` |

### Icons

Inline SVG, 24×24 viewBox, `stroke="currentColor"`, `stroke-width` 1.5–2,
round caps and joins (see the `items` arrays in the two shells and the chevrons
in the nav). Brand imagery (store badges, food photos, illustrations) lives in
`assets/`. No icon font or icon library.

---

## Voice

Plain, warm, short, second person. Sentence case for everything except the
eyebrow labels.

- Headlines promise an outcome: "Your food at your doorstep in minutes", "Earn a cash reward for every vendor we approve", "Food, discovered."
- Buttons are verbs, sentence case: "Download now", "Become an affiliate", "Sign in", "Email me a code", "Go to your dashboard".
- Explain the next step, don't scold: "We'll email you a 6-digit code. No password needed."
- Errors say what happened and what to do: "We couldn't load the list of cities just now. Please refresh to try again."
- Empty states promise follow-up: "No cities are active right now. Sign up and we'll let you know when they are."
- Loading text ends with an ellipsis character: "Loading orders…", "Signing in…".
- The brand is written **Mealgro** in copy (the logo artwork says MealGro).
- Money is naira, formatted by `lib/*/format.ts` (`money()`); never hand-format amounts.

---

## Do / Don't

**Do**

- Use `#D62300` for every red UI element; `#BD1F00` for its hover.
- Use MADE Tommy Soft. In the app, inherit it from `.portal`.
- Use the Mealgro logo (`assets/logo.svg`) for brand marks — `.p-brand` in the app, the global/hero logo on marketing pages.
- In the app, build pages from `p-*` classes and `var(--…)` tokens; add a class to `portal.css` (or `affiliate.css` for affiliate-only) instead of a one-off.
- Use `#F6F6F6` for light page backgrounds and `#FFFFFF` cards.
- Add new marketing pages to `navLinks.ts` and, if the background is light, to `isRedLogoPage` in `pages/+Layout.vue`.
- Check every page at 375px and at ≥1440px; the desktop nav disappears at ≤1024px, so the page must bring its own mobile topbar.

**Don't**

- Don't use system fonts (`ui-sans-serif`, `system-ui`) as the primary face.
- Don't draw a letter-in-a-square as a logo.
- Don't use `#FF2509` (logo red) or Tailwind reds for buttons and text.
- Don't introduce new greys or warm beiges (`#F7F4F1` etc.) for page backgrounds; use paper `#F6F6F6`.
- Don't use navy `#0E172B` outside the nav.
- Don't hard-code hex colours in app pages; use the `.portal` variables.
- Don't add inline `style=""` for anything but a computed value (e.g. chart bar widths); use the `.p-m*` spacing classes.
- Don't run a formatter over the whole repo.

---

## Known drift

None that can be changed in a style pass. Two things are deliberate:

- Near-black has three values: `#121212` (marketing sections), `#17130F` (editorial pages and the app, `--ink`), `#000000` (hero bands, footer). They read as one black; new work uses `#121212` on marketing pages and `var(--ink)` elsewhere. Rewriting every committed section to one value would touch most of the site for no visible change.
- `pages/+Layout.vue` and `pages/tailwind.css` both set the font family. The layout copy covers `body`, the Tailwind base covers every element; keep them in step if the stack ever changes.

---

## v2 visual system: vendor portal and affiliate area

The signed-in areas (`/account/*` vendor portal, `/affiliate/(app)/*`) share the
v2 visual system of the admin console (see `mealgro-admin/brand.md`): ink rail,
pill buttons and tabs, 28px cards, one bold ink panel per page, coloured tiles,
display type for headlines and numbers, a shape beside every colour, motion on
arrival only, and Day / Night / System. The marketing site keeps the red and
MADE Tommy Soft sections above. Everything lives in `components/portal/portal.css`
(scoped to `.portal`); the affiliate area only overrides the palette in
`components/affiliate/affiliate.css`.

**Vendor portal palette (Mealgro colour profile)**

| Token | Day | Night |
| --- | --- | --- |
| `--bg` paper | `#F6F6F6` | `#14100D` |
| `--surface` | `#FFFFFF` | `#1E1915` |
| `--ink` | `#17130F` | `#F6F1EC` |
| `--muted` | `#5F574F` | `#BDB3A9` |
| `--line` | `#E8E2DC` | `#352C26` |
| `--brand` (red) / `--brand-deep` hover | `#D62300` / `#B81D00` | `#FF5A3C` / `#FF7A5F` |
| `--cat-1` red, square `sh-sq` | `#D62300` | `#FF5A3C` |
| `--cat-2` yellow, circle `sh-ci` / card `sh-cd` | `#FFE100` | same |
| `--cat-3` ink, | `#17130F` | `#F6F1EC` |
| `--cat-4` mint, diamond `sh-di` | `#19B98A` | same |
| ok / warn / bad | `#17803D` / `#8A4400` / `#B42318` | `#3DD6A0` / `#FFC866` / `#FF8A7A` |

**Affiliate palette:** the cobalt/rose/sun/mint set (`--brand #2F3BFF`, `--cat-1..4`), with an ink primary button.

**Shared classes** (`portal.css`): `.p-hero` (the ink panel, `.p-hero-h` its small title), `.p-tile` + `.tone-1..4` (coloured tiles; `a.p-tile` lifts on hover; `.p-tile.p-card` is the plain white one), `.sh` + `.sh-sq|ci|cd|di|tr` (shapes, colour from `--c`), `.arrive` (stagger with `style="--i: n"`), `.grow-x` (bars), `.p-card`, `.p-btn`, `.p-badge` (gets a shape automatically), the old `p-*` helpers. Page headings use `h1`-`h3` (Bricolage Grotesque 800); card headings 19px.

**Theme:** `lib/theme.ts` + `components/portal/ThemeSwitch.vue` (sidebar). Day / Night set `data-theme` on `<html>` (saved in `localStorage` as `mg.theme`); Auto removes it so `prefers-color-scheme` decides. Dark-only values are written twice: for `:root[data-theme="dark"]` and for the OS query with `:root:not([data-theme="light"])`.

**Worked examples:** `pages/account/+Page.vue` (hero + tiles), `pages/account/reports/+Page.vue`, `pages/account/subscription/+Page.vue`, `pages/affiliate/(app)/dashboard/+Page.vue`.
