# AI Agent Instructions — Project Antigravity

## Project Summary

A 100% UI-based high-fantasy space roguelike. TS + React 18 + Vite + Tailwind + Zustand. The entire game is a talent tree (constellation graph) with binary PASS/FAIL stat-gate checks. No HP, no combat simulation — just build-craft and threshold resolution.

## Critical Rules (READ FIRST)

1. **`C:\Github\ProjectPugxcel\GDD.md`** is the design authority. Read it before working.
2. **`C:\Github\ProjectPugxcel\architecture.md`** is the technical authority. Contains all type defs, algorithms, formulas, build order, and implementation rules.
3. **`docs/balance-guidelines.md`** is the canonical balance reference. Any time you add or modify items / nodes / modifiers, read it first. PP budgets and slot identity rules live there.
4. **NO HP.** The threshold check is binary PASS/FAIL. Do not introduce health, damage-taken, regen, or partial survival under any circumstance.
5. **All game logic is pure.** Files in `/src/game/` have zero React imports, zero side effects, zero `Math.random()`. State in, state out.
6. **Determinism is non-negotiable.** Same seed + same draft + same balance preset = byte-identical run. All randomness through one injected seeded RNG instance.
7. **Every file < 200 lines.** Split aggressively.
8. **Every game-logic function has a Vitest spec.**
9. **State mutations ONLY via Zustand actions.** Components dispatch, never mutate.

## Stack

| Layer | Package |
|-------|---------|
| Language | TypeScript (strict mode) |
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| RNG | `seedrandom` |
| Validation | Zod |
| Audio | Howler.js |
| Tests | Vitest |

## Key Design Pillars

- **The talent tree IS the game.** Build-craft is the entire dopamine loop.
- **Binary stat-gate.** Either your build clears the threshold or the run ends. No partial victory.
- **Brutal.** Souls-flavored roguelike audience expects precision.
- **Tension lives in DRAFT and FORECAST phases — never in resolution.** Resolution is a clean stinger.
- **Determinism.** This unlocks the community layer (replay, share, daily seed) for free.

## File Structure

```
/src
  /types           All TypeScript types and enums
  /game            Pure game logic (NO React imports, NO Math.random())
    /balance        Threshold curve computation, weights application
    /constellation  Graph generation, node purchasing
    /resolve        Damage calc, encounters, abilities, forecast
    /economy        Store, costs, payouts, threshold (delegates to /balance)
    /save           Share string encoding, codex, localStorage
    /rng            Seeded RNG factory (seedrandom wrapper)
  /data            Static content (node defs, item defs, abilities, encounters, balance-presets)
  /components      React components (PascalCase.tsx)
  /hooks           Custom React hooks
  /sound           Audio manifest + Howler.js wrapper
  store.ts         Zustand store
  App.tsx
  main.tsx
/tests             Vitest specs, mirroring /src/game structure
/docs              Modder and design reference docs
```

## The 5 Stats

| Stat | Role | Key Mechanic |
|------|------|-------------|
| STR | Base damage per attack | Pierces armor |
| AGI | Attack count: `floor(1 + AGI/5)` | Countered by armor (per-hit reduction) |
| STA | Resource pool for abilities | Drained by encounters, gates ability spam |
| INT | Bypasses armor AND evasion | Powers ability scaling, countered by INT resist |
| LCK | Crit chance (2%/point, cap 50%), store discount (1.5%/point) | Snowball stat — weak early, dominant late |

## Damage Formula (locked)

```
base          = STR × weaponStrMult + Σ(flatBonuses)
attacks       = ⌊1 + AGI/5⌋
critChance    = min(LCK × 0.02, 0.5)

perAttack     = base × (crit ? 2 : 1) × armorMod × (evaded ? 0 : 1)
rawTotal      = Σ(perAttack)
abilityTotal  = Σ(fireAbilities(state, availableSTA))
total         = rawTotal + abilityTotal

armorMod      = max(0.1, 1 − (armor / (armor + 100)))
```

## Threshold Curve (weights-based, NOT a single hardcoded formula)

The threshold is **computed from the active difficulty preset's weights**, not from a fixed formula. The legacy `floor(50 × 1.18^(turn − 1))` formula is no longer used — it was replaced after playtest because base 50 made turn 1 unwinnable against realistic starting builds.

The current system supports three curve types selected by preset:

