# 0008. Card priority & drag-to-reorder

**Status:** Open
**Affects:** new `src/ui/kanban/DraggableCardList.tsx`, new `src/core/dashboardLayout.ts`,
`app/(tabs)/dashboard.tsx`
**Depends on:** [0001](0001-module-registry-contract.md) §3.2a (`UIModule.order` is now
default-only, not live)
**Supersedes:** [0001](0001-module-registry-contract.md)'s original "Dashboard card reordering"
recommendation ("fixed for v1") — drag-to-reorder priority is now a confirmed requirement.

## The problem

The product direction calls for the dashboard to "look a bit like a kanban board," with modules
draggable into "some form of priority." Taken literally, "kanban board" suggests multiple named
columns (a common shape: To Do / Doing / Done, or invented tiers like High / Medium / Low). That
shape doesn't fit this app: nothing here has a *workflow stage* a module progresses through — a
Workout module doesn't graduate from "Low priority" to "Done" the way a task does. Forcing a
priority-tier taxonomy onto a wellness dashboard adds structure the product doesn't have a real use
for, and multi-column, cross-list drag-and-drop is also the highest-risk way to build this in
React Native: fewer mature libraries handle it well across touch and web mouse input compared to
single-list reordering, which is a solved, well-supported problem.

## Recommendation

**A single, vertically-stacked, drag-to-reorder list — not multiple columns.** "Priority" is a
card's position in that one list; top is most important. This keeps the part of "kanban board" that
actually matters here (cards, a visible drag handle, a board-like stacked-card look, achievable with
NativeWind per [0010](0010-nativewind-adoption.md)) without inventing column labels that don't map
to anything real in a fitness/nutrition coaching app. If a genuinely domain-meaningful grouping
turns up later (e.g. "Today" vs. "Longer-term goals" — a split that *does* map onto how Workout/Diet
vs. Impact actually behave), that's a small additive change to a list that already works, not a
rebuild.

## Questions this must answer before implementation

### 1. Drag library

**Recommendation:** [`react-native-draggable-flatlist`](https://github.com/computerjazz/react-native-draggable-flatlist),
built on `react-native-reanimated` + `react-native-gesture-handler` — the de facto standard for
single-list drag-reorder in RN/Expo, actively maintained, and it wraps `FlatList` so momentum
scrolling and drag gestures compose correctly without hand-rolled conflict resolution. None of
`reanimated`, `gesture-handler`, or this package are in `frontend/package.json` yet — install with
`npx expo install` per `AGENTS.md`'s own rule (resolves SDK-compatible versions), not raw `npm
install`. Per `AGENTS.md`'s other standing rule, check the current Expo SDK's docs for these
packages before writing code against them rather than trusting training data — RN gesture/animation
APIs are exactly the kind of thing that's moved across SDK releases.

A full multi-column drag engine is deliberately *not* evaluated here — it would only be needed if
question §"Recommendation" above changes.

### 2. Data model & persistence

```ts
// src/core/dashboardLayout.ts
export interface DashboardLayout {
  cardOrder: string[];              // module ids, in the user's chosen order
  cardNotes: Record<string, string>; // moduleId -> free text, see 0009
}
```

Kept **separate** from `UIModule.order` (0001 §3.2a) — registration supplies the default order
before any customization; this is the live, user-owned override. No backend endpoint exists for
this yet, matching every other write path's state in `src/lib/api/http.ts`.

**Recommendation:** local persistence (`AsyncStorage` or equivalent) for v1, one JSON blob keyed
per device/user. `ui-architecture.md` §5 proposes unifying this with the future server-driven
module-enable config into one `dashboard-layout` endpoint rather than building three separate future
endpoints (enabled modules, card order, card notes) for what's really one client-side concern.

A module present in the registry but missing from a stored `cardOrder` (i.e. a new module shipped
since the user's layout was last saved) appends at the end, in registration `order`, on load — so
adding a module doesn't silently hide it from a returning user.

### 3. Web vs. touch parity

`gesture-handler`/`reanimated` support both, but the trigger differs (press-and-hold on touch,
click-and-drag on desktop web) and RN-Web support for these libraries has shifted across Expo SDK
releases historically. This needs an explicit smoke test on `npx expo start --web` as part of
implementing this, not an assumption that "it works on native so it works everywhere" — this
project already ships a web build (`app.json`'s `web.bundler: "metro"`), so this isn't a hypothetical
platform.

### 4. Accessibility fallback

Pure drag gestures have no default keyboard or screen-reader equivalent. **Recommendation:** each
card's header (see [0009](0009-card-content-model.md)) also exposes non-drag actions — e.g. "Move
up" / "Move down" — reachable without a drag gesture, from day one. This is a small addition now;
retrofitting it after an accessibility pass finds the gap later is a much larger one.

## If left unresolved

The team either builds multi-column drag machinery for a use case that doesn't need columns
(more library risk, more code, no clear product payoff over a ranked list), or ships reordering
with no persistence design, so a user's carefully-arranged dashboard resets on every reload.
