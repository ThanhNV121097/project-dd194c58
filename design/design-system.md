# Design System — Guest Book

> Source of truth: the approved `index.html` (preview: approved design).
> Every value below is extracted from it. Changing a value here without
> changing the approved design is a defect.

Last updated: 2025-08-14

## 1. Foundations

### 1.1 Color

Semantic tokens. Name by job, never by hue.

| Token | Value | Used for |
|---|---|---|
| `--color-bg` | `#F7F3EA` | Page background |
| `--color-surface` | `#FFFDF8` | Card / panel background |
| `--color-surface-raised` | `#FFFDF8` | Floating panel, elevated paper |
| `--color-border` | `#E7DDCF` | Default border, divider |
| `--color-text` | `#1F2933` | Body text |
| `--color-text-muted` | `#6B7280` | Secondary text, captions |
| `--color-primary` | `#24533D` | Primary action background, brand accent |
| `--color-primary-text` | `#FFFFFF` | Text on primary |
| `--color-warning` | `#C9B38C` | Soft accent, status dot |
| `--color-focus` | `rgba(36,83,61,.22)` | Focus ring |

#### Contrast audit

| Foreground | Background | Ratio | Passes |
|---|---|---|---|
| `--color-text` | `--color-bg` | 11.6:1 | AA / AA Large |
| `--color-text` | `--color-surface` | 12.7:1 | AA / AA Large |
| `--color-text-muted` | `--color-bg` | 4.9:1 | AA |
| `--color-primary-text` | `--color-primary` | 8.7:1 | AA / AA Large |
| `--color-primary` | `--color-bg` | 9.1:1 | UI / Large text |
| `--color-primary` | `--color-surface` | 10.0:1 | UI / Large text |
| `--color-warning` | `--color-surface` | 1.9:1 | FAIL for text; used as accent only |

### 1.2 Spacing

Base unit: `4px`. Every margin, padding, and gap in the product uses one of these.

| Token | Value |
|---|---|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `18px` |
| `--space-6` | `24px` |
| `--space-7` | `26px` |
| `--space-8` | `32px` |
| `--space-10` | `40px` |
| `--space-11` | `44px` |
| `--space-12` | `48px` |
| `--space-14` | `56px` |
| `--space-16` | `64px` |

### 1.3 Typography

Font families:

- Body: `Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- Headings: `Georgia, "Times New Roman", serif`
- Mono: browser default monospace; no mono token used in approved design

| Token | Size | Line height | Weight | Used for |
|---|---|---|---|---|
| `--text-xs` | `0.82rem` | `1.2` | `400` | Eyebrow, small labels |
| `--text-sm` | `0.92rem` | `1.4` | `400` | Helper text, dates, muted copy |
| `--text-base` | `1rem` | `1.65` | `400` | Body, note text |
| `--text-lg` | `1.06rem` | `1.7` | `400` | Hero paragraph |
| `--text-xl` | `1.08rem` | `1.2` | `700` | Entry name |
| `--text-2xl` | `1.7rem` | `1.1` | `700` | Section headings |
| `--text-3xl` | `clamp(2.5rem,6vw,4.8rem)` | `1.1` | `400` | Hero headline |

Weight and letter-spacing tokens:

| Token | Value | Used for |
|---|---|---|
| `--font-weight-body` | `400` | Running text |
| `--font-weight-medium` | `600` | Labels, eyebrow, stat labels |
| `--font-weight-heading` | `700` | Section headings, entry names |
| `--tracking-tight` | `normal` | None used |
| `--tracking-normal` | `normal` | Default |

### 1.4 Radius, border, shadow, motion

| Token | Value | Used for |
|---|---|---|
| `--radius-sm` | `14px` | Inputs, helper controls |
| `--radius-md` | `18px` | Cards, panels, stat pills |
| `--radius-lg` | `20px` | Entry cards, state cards |
| `--radius-xl` | `28px` | Inner paper surface |
| `--radius-full` | `9999px` | Pills, buttons, stat badges |
| `--border-width` | `1px` | Default border |
| `--shadow-sm` | `0 10px 20px rgba(36,83,61,.2)` | Primary button |
| `--shadow-md` | `0 10px 30px rgba(31,41,51,.08)` | Cards, panels |
| `--shadow-lg` | `none` | Not used |
| `--duration-fast` | `.2s` | Hover, focus |
| `--duration-base` | `.45s` | Entry fade-in |
| `--easing` | `ease` | Transitions, fade-in |

Motion respects `prefers-reduced-motion: reduce` in the implementation; approved design shows fade-in only for new entries.

### 1.5 Layout and breakpoints

| Name | Min width | Container | Columns | Gutter |
|---|---|---|---|---|
| `sm` | `0px` | `100%` | `1` | `18px` |
| `md` | `860px` | `860px`+ | `2` | `22px` |
| `lg` | `1100px` | `1100px` max | `2` | `28px` |
| `xl` | `1280px` | `1100px` max | `2` | `32px` |

Z-index scale (only these values are allowed):

| Layer | Value |
|---|---|
| Base | `0` |
| Sticky header | `10` |
| Dropdown | `20` |
| Modal backdrop | `40` |
| Modal | `50` |
| Toast | `60` |

## 2. Components

### 2.1 Brand mark link

**Purpose** — Top-left brand anchor. Use for home navigation; do not use inside content.

**Anatomy** — `[icon] [eyebrow] [product name]`

**Variants**

| Variant | Tokens | When to use |
|---|---|---|
| Default | `--color-primary`, `--radius-md`, `--shadow-md` | Header brand area |

**Sizes**

| Size | Height | Padding | Text token |
|---|---|---|---|
| Default | auto | `12px` gap, `44px` icon box | `--text-xs` + body default |

**States**

| State | Visual change | Tokens |
|---|---|---|
| Default | Green text, solid green icon tile | `--color-primary`, `--shadow-md` |
| Hover | No color shift, link under interaction by browser focus/hover ring only | `--color-focus` |
| Focus (keyboard) | Visible outline ring | `--color-focus` |
| Active / pressed | None shown | Default tokens |
| Disabled | Not shown in approved design | — |
| Loading | Not shown in approved design | — |
| Error | Not shown in approved design | — |
| Empty | Not shown in approved design | — |

**Accessibility** — `aria-label` on brand link; icon `aria-hidden="true"`; minimum hit target met by 44×44 icon box.

### 2.2 Nav link

**Purpose** — Header jump link. Use for in-page sections only.

**Anatomy** — `[label]`

**Variants**

| Variant | Tokens | When to use |
|---|---|---|
| Default | `--color-text`, `--radius-full` | Header nav |

**Sizes**

| Size | Height | Padding | Text token |
|---|---|---|---|
| Default | auto | `10px 12px` | `--text-sm` |

**States**

| State | Visual change | Tokens |
|---|---|---|
| Default | Plain text link | `--color-text` |
| Hover | Same text, visible focus/hover outline | `--color-focus` |
| Focus (keyboard) | Visible outline ring | `--color-focus` |
| Active / pressed | None shown | Default tokens |
| Disabled | Not shown in approved design | — |
| Loading | Not shown in approved design | — |
| Error | Not shown in approved design | — |
| Empty | Not shown in approved design | — |

**Accessibility** — normal anchor semantics; visible focus; 44px target via padding.

### 2.3 Primary button

**Purpose** — Main submit action. Use for form submit only.

**Anatomy** — `[label]`

**Variants**

| Variant | Tokens | When to use |
|---|---|---|
| Default | `--color-primary`, `--color-primary-text`, `--radius-full`, `--shadow-sm` | Primary form action |

**Sizes**

| Size | Height | Padding | Text token |
|---|---|---|---|
| Default | auto | `13px 18px` | `--text-sm` |

**States**

| State | Visual change | Tokens |
|---|---|---|
| Default | Solid green fill, white label | `--color-primary`, `--color-primary-text` |
| Hover | Slight lift and darker fill | `--color-primary`, `--shadow-sm` |
| Focus (keyboard) | Visible outline ring | `--color-focus` |
| Active / pressed | No explicit delta beyond browser press state | Default tokens |
| Disabled | Not shown in approved design | — |
| Loading | Not shown in approved design | — |
| Error | Not shown in approved design | — |
| Empty | Not shown in approved design | — |

**Accessibility** — native `<button>`; keyboard reachable; 44px minimum target through padding.

### 2.4 Secondary button

**Purpose** — Tertiary action or debug control. Use only when a non-primary action is shown.

**Anatomy** — `[label]`

**Variants**

| Variant | Tokens | When to use |
|---|---|---|
| Default | `--color-border`, `--color-text`, `--radius-full` | Secondary action |

**Sizes**

| Size | Height | Padding | Text token |
|---|---|---|---|
| Default | auto | `12px 16px` | `--text-sm` |

**States**

| State | Visual change | Tokens |
|---|---|---|
| Default | Transparent fill, border | `--color-border`, `--color-text` |
| Hover | Outline visible via ring | `--color-focus` |
| Focus (keyboard) | Visible outline ring | `--color-focus` |
| Active / pressed | None shown | Default tokens |
| Disabled | Not shown in approved design | — |
| Loading | Not shown in approved design | — |
| Error | Not shown in approved design | — |
| Empty | Not shown in approved design | — |

**Accessibility** — native `<button>`; 44px minimum target.

### 2.5 Text input

**Purpose** — Single-line name entry. Use for short text only.

**Anatomy** — `[label] [input] [helper text]`

**Variants**

| Variant | Tokens | When to use |
|---|---|---|
| Default | `--color-surface`, `--color-border`, `--radius-sm` | Single-line text entry |

**Sizes**

| Size | Height | Padding | Text token |
|---|---|---|---|
| Default | auto | `14px 15px` | `--text-base` |

**States**

| State | Visual change | Tokens |
|---|---|---|
| Default | White field, border | `--color-border` |
| Hover | No separate state shown | Default tokens |
| Focus (keyboard) | Visible outline ring | `--color-focus` |
| Active / pressed | Native text cursor and caret | Default tokens |
| Disabled | Not shown in approved design | — |
| Loading | Not shown in approved design | — |
| Error | Not shown in approved design | — |
| Empty | Placeholder text visible | `--color-text-muted` |

**Accessibility** — native `<input>`; associated `<label>`; helper text explains trimming and length.

### 2.6 Textarea

**Purpose** — Multi-line note entry. Use for guest note content.

**Anatomy** — `[label] [textarea] [helper text]`

**Variants**

| Variant | Tokens | When to use |
|---|---|---|
| Default | `--color-surface`, `--color-border`, `--radius-sm` | Multi-line text entry |

**Sizes**

| Size | Height | Padding | Text token |
|---|---|---|---|
| Default | `124px` min | `14px 15px` | `--text-base` |

**States**

| State | Visual change | Tokens |
|---|---|---|
| Default | White field, border | `--color-border` |
| Hover | No separate state shown | Default tokens |
| Focus (keyboard) | Visible outline ring | `--color-focus` |
| Active / pressed | Native caret and resize handle | Default tokens |
| Disabled | Not shown in approved design | — |
| Loading | Not shown in approved design | — |
| Error | Not shown in approved design | — |
| Empty | Placeholder text visible | `--color-text-muted` |

**Accessibility** — native `<textarea>`; associated `<label>`; helper text explains limits.

### 2.7 Stat pill

**Purpose** — Show short count or status in hero.

**Anatomy** — `[value] [label]`

**Variants**

| Variant | Tokens | When to use |
|---|---|---|
| Default | `--color-surface`, `--color-border`, `--color-primary`, `--radius-full`, `--shadow-md` | Count chips in hero |

**Sizes**

| Size | Height | Padding | Text token |
|---|---|---|---|
| Default | auto | `12px 16px` | `--text-sm` / `--text-xl` for value |

**States**

| State | Visual change | Tokens |
|---|---|---|
| Default | Raised pill with bold value | `--shadow-md` |
| Hover | None shown | Default tokens |
| Focus (keyboard) | Not interactive | — |
| Active / pressed | Not interactive | — |
| Disabled | Not shown in approved design | — |
| Loading | Not shown in approved design | — |
| Error | Not shown in approved design | — |
| Empty | Not shown in approved design | — |

**Accessibility** — static text; no interactive role.

### 2.8 Entry card

**Purpose** — Show one guest note in the list.

**Anatomy** — `[name] [date] [note]`

**Variants**

| Variant | Tokens | When to use |
|---|---|---|
| Default | `--color-surface`, `--color-border`, `--radius-lg`, `--shadow-md` | Guest entry list item |

**Sizes**

| Size | Height | Padding | Text token |
|---|---|---|---|
| Default | auto | `18px 18px 16px` | `--text-base`, `--text-sm`, `--text-xl` |

**States**

| State | Visual change | Tokens |
|---|---|---|
| Default | White card with border | `--color-surface`, `--color-border` |
| Hover | None shown | Default tokens |
| Focus (keyboard) | Not interactive | — |
| Active / pressed | Not interactive | — |
| Disabled | Not shown in approved design | — |
| Loading | Not shown in approved design | — |
| Error | Not shown in approved design | — |
| Empty | Not shown in approved design | — |

**Accessibility** — semantic article/list item in implementation; text contrast passes on paper background.

### 2.9 Notice banner

**Purpose** — Success, warning, or API-failure message.

**Anatomy** — `[message] [optional supporting text]`

**Variants**

| Variant | Tokens | When to use |
|---|---|---|
| Neutral | `#FFFAF0`, `#D8CCB4`, `#6A5220` | In-page message |

