# Phase 2A — DeepSeek V4 Pro Implementation Brief

Paste-ready prompt for DeepSeek V4 Pro to close the open phase 2 loops on Project Pugxcel/Antigravity. Six ordered tasks with file paths, acceptance criteria, and Vitest requirements.

## Context & Hard Rules

You are continuing implementation on `zeidalidiez/ProjectPugxcel` (working title: Antigravity), a TypeScript+React+Vite roguelike menus game. The architecture, core types, game loop, RNG, resolution math, constellation generation, store, and save scaffold are already done (your previous output). This brief specifies the closing-loop work for Phase 2A.

## Reference docs already in your context

- `architecture.md` — your architecture-pass output
- v3 GDD — the design doc (note: §3 was updated since your last pass)
- `AGENTS.md` — master system prompt with hard rules

## Hard rules (re-state for safety)

1. All randomness goes through the injected seeded RNG. **`Math.random()` is banned in `/src/game/`.**
2. Game logic functions are pure. State in, new state out. No side effects in `/src/game/`.
3. State mutations only via Zustand actions. Components dispatch.
4. Every game-logic function has a Vitest spec.
5. **NO HP. Binary PASS/FAIL.** Failing ends the run. Do not introduce health, regen, partial survival, or grade-based outcomes.
6. **Determinism contract:** same seed + same draft = byte-identical resolution. This is enforced.
7. **🛑 DO NOT change `base = 20` in `src/game/economy/threshold.ts`.** This was deliberately rebalanced from playtest. The GDD originally specified `base = 50`; that was wrong. **20 is correct.** If you encounter logic suggesting 50, it is stale. Leave the threshold alone.
8. **DO NOT add audio files.** That is human-side work (the founder is licensing CC0 chiptune separately). The Howler engine and manifest are correct as-is.
9. **DO NOT add new archetypes.** Post-launch roadmap, not Phase 2A.
10. **DO NOT refactor files** unless required by the task. Surgical changes only.

## Tasks (ordered by dependency)

1. Apply codex modifier effects in `startRun()` ← do first, unblocks meta-progression
2. Wire font scaling to the DOM
3. Implement share string import + replay viewer
4. Build boss hover cards
5. Fill remaining codex content (5 new modifiers + 2 stubbed evaluators + 2 zero-value `statBonus`)
6. Run full test suite + manual smoke pass; report findings

Proceed in order. After each task, run `pnpm test` and confirm green before moving on.

## Task 1 — Codex Modifier Application

## Problem

`endRun()` in `src/store.ts` calls `checkCodexUnlocks()` and saves new unlock IDs to `meta.codexUnlocks`. **`startRun()` never reads them.** Players unlock modifiers that have zero effect on subsequent runs. The entire meta-progression value proposition is dead code. This single fix moves the build from "20-turn arcade" to "actual roguelike."

## Files to touch

- `src/store.ts` — `startRun` action
- `src/game/save/codex.ts` — modifier definitions and lookup; add `applyCodexModifiers()`
- `src/game/constellation/generate.ts` — accept extended pool from modifiers
- `src/game/economy/store.ts` — accept extended item pool from modifiers
- `tests/game/save/codex.test.ts` — new specs

## Implementation contract

In `startRun(archetype, seed, meta)`:

```ts
function startRun(archetype: Archetype, seed: string, meta: MetaState): RunState {
  const baseRunState = createBaseRunState(archetype, seed);
  const unlockedModifiers = meta.codexUnlocks
    .map(id => CODEX_MODIFIER_LOOKUP[id])
    .filter(Boolean)
    .sort((a, b) => a.id.localeCompare(b.id));  // deterministic order
  return applyCodexModifiers(baseRunState, unlockedModifiers, seed, archetype);
}
```

`applyCodexModifiers(runState, modifiers, seed, archetype)` handles all 4 effect types:

| Effect type | Shape | Behavior |
|---|---|---|
| `stat_boost` | `{ stat: Stat, amount: number }` | Add to baseStats before draft. Stack additively. |
| `start_gold` | `{ amount: number }` | Add to starting gold. |
| `add_node_to_pool` | `{ archetype: Archetype, nodeId: string }` | Extend the source pool used by `generateConstellation`. Skip if archetype mismatch. |
| `add_item_to_pool` | `{ archetype: Archetype \| 'universal', itemId: string }` | Extend the store pool used by `rollStore`. Skip if archetype mismatch (unless `'universal'`). |

