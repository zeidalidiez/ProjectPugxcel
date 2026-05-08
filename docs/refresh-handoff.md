# Visual Refresh — Implementation Handoff ("Astral Terminal v2")

A text-only specification for the visual refresh. The acting code agent (DeepSeek V4 Pro) cannot read images; everything below describes the design verbosely enough to implement without visual reference.

The design tokens live in `src/styles/tokens.css` (already in repo). This doc covers layout, component-by-component visual contracts, and the implementation order.

---

## Design system summary

- **Aesthetic:** "Astral Terminal v2" — editorial dark mode with atmospheric depth. Reference quality: Linear / Vercel / Stripe dashboards. Anti-references: neon glow, holographic effects, sci-fi UI overlays, circuit patterns. None of those.
- **Typography:** Major Mono Display for hero titles, big numbers, archetype names, and the EXECUTE ROUND action button. Orbitron is the fallback for places where MMD looks too cramped (specific places noted below). JetBrains Mono / IBM Plex Mono for terminal-style labels and per-character log output. Inter (or system humanist sans) for body text and descriptions.
- **Color discipline:** Use semantic colors with intent. Gold ONLY for currency. Archetype accent ONLY for active actions, focus, and the player's "team color". Green ONLY for power/positive. Red ONLY for danger/threats. Mid-gray for inactive/locked. Bright white for primary text. The current state of the codebase uses light blue for everything — that's the bug; replace with the semantic tokens.
- **Motion:** subtle drift only. Background particles drift slowly. Hover states use micro-shimmers/flashes. Phase transitions are fast (motion-base = 160ms). All animations honor `prefers-reduced-motion`.
- **Per-archetype theming:** the entire visual identity switches based on a `data-archetype="sporgk|elf|vampire"` attribute on `document.documentElement`. The tokens.css file handles all the token swaps; consumers just need to use the CSS variables instead of hardcoded values.

---

## Per-archetype visual identity

The tokens that change per archetype, plus what they affect:

| Token | Sporgk | Elf | Vampire | Affects |
|---|---|---|---|---|
| `--accent` | `#fb923c` warm copper-orange | `#22d3ee` cool cyan | `#a855f7` deep violet | Active states, focus rings, primary action button, available-node outline color |
| `--accent-glow` | rgba orange | rgba cyan | rgba violet | Glow halo on hover, anchor-node halos |
| `--radius-card` | `0` (sharp 90°) | `2px` (subtle bevel) | `4px` (soft round) | Archetype card corners, modal corners |
| `--background-mood-color` | orange | cyan | violet | Drift particle tint |
| `--background-mood-density` | 0.06 (denser) | 0.04 (sparser) | 0.05 (medium) | Drift particle frequency |

Plus three archetype-specific SVG glyphs (used both on the archetype card and as anchor nodes in the constellation):

| Archetype | Glyph |
|---|---|
| Sporgk | 4-point spiked star with jagged edges (rough hewn, brutal) |
| Elf | 6-point compass star (clean geometric, sharp angles) |
| Vampire | 4-point star with concentric halo ring (reverent, gothic) |

The same SVG component is used for both the card hero and the constellation anchor — just rendered at different sizes (~80px on card, ~22px in-tree).

**Hover micro-interactions per archetype** (subtle, ~200-300ms):
- Sporgk: brief flash (opacity bump then settle)
- Elf: soft shimmer (linear gradient sweep, very low opacity)
- Vampire: slow pulse (scale 1.0 → 1.03 → 1.0)

**Typography accent per archetype** (only on flavor/description text on the archetype card):
- Sporgk: heavier weight, all-caps emphasis on key words
- Elf: wider letter-spacing, lighter weight
- Vampire: italic flavor lines

---

## Layout — Archetype Select screen

Single-page screen, top-to-bottom:

### 1. Hero title section
- Centered.
- "PROJECT ANTIGRAVITY" in Major Mono Display caps, `--text-3xl`, white.
- Subtitle one line below: `> astral chart loaded. choose a vessel.` in dim gray (`--text-secondary`), JetBrains Mono, `--text-sm`. The leading `>` is part of the terminal flavor; keep it.

