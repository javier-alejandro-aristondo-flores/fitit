# 0002. Navigation & route binding

**Status:** Open
**Affects:** `app/(tabs)/_layout.tsx`, every route file under `app/(tabs)/`
**Depends on:** [0001](0001-module-registry-contract.md) (`UIModule.route`)

## The problem

`ui-architecture.md` §3.2 says `app/(tabs)/_layout.tsx` will "render `Tabs.Screen` per
`getModules()`," which reads as if navigation becomes fully dynamic. It can't be, fully — and
building as if it can leads straight to a broken deep link or a confusing 404 on web, discovered
after the registry is already in place.

`frontend/app.json` has `"experiments": { "typedRoutes": true }`. Expo Router's typed routes work
by **statically scanning the `app/` directory** at build time to know what routes exist and
generate types for them. That scan is filesystem-based, not registry-based. The same static
requirement is what makes direct URL navigation, browser refresh (web), and deep links resolve at
all — Expo Router needs a real file at `app/(tabs)/<name>.tsx` for `/<name>` to be a valid
destination, regardless of what any runtime JS registry says exists.

## Evidence in this codebase

`app/(tabs)/dashboard.tsx`, `workout.tsx`, `diet.tsx`, `impact.tsx` are real files today;
`app/(tabs)/_layout.tsx` lists them by literal `name="dashboard"` etc. There is currently no
indirection between "a module exists" and "a file exists" — this doc is about what happens to that
relationship once a registry sits in between.

## Questions this must answer before implementation

### 1. What's actually dynamic, and what stays static?

**Recommendation:** the *set* of possible routes stays static — one file per module under
`app/(tabs)/`, each a one-line re-export of that module's `screen.tsx` (per `ui-architecture.md`
§3.1: `export { default } from '../../src/modules/<name>/screen'`). What's dynamic is *visibility
and order* — `_layout.tsx` renders `Tabs.Screen` only for modules `getModules()` returns, in that
order. The registry controls which of the statically-known routes appear in the tab bar, not which
routes exist.

This means `ui-architecture.md` §3.2's claim "adding a module = add a folder under `src/modules/`,
add one line to `modules/index.ts`. No edits to `_layout.tsx` or `dashboard.tsx`" is accurate as
written (neither file needs editing) but incomplete: a new module still needs **one new file**
under `app/(tabs)/` (the re-export). That file should be updated to say so explicitly.

### 2. What happens when a disabled module is reached directly?

Once `isEnabled(ctx)` (0001) can return `false` — today always true, later driven by auth/flags/a
server config per `ui-architecture.md` §5 — the route *file* still physically exists and is still
reachable by direct URL or a stale deep link, even though it's absent from the tab bar. "Disabled"
that only removes a tab is cosmetic, not enforced.

**Recommendation:** each module's `screen.tsx` checks its own module's `isEnabled` (via the same
registry, same `ctx`) on mount and redirects (e.g. to `/dashboard`) if false, rather than relying
on the tab bar's absence alone. This is a small shared helper, not per-module boilerplate — a
`useRequireModuleEnabled(moduleId)` hook in `src/core/` that every `screen.tsx` calls once.

### 3. Where does `route` come from?

0001's resolved contract has `route: string` as a field on `UIModule`, independently settable —
that invites drift (a module's `id` is `sleep` but someone types `route: '/sleeps'`), which then
silently breaks deep links or `router.push()` calls elsewhere that assume `/${id}`.

**Recommendation:** drop `route` as an independently-authored field; derive it everywhere as
`` `/${module.id}` ``. The remaining discipline is just "the file under `app/(tabs)/` must be named
`<id>.tsx`" — one naming rule instead of two things (an id and a route string) that have to be kept
in sync by hand.

## If left unresolved

The first module added after the registry ships either (a) works in the tab bar but 404s on direct
web navigation/refresh because no one realized a route file was still required, or (b) "removing" a
module from a user's view via `isEnabled` turns out not to actually block them from reaching it by
URL — both are the kind of bug that looks like it's the registry's fault, when really it's this
doc's questions going unanswered.