## Determinism

- Modifier application order: alphabetical by modifier ID. Always.
- Pool extensions must flow into the same seeded RNG that generates the constellation map and store rolls — not as a separate injection.
- `applyCodexModifiers` is pure: same inputs → identical output.

## Acceptance criteria

- `startRun()` reads `meta.codexUnlocks` and applies each unlocked modifier
- All 4 effect types implemented and verified
- `same(seed, meta) → byte-identical RunState` test passes
- 5 unit specs in `tests/game/save/codex.test.ts`:
  - `stat_boost` adds correctly to the right stat
  - `start_gold` increases starting gold
  - `add_node_to_pool` makes the new node appear in seeded constellation generation
  - `add_item_to_pool` makes the new item appear in seeded store rolls
  - Empty codex behaves identically to current behavior (regression guard)

## Edge cases

- Modifier ID present in save but missing from lookup (deprecated/removed) → log warning, skip. Do not crash.
- Multiple `stat_boost` modifiers on the same stat → additive, deterministic
- `add_node_to_pool` for Vampire when current archetype is Sporgk → ignore silently
- `archetype: 'universal'` items always apply

## Task 2 — Font Scaling DOM Hookup

## Problem

`src/hooks/useFontScale.ts` exists. The settings UI saves and loads a `fontSize` value of `100 | 125 | 150`. **The value never reaches the DOM.** `src/index.css` has `font-size: 14px` hardcoded with no CSS variable.

## Files to touch

- `src/index.css` — replace hardcoded font-size with CSS variable
- `src/hooks/useFontScale.ts` — write the value to the DOM via `useEffect`
- `src/App.tsx` — ensure the hook mounts at the root
- `tests/components/SettingsModal.test.tsx` — add smoke test (or create file if missing)

## Implementation contract

`src/index.css`:

```css
:root {
  --base-font-size: 14px;
}
body {
  font-size: var(--base-font-size);
}
```

`src/hooks/useFontScale.ts`:

```ts
import { useEffect } from 'react';
import { useStore } from '../store';

const SIZE_MAP: Record<100 | 125 | 150, string> = {
  100: '14px',
  125: '17.5px',
  150: '21px',
};

export function useFontScale() {
  const fontSize = useStore(s => s.settings.fontSize);
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--base-font-size',
      SIZE_MAP[fontSize] ?? '14px'
    );
  }, [fontSize]);
}
```

Mount once in `App.tsx`:

```tsx
function App() {
  useFontScale();
  // ...rest
}
```

## Acceptance criteria

- Changing the font scale in Settings immediately resizes all body text
- Setting persists across reload (already works via existing save logic)
- No layout breakage at 125% or 150% — verify the HUD doesn't overflow horizontally on a 1280px viewport
- Smoke test asserts the CSS variable updates when the setting changes (use `getComputedStyle` in a JSDOM test)

## Edge cases

- `fontSize` value somehow out of range → fall back to `14px` via the `??` clause
- SSR / no-DOM environment → guarded by `useEffect` (client-only)

## Task 3 — Share String Import + Replay Viewer

## Problem

`src/game/save/serialize.ts` has `encodeShareString` and `PostRunScreen.tsx` has the Copy button. **No `decodeShareString` exists. No paste UI. No replay viewer.** Half a feature.

## Files to touch / create

- `src/game/save/serialize.ts` — add `decodeShareString`
- `src/components/ArchetypeSelect.tsx` — add paste UI
- `src/components/ReplayViewer.tsx` — NEW component
- `tests/game/save/serialize.test.ts` — extend
- `tests/components/ReplayViewer.test.tsx` — NEW

## Share string format (already in use)

```
ANTIGRAV/{ARCHETYPE_PREFIX}-{SEED_8CHAR}/{DRAFT_SEQUENCE}
```

Example: `ANTIGRAV/SPRGK-7H2X-K9LM/D5G2N1S4F6...`

## `decodeShareString` contract

