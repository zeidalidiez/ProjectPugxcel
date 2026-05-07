# Project Antigravity — Game Design Document v3.0

Hand-off-ready GDD. Locked design pillar: the talent tree IS the game; binary stat-gate, no HP. Web stack (TS+React+Vite). 80-node archetype pools with 20% structural depth. Chiptune audio with stinger spec. Replay/share as v1.

## 1. Vision & Locked Design Pillars

A 100% UI-based, high-fantasy space roguelike. The entire game is the talent tree. There is no combat to simulate, only a build to assemble — and a brutal threshold check between you and the next round of drafting.

**Theme:** High Fantasy + Space + Pugs. Spell-ships, void-nebulas, astral galleons, asteroid greataxes. Tonally, lean weird — the pugs are diegetic, not a punchline.

**Aesthetic:** Minimalist astral-terminal dark mode. Deep charcoal backgrounds, stark mono typography, generous negative space. Audio stingers and high-contrast text modals do the dramatic work that animation usually does in other games.

### Locked Pillars (do not soften)

1. **The talent tree IS the game.** Build-craft is the entire dopamine loop.
2. **The threshold check is a binary stat-gate.** Either your build cleared the number or the run ends.
3. **No HP. No grading. No partial victory.** A 12-damage shortfall ends the run as cleanly as a 1200-damage shortfall.
4. **Brutality is the genre fit.** Souls-flavored roguelike audience expects and rewards precision. Don't file the panther's teeth.
5. **Tension lives in the DRAFT and FORECAST phases — never in resolution.** Resolution is a clean stinger.
6. **Determinism is non-negotiable.** Same seed + same draft = byte-identical run. This unlocks the entire community layer (replay, share, daily seed) for free.

## 2. The Run Loop

A run is exactly **20 turns**, ~20-30 minutes wall-clock. Every 5th turn (5, 10, 15, 20) is a Boss Scenario telegraphed five turns in advance. Permadeath is mandatory; the only persistence between runs is the Codex.

### Per-turn structure

1. **The Forecast** — Radar shows the current turn's threshold, the stat-types required, and hint-tier flags for the next four turns. Boss turns get richer hover detail.
2. **The Payout** — Gold lump sum, scaled by run progress and Luck.
3. **The Draft** — Player evaluates the store, evaluates the constellation, decides: 1 node max, any number of items, or hoard for later. The choice is the puzzle.
4. **The Execute** — Player commits. Resolution runs instantly behind the scenes.
5. **The Stinger** — Typewriter combat log prints the math, then PASS or FAIL with its bound stinger. (Audio spec in §8.)
6. **Continue or Terminate** — PASS advances to the next turn; FAIL ends the run, bumps codex meta-progression, and surfaces the share string.

Failure on any turn ends the run immediately. There is no retry, no revival, no checkpoint within a run.

## 3. The Five Stats & Resolution Math

Stats are asymmetric on purpose. Each stat counters specific threat types, so build identity matters as much as raw allocation.

| Stat | Function | Counters | Mitigated By |
|------|----------|----------|--------------|
| **STR** | Flat base damage per attack | Armor (pierces) | Evasion |
| **AGI** | Attack count multiplier — `floor(1 + AGI/5)` | Unarmored | Armor (per-hit reduction) |
| **STA** | Resource for ability fires; abilities re-fire while STA permits | Specific resists; flexibility | Stamina-cost gating |
| **INT** | Bypasses armor AND evasion entirely; powers synergies and conditional nukes | Both armor and evasion | INT-specific resistances |
| **LCK** | Crit chance (2% per LCK, cap 50%); store discount (1.5% per LCK); bonus payouts | Late-game economy snowball | Slow start |

### Damage formula (locked)

```
base          = STR * weapon.strMult + sum(flatBonuses)
attacks       = floor(1 + AGI / 5)
crit_chance   = min(LCK * 0.02, 0.5)
per_attack    = base * (crit ? 2 : 1) * armor_mod
raw_total     = per_attack * attacks
ability_total = sum of all abilities firing while STA permits, deterministic order
total         = raw_total + ability_total
```

### Threshold curve (rebalanced from playtest, supersedes earlier spec)

```
threshold(turn) = floor(20 * 1.18 ^ (turn - 1))   // ~20 turn 1, ~472 turn 20
if turn % 5 == 0:  threshold *= 1.5               // boss multiplier
```

