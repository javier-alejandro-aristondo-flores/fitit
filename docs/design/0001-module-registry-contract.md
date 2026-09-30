# 0001. Module registry contract

**Status:** Open
**Affects:** `src/core/moduleRegistry.ts`, every `src/modules/<name>/module.ts`
**Supersedes:** the `UIModule`/`registerModule` sketch in `docs/ui-architecture.md` §3.2, and folds
in the "Icon system" / "Module registration timing" / "Dashboard card reordering" items from its §6.

## The problem

`ui-architecture.md` §3.2 sketches the registry's *shape* — enough to agree on the pattern — but
not enough to implement against without every module author making a different judgment call on
the same five questions. A registry is only as useful as the contract it enforces; an unenforced
"convention" degrades the moment a second contributor writes a module slightly differently.

## Questions this must answer before implementation

### 1. What decides display order?

The §3.2 sketch has `order?: number` as optional, defaulting to "registration order." Registration
order is really *import order* in `src/modules/index.ts` — i.e. whichever line happens to be
first. That's an invisible source of truth: reordering imports for an unrelated reason (an
editor's auto-sort-imports, an alphabetization pass) silently reorders the dashboard and tab bar.

**Recommendation:** make `order: number` **required**, not defaulted. No implicit behavior tied to
import position.

### 2. What happens on a duplicate `id`?

Two contributors on parallel branches both add a module called `sleep`; the merge compiles fine,
and one module silently shadows the other depending on import order — the kind of bug that's
disproportionately expensive to trace back to "the registry" rather than "my module," especially
under the sprint/Jira workflow where these are often built in parallel by different people.

**Recommendation:** `registerModule()` throws synchronously on a duplicate `id`. A boot-time crash
that names the exact conflicting file is far cheaper than a silently dropped module discovered in
QA.

### 3. Who owns a `DashboardCard`'s data?

The §3.2 sketch's `DashboardCardProps` is just `{ onPress }`. Real cards need real data — the Diet
card needs a `DailyNutritionalSummary`, same as `app/(tabs)/diet.tsx` fetches today. Two ways to
supply it:

- **(a)** `dashboard.tsx` fetches everything and passes each module's data down as props.
- **(b)** each module's `card.tsx` fetches its own data, the same way its `screen.tsx` does.

(a) is what's implicitly proposed by extending `dashboard.tsx`'s current code — but it means
`dashboard.tsx` still has to know every module's data shape and API calls, which is exactly the
coupling the registry exists to remove; the coupling just moves from "hardcoded JSX" to "hardcoded
fetch-and-prop-drill," not away.

**Recommendation:** (b). Every `DashboardCard` is a fully self-sufficient component — it fetches,
loads, and errors independently (see [0004](0004-data-loading-and-invalidation.md)). `dashboard.tsx`
never learns what data a module needs. `DashboardCardProps` stays exactly `{ onPress }` — that's a
feature of the design, not something to grow speculatively.

### 4. What is `ModuleContext`, concretely?

`ui-architecture.md` §5 (server-driven config, future) and the `isEnabled?: (ctx: ModuleContext) =>
boolean` hook both reference `ModuleContext` without defining it. Nothing consumes it yet, but
every module's `isEnabled` signature bakes in whatever shape is picked here — changing it later
means touching every module, the exact kind of churn this registry is supposed to prevent.

**Recommendation:** pin a minimal, realistic first cut now, even unused:

```ts
export interface ModuleContext {
  authenticated: boolean;
  userId: string | null;
  flags: Record<string, boolean>;   // feature-flag escape hatch, empty object until one exists
}
```

`getModules(ctx)`/`getDashboardCards(ctx)` default `ctx` to `{ authenticated: true, userId: null,
flags: {} }` until real auth state (see [0006](0006-onboarding-and-auth-boundary.md)) is wired in,
so call sites don't change shape twice.

### 5. Icon typing (carried over from `ui-architecture.md` §6)

No icon library is a dependency yet (`frontend/package.json` has none). `UIModule.icon` needs a
real type, not `string`. **Recommendation:** `@expo/vector-icons` (ships with Expo, no native
config) — `icon: keyof typeof Ionicons.glyphMap` or similar — unless/until a visual design pass
wants custom SVGs, at which point `icon` becomes a `ComponentType` instead and every module updates
in one mechanical pass (the registry makes that a one-shape-change-many-files problem, which is
still far better than the change being scattered across hand-written tab/dashboard JSX).

### 6. Static vs. per-build-target registration (carried over from `ui-architecture.md` §6)

`src/modules/index.ts` doing static side-effect imports means every module always compiles into
every build. **Recommendation:** keep it static until there's an actual second build target (e.g.
a white-label variant) that needs a different module set — don't build the conditional-inclusion
mechanism speculatively.

### 7. Dashboard card reordering — revised: in scope, not fixed

This originally recommended "fixed for v1." That's now superseded — drag-to-reorder priority is a
confirmed product requirement, not a future nice-to-have. `order` on `UIModule` stays as the
registration-time **default/initial** position only; the live, user-visible order is separate
runtime state, merged in at render time, not a field the module itself owns or controls.

See [0008](0008-card-priority-and-drag-reorder.md) for the full design: why a single ordered list
rather than multi-column priority tiers, the drag library, and where the live order is persisted.

## Resolved contract (for reference once the above are agreed)

```ts
export interface UIModule {
  id: string;
  title: string;
  route: string;                        // derived as `/${id}` per 0002 — not independently authored
  icon: keyof typeof Ionicons.glyphMap;
  screen: ComponentType;
  DashboardCard?: ComponentType<{ onPress: () => void }>;
  order: number;                         // default/initial position only — see question 7 and 0008
  isEnabled?: (ctx: ModuleContext) => boolean;
}

export function registerModule(module: UIModule): void;   // throws on duplicate id
export function getModules(ctx?: ModuleContext): UIModule[];
export function getDashboardCards(ctx?: ModuleContext): UIModule[];
```

## If left unresolved

Whoever writes the second and third modules (after the initial workout/diet/impact conversion)
will each independently guess answers to these five questions, and the registry ends up exactly as
inconsistent as the hand-written screens it replaced — just with an extra layer of indirection on
top.
