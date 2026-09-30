# 0004. Data loading, caching & cross-module invalidation

**Status:** Open
**Affects:** every module's `screen.tsx`/`card.tsx`, `src/lib/api`
**Depends on:** [0001](0001-module-registry-contract.md) §3 (each `DashboardCard` fetches its own data)

## The problem

0001 recommends every `DashboardCard` be self-sufficient — it fetches its own data rather than
having `dashboard.tsx` fetch and prop-drill it down. Taken alone, that recommendation just means
*relocating* the pattern already in every screen today into more places at once. That pattern has
two problems of its own, today, that would otherwise get copied into every future module along
with it.

## Evidence in this codebase

Every screen independently does `useEffect(() => { api.X().then(setY) }, [])`:

- `app/(tabs)/dashboard.tsx:26-29` — fetches both the current routine and the daily summary.
- `app/(tabs)/diet.tsx:14-16` — fetches the daily summary again, independently.
- `app/(tabs)/workout.tsx:25-27` — fetches the current routine again, independently.

Two consequences, both visible today:

1. **No error handling at all.** None of these `.then()` calls have a `.catch()`. If
   `api.logs.getDailySummary()` rejects, `summary` never leaves `null`, and the screen is stuck
   showing `"Loading…"` forever (e.g. `dashboard.tsx:57`, `:80`) with no way for a user to know
   anything went wrong, let alone retry.
2. **No coordination between screens that want the same data.** Dashboard and Diet both call
   `getDailySummary()` independently; navigating dashboard → diet re-fetches data that's seconds
   old, with a visible second loading flash for something already in memory.

## Questions this must answer before implementation

### 1. Ad hoc fetching per module, or a shared data layer?

Given modules are meant to be added over time, plausibly by different contributors working in
parallel (the Jira/sprint workflow this team already uses), leaving "how a module loads data" fully
open means this exact bug (no error state, duplicate fetches) re-multiplies by the number of
modules instead of getting fixed once.

**Recommendation:** introduce one shared fetching/caching hook now, before more modules copy
today's pattern — it doesn't need to be a heavy dependency; a small custom `useQuery(key, fn)`
wrapping the existing `ApiClient` (`src/lib/api`) is enough to get a shared cache keyed by string,
in-flight de-duping, and a consistent `{ data, loading, error }` shape. (TanStack Query is the
obvious off-the-shelf option if the team would rather not maintain a hand-rolled version — either
way, the decision is "one shared mechanism," not which library implements it.)

### 2. Does an AI coach action need to invalidate other modules?

`src/features/workout/AICoachChat.tsx`'s "Regenerate my weekly plan" button calls
`api.routines.generate(...)` — a workout-domain call. Per the README, the AI coach is described as
one coach spanning workout, diet, *and* progress tracking ("acts as an active coach... dynamically
adjusts projections if workouts are missed"). Nothing in the current types
(`WorkoutPlanInput`/`WorkoutPlanOutput` in `src/lib/types/routine.ts`) references diet or impact
data, so today this is workout-only client-side — but if the real backend behavior is cross-cutting
once it exists, a client that doesn't know that will show a stale Diet card or Impact projection
right after the coach changes something that affects them.

**Recommendation:** treat modules as data-independent for v1 — no client-side event bus or shared
invalidation mechanism between modules, each module's cache invalidates only on its own actions.
State this explicitly (rather than leaving it silently assumed) so a future module author doesn't
*assume* cross-module sync exists when it doesn't. Revisit only once a real backend contract shows
an action in one domain needs to invalidate another.

### 3. What's the minimum contract every module must meet?

Loading, error, and empty states can't be a per-module afterthought the way they are today — that's
exactly how `dashboard.tsx`/`diet.tsx`/`workout.tsx` ended up with the "stuck on Loading… forever"
gap in the first place.

**Recommendation:** the shared hook from question 1 (or, at minimum, a shared
`<AsyncBoundary data={…} loading={…} error={…}>` presentational wrapper) becomes part of what
[0007](0007-testing-and-module-conformance.md) checks for a new module — a module that renders
`<Text>Loading…</Text>` with no error path shouldn't pass review going forward, the same way it
shouldn't have shipped the first three times.

## If left unresolved

Three modules already have this bug; the fourth, fifth, and sixth will too, and each one will need
its own bug report and its own fix instead of one shared fix applied once.