| Turn | Threshold | Boss multiplier? |
|---|---|---|
| 1 | 20 | — |
| 5 | 39 → **58** | yes |
| 10 | 90 → **134** | yes |
| 15 | 206 → **308** | yes |
| 20 | 472 → **708** | yes (final) |

**Why base 20, not 50:** The original GDD spec (`base 50`) made turn 1 unwinnable against realistic starting builds (~10 damage). Playtesting confirmed players couldn't build a meaningful character before being shoved into a fail state. Base 20 lets the early turns serve build-craft, with the curve still creating brutal late-game pressure. The water always rises; the entry point is just survivable.

### Resolution rules (locked, no exceptions)

- `result === 'pass'` iff `damageDealt >= threshold`. Tie counts as PASS.
- `result === 'fail'` ends the run immediately. `runEnded = true`.
- **No HP. No partial fail. No comeback turn.** The deficit is reported for flavor and audio variant selection (§8) only — it has zero mechanical consequence beyond "you lost."

## 4. Archetypes & Post-Launch Roadmap

Player picks one archetype at run start. Choice restricts the constellation pool and store pool to keep the puzzles solvable within that class's identity.

## V1 Roster (3 archetypes)

### A. Sporgk (Space Orc Pug) — The Asteroid Barbarian
- **Vibe:** Brutal raiders riding hollowed asteroids propelled by warp-fire, wielding rocket-greataxes
- **Core focus:** STR + STA
- **Playstyle:** Brute force. Sporgk nodes are cheap and linear. Single-target damage thresholds, raw bulk, armor pen.

### B. Space Pug Elf — The Crystalline Star-Farer
- **Vibe:** Graceful ancients on crystal galleons, plasma-light bows
- **Core focus:** AGI + LCK
- **Playstyle:** Weak-then-exponential. Hoard early gold, snowball late via LCK store discount.

### C. Space Pug Vampire — The Void Lord
- **Vibe:** Gothic undead in cathedral-ships, siphoning life force across vacuum
- **Core focus:** INT + STA
- **Playstyle:** Synergy puzzle. Bypass defenses; chain effects; meticulous drafting.

## Post-Launch Roadmap (announced AT launch)

One new archetype every 2-3 months for the first year. Announcing the roadmap publicly at launch converts "only 3 classes" reviews into "exciting expansion plans." Concept slate to develop in order:

- **Drone Engineer** — LCK + INT — economic-summoner hybrid
- **Comet Monk** — STA + STR — tempo discipline
- **Singularity Witch** — INT + LCK — high-variance gambler
- **Plague Diplomat** — INT + AGI — debuff stacker
- **Asteroid Druid** — STA + AGI — board-state shapeshifter

Each post-launch archetype ships with its own ~80-node pool (see §5) and ~40 archetype-flavored items.

## 5. The Constellation Web

Per-run constellation is randomized from the archetype's source pool. Determinism is by seed.

## Architecture: Pool vs Map

| Layer | Description |
|---|---|
| **Pool** | The source bag. **~80 unique node effects per archetype.** Grows over time with patches. |
| **Map** | A specific run's constellation: 4 fixed Anchor nodes + ~50 Minor nodes drawn from the pool, laid out by seed. |
| **Anchor nodes** | 3-4 fixed per archetype. Fixed position on the map. Build-defining. Provide reliable load-bearing goals. |
| **Minor nodes** | Drawn each run from the pool. Positions and adjacency randomized. |
| **Start node** | One free purchase at run start, fixed position. |

A run sees ~50/80 of its pool. After several runs the player still surfaces nodes they haven't tried. After 20+ runs the *combinations* still surprise.

## Pool Composition (per archetype)

- **~64 standard effects (80%)** — flat stat boosts, simple modifiers, ability unlocks. The connective tissue.
- **~16 structural-depth effects (20%)** — the deep mechanics. **This is the spec where the game's depth lives.** Mix:

### Structural-depth node types

| Type | Description | Example |
|---|---|---|
| **Conditional** | Fires only when build state matches | `If 0 gear equipped: +50% INT damage` |
| **Mutex pair** | Two adjacent nodes; pick one, the other locks for the run | `Berserker Stance` ↔ `Ironhide Stance` |
| **Anti-synergy** | Nukes part of build to specialize the rest | `Disable all STR bonuses; double AGI scaling` |
| **Threshold** | Activates if a run-state condition is met | `+200 INT if you reach turn 10 with <100g spent on gear` |
| **Hybrid bridge** | Rare; pulls from another archetype's pool when adjacent to specific anchors | `Vampire near Sporgk anchor: gain Berserk effect` |

