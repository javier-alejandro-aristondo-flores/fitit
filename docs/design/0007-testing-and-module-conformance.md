# 0007. Testing & module conformance

**Status:** Open
**Affects:** `frontend/package.json` (no test runner is configured yet), `src/core/moduleRegistry.ts`
**Depends on:** [0001](0001-module-registry-contract.md), [0004](0004-data-loading-and-invalidation.md), [0005](0005-error-isolation.md)

## The problem

0001–0005 each define a contract a module is supposed to meet (unique `id`, required `order`, a
file under `app/(tabs)/` matching its `route` per 0002, self-sufficient data loading with a
loading/error state per 0004, an error boundary per 0005). None of that is automatically checked
anywhere today — it would only be caught in manual code review, inconsistently, especially under
sprint deadline pressure with multiple people adding modules in parallel.

## Evidence in this codebase

`frontend/package.json` has no `jest`, `vitest`, `@testing-library/react-native`, or any other test
runner in its dependencies at all — this isn't a gap in an existing suite, there currently is no
suite. `AGENTS.md`'s own command list (`expo lint`, `tsc --noEmit`, `expo-doctor`) has no test
command, because there's nothing to run.

## Questions this must answer before implementation

### 1. Is a test runner a prerequisite for this effort, or a separate decision?

Introducing a registry with an unenforced contract is barely better than the hardcoded JSX it
replaces — the contract just moves from "obviously visible in a 130-line `dashboard.tsx`" to
"implicit, and someone has to remember to check it in review." Enforcing it requires something that
runs automatically, which requires a test runner to exist first.

**Recommendation:** treat adding a minimal test runner (Jest is the Expo-recommended default —
`jest-expo` — per Expo's own testing docs) as an explicit, small prerequisite step of this effort,
not a separate backlog item that may or may not happen. It doesn't need to arrive with a large
suite — one conformance test (question 2) is enough to start.

### 2. One generic conformance test, not one test file per module

**Recommendation:** a single test file (e.g. `src/core/moduleRegistry.test.ts`) that imports
`src/modules/index.ts` (triggering every module's registration) and then iterates
`getModules()`, asserting the structural contract for *every* registered module at once:

- every `id` is unique (registration would already throw per 0001, but assert it explicitly so the
  failure is a clear test name, not a boot crash someone has to trace)
- every `order` is a defined number (0001 — not left to the optional default)
- a route file exists under `app/(tabs)/` matching `` `/${module.id}` `` (0002)
- if `DashboardCard` is present, it renders without throwing given no network (0004/0005's error
  path, exercised directly)

New modules get this coverage for free by registering — no new test file required per module,
which matters because a missed test file is exactly the kind of thing that slips under deadline
pressure; a check that runs automatically for anything registered doesn't have that failure mode.

### 3. Per-module unit tests — recommended, not mechanically enforced

Things the generic test above can't check (does `card.tsx` render sensibly *given* real mock data,
does `screen.tsx` show the right thing in its error state) are better as a per-module test living
next to that module. **Recommendation:** state this as an expectation in whatever a new
contributor actually reads first when adding a module (a short note in `src/modules/` or a
CONTRIBUTING doc), not only here — a rule that only lives in `docs/design/` is a rule most
contributors will never see.

### 4. Visual regression — explicitly deferred

`ui-architecture.md`'s scope is architecture, not the visual redesign; no snapshot/visual-diff
tooling is proposed here for the same reason. Noted so it reads as a deliberate exclusion, not an
oversight.

## If left unresolved

Every module beyond the first three either quietly skips whatever part of 0001/0004/0005's
contract its author didn't happen to remember, or someone has to manually re-review every module
against four other documents every time — which is slower than writing one test file, and less
reliable.
