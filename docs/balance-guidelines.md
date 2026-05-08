# Balance Guidelines

A modder reference for adding nodes, items, and modifiers to Project Antigravity without breaking the game's difficulty pacing. The system is built around **Power Points (PP)** — a single unit of measure that lets us reason about how strong any new piece of content is, regardless of what specific effects it carries.

This doc is canonical for content additions. If something here conflicts with `AI.md` or the GDD, this doc wins for balance questions.

---

## TL;DR

Every node, item, and modifier has a target **PP budget** for its tier. Every effect costs PP. Stay within ±25% of the budget. Mind the slot identity. Don't break the anti-patterns list.

---

## 1. The Power Points (PP) System

### Why PP?

Player damage and the threshold curve scale roughly linearly across a 20-turn run. We want any new piece of content to fit cleanly into that curve — not be dead weight at one tier and game-breaking at another. PP is the common currency for evaluating that.

### PP cost per effect

| Effect | PP cost |
|---|---|
| +1 to a primary stat (STR / AGI / STA / INT / LCK) | 1.0 |
| +1 flat damage on attacks | 1.0 |
| +1 to stamina pool size | 1.0 |
| +1% crit chance | 0.5 |
| +1 attack count multiplier | 4.0 (already multiplicative — be careful) |
| +5g starting gold | 1.0 |
| +1 free node draft this round (consumable) | 3.0 |
| Bypass armor on a class of attacks | 2.0 |
| Bypass evasion on a class of attacks | 1.5 |
| Build-defining unique effect (changes the formula) | 4.0 – 8.0, designer judgment |

### PP cost modifiers

| Modifier | Multiplier on the effect's PP |
|---|---|
| Conditional effect (only fires when X is true) | × 0.75 |
| Restrictive conditional (specific archetype, narrow build) | × 0.50 |
| Threshold-gated (only at turn N+, only if stat ≥ X) | × 0.60 |
| Stacking ceiling (max N stacks) | × 0.85 |

Conditions stack multiplicatively. A "Sporgk-only, after turn 10" effect gets `× 0.50 × 0.60 = × 0.30`.

---

## 2. PP Budgets per Source

These are the targets for new content. Variance: ±25% of the budget. Outside that range, expect the content to feel either OP or trash.

### Items (per tier, baseline gold cost shown for reference)

| Tier | Cost ~ | PP budget | Variance window |
|---|---|---|---|
| T1 | ~10g | **2.0 PP** | 1.5 – 2.5 |
| T2 | ~30g | **4.0 PP** | 3.0 – 5.0 |
| T3 | ~70g | **7.0 PP** | 5.5 – 8.5 |
| T4 | ~150g | **11.0 PP** | 9.0 – 13.0 |

### Nodes

| Type | PP budget | Notes |
|---|---|---|
| Minor / Stardust | **2.0 PP** | The bulk of the constellation. Flat stat boosts, simple modifiers. |
| Major / Anchor | **5.0 PP** | 3-4 fixed positions per archetype. Build-defining. |
| Conditional / Mutex / Anti-synergy / Threshold | **3.0 – 6.0 base, × condition multiplier** | Structural depth. Aim for 20% of pool. |
| Hybrid bridge (cross-archetype) | **4.0 PP base, × 0.75 = 3.0 effective** | Rare. Costs adjacency to specific anchors. |

### Codex Modifiers (passive, persistent across runs)

| Effect type | PP budget |
|---|---|
| `stat_boost` | 1.0 – 3.0 (one-time at run start) |
| `start_gold` | 1.0 – 4.0 |
| `add_node_to_pool` | 2.0 – 4.0 (counts as one extra possible draw) |
| `add_item_to_pool` | 2.0 – 4.0 |

Modifiers compound across runs — a player with 15 unlocked modifiers should feel meaningfully different from one with 0, but not invincible. Bias toward `add_*_to_pool` for replay value.

---

## 3. Slot Identity (Equipment Items)

Cross-slot bleed dilutes build identity. Each slot has a thematic bias; aim to spend ≥ 75% of the item's PP on its bias category.

| Slot | Bias category | Examples |
|---|---|---|
| **Head** | Defensive | Armor, evasion, INT-resist, status immunity |
| **Body** | Raw stats | STR / STA / INT bulk |
| **Paws** | Speed | AGI, crit chance, attack count multipliers |
| **Artifact** | Build-defining | Conditional effects, archetype synergies, unique mechanics |

A T2 Head item can carry +1 STR (1.0 PP, off-slot ~25%) alongside +3 armor + intResist (3.0 PP, on-slot ~75%). A T2 Head with +4 AGI fails the slot identity check — that's a Paws item miscategorized.

---

## 4. Difficulty Weights System

The PP budgets above are the **baseline** (Normal preset). At runtime, weights apply multipliers:

```
effectivePP(item)  = item.basePP × weights.itemPowerMultiplier
effectivePP(node)  = node.basePP × weights.nodePowerMultiplier
```

| Preset | itemPowerMultiplier | nodePowerMultiplier | Effect |
|---|---|---|---|
| Easy | 1.15 | 1.10 | Items and nodes ~10-15% stronger |
| Normal | 1.00 | 1.00 | Baseline |
| Hard | 0.90 | 0.95 | Slightly weaker |
| Nightmare | 0.80 | 0.85 | Meaningfully weaker — punishing |
| Custom | user-set | user-set | Players can configure freely |

