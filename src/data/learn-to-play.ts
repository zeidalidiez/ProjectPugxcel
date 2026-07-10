export interface LearnStep {
  title: string
  kicker: string
  body: string[]
  callout?: string
}

/** Main-menu tutorial steps: turn loop + systems briefing. */
export const LEARN_STEPS: LearnStep[] = [
  {
    title: 'Mission Brief',
    kicker: 'What this game is',
    body: [
      'Project Antigravity is a talent-tree roguelike. The constellation skill tree IS the game.',
      'There is no HP bar and no combat to micro. Each turn you assemble a build, then face a brutal threshold check.',
      'Clear the threshold → PASS and keep drafting. Fall short → FAIL and the run ends. Binary. Precise. Brutal.',
    ],
    callout: 'Build craft is the whole loop. Tension lives in planning — never in resolution.',
  },
  {
    title: 'The Turn Loop',
    kicker: 'How a turn works',
    body: [
      'Every turn cycles through three beats:',
      '1. FORECAST — gold deposits, threat radar lights up, you read the encounter.',
      '2. DRAFT — buy one constellation node (required pick) and any items you can afford.',
      '3. EXECUTE — damage resolves against the threshold. PASS advances; FAIL ends the run.',
    ],
    callout: 'Keyboard: Enter or Space advances phases. Look for [Enter / Space] hints.',
  },
  {
    title: 'Forecast',
    kicker: 'Read before you spend',
    body: [
      'Gold from the previous turn deposits when Forecast begins. Check your bank before drafting.',
      'The threat radar and heatmap show what the encounter punishes — armor, evasion, stamina drain, bosses.',
      'Boss turns hit every 5 turns (and a final boss on turn 20). Plan extra power for those spikes.',
    ],
    callout: 'Press BEGIN DRAFTING when you understand the threat and are ready to spend.',
  },
  {
    title: 'Draft — Constellation',
    kicker: 'The galaxy map',
    body: [
      'The map is a procedural ring-based skill tree unique to your seed and archetype.',
      'Green, breathing nodes are reachable and purchasable. You need an origin path from nodes you already own.',
      'Each draft: spend gold on 1 node (LCK discounts cost). Anchors (★) are high-value hubs. Mutex pairs force a choice.',
      'Pan and zoom the constellation. Distant rings stay dim until you illuminate a path toward them.',
    ],
    callout: 'Structural nodes (conditional, mutex, anti-synergy, threshold) reward careful routing.',
  },
  {
    title: 'Draft — Store & Gear',
    kicker: 'Items and slots',
    body: [
      'During Draft you can also open the store and buy equipment for HEAD, BODY, PAWS, and ARTIFACT.',
      'Items add stats, weapon multipliers, resistance bypasses, and sometimes abilities.',
      'Gold is tight — sometimes the right node beats a shiny item. Sometimes gear saves a boss turn.',
    ],
    callout: 'You must take your node pick, then press EXECUTE when your build is ready.',
  },
  {
    title: 'Execute & Stinger',
    kicker: 'PASS or FAIL',
    body: [
      'On Execute, the game computes your total damage against the encounter threshold.',
      'Damage comes from primary stat × weapon mult, attack count from AGI, crits from LCK, plus stamina abilities.',
      'Results: PASS / BARELY PASS / BARELY FAIL / FAIL (and BOSS PASS on boss clears). No partial survival.',
      'Surviving deposits gold next Forecast and ramps the curve. Turn 20 is the final boss.',
    ],
    callout: 'Power Preview on the HUD estimates your damage before you commit.',
  },
  {
    title: 'Stats & Archetypes',
    kicker: 'What to stack',
    body: [
      'STR — base damage per hit; pierces armor. Sporgk primary.',
      'AGI — attack count: floor(1 + AGI/5). Elf primary.',
      'STA — stamina pool for abilities: 10 + STA/2.',
      'INT — Vampire primary; bypasses armor, evasion, and INT resist.',
      'LCK — crit chance (2%/pt, cap 50%) and gold discounts (1.5%/pt). Snowball fuel.',
    ],
    callout: 'Pick Sporgk (brute force), Elf (late LCK snowball), or Vampire (INT synergy puzzle).',
  },
  {
    title: 'Meta Systems',
    kicker: 'Beyond one run',
    body: [
      'Difficulty presets (Easy → Nightmare) and Custom weights change rings, density, economy, and thresholds.',
      'Codex unlocks meta-modifiers across runs — permanent tools for future seeds.',
      'Daily seed is shared. Share strings let others replay a deterministic run byte-for-byte.',
      'Same seed + archetype + weights + draft sequence = identical outcome. Determinism is the community layer.',
    ],
    callout: 'Ready? Close this briefing, pick an archetype, and begin drafting.',
  },
]
