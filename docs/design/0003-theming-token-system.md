# 0003. Theming token system

**Status:** Open
**Affects:** `src/ui/theme/*` (new), every component currently in `src/components/ui/*` and
`src/features/**/*`

## The problem

`ui-architecture.md` §3.3 sketches a `ThemeProvider`/`useTheme()` API and says migration is
"mechanical, low risk" because `light.ts` starts as `theme.ts`'s values verbatim. That's true for
the components that actually import `colors`/`spacing` from `theme.ts` — but a meaningful number of
components bypass `theme.ts` entirely and hardcode raw color literals inline. A ThemeProvider
migration that only moves the *named exports* of `theme.ts` behind `useTheme()` ships a dark theme
with visible light-colored patches on day one, because these literals never touch any token.

## Evidence in this codebase

A repo-wide search for hex literals in `.tsx` files under `frontend/` turns up 13 occurrences
across 10 files, none of them theme-aware:

| File | Literal | Used for |
|---|---|---|
| `app/login.tsx:67`, `app/signup.tsx:94`, `app/onboarding/about.tsx:94`, `app/(tabs)/diet.tsx:107`, `src/features/workout/AICoachChat.tsx:91`, `src/features/workout/ExerciseLogTable.tsx:95` | `#fafafa` | text input background |
| `app/login.tsx:71`, `app/signup.tsx:98` | `#b00020` | error message text |
| `src/features/workout/ChatBubble.tsx:23`, `src/features/workout/ExerciseLogTable.tsx:68` | `#eeeeee` | chat bubble / table header background |
| `src/components/ui/EventRow.tsx:25` | `#bbbbbb` | row border |
| `src/components/ui/Meter.tsx:23` | `#eeeeee` | meter track background |
| `src/components/ui/StepProgress.tsx:27` | `#cccccc` | inactive step background |

The `#b00020` case is the sharpest example: **there is no error/danger color in `theme.ts` at
all** (`colors.bad` exists but is `'#222222'`, same as `colors.good` and `colors.text` — it carries
no actual color meaning today, just a name). Error-state color isn't a token gap that theming
would expose later; it's a token that's simply missing right now.

## Questions this must answer before implementation

### 1. One-layer or two-layer tokens?

Today's model is one-layer: `theme.ts` exports semantic names (`colors.border`, `colors.accent`)
directly as hex values. A two-layer model separates raw scales (`gray100`...`gray900`, a couple of
brand hues) from semantic aliases (`colors.border = gray.400`). Two-layer costs more upfront but is
what "supports customization" in the original ask implies: a white-label or brand-color swap
remaps a handful of primitives once, instead of re-picking every semantic value by hand for every
new theme.

**Recommendation:** two-layer, sized to what's actually used — don't invent a 9-step gray ramp
nothing in the app needs. Derive the initial ramp from the literals already in use (question 2)
rather than picking new arbitrary values.

### 2. Closing the leak

Every hardcoded literal in the table above needs a named semantic token
(`colors.inputBackground`, `colors.error`, `colors.chatBubbleBackground` or a reused
`colors.surfaceMuted`, etc.) as part of the *first* migration phase — not filed as a follow-up.

**Recommendation:** add a grep for hex literals (`#[0-9a-fA-F]{3,6}`) outside `src/ui/theme/` to
whatever check gates phase 1 of the migration (`ui-architecture.md` §4.1), so "zero raw color
literals remain in components" is a verifiable exit condition for that phase, not a hope.

### 3. Where does the active theme choice live?

Three candidate sources: OS setting (RN `useColorScheme()`), an explicit in-app toggle persisted
locally, or (later) a server-stored preference. These aren't mutually exclusive, but the *default*
and the *override* both need deciding now.

One concrete blocker: `frontend/app.json` currently sets `"userInterfaceStyle": "light"`, which
pins the app to light mode at the native level — on a real device, `useColorScheme()` will not
report `"dark"` at all while this stays `"light"`, regardless of the OS setting. Flipping it to
`"automatic"` is a prerequisite for dark mode to do anything on native, not an implementation
detail to notice later.

**Recommendation:** `userInterfaceStyle: "automatic"`, default theme = OS scheme via
`useColorScheme()`, with an explicit user override persisted locally (survives app restarts,
doesn't require a backend). A server-synced preference is the same future layer as
`ui-architecture.md` §5 — not built now.

### 4. Contrast / accessibility validation

Nothing today validates that a theme's text/background pairs are actually readable. Once theming
is genuinely swappable (a second theme now, brand palettes potentially later), a low-contrast
combination becomes something that can ship via a config change, not only via a design mistake
made once and caught in review.

**Recommendation:** a small automated check — even a single test asserting WCAG-AA contrast ratios
for every semantic pair actually used as text-on-background — run against each theme in
`src/ui/theme/themes/`. A new theme that fails it shouldn't merge. (The `dataviz` skill's palette
validator approach is a reasonable model for this, even though this isn't chart work.)

### 5. Web/native rendering parity

React Native's `StyleSheet` has no CSS custom-property or media-query equivalent, and
`react-native-web` converts styles per-render rather than via cascading CSS variables — so a theme
swap has to happen through a React re-render (Context), not through CSS. This confirms Context
(`ui-architecture.md` §3.3) is the right mechanism rather than a CSS-variables approach that would
work on web but not native. Worth stating explicitly: switching themes re-renders the whole tree
under the provider — an accepted, known cost, not a performance regression to debug later.

## If left unresolved

Dark mode ships with correct-looking primitives (buttons, panels, stat tiles) sitting next to
unmistakably-wrong light inputs, chat bubbles, and table headers — because those never ran through
`theme.ts` in the first place, and a mechanical "point components at `useTheme()` instead of
`theme.ts`" migration has nothing to catch that.