**You only design at the Normal baseline.** Don't compensate for the multipliers — the system handles that. If your content feels right at Normal preset (turn-1 STR 10 vs threshold 10), it scales correctly to the others.

The threshold curve also scales by preset (`base`, `primarySlope`, `secondarySlope`, `breakpointTurn`, plus boss multipliers). See `src/data/balance-presets.ts` for exact numbers per preset.

---

## 5. Adding New Content — The Process

### Adding an item

1. Pick a slot (Head / Body / Paws / Artifact) and a tier (T1-T4) based on the build identity it serves.
2. Find that tier's PP budget in §2.
3. Choose effects whose total PP sums to within ±25% of budget. Use the slot identity rule (≥ 75% on-slot).
4. If the item has a stat-gated equip requirement (e.g., requires 20 STR), that's *not* a PP cost — it's a gating mechanism.
5. If the item has a conditional bonus, multiply that effect's PP per §1.
6. Add to the appropriate file in `src/data/items/<archetype>.ts` or `src/data/items/universal.ts`.
7. Write a one-line flavor caption in the terminal aesthetic (lowercase, mono, leading `>`, no exclamation).
8. Add a Vitest case asserting the item is generated by `rollStore` for the right archetype/tier.

### Adding a node

1. Pick the type (minor / structural).
2. Pick a position behavior (free-floating minor / anchor with fixed coordinates / mutex pair / etc.).
3. Compute PP per §2.
4. For structural nodes, pick the condition shape (`if X then Y`) and apply the modifier from §1.
5. Add to `src/data/nodes/<archetype>.ts`.
6. Verify with `pnpm test tests/data/validation.test.ts` that the node passes the data validation suite.

### Adding a codex modifier

1. Pick the trigger (win condition, turn-reach, archetype-specific, etc.).
2. Pick the effect type and value (per §2 codex budget).
3. Add to `src/data/modifiers.ts`.
4. Add the unlock-condition evaluator branch to `src/game/save/codex.ts` if introducing a new condition kind.
5. Write a Vitest case for `applyCodexModifiers` and the unlock-condition evaluator.

---

## 6. Anti-patterns (don't do these)

- ❌ **"+1 to all stats"** — boring, dominant, breaks slot identity
- ❌ **Self-stacking with no cap** — `+1% per stack, no max`
- ❌ **Trivially-triggered conditionals** — `if turn > 1: +5 STR` is just +5 STR with extra steps
- ❌ **Off-slot dominance** — a Head item where 80% of PP is offensive
- ❌ **T1 items that solve T3 problems** — inverted scaling
- ❌ **Generic effects** — every item should feel like *something* (mechanic, flavor, archetype, or all three)
- ❌ **Cross-archetype duplication** — the same mechanic for multiple archetypes dilutes class identity
- ❌ **Hidden randomness** — anything that calls `Math.random()` in `/src/game/` will fail review

---

## 7. Examples

✅ **T2 Body item, "Asteroid Plate" (4.0 PP):**
```ts
{ id: 'item_asteroid_plate', tier: 'T2', slot: 'body',
  effects: [
    { type: 'stat_boost', stat: 'STR', amount: 3 },     // 3.0 PP
    { type: 'stat_boost', stat: 'STA', amount: 1 },     // 1.0 PP
  ],
  flavor: '> hammered from the heart of a dead world.',
  cost: 30 }
// Total: 4.0 PP ✓ (within T2 budget 3.0–5.0)
// Slot identity: 100% on-slot (raw stats) ✓
```

✅ **T3 Artifact, "Void Pact" (7.0 PP, conditional):**
```ts
{ id: 'item_void_pact', tier: 'T3', slot: 'artifact',
  effects: [
    { type: 'damage_to_shield', percent: 0.50 },         // 5.0 PP base × 0.75 conditional = 3.75
    { type: 'stat_boost', stat: 'INT', amount: 3 },       // 3.0 PP
  ],
  flavor: '> the void asks little, gives much.',
  cost: 70 }
// Total: ~6.75 PP ✓ (within T3 budget 5.5–8.5)
```

❌ **What "willy-nilly" looks like (don't do this):**
```ts
{ id: 'item_glove_of_doom', tier: 'T1', slot: 'paws',
  effects: [{ type: 'stat_boost', stat: 'STR', amount: 5 }],  // 5.0 PP — 250% of T1 budget!
  cost: 10 }
// Off-slot (Paws should be AGI/crit) AND massively over budget for T1.
```

---

## 8. Testing Your Additions

```bash
npm test tests/data/validation.test.ts   # data shape + budget sanity
npm test tests/game/economy/             # store roll determinism
npm test tests/game/constellation/       # node graph generation
npm test                                  # full suite — should stay green
```

If you add a structural-depth node, also verify it appears in seeded constellation generation when its archetype is selected. Use the existing `applyWeights.test.ts` patterns as a template.

---

## 9. References

- `src/types/balance.ts` — `BalanceWeights` type definition
- `src/data/balance-presets.ts` — the four named presets (easy/normal/hard/nightmare)
- `src/game/balance/computeThreshold.ts` — curve computation
- `tests/data/validation.test.ts` — automated PP budget assertions
- `AI.md` — short-form rules for AI agents working on the codebase
- `GDD.md` — design intent (the why behind the rules)
