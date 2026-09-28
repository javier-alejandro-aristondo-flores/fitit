# FitIT Frontend UI Architecture — Modular & Themeable

**Status:** Proposal
**Scope:** `frontend/` (Expo / React Native app) only. Not a visual redesign — this defines the
seams that let visual design, theming, and new features change without touching every screen.
**Supersedes:** treat `docs/wireframes/*.html` and the current `frontend/src` UI as a throwaway
first pass, not a target to preserve pixel-for-pixel.

---

## 1. Why this is needed

The current frontend (commit `f3ef878`) was built as a literal port of the grayscale wireframes
in `docs/wireframes/`, and the code says so directly — `src/constants/theme.ts` opens with:

> "Palette mirrors the grayscale wireframes... Intentionally low-fidelity until a visual design
> pass replaces these tokens."

That's fine as a first pass, but the coupling goes deeper than just placeholder colors:

| Problem | Where | Why it blocks modularity |
|---|---|---|
| Theme is flat, static constants, not a provider | `src/constants/theme.ts` | No dark mode, no per-user/brand theming, no way to swap tokens without editing every component's imports |
| UI primitives import theme directly and bake styles at module scope | `src/components/ui/*.tsx` (Button, Panel, StatTile, ...) | Can't override look per-usage without new props on every component; adding a variant means editing the primitive |
| Dashboard hardcodes its 3 cards (Workout, Diet, Impact) directly in JSX | `app/(tabs)/dashboard.tsx` | Adding a 4th module (e.g. Sleep, Hydration, Social) means hand-editing this file's grid |
| Tab bar hardcodes its 4 screens | `app/(tabs)/_layout.tsx` | Same problem for navigation — no single place a feature "announces itself" |
| Feature-folder convention (`src/features/<name>/`) only applied to `workout` | `src/features/workout/*` vs. diet/impact having nothing | Inconsistent extension points; no template new modules can follow |
| Grid/layout logic (`flexDirection: row, flexWrap, flexBasis: 280/300`) duplicated per screen | dashboard.tsx, workout.tsx, diet.tsx, impact.tsx | Layout isn't a reusable concept, it's copy-pasted `StyleSheet.create` in every screen |

One part of the codebase already gets this right: **`src/lib/api/`**. It defines an `ApiClient`
interface (`types.ts`) with two interchangeable implementations — `mock.ts` and `http.ts` —
switched by one env var behind a single import (`api` from `src/lib/api/index.ts`). Screens never
import `mock` or `http` directly. That seam is the pattern this document extends to the UI layer
itself.

---

## 2. Goals

1. **Modular** — a new feature (module) is a self-contained folder that *registers itself*; no
   existing screen or navigator file needs to be hand-edited to add, remove, or reorder it.
2. **Customizable** — theming (colors, spacing, type scale, and eventually per-user/brand
   overrides like dark mode or a white-label palette) is swappable app-wide from one place, the
   way `mock`/`http` swap under `ApiClient` today.
3. **Hidden behind an API** — concretely, a local **UI Module Registry**: a typed
   `registerModule()` / `getModules()` interface. Screens and navigators render from the
   registry's output, not from hardcoded JSX. This is the same shape as `ApiClient`, so it's a
   pattern the team already knows.
4. **Non-breaking** — ship in phases; at every phase the app still runs and looks the same until
   the visual design pass actually changes tokens.

### Non-goals
- This is not the visual redesign. Colors/typography/spacing values themselves are out of scope —
  only *how* they're delivered to components changes.
- Backend work: a server-driven config endpoint is discussed as a future layer (§5) but isn't
  being built now — no backend contract exists yet (SCRUM-15/23 are still pending per the code's
  own comments in `src/lib/api/http.ts` and `src/lib/types/auth.ts`).

---

## 3. Proposed architecture

### 3.1 Directory shape

```
frontend/src/
  ui/                        # design system (primitives), theme-aware
    theme/
      tokens.ts               # raw scales: color ramps, spacing scale, radii, type scale
      ThemeProvider.tsx        # React context provider + useTheme() hook
      themes/
        light.ts               # today's palette, renamed/reorganized — not restyled
        dark.ts
      index.ts
    primitives/                # Button, Panel, StatTile, Meter, ... — read tokens via useTheme()
  modules/                     # one folder per feature — replaces src/features + screens living only in app/
    workout/
      module.ts                 # UIModule definition + registerModule() call (side effect)
      screen.tsx                  # what app/(tabs)/workout.tsx currently is
      components/                 # AICoachChat, ExerciseLogTable, ChatBubble, WeekDaysStrip usage, etc.
      card.tsx                    # the dashboard.tsx "Workout / Trainer" panel, extracted
    diet/
      module.ts
      screen.tsx
      card.tsx
    impact/
      module.ts
      screen.tsx
      card.tsx
    index.ts                    # side-effect imports of every module — the only place that lists them
  core/
    moduleRegistry.ts            # the registry API itself (see 3.2)
    layout/
      ResponsiveGrid.tsx          # extracted from the duplicated grid/gridItem StyleSheets
app/
  (tabs)/_layout.tsx             # thin: renders Tabs.Screen per getModules()
  (tabs)/dashboard.tsx           # thin: renders getDashboardCards() sorted by order
```