### 2. Difficulty pill row
- Single horizontal row, 5 evenly-spaced pills, centered. No orphan row.
- Pills: `EASY` / `NORMAL` / `HARD` / `NIGHTMARE` / `CUSTOM`.
- The pill for the currently-selected difficulty has `border: 1px solid var(--accent)` and a subtle inner glow (`box-shadow: inset 0 0 12px var(--accent-glow)`).
- Each pill has its main label in MMD (or Orbitron if MMD looks cramped at the small size — try MMD first, fall back to Orbitron) plus a tiny subtitle below in JetBrains Mono `--text-xs`:
  - EASY → "gentle ramp"
  - NORMAL → "designed experience"
  - HARD → "tight curve"
  - NIGHTMARE → "precision-only"
  - CUSTOM → "configure"
- **The difficulty pills are ONLY interactable on this screen.** Once a run starts, the difficulty is locked into the seed envelope; do not allow mid-run changes. After run start, the pill row should be hidden entirely (not just disabled).

### 3. Archetype cards row
- Three cards in a horizontal row, equal width.
- Each card structure (top to bottom):
  1. **Glyph area** (~80px tall): the archetype's SVG glyph centered, filled with `var(--accent)`, on a slightly darker panel background (`var(--surface-2)`). The glyph IS the same shape used for anchor nodes in-tree, just scaled up.
  2. **Title** in Major Mono Display, `--text-2xl`: SPORGK / SPACE PUG ELF / SPACE PUG VAMPIRE.
  3. **Subtitle** in body sans, `--text-sm`, `--text-secondary`: "The Asteroid Barbarian" / "The Crystalline Star-Farer" / "The Void Lord".
  4. **Description** in body sans, `--text-base`, `--text-primary`. One short sentence per archetype.
  5. **Stat badges row** at the bottom: small pills with the archetype's two primary stats (Sporgk: STR + STA; Elf: AGI + LCK; Vampire: INT + STA). Each badge has `var(--accent)` text on `var(--surface-3)` background, MMD font.
- **Card outer treatment:**
  - Border: `1px solid var(--accent)`.
  - Background: `var(--surface-1)`.
  - Corner radius: `var(--radius-card)` — Sporgk `0`, Elf `2px`, Vampire `4px`.
  - Hover: scale 1.02 + `box-shadow: var(--shadow-glow)`. When a card is hovered, the entire page's `data-archetype` attribute should temporarily switch to that archetype so the player previews the theme on hover. (Restore on mouseleave.)

### 4. Footer utility row
- Slim, low-priority, the visual weight of a footer.
- Left: `Daily Seed: daily_2026-5-8` in `--text-tertiary`, JetBrains Mono `--text-xs`.
- Right: a thin text input with placeholder `paste share string to replay…` and a small `REPLAY` button. Both use `--surface-2` background, `--border` outline.

### 5. Background atmosphere
- Body has a subtle radial gradient (already set in `tokens.css`).
- Sparse starfield as a CSS-rendered background: ~30 small white pixels at random positions, very low opacity (0.4-0.6). These do not need to drift on the archetype-select screen — only inside the run viewport.

---

## Layout — Main HUD (in-run)

Three-column desktop dashboard. Layout grid:

```
┌────────────────────────────────────────────────────────────────┐
│  TOP BAR (slim, ~56px tall)                                    │
├──────────┬──────────────────────────────────────┬──────────────┤
│  LEFT    │                                      │   RIGHT      │
│  PANEL   │      CENTER VIEWPORT (hero)          │   PANEL      │
│  ~280px  │      constellation                   │   ~280px     │
│          │                                      │              │
├──────────┴──────────────────────────────────────┴──────────────┤
│  BOTTOM ACTION BAR (full-width, ~80px tall)                    │
└────────────────────────────────────────────────────────────────┘
```

### Top bar
- Left: small archetype glyph (~24px, `var(--accent)` filled) + archetype name in Major Mono Display caps `--text-lg`.
- Center: phase indicator + turn counter. Active phase in MMD caps with an accent-colored 1px border around it (`DRAFT`), turn counter beside it in MMD (`TURN 1 / 20`).
- Right: gold coin icon + amount in `var(--color-gold)` MMD, `--text-lg`.
- Background: `var(--surface-1)` with a 1px bottom border `var(--border)`.

