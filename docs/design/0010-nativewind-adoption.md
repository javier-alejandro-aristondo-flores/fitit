# 0010. Styling system: NativeWind adoption

**Status:** Decided (NativeWind is the chosen library) / Open (the migration specifics below)
**Affects:** `frontend/babel.config.js` (new), `frontend/metro.config.js` (new/modified),
`frontend/tailwind.config.js` (new), every file in `src/components/ui`, `src/features/**`, and all
`app/**` screens
**Supersedes:** the custom `ThemeProvider`/`useTheme()` mechanism proposed in `ui-architecture.md`
§3.3 (old) and [0003](0003-theming-token-system.md) §5 — NativeWind's config *is* the token layer;
a hand-rolled Context provider on top of it would be a second, redundant system. 0003's underlying
findings (raw hex literal leak locations, missing error/danger token, contrast validation need,
`userInterfaceStyle` requirement) still apply — they change *where* they get fixed, not *whether*.

## The problem

Adding a styling library to an Expo/RN project isn't a drop-in swap — it needs build tooling
(Babel/Metro configuration), and every existing component currently styled with
`StyleSheet.create` plus the flat `src/constants/theme.ts` constants needs an actual migration, not
a new option left sitting unused next to the old one.

## Questions this must answer before implementation

### 1. Setup

NativeWind needs a Babel plugin (`nativewind/babel`) and a Metro config wrapper
(`withNativeWind`), plus a `tailwind.config.js` with `content` globs covering `app/`,
`src/components`, `src/features`, `src/modules`. **Verify the exact setup steps against the
NativeWind version compatible with this project's installed Expo SDK before implementing** — per
`AGENTS.md`'s standing rule ("Expo has changed — do not trust your training data"), check the
current docs rather than assuming a remembered API. This should land as its own reviewable commit,
config only, before any component migrates — so a broken build setup is never tangled up with
visual changes in the same diff.

### 2. Token mapping

`tailwind.config.js`'s `theme.extend.colors` / `spacing` / `borderRadius` / `fontSize` becomes the
single source of truth for what [0003](0003-theming-token-system.md) called "two-layer tokens" —
a raw scale (e.g. `theme.extend.colors.gray`) plus semantic aliases (`theme.extend.colors.border`,
`.accent`, `.error`) — closing the exact gap 0003 found, including the missing error/danger color
(`#b00020`, used today in `login.tsx`/`signup.tsx` with no semantic name at all). Today's
`theme.ts` values seed this config's initial values verbatim — this phase is a refactor, not a
restyle.

### 3. Dark mode

NativeWind's `dark:` variant needs `darkMode: 'class'` (explicit toggle, controlled via
NativeWind's own `colorScheme.set()`/`useColorScheme()`) vs. `'media'` (purely OS-driven).
[0003](0003-theming-token-system.md) §3 already recommended an explicit user override with an
OS-scheme default — `'class'` is the setting that supports that; `'media'` would only support the
OS-only case.

`app.json`'s `"userInterfaceStyle": "light"` still needs to become `"automatic"` — that's a native
Expo config constraint independent of which styling library sits above it; not deciding this here
would leave dark mode unable to activate on a real device regardless of how the token layer is
built.

### 4. Migration order for existing components

**Recommendation**, matching `ui-architecture.md` §4's phased approach:

1. `src/components/ui/*` primitives first — smallest surface, most reused (Button, Panel,
   StatTile, Meter, etc.).
2. `src/features/workout/*` (AICoachChat, ChatBubble, ExerciseLogTable).
3. Screens (`app/**`) last.

Every raw hex literal found in [0003](0003-theming-token-system.md)'s evidence table gets a named
Tailwind color as part of the same pass that migrates its file — not filed as a follow-up, or dark
mode ships with the same unstyled patches 0003 warned about, just relocated to NativeWind instead
of avoided. Each step should be independently shippable and visually near-identical to before —
this is a delivery-mechanism change, not a redesign.

### 5. Interaction with `react-native-web`

NativeWind compiles `className` to RN styles on native and to actual CSS on web via its Metro/web
integration. This project already ships a web target (`app.json`'s `web.bundler: "metro"`), so an
explicit smoke test on `npx expo start --web` after initial setup is part of this step, not an
assumption that native-platform correctness implies web correctness.

## If left unresolved

The app ends up with two parallel, half-finished styling systems — some components still on
`theme.ts`/`StyleSheet`, others on NativeWind `className`, with no documented line for which new
code uses which — and dark mode (or any future theme) works correctly in one half of the app and
not the other, with no way to tell which half without checking each file.
