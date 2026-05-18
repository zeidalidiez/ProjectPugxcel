# Project Pugxcel — Game Mechanics Reference

## 1. Constellation / Galaxy Map

The galaxy map is a ring-based radial skill tree generated procedurally from a seed. Every run with the same seed and archetype produces an identical map.

### 1.1 Ring Structure

Nodes are arranged in concentric rings centered at (800, 450). The distance between rings is `RADIUS_STEP = 130px`. Ring radius scales with node density:

```
ringRadius = ring × RADIUS_STEP × max(1, nodeDensity × 0.85)
```

After layout, all node positions are multiplied by `SPREAD_FACTOR = 1.25` to give the map breathing room.

**Ring 0** is the start node (center). The number of start nodes is `ringZeroNodes` (default 1). Outer rings (1+) use a bell-curve distribution peaking at the middle ring:

```ts
ringNodeCount(ring) = NODE_DENSITY × density × (0.5 + 0.5 × bellCurveFactor)
```

Where `NODE_DENSITY = 7` is the base constant, and the bell curve factor is `1 − |ring − midRing| / midRing`.

### 1.2 Node Types

| Type | Description | PP Budget Bonus |
|------|-------------|-----------------|
| **Standard** | Flat stat bonuses, weighted by archetype stat profile | — |
| **Anchor (★)** | 5 per run, distributed 1 per ring across rings 1–6. Higher rarity. | — |
| **Conditional** | Bonus active only when a condition is met (e.g. golden spent, stat threshold) | +1.5 |
| **Mutex** | Pairs that lock each other — pick one | +2.0 |
| **Anti-Synergy** | Penalizes if you take too many similar nodes | +2.5 |
| **Threshold** | Activates after a specific turn | +2.0 |
| **Hybrid Bridge** | Connects two stat archetypes | +2.0 |

### 1.3 Edge Creation

Edges form the directed graph from ring N → ring N+1:

- **Forward edges**: Each node gets 1–`MAX_FORWARD_EDGES` (default 3) edges to nodes in the next ring. Anchor nodes always get the maximum (`MAX_FORWARD_EDGES`) to fan out broadly.
- **Lateral edges**: 30% chance (`LATERAL_CHANCE`) for nodes in the same ring to connect to their nearest same-ring neighbor.
- **Reachability guarantee**: After edge creation, a BFS from the start node ensures every node is reachable. Isolated nodes get a forward edge from the nearest reachable node in a previous ring.

The graph is a **DAG** (directed acyclic graph) — edges only go forward or lateral within the same ring.

### 1.4 Distance Tiers (Visual)

After each purchase, a BFS from all drafted nodes computes hop distance to every other node. The map renders with opacity tiers:

| Tier | Hops from player | Opacity | Edge color |
|------|-----------------|---------|------------|
| 0 | Purchased | 1.0 | Accent (bright) |
| 1 | 1–2 hops | 0.85 | Accent amber |
| 2 | 3–4 hops | 0.55 | Accent amber dim |
| 3 | 5–7 hops | 0.32 | Cool grey |
| 4 | 8+ hops | 0.18 | Cool grey dim |

### 1.5 Layout Physics

After initial placement (evenly-spaced angles + random jitter ±8°), three passes improve spacing:

1. **Repulsion** (5 passes): Push overlapping nodes apart until minimum distance `MIN_DIST = 75px`.
2. **Spring forces** (2 passes): Pull connected nodes toward ideal edge length `RADIUS_STEP × 0.75` with spring constant 0.15.
3. **Global spread**: Multiply all positions by 1.25x.

### 1.6 Purchasing

A node can be purchased if:
- The player is in the DRAFT phase
- The node's origin (at least one incoming edge source) is already drafted
- The player has gold ≥ the node's cost (after LCK discount: `cost × (1 − LCK × 0.015)`)
- The player has remaining draft picks (`currentNodeDrafts > 0`)

After purchase: stats increase, abilities unlock, and `currentNodeDrafts` decrements.

---

## 2. Combat System

Combat resolves through the DRAFT → EXECUTE → STINGER cycle each turn.

### 2.1 Turn Structure

