# Mealgro web — brand reference

> **November 2026: the home, vendor, rider and public affiliate pages were
> rebuilt in the admin's v2 system** (owner's call: "the new design similar to
> the admin"). They are described in [Rebuilt marketing pages](#rebuilt-marketing-pages-v2)
> below and follow the portal tokens, not the marketing tokens. The rest of the
> marketing site (about, contact, legal, status, account deletion, error) still
> uses the older red / MADE Tommy Soft look described next, until it is rebuilt.

The reference for every change to mealgro.com. The site has **two surfaces that
are different designs on purpose**: the marketing site, and the signed-in
portals. They share the Mealgro logo and the product name, and nothing else:
not the palette, not the fonts, not the components, not the CSS. Don't carry a
pattern from one into the other.

| Surface | Pages | Look | Styling lives in |
| --- | --- | --- | --- |
| **Marketing** | `/`, `/vendors`, `/riders`, `/about`, `/contact`, `/terms`, `/privacy`, `/account-deletion`, `/affiliate` (public landing), `/status`, `_error` | Brand red `#D62300`, MADE Tommy Soft, big display type, photography | Scoped `<style>` per component, some Tailwind utilities |
| **Portals** | `/account/*` (vendor portal), `/affiliate/(app)/*` (affiliate area: dashboard, wallet, bank, referrals, profile, sign-in, sign-up) | The admin console's **v2 visual system**: ink and paper, cobalt / rose / sun / mint with a shape each, Bricolage Grotesque + Instrument Sans, light and dark | `components/portal/tokens.css` + `components/portal/portal.css`, scoped to `.portal` |

