export interface EnemyTemplate {
  name: string
  flavorText: string
  tags: string[]
}

export const enemyNames: Record<string, EnemyTemplate[]> = {
  boss: [
    {
      name: 'Astral Galleon Prime',
      flavorText: 'The first war-vessel ever to sail the void — its hull remembers every extinction.',
      tags: ['ARMORED', 'RESISTANT'],
    },
    {
      name: 'Void Colossus',
      flavorText: 'A walking cathedral of compressed nothing, its footsteps leave permanent absences.',
      tags: ['ARMORED', 'VOID'],
    },
    {
      name: 'Crystalline Behemoth',
      flavorText: 'A living prism the size of a small moon, refracting doom across the spectrum.',
      tags: ['CRYSTALLINE', 'RESISTANT'],
    },
    {
      name: 'Warp-Nebula Kraken',
      flavorText: 'Tentacles of burning warp-plasma coil through the wreckage of a hundred freighters.',
      tags: ['KINETIC', 'ARMORED'],
    },
    {
      name: 'Entropy Archon',
      flavorText: 'A ruler from the heat-death epoch, here early to collect.',
      tags: ['VOID', 'STAMINA_DRAIN'],
    },
    {
      name: 'Stellar Annihilator',
      flavorText: 'This dreadnought has personally extinguished seventeen stars — and it is still hungry.',
      tags: ['KINETIC', 'RESISTANT'],
    },
    {
      name: 'Singularity Warden',
      flavorText: 'Guardian of the event horizon between victory and oblivion. It has never been passed.',
      tags: ['RESISTANT', 'EVASIVE'],
    },
    {
      name: 'The Last Basilica',
      flavorText: 'A void-cathedral so ancient its gods have forgotten it — but it has not forgotten them.',
      tags: ['ARMORED', 'EVASIVE'],
    },
  ],

  armored: [
    {
      name: 'Iron-Husk Corsair',
      flavorText: 'A raider vessel plated in salvaged dreadnought scraps, ugly and nearly indestructible.',
      tags: ['ARMORED'],
    },
    {
      name: 'Titanium Drift-Wreck',
      flavorText: 'Centuries of micro-meteor impacts have hammered its hull into a density few weapons can scratch.',
      tags: ['ARMORED'],
    },
    {
      name: 'Asteroid Battleplate',
      flavorText: 'Nickel-iron deposits from a dead world laminated into crude but effective combat armor.',
      tags: ['ARMORED', 'KINETIC'],
    },
    {
      name: 'Adamant Void-Shell',
      flavorText: 'Forged in the heart of a collapsing star, this plating laughs at conventional weaponry.',
      tags: ['ARMORED'],
    },
    {
      name: 'Null-Gravity Juggernaut',
      flavorText: 'Mass without weight — a physics-defying behemoth that absorbs impact like a black hole.',
      tags: ['ARMORED', 'VOID'],
    },
    {
      name: 'Hull-Crusher Barge',
      flavorText: 'A wedge of solid battle-steel designed for exactly one tactic: ram through and keep going.',
      tags: ['ARMORED', 'KINETIC'],
    },
  ],

  evasive: [
    {
      name: 'Nebula Wraith',
      flavorText: 'Visible only as a shimmer in the stardust — by the time you see it, it has already moved.',
      tags: ['EVASIVE'],
    },
    {
      name: 'Phase-Shifted Marauder',
      flavorText: 'Partially existing in a parallel dimension, this raider flickers between worlds mid-combat.',
      tags: ['EVASIVE', 'VOID'],
    },
    {
      name: 'Void-Skipper',
      flavorText: 'Skims the surface of reality like a stone across still water, never quite where you aim.',
      tags: ['EVASIVE'],
    },
    {
      name: 'Plasma Ghost',
      flavorText: 'A fighter consumed by its own engine-fire, now nothing but a vengeful heat signature.',
      tags: ['EVASIVE', 'KINETIC'],
    },
    {
      name: 'Starlight Shimmer',
      flavorText: 'Bends light around its crystalline hull until it becomes indistinguishable from the starfield.',
      tags: ['EVASIVE', 'CRYSTALLINE'],
    },
    {
      name: 'Echo-Skiff',
      flavorText: 'A small, impossibly fast scout vessel that leaves sensor ghosts in its wake.',
      tags: ['EVASIVE'],
    },
  ],

  resistant: [
    {
      name: 'Null-Spell Anchorite',
      flavorText: 'A void-monk who has renounced the material — your intellect unravels against its emptiness.',
      tags: ['RESISTANT'],
    },
    {
      name: 'Void-Dampened Colossus',
      flavorText: 'Its hull is lined with null-foam that absorbs psychic energy like a sponge.',
      tags: ['RESISTANT', 'VOID'],
    },
    {
      name: 'Aether-Scaled Wyrm',
      flavorText: 'An immense space-born serpent whose hide deflects both force and thought in equal measure.',
      tags: ['RESISTANT', 'ARMORED'],
    },
    {
      name: 'Psychic Bastion',
      flavorText: 'A fortress-ship crewed entirely by telepaths who deflect mental assaults before they land.',
      tags: ['RESISTANT'],
    },
    {
      name: 'Mind-Ward Frigate',
      flavorText: 'Every bulkhead is etched with anti-psionic sigils — your void-magic finds no purchase here.',
      tags: ['RESISTANT', 'EVASIVE'],
    },
  ],

  draining: [
    {
      name: 'Essence Leech',
      flavorText: 'A parasite-vessel that latches onto your stamina conduits and drinks without asking.',
      tags: ['STAMINA_DRAIN'],
    },
    {
      name: 'Vitality Siphoner',
      flavorText: 'Its hull is studded with feeding tendrils, each one hungry for the life-force of the living.',
      tags: ['STAMINA_DRAIN', 'VOID'],
    },
    {
      name: 'Lifeforce Reaver',
      flavorText: 'Every second in its presence costs you something essential — and it is in no hurry.',
      tags: ['STAMINA_DRAIN', 'ARMORED'],
    },
    {
      name: 'Drain-Well Spectre',
      flavorText: 'A ghost-ship crewed by the life-echoes of its previous victims, still thirsty.',
      tags: ['STAMINA_DRAIN', 'EVASIVE'],
    },
    {
      name: 'Exhaustion Field Cruiser',
      flavorText: 'Projects a zone of profound fatigue — even void-lords feel weary in its presence.',
      tags: ['STAMINA_DRAIN'],
    },
    {
      name: 'Hunger-Nebula Drifter',
      flavorText: 'Born in a cloud of cosmic hunger, this vessel has never known the feeling of being full.',
      tags: ['STAMINA_DRAIN', 'RESISTANT'],
    },
  ],

  mixed: [
    {
      name: 'Warp-Scavenger',
      flavorText: 'Picks through the debris of interstellar battles, its jury-rigged armor hiding surprising resilience.',
      tags: ['KINETIC', 'ARMORED'],
    },
    {
      name: 'Asteroid Husk',
      flavorText: 'The hollowed-out corpse of a minor planet, now a battle-station bristling with kinetic batteries.',
      tags: ['KINETIC', 'RESISTANT'],
    },
    {
      name: 'Void-Touched Corsair',
      flavorText: 'A raider that spent too long in the deep black — something else is riding in its hull.',
      tags: ['VOID', 'EVASIVE'],
    },
    {
      name: 'Dark Matter Shard',
      flavorText: 'A sliver of invisible mass given violent intent, it exists as a wound in local spacetime.',
      tags: ['VOID', 'RESISTANT'],
    },
    {
      name: 'Crystal Shard Sentinel',
      flavorText: 'A floating fortress of living crystal that sings in frequencies that shred armor.',
      tags: ['CRYSTALLINE', 'ARMORED'],
    },
    {
      name: 'Prism Knight Escort',
      flavorText: 'Bends all incoming fire into a rainbow of harmless light — and returns it with interest.',
      tags: ['CRYSTALLINE', 'EVASIVE'],
    },
    {
      name: 'Refracted Horror',
      flavorText: 'A shattered crystalline entity whose broken facets show a different nightmare from every angle.',
      tags: ['CRYSTALLINE', 'STAMINA_DRAIN'],
    },
    {
      name: 'Kinetic Reaver Outrider',
      flavorText: 'Fast, armored, and designed to strip its targets of combat endurance before the main fleet arrives.',
      tags: ['KINETIC', 'STAMINA_DRAIN', 'ARMORED'],
    },
  ],
}
