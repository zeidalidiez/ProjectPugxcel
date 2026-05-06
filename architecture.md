# Project Antigravity — Architecture v1.0

## Table of Contents

1. [Type Definitions](#1-type-definitions)
2. [Data Flow](#2-data-flow)
3. [File Structure](#3-file-structure)
4. [Key Algorithms](#4-key-algorithms)
5. [Locked Formulas](#5-locked-formulas)
6. [Build Order](#6-build-order)
7. [Determinism Contract](#7-determinism-contract)
8. [Implementation Rules](#8-implementation-rules)

---

## 1. Type Definitions

```ts
// ==================== src/types/enums.ts ====================

export enum Archetype {
  SPORGK = 'SPORGK',
  ELF = 'ELF',
  VAMPIRE = 'VAMPIRE',
}

export enum StatType {
  STR = 'STR',
  AGI = 'AGI',
  STA = 'STA',
  INT = 'INT',
  LCK = 'LCK',
}

export enum NodeType {
  STANDARD = 'STANDARD',
  CONDITIONAL = 'CONDITIONAL',
  MUTEX = 'MUTEX',
  ANTI_SYNERGY = 'ANTI_SYNERGY',
  THRESHOLD = 'THRESHOLD',
  HYBRID_BRIDGE = 'HYBRID_BRIDGE',
}

export enum ItemTier {
  T1 = 'T1',
  T2 = 'T2',
  T3 = 'T3',
  T4 = 'T4',
}

export enum ItemSlot {
  HEAD = 'HEAD',
  BODY = 'BODY',
  PAWS = 'PAWS',
  ARTIFACT = 'ARTIFACT',
}

export enum ItemCategory {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  TRINKET = 'TRINKET',
  ABILITY = 'ABILITY',
}

export enum RunPhase {
  FORECAST = 'FORECAST',
  PAYOUT = 'PAYOUT',
  DRAFT = 'DRAFT',
  EXECUTE = 'EXECUTE',
  STINGER = 'STINGER',
  POST_RUN = 'POST_RUN',
}

export enum ThreatTag {
  ARMORED = 'ARMORED',
  EVASIVE = 'EVASIVE',
  RESISTANT = 'RESISTANT',
  STAMINA_DRAIN = 'STAMINA_DRAIN',
  KINETIC = 'KINETIC',
  VOID = 'VOID',
  CRYSTALLINE = 'CRYSTALLINE',
}

export enum StingerVariant {
  PASS = 'PASS',
  FAIL = 'FAIL',
  BARELY_PASS = 'BARELY_PASS',
  BARELY_FAIL = 'BARELY_FAIL',
  BOSS_PASS = 'BOSS_PASS',
}

// ==================== src/types/stats.ts ====================

export interface StatBlock {
  [StatType.STR]: number;
  [StatType.AGI]: number;
  [StatType.STA]: number;
  [StatType.INT]: number;
  [StatType.LCK]: number;
}

export const EMPTY_STATS: StatBlock = {
  [StatType.STR]: 0,
  [StatType.AGI]: 0,
  [StatType.STA]: 0,
  [StatType.INT]: 0,
  [StatType.LCK]: 0,
};

// ==================== src/types/nodes.ts ====================

export interface NodeEffect {
  stat: StatType;
  value: number;
  kind: 'flat' | 'mult' | 'special';
  specialId?: string; // references abilityId, passiveId, etc.
}

export interface NodeCondition {
  type: 'gear_equipped' | 'gear_unequipped' | 'stat_threshold' | 'turn_threshold' | 'gold_spent' | 'gold_unspent';
  stat?: StatType;
  value: number;
}

export interface NodeDef {
  id: string;
  name: string;
  description: string;
  type: NodeType;
  archetype: Archetype;
  cost: number;
  effects: NodeEffect[];
  mutexPairId?: string;
  condition?: NodeCondition;
  unlocksAbility?: string; // ability ID granted when purchased
  rarity: number; // weight 1-100 for pool selection
  column: number; // 0-7, 0 = start, higher = deeper
  isAnchor: boolean;
}

export interface ConstellationNode {
  defId: string;
  id: string; // unique instance ID per run
  x: number;
  y: number;
  column: number;
  edges: string[]; // IDs of connected forward nodes
  purchased: boolean;
  locked: boolean; // true if mutex partner was chosen
}

export interface Constellation {
  nodes: Map<string, ConstellationNode>;
  startNodeId: string;
  anchorNodeIds: string[];
}

// ==================== src/types/items.ts ====================

export interface ItemEffect {
  statBonus?: Partial<StatBlock>;
  strMult?: number;
  flatBonus?: number;
  grantsAbility?: string; // ability ID
  passiveId?: string;
  resistance?: { tag: ThreatTag; value: number };
  extraNodeDraft?: boolean; // +1 draft this turn
}

export interface ItemDef {
  id: string;
  name: string;
  tier: ItemTier;
  slot: ItemSlot;
  category: ItemCategory;
  archetype: Archetype | 'universal';
  cost: number;
  description: string;
  effects: ItemEffect[];
  statRequirements?: Partial<StatBlock>;
}

export interface InventoryItem {
  defId: string;
  instanceId: string;
  slot: ItemSlot;
  equipped: boolean;
}

// ==================== src/types/abilities.ts ====================

export interface AbilityDef {
  id: string;
  name: string;
  staCost: number;
  baseDamage: number;
  maxFires: number;
  scalingStat: StatType;
  scalingFactor: number; // e.g., 0.5 means 50% of stat added
  bypassArmor: boolean;
  bypassEvasion: boolean;
  description: string;
}

// ==================== src/types/encounters.ts ====================

export interface Encounter {
  enemyName: string;
  flavorText: string;
  armor: number;
  evasion: number; // 0.0–0.5
  intResist: number; // 0.0–1.0, multiplier on INT-sourced damage
  staminaDrain: number;
  threatTags: ThreatTag[];
}

// ==================== src/types/run.ts ====================

export interface RunState {
  seed: string;
  archetype: Archetype;
  turn: number; // 1–20
  phase: RunPhase;

  stats: StatBlock;
  baseStats: StatBlock; // from purchased nodes (before gear)
  gold: number;

  constellation: Constellation;
  draftedNodeIds: string[]; // ordered by turn drafted

  inventory: InventoryItem[];
  abilities: string[]; // owned ability IDs (from nodes + items)

  currentNodeDrafts: number; // default 1, reset each turn
  extraNodeDrafts: number; // from rare effects, consumed first

  storeItems: string[]; // itemDef IDs available this turn (max 5)
  storeRerolled: boolean;

  encounters: Encounter[]; // index 0 = current turn, 1-4 = upcoming
  upcomingEncounters: Encounter[]; // next 4 turns (alias for encounters[1..4])

  combatLog: CombatLogLine[];
  lastResult: ResolutionResult | null;
  runEnded: boolean;

  shareString: string;
}

export interface CombatLogLine {
  text: string;
  type: 'info' | 'crit' | 'ability' | 'total' | 'result';
}

export interface ResolutionResult {
  pass: boolean;
  damageDealt: number;
  threshold: number;
  deficit: number;
  stingerVariant: StingerVariant;
}

// ==================== src/types/save.ts ====================

export interface SaveState {
  version: number;
  run: RunState | null;
  codex: CodexState;
  settings: SettingsState;
}

export interface CodexState {
  unlockedModifiers: string[];
  completedRuns: CompletedRun[];
  achievements: string[];
  builds: SavedBuild[];
}

export interface CompletedRun {
  id: string;
  seed: string;
  archetype: Archetype;
  turnReached: number;
  passed: boolean;
  deficitOrMargin: number;
  draftedNodeIds: string[];
  shareString: string;
  timestamp: number;
}

export interface SavedBuild {
  name: string;
  runId: string;
}

export interface SettingsState {
  fontSize: 100 | 125 | 150;
  reducedMotion: boolean;
  uncertaintyMode: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number; // 0–1
  musicVolume: number; // 0–1
}

// ==================== src/types/rng.ts ====================

export interface PRNG {
  next(): number; // 0–1
  nextInt(min: number, max: number): number; // inclusive
  pick<T>(arr: T[]): T;
  shuffle<T>(arr: T[]): T[];
  getState(): string;
}

// ==================== src/types/audio.ts ====================

export interface AudioManifest {
  stingers: Record<StingerVariant, string>;
  sfx: Record<string, string>;
  music: Record<string, string>;
  sprites: Record<string, AudioSpriteDef>;
}

export interface AudioSpriteDef {
  src: string;
  sprite: Record<string, [number, number]>; // [startMs, durationMs]
}
```

---

## 2. Data Flow

### Per-Turn Cycle

```
                    ┌─────────────────────────────────────────┐
                    │              GAME STORE (Zustand)         │
                    │  RunState | Codex | Settings | Phase     │
                    └──────┬──────────┬──────────┬─────────────┘
                           │          │          │
              ┌────────────┘          │          └─────────────┐
              ▼                       ▼                        ▼
    ┌─────────────────┐   ┌──────────────────┐   ┌──────────────────┐
    │ /game/constellation │   │ /game/resolve   │   │ /game/economy    │
    │ generateConstell()  │   │ resolve()        │   │ generateStore()   │
    │ canPurchaseNode()   │   │ forecastEncount()│   │ calculatePayout() │
    │ purchaseNode()      │   │ generateEncounter│   │ applyDiscount()   │
    └─────────────────┘   └──────────────────┘   └──────────────────┘
              │                       │                        │
              └───────────────────────┼────────────────────────┘
                                      │
                          All game logic is PURE:
                          StateIn → StateOut, no side effects
```

### Turn Flow (within Zustand actions)

```
ADVANCE_TO_FORECAST()
  ├── generateEncounters(seed, turn) → upcoming encounters
  ├── calculateThreshold(turn) → threshold
  └── phase = FORECAST

ADVANCE_TO_PAYOUT()
  ├── calculatePayout(turn, lck) → goldAdded
  └── phase = PAYOUT → DRAFT

DRAFT_PHASE_INIT()
  ├── generateStore(seed, turn, lck, archetype) → storeItems
  ├── currentNodeDrafts = 1 + extraNodeDrafts
  ├── extraNodeDrafts = 0
  └── phase = DRAFT

PURCHASE_NODE(nodeId)
  ├── canPurchaseNode(state, nodeId) → boolean
  ├── if (!canPurchase) return
  ├── purchaseNode(state, nodeId) → newStats, newGold, newConstellation
  └── currentNodeDrafts--

PURCHASE_ITEM(itemId)
  ├── canPurchaseItem(state, itemId) → boolean
  ├── if (!canPurchase) return
  ├── addToInventory(state, itemId) → newInventory, newGold
  └── if item grants ability → newAbilities

EXECUTE()
  ├── resolve(state) → ResolutionResult + CombatLog
  ├── phase = STINGER
  ├── after stinger delay:
  │   ├── if PASS: ADVANCE_TO_NEXT_TURN()
  │   └── if FAIL: END_RUN(state) → shareString, codex, phase = POST_RUN
  └── phase = POST_RUN (on fail) or back to FORECAST (on pass)
```

### Component → Store Wiring

```
MainHUD
  ├── reads: stats, gold, constellation, turn, phase, storeItems
  ├── dispatches: purchaseNode, purchaseItem, execute
  └── selectors: canPurchaseNode(id), canAfford(id), hasDraftsRemaining

ConstellationViewport
  ├── reads: constellation.nodes, draftedNodeIds
  ├── dispatches: purchaseNode, hoverNode
  └── selectors: purchasableNodes, connectedNodes

StoreModal
  ├── reads: storeItems (defs resolved from data)
  ├── dispatches: purchaseItem
  └── selectors: discountedPrices

ExecuteTerminal
  ├── reads: combatLog, lastResult
  ├── dispatches: advancePhase (auto)
  └── selectors: stingerVariant

PostRunScreen
  ├── reads: shareString, lastResult, codexUnlocks
  └── dispatches: restartRun
```

---

## 3. File Structure

```
/src
  /types
    enums.ts              All enums
    stats.ts              StatBlock + EMPTY_STATS
    nodes.ts              NodeDef, ConstellationNode, NodeEffect, NodeCondition
    items.ts              ItemDef, InventoryItem, ItemEffect
    abilities.ts          AbilityDef
    encounters.ts         Encounter
    run.ts                RunState, CombatLogLine, ResolutionResult
    save.ts               SaveState, CodexState, CompletedRun, SettingsState
    rng.ts                PRNG interface
    audio.ts              AudioManifest

  /game                   Pure logic. NO React imports. NO Math.random().
    /constellation
      generate.ts         generateConstellation(seed, archetype) → Constellation
      canPurchase.ts      canPurchaseNode(state, nodeId) → boolean
      purchase.ts         purchaseNode(state, nodeId) → Partial<RunState>
      layout.ts           layoutNodes(nodes) → { x, y } per node
    /resolve
      resolve.ts          resolve(state) → { result: ResolutionResult, log: CombatLogLine[] }
      encounter.ts        generateEncounter(rng, turn) → Encounter
      damage.ts           computeDamage(state, encounter) → number
      abilities.ts        fireAbilities(state, encounterStaminaDrain) → { damage, log }
      forecast.ts         generateEncounters(rng, startTurn, count) → Encounter[]
    /economy
      store.ts            generateStore(rng, turn, archetype) → string[] (item IDs)
      cost.ts             applyDiscount(baseCost, lck) → number
      payout.ts           calculatePayout(turn, lck) → number
      threshold.ts        calculateThreshold(turn) → number
    /save
      serialize.ts        serializeRun(state) → string (share string)
      deserialize.ts      deserializeShare(shareStr) → RunState
      codex.ts            checkCodexUnlocks(completedRun) → string[] (unlock IDs)
      storage.ts          load/save to localStorage with Zod validation
    /rng
      create.ts           createRNG(seed) → PRNG
      prng.ts             seedrandom wrapper implementing PRNG interface

  /data
    /nodes
      sporgk.ts           ~80 node definitions for Sporgk archetype
      elf.ts              ~80 node definitions for Elf archetype
      vampire.ts          ~80 node definitions for Vampire archetype
      index.ts            getAllNodes(archetype) → NodeDef[]
    /items
      universal.ts        ~40 universal items across T1-T4
      sporgk.ts           ~10-15 Sporgk-specific items
      elf.ts              ~10-15 Elf-specific items
      vampire.ts          ~10-15 Vampire-specific items
      index.ts            getAllItems(archetype) → ItemDef[]
    /abilities
      index.ts            All ability definitions
    /encounters
      enemies.ts          Enemy name/pool definitions
      templates.ts        Encounter templates with stat ranges
    /codex
      modifiers.ts        Codex modifier definitions
      challenges.ts       Achievement/challenge definitions

  /components             React components (PascalCase)
    App.tsx               Root layout, phase router
    MainHUD.tsx           Board 1 — drafting terminal
    StatPanel.tsx         Left panel: 5 stat rows
    EquipmentSlots.tsx    Left panel: head/body/paws/artifact
    ConstellationViewport.tsx  Center: pannable/zoomable graph
    ConstellationNode.tsx      Single node in the graph
    TurnHistory.tsx       Right panel: scrollable log
    ForecastRadar.tsx     Top bar: radar banner + threat heatmap
    ThreatHeatmap.tsx     Stat-type relevance overlay
    GoldDisplay.tsx       Current gold counter
    ExecuteButton.tsx     Bottom bar: full-width execute
    StoreModal.tsx        Board 2 — item shop grid
    StoreItem.tsx         Single store item card
    ExecuteTerminal.tsx   Board 3 — typewriter combat log
    PostRunScreen.tsx     Board 4 — results + share + restart
    ShareButton.tsx       Copy share string
    CodexCard.tsx         Unlock card display
    ArchetypeSelect.tsx   Pre-run archetype picker
    SettingsModal.tsx     Font size, sound, uncertainty toggle

  /hooks
    useSeed.ts            Initialize/restore seeded RNG
    usePhase.ts           Phase transition orchestration
    useAudio.ts           Howler.js wrapper (stingers, sfx, music)
    useKeyboardNav.ts     Keyboard-only navigation
    useReducedMotion.ts   prefers-reduced-motion detection
    useFontScale.ts       Font scaling state

  /sound
    manifest.ts           Audio file paths + sprite definitions
    howler.ts             Howler.js singleton setup
    stinger.ts            playStinger(variant) — stinger player
    sfx.ts                playSfx(name) — SFX player
    music.ts              playMusic(track), stopMusic()

  store.ts                Zustand store: useGameStore
  App.tsx
  main.tsx

/tests
  /game
    /constellation
      generate.test.ts
      canPurchase.test.ts
      purchase.test.ts
      layout.test.ts
    /resolve
      resolve.test.ts
      encounter.test.ts
      damage.test.ts
      abilities.test.ts
      forecast.test.ts
    /economy
      store.test.ts
      cost.test.ts
      payout.test.ts
      threshold.test.ts
    /save
      serialize.test.ts
      deserialize.test.ts
      codex.test.ts
  /data
    nodes.test.ts         Validates all node defs are well-formed
    items.test.ts         Validates all item defs are well-formed
  /components
    (component tests as needed)
```

---

## 4. Key Algorithms

### 4.1 Constellation Generation

```
generateConstellation(seed: string, archetype: Archetype) → Constellation

1. Create RNG from seed + archetype prefix
2. Load full node pool (~80 NodeDefs) for archetype
3. Select ~54 nodes:
   a. Start node: 1 fixed (archetype start node at column 0)
   b. Anchor nodes: 3-4 fixed per archetype (pinned to columns 1, 3, 5, 7)
   c. Minor nodes: ~50 drawn weighted-random from remaining pool
      (all nodes with column > 0 from pool, columns 1-7 assigned by def.column)
4. Assign layers (columns):
   a. Column 0: Start node only
   b. Columns 1-7: distribute remaining nodes by their NodeDef.column
   c. Within each column, shuffle vertical positions (seeded RNG)
5. Assign positions:
   a. Canvas: ~1600×900 viewport space
   b. Column spacing: even division of width
   c. Row spacing: even division of height by node count in column
   d. Add small random jitter (±10px) for organic feel
6. Create forward edges:
   a. For each node in column k (k < maxColumn):
      - Find node's 1-3 connections to column k+1
      - For anchors: guaranteed edges to major nodes in next column
      - For minors: connect to nearest 1-3 nodes in next column
   b. Ensure no backward edges (DAG invariant)
7. Connectivity check:
   a. BFS from start node
   b. Any unreachable node: add edge from nearest reachable node in prior column
8. Place mutex markers:
   a. Mutex pairs (NodeDef.mutexPairId) must be in same or adjacent columns
   b. If not, swap nodes within columns to satisfy
9. Assign unique instance IDs to all nodes
10. Return Constellation { nodes, startNodeId, anchorNodeIds }
```

**Adjacency rule for drafting:** Player can purchase node N if at least one node in `N.edges` (incoming edges) is already purchased. Start node is purchased at turn 0 for free.

### 4.2 Store Generation

```
generateStore(rng: PRNG, turn: number, archetype: Archetype) → string[]

1. Determine available tiers:
   - turn < 8: [T1, T2, T3, T1, T2] (no T4)
   - turn >= 8: [T1, T2, T3, T4, random]

2. Load item pools:
   a. Universal: ~40 items partitioned by tier
   b. Archetype-specific: ~10-15 items per archetype

3. For each slot (5 total):
   a. Determine tier for this slot
   b. Pool = universal[tier] + archetype-specific items
   c. Roll weighted-random from pool
   d. Add to result (no duplicates within turn)

4. Apply LCK discount to displayed costs (not stored — UI computes via applyDiscount)

5. Return array of item def IDs
```

### 4.3 Encounter Generation

```
generateEncounter(rng: PRNG, turn: number) → Encounter

1. Base scaling factor = 1 + (turn - 1) * 0.1

2. Determine threat profile (deterministic from RNG):
   a. Threat tags: roll 1-3 tags from pool
      - turn % 5 === 0: boss tag always included, 2-3 tags
   b. Armor: base 0-30 * scalingFactor (higher if ARMORED tag)
   c. Evasion: base 0-0.15 * scalingFactor (higher if EVASIVE tag, cap 0.5)
   d. IntResist: 0-0.4 (higher if RESISTANT tag)
   e. StaminaDrain: 0-5 * scalingFactor (higher if STAMINA_DRAIN tag)

3. Boss multiplier (turns 5, 10, 15, 20):
   a. Armor and evasion × 1.5
   b. Unique enemy name from boss pool
   c. Richer flavor text

4. Select enemy name from pool matching threat tags

5. Return Encounter
```

### 4.4 Resolution Engine

```
resolve(state: RunState) → { result: ResolutionResult, log: CombatLogLine[] }

1. Pull current encounter = state.encounters[0]

2. Compute effective stats:
   a. Base = StatBlock from purchased nodes
   b. + equipment stat bonuses (all equipped items' statBonus summed)
   c. = state.stats (pre-computed on inventory change)

3. Compute weapon multiplier:
   a. weapon = equipped item in WEAPON slot
   b. strMult = weapon?.effects.strMult ?? 1.0
   c. Reject if weapon has unmet stat requirements

4. Compute flat bonuses:
   a. Sum all equipped item flatBonuses
   b. + any node-provided flat bonuses (from special effects)

5. Damage calculation:
   a. base = STR * strMult + flatBonuses
   b. attacks = floor(1 + AGI / 5)
   c. critChance = min(LCK * 0.02, 0.5)
   d. For each attack i (0 to attacks-1):
      - Use deterministic RNG roll for crit: rng.next() < critChance
      - Use deterministic RNG roll for evasion: rng.next() < encounter.evasion
        (evasion only applied if damage source is NOT INT-bypass)
      - armorMod = max(0.1, 1 - (encounter.armor / (encounter.armor + 100)))
      - perAttack = base * (crit ? 2 : 1) * armorMod * (evaded ? 0 : 1)
      - Append combat log line per attack
   e. rawTotal = sum of all perAttack values

6. Compute available STA:
   a. maxStamina = 10 + floor(STA / 2)
   b. available = maxStamina - encounter.staminaDrain
   c. available = max(0, available)

7. Fire abilities:
   a. Get all owned abilities (from nodes + items)
   b. Sort by ability.id (deterministic order)
   c. For each ability in order:
      - While available >= ability.staCost AND fires < ability.maxFires:
        * damage = ability.baseDamage + ability.scalingFactor * stats[ability.scalingStat]
        * Apply bypass rules:
          - if ability.bypassArmor: armorMod = 1.0 for this hit
          - if ability.bypassEvasion: skip evasion roll for this hit
        * Apply intResist if damage is INT-sourced: damage *= (1 - encounter.intResist)
        * Append combat log line
        * available -= ability.staCost
        * fires++
   d. abilityTotal = sum of all ability damage

8. total = rawTotal + abilityTotal

9. Check threshold:
   a. threshold = calculateThreshold(turn)
   b. pass = total >= threshold
   c. deficit = threshold - total (if fail)

10. Determine stinger variant:
    a. margin = (total - threshold) / threshold
    b. if pass && turn % 5 === 0 → BOSS_PASS
    c. if pass && margin < 0.05 → BARELY_PASS
    d. if pass → PASS
    e. if fail && margin > -0.05 → BARELY_FAIL
    f. if fail → FAIL

11. Return ResolutionResult + combat log array
```

### 4.5 Share String Encoding

```
encodeShareString(state: RunState) → string

Format: ANTIGRAV/{ARCH}-{SEED8}/{DRAFTSEQ}

1. Segment 1: "ANTIGRAV" (constant)
2. Segment 2: "{ARCH}-{SEED8}"
   a. ARCH = state.archetype (SPRGK | ELF | VAMP)
   b. SEED8 = first 8 chars of state.seed (alphanumeric, uppercase)
3. Segment 3: "{DRAFTSEQ}"
   a. Each draft choice encoded to 1 base-36 char (0-9, A-Z)
   b. Skip empty turns (no node drafted that turn — item-only)
   c. For skipped turn: encode as "Z" (sentinel)
   d. Result: ~20 chars for a full run

Example: ANTIGRAV/SPRGK-7H2XK9LM/D5G2N1S4Z8P2A3M...
```

---

## 5. Locked Formulas

### Damage Formula

```
base          = STR × weaponStrMult + Σ(flatBonuses)
attacks       = ⌊1 + AGI/5⌋
critChance    = min(LCK × 0.02, 0.5)

For each attack:
  crit         = rng.next() < critChance ? 2 : 1
  evaded       = (source.isINT && source.bypassEvasion) ? false : rng.next() < encounter.evasion
  armorMod     = max(0.1, 1 − (encounter.armor / (encounter.armor + 100)))
  perAttack    = base × crit × armorMod × (evaded ? 0 : 1)

rawTotal       = Σ(perAttack)
abilityTotal   = Σ(fireAbilities(state, availableSTA))
total          = rawTotal + abilityTotal
```

### Threshold Curve

```
threshold(turn) = ⌊50 × 1.18 ^ (turn − 1)⌋
if turn % 5 == 0: threshold ×= 1.5  (boss multiplier)

Turn  1:   ~50       Turn 11:  ~249       Boss turns:
Turn  2:   ~59       Turn 12:  ~294       Turn  5:  ~118 × 1.5 = ~177
Turn  3:   ~70       Turn 13:  ~347       Turn 10:  ~363 × 1.5 = ~544
Turn  4:   ~82       Turn 14:  ~409       Turn 15:  ~862 × 1.5 = ~1293
Turn  5:   ~97       Turn 15:  ~483       Turn 20: ~2047 × 1.5 = ~3070
Turn  6:   ~115      Turn 16:  ~570
Turn  7:   ~135      Turn 17:  ~672
Turn  8:   ~160      Turn 18:  ~793
Turn  9:   ~188      Turn 19:  ~936
Turn 10:   ~222      Turn 20:  ~1105
```

### Economy

```
payout(turn, lck) = base × (1 + lck × 0.015)
  base(turn) = 50 + (turn − 1) × 10  (50, 60, 70, ..., 240)

discount(baseCost, lck) = baseCost × (1 − lck × 0.015)
  floor at baseCost × 0.5

nodeCost(column, tier) = 30 + column × 15 + (tier − 1) × 10
  column 0 = free (start node)
```

### Armor Formula

```
armorMod = max(0.1, 1 − (armor / (armor + 100)))

armor = 0    → armorMod = 1.00  (no reduction)
armor = 50   → armorMod = 0.67  (33% reduction)
armor = 100  → armorMod = 0.50  (50% reduction)
armor = 200  → armorMod = 0.33  (67% reduction)

Asymptotic floor at 0.1 (90% max reduction). Ensures damage is never zero.
```

### Stamina

```
maxStamina = 10 + ⌊STA / 2⌋
available  = maxStamina − encounter.staminaDrain
available  = max(0, available)  (never negative)

STAT = 0   → maxStamina = 10
STAT = 10  → maxStamina = 15
STAT = 30  → maxStamina = 25
STAT = 50  → maxStamina = 35
STAT = 100 → maxStamina = 60
```

---

## 6. Build Order

Dependencies are specified per task. Tasks in the same phase can be parallelized.

### Phase 1: Foundation (no dependencies)

| # | Task | Output | Depends On |
|---|------|--------|------------|
| 1.1 | Scaffold Vite + React + TS + Tailwind + Zustand + Vitest | Working `npm run dev` + `npm test` | — |
| 1.2 | Write all type definitions (`/src/types/*.ts`) | Complete type system | — |
| 1.3 | Implement seeded RNG (`/src/game/rng/*.ts`) | `createRNG(seed) → PRNG` | — |
| 1.4 | Zod schemas for save/load validation | Runtime type guards | 1.2 |

### Phase 2: Data Layer

| # | Task | Output | Depends On |
|---|------|--------|------------|
| 2.1 | Sporgk node pool (~80 NodeDefs) | `/src/data/nodes/sporgk.ts` | 1.2 |
| 2.2 | Elf node pool (~80 NodeDefs) | `/src/data/nodes/elf.ts` | 1.2 |
| 2.3 | Vampire node pool (~80 NodeDefs) | `/src/data/nodes/vampire.ts` | 1.2 |
| 2.4 | Universal item pool (~40 ItemDefs) | `/src/data/items/universal.ts` | 1.2 |
| 2.5 | Archetype item pools (~10-15 each) | `/src/data/items/{sporgk,elf,vampire}.ts` | 1.2 |
| 2.6 | Ability definitions | `/src/data/abilities/index.ts` | 1.2 |
| 2.7 | Encounter templates + enemy names | `/src/data/encounters/*.ts` | 1.2 |
| 2.8 | Data validation test suite | All data passes structural checks | 2.1–2.7 |

### Phase 3: Core Game Logic (pure functions)

| # | Task | Output | Depends On |
|---|------|--------|------------|
| 3.1 | `generateConstellation()` + tests | `/src/game/constellation/generate.ts` | 1.3, 2.1–2.3 |
| 3.2 | `canPurchaseNode()` + `purchaseNode()` + tests | `/src/game/constellation/` | 3.1 |
| 3.3 | `calculateThreshold()` + `calculatePayout()` + tests | `/src/game/economy/` | 1.2 |
| 3.4 | `generateStore()` + `applyDiscount()` + tests | `/src/game/economy/` | 1.3, 2.4–2.5 |
| 3.5 | `generateEncounter()` + `generateEncounters()` + tests | `/src/game/resolve/` | 1.3, 2.7 |
| 3.6 | `computeDamage()` + `fireAbilities()` + tests | `/src/game/resolve/` | 1.3, 2.6 |
| 3.7 | `resolve()` (full pipeline) + tests | `/src/game/resolve/resolve.ts` | 3.3, 3.5, 3.6 |
| 3.8 | `encodeShareString()` + `deserializeShare()` + tests | `/src/game/save/` | 1.2 |
| 3.9 | `checkCodexUnlocks()` + tests | `/src/game/save/codex.ts` | 1.2 |

### Phase 4: State Store + Hooks

| # | Task | Output | Depends On |
|---|------|--------|------------|
| 4.1 | Zustand store (`useGameStore`) | `/src/store.ts` | 3.1–3.9 |
| 4.2 | `usePhase()` — phase transition logic | `/src/hooks/usePhase.ts` | 4.1 |
| 4.3 | `useSeed()` — seed init/restore | `/src/hooks/useSeed.ts` | 1.3, 4.1 |
| 4.4 | localStorage persistence with Zod | `/src/game/save/storage.ts` | 1.4, 4.1 |
| 4.5 | `useKeyboardNav()` + `useReducedMotion()` + `useFontScale()` | `/src/hooks/` | — |

### Phase 5: UI Components (can parallelize within board)

| # | Task | Output | Depends On |
|---|------|--------|------------|
| 5.1 | `ArchetypeSelect` screen | `/src/components/ArchetypeSelect.tsx` | 4.1 |
| 5.2 | `StatPanel` + `EquipmentSlots` + `GoldDisplay` | Left panel + top bar | 4.1 |
| 5.3 | `ConstellationViewport` + `ConstellationNode` | Center viewport (pan/zoom) | 4.1, 3.1 |
| 5.4 | `ForecastRadar` + `ThreatHeatmap` | Top bar forecast | 4.1, 3.5 |
| 5.5 | `TurnHistory` | Right panel log | 4.1 |
| 5.6 | `StoreModal` + `StoreItem` | Store overlay | 4.1, 3.4 |
| 5.7 | `ExecuteButton` | Bottom bar | 4.1 |
| 5.8 | `ExecuteTerminal` | Combat log modal | 4.1, 3.7 |
| 5.9 | `PostRunScreen` + `ShareButton` + `CodexCard` | Post-run board | 4.1, 3.8 |
| 5.10 | `MainHUD` — wire all boards together | `/src/components/MainHUD.tsx` | 5.2–5.9 |
| 5.11 | `App` — root layout + phase router | `/src/App.tsx` | 5.1, 5.10, 5.9 |

### Phase 6: Audio

| # | Task | Output | Depends On |
|---|------|--------|------------|
| 6.1 | Audio manifest + Howler setup | `/src/sound/` | — |
| 6.2 | `useAudio()` hook (stingers, SFX, music) | `/src/hooks/useAudio.ts` | 6.1 |
| 6.3 | Wire stingers to Execute, Codex, UI events | Integration | 5.8, 5.9, 5.3 |

### Phase 7: Polish + Accessibility

| # | Task | Output | Depends On |
|---|------|--------|------------|
| 7.1 | Keyboard-only navigation audit | Tab/enter/escape through all flows | 5.10 |
| 7.2 | ARIA labels on all interactive elements | Screen reader compatible | 5.10 |
| 7.3 | Font scaling toggle (100/125/150) | Font size selector | 5.11 |
| 7.4 | `prefers-reduced-motion` compliance | No transitions when set | 5.10 |
| 7.5 | Colorblind-safe palette audit | All archetype accents distinguishable | 5.10 |
| 7.6 | Daily seed mode (UTC-based seed) | Same seed for all players | 4.3 |
| 7.7 | Build saver (name + bookmark builds) | Browseable in codex | 4.1, 5.9 |

---

## 7. Determinism Contract

### Requirement

```
same seed + same archetype + same draft sequence → byte-identical run
```

This means:
- Same constellation layout
- Same store rolls each turn
- Same encounter profiles
- Same RNG outcomes for crits, evasion, etc.
- Same combat log text
- Same share string

### Enforcement

1. **Single RNG instance.** `createRNG(seed + archetype)` at run start. All randomness flows through this one instance. `Math.random()` is banned in `/game`.

2. **RNG state advances deterministically.** Every call to `rng.next()` consumes one step. The sequence is fixed for a given seed. Draft order matters: buying items before/after a node changes subsequent rolls because RNG state advances differently.

3. **Draft sequence is the only player-controlled input.** Store is re-rolled each turn regardless of player actions — the RNG advances to the store generation point, then pauses for player input. However, if the player buys an item, the store doesn't re-roll. The RNG only advances for:
   - Store generation (once per turn, at DRAFT phase start)
   - Encounter generation (once per forecast, at FORECAST phase)
   - Resolution (crits, evasion, ability order — all deterministic from seed)

4. **Replay:** A share string can be deserialized into a full `RunState` and stepped through turn-by-turn, reproducing every combat log line exactly.

5. **Testing:** Every pure function in `/game` takes RNG state as input and produces deterministic output. Tests verify:
   - Same inputs → same outputs
   - Different seeds → different outputs
   - Specific seed + draft = specific threshold outcome

---

## 8. Implementation Rules

1. **All game logic is pure.** State in, new state out. No side effects in `/game`. No `localStorage`, no `fetch`, no `Math.random()`, no `Date.now()`.

2. **All randomness through one injected RNG instance.** `Math.random()` is banned in `/game`. Use `rng.next()` exclusively.

3. **State mutations only via Zustand actions.** Components dispatch actions (`useGameStore.getState().purchaseNode(id)`) — they never mutate state directly.

4. **Every file < 200 lines.** Split aggressively. Preferred: one export per file in `/game`, one component per file in `/components`.

5. **Every game-logic function has a Vitest spec.** Tests live in `/tests/` mirroring the source structure.

6. **NO HP. The threshold check is binary PASS/FAIL.** Failing ends the run immediately. Do not introduce health, damage-taken, regen, or partial survival mechanics. If the design seems to require them, stop and ask.

7. **Determinism is non-negotiable.** Any non-determinism is a bug. All `number` operations use integer math where possible; floating-point operations are tested for cross-platform consistency.

8. **No React imports in `/game`.** Pure TypeScript only. This keeps the engine portable and testable.

9. **Zod validation on all persistence boundaries.** Save/load from localStorage must validate schema version and structure before restoring state.

10. **Node IDs and item IDs are stable strings.** Never generate them dynamically — they're hard-coded in data files. This ensures share strings remain valid across game versions.
