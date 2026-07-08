# Design System — Multi-Brand Marketing Funnel Dashboard

## Overview

This is a **light-mode, data-density-first dashboard system** — the visual opposite of a marketing site. Where a product page earns trust through restraint and whitespace, this dashboard earns trust through **legibility, clear hierarchy between metric and label, and confident use of a single deep-navy anchor color**. Every surface is white or near-white; color is spent deliberately — navy for structure and primary actions, green exclusively as the "positive/live data" signal (conversion rate, success states), and a quiet neutral gray scale carrying everything in between.

Density is moderate-to-high by design: this is an internal tool meant to be scanned at a glance during a stand-up, not admired. Cards are tight, borders are thin and functional, and elevation is minimal — a single soft shadow used sparingly to lift the active brand's data above the page, never decoratively.

**Key Characteristics:**
- Light-mode only. White canvas, navy structure, green as the single "good news" accent.
- One primary brand color (`{colors.primary}` — deep navy #030835) carries headers, primary buttons, active nav states, and key numerals.
- One secondary color (`{colors.secondary}` — #00AB3A) reserved for positive metrics, success states, and the conversion-rate figure specifically — it should always read as "this number is good."
- Heading/body font pairing: DM Sans for all headings and numerals, Elms Sans for body/UI text — a geometric-on-geometric pairing kept legible via generous body line-height.
- Flat utility cards with thin hairline borders; one soft elevation level reserved for the active state.
- No gradients, no dark mode, no decorative chrome — every visual choice serves faster reading of metrics.

## Colors

> **Defined by project owner:** Primary `#030835`, Secondary `#00AB3A`. Neutrals below are recommended to complete the system — chosen to sit quietly behind the navy/green pairing without competing, and to meet WCAG AA contrast against white at body-text sizes.

### Brand & Accent
- **Primary Navy** (`{colors.primary}` — #030835): The structural anchor. Used for page headers, primary button fills, active dropdown state, the dashboard logo/wordmark, and any numeral that represents raw volume (Sitewide Views, Form Views). This is the "this is the system speaking" color.
- **Primary Navy Hover** (`{colors.primary-hover}` — #0a1352): A lifted step for hover/active states on navy buttons — avoid pure-black overlays on a color already this dark.
- **Primary Navy Tint 10** (`{colors.primary-tint-10}` — #e8e9ef): A near-white wash of navy, used as the active-state background on the brand dropdown and selected nav items — gives "selected" a color identity without needing a heavy fill.
- **Secondary Green** (`{colors.secondary}` — #00AB3A): Reserved exclusively for positive/live signals — the Conversion Ratio card, success toasts, and the "live" status dot. Do not use as a second general-purpose action color; if green appears, it should always mean "this metric is healthy."
- **Secondary Green Tint 10** (`{colors.secondary-tint-10}` — #e5f7ea): Background fill for the Conversion Ratio metric card, distinguishing it visually from the three neutral metric cards beside it.
- **Secondary Green Dark** (`{colors.secondary-dark}` — #00802b): Text-safe darker variant of green, used when green text needs to sit on a light background and meet contrast requirements (e.g. the conversion percentage number itself, rather than relying on the lighter tint for text).

### Neutrals (recommended)
- **Canvas White** (`{colors.canvas}` — #ffffff): The dominant page and card background.
- **Canvas Off-White** (`{colors.canvas-subtle}` — #f7f8fa): Page background behind cards, giving white cards a surface to sit on rather than disappearing into pure white-on-white.
- **Hairline** (`{colors.hairline}` — #e3e5ea): 1px borders on metric cards, the dropdown, and table/grid dividers.
- **Hairline Strong** (`{colors.hairline-strong}` — #d0d3da): Used for input borders and the dropdown's resting-state border — slightly more present than the card hairline since inputs need to read as interactive.
- **Ink** (`{colors.ink}` — #14161f): Primary text color for headings and metric values — a near-black with a faint navy undertone rather than pure black, to stay visually consistent with the navy brand color.
- **Body Text** (`{colors.body}` — #3a3d4a): Default paragraph/label text — softer than Ink, used for metric card labels ("Sitewide Views," "Form Views") and supporting copy.
- **Muted Text** (`{colors.muted}` — #767a87): Secondary/meta text — timestamps, "Last updated," fine print.
- **Disabled** (`{colors.disabled}` — #b3b6bf): Disabled button text and inactive states.

### Status (functional, not decorative)
- **Error Red** (`{colors.error}` — #c4332e): Error-block text and icon. Used only for the partial/total failure states described in the implementation PRD — never decoratively.
- **Error Red Tint** (`{colors.error-tint}` — #fbeceb): Background fill for an errored metric card.
- **Warning Amber** (`{colors.warning}` — #b3760a): Reserved for the zero-view edge case ("Conversion rate unavailable — no form views recorded") — distinct from a true error.

### Brand Gradient
**None.** Consistent with the dashboard's utility-first posture, no gradient tokens are defined anywhere in this system. Depth comes from the single soft shadow (see Elevation) and the navy/green tint fills — not from gradients.

## Typography

### Font Family
- **Heading**: `DM Sans, system-ui, -apple-system, sans-serif` (Google Font) — used for all headings, the dashboard title, card labels at their largest weight, and every metric numeral. DM Sans's geometric clarity makes large numbers easy to scan at a glance.
- **Body / UI**: `Elms Sans, system-ui, -apple-system, sans-serif` (Google Font) — used for body copy, card sub-labels, button text, and nav links.

  **Known tradeoff:** Elms Sans has been flagged by some type reviewers as less optimized for dense body copy than for headings/display use. To compensate: body sizes in this system run at a slightly looser line-height (1.55 rather than the more typical 1.4–1.47) and never drop below 14px for running text. If body legibility still feels tight once built, the documented fallback is to substitute **Inter** at the body weight only, keeping DM Sans for headings — flag this to the design owner if it comes up during build.
- **Numeral treatment**: All metric values (the large numbers in metric cards) use DM Sans at `{typography.metric-value}`, with `font-variant-numeric: tabular-nums` so figures don't shift width as they update on brand-switch — important for a dashboard where numbers refresh live.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.page-title}` | 28px | 700 | 1.2 | -0.2px | Dashboard page header ("Marketing Funnel Dashboard") |
| `{typography.metric-value}` | 36px | 700 | 1.1 | -0.4px | The large number inside each metric card |
| `{typography.metric-value-sm}` | 28px | 700 | 1.15 | -0.3px | Metric value on mobile / compact card |
| `{typography.section-heading}` | 18px | 600 | 1.3 | 0 | Card section headers, dropdown label ("Select Brand") |
| `{typography.body}` | 15px | 400 | 1.55 | 0 | Default UI copy, error/status messages |
| `{typography.body-strong}` | 15px | 600 | 1.5 | 0 | Emphasized inline text |
| `{typography.metric-label}` | 14px | 500 | 1.4 | 0.1px | Metric card label ("Sitewide Views") |
| `{typography.caption}` | 13px | 400 | 1.45 | 0 | "Last updated," helper text under inputs |
| `{typography.button}` | 14px | 600 | 1 | 0.1px | All button labels |
| `{typography.fine-print}` | 12px | 400 | 1.4 | 0 | Footer/legal-style fine print, if any |

### Principles
- **DM Sans owns every number.** Any time a figure is the focal point of a card, it's DM Sans Bold with tabular numerals — this is the dashboard's version of Apple's "negative letter-spacing at display sizes": a consistent, recognizable treatment for the thing that matters most on the page.
- **Elms Sans owns every label.** Card labels, button text, and nav copy stay in Elms Sans at Medium (500) or Regular (400) — never Bold, to keep visual weight pointing at the numbers, not the labels.
- **Body line-height is generous (1.55), not tight.** Unlike a marketing site optimized for short punchy lines, this dashboard's body copy (error messages, helper text) needs to read clearly on a quick glance — looser leading helps compensate for Elms Sans's noted body-copy density tradeoff.
- **Weight ladder: 400 / 500 / 600 / 700.** No 300 (too quiet for a data tool), no 800+ (too loud). 700 is reserved for the page title and metric values only — using it anywhere else dilutes its job as "this is the important number."

### Google Fonts Setup
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Elms+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```
Or via `next/font/google` if building in Next.js:
```js
import { DM_Sans } from 'next/font/google';
// Elms Sans may not yet be available via next/font/google's curated list since it's a newer
// addition to the Google Fonts catalog — verify availability at build time; fall back to the
// <link> method above if next/font doesn't resolve it.
```

## Layout

### Spacing System
- **Base unit:** 8px.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px.
- **Page padding:** 32px desktop, 16px mobile.
- **Card padding:** `{spacing.lg}` (24px).
- **Grid gutters:** `{spacing.md}` (16px) between metric cards.

### Grid & Container
- **Max content width:** 1200px, centered, with `{spacing.xl}` page margins beyond that.
- **Metric grid:** 4-column on desktop (≥1024px), 2-column on tablet (640–1023px), 1-column stacked on mobile (<640px) — matching the four metric cards in the PRD (Sitewide Views, Form Views, Report Conversions, Conversion Ratio).
- **Header row:** flex row, dashboard title left-aligned, brand dropdown right-aligned, on a single horizontal band above the metric grid.

### Whitespace Philosophy
Unlike a marketing site where whitespace is luxury, here whitespace is a **scanning aid**: enough space around each metric card that the eye can isolate one number at a time, but not so much that four related metrics feel disconnected from each other. 16px between cards, 24px inside them — tight enough to read as "one funnel," generous enough that no number visually collides with another.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, 1px `{colors.hairline}` border | Default metric card, default dropdown, page background |
| Soft lift | `rgba(3, 8, 53, 0.06) 0px 2px 8px` | Dropdown open state, any card actively loading new data |
| Active highlight | `{colors.primary-tint-10}` background, no shadow | Selected dropdown option |
| Status tint | `{colors.error-tint}` / `{colors.secondary-tint-10}` background fill | Errored or positive-signal metric card respectively |

**Shadow philosophy.** Shadows here are functional, not photographic — they exist only to indicate "this is currently active/loading," not to add visual richness. A resting dashboard should look almost entirely flat; the moment something is mid-fetch or just-selected is the only moment a shadow appears.

## Icon System

**Library: Phosphor Icons** (`@phosphor-icons/react`).

- **Weight:** `regular` is the default and near-exclusive choice across the dashboard — matches the system's flat, unembellished visual language (no `fill`, `duotone`, or `bold` weights, which would introduce a heavier visual texture this system otherwise avoids). The one exception: `{component.status-dot-live}` may use a small filled dot shape, but that's a solid circle, not a Phosphor icon weight variant.
- **Sizing:** 16px for inline/button icons (dropdown chevron, inline status icons), 20–24px for nav/header icons, 40–48px for empty-state and error-block illustrative icons.
- **Color:** icons inherit color via the `color` prop mapped to the relevant token — `{colors.muted}` for neutral/empty-state icons, `{colors.error}` for error icons, `{colors.primary}` for active/structural icons (e.g. dropdown chevron in its open state), `{colors.secondary}` only if an icon is directly attached to a positive-signal element (e.g. a small check icon next to "Live").
- **Recommended icons for this build:**
  - `CaretDown` — dropdown trigger chevron
  - `ChartBar` or `Tray` — empty-state illustrative icon
  - `WarningCircle` — error-block icon
  - `CircleNotch` (with a spin animation) — loading spinner in the brand dropdown
  - `ArrowClockwise` — retry button icon, paired with the "Retry" label in `{component.error-block}`

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.sm}` | 6px | Buttons, the brand dropdown trigger, status badges |
| `{rounded.md}` | 10px | Metric cards |
| `{rounded.lg}` | 14px | The page-level container card, if the dashboard is presented inside one outer card |
| `{rounded.pill}` | 9999px | The "Live" status dot's container, error/success inline badges |

No `{rounded.none}` usage by default — this is a software UI, not a photographic tile system, so hard rectangular edges aren't part of the language here.

## Components

### Header

**`dashboard-header`** — Flex row, height 64px, background `{colors.canvas}`, bottom border 1px `{colors.hairline}`. Left: dashboard title in `{typography.page-title}`, color `{colors.ink}`. Right: `{component.brand-dropdown}`.

### Brand Dropdown

**`brand-dropdown`** — The single most important interactive element on the page. Resting state: background `{colors.canvas}`, 1px solid `{colors.hairline-strong}` border, rounded `{rounded.sm}` (6px), padding 8px × 14px, text in `{typography.body-strong}`, color `{colors.ink}`. Includes a small chevron icon in `{colors.muted}`.
- **Open state**: `{component.brand-dropdown-open}` — elevation upgrades to "Soft lift," border color shifts to `{colors.primary}`.
- **Selected option**: background `{colors.primary-tint-10}`, text `{colors.primary}` at `{typography.body-strong}`.
- **Loading (brand switch in progress)**: dropdown trigger text dims to `{colors.muted}` and a small inline spinner (16px, `{colors.primary}` stroke) appears to the right of the chevron — this directly supports the loading-state requirement from the implementation PRD (§6).

### Metric Cards

**`metric-card`** — Background `{colors.canvas}`, 1px solid `{colors.hairline}` border, rounded `{rounded.md}` (10px), padding `{spacing.lg}` (24px). Structure top-to-bottom: label in `{typography.metric-label}` color `{colors.body}` → value in `{typography.metric-value}` color `{colors.ink}` (or `{colors.secondary-dark}` for the Conversion Ratio card specifically).

**`metric-card-positive`** — Variant used only for the Conversion Ratio card. Background `{colors.secondary-tint-10}` instead of plain white, value text color `{colors.secondary-dark}`. This is the one card on the page allowed to break the neutral-white pattern, since conversion rate is the dashboard's "headline" metric.

**`metric-card-loading`** — Skeleton state. Label and value are replaced with pulsing gray bars (`{colors.hairline}` background, subtle opacity animation), card border stays `{colors.hairline}`, no shadow — keeps the loading state calm rather than flashy.

**`metric-card-error`** — Background `{colors.error-tint}`, border 1px `{colors.error}`, value replaced with "—" in `{colors.error}`, and a small caption below in `{typography.caption}` reading e.g. "Unavailable" — supports the partial-failure contract from the implementation PRD (§4/§6), where one card can independently show an error state while others render normally.

### Buttons

**`button-primary`** — Background `{colors.primary}`, text `{colors.canvas}` (white) in `{typography.button}`, rounded `{rounded.sm}` (6px), padding 10px × 18px. Hover: background `{colors.primary-hover}`. Used for the retry action in `{component.error-block}`.

**`button-secondary`** — Background transparent, text `{colors.primary}`, 1px solid `{colors.hairline-strong}` border, rounded `{rounded.sm}`, padding 10px × 18px. Used for any secondary action (none currently required by the PRD, reserved for future use).

### Status Indicators

**`status-dot-live`** — 8px circle, `{colors.secondary}` fill, paired with the text "Live" in `{typography.caption}` color `{colors.secondary-dark}` — optional indicator near "Last updated" if the team wants a visual heartbeat cue.

**`error-block`** — Full-width replacement for the metric grid when both data sources fail (per implementation PRD §4 — total failure case). Background `{colors.error-tint}`, border 1px `{colors.error}`, rounded `{rounded.md}`, padding `{spacing.xl}`, centered icon (Phosphor `<WarningCircle weight="regular" size={40} color="var(--color-error)" />`) + message in `{typography.body}` color `{colors.error}`, followed by `{component.button-primary}` reading "Retry."

### Footer / Meta Row

**`meta-row`** — Sits below the metric grid. Text in `{typography.caption}`, color `{colors.muted}`: "Last updated [timestamp]" sourced from the API's `fetchedAt` field (per implementation PRD §4).

### Empty State

**Built on shadcn/ui's `Empty` primitive** (`Empty` → `EmptyHeader` → `EmptyMedia` / `EmptyTitle` / `EmptyDescription`, plus `EmptyContent` for actions) — chosen over a custom-built component since it's a maintained, accessible composition pattern rather than something to reinvent.

**`empty-state-brand`** — Shown when a selected brand returns zero recorded data across both sources (not an error — a real "nothing here yet" state, distinct from `{component.error-block}`). Structure:
- `EmptyMedia` (icon variant): a 48px icon in `{colors.muted}` — use a neutral data-absence icon from **Phosphor Icons** (`@phosphor-icons/react`), e.g. `<ChartBar weight="regular" size={48} color="var(--color-muted)" />` or `<Tray weight="regular" size={48} />` — never `{colors.error}` or `{colors.secondary}` as the icon color, since this isn't a failure or a success — it's a legitimate absence of data. Stick to `weight="regular"` across all dashboard icons (not `"fill"`, `"duotone"`, or `"bold"`) to match the system's otherwise flat, unembellished visual language.
- `EmptyTitle`: `{typography.section-heading}`, color `{colors.ink}` — e.g. "No funnel activity yet."
- `EmptyDescription`: `{typography.body}`, color `{colors.body}` — e.g. "Brand B hasn't recorded any page views or downloads in the connected systems yet."
- `EmptyContent`: optional `{component.button-secondary}` ("Switch Brand") if a sibling brand has live data — omit entirely if both brands are empty, since there's nowhere useful to send the user.

**Container treatment:** background `{colors.canvas-subtle}`, border 1px `{colors.hairline}`, rounded `{rounded.lg}` (14px), padding `{spacing.xxl}` (48px), replacing the full metric grid (same slot as `{component.error-block}`, but visually calmer — no red, no warning tone).

**Distinguishing the three "nothing rendered" states**, since they're easy to conflate during build:

| State | Trigger | Color language | Component |
|---|---|---|---|
| Error | Both API/DB sources failed | `{colors.error}` / `{colors.error-tint}` | `{component.error-block}` |
| Empty | Sources succeeded, returned zero records | Neutral — `{colors.muted}` / `{colors.canvas-subtle}` | `{component.empty-state-brand}` |
| Loading | Request in flight | `{colors.hairline}` skeleton pulse | `{component.metric-card-loading}` |

**Per-card empty handling:** if only the *download/conversion* side is legitimately zero (e.g. brand has views but no downloads yet) while sitewide/form views are non-zero, don't swap to the full `empty-state-brand` block — that's a partial, normal data state, not an empty dashboard. In that case, the individual `{component.metric-card}` simply renders `0` as its value (per the existing zero-view handling in `lib/calc.js`), not an empty-state treatment. `empty-state-brand` is reserved for when *all four* metrics are zero/null simultaneously.

### Data Visualization (reserved, not active this phase)

The implementation PRD explicitly excludes historical trends and charting in this phase — no chart renders anywhere in the current build. These tokens are defined now, sourced from **shadcn/ui's `ChartContainer` + Recharts pairing**, so that if/when Phase 2 introduces trend lines, the visual language is already decided rather than improvised later.

- **Chart primitive**: `ChartContainer` (shadcn/ui) wrapping Recharts components (`LineChart`, `BarChart`, `AreaChart`) — consistent with how shadcn structures all of its chart variants.
- **Line/bar color mapping**: a single-series chart (e.g. conversion rate over time) uses `{colors.secondary}` (#00AB3A) as the data line/bar color, with `{colors.secondary-tint-10}` as the area-fill if an area chart is used — keeping the "green = the metric that matters" rule consistent with the metric-card treatment.
- **Volume-series mapping**: a chart tracking raw views/impressions (not a rate) uses `{colors.primary}` (#030835) as the data color, mirroring how `{component.metric-card}` (the neutral cards) use navy for value text today.
- **Grid lines**: `{colors.hairline}`, never darker — chart gridlines should recede behind the data line.
- **Tooltip**: background `{colors.canvas}`, border 1px `{colors.hairline}`, rounded `{rounded.sm}`, text `{typography.caption}` — matches shadcn's default `ChartTooltipContent` styling, just retokenized to this system's neutrals.
- **Axis labels**: `{typography.caption}`, color `{colors.muted}`.

**Do not build this now.** This section exists purely so Phase 2 doesn't have to guess at color/typography decisions — no chart component should ship in the current dashboard build per the PRD's explicit scope exclusion.

## Do's and Don'ts

### Do
- Use `{colors.primary}` (#030835) for structural elements — headers, dropdown active state, default metric values, primary button fills.
- Reserve `{colors.secondary}` (#00AB3A) strictly for the Conversion Ratio card and genuine positive/success signals. If you find yourself reaching for green anywhere else, use a navy tint instead.
- Keep all metric numerals in DM Sans Bold with tabular numerals so values don't jitter in width when refreshing.
- Use the loosened 1.55 body line-height throughout to offset Elms Sans's body-copy density tradeoff.
- Let a single metric card show an error or loading state independently of the others — never block the whole grid for a partial failure.

### Don't
- Don't use green for anything that isn't a positive/healthy signal — it should never become a generic accent color.
- Don't add shadows to resting-state cards; shadow is reserved for active/loading/open states only.
- Don't set body copy below 14px — this is a glance-and-go internal tool, not a dense editorial page.
- Don't mix in a second heading font "just for variety" — DM Sans owns every heading and every number, full stop.
- Don't use `{colors.error}` decoratively; it appears only inside `{component.metric-card-error}` and `{component.error-block}`.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | ≤ 639px | Metric grid stacks to 1 column; header wraps to 2 rows (title, then dropdown full-width below it) |
| Tablet | 640–1023px | Metric grid becomes 2-column; header stays single row |
| Desktop | ≥ 1024px | Metric grid is full 4-column; max content width 1200px |

### Touch Targets
- Brand dropdown trigger: minimum 44px height on mobile, even though desktop default is closer to 36px.
- Buttons: minimum 44 × 44px hit area on mobile via padding, even if visual size stays compact.

### Collapsing Strategy
- **Header**: title + dropdown side-by-side on tablet/desktop → stacked (title above, full-width dropdown below) on mobile.
- **Metric grid**: 4-col → 2-col (1023px) → 1-col (639px), matching the breakpoints already defined in the implementation PRD's frontend section.

## Iteration Guide

1. Reference component tokens directly (`{component.metric-card-positive}`, `{component.brand-dropdown-open}`) rather than describing them freehand.
2. Use `{token.refs}` everywhere — never inline hex in component code.
3. Document only Default / Loading / Error / Active states — no hover-only states beyond what's specified above.
4. DM Sans Bold + tabular-nums is non-negotiable for any number a user is meant to read at a glance.
5. Green is a signal, not a palette color — every use should be checked against "is this actually good news?"
6. When adding a new component, default to the neutral palette first; only reach for navy or green if the component needs to communicate structure (navy) or a positive outcome (green).

## Known Gaps

- Dark mode is explicitly out of scope per project direction — this system is light-mode only and no dark-mode token set has been defined.
- Elms Sans's real-world body-copy legibility at small sizes hasn't been validated in this specific dashboard's context yet — flagged above as a tradeoff to watch during build, with Inter as a documented fallback for body text only if needed.
- **shadcn/ui dependency**: `{component.empty-state-brand}` assumes the project installs shadcn's `Empty` primitive (`npx shadcn add empty`) and the reserved chart tokens assume `ChartContainer` + Recharts if Phase 2 charting is ever built. If the project isn't using shadcn/ui as its component foundation, both sections will need re-platforming onto whatever primitive library is in use — flag this before build if shadcn isn't already part of the stack.
