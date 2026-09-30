# 0009. Card content model — draggable title, arbitrary text body

**Status:** Open
**Affects:** `src/modules/*/card.tsx` (redefines what a `DashboardCard` renders), new
`src/ui/kanban/CardHeader.tsx`, `src/ui/kanban/CardNote.tsx`
**Depends on:** [0001](0001-module-registry-contract.md) §3 (each card fetches its own data),
[0004](0004-data-loading-and-invalidation.md) (eventual structured content), [0008](0008-card-priority-and-drag-reorder.md) (title = drag handle)

## The problem

"For now each card should be able to hold arbitrary text, and have a draggable title" describes a
simpler, more generic card than [0001](0001-module-registry-contract.md)'s original
`DashboardCard` concept, which assumed every module's card renders that module's real structured
summary from day one (e.g. the Diet card showing calories/macros, mirroring `app/(tabs)/diet.tsx`
today). That's worth designing on purpose, not leaving as an implicit simplification someone has to
reverse-engineer later.

## Questions this must answer before implementation

### 1. What does "arbitrary text" actually model?

Two readings, with different consequences:

- **(a) A permanent, user-owned note field** — a scratch space on every card, independent of
  whatever structured content that module eventually renders (think: a Trello card's description).
- **(b) A placeholder stand-in** for the real structured content that hasn't been built yet — pure
  scaffolding, meant to be deleted once each module's real card content lands.

These aren't the same feature. (a) needs a real, indefinitely-persisted data field. (b) is
throwaway and should look visibly temporary (e.g. muted "not yet built" styling) so whoever wires up
real content next knows to remove it rather than build around it.

**Recommendation:** (a). Give the free-text note a genuine, permanent purpose — a place for a quick
annotation ("ask the coach about swapping dinner") — rather than scaffolding that gets ripped out.
Structured content (per [0004](0004-data-loading-and-invalidation.md), once each module fetches its
own real data) renders in the card body *alongside* this note, not instead of it. Concretely: every
card has a header (title + drag handle) and a body; the body can hold a module's structured content
when that exists, and always has room for the user's free-text note regardless.

### 2. Where's the text persisted?

Same store as [0008](0008-card-priority-and-drag-reorder.md)'s `cardOrder` — one
`DashboardLayout` object (`cardOrder: string[]`, `cardNotes: Record<moduleId, string>`), same local
storage now, same future per-user backend resource later. Deliberately not a second, separate
persistence mechanism — card position and card notes are both "this user's dashboard state," and
keeping them in one object means one migration path when a backend endpoint for it eventually
exists (`ui-architecture.md` §5).

### 3. The title is the drag handle, mechanically

The drag gesture ([0008](0008-card-priority-and-drag-reorder.md)) has to attach to the card's
title/header row specifically — not the whole card — so a touch inside the free-text note (typing,
selecting text, scrolling a long note) doesn't fight with the drag gesture. This needs to be one
shared component every module's card uses identically (`CardHeader`), not something each module
wires up slightly differently with its own `onLongPress`/gesture handler. `CardHeader` owns: the
title text, the drag-handle affordance, and the non-drag "Move up"/"Move down" accessibility fallback
from [0008](0008-card-priority-and-drag-reorder.md) question 4.

### 4. One card per module, still

[0001](0001-module-registry-contract.md)'s contract has `DashboardCard?: ComponentType` — zero or
one card per module. Nothing about arbitrary text or drag-reordering changes that.
**Reaffirmed:** one card per module for v1; a module wanting to show more surfaces more content
inside that one card (or lives on its full `screen.tsx` instead), rather than registering multiple
cards.

## If left unresolved

Modules ship with inconsistent drag-handle wiring (some draggable by title, some by the whole card,
some fighting with an internal `TextInput`'s own touch handling), and "arbitrary text" quietly
becomes scaffolding nobody scoped a real backing field for — so it either never actually persists,
or gets designed and built twice: once now as a stub, once later as "the real feature."
