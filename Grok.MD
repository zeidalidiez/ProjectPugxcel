```markdown
# grok.MD - Constellation Readability & Scalability Upgrade Plan
**Project:** ProjectPugxcel (branch: `feat/radial-constellation`)  
**Goal:** Make the galaxy/constellation map dramatically more complex (higher node count, more rings, denser outer rings) while keeping it **highly readable** on screen.  
**Target Audience for this file:** DeepSeek (or any strong coding LLM). Execute exactly as written.

---

## 1. Executive Summary
The current radial layout in `src/game/constellation/layout/radial.ts` works well for normal difficulty but becomes cramped when you increase `nodeDensity`, ring count, or threats. The viewport in `src/components/ConstellationViewport.tsx` also starts zoomed too aggressively.

**Core changes (in order of execution):**
1. Immediate viewport improvements (instant visual win).
2. Tune layout constants for better node spacing.
3. Add optional light spring-force / global spread pass (for future-proofing very dense galaxies).
4. Minor UI polish (node size, edge thickness, labels).
5. Update balance presets and procedural generation to safely use higher complexity.

All changes must remain **100% deterministic** (same seed → identical layout) and respect the existing `weights` system.

---

## 2. Step-by-Step Implementation Instructions

### Step 2.1: Improve Initial Viewport Scaling & Centering (Highest Priority)
**File to edit:** `src/components/ConstellationViewport.tsx`

**Granular instructions:**
1. Locate the `useLayoutEffect` (or equivalent) that runs when the component mounts and calculates initial `offset` and `scale`.
2. Replace the current hard-coded centering logic with the following improved version:

```tsx
// Inside the useLayoutEffect or wherever initial offset/scale is set
const rect = containerRef.current.getBoundingClientRect();
const svgW = 1600; // current logical canvas width (keep if already defined)
const svgH = 900;  // current logical canvas height

// Better initial centering + scale
const idealScale = Math.min(
  rect.width / (svgW * 1.15),
  rect.height / (svgH * 1.15)
);
const newScale = Math.max(0.75, Math.min(1.25, idealScale)); // 0.75-1.25 range feels great

setOffset({ 
  x: rect.width / 2 - (svgW / 2) * newScale,
  y: rect.height / 2 - (svgH / 2) * newScale 
});
setScale(newScale);
```

3. Add a small comment above it:  
   `// GROK: Dynamic fit-to-viewport for larger/more complex constellations`

4. If there is already a `setScale(0.6)` or similar hard-coded value, replace it entirely with the dynamic version above.

**Expected result:** Map instantly looks bigger and more breathable on most screen sizes.

### Step 2.2: Tune Radial Layout Constants for Better Spreading
**File to edit:** `src/game/constellation/layout/radial.ts`

**Granular instructions:**
1. Find the top-level constants section (near the top of the file, usually right after imports).
2. Update **exactly** these constants to the new values below (do not change any other constants unless noted):

```ts
const CENTER_X = 800;
const CENTER_Y = 450;
const RADIUS_STEP = 130;          // ← was ~90 → much more ring separation
const JITTER_DEG = 8;             // keep or increase to 10 if you want more organic feel
const MIN_DIST = 75;              // ← was ~50 → stronger minimum node separation
const REPULSION_PASSES = 5;       // ← was ~3 → more iterations of push-apart
const MAX_FORWARD_EDGES = 3;      // keep
const LATERAL_CHANCE = 0.3;       // keep
```

3. Inside the `layoutRadial` function, after the existing repulsion loop (the one that uses `MIN_DIST`), **add** this new light spring-force pass (place it immediately after the repulsion loop):