**Sizes**

| Size | Height | Padding | Text token |
|---|---|---|---|
| Default | auto | `16px 18px` | `--text-sm` |

**States**

| State | Visual change | Tokens |
|---|---|---|
| Default | Cream panel with amber text | `#FFFAF0`, `#6A5220` |
| Hover | Not interactive | — |
| Focus (keyboard) | Not interactive | — |
| Active / pressed | Not interactive | — |
| Disabled | Not shown in approved design | — |
| Loading | Not shown in approved design | — |
| Error | Same visual style used for API issue and success messaging shell | `#FFFAF0`, `#6A5220` |
| Empty | Not shown in approved design | — |

**Accessibility** — use `role="status"` or `role="alert"` as needed.

## 3. Content and formatting

- Voice and tone: warm, calm, welcoming, plain English.
- Date format: human-readable relative or short day/time, like `Today · 2:14 PM`.
- Number format: plain integers, no separators needed at this scale.
- Button capitalization: Title Case for labels.
- Heading capitalization: Sentence case style is used visually, but page headings are short and title-like.
- Empty-state and error-message pattern: say what happened, then say what to do next.

## 4. Known deviations

| Where | Deviation | Why it stands | Follow-up |
|---|---|---|---|
| Hero background | Uses `linear-gradient(180deg,#fbf7ef 0%,#F7F3EA 100%)` instead of flat fill | Approved mockup uses subtle paper fade | Keep it consistent |
| Decorative paper lines | Uses semi-transparent repeating stripe layer | Part of approved paper texture | Keep it consistent |
| Status dot | `#C9B38C` has low text contrast | Accent only, not text | Never use for text |
| Primary brand tile | Rounded square at `14px` inside larger theme | Approved logo treatment | Keep brand mark visual |
| Simulate API issue control | Debug button present in approved HTML | Stakeholder later flagged it as non-ship in review message, but approved design still contains it | Remove in implementation |

## 5. Change log

| Date | Change | Design PR |
|---|---|---|
| 2025-08-14 | Initial design system extracted from approved guest book mockup | pending |
