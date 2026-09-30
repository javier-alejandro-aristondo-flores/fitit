# Design Specs

`docs/ui-architecture.md` proposes the shape of the modular UI (module registry + theming API).
This folder is where that shape gets pressure-tested — each file pins down one subsystem's
detailed design questions **before** someone hits them mid-implementation, instead of discovering
them as a surprise three modules in.

These aren't ADRs in the strict sense (a record of a decision already made) — most are still
**open**: a problem, the concrete evidence for it in this codebase, the questions that need an
answer, and a recommendation. Ratifying or overriding the recommendation *is* the decision.

## Status legend

| Status | Meaning |
|---|---|
| Open | Problem and recommendation written up; team hasn't signed off yet. Don't build against it as if settled. |
| Decided | Team agreed (in review, standup, or a Jira comment) — build against it. |
| Superseded | Replaced by a later doc — kept for history, linked from the doc that replaced it. |

## Index

| # | Title | Status | Affects |
|---|---|---|---|
| [0001](0001-module-registry-contract.md) | Module registry contract | Open | `src/core/moduleRegistry.ts`, every `src/modules/*/module.ts` |
| [0002](0002-navigation-route-binding.md) | Navigation & route binding | Open | `app/(tabs)/_layout.tsx`, Expo Router route files |
| [0003](0003-theming-token-system.md) | Theming token system (problems only) | Partially superseded — see [0010](0010-nativewind-adoption.md) | every component currently in `src/components/ui`, `src/features` |
| [0004](0004-data-loading-and-invalidation.md) | Data loading, caching & cross-module invalidation | Open | every module's `screen.tsx`/`card.tsx`, `src/lib/api` |
| [0005](0005-error-isolation.md) | Error isolation between modules | Open | `src/ui/primitives` (new `ErrorBoundary`), `src/ui/kanban/DraggableCardList.tsx` |
| [0006](0006-onboarding-and-auth-boundary.md) | Onboarding & auth boundary | Open | `app/onboarding/*`, `app/(tabs)/_layout.tsx` |
| [0007](0007-testing-and-module-conformance.md) | Testing & module conformance | Open | `frontend/package.json` (no test runner exists yet), `src/core/moduleRegistry.ts` |
| [0008](0008-card-priority-and-drag-reorder.md) | Card priority & drag-to-reorder | Open | new `src/ui/kanban/DraggableCardList.tsx`, `src/core/dashboardLayout.ts` |
| [0009](0009-card-content-model.md) | Card content model (draggable title, arbitrary text) | Open | `src/modules/*/card.tsx`, new `src/ui/kanban/CardHeader.tsx`/`CardNote.tsx` |
| [0010](0010-nativewind-adoption.md) | Styling system: NativeWind adoption | Decided (library) / Open (migration) | `babel.config.js`, `tailwind.config.js`, every styled component |

0008–0010 record the dashboard's kanban-adjacent direction (single draggable list, not multi-column
— see 0008's problem statement for why) and the NativeWind styling decision; 0001 and 0003 were
revised in place rather than left to contradict them (0001's reordering question now points to
0008; 0003 is marked superseded on mechanism, kept for its still-valid evidence).

## Adding a new one

1. Copy the closest existing file, next sequential number, kebab-case title.
2. Keep the same section shape (Problem → Evidence in this codebase → Questions → Recommendation →
   If left unresolved) — that shape is what makes these skimmable together; free-form design notes
   belong in the PR/Jira ticket, not here.
3. Point at real files and line numbers, not hypothetical ones. A design doc that cites code nobody
   can find stops being trusted fast.
4. Add a row to the index table above.
5. Once the team actually decides something here, flip Status to **Decided** — don't leave settled
   questions marked Open, or this stops being a reliable "is this safe to build on" signal.