```ts
// GROK: Light edge-based spring forces for even better organic spreading
for (let pass = 0; pass < 2; pass++) {
  for (const cn of resultNodes.values()) {
    for (const targetId of cn.edges) {
      const target = resultNodes.get(targetId);
      if (!target) continue;
      const d = dist(cn, target); // assume dist helper exists; use existing distance logic if named differently
      if (d > 0) {
        const ideal = RADIUS_STEP * 0.75; // ideal edge length
        const force = (d - ideal) * 0.15;
        const nx = (target.x - cn.x) / d;
        const ny = (target.y - cn.y) / d;
        cn.x = Math.round(cn.x + nx * force);
        cn.y = Math.round(cn.y + ny * force);
        target.x = Math.round(target.x - nx * force);
        target.y = Math.round(target.y - ny * force);
      }
    }
  }
}
```

4. At the **very end** of `layoutRadial` (right before returning the result), add a global spread multiplier:

```ts
// GROK: Final global spread factor - makes dense galaxies feel galactic
const SPREAD_FACTOR = 1.25;
for (const node of resultNodes.values()) {
  node.x = Math.round(node.x * SPREAD_FACTOR);
  node.y = Math.round(node.y * SPREAD_FACTOR);
}
```

**Why these numbers?**  
- `RADIUS_STEP = 130` gives outer rings dramatically more room.  
- `MIN_DIST + REPULSION_PASSES` prevents nodes from clumping.  
- Spring pass + spread factor future-proofs for 100+ node galaxies.

### Step 2.3: Minor UI Polish (Readability Boost)
**Files to edit:**
- `src/components/ConstellationNode.tsx` (or wherever node buttons are rendered)
- `src/game/constellation/render/edges.ts` (or the SVG edge drawing logic)

**Instructions:**
1. In the node component:
   - Change node size from `w-9 h-9` → `w-10 h-10`
   - Change label text from `text-[9px]` → `text-xs`
2. In edge rendering:
   - Unpurchased edges: `strokeWidth` = `0.8`
   - Purchased edges: `strokeWidth` = `3.5`
   - Optional: add a faint glow (`filter: drop-shadow`) on purchased nodes/edges for extra pop.

### Step 2.4: Safely Increase Galaxy Complexity
**Files to edit:**
- `src/game/constellation/procedural.ts` (or wherever `generateNodes` / node generation lives)
- `src/data/balance-presets.ts` (or equivalent balance file)

**Instructions:**
1. Increase base values:
   - `ringCount`: from current (probably 5-7) → **8-10**
   - `nodeDensity` multiplier: from 1.0 (Normal) → **1.4-1.8** on higher difficulties
2. Make sure the procedural generator still calls `layoutRadial` with the updated weights.

---

## 3. Testing & Validation Checklist (Run After Every Change)
- [ ] Same seed produces **identical** layout before/after changes (determinism test).
- [ ] Load Normal difficulty → map should feel noticeably more spacious.
- [ ] Load highest difficulty → outer rings no longer overlap or become unreadable.
- [ ] Zoom in/out still works smoothly.
- [ ] Node click targets remain accurate.
- [ ] No new console errors or layout shifts.

## 4. Optional Future Enhancements (Only After Core Changes Work)
- Add a "Fit to Screen" button in the UI.
- Expose `RADIUS_STEP`, `SPREAD_FACTOR`, etc. as balance variables in `balance-presets.ts`.
- Implement a hybrid force-directed fallback for extremely high node counts (>120 nodes).

---

**Commit message template (use after all changes):**
`feat(constellation): vastly improve radial layout readability & support much denser galaxies (Grok plan)`

This file is **complete and self-contained**. Feed it directly to DeepSeek (or Claude/GPT-4o) and ask it to implement the changes one file at a time, showing you the diff for each step.

Let me know when the changes are merged and I’ll help you tune the exact numbers even further!
```

**How to use this file:**
1. Copy everything above (including the front-matter) into a new file called `grok.MD` in your project root.
2. Paste the entire contents into DeepSeek (or your preferred LLM).
3. Tell the LLM: “Implement the plan in grok.MD exactly as written, one step at a time, and show me the git diff for each file before committing.”

This gives DeepSeek crystal-clear, granular instructions with exact code snippets and rationale — exactly what you asked for! 🚀