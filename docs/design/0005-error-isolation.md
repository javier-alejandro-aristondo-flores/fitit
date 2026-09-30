# 0005. Error isolation between modules

**Status:** Open
**Affects:** `src/ui/primitives` (new `ErrorBoundary`), `src/ui/kanban/DraggableCardList.tsx`
**Depends on:** [0004](0004-data-loading-and-invalidation.md) (complementary, not a substitute — see question 2)

## The problem

None of the current screens have an error boundary anywhere. A render-time throw in one part of a
screen today crashes that whole screen; once modules share one dashboard (`ui-architecture.md`
§3.4's draggable list of `DashboardCard`s — see [0008](0008-card-priority-and-drag-reorder.md)), a
bug in a single module's card would take down the entire dashboard — every other module's card
included — not just the broken one. That's the opposite of what "modular" is supposed to buy: the
whole point of fault isolation is that a bug in the newest, least-tested module doesn't take out
the three that already work.

## Questions this must answer before implementation

### 1. What granularity of boundary?

Three options: per-card, per-screen, or app-level-only (the current state, implicitly — Expo
Router's root `<Stack>` in `app/_layout.tsx` has no boundary either, so today an app-level crash is
the *only* level that exists).

**Recommendation:** two levels, both module-scoped:
- Each `DashboardCard` rendered inside `DraggableCardList` gets its own `<ErrorBoundary>` — a
  broken Impact card shows a small inline fallback ("Impact is unavailable right now") while
  Workout and Diet in the same list keep working (and stay draggable).
- Each module's `screen.tsx`, at the route level, gets the same treatment — a broken Diet screen
  doesn't take out the tab bar itself, so the user can still navigate to Workout or Impact.

### 2. This doesn't cover async errors — say so explicitly

React error boundaries only catch render-time throws, not a rejected promise inside a `useEffect`.
That's [0004](0004-data-loading-and-invalidation.md)'s job (the shared `{ data, loading, error }`
contract), not this one's. The two are complementary — a module needs both a boundary (for render
bugs) and explicit error state handling (for fetch failures) — and it's worth stating plainly here
so an implementer doesn't ship one and assume it covers the other.

### 3. What does a fallback do beyond rendering?

No crash-reporting or logging library exists in `frontend/package.json` today. Building real
telemetry isn't in scope here, but the boundary's fallback shouldn't have to be rewritten once it
is.

**Recommendation:** the shared `<ErrorBoundary>` component takes an `onError(moduleId, error)`
prop from day one, defaulting to `console.error`. Wiring real telemetry later means changing that
one default, not touching every module's boundary usage.

## If left unresolved

The registry (0001) makes modules independent in name — separate folders, separate registration —
while a single uncaught render error in any one of them still takes the whole dashboard down at
runtime, which is the one failure mode "modular" was supposed to prevent in the first place.
