# Project Antigravity

A 100% UI-based, high-fantasy space roguelike where the talent tree IS the game.

There is no combat to simulate — only a build to assemble and a brutal threshold check between you and the next round of drafting. PASS or FAIL. No HP. No partial victory. The brutality is the genre fit.

## What it is

- **20 turns per run, ~20-30 min wall-clock**
- **3 archetypes** at v1: Sporgk (Space Orc Pug, STR+STA), Elf (Space Pug Elf, AGI+LCK), Vampire (Space Pug Vampire, INT+STA)
- **Constellation skill tree** drawn each run from an ~80-node pool per archetype
- **20% structural-depth nodes** — conditionals, mutex pairs, anti-synergies, threshold gates, hybrid bridges
- **Codex meta-progression** — modifiers unlock across runs and feed back into future RNG pools
- **Deterministic by seed** — share strings let other players replay your run byte-for-byte

## Difficulty

Four built-in presets plus a Custom panel that exposes every weight knob:

| Preset | Vibe |
|---|---|
| **Easy** | Gentle curve, generous economy. For learning the system. |
| **Normal** | The designed experience. |
| **Hard** | Tighter curve, scarce economy. |
| **Nightmare** | Precision-only. Punishing item/node power, sharp boss spikes. |
| **Custom** | Tweak every multiplier yourself per run. |

The weights system is data-driven — see `src/data/balance-presets.ts`. Players can fine-tune their own presets without touching code.

## Stack

- TypeScript (strict mode)
- React 18 + Vite
- Tailwind CSS v4
- Zustand (state) + Zod (schema validation)
- `seedrandom` for deterministic RNG
- Howler.js for audio
- Vitest for unit tests

## Getting started  

```bash
npm install
npm run dev          # local dev server with HMR
npm run build        # production build
npm test             # run the full Vitest suite
npm run test:watch   # tests in watch mode
npm run typecheck    # tsc --noEmit (no build artifacts)
npm run lint         # eslint
```

## Project structure

```
/src
  /types           Types and enums
  /game            Pure game logic (no React, no Math.random())
    /balance        Threshold curve + weights application
    /constellation  Graph generation, node purchasing
    /resolve        Damage calc, encounters, abilities, forecast
    /economy        Store, costs, payouts
    /save           Share string encoding, codex, persistence
    /rng            Seeded RNG factory
  /data            Static content (nodes, items, modifiers, presets)
  /components      React components
  /hooks           Custom hooks
  /sound           Audio manifest + Howler wrapper
  store.ts         Zustand store
  App.tsx
  main.tsx
/tests             Vitest specs mirroring /src/game
/docs              Modder and design references
  balance-guidelines.md   PP system, slot identity, anti-patterns
AI.md              Short-form rules for AI agents working on the codebase
GDD.md             Design intent
architecture.md    Full technical spec
```

## Adding content (mods, items, nodes)

Read [`docs/balance-guidelines.md`](docs/balance-guidelines.md) first. It covers:
- The Power Points (PP) framework — every effect has a PP cost, every source has a PP budget
- Slot identity rules for equipment items
- The four difficulty presets and how weights scale your additions
- Anti-patterns to avoid (`+1 to all stats`, off-slot dominance, hidden randomness, etc.)
- The full "process for adding an item / node / modifier" checklist

## Contributing

If you're a code agent (DeepSeek, Claude, etc.) picking up work on this repo, read [`AI.md`](AI.md) before doing anything. It's terse and unambiguous on the hard rules: no HP, pure game logic, deterministic RNG, weights-based threshold.

Tests must stay green:

```bash
npm test
```

Determinism contract is non-negotiable. Same seed + same draft + same balance preset = byte-identical run. If a change breaks that, it's a bug.

## Status

Currently in pre-launch alpha. Phase 2A (weights system, difficulty presets, codex meta-progression, share-string replay) is complete. Phase 2B in progress (per-archetype visual identity, mobile-responsive UX). Phase 2C is launch infrastructure (Steam page, trailer, demo deploy, audio).

## License

Copyright © 2026. All Rights Reserved.

This source code, art assets, audio, and accompanying files ("the Software") are the proprietary property of the copyright holder. No license, express or implied, is granted to use, copy, modify, distribute, sublicense, or sell the Software or any portion thereof without prior written permission from the copyright holder.

The Software is provided "AS IS" without warranty of any kind.
