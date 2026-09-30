# 0006. Onboarding & auth boundary

**Status:** Open
**Affects:** `app/onboarding/*`, `app/login.tsx`, `app/signup.tsx`, `app/(tabs)/_layout.tsx`
**Depends on:** [0001](0001-module-registry-contract.md) §4 (`ModuleContext.authenticated`)

## The problem

Every design doc so far (`ui-architecture.md` and 0001–0005) scopes the module registry to the
authenticated tab-bar/dashboard surface — workout, diet, impact. Two other parts of the app don't
fit that shape at all, and the registry's existence raises a question about both that's worth
answering explicitly rather than by default.

## Evidence in this codebase

- `app/onboarding/about.tsx` → `goal.tsx` → `equipment.tsx` → `generating.tsx` is a **linear
  wizard**, not a set of independent parallel modules. Each step currently hardcodes its
  next/previous step directly (the same *shape* of problem `ui-architecture.md` §1 describes for
  the dashboard — one level removed, and one step short of also needing a registry).
- `app/login.tsx`, `app/signup.tsx`, `app/index.tsx` are pre-auth screens reached before any
  `(tabs)` route. None of `app/(tabs)/dashboard.tsx`, `workout.tsx`, `diet.tsx`, or `impact.tsx`
  currently check auth state before rendering — reaching `(tabs)` at all relies on the assumption
  that login already happened, not on anything that enforces it.

## Questions this must answer before implementation

### 1. Is onboarding in scope for the module registry?

Extending the registry pattern to onboarding (e.g. "add a new onboarding question without touching
every step's wiring") is a plausible future ask, structurally similar to what this effort already
solves for the dashboard.

**Recommendation:** explicitly **out of scope** for v1. A linear wizard (each step has exactly one
next and one previous) and a set of independent, simultaneously-visible modules (dashboard cards,
tabs) are different enough shapes that generalizing one registry to cover both now would be
speculative — solving a problem onboarding doesn't clearly have yet. Revisit only if/when
onboarding actually needs to grow new steps often enough for the hardcoded wiring to hurt, the same
trigger that justified this effort for the dashboard.

### 2. Who enforces auth gating, and where?

Once `ModuleContext.authenticated` (0001 §4) exists, there's a real choice: does every module check
it independently, or does one place check it for all of them?

**Recommendation:** centrally, once, in `app/(tabs)/_layout.tsx` — before any `Tabs.Screen` renders,
redirect to `/login` if `!ctx.authenticated`. Auth is cross-cutting by nature, not a per-module
concern; handling it centrally means a new module author never has to remember to add an auth
check, and there's exactly one place to audit for "can an unauthenticated user reach this."

This is also where [0002](0002-navigation-route-binding.md) question 2's per-module
`isEnabled`-redirect check and this auth check compose: auth gating happens once at the layout
level (this doc), per-module `isEnabled` gating happens per-screen (0002) — different concerns,
different layers, not duplicated logic.

## If left unresolved

Either onboarding quietly grows its own second, slightly-different registry pattern nobody decided
on (scope creep from a doc that was only ever about the dashboard), or auth gating gets added
ad hoc to whichever module happens to need it first and never to the others — leaving some
authenticated screens reachable without logging in, discovered by whoever notices first rather than
by design.