## The 1-Node-Per-Round Constraint

Strictly capped. 20 rounds = 20 nodes max. Non-negotiable. Hoarding is impossible by mechanic.

Rare late-game effects can grant `+1 node draft this round` as build-defining payoffs (e.g., a specific Anchor reward, a T4 trinket). These are *expressions* of the constraint, not relief valves.

## 6. Economy, Store, Items

**Gold is the only currency.** Used for both nodes AND items. The constant tension between "node now, gear now, or hoard for the boss in 3 turns" is the central per-turn puzzle.

## Store

- 4 items per turn, one per Tier slot (T1 / T2 / T3 / T4)
- T4 items only appear from turn 8 onward
- Cost formula: `displayed = base * (1 - LCK * 0.015)`, floored at `base * 0.5`
- Some gear requires stat thresholds to equip (e.g., a T4 weapon requires 20 STR). Forces parallel investment.
- Some nodes activate only when specific gear is equipped — keeps gear relevant in a tree-centric world.

## V1 Item Counts

- **40 items minimum** in the universal pool, weighted: 12 T1, 14 T2, 10 T3, 4 T4
- Plus archetype-specific items (~10-15 per archetype) drawn into the store roll for that archetype only
- Mix:
  - **Weapons** — modify the damage formula (strMult, flat bonuses)
  - **Armor** — resistances, condition modifiers, occasional gear-set passives
  - **Trinkets** — passive effects, often condition-gated
  - **Abilities** — added to the STA-fire pool; cost STA per fire; re-fire as STA permits

## Optional Mechanics (ship or cut as time permits)

- **Reroll** — rerolls the store; cost escalates per turn. Standard roguelike texture.
- **Consumables** — single-turn buffs; let players stockpile ahead of telegraphed boss turns.

## 7. Resolution & The Forecast UX

Resolution is *not combat*. It's a single math check, displayed as a typewriter sequence for emotional pacing.

## What the player sees during Execute

```
> ENGAGING: ASTRAL GALLEON
> CALCULATING ZOOMIES... 8 ATTACKS INITIATED.
> CRIT: +245
> ABILITIES: VOID SIPHON x2
> TOTAL DAMAGE: 412 / REQUIRED: 350
> RESULT: PASS
> the void was unimpressed.
```

The final **PASS** or **FAIL** is the largest typographic element on the screen. Nothing competes with it visually. Each character of the log triggers a typewriter tick (§8). Pacing: ~30-50ms per character; the log is the only "real-time" element of the game.

## The Forecast (where the drama lives)

The Forecast is the game's hero UX feature. The threshold check is binary, so the *anticipation* is where tension grows. Build the Forecast as the dramatic centerpiece, not a ticker:

- **Radar Banner** — persistent across all turns. Current turn always center, 4 future turns visible.
- **Threshold preview** — exact number for current turn; hint-tier text for upcoming (e.g., `> WARNING: TURN 15 — HEAVY KINETIC SHIELDING`).
- **Threat Heatmap** — small overlay showing which stat-types matter most across the upcoming 5 turns at a glance. Lets players plan multiple turns ahead.
- **Boss hover cards** (turns 5/10/15/20) — reveal richer detail on hover: enemy name, resistance profile, intercepted comms, lore flavor.
- **Difficulty toggle: Uncertainty Mode** — future turns partially obscured. For players who want even more brutal precision.

## 8. Audio Spec

The entire emotional payload of the game flows through audio. The threshold check is binary — the audio is what makes that binary land. Audio is **mission-critical, not nice-to-have.**

## Aesthetic Pillar

**Minimalist chiptune terminal.** No voices. No orchestral. No real instruments. 8-bit-adjacent palette: square, triangle, noise, optional saw. The audio language is a single-chip console: SFX and music share the same tonal world.

## Reference Tracks (hand to composer)

- **Faster Than Light** (Ben Prunty) — closest match. Cold, looping, terminal-feel.
- **Hyper Light Drifter** (Disasterpeace) — chiptune-adjacent ambient
- **VVVVVV** (SoulEye) — pure chiptune; punchy SFX language
- **Quadrilateral Cowboy** — minimalist terminal vibe

## Stinger Spec (locked)

A "stinger" is a short audio cue with emotional weight, separate from background music — punctuation, not soundtrack.

