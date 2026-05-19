# Project Antigravity

A 100% UI-based, high-fantasy space roguelike where the talent tree IS the game.

There is no combat to simulate — only a build to assemble and a brutal threshold check between you and the next round of drafting. PASS or FAIL. No HP. No partial victory. The brutality is the genre fit.

## What it is

- **Runtime varies with difficulty** — higher difficulties demand more nodes, more decisions, and tighter resource management."
- **3 archetypes**: Sporgk (Space Orc Pug, STR+STA), Space Pug Elf (AGI+LCK), Space Pug Vampire (INT+STA)
- **Procedural constellation skill tree** — each run generates a unique ring-based radial galaxy map from seed. Node count scales with difficulty from ~20 (Easy) to ~100+ (Nightmare).
- **Structural depth nodes** — conditionals, mutex pairs, anti-synergies, threshold gates, hybrid bridges (20-28% of tree depending on ring)
- **Codex meta-progression** — modifiers unlock across runs and feed back into future RNG pools
- **Deterministic by seed** — same seed + archetype + weights = byte-identical run. Share strings let others replay your run.

## Galaxy Map

The constellation is a ring-based radial skill tree centered at the viewport. Key mechanics:

| Feature | Detail |
|---------|--------|
| **Ring structure** | Rings 0-N spaced by RADIUS_STEP (130px). Ring radius scales with node density. Node count follows a bell curve peaking at middle rings. |
| **Layout physics** | 5-pass repulsion (MIN_DIST=75px) + 2-pass spring forces (ideal edge length) + 1.25x global spread factor |
| **Edge routing** | Forward edges (1-3 per node to next ring; anchors always get max). Lateral edges (30% chance same-ring). All nodes guaranteed reachable via BFS reconnect. |
| **Distance tiers** | BFS from drafted nodes → 5 opacity tiers: purchased (1.0), 1-2 hops (0.85 amber), 3-4 hops (0.55), 5-7 hops (0.32), 8+ hops (0.18) |
| **Edge tint** | Close edges glow amber (`var(--accent)`), far edges stay cool grey — the player "illuminates" the web around them |
| **Anchor halos** | ★ anchor nodes pulse with amber SVG halo (3.2s cycle) visible from across the map |
| **Purchasable glow** | Reachable unpurchased nodes + edges get subtle green glow; purchased nodes get bright accent glow with `boxShadow` |
| **Breathing animation** | Reachable unpurchased nodes (1-2 hops) pulse `boxShadow` + `border-color` at 3.6s cycle |

## Visual Identity

| Feature | Detail |
|---------|--------|
| **Archetype theming** | Each archetype defines `theme` in its flavor (accent, accentSoft, accentGlow). `useArchetypeTheme` hook sets CSS vars on `:root`. All Tailwind token classes auto-reflect the current archetype. |
| **Background layers** | 4-layer CSS `background-image`: vignette, amber nebula, fine dot-grid (24px), coarse dot-grid (96px) |
| **CRT scanlines** | `::before` pseudo-element: 2px repeating black lines at 70% opacity, multiply blend mode |
| **Amber sweep** | `::after` pseudo-element: slow amber band sliding top→bottom every 7s — the "radar dish" feel |
| **HUD chrome** | Corner bracket SVGs, 12 axis tick marks along top edge, 3 perimeter status readouts (`GRID`, `NAV LOCK`, `SYS NOMINAL`), blinking terminal caret |
| **Drift particles** | 40 sparse amber dots drifting diagonally at varied speeds — "space is alive" without being distracting |
| **Bungee font** | Display text (titles, archetype names, phase buttons) uses Bungee from Google Fonts |
| **Stat highlighting** | Primary stat gets solid accent glow + ★ suffix; secondary gets muted glow + ☆ suffix. All colors from archetype theme. |

## Turn Structure

Simplified 3-beat flow per turn (PAYOUT was dead air — now merged):

```
BRIEFING (FORECAST)  →  gold auto-deposits, threat radar visible
  ↓  [Begin Drafting]
DRAFT                 →  purchase 1 node + items from store
  ↓  [Execute]
EXECUTE → STINGER     →  damage resolves against encounter, PASS/FAIL screen
```

Keyboard shortcuts: Enter or Space advances through phases. `[Enter / Space]` hints glow in the archetype accent color.

## Combat