### Left panel — Stats + Equipment

**STATS section:**
- Header: `STATS` in JetBrains Mono caps `--text-xs`, `--text-secondary`.
- Five stat rows, one per stat (STR / AGI / STA / INT / LCK):
  - Layout per row: `[label][big number][progress bar]`.
  - Label: 3-letter stat code in JetBrains Mono `--text-sm`, `--text-secondary`.
  - Number: in Major Mono Display `--text-xl`, `--text-primary`.
  - Progress bar: horizontal, ~120px wide, fill represents value-out-of-30-cap. Fill color `var(--accent)`. Track color `var(--surface-3)`.

**EQUIPMENT section** (below STATS, separated by a 1px `var(--border)`):
- Header: `EQUIPMENT` in JetBrains Mono caps `--text-xs`, `--text-secondary`.
- Four slot rows (Head / Body / Paws / Artifact):
  - Layout: `[ghost icon][label][em-dash or item name]`.
  - Icon: 24px SVG ghost icon at reduced opacity (40%) when slot is empty, full opacity when filled.
  - Suggested ghost icons: helmet (Head), vest (Body), paw (Paws), gem (Artifact). Simple monochrome SVGs — no painterly art.
  - Label: slot name in JetBrains Mono `--text-sm`, `--text-secondary`.
  - Value: `—` em-dash when empty, item name + tier badge when filled. Replace the existing literal "Empty" string entirely.

### Center viewport — Constellation (Pixi)

This is the screen's hero. Replace the existing SVG/Canvas renderer with a Pixi.js application.

- **Canvas:** fills the available column width, ~600px tall. Background: `var(--surface-1)` with subtle drifting particles (see Background drift below).
- **Nodes:**
  - Minor nodes: rendered as filled circles. Radius from `--node-radius` (14).
    - Purchased: solid white fill (`#e8e8e8`).
    - Available (adjacent to purchased): hollow circle, 2px stroke in `var(--accent)`. Stroke is brighter than the surrounding lines so they pop.
    - Locked: dimmed gray (`#52525b`), low opacity (0.5).
  - Anchor nodes: rendered as the archetype's SVG glyph. Radius from `--node-anchor-radius` (22). Filled in `var(--accent)`, with a subtle outer halo (`drop-shadow` filter using `var(--accent-glow)`).
- **Lines:** thin 1px lines, `var(--node-line-color)`. When a line connects two purchased nodes, brighten to `var(--node-line-color-active)`.
- **Pan/zoom:** mouse drag to pan, mouse wheel to zoom. On touch: pinch to zoom, drag to pan.
- **Background drift:** ~40 small particles, color `var(--background-mood-color)`, opacity `var(--background-mood-density)`, drifting horizontally at 0.5-2 px/sec, wrapping around the viewport. **Honor `prefers-reduced-motion`: when set, particles are static.**
- **Top-right overlay:** `1 / 1 NODE PURCHASES REMAINING` in JetBrains Mono `--text-xs`, `--text-secondary`. Updates live with state.

### Right panel — Vertical Forecast

- Header: `FORECAST` in JetBrains Mono caps `--text-xs`, `--text-secondary`.
- Vertical stack of 5 tiles, top-to-bottom = T1 → T5.
- Each tile (~80px tall):
  - Label `T1` / `T2` / etc. in JetBrains Mono `--text-xs`.
  - Damage requirement: number in MMD `--text-lg`, then ` dmg` suffix in JetBrains Mono `--text-xs`.
  - Threat icons: small 16x16 SVG icons indicating the turn's damage type (kinetic / armored / resistant / etc.). Layout: top-right of the tile.
  - Border: 1px `var(--border)` for upcoming turns. The current turn has `1px solid var(--accent)`. Boss turns have `1px solid var(--color-danger)` and a `BOSS` badge in `var(--color-danger)` text.
  - Background: `var(--surface-2)`.
- The tile order is current-turn at top, then the next four upcoming turns. Once a turn passes, that tile drops off and the next turn rolls in from the bottom.

### Bottom action bar

- Full-width button. Height ~80px.
- Background: `var(--accent)` filled.
- Text: in Major Mono Display caps, `--text-2xl`, color `var(--surface-0)` (dark on accent).
- Label changes per phase:
  - During Forecast: `CONTINUE TO PAYOUT`
  - During Payout: `CONTINUE TO DRAFT`
  - During Draft: `EXECUTE ROUND`