The game spans 20 turns. PREP_TURNS (currently 0) are setup turns with no encounters.

Each turn:
1. **BRIEFING** (formerly FORECAST+PAYOUT): Gold deposits, threat radar visible, player plans.
2. **BEGIN DRAFTING**: Enter the store + constellation.
3. **DRAFT**: Purchase 1 node + any items.
4. **EXECUTE**: Damage is calculated against the encounter.
5. **STINGER**: Result screen (PASS/FAIL). If PASS, advance to next turn. If FAIL, run ends.

### 2.2 Archetypes

| Archetype | Primary Stat | Secondary | Bypass Rule | Playstyle |
|-----------|-------------|-----------|-------------|-----------|
| **Sporgk** | STR | STA | STR pierces armor | Brute force, raw damage |
| **Space Pug Elf** | AGI | LCK | — | Weak early, snowball via LCK |
| **Space Pug Vampire** | INT | STA | INT bypasses armor + evasion + intResist | Synergy puzzle |

### 2.3 Stats

| Stat | Combat effect |
|------|--------------|
| **STR** | Base damage per attack: `STR × weaponStrMult + flatBonuses`. Also reduces enemy armor by `STR × 2`. |
| **AGI** | Number of attacks: `floor(1 + AGI / 5)`. |
| **STA** | Max stamina: `10 + floor(STA / 2)`. Stamina fuels abilities. |
| **INT** | For Vampire: replaces STR as base damage stat AND bypasses armor, evasion, and INT resist. |
| **LCK** | Crit chance: `LCK × 0.02` (max 50%). Gold discount: `LCK × 0.015` per point. |

### 2.4 Damage Formula

```
perAttack = floor(baseDamage × critMultiplier × armorMod × evasionMod)

baseDamage = primaryStat × weaponStrMult + flatBonuses
attacks    = floor(1 + AGI / 5)
critMult   = 2 if LCK-scaled crit roll, else 1
armorMod   = 1.0 if INT bypass, else max(0.1, 1 − effectiveArmor/(effectiveArmor+100))
evasionMod = 0 if INT bypass or evaded roll, else 1
```

**Effective armor**: `encounter.armor − STR × 2 − resistanceBypass`

### 2.5 Abilities

Abilities are unlocked by purchasing certain nodes. In combat:

- Each ability has a **stamina cost** (`staCost`), **base damage**, **scaling stat**, and **scaling factor**.
- Abilities fire as many times as stamina allows, up to `maxFires`.
- Stamina pool: `maxStamina − encounter.staminaDrain`.
- Abilities can have `bypassArmor` and `bypassEvasion` flags.
- INT-scaling abilities suffer from `intResist`.

### 2.6 Thresholds

The damage required to pass a turn scales with game difficulty:

```
threshold(turn) = curve(turn) × multipler

curve(turn):
  linear:     base + primarySlope × (turn−1)
  breakpoint: gentle early + steep late (breakpointTurn)
  quadratic:  base + primarySlope × t + quadraticCoeff × t²

multiplier:
  turn % 5 == 0: bossMultiplier (default 1.5)
  turn == 20:    finalBossMultiplier (default 1.8)
  else:          1.0
```

### 2.7 Stinger Outcomes

| Margin | Result |
|--------|--------|
| `total ≥ threshold`, margin ≥ 5% | **PASS** — advance to next turn |
| `total ≥ threshold`, margin < 5% | **BARELY PASS** |
| `total < threshold`, margin ≥ −5% | **BARELY FAIL** |
| `total < threshold`, margin < −5% | **FAIL** — run ends |
| PASS on boss turn (turn % 5 == 0) | **BOSS PASS** |

---

## 3. Economy

### 3.1 Gold Payout

```ts
payout = floor((50 + (turn−1) × 10) × (1 + LCK × 0.015) × perTurnPayoutMultiplier)
```

Gold is now auto-deposited at the start of each turn (BRIEFING phase).

### 3.2 Node Costs

Node costs are distributed per ring:

| Ring | Cost range |
|------|-----------|
| 0 | 0 (free start node) |
| 1 | 25–40 |
| 2 | 35–55 |
| 3 | 50–75 |
| 4 | 70–100 |
| 5 | 90–130 |
| 6 | 110–160 |
| 7 | 140–200 |

Costs are discounted by LCK: `actualCost = floor(cost × (1 − LCK × 0.015))`.

### 3.3 Items

Items appear in the store during DRAFT. They occupy equipment slots (HEAD, BODY, PAWS, ARTIFACT) and can provide:
- **Weapon effects**: `strMult`, `flatBonus` — modify base damage
- **Resistance**: bypass enemy armor, evasion, or INT resist
- **Stat requirements**: minimum stats to equip
- **Ability grants**: unlock new abilities

---

## 4. Balance Weights

All game difficulty is controlled through `BalanceWeights`:

| Weight | Default | Range | Effect |
|--------|---------|-------|--------|
| `bossMultiplier` | 1.5 | 1.0–5.0 | Threshold multiplier on boss turns |
| `finalBossMultiplier` | 1.8 | 1.0–5.0 | Threshold multiplier on turn 20 |
| `itemPowerMultiplier` | 1.0 | 0.5–2.0 | Scales item bonuses |
| `nodePowerMultiplier` | 1.0 | 0.5–2.0 | Scales node stat bonuses |
| `structuralNodeAvailability` | 1.0 | 0.5–2.0 | Probability of structural nodes spawning |
| `startingGoldMultiplier` | 1.0 | 0.5–2.0 | Starting gold |
| `perTurnPayoutMultiplier` | 1.0 | 0.5–2.0 | Gold per turn |
| `luckEfficacyMultiplier` | 1.0 | 0.5–2.0 | Crit chance and discount scaling |
| `poolSizeMultiplier` | 1.0 | 0.5–2.0 | Store item pool size |
| `nodeDensity` | 1.0 | 0.2–5.0 | Nodes per ring |
| `ringCount` | 7 | 4–10 | Number of rings |
| `ringZeroNodes` | 1 | 1–5 | Start nodes at center |
| `constellationLayout` | radial | radial / left-to-right | Layout algorithm |

### 4.1 Difficulty Presets

| Preset | nodeDensity | ringCount | Curve | Boss Mult | Payout Mult |
|--------|------------|-----------|-------|-----------|-------------|
| Easy | 0.6 | 6 | linear | 1.3 | 1.20 |
| Normal | 1.0 | 7 | breakpoint | 1.5 | 1.0 |
| Hard | 1.4 | 8 | breakpoint | 1.7 | 0.90 |
| Nightmare | 1.8 | 9 | breakpoint | 1.85 | 0.80 |
| Custom | slider | slider | select | slider | slider |

---

## 5. Determinism

The entire game is seeded. `createRNG(seed)` creates a deterministic PRNG from the run seed. Every node, edge, encounter, item, and combat roll is derived from this stream. Same seed + same archetype + same weights = identical run.

### 5.1 Seed Conventions

```
runSeed = "run-abc123"
turnSeed = `${runSeed}_${archetype}_t${turn}_f`     (forecast generation)
storeSeed = `${runSeed}_${archetype}_t${turn}_s`     (store generation)
executeSeed = `${runSeed}_${archetype}_t${turn}_ex`  (combat resolution)
```

This ensures each phase gets a deterministic but distinct slice of the PRNG stream.

---

## 6. Archetype Theming

Archetypes define their visual identity through a `theme` object (in `ArchetypeFlavor`). The `useArchetypeTheme` hook sets CSS custom properties on `:root` when the archetype changes:

| CSS Variable | Purpose |
|-------------|---------|
| `--accent` | Primary archetype color (nodes, buttons, headers) |
| `--accent-soft` | Muted variant |
| `--accent-glow` | Glow color (purchased nodes, edge glow) |
| `--radius-card` | Card border radius (per-archetype) |
| `--background-mood-color` | Background particle color |
| `--background-mood-density` | Background particle density |

These feed into Tailwind v4 theme tokens (`bg-terminal-accent`, `text-terminal-accent`, etc.), so all Tailwind classes automatically reflect the current archetype.
