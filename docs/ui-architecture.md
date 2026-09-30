# FitIT Frontend UI Architecture — Modular & Themeable

**Status:** Proposal
**Scope:** `frontend/` (Expo / React Native app) only. Not a visual redesign — this defines the
seams that let visual design, theming, and new features change without touching every screen.
**Supersedes:** treat `docs/wireframes/*.html` and the current `frontend/src` UI as a throwaway
first pass, not a target to preserve pixel-for-pixel.
**Revision note:** the dashboard's target look/interaction has since been pinned down more
specifically — a single, drag-to-reorder list of cards (board-like, not a literal multi-column
Kanban — see [`design/0008`](design/0008-card-priority-and-drag-reorder.md) for why), each card
with a draggable title and a free-text body (see
[`design/0009`](design/0009-card-content-model.md)), styled with NativeWind instead of a hand-rolled
`ThemeProvider` (see [`design/0010`](design/0010-nativewind-adoption.md), which supersedes §3.3
below). The rest of this document — the module registry, the navigation seam, the phased approach —
still holds; §3.2–§3.4 are updated in place to point at what changed.

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
2. **Customizable** — both in the theming sense (colors, spacing, type scale, dark mode, a
   white-label palette) and in the literal user-facing sense: a user drags cards into their own
   priority order and can attach a free-text note to any card. Both are swappable/settable from
   one place, the way `mock`/`http` swap under `ApiClient` today.
3. **Hidden behind an API** — concretely, a local **UI Module Registry**: a typed
   `registerModule()` / `getModules()` interface. Screens and navigators render from the
   registry's output, not from hardcoded JSX. This is the same shape as `ApiClient`, so it's a
   pattern the team already knows.
4. **Board-like, not grid-like** — the dashboard reads as a stack of cards a user can pick up and
   reorder, each with a visible drag handle (its title) — not a static flex-wrap grid.
5. **Non-breaking** — ship in phases; at every phase the app still runs and looks the same until
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
frontend/
  babel.config.js               # new — NativeWind babel plugin (see design/0010)
  tailwind.config.js             # new — the token source of truth (see design/0010)
  src/
    ui/                          # design system (primitives), styled with NativeWind className
      primitives/                  # Button, Panel, StatTile, Meter, ... — className-based, no theme.ts import
      kanban/                       # new — see design/0008, design/0009
        DraggableCardList.tsx        # wraps react-native-draggable-flatlist
        CardHeader.tsx                # the draggable-title / drag-handle component every card uses
        CardNote.tsx                  # the free-text body every card has
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
      dashboardLayout.ts            # new — per-user card position + notes store (see design/0008, 0009)
  app/
    (tabs)/_layout.tsx             # thin: renders Tabs.Screen per getModules()
    (tabs)/dashboard.tsx           # thin: renders DraggableCardList over getDashboardCards()