See [`docs/game-mechanics.md`](docs/game-mechanics.md) for the full combat reference. Quick summary:

- **Damage**: `STR × weaponMult + flatBonuses` per attack. Attacks per turn = `1 + AGI/5`.
- **INT bypass**: Vampire's INT bypasses armor, evasion, and INT resist entirely.
- **Stamina abilities**: Unlocked via constellation nodes. Consume STA to fire. `maxStamina = 10 + STA/2`.
- **Crits**: LCK × 2% chance, max 50%.
- **Thresholds**: Curve-based (linear/breakpoint/quadratic). Boss multiplier every 5 turns, final boss on turn 20.
- **Stinger**: PASS/FAIL/BARELY variants with per-archetype flavor text.

## Difficulty

Four built-in presets plus a Custom panel that exposes every weight knob:

| Preset | Rings | Density | Curve | Vibe |
|--------|-------|---------|-------|------|
| **Easy** | 6 | 0.6 | linear | Gentle ramp, generous economy |
| **Normal** | 7 | 1.0 | breakpoint | The designed experience |
| **Hard** | 8 | 1.4 | breakpoint | Tighter curve, scarce economy |
| **Nightmare** | 9 | 1.8 | breakpoint | Precision-only, dense galaxy |

Custom difficulty exposes 14 sliders including `nodeDensity` (0.2–5.0), `ringCount` (4–10), constellation layout (radial/left-to-right), and all economy/combat multipliers.

## Stack

- TypeScript (strict mode)
- React 18 + Vite
- Tailwind CSS v4 (CSS variable-driven theming)
- Zustand (state) + Zod (schema validation)
- `seedrandom` for deterministic RNG
- Howler.js for audio
- Bungee + JetBrains Mono + Orbitron + Inter (Google Fonts)
- Vitest (280 tests)

## Getting started

```bash
npm install
npm run dev          # local dev server with HMR
npm run build        # production build
npm test             # run the full Vitest suite (280 tests)
npm run test:watch   # tests in watch mode
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
```

## Project structure

```
/src
  /types              Types, enums, schemas
  /game               Pure game logic (no React, no Math.random())
    /balance           Threshold curve + weights application
    /constellation     Procedural node generation, structural types, radial layout
      /layout          Radial + left-to-right layout engines
    /resolve           Damage calc, encounters, abilities
    /economy           Store, costs, payouts, threshold
    /save              Share string encoding, codex, persistence
    /rng               Seeded RNG factory (seedrandom wrapper)
  /data               Static content (nodes, items, modifiers, presets, archetypes)
    /archetypes        Per-archetype JSON (stats, flavor, rings, theme, structural templates)
  /components         React components
  /hooks              Custom hooks (useArchetypeTheme, usePhase, useKeyboardNav, etc.)
  /styles             Design tokens (tokens.css)
  /sound              Audio manifest + Howler wrapper
  store.ts            Zustand store
  App.tsx
  main.tsx
/tests                Vitest specs mirroring /src/game (280 tests)
/docs                 Modder and design references
  game-mechanics.md    Full combat, constellation, economy, balance reference
  balance-guidelines.md PP system, slot identity, anti-patterns
AI.md                 Short-form rules for AI agents working on the codebase
```

## Adding content

Read [`docs/balance-guidelines.md`](docs/balance-guidelines.md) for the PP framework and design rules.

To add a new archetype:
1. Create `src/data/archetypes/{id}.json` with stats, flavor word lists, rings, structural templates, and `theme` colors
2. Add a `loadArchetypeFlavor()` entry in `src/data/nodes/index.ts`
3. The archetype automatically gets: procedural node generation, themed constellation visuals, and CSS var theming — no CSS file changes needed

## Determinism contract

Same seed + same archetype + same balance weights + same draft sequence = byte-identical run. All RNG flows through `createRNG(seed)` — no `Math.random()`. Every phase gets a distinct seed slice (`_t{turn}_f` for forecast, `_t{turn}_s` for store, `_t{turn}_ex` for execute). If a change breaks determinism, it's a bug.

## Status

Phase 2B complete — procedural constellation, radial layout with physics, distance-tiered map, campy sci-fi HUD chrome, archetype theming. Heading toward launch infrastructure (Steam page, trailer, demo deploy).

## License

Copyright © 2026. All Rights Reserved.