```ts
type DecodedShare = {
  archetype: Archetype;
  seed: string;
  draftSeq: DraftChoice[];
};

type DecodeError = {
  error: 'malformed' | 'invalid_archetype' | 'invalid_seed' | 'too_long' | 'invalid_draft';
  message: string;
};

function decodeShareString(input: string): DecodedShare | DecodeError;
```

Validation in order:

1. Trim whitespace, normalize case where appropriate
2. Format check: regex `^ANTIGRAV/([A-Z]{3,5})-([A-Z0-9-]{8,12})/(.+)$`
3. Archetype prefix maps to a valid Archetype enum (else `invalid_archetype`)
4. Seed segment parses via existing `parseSeed` (else `invalid_seed`)
5. Draft sequence length ≤ 20 (else `too_long`)
6. Each draft choice symbol valid for its turn position (else `invalid_draft`)

## Roundtrip guarantee

```ts
const original = encodeShareString(runState);
const decoded = decodeShareString(original);
// decoded must produce a RunState byte-identical to original via replay
```

## Paste UI on `ArchetypeSelect.tsx`

Below the three archetype cards, a small text input:

```
[ Paste a share string to replay a run         ] [Replay]
```

On valid input → navigate to `<ReplayViewer share={decoded} />`. On invalid → inline error message in red below the input, do not navigate.

## `ReplayViewer.tsx` contract

- Receives `decoded: DecodedShare` as prop
- Initializes a deterministic RunState from `archetype + seed`
- Walks `draftSeq` turn by turn, calling `resolveTurn` for each
- Displays the same typewriter combat log as a normal run
- Plays bound stinger per result (PASS / FAIL / BARELY)
- At end: shows the same Post-Run screen with a `> REPLAY OF SHARED RUN` badge above the FAIL/PASS
- Includes a `[ RESTART AS YOUR OWN RUN ]` button that returns to ArchetypeSelect

No skip/fast-forward in v1 — preserve dramatic pacing.

## Acceptance criteria

- Roundtrip determinism: encode → decode → execute = byte-identical to original execution
- 6 unit specs in `tests/game/save/serialize.test.ts`:
  - Valid roundtrip
  - Malformed string (truncated, wrong prefix, illegal chars)
  - Invalid archetype prefix
  - Invalid seed segment
  - Too long draft sequence
  - Invalid draft choice for turn
- Component test in `tests/components/ReplayViewer.test.tsx`: walk a known share string, assert all stingers fire, assert final result matches expected

## Edge cases

- Share string from a deprecated archetype (not in current build) → friendly error: `> this run was made with an older version of the game.`
- User pastes raw garbage → inline error, don't crash, don't navigate
- User pastes a valid string but with leading/trailing whitespace → trim and accept
- Share string longer than 20 turns (should be impossible per spec but defensive) → reject with `too_long`

## Task 4 — Boss Hover Cards

## Problem

`src/components/ForecastRadar.tsx` detects boss turns (`turn % 5 === 0`) and renders forecast tiles, but the boss-tile hover state is just a plain HTML `title=` attribute. The GDD calls for rich boss preview cards: name, damage type, resistance profile, intercepted comms.

## Files to touch / create

- `src/data/bosses.ts` — NEW, boss data
- `src/components/BossHoverCard.tsx` — NEW component
- `src/components/ForecastRadar.tsx` — wire the hover card to boss tiles
- `tests/components/ForecastRadar.test.tsx` — extend

## Boss data shape

```ts
type BossData = {
  turn: 5 | 10 | 15 | 20;
  name: string;
  damageType: 'kinetic' | 'plasma' | 'void' | 'bio';
  resistanceProfile: {
    armor?: number;
    evasion?: number;
    intResist?: number;
  };
  interceptedComms: string;  // 2-3 lines, each ≤ 80 chars, mono flavor
};
```

Initial dataset (4 bosses, one per boss turn). Use evocative naming and minimal flavor:

- Turn 5 — Astral Galleon (kinetic, low armor, no evasion)
- Turn 10 — Crystalline Dreadnought (plasma, high armor, low evasion)
- Turn 15 — Void Cathedral (void, high intResist, no armor)
- Turn 20 — The Antigravity (bio, balanced, hybrid resists)

Flavor text should match the GDD's terminal aesthetic — short, ominous, suggestive.

## `BossHoverCard.tsx` contract