| Event | Sound | Duration |
|---|---|---|
| **PASS** | 3-note rising arpeggio, major key, square wave, clean resolve | ~0.6s |
| **FAIL** | Descending minor 2nd, harsh; then **0.5s of total silence** before run-summary fades up | ~1.0s incl. silence |
| **BARELY PASS** (margin <5%) | PASS arpeggio with a dissonant held note before resolution | ~0.9s |
| **BARELY FAIL** (margin <5%) | FAIL with one extra haunting note that sounds like a question | ~1.1s |
| **BOSS PASS** (turns 5/10/15/20) | PASS but a beat longer, fuller chord, triumphant tag | ~1.0s |
| **BOSS WARNING** (forecast hover) | Low pulsing 8-bit drone, klaxon-like | loop while hovered |
| **PURCHASE NODE** | Bright "powerup" chip blip — short triple-pop | ~0.2s |
| **PURCHASE GEAR** | Distinct "coin pickup" chip clink | ~0.2s |
| **HOVER** | Soft single tick, near-subliminal | <0.05s |
| **CLICK** | Sharper double tick | <0.1s |
| **TYPEWRITER** | Tiny per-character tick, slightly randomized pitch (avoid monotony) | per-character |
| **CODEX UNLOCK** | Triumphant 4-note chime, distinct from PASS | ~0.8s |

The **silence after FAIL** is the gut-punch. It is not optional. Test pacing: the silence must feel *too long* by ~150ms before the summary fades up.

## Background Music

Long-loop minimalist chiptune ambient. Cold, terminal-feel, leaves space for stingers to punch through.

- One loop for **archetype select / main menu** — slightly more melodic, sets tone
- One loop for **in-run** — more ambient, less melodic, doesn't fight the typewriter
- One loop for **post-run / codex screen** — reflective, slightly warmer

3-5 minute loops minimum. Volume should sit ~6-10dB below stingers.

## 9. Community Layer (Replay, Share, Daily Seed)

A run is fully determined by `seed + archetype + draft sequence`. That's roughly **80 bytes** of state for a complete run. Determinism is already a hard requirement — the community layer comes nearly free, and the leverage is enormous.

## Share String

Every completed run (win or loss) produces:

```
ANTIGRAV/SPRGK-7H2X-K9LM/D5G2N1S4...
```

- First segment: game name (always `ANTIGRAV`)
- Second: archetype prefix (`SPRGK`, `ELF`, `VAMP`, etc.) + 8-char seed entropy, dash-separated for readability
- Third: compact base-N encoding of draft choices (one symbol per turn)

Under 100 characters total. Pasteable in Twitter, Discord, anywhere.

## Replay

Paste a share string into another player's game → watch the same run play out byte-for-byte. The combat logs appear identically. This works because RNG, generation, and resolution are all deterministic by spec.

In-game: completed runs in your history are replayable directly.

## Shareable URL

```
antigravity.app/run/SPRGK-7H2X-K9LM/D5G2N1S4...
```

Opens directly into the run replay viewer.

## Daily Seed

- Same seed for every player every UTC day
- Leaderboard by furthest turn reached, then by margin on the failing turn
- Top builds shareable at end of day
- Anonymous handle by default; account-link optional

## Build Saver

Players can name and bookmark builds from completed runs in their codex. Browseable as inspiration for future runs. `My S-tier Vampire Build (turn 18)`.

## Why this is v1, not v2

- Determinism is required for the core loop anyway (seeded constellation, etc.)
- Encoding ~80 bytes is a weekend of work
- The viral loop (Twitter screenshots of share strings, daily seed competition) is the cheapest growth lever a roguelike has
- It also doubles as a debugging tool — "send me your share string" reproduces any bug exactly

## 10. UX, Meta-Progression, Tech Stack

## UX Architecture (4 boards)

### Board 1 — Main HUD (Drafting Terminal)
- **Left:** stats (5 rows, animate flash on change) + equipment slots (head/body/paws/artifact)
- **Center:** constellation viewport, pannable + zoomable; `Node Purchases Remaining: 1/1` overlay
- **Right:** turn-history log (chat-style, scrollable)
- **Top bar:** gold display + radar banner + threat heatmap
- **Bottom:** Execute button (full-width, only enabled when ready)

### Board 2 — Store Modal
- Toggleable pane; 4-item grid; T1-T4 visual hierarchy. T4 has distinct visual weight.

### Board 3 — Execute Terminal
- Central modal, blocks interaction with background
- Typewriter combat log
- Final PASS/FAIL is the largest type element on screen
- Stinger plays bound to result; silence honored on FAIL

### Board 4 — Post-Run Screen
- Seed, turn reached, archetype, deficit-or-margin
- Codex unlock card (if any) — visually distinct
- Copy-share-string button (one click)
- Restart Run button (zero friction)