`app/` (Expo Router routes) stays the entry point per `AGENTS.md` ("non-route code... outside
`src/app/`"), but each route becomes a one-line re-export of its module's `screen.tsx`, and the
navigator/dashboard become renderers over the registry instead of authors of content.

### 3.2 The Module Registry — the "API" boundary

```ts
// src/core/moduleRegistry.ts
export interface DashboardCardProps {
  onPress: () => void;
}

export interface UIModule {
  id: string;                          // 'workout'
  title: string;                       // 'Workout'
  route: string;                       // '/workout' — must match an app/(tabs) file
  icon: IconName;                      // see open question in §6
  screen: ComponentType;               // module's screen.tsx default export
  DashboardCard?: ComponentType<DashboardCardProps>;  // module's card.tsx, optional
  order?: number;                      // default = registration order
  isEnabled?: (ctx: ModuleContext) => boolean;  // feature-flag / plan-gating hook, defaults to true
}

export function registerModule(module: UIModule): void;
export function getModules(ctx?: ModuleContext): UIModule[];        // sorted, filtered by isEnabled
export function getDashboardCards(ctx?: ModuleContext): UIModule[]; // subset that has DashboardCard
```

- Each `modules/<name>/module.ts` calls `registerModule({...})` at import time.
- `modules/index.ts` is the **only** file that imports every module folder (side-effect imports),
  so the whole app only needs one import to know about every module — mirroring how
  `src/lib/api/index.ts` is the single place that decides `mock` vs `http`.
- `app/(tabs)/_layout.tsx` renders `getModules().map(m => <Tabs.Screen name={m.id} .../>)`.
- `app/(tabs)/dashboard.tsx` renders `getDashboardCards().map(m => <m.DashboardCard onPress={...} />)`
  inside the shared `ResponsiveGrid`, replacing the hand-copied grid `StyleSheet`s in every screen.
- **Adding a module going forward = add a folder under `src/modules/`, add one line to
  `modules/index.ts`.** No edits to `_layout.tsx` or `dashboard.tsx`.

### 3.3 Theming API

```ts
// src/ui/theme/ThemeProvider.tsx
const ThemeContext = createContext<ThemeTokens>(lightTheme);
export function ThemeProvider({ theme = lightTheme, children }: Props) { ... }
export function useTheme(): ThemeTokens { return useContext(ThemeContext); }
```

- `src/ui/primitives/*` call `useTheme()` instead of `import { colors, spacing } from
  '../../constants/theme'`.
- `light.ts` starts as today's `theme.ts` values verbatim — this phase is a refactor, not a
  restyle.
- Unlocks, without further architecture change: dark mode, a per-brand/white-label theme swap, a
  user-selected accent color, and (later) a theme delivered from a backend `/me/preferences`
  response — same idea as §5, applied to tokens instead of modules.

### 3.4 Shared layout primitive

`ResponsiveGrid` (wrapping the `flexDirection: row, flexWrap: wrap, gap` + `flexBasis: N` pattern
copy-pasted in `dashboard.tsx`, `workout.tsx`, `diet.tsx`, `impact.tsx`) becomes a primitive in
`src/ui/primitives/`, taking `minItemWidth` instead of each screen redefining `gridItem`.

---

## 4. Migration plan (phased, each phase ships working app)

1. **Theme provider** — introduce `ThemeProvider`/`useTheme`, `light` theme = current values
   verbatim. Update `src/components/ui/*` to consume `useTheme()`. Zero visual change.
2. **Module registry** — introduce `moduleRegistry.ts`; convert `workout`, `diet`, `impact` into
   `src/modules/<name>/` with `module.ts`, `screen.tsx`, `card.tsx`. Replace the hardcoded
   `dashboard.tsx` grid and `_layout.tsx` tab list with registry-driven rendering.
3. **Extract `ResponsiveGrid`**, delete the duplicated grid `StyleSheet`s across the four screens.
4. **Prove the theming API** by shipping a `dark` theme as the first real second theme.
5. **(Future, optional)** layer a server-driven module config (§5) once a backend contract exists.

Each phase is independently reviewable and shippable; nothing in phases 1–4 depends on backend
work that doesn't exist yet.

---

## 5. Future layer: server-driven config (not being built now)

Because modules are already locally registered and self-describing, a future
`GET /api/ui-config` returning something like:

```json
{ "enabledModuleIds": ["workout", "diet"], "order": ["diet", "workout"] }
```

becomes a pure filter/sort applied inside `getModules()`/`getDashboardCards()` — it changes *which
registered modules render and in what order*, not how modules are built or registered. This is
how per-user customization, A/B testing a module, or a paid-tier-only module could work later
without another architecture change. No endpoint exists yet (mirrors the `httpApi` "not ready"
pattern in `src/lib/api/http.ts`), so this stays a documented extension point, not current work.

---

## 6. Open questions for the team

- **Icon system**: no icon library is currently a dependency. `UIModule.icon` needs a real type —
  recommend `@expo/vector-icons` (bundled with Expo, no extra native config) unless the design
  pass wants custom SVG icons.
- **Module registration timing**: static side-effect imports (all modules always compiled in) vs.
  a build-time flag to exclude modules per build target (e.g. a future white-label build). Static
  imports are simpler and sufficient until there's an actual second build target — recommend
  starting there.
- **Dashboard card reordering**: should `order` be user-customizable (drag-to-reorder) in v1, or
  fixed by `order` in each module's registration for now? Recommend fixed for v1; the registry
  shape doesn't block adding drag-to-reorder later.