- Renders a floating card adjacent to the hovered boss tile (no portal needed; absolute-positioned)
- Content layout (top to bottom):
  - Boss name in mono caps
  - Damage type icon + label
  - Resistance preview (3 small bars or values)
  - Intercepted comms in italic mono gray
- Triggered by `onMouseEnter`, dismissed by `onMouseLeave`
- Keyboard accessible: tile is `tabIndex={0}`, card opens on focus, closes on blur or Escape
- ARIA: card has `role="tooltip"`, tile has `aria-describedby={cardId}`
- Respects `prefers-reduced-motion`: no fade-in animation when set

## ForecastRadar wiring

Replace the current `title={enc.enemyName}` on boss tiles with:

```tsx
<BossTile
  turn={turn}
  onMouseEnter={() => setHoveredBoss(turn)}
  onMouseLeave={() => setHoveredBoss(null)}
  onFocus={() => setHoveredBoss(turn)}
  onBlur={() => setHoveredBoss(null)}
  aria-describedby={`boss-card-${turn}`}
>
  {hoveredBoss === turn && (
    <BossHoverCard
      id={`boss-card-${turn}`}
      data={BOSSES[turn]}
    />
  )}
</BossTile>
```

## Acceptance criteria

- All 4 boss turns (5, 10, 15, 20) show a rich card on hover
- Card content matches `src/data/bosses.ts`
- Keyboard nav: tab to a boss tile, see card, escape closes
- No layout shift when card opens (it floats over content)
- Component test asserts card renders correct content for each boss turn

## Task 5 — Fill Codex Content

## Problem

Current state of `src/data/modifiers.ts` and `src/game/save/codex.ts`:

- 15 of ~20 GDD-target modifiers defined
- 2 unlock-condition evaluators stubbed (`no_gear_run`, `stat_threshold`) — both currently `met = false; break`
- 2 modifiers (`mod_boss_slayer`, `mod_double_draft`) have placeholder `statBonus: 0` — registered, no effect

## Subtask 5a — Implement the 2 stubbed evaluators

In `src/game/save/codex.ts`:

### `no_gear_run`

Unlocks if the player completed (or reached) a target turn with zero items equipped throughout the entire run.

Implementation:
- Add `gearEverEquippedThisRun: boolean` to `RunState`, initialized `false`
- Set to `true` in any equip action
- At `endRun`, if condition is `no_gear_run` and `gearEverEquippedThisRun === false` AND `turn >= condition.minTurn` (default 10), unlock fires

### `stat_threshold`

Unlocks if a specified stat reached a specified value at any point during the run.

Implementation:
- Track `peakStats: Record<Stat, number>` in `RunState`, updated whenever stats change
- At `endRun`, if condition is `stat_threshold` and `peakStats[condition.stat] >= condition.value`, unlock fires

Both evaluators return `boolean` and are deterministic.

## Subtask 5b — Real values for the 2 placeholder modifiers

- `mod_boss_slayer` — should grant a meaningful but not OP buff. Suggested: `{ type: 'stat_boost', stat: 'STR', amount: 3 }`
- `mod_double_draft` — suggested: `{ type: 'add_item_to_pool', archetype: 'universal', itemId: 'item_draft_token' }` plus implement `item_draft_token` as a one-time-use item that grants `+1 node draft this round`

Match magnitudes to the existing modifier set — don't introduce a new power tier.

## Subtask 5c — 5 new modifiers to reach ~20 total

Distribute across effect types, biased toward `add_node_to_pool` and `add_item_to_pool` (highest replay value). Suggestions:

| ID | Archetype | Effect | Trigger |
|---|---|---|---|
| `mod_asteroid_cache` | Sporgk | `add_item_to_pool` (new T2 item: +20g start gold) | Win as Sporgk |
| `mod_crystalline_wisdom` | Elf | `add_node_to_pool` (low-cost INT node) | Reach turn 15 as Elf |
| `mod_void_resonance` | Vampire | `add_node_to_pool` (INT-scaling ability) | Reach turn 15 as Vampire |
| `mod_ancient_trinket` | universal | `stat_boost` (LCK +1 from start) | Complete a `no_gear_run` |
| `mod_veterans_stipend` | universal | `start_gold` (+20g) | `stat_threshold` STR 30+ |