```

`src/ui/theme/` and `ThemeProvider.tsx` from the original sketch are **dropped** — NativeWind's
`tailwind.config.js` is the token layer now; see [`design/0010`](design/0010-nativewind-adoption.md).

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
  order: number;                       // default/initial priority only — see 3.2a below
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
- **Adding a module going forward = add a folder under `src/modules/`, add one line to
  `modules/index.ts`, plus one route file under `app/(tabs)/`** (see
  [`design/0002`](design/0002-navigation-route-binding.md) — routes stay file-backed even though
  the tab bar's visibility/order is registry-driven). No edits to `_layout.tsx` or `dashboard.tsx`.

#### 3.2a Registry order vs. live priority

`order` on `UIModule` is now only the **default/initial** position, set at registration time — not
the live value a user sees. The dashboard's actual card order is user-owned runtime state (a drag
can happen at any time, from any module), stored separately and merged with the registered modules
at render time. See [`design/0008`](design/0008-card-priority-and-drag-reorder.md) for the data
model and why this replaced the original "fixed order for v1" recommendation.

### 3.3 Theming — superseded

The original plan here (`ThemeProvider`/`useTheme()`, a hand-rolled React Context token layer) is
**superseded by adopting NativeWind** as the styling system — see
[`design/0010`](design/0010-nativewind-adoption.md) for the full migration plan. NativeWind's
`tailwind.config.js` becomes the token source of truth instead of a custom Context provider; the
underlying findings that drove this section (raw hex literals bypassing `theme.ts`, no
error/danger color existing anywhere, `app.json`'s `userInterfaceStyle` blocking dark mode) are
unchanged and still tracked in
[`design/0003`](design/0003-theming-token-system.md) — only *where* they get fixed moved.

### 3.4 Dashboard layout: a draggable card list, not a grid

`ResponsiveGrid` (the `flexDirection: row, flexWrap: wrap, gap` + `flexBasis: N` pattern
copy-pasted in `dashboard.tsx`, `workout.tsx`, `diet.tsx`, `impact.tsx`) is still worth extracting
as a primitive for screens that just need a responsive multi-item layout (e.g. the stat-tile rows
in `diet.tsx`/`impact.tsx`) — but **the dashboard itself does not use it**. The dashboard renders a
single vertically-stacked, drag-to-reorder list (`DraggableCardList`, wrapping
`react-native-draggable-flatlist`) over `getDashboardCards()` merged with the user's stored
priority order. Each card's title is its drag handle; each card also carries a free-text note. Full
design in [`design/0008`](design/0008-card-priority-and-drag-reorder.md) and
[`design/0009`](design/0009-card-content-model.md).

---

## 4. Migration plan (phased, each phase ships working app)

1. **NativeWind setup** — babel/metro config, `tailwind.config.js` seeded from today's `theme.ts`
   values verbatim (zero visual change). Its own reviewable commit, before any component migrates.
   See [`design/0010`](design/0010-nativewind-adoption.md).
2. **Migrate styling** — `src/components/ui/*` primitives first, then `src/features/workout/*`,
   then screens, moving every raw hex literal found in
   [`design/0003`](design/0003-theming-token-system.md) to a named Tailwind color as part of the
   same pass, not a follow-up.
3. **Module registry** — introduce `moduleRegistry.ts`; convert `workout`, `diet`, `impact` into
   `src/modules/<name>/` with `module.ts`, `screen.tsx`, `card.tsx`. Replace the hardcoded
   `_layout.tsx` tab list with registry-driven rendering.
4. **Draggable dashboard** — introduce `DraggableCardList`/`CardHeader`/`CardNote` and
   `dashboardLayout.ts` (local-persisted priority order + notes); replace `dashboard.tsx`'s
   hardcoded grid with it. See [`design/0008`](design/0008-card-priority-and-drag-reorder.md) and
   [`design/0009`](design/0009-card-content-model.md).
5. **Prove theming** by shipping a `dark` Tailwind theme (`darkMode: 'class'`) as the first real
   second theme, after `app.json`'s `userInterfaceStyle` moves to `"automatic"`.
6. **(Future, optional)** layer a server-driven dashboard config (§5) once a backend contract
   exists.

Each phase is independently reviewable and shippable; nothing in phases 1–5 depends on backend
work that doesn't exist yet.

---

## 5. Future layer: server-driven dashboard config (not being built now)

Because modules are already locally registered and self-describing, and card priority/notes are
already a separate per-user state object (§3.2a, [`design/0008`](design/0008-card-priority-and-drag-reorder.md)),
a future single endpoint — something like `GET/PUT /api/dashboard-layout` returning:

```json
{
  "enabledModuleIds": ["workout", "diet"],
  "cardOrder": ["diet", "workout"],
  "cardNotes": { "diet": "ask coach about the dinner swap" }
}
```

covers module enable/disable *and* the user's drag order *and* their card notes in one resource —
deliberately unified rather than three separate future endpoints, since client-side they're already
one "my dashboard state" concern. No endpoint exists yet (mirrors the `httpApi` "not ready" pattern
in `src/lib/api/http.ts`); until it does, all three are read from and written to local device
storage. This stays a documented extension point, not current work.

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

These three are carried forward (with a recommendation) into
[`docs/design/0001-module-registry-contract.md`](design/0001-module-registry-contract.md) — treat
that as the current version of this section, not this list.

## 7. Deeper design specs

This document defines the *shape* of the registry and dashboard — enough to agree on the approach.
It's deliberately not detailed enough to implement against directly: several subsystems it touches
(navigation's interaction with Expo Router's static route scanning, what a theme token actually has
to cover, who owns a module's data loading, error isolation between modules, whether onboarding
fits the same pattern, how any of this gets tested, the card-drag interaction itself, the card
content model, and the NativeWind migration) have their own open design questions that would
otherwise surface mid-implementation instead of now. Those live in
[`docs/design/`](design/README.md), one file per subsystem, each grounded in specific evidence from
this codebase rather than restated in the abstract here.