**Visual mockups for all four boards are attached to the project thread as design intent (not pixel-perfect targets).**

## Meta-Progression / Codex

Persistent across runs:

- **~20 modifiers in v1** that get added to future-run RNG pools when unlocked
- Triggers: win conditions, turn thresholds, archetype-specific challenges ("win as Vampire without buying gear")
- Visual: distinct unlock card on Post-Run screen
- **Achievements** ("Constellations Aligned") as a cheap content layer alongside

## Accessibility (v1, non-negotiable)

- Colorblind-safe palette; verify all archetype accent colors
- Honor `prefers-reduced-motion`; disable transitions when set
- ARIA labels on the constellation, combat log, all icon-only buttons
- Font scaling: 100% / 125% / 150% toggle
- Keyboard-only nav through all flows (tab + enter + escape)

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Language | **TypeScript** (strict mode) | AI agents code TS exceptionally; type-safe game state catches balance bugs |
| Framework | **React 18 + Vite** | Largest LLM training corpus = fewer hallucinated APIs |
| Styling | **Tailwind CSS** | Aesthetic = ~50 utility classes |
| State | **Zustand** | Tiny, perfect for single global game state |
| RNG | **seedrandom** | Deterministic seeded RNG = sharing/replay works |
| Persistence | **localStorage** + **Zod** schemas | Schema versioning baked in for migrations |
| Audio | **Howler.js** | Web audio standard, sprite-sheet support |
| Tests | **Vitest** | Co-located, fast |
| Distribution | **Web first** (Vercel/Netlify); **Tauri** later for PC | One URL = entire userbase |

## File Structure

```
/src
  /components       UI (PascalCase.tsx)
  /game             Pure logic (no React imports)
    /constellation
    /economy
    /resolve
    /save
  /data             Static content (nodes, items, modifiers)
  /hooks
  /sound            Audio manifest + Howler wrapper
  /types
  App.tsx
  main.tsx
/tests              Vitest specs co-located by feature
```

## Hard Implementation Rules

1. All game logic is pure. State in, new state out. No side effects in `/game`.
2. All randomness goes through one injected, seeded RNG instance. **`Math.random()` is banned in `/game`.**
3. State mutations only via Zustand actions. Components dispatch, never mutate.
4. Every file < 200 lines. Split aggressively.
5. Every game-logic function has a Vitest spec.
6. **NO HP. The threshold check is binary PASS/FAIL.** Failing ends the run immediately. Do not introduce health, damage-taken, regen, or partial survival mechanics under any circumstance. If the design seems to require them, stop and ask.
7. **Determinism:** same seed + same draft choices = byte-identical resolution. Always. This is enforced by spec: any non-determinism is a bug.

## Open Questions (Deferred to v1.1+)

- Daily seed leaderboard backend (anonymous-only? account-linked? both?)
- Soundtrack: composer hire vs. royalty-free chiptune library
- Steam release timing post-web-launch
- Mobile UX (current hover-rich Forecast assumes mouse — likely v2)
- Modding / community node packs (likely v2+)

## Appendix: AI Agent Handoff

Implementation proceeds via OpenCode with **DeepSeek V4 Pro as the primary agent for both architecture and execution.** Per the founder's direct experience across hundreds of AI-assisted programs: DeepSeek V4 Pro performs at Opus 4.6-tier on text-only coding work, while Kimi K2.6 is too inconsistent for the multi-session execution this project requires.

- **Architecture pass:** DeepSeek V4 Pro reads this GDD + the visual mockups and produces an `architecture.md` with file tree, complete TypeScript type definitions, data flow diagrams, and a build-order task list with dependencies.
- **Execution:** Same agent works through the per-subsystem prompts in sequence: Combat Resolver → Constellation Generator → Store Roller → Save/Seed/Codex → HUD Wiring → Execute Modal → Polish.
- **Visual reference:** Four UI mockups (Main HUD, Store Modal, Execute Modal, Post-Run Screen) accompany this GDD as design intent, not pixel-perfect targets.
- **Text-only caveat:** DeepSeek V4 Pro cannot ingest the visual mockups directly. Two workable patterns: (a) supply textual companion captions describing each mockup's layout, or (b) pre-process the mockups through a vision model and feed the structured layout description to DeepSeek.
- **Master system prompt and 5 task templates** live in `/docs/agent-prompts/`. They include the locked formulas, the file-tree structure, the no-HP enforcement rule, and the determinism contract.