The portals follow `mealgro-admin/brand.md` (the source of truth for v2). This
file records how this repo applies it. The marketing sections below describe
the marketing site only; the portal sections start at
[Portals](#portals-vendor-portal-and-affiliate-area).

---

## Tokens (marketing)

There is no Tailwind theme or global CSS-variable file for the marketing site.
Colours are written in component CSS. Use these exact values. (The portals have
their own tokens, in `components/portal/tokens.css`; see below.)

### Colour

| Role | Value | Where it's defined / used |
| --- | --- | --- |
| **Brand red** (primary, CTAs, active nav, accents, hero backgrounds) | `#D62300` | everywhere; `--brand-red` in about/contact/legal pages |
| Brand red, pressed/hover | `#BD1F00` | base `a:hover` in `pages/tailwind.css` |
| Brand red, soft tint (chips, step cards) | `#FDECE8` (or `rgba(214, 35, 0, 0.08)` on paper) | `--brand-red-soft` |
| Logo red / illustration red | `#FF2509` | `assets/logo.svg`, food-section accents (`LocationSection`, `DownloadNowSection`, `VehicleSection`). Don't use it for UI — UI red is `#D62300` |
| Accent yellow (FAQ panels, legal highlights) | `#FFE100` | `components/*/FAQSection.vue`, `--brand-yellow` |
| Ink (body and headings, marketing) | `#121212` | home/vendors/riders sections, dark CTA buttons |
| Ink (editorial pages) | `#17130F` | `--ink` in about/contact/legal pages |
| Nav ink | `#0E172B` | `Navigation.vue`, `NavDropdown.vue` only |
| Muted text | `#6B635B` (≈ `rgba(23, 19, 15, 0.64)`) | `--ink-soft` on the editorial pages |
| Grey copy on light sections | `#8D8A8A` | home/vendors marketing paragraphs |
| Pure black (hero bands, Download CTA, footer) | `#000000` | `HeroSection`, `Footer` |
| Paper (light page background) | `#F6F6F6` | marketing sections, `--paper` |
| Surface / card | `#FFFFFF` | `--card` |
| Line (borders) | `rgba(23, 19, 15, 0.12)` (editorial), `#E5E5E5` / `#D9D9D9` (marketing) | `--paper-line` |
| Success | `#17803D` on `#E4F5EA` | `/status` |
| Warning | `#B45309` on `#FDF1DC` (banner text `#7A3D06`) | `/status`, the paused banner on the public affiliate page |
| Error | `#B42318` on `#FDE8E6` | `/status` |

### Radius

| Use | Value |
| --- | --- |
| Pills, badges, chips, round buttons | `999px` |
| Marketing CTA buttons | `16px`–`20px` (hero Download `20px`, affiliate landing `16px`) |
| Marketing feature cards / panels | `22px`–`24px` (large decorative panels go up to `40px`–`54px`) |
| Nav bar, dropdown | `16px` bar, `12px` menu, `8px` items |

### Spacing and layout (marketing)

- Marketing content width: `max-width: 1100px`–`1400px`, side gutter `clamp(16px, 5vw, 72px)`; sections `88px` vertical (`64px` under 860px).
- Desktop nav sits absolutely at `top: 20px`, centred, white bar `801px × 83px`.

### Shadows

- Nav dropdown: `0 10px 30px rgba(14, 23, 43, 0.12)`
- Toasts: `0 6px 24px rgba(0, 0, 0, 0.15)`
- Active tab: `0 1px 2px rgba(0, 0, 0, 0.08)`
- FAQ tab: `4px 4px 8px rgba(0, 0, 0, 0.15)`

Cards otherwise use a 1px border, not a shadow.

---

## Typography

**One family on the marketing site: MADE Tommy Soft**, loaded by
`pages/fonts.css` (weights 100–900, plus an Outline family for decoration) and
applied globally in `pages/tailwind.css` and `pages/+Layout.vue`. The portals
do not use it (they use Bricolage Grotesque and Instrument Sans). The only other
marketing face is monospace (`--mono`) for small labels and codes on the
editorial pages.

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


---

## Components to reuse (marketing)

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

### Icons (both surfaces)

Inline SVG, 24×24 viewBox, `stroke="currentColor"`, `stroke-width` 1.5–2,
round caps and joins (see the `items` arrays in the two shells and the chevrons
in the nav). Brand imagery (store badges, food photos, illustrations) lives in
`assets/`. No icon font or icon library.

---

## Voice (marketing)

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

## Do / Don't (marketing)

**Do**

- Use `#D62300` for every red UI element; `#BD1F00` for its hover.
- Use MADE Tommy Soft on every marketing page.
- Use the Mealgro logo (`assets/logo.svg`) for brand marks: the global/hero logo on marketing pages.
- Use `#F6F6F6` for light page backgrounds and `#FFFFFF` cards.
- Add new marketing pages to `navLinks.ts` and, if the background is light, to `isRedLogoPage` in `pages/+Layout.vue`.
- Check every page at 375px and at ≥1440px; the desktop nav disappears at ≤1024px, so the page must bring its own mobile topbar.

**Don't**

- Don't use system fonts (`ui-sans-serif`, `system-ui`) as the primary face.
- Don't draw a letter-in-a-square as a logo.
- Don't use `#FF2509` (logo red) or Tailwind reds for buttons and text.
- Don't introduce new greys or warm beiges (`#F7F4F1` etc.) for page backgrounds; use paper `#F6F6F6`.
- Don't use navy `#0E172B` outside the nav.
- Don't use the portals' cobalt/rose/sun palette, Bricolage Grotesque or `.card-box` on a marketing page.
- Don't run a formatter over the whole repo.

---


## Known drift (marketing)

Two things are deliberate:

- Near-black has three values: `#121212` (marketing sections), `#17130F` (editorial pages, `--ink`), `#000000` (hero bands, footer). They read as one black; new work uses `#121212` on marketing pages. Rewriting every committed section to one value would touch most of the site for no visible change.
- `pages/+Layout.vue` and `pages/tailwind.css` both set the font family. The layout copy covers `body`, the Tailwind base covers every element; keep them in step if the stack ever changes.

---

# Portals: vendor portal and affiliate area

`/account/*` (vendor portal) and `/affiliate/(app)/*` (affiliate area) are
**apps, not pages of the marketing site**. They look like the admin console
(`mealgro-admin`): ink and paper, three loud colours that each belong to one
kind of thing, big rounded cards, one bold hero panel per page, display type for
headlines and numbers, a shape beside every colour, motion on arrival only, a
light and a dark theme. Read `mealgro-admin/brand.md` first; it is the source of
truth, and where this file and that one disagree, that one wins. A portal screen
that disagrees with it is a bug in the screen. The vendor portal and the
affiliate area are **one design**: same tokens, same frame, same components.
(The vendor portal used to be brand red and yellow; it is cobalt, rose and sun
now, like the affiliate area and the console.)

Both areas ship `ssr: false` and are wrapped only by their own layout (the
affiliate area's `+Layout.ts`; the vendor portal's pages wrap themselves in
`PortalShell`), never the marketing navigation.

## Where things live

| What | File |
| --- | --- |
| **Every colour value of the portals** (light, dark, OS dark) | `components/portal/tokens.css`. The only file allowed to hold a hex / `rgb()` / `oklch()` |
| All portal CSS (reset, type, buttons, fields, badges, alerts, tables, tabs, shapes, hero, tiles, lists, states, dialogs, motion, phone rules) | `components/portal/portal.css`, scoped to `.portal` |
| Theme (sun/moon, Auto = follow the OS) | `lib/theme.ts`, `components/portal/ThemeToggle.vue` |
| The frame: ink rail, top bar, drawer, toasts, confirm dialog | `components/portal/PortalFrame.vue`; `PortalShell.vue` (vendor) and `components/affiliate/AffiliateShell.vue` only say what goes in the rail |
| Sign-in / sign-up | `components/portal/AuthLayout.vue` |
| "Continue with Google / Apple" under a sign-in form | `components/portal/SocialSignIn.vue` (`.p-or`, `.p-social`, `.p-btn--apple` in `portal.css`); the flow and error words in `lib/portal/social.ts`. Google draws its own white pill; Apple's is an ink pill (black in the day, white at night) with Apple's mark. Hidden unless `PUBLIC_ENV__GOOGLE_CLIENT_ID` / `PUBLIC_ENV__APPLE_CLIENT_ID` is set |
| Hero panel, tiles | `HeroPanel.vue`, `StatTile.vue` |
| Loading / empty / error | `StateBlock.vue` (cards), `TableState.vue` (table rows) |
| Dialogs | `Modal.vue` (collects input), `ConfirmHost.vue` + `lib/portal/confirm.ts` (`confirmAction`, replaces `window.confirm` / `prompt`), `ToastHost.vue` (fed by `lib/portal/toast.ts`, `lib/affiliate/toast.ts`) |

Build a pattern once, in these files. Don't copy CSS into a page's `<style>`
unless it is layout specific to that page (a grid of that page's own blocks).

## Tokens

All scoped to `.portal` (the page canvas behind it is set on `:root:has(.portal)`).
Values are the admin's `brand.md`.

| Token | Day | Night | Use |
| --- | --- | --- | --- |
| `--surface` | `#FFFFFF` | `#1B1B29` | Cards, top bar, dialogs |
| `--bg` | `#F1F0F5` | `#12121C` | Page canvas, table header, hover |
| `--line` | `#E2E0EC` | `#2D2D42` | Borders, dividers |
| `--ink` | `#12121C` | `#F1F0F5` | Text. `--muted` is ink at 70% over the surface: use it for secondary words, never lighter |
| `--brand` | `#2F3BFF` cobalt | `#7B85FF` | Primary buttons, focus, links, active states |
| `--ok` / `--on-ok` | `#0A7B55` / white | `#3DD6A0` / `#0A1F18` | Jade: success |
| `--warn` / `--on-warn` | `#FFC52E` / ink | same | Sun: warning |
| `--bad` / `--on-bad` | `#C8301A` / white | `#FF7A63` / `#2A0D07` | Vermilion: error, urgent, destructive |
| `--info` / `--on-info` | `#2F3BFF` / white | `#8A93FF` / `#0E0E18` | Cobalt: info, "Main" |
| `--cat-1`…`--cat-5` | cobalt, rose `#FF5C8A`, sun, mint `#19B98A`, ink | `#7B85FF`, rose, sun, `#3DD6A0`, `#F1F0F5` | Categories, with `--on-1`…`--on-5` for text on them |
| `--hero` / `--on-hero` | ink / white | `#1B1B29` / `#F1F0F5` | The hero panel |
| `--rail` | `#12121C` | `#0A0A12` | The rail, in both themes |

Dark values are written twice (chosen theme, and the OS query until a theme is
chosen), as in the admin. Radius: cards `1.75rem`, hero `2rem`, dialogs and
alerts `1.5rem`, buttons and inputs pill (`1.5rem` at normal height), badges
`9999px`. Cards are flat: no shadow except on floating layers (dialogs, toasts,
the drawer).

**Shapes.** Each category owns a colour and a shape: `sh-sq` cobalt, `sh-ci`
rose, `sh-cd` sun, `sh-di` mint, `sh-tr` ink. Every badge and alert carries one
as well (ok: dot, warning: ring, bad: square, info: diamond), so nothing is told
by colour alone.

**Typography.** Bricolage Grotesque 800 (`h1`–`h3`, `.disp`, `.p-big`, tile and
hero numbers, tight tracking, tabular figures) for headlines and every number
that matters; Instrument Sans for the rest; both self-hosted via
`@fontsource-variable`. Top bar title 20px display; entity name / greeting
`clamp(32px, 5vw, 48px)`; card title 20px; big numbers are sized to the tile
(`--n`, set by `StatTile` / `HeroPanel numeric`) so a figure never breaks
across lines; body 14-15px; table header 11px uppercase.

**Motion.** `.arrive` (slide up, stagger with `style="--i: n"`), `.grow-x` (bars),
`.row-in`, hover lift on linked tiles, press scale .97. Once, on arrival. The
only loop is the loading skeleton's pulse. `prefers-reduced-motion` stops
everything.

## Layout

- **Frame.** Fixed 240px ink rail + sticky 72px top bar (64px on phones) on the
  surface colour: hamburger (below 1024px), the page title as the page's `h1`,
  the sun/moon toggle. The rail holds the logo with the area's name, the branch
  switcher (vendor) or the affiliate code, the nav, and the user with Sign out.
  Below 1024px the rail is a drawer with a scrim. Page body: `p-6` (16px on
  phones), `flex-col gap-5`, full width. Pages don't render their own `h1`;
  the title is the `title` prop of the shell.
- **Page actions** go in the shell's `#actions` slot: a right-aligned toolbar row
  above the content (left-aligned on phones), not in the top bar.
- **One hero per page** (`HeroPanel`): ink in the day, a card at night. On the
  overview / reports / wallet / dashboard pages it sits in a 5-column row at
  ≥1280px (hero spans 2 or 3, coloured `StatTile`s fill the rest) and stacks
  below. Vary tile tone and size; no row of identical grey cards.
- **Cards** are `.card-box`. A card around a table is `.card-box--flush`; give
  its heading `.card-h` and `padding: 24px 24px 12px`.
- **Tables** are `.p-table` in `.p-scroll`. Under 640px every row becomes a card:
  label the cells with `data-label`; the first cell is `data-primary`, a cell that
  should span the card is `data-wide`, the button cell `data-actions`. State rows
  (`TableState`) use `data-full`. Add `table-scroll` to a table that must keep
  scrolling sideways. `.num` right-aligns figures.
- **Forms.** Label over field (`.p-field` > `span` + `.p-input`), hint `small`,
  error `.err`, checkbox `.p-check`, grouped checkboxes `fieldset.p-fieldset`.
  Dates and selects use the same pill. On phones inputs are 48px / 16px so iOS
  doesn't zoom.
- **Sign-in and sign-up** use `AuthLayout`: the ink panel (brand, a headline, the
  five shapes) beside the form card; stacked on phones; the theme toggle top
  right.
- **Phones.** Everything has a 44px touch target (`.p-btn`, tabs, inputs, rail
  links, the toggle). Dialogs become bottom sheets; tab rows scroll sideways.

## Components

| Need | Use |
| --- | --- |
| Primary / secondary / quiet / destructive button | `.p-btn--primary` (cobalt, one per area); `.p-btn` (ink outline); `.p-btn--ghost`; `.p-btn--danger` (outline) or `.p-btn--danger.p-btn--fill`. Sizes: default, `--sm`, `--block`, `--icon`. Busy: disable and change the label ("Saving…") |
| Status | `<span class="p-badge p-badge--ok\|warn\|bad\|brand">`, shape included. Plain `.p-badge` is a neutral count/flag |
| Inline message | `.p-alert` (error), `--warn`, `--ok`, `--info`; add a `.p-btn.p-btn--sm` Retry inside when the call can be repeated |
| Section tabs / filters | `.p-tabs` > `button[aria-pressed]` |
| Label / value | `<dl class="kv"><div><dt>…</dt><dd>…</dd></div></dl>` |
| Lists (notices, history) | `ul.p-list`; muted line `.sub` |
| Loading / empty / error | `StateBlock` (`loading`, `error`, `empty`, `empty-text`, `empty-hint`, `@retry`), `TableState` in a table. Never a blank card or table; prefer skeletons to "Loading…" text |
| Confirm / ask | `await confirmAction({ title, message?, confirmText?, destructive?, input? })` → `{ value }` or `null`. Every irreversible step goes through it; never `window.confirm` / `prompt` |
| Form dialog | `Modal` (Escape and scrim close it); footer buttons: ghost Cancel, then the action |
| Toast | `toast(text, "ok" \| "bad")` from `lib/portal/toast.ts` or `lib/affiliate/toast.ts` |
| Terms / rendered Markdown | `TermsText` (`.p-md`) |
| Icons | Inline SVG, 24px viewBox, stroke 1.5-2, round caps (rail icons are in the shells). No icon library |

## Voice

As in the admin: sentence case, plain and operational, buttons are short verbs,
success toasts are past-tense facts, errors say what happened, empty states say
what is absent ("No orders yet.", "Nobody here yet."), typographic quotes and
the ellipsis character, money via `lib/*/format.ts`.

## Do / Don't

- Do take every colour from a token (`var(--brand)`, `color-mix(in srgb, var(--ink) 8%, transparent)`); don't write a hex, `rgb()` or `oklch()` outside `tokens.css`.
- Do give every category, status and series a shape as well as a colour.
- Do put headlines and numbers that matter in the display face; don't use bold Instrument Sans for a figure.
- Do text on a tinted status fill in the status colour or `--ink`; don't use `--on-*` colours on tints.
- Do keep body text at 4.5:1 or better; `--muted` is the lightest allowed for words.
- Do keep a visible focus ring (global `:focus-visible`, 2px cobalt; sun on the ink panel and rail); don't remove outlines.
- Do route destructive and irreversible actions through `confirmAction`.
- Do wrap content in `.card-box`; don't hand-roll `background: var(--surface); border-radius: …`.
- Do add a new pattern to `portal.css` or a shared component, used by both areas; don't paste CSS into a page.
- Do check every page at 390px and ≥1280px, in both themes, with the OS in each scheme and with the toggle.
- Don't restyle a marketing page with any of this, or put marketing red / MADE Tommy Soft in a portal.

## Known drift

- Auth pages are an ink panel with shapes, not the admin's full-bleed `bg-login.jpeg` photo; the photo (555 KB) was not copied into this repo.
- `Modal` is a div dialog without a focus trap (Escape and click-outside close it; focus moves into it on open). The admin's native `<dialog>` would give a trap for free.


---

# Rebuilt marketing pages (v2)

`/`, `/vendors`, `/riders` and `/affiliate` (the public page). They use the
admin's v2 system, like the portals, plus an ink **stage** for video sections.
**Light only** (owner, Nov 2026): no dark theme and no day/night toggle on these
pages, whatever the device or a stored `mg.theme` says. The portals keep both.

| What | File |
| --- | --- |
| Colours | `components/portal/tokens.css`, scoped to `.portal, .site` (the dark blocks there are `.portal` only). Site-only additions there: `--stage` / `--on-stage` (ink video sections, the same in both themes) and `--app-red` (only inside phone mock-ups, so they look like the customer app) |
| All site CSS (type, buttons, shapes, tiles, steps, phone, FAQ, forms, sign-up block) | `components/site/site.css`, scoped to `.site` |
| Page frame: header, main, footer, the stylesheet | `components/site/SitePage.vue` (`app="rider"` switches the footer's download band to the rider app). `pages/+Layout.vue` leaves these paths bare (`SITE_PAGES`) |
| Header (floating ink bar, Get the app, menu under 980px) | `components/site/SiteHeader.vue`; links in `lib/site/links.ts` (`SITE_LINKS`) |
| Footer + the `#get-app` download band | `components/site/SiteFooter.vue`; store links in `lib/site/links.ts` (`null` = no listing yet, button hidden) |
| The home feed: snap slides beside one fixed phone (under the copy on phones); each slide sets the phone's scene | `components/site/FeedStory.vue` |
| The customer app rebuilt in HTML, playing real dish clips: vertical pager of stores, sideways through a store's dishes, rail (reviews, save, share, mute), dish sheet with modifiers, reviews sheet, cart. Scenes `feed`, `swipe`, `save`, `dish`, `cart` loop a scripted demo; visitors can drag and tap, and the demo resumes after 9 s. Drawn on a 390 × 844 canvas and scaled. Used on the home feed, the vendor hero and the footer | `components/site/phone/AppPhone.vue` (+ `DishSheet`, `ReviewsSheet`, `CartSheet`, `PhoneVideo`); stores, dishes, modifiers and reviews in `lib/site/phone.ts` |
| A lazy, muted, in-view-only video | `components/site/FeedClip.vue`; Pause / reduced motion via `lib/site/media.ts` |
| Hero for the other pages | `components/site/PageHero.vue` |
| Waitlist forms (Web3Forms, same keys and field names as before) | `components/site/WaitlistForm.vue` |

Media: `public/media/dish/*.mp4` are nine of Mealgro's own seed food clips
(`mealgro/data`), each named in `lib/site/phone.ts` for what it shows; 6 s,
400 px wide, muted H.264 with `+faststart` (255–495 KB) and a WebP poster of
the first frame. The drinks clips there are left out: their cups and bottles
carry other brands. `public/media/feed/rider-app.mp4` is from the rider-app
recording in `mealgro/marketing/films/capture`; `noodles.mp4` is a seed clip.
`public/media/app-icons/*.svg` are copied from `mealgro-app/assets/icons`;
`public/media/fonts/Lato-*.ttf` from `mealgro-app/assets/fonts` (SIL OFL 1.1).
The phone also uses MADE Tommy Soft from `pages/fonts.css`, whose files are
marked "PERSONAL USE": check that licence before relying on it.
The phone's colours are the app's own (`app_color.dart`), declared at the top
of `AppPhone.vue`: the one place on these pages with hex values outside the
tokens, so it matches the app it shows.
Add a clip by encoding it the same way
(`ffmpeg -an -vf scale=480:-2,fps=24 -crf 28 -movflags +faststart`) and
referencing its name from `FeedClip`.

Rules: one orchestrated arrival per page (copy rises, phone settles), nothing
loops except the clips, and clips stop for Pause and for reduced motion. Don't
name a class after a Tailwind utility (`ring`, `grid` with other meaning…):
Tailwind scans these files and its utility wins. Links in `.site` inherit colour
at zero specificity (`:where(.site) a`), so any button class can colour a link.