- Hover: subtle brightness lift (filter: brightness(1.08)) plus the archetype's micro-interaction (flash / shimmer / pulse).

---

## Implementation order (commit-by-commit)

Each step its own commit; stop and report after step 4 so the human can sanity-check the typography pass before deeper layout changes.

1. **`feat(theme): add tokens.css design system`**
   Tokens already at `src/styles/tokens.css`. Import it from `src/main.tsx` BEFORE Tailwind directives.

2. **`feat(theme): set data-archetype attribute and typography baseline`**
   In the Zustand store, whenever `selectedArchetype` changes (including in `startRun`, `ArchetypeSelect.handleSelect`, and `ReplayViewer` init), set `document.documentElement.setAttribute('data-archetype', archetype)`. Default to `sporgk` before any run starts. Apply `font-family: var(--font-body)` to `body`. Apply `var(--font-display)` to all current `h1`/`h2`/`h3` elements and elements with class `.text-display` (add this class to big numbers in stats, action button labels, and titles).

3. **`refactor(ui): replace hardcoded colors with semantic tokens`**
   Find every hardcoded color in components (search for `#`, `bg-blue`, `text-blue`, `bg-zinc-9`, etc.) and replace:
   - blue accents (anything matching `#3b82f6`, `#60a5fa`, `text-blue-*`) → `var(--accent)`
   - background grays (`bg-zinc-900`, `#0a0a0a`) → `var(--surface-0)` for page, `var(--surface-1)` for panels
   - "Empty" literal string in equipment slots → em-dash + ghost icon
   - any blue progress bars → `var(--accent)` fill

4. **`feat(ui): apply MMD/Orbitron typography hierarchy`**
   Per the typography section above. Stop and report.

5. **`feat(ui): redesign ArchetypeSelect screen`**
   Per the Archetype Select layout section above. Add SVG glyph components in `src/components/icons/archetype-glyphs.tsx`. Implement hover-preview behavior (data-archetype temporarily switches on hover). Move difficulty pills above archetype cards in single row. Hide difficulty pills entirely after a run starts.

6. **`feat(ui): redesign Main HUD layout`**
   Per the Main HUD layout section above. Reorganize the right side: forecast becomes vertical. Stats panel uses progress bars + MMD numbers. Equipment uses ghost icons + em-dash. Top bar slimmed. Action button per phase.

7. **`feat(constellation): replace SVG renderer with Pixi.js`**
   Install `pixi.js`. Create a new `src/components/Constellation.tsx` that mounts a Pixi application. Read CSS variables for node radii, line colors, accent. Subscribe to archetype changes for re-render. Implement pan/zoom. Implement background drift particles (honor reduced-motion).

8. **`feat(ui): per-archetype anchor node glyphs`**
   The same SVG glyph components from step 5 are also used as anchor textures in the Pixi constellation. When the constellation generator mounts an anchor node, render the archetype's glyph instead of a generic star.

9. **`feat(ui): hover micro-interactions per archetype`**
   Add CSS keyframes for the three hover behaviors (flash / shimmer / pulse) and apply them via `data-archetype="..."` selectors.

10. **`test`** — run `npm test` (must stay green), `npm run typecheck` (must be clean), `npm run lint`. `npm run dev` and visually confirm the three archetypes look distinct.

After each commit, do not push to a branch — push directly to `main`. The user will review and revert any commit that's wrong.

---

## Reference: things to NOT do

- ❌ Don't introduce painterly hero illustrations or generated art for archetypes. The vector glyphs are the only archetype imagery.
- ❌ Don't use the legacy threshold formula `floor(50 * 1.18^(turn-1))`. Threshold is now weights-based via `computeThreshold(turn, weights)`.
- ❌ Don't hardcode any color in components. Always use the CSS variables.
- ❌ Don't introduce HP, regen, or partial-survival mechanics. Binary PASS/FAIL is locked.
- ❌ Don't change the layout structure differently per archetype. Layout is identical across all three; only colors/shapes/backgrounds differ.
- ❌ Don't add new dependencies beyond `pixi.js`.