These are concept names — feel free to refine flavor while preserving effect shapes.

## Acceptance criteria

- ≥20 total modifiers in `modifiers.ts`
- 2 previously-stubbed evaluators return correct boolean
- 2 previously-zero `statBonus` values produce real effect when applied
- Each new modifier covered by a unit spec verifying its effect application path
- Existing tests still pass
- Add `tests/game/save/unlockConditions.test.ts` for the 2 evaluators specifically

## Task 6 — Verify, Test, Report

## Run the full suite

```bash
pnpm typecheck
pnpm lint
pnpm test
```

All must be green.

## Manual smoke pass

After Tasks 1-5, do the following manual sequence to verify integration. Document findings — do not auto-tune balance.

### Smoke 1 — Codex Loop

1. Start a fresh run as Sporgk
2. Force-fail or play through to trigger a codex unlock condition
3. Check the post-run screen: codex unlock card visible
4. Click Restart Run
5. Verify the just-unlocked modifier's effect is applied (e.g., +stat, +gold, new node available)

### Smoke 2 — Font Scaling

1. Open Settings
2. Toggle font scale through 100% → 125% → 150% → 100%
3. Verify text resizes immediately each time
4. Reload the page
5. Verify the chosen scale persists

### Smoke 3 — Share String Roundtrip

1. Complete a run (any result)
2. Copy the share string from the Post-Run screen
3. Click Restart Run, return to Archetype Select
4. Paste the share string into the new paste UI
5. Click Replay
6. Verify the replay walks the exact same turns with byte-identical results
7. Verify all stingers fire as in the original run

### Smoke 4 — Boss Hover Cards

1. Start a fresh run
2. Hover over each boss turn tile (5, 10, 15, 20) in the radar
3. Verify each shows a rich card with name, damage type, resistances, intercepted comms
4. Tab through tiles with keyboard
5. Verify focus opens the card; escape closes

## Reporting format

After all tasks done, deliver a single report containing:

```
## Phase 2A Implementation Report

### Task 1 — Codex Modifier Application
- Files touched: ...
- New files: ...
- Tests added: <count> in <paths>
- Vitest result: <pass/fail counts>
- Spec drift noticed: <none / list>
- Followup work surfaced: <none / list>

### Task 2 — Font Scaling DOM
[same shape]

### Task 3 — Share String Import
[same shape]

### Task 4 — Boss Hover Cards
[same shape]

### Task 5 — Codex Content Fill
[same shape]

### Smoke Pass
- Smoke 1: pass / fail with notes
- Smoke 2: pass / fail with notes
- Smoke 3: pass / fail with notes
- Smoke 4: pass / fail with notes

### Final Status
- pnpm typecheck: clean / errors
- pnpm lint: clean / errors
- pnpm test: <pass>/<total> passing

### Open Questions for Human Review
<any decisions deferred or assumptions made>
```

## Do not commit

The founder will review your changes and commit themselves. Stage your work; do not run `git commit` or `git push`.

## Out of Scope (do not do)

Explicitly excluded from this batch — if you find yourself drawn to these, stop:

- ❌ Changing the threshold curve in `src/game/economy/threshold.ts`. **base = 20 is correct.** The original GDD spec of 50 was rebalanced from playtest. Any logic suggesting 50 is stale.
- ❌ Adding HP, regen, partial-fail, or any survivability mechanic. Binary PASS/FAIL is locked.
- ❌ Adding audio file assets to `/public/audio/`. The founder is licensing CC0 chiptune separately.
- ❌ Adding new archetypes beyond Sporgk / Elf / Vampire. That's the post-launch roadmap.
- ❌ Adding new structural-depth nodes to existing pools. Content fill there is a separate batch.
- ❌ Refactoring existing files unless the task strictly requires it.
- ❌ Adding new dependencies. The stack is locked.
- ❌ Changing the share string format. Roundtrip with existing exports must hold.
- ❌ Auto-tuning balance after the codex changes land. Note imbalances in the report; let the founder decide adjustments.
- ❌ Committing or pushing to git. Stage changes; founder reviews and commits.

If you encounter ambiguity that would require violating one of these rules to resolve, **stop and ask** in your report.
