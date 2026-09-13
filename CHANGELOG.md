# NEXUS Website — Changelog

All notable changes to the NEXUS website project are documented here.
Changes are grouped by session and ordered from most recent to oldest.

---

## [Session 3] — 2026-09-13 (Current Session)

### Added
- **Cinematic Theme Transition System** — NEXUS signature LIGHT ↔ DARK curtain animation
  - `src/context/CinematicTransitionContext.tsx` *(new file)*
    - `CinematicTransitionProvider` manages `isTransitioning`, `pendingTheme`, `requestTransition`, `onTransitionComplete`
    - Synchronous ref-based debounce lock prevents overlapping transitions
    - No setTimeout delay on lock release — race condition eliminated
  - `src/components/motion/CinematicThemeTransition.tsx` *(new file)*
    - Two opaque panels (LEFT 50vw + RIGHT 50vw) slide in symmetrically from viewport edges
    - Panels meet at exact mathematical center — no gap, no overlap, no border-radius, no blur
    - NEXUS X logo appears at the seam as a visual seal
    - Three-beat sequence: CLOSE → X SEAL → OPEN
    - Theme state changes only while viewport is fully covered (zero flash guarantee)
    - Generation-counter abort model — superseded animation calls skip cleanup
    - `data-nexus-covering` attribute on `<html>` during covered phase
    - Module-level preload link for X logo — cache-warm before first click
    - `prefers-reduced-motion` fallback: instant opacity crossfade, no panel movement
  - **CSS Transition Suppression Rule** added to `src/index.css`
    - `html[data-nexus-covering] * { transition-property: none !important }`
    - Prevents page CSS color transitions from bleeding through as panels open

### Modified
- **`src/components/layout/ThemeToggle.tsx`**
  - Removed direct `toggleTheme()` / `setTheme()` calls
  - Now calls `requestTransition(targetTheme)` via `useCinematicTransition()`
  - Button has `disabled={isTransitioning}` — prevents double-trigger
- **`src/App.tsx`**
  - Wrapped ThemeProvider children in `CinematicTransitionProvider`
  - `<CinematicThemeTransition />` mounted at root level above all page content

### Timing Refinements (3 iterations)
| Constant       | v1      | v2      | v3 (final) |
|---------------|---------|---------|------------|
| Panel close   | 260 ms  | 420 ms  | 580 ms     |
| Panel open    | 260 ms  | 420 ms  | 580 ms     |
| Easing        | 0.76    | 0.65    | 0.55       |
| X fade-in     | 130 ms  | 160 ms  | 200 ms     |
| X hold        | 90 ms   | 140 ms  | 180 ms     |
| X fade-out    | 90 ms   | 120 ms  | 150 ms     |
| Total         | ~800 ms | ~1280 ms| ~1750 ms   |

---

## [Session 2] — 2026-09-13 (Earlier)

### Added
- `src/assets/cn/coding_ninjas_dark_clean.png` *(new asset)* — transparent dark-mode logo
- `src/assets/cn/coding_ninjas_light_clean.png` *(new asset)* — transparent light-mode logo
  - Both generated via Python/PIL to remove opaque backgrounds

### Modified
- **`src/components/layout/Footer.tsx`**
  - Removed duplicate second footer structure — site now has exactly one footer
  - Integrated Coding Ninjas column into existing 5-column grid:
    `[NEXUS] [NAVIGATION] [SOCIALS] [CAMPUS] [CODING NINJAS]`
  - Dynamic theme-aware logo switching via `useTheme()`:
    - Dark mode → `coding_ninjas_dark_clean.png`
    - Light mode → `coding_ninjas_light_clean.png`
  - Fixed missing `import { AppRoute } from '../../types.ts'`
  - Fixed NEXUS branding and Coding Ninjas logo visibility in both themes
  - Alignment pass: Coding Ninjas column respects same margins as other columns

---

## [Session 1] — 2026-09-13 (Earliest)

### Modified
- **`src/components/about/NexusOrbitingSparkle.tsx`**
  - Fixed asymmetrical petal geometry on About page orbital sparkle element
  - Replaced ad-hoc SVG path with mathematically precise symmetric path
  - Enforced 4-fold rotational symmetry — each petal is geometrically identical
  - Enhanced astroid star center for visual crispness
  - No changes to animation timing, orbit behavior, or component API

---

## Conventions

- `*(new file)*` — file did not exist before this change
- `*(new asset)*` — binary asset added to the project
- All changes preserve: page layouts, typography, navigation, routing,
  existing animations, component APIs, and theme persistence via localStorage