| Curve type | Formula |
|---|---|
| `linear` | `base + primarySlope × (turn − 1)` |
| `breakpoint` | `base + primarySlope × min(turn−1, breakpointTurn) + secondarySlope × max(0, turn−1 − breakpointTurn)` |
| `quadratic` | `base + primarySlope × (turn − 1) + quadraticCoeff × (turn − 1)²` |

Boss multipliers apply on turns 5 / 10 / 15 / 20:
- `boss turns (not final)`: `value × bossMultiplier`
- `final boss (turn 20)`: `value × finalBossMultiplier`

The four named presets and their concrete numbers live in `src/data/balance-presets.ts`. The Normal preset is the design baseline:

```
normal: {
  curveType: 'breakpoint',
  curve: { base: 10, primarySlope: 6, secondarySlope: 9, breakpointTurn: 9 },
  bossMultiplier: 1.5,
  finalBossMultiplier: 1.8,
  ...
}
```

If you need to change difficulty pacing, change the preset numbers in `balance-presets.ts`. Do NOT change `computeThreshold` itself unless the curve types are being extended.

See `docs/balance-guidelines.md` for the full PP budget framework that interacts with these weights.

## Difficulty Weights System

Beyond the threshold curve, weights also scale player power and economy:

| Weight | What it scales | Where it applies |
|---|---|---|
| `itemPowerMultiplier` | Item PP at runtime | `effectivePP(item) = item.basePP × multiplier` |
| `nodePowerMultiplier` | Node PP at runtime | `effectivePP(node) = node.basePP × multiplier` |
| `startingGoldMultiplier` | Run start gold | Applied in `startRun()` |
| `perTurnPayoutMultiplier` | Gold per turn | Applied in `calculatePayout()` |
| `luckEfficacyMultiplier` | Crit + discount efficacy | Multiplies the LCK→crit and LCK→discount conversions |
| `poolSizeMultiplier` | RNG pool variance | Smaller pools → fewer options per draft |
| `structuralNodeAvailability` | Structural-depth node frequency | 1.0 = ~20% of pool, 0.5 = ~10% |

Weights are part of the seed envelope — the share string encodes the preset (or a custom-weights hash) so replays reproduce exactly. Format:

```
ANTIGRAV/{ARCH}-{SEED}/{PRESET_CODE}/{DRAFT_SEQUENCE}
```

Where `PRESET_CODE` is one of `EZ` / `NM` / `HD` / `NT` / `CS-XXXX` (custom hash).

## Run Structure

- 20 turns, ~20-30 min wall-clock
- Boss turns at 5, 10, 15, 20 (telegraphed 5 turns ahead via Forecast)
- 1 node purchase per turn max (use it or lose it)
- Any number of item purchases per turn
- Permadeath; fail on any turn = run over
- Turn cycle: Forecast → Payout → Draft → Execute → Stinger → Continue/Terminate

## 3 Archetypes (V1)

1. **Sporgk (Space Orc Pug)** — STR + STA. Brute force, cheap linear nodes, armor pen.
2. **Elf (Space Pug Elf)** — AGI + LCK. Hoard early, snowball late via LCK discount.
3. **Vampire (Space Pug Vampire)** — INT + STA. Synergy puzzle, bypass defenses.

## Build Order Priority

When working independently, follow the build order in `architecture.md`:
1. **Foundation:** Scaffold, types, RNG, Zod schemas
2. **Data:** Node pools, item pools, abilities, encounter templates, **balance presets**
3. **Core Logic:** Constellation gen, store gen, encounter gen, resolve, save, **weights/threshold**
4. **State:** Zustand store + persistence (with `balanceWeights` in MetaState)
5. **UI:** Components (MainHUD, ConstellationViewport, StoreModal, ExecuteTerminal, PostRunScreen, **DifficultySelect**, **CustomDifficultyPanel**)
6. **Audio:** Howler setup + stinger integration
7. **Polish:** Accessibility, daily seed, build saver, per-archetype theming

## Communication

- This document is read by AI agents. Be unambiguous.
- When implementing, consult `architecture.md` for the full spec.
- When in doubt about gameplay feel, consult `GDD.md`.
- When adding or modifying balance content (items / nodes / modifiers), consult `docs/balance-guidelines.md`.
- If a design decision seems to require HP/health mechanics, stop and re-read rule #4.
- If a balance change seems to require touching `computeThreshold` directly, stop and check whether changing a preset would solve it instead.
