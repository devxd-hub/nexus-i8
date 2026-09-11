/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * NEXUS OFFICIAL PIXEL-ART PENGUIN MASCOT
 * Canonical 20x24 Pixel Grid
 *
 * Visual Style:
 * - Editorial Pixel Art: Sophisticated, clean, retro-modern
 * - Palette:
 *   - Near-black / Charcoal coat: #151311, #0D0C0B, #2C2925
 *   - Warm cream belly & face: #F3EEE5, #DDD6C9
 *   - NEXUS Orange: #EF5A2A, #FF7D4F, #CC4618
 *   - Pure crisp glints: #FFFFFF
 *   - Deep pupil: #0A0A09
 * - Signature Detail:
 *   - A tiny NEXUS Orange X emblem on the upper cream chest
 * - Anatomical Consistency:
 *   - Locked proportions, recognizable beak, expressive eyes, grounded feet
 */

export const PENGUIN_COLORS: Record<string, string> = {
  '.': 'transparent',
  K: '#151311', // Primary Charcoal Coat
  D: '#0D0C0B', // Coat Shadow
  S: '#2C2925', // Subtle Rim Highlight
  W: '#FFFFFF', // Eye Glint / Pure White
  C: '#F3EEE5', // Warm Cream Face & Belly
  G: '#DDD6C9', // Warm Cream Shading
  O: '#EF5A2A', // NEXUS Signature Orange (Beak, Emblem, Feet)
  L: '#FF7D4F', // Orange Highlight
  F: '#CC4618', // Orange Shadow / Edge
  E: '#0A0A09', // Deep Pupil
  R: '#EF5A2A', // Pixel Heart / Accent Orange-Red
};

export type PenguinFrameKey =
  | 'idle'
  | 'blink'
  | 'happy'
  | 'curious'
  | 'look_left'
  | 'look_right'
  | 'look_up'
  | 'surprised'
  | 'wave'
  | 'wave_smile'
  | 'peek_bottom'
  | 'peek_bottom_happy'
  | 'peek_right'
  | 'inspect'
  | 'admire'
  | 'shy'
  | 'walk_1'
  | 'walk_2'
  | 'nexus_touch'
  | 'struggle_start'
  | 'struggle_left'
  | 'struggle_right'
  | 'struggle_up'
  | 'struggle_down'
  | 'recover'
  | 'annoyed';

// 20 columns wide x 24 rows tall
export const PENGUIN_FRAMES: Record<PenguinFrameKey, string[]> = {
  // 1. IDLE: Balanced, grounded, expressive eyes, tiny orange X chest emblem
  idle: [
    "......SSSSSSSS......",
    "....SKKKKKKKKKKS....",
    "...SKKKKKKKKKKKKS...",
    "..SKKKKKKKKKKKKKKS..",
    "..SKKWWWKKKKWWWKKS..",
    ".SKKWEEWKKKKWEEWKKS.",
    ".SKKEEEEKKKKEEEEKKS.",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCCOOOOCCCKKS..",
    "..SKKKKKOOOOKKKKS...",
    "...SKKKKKKKKKKKKS...",
    "..SKKKCCCCCCCCKKS...",
    ".SKKKCC.O.O.CCKKKS..",
    ".SKKCCC..O..CCCKKS..",
    ".SKKCCC.O.O.CCCKKS..",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKGGCCCCCCCCGGKKS.",
    "..SKKGGGGGGGGGGKKS..",
    "...SKKKKKKKKKKKKS...",
    "....SOOOOOOOOOOS....",
    "...LOOOOO..OOOOOL...",
    "...FOOOOO..OOOOOF...",
    "...................."
  ],

  // 2. BLINK: Relaxed closed eyelids (straight pixel line)
  blink: [
    "......SSSSSSSS......",
    "....SKKKKKKKKKKS....",
    "...SKKKKKKKKKKKKS...",
    "..SKKKKKKKKKKKKKKS..",
    "..SKKKKKKKKKKKKKKS..",
    ".SKKEEEEKKKKEEEEKKS.",
    ".SKKKKKKKKKKKKKKKKS.",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCCOOOOCCCKKS..",
    "..SKKKKKOOOOKKKKS...",
    "...SKKKKKKKKKKKKS...",
    "..SKKKCCCCCCCCKKS...",
    ".SKKKCC.O.O.CCKKKS..",
    ".SKKCCC..O..CCCKKS..",
    ".SKKCCC.O.O.CCCKKS..",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKGGCCCCCCCCGGKKS.",
    "..SKKGGGGGGGGGGKKS..",
    "...SKKKKKKKKKKKKS...",
    "....SOOOOOOOOOOS....",
    "...LOOOOO..OOOOOL...",
    "...FOOOOO..OOOOOF...",
    "...................."
  ],

  // 3. HAPPY: (^ ‿ ^) Smiling curved eyes, cheerful wing lift
  happy: [
    "......SSSSSSSS......",
    "....SKKKKKKKKKKS....",
    "...SKKKKKKKKKKKKS...",
    "..SKKKKKKKKKKKKKKS..",
    "..SKKWWKKKKKKWWKKS..",
    ".SKKWEEWKKKKWEEWKKS.",
    ".SKKEEEEKKKKEEEEKKS.",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCCOOOOCCCKKS..",
    "..SKKKKKOOOOKKKKS...",
    "...SKKKKKKKKKKKKS...",
    ".SSKKKCCCCCCCCKKSS..",
    "SKKKKCC.O.O.CCKKKKS.",
    ".SKKCCC..O..CCCKKS..",
    ".SKKCCC.O.O.CCCKKS..",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKGGCCCCCCCCGGKKS.",
    "..SKKGGGGGGGGGGKKS..",
    "...SKKKKKKKKKKKKS...",
    "....SOOOOOOOOOOS....",
    "...LOOOOO..OOOOOL...",
    "...FOOOOO..OOOOOF...",
    "...................."
  ],

  // 4. CURIOUS: Inquiring head tilt, one brow/eye slightly raised
  curious: [
    "........SSSSSSSS....",
    "......SKKKKKKKKKKS..",
    ".....SKKKKKKKKKKKKS.",
    "....SKKKKKKKKKKKKKKS",
    "...SKKWWWKKKKWWWKKKS",
    "..SKKWEEWKKKKWEEWKKS",
    "..SKKEEEEKKKKEEEEKKS",
    "..SKKCCCC....CCCCKKS",
    "..SKKCCCCOOOOCCCKKKS",
    "...SKKKKKOOOOKKKKS..",
    "....SKKKKKKKKKKKKS..",
    "...SKKKCCCCCCCCKKS..",
    "..SKKKCC.O.O.CCKKKS.",
    "..SKKCCC..O..CCCKKS.",
    "..SKKCCC.O.O.CCCKKS.",
    "..SKKCCCCCCCCCCCCKKS",
    "..SKKCCCCCCCCCCCCKKS",
    "..SKKGGCCCCCCCCGGKKS",
    "...SKKGGGGGGGGGGKKS.",
    "....SKKKKKKKKKKKKS..",
    ".....SOOOOOOOOOOS...",
    "....LOOOOO..OOOOOL..",
    "....FOOOOO..OOOOOF..",
    "...................."
  ],

  // 5. LOOK LEFT: Eyes tracking left toward content
  look_left: [
    "......SSSSSSSS......",
    "....SKKKKKKKKKKS....",
    "...SKKKKKKKKKKKKS...",
    "..SKKKKKKKKKKKKKKS..",
    "..SKWEEWKKKKWEEWKKS.",
    ".SKKWEEWKKKKWEEWKKS.",
    ".SKKEEEEKKKKEEEEKKS.",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCCOOOOCCCKKS..",
    "..SKKKKKOOOOKKKKS...",
    "...SKKKKKKKKKKKKS...",
    "..SKKKCCCCCCCCKKS...",
    ".SKKKCC.O.O.CCKKKS..",
    ".SKKCCC..O..CCCKKS..",
    ".SKKCCC.O.O.CCCKKS..",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKGGCCCCCCCCGGKKS.",
    "..SKKGGGGGGGGGGKKS..",
    "...SKKKKKKKKKKKKS...",
    "....SOOOOOOOOOOS....",
    "...LOOOOO..OOOOOL...",
    "...FOOOOO..OOOOOF...",
    "...................."
  ],

  // 6. LOOK RIGHT: Eyes tracking right toward content
  look_right: [
    "......SSSSSSSS......",
    "....SKKKKKKKKKKS....",
    "...SKKKKKKKKKKKKS...",
    "..SKKKKKKKKKKKKKKS..",
    "..SKKWWEEKKKKWWEEKKS",
    ".SKKKWWEEKKKKWWEEKKS",
    ".SKKKEEEEKKKKEEEEKKS",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCCOOOOCCCKKS..",
    "..SKKKKKOOOOKKKKS...",
    "...SKKKKKKKKKKKKS...",
    "..SKKKCCCCCCCCKKS...",
    ".SKKKCC.O.O.CCKKKS..",
    ".SKKCCC..O..CCCKKS..",
    ".SKKCCC.O.O.CCCKKS..",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKGGCCCCCCCCGGKKS.",
    "..SKKGGGGGGGGGGKKS..",
    "...SKKKKKKKKKKKKS...",
    "....SOOOOOOOOOOS....",
    "...LOOOOO..OOOOOL...",
    "...FOOOOO..OOOOOF...",
    "...................."
  ],

  // 7. LOOK UP: Eyes looking upward toward page/cursor
  look_up: [
    "......SSSSSSSS......",
    "....SKKWEEWKKWEEKS..",
    "...SKKKEEEEKKEEEKS..",
    "..SKKKKKKKKKKKKKKS..",
    "..SKKWWWKKKKWWWKKS..",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCCOOOOCCCKKS..",
    "..SKKKKKOOOOKKKKS...",
    "...SKKKKKKKKKKKKS...",
    "..SKKKCCCCCCCCKKS...",
    ".SKKKCC.O.O.CCKKKS..",
    ".SKKCCC..O..CCCKKS..",
    ".SKKCCC.O.O.CCCKKS..",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKGGCCCCCCCCGGKKS.",
    "..SKKGGGGGGGGGGKKS..",
    "...SKKKKKKKKKKKKS...",
    "....SOOOOOOOOOOS....",
    "...LOOOOO..OOOOOL...",
    "...FOOOOO..OOOOOF...",
    "...................."
  ],

  // 8. SURPRISED: Widened eyes, open beak
  surprised: [
    "......SSSSSSSS......",
    "....SKKKKKKKKKKS....",
    "...SKKKKKKKKKKKKS...",
    "..SKKKKKKKKKKKKKKS..",
    "..SKKWWEWKKKKWWEWKKS",
    ".SKKWEEWWKKKKWEEWWKS",
    ".SKKEEEEKKKKEEEEKKS.",
    ".SKKCCCC....CCCCBKKS",
    "..SKKCCCOOOOCCCKKS..",
    "..SKKKKOOOOOOKKKKS..",
    "...SKKKKFOOFKKKKKS..",
    "..SKKKCCCCCCCCKKS...",
    ".SKKKCC.O.O.CCKKKS..",
    ".SKKCCC..O..CCCKKS..",
    ".SKKCCC.O.O.CCCKKS..",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKGGCCCCCCCCGGKKS.",
    "..SKKGGGGGGGGGGKKS..",
    "...SKKKKKKKKKKKKS...",
    "....SOOOOOOOOOOS....",
    "...LOOOOO..OOOOOL...",
    "...FOOOOO..OOOOOF...",
    "...................."
  ],

  // 9. WAVE: Right wing raised high in a friendly greeting
  wave: [
    "......SSSSSSSS...SS.",
    "....SKKKKKKKKKKS.SKK",
    "...SKKKKKKKKKKKKS.KK",
    "..SKKKKKKKKKKKKKKSKK",
    "..SKKWWWKKKKWWWKKSKK",
    ".SKKWEEWKKKKWEEWKKKK",
    ".SKKEEEEKKKKEEEEKKS.",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCCOOOOCCCKKS..",
    "..SKKKKKOOOOKKKKS...",
    "...SKKKKKKKKKKKKS...",
    "..SKKKCCCCCCCCKKS...",
    ".SKKKCC.O.O.CCKKKS..",
    ".SKKCCC..O..CCCKK...",
    ".SKKCCC.O.O.CCCKK...",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKGGCCCCCCCCGGKKS.",
    "..SKKGGGGGGGGGGKKS..",
    "...SKKKKKKKKKKKKS...",
    "....SOOOOOOOOOOS....",
    "...LOOOOO..OOOOOL...",
    "...FOOOOO..OOOOOF...",
    "...................."
  ],

  // 10. WAVE SMILE: Friendly waving with smiling eyes
  wave_smile: [
    "......SSSSSSSS...SS.",
    "....SKKKKKKKKKKS.SKK",
    "...SKKKKKKKKKKKKS.KK",
    "..SKKKKKKKKKKKKKKSKK",
    "..SKKWWKKKKKKWWKKSKK",
    ".SKKWEEWKKKKWEEWKKKK",
    ".SKKEEEEKKKKEEEEKKS.",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCCOOOOCCCKKS..",
    "..SKKKKKOOOOKKKKS...",
    "...SKKKKKKKKKKKKS...",
    "..SKKKCCCCCCCCKKS...",
    ".SKKKCC.O.O.CCKKKS..",
    ".SKKCCC..O..CCCKK...",
    ".SKKCCC.O.O.CCCKK...",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKGGCCCCCCCCGGKKS.",
    "..SKKGGGGGGGGGGKKS..",
    "...SKKKKKKKKKKKKS...",
    "....SOOOOOOOOOOS....",
    "...LOOOOO..OOOOOL...",
    "...FOOOOO..OOOOOF...",
    "...................."
  ],

  // 11. PEEK BOTTOM: Top half peeking shyly from bottom edge
  peek_bottom: [
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
    "......SSSSSSSS......",
    "....SKKKKKKKKKKS....",
    "...SKKKKKKKKKKKKS...",
    "..SKKKKKKKKKKKKKKS..",
    "..SKKWWWKKKKWWWKKS..",
    ".SKKWEEWKKKKWEEWKKS.",
    ".SKKEEEEKKKKEEEEKKS.",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCCOOOOCCCKKS..",
    "..SKKKKKOOOOKKKKS...",
    "...SKKKKKKKKKKKKS...",
    "..SKKKCCCCCCCCKKS...",
    ".SKKKCC.O.O.CCKKKS..",
    ".SKKCCC..O..CCCKKS..",
    ".SKKCCC.O.O.CCCKKS..",
    "....................",
    "....................",
    "...................."
  ],

  // 12. PEEK BOTTOM HAPPY: Smiling while peeking from bottom
  peek_bottom_happy: [
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
    "......SSSSSSSS......",
    "....SKKKKKKKKKKS....",
    "...SKKKKKKKKKKKKS...",
    "..SKKKKKKKKKKKKKKS..",
    "..SKKWWKKKKKKWWKKS..",
    ".SKKWEEWKKKKWEEWKKS.",
    ".SKKEEEEKKKKEEEEKKS.",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCCOOOOCCCKKS..",
    "..SKKKKKOOOOKKKKS...",
    "...SKKKKKKKKKKKKS...",
    "..SKKKCCCCCCCCKKS...",
    ".SKKKCC.O.O.CCKKKS..",
    ".SKKCCC..O..CCCKKS..",
    ".SKKCCC.O.O.CCCKKS..",
    "....................",
    "....................",
    "...................."
  ],

  // 13. PEEK RIGHT: Peeking in from the right edge
  peek_right: [
    "....................",
    "....................",
    ".........SSSSSS.....",
    "........KKKKKKKKS...",
    "......SKKKKKKKKKKS..",
    "......WWKKKKWWWKKS..",
    "......EWKKKKEEWWKS..",
    "......EEKKKKEEEEKS..",
    "......CCCC..CCCCBKS.",
    "......CCCOOOCCCBKS..",
    "......CCOOOOCCCKS...",
    "......KKOOOOKKKKS...",
    "......KKKKKKKKKKS...",
    "......KKCCCCCCKKS...",
    "......KKC.O.OCCKKS..",
    "......CCC..O..CCKS..",
    "......CCC.O.O.CCKS..",
    "......CCCCCCCCCCKS..",
    "......KGGGGGGGGKKS..",
    "......SKKKKKKKKKS...",
    "......SOOOOOOOOS....",
    "......OOO..OOOOOL...",
    "....................",
    "...................."
  ],

  // 14. INSPECT: Leaning slightly forward, focused eyes
  inspect: [
    "........SSSSSSSS....",
    "......SKKKKKKKKKKS..",
    ".....SKKKKKKKKKKKKS.",
    "....SKKKKKKKKKKKKKKS",
    "....SKKWEEWKKWEEWKKS",
    "....SKKWEEWKKWEEWKKS",
    "....SKKEEEEKKEEEEKKS",
    "....SKKCCCC..CCCCKKS",
    "....SKKCCCCOOOCCCKKS",
    ".....SKKCOOOCCKKS...",
    ".....SKKKKOOOKKKS...",
    "......SKKKKKKKKS....",
    ".....SKKCCCCCCCKS...",
    "....SKKKCC.O.OCCKS..",
    "...SKKKCCC..O.CCCKS.",
    "..SKKKCCCC.O.OCCCKS.",
    "..SKKCCCCCCCCCCCCKS.",
    "..SKKGGGGGGGGGGKKS..",
    "...SKKKKKKKKKKKKS...",
    "....SOOOOOOOOOOS....",
    "...LOOOOO..OOOOOL...",
    "....................",
    "....................",
    "...................."
  ],

  // 15. ADMIRE: Eyes with sparkling glints, appreciative tilt
  admire: [
    "......SSSSSSSS......",
    "....SKKKKKKKKKKS....",
    "...SKKKKKKKKKKKKS...",
    "..SKKKKKKKKKKKKKKS..",
    "..SKKWWEWKKKKWWEWKKS",
    ".SKKWEEWWKKKKWEEWWKS",
    ".SKKEEEEKKKKEEEEKKS.",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCCOOOOCCCKKS..",
    "..SKKKKKOOOOKKKKS...",
    "...SKKKKKKKKKKKKS...",
    "..SKKKCCCCCCCCKKS...",
    ".SKKKCC.O.O.CCKKKS..",
    ".SKKCCC..O..CCCKKS..",
    ".SKKCCC.O.O.CCCKKS..",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKGGCCCCCCCCGGKKS.",
    "..SKKGGGGGGGGGGKKS..",
    "...SKKKKKKKKKKKKS...",
    "....SOOOOOOOOOOS....",
    "...LOOOOO..OOOOOL...",
    "...FOOOOO..OOOOOF...",
    "...................."
  ],

  // 16. SHY: Looking aside bashfully
  shy: [
    "......SSSSSSSS......",
    "....SKKKKKKKKKKS....",
    "...SKKKKKKKKKKKKS...",
    "..SKKKKKKKKKKKKKKS..",
    "..SKKKKKKKKKKKKKKS..",
    ".SKK.WEEKKKKWEE.KKS.",
    ".SKK.EEEKKKKEEE.KKS.",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCCOOOOCCCKKS..",
    "..SKKKKKOOOOKKKKS...",
    "...SKKKKKKKKKKKKS...",
    "..SKKKCCCCCCCCKKS...",
    ".SKKKCC.O.O.CCKKKS..",
    ".SKKCCC..O..CCCKKS..",
    ".SKKCCC.O.O.CCCKKS..",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKGGCCCCCCCCGGKKS.",
    "..SKKGGGGGGGGGGKKS..",
    "...SKKKKKKKKKKKKS...",
    "....SOOOOOOOOOOS....",
    "...LOOOOO..OOOOOL...",
    "...FOOOOO..OOOOOF...",
    "...................."
  ],

  // 17. WALK STEP 1: Left foot steps forward, right foot pushes back, right wing counter-balances
  walk_1: [
    "......SSSSSSSS......",
    "....SKKKKKKKKKKS....",
    "...SKKKKKKKKKKKKS...",
    "..SKKKKKKKKKKKKKKS..",
    "..SKKWWWKKKKWWWKKS..",
    ".SKKWEEWKKKKWEEWKKS.",
    ".SKKEEEEKKKKEEEEKKS.",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCCOOOOCCCKKS..",
    "..SKKKKKOOOOKKKKS...",
    "...SKKKKKKKKKKKKS...",
    "....SKKCCCCCCCKKSS..",
    "...SKKKCC.O.O.CKKKKS",
    "..SKKCCC..O...CCCKKS",
    "..SKKCCC.O.O..CCCKKS",
    "..SKKCCCCCCCCCCCCKKS",
    "..SKKCCCCCCCCCCCCKKS",
    "...SKKGGGGGGGGGGKKS.",
    "....SKKKKKKKKKKKKS..",
    ".....SOOOOOOOOOS....",
    "....LOOOOO..OOOO....",
    "....FOOOOO..........",
    "....................",
    "...................."
  ],

  // 18. WALK STEP 2: Right foot steps forward, left foot pushes back, left wing counter-balances
  walk_2: [
    "......SSSSSSSS......",
    "....SKKKKKKKKKKS....",
    "...SKKKKKKKKKKKKS...",
    "..SKKKKKKKKKKKKKKS..",
    "..SKKWWWKKKKWWWKKS..",
    ".SKKWEEWKKKKWEEWKKS.",
    ".SKKEEEEKKKKEEEEKKS.",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCCOOOOCCCKKS..",
    "..SKKKKKOOOOKKKKS...",
    "...SKKKKKKKKKKKKS...",
    "..SSKKCCCCCCCKK.....",
    ".SKKKKC.O.O.CCKKKS..",
    ".SKKCCC..O...CCCKKS.",
    ".SKKCCC.O.O..CCCKKS.",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKGGGGGGGGGGKKS...",
    "..SKKKKKKKKKKKKS....",
    "....SOOOOOOOOOS.....",
    ".....OOOO..OOOOOL...",
    "..........OOOOOOF...",
    "....................",
    "...................."
  ],

  // 19. NEXUS TOUCH: Reaching wing out to touch the orange connection node
  nexus_touch: [
    "......SSSSSSSS......",
    "....SKKKKKKKKKKS....",
    "...SKKKKKKKKKKKKS...",
    "..SKKKKKKKKKKKKKKS..",
    "..SKKWWEEKKKKWWEEKKS",
    ".SKKKWWEEKKKKWWEEKKS",
    ".SKKKEEEEKKKKEEEEKKS",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCCOOOOCCCKKS..",
    "..SKKKKKOOOOKKKKS...",
    "...SKKKKKKKKKKKKS...",
    "..SKKKCCCCCCCCKKS.SS",
    ".SKKKCC.O.O.CCKKSSKK",
    ".SKKCCC..O..CCCKKKKK",
    ".SKKCCC.O.O.CCCKKSKK",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKGGCCCCCCCCGGKKS.",
    "..SKKGGGGGGGGGGKKS..",
    "...SKKKKKKKKKKKKS...",
    "....SOOOOOOOOOOS....",
    "...LOOOOO..OOOOOL...",
    "...FOOOOO..OOOOOF...",
    "...................."
  ],

  // 20. STRUGGLE START: "Oh no!" realization (eyes widen, 100-150ms)
  struggle_start: [
    "......SSSSSSSS......",
    "....SKKKKKKKKKKS....",
    "...SKKKKKKKKKKKKS...",
    "..SKKWWEWKKKKWWEWKKS",
    "..SKKWEEWWKKKKWEEWWK",
    ".SKKEEEEKKKKEEEEKKS.",
    ".SKKCCCC....CCCCBKKS",
    "..SKKCCCOOOOCCCKKS..",
    "..SKKKKOOOOOOKKKKS..",
    "...SKKKKKKKKKKKKS...",
    "..SKKKCCCCCCCCKKS...",
    ".SKKKCC.O.O.CCKKKS..",
    ".SKKCCC..O..CCCKKS..",
    ".SKKCCC.O.O.CCCKKS..",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKGGCCCCCCCCGGKKS.",
    "..SKKGGGGGGGGGGKKS..",
    "...SKKKKKKKKKKKKS...",
    "....SOOOOOOOOOOS....",
    "...LOOOOO..OOOOOL...",
    "...FOOOOO..OOOOOF...",
    "....................",
    "...................."
  ],

  // 21. STRUGGLE LEFT: Pulled right, body leaning left, left foot braced, right kicking, flailing wings
  struggle_left: [
    "........SSSSSSSS....",
    "......SKKKKKKKKKKS..",
    "....SKKKKKKKKKKKKKKS",
    "...SKKWWEWKKKKWWEWKS",
    "..SKKWEEWWKKKKWEEWWK",
    "..SKKEEEEKKKKEEEEKKS",
    "..SKKCCCC....CCCCKKS",
    "..SKKCCCCOOOOCCCKKKS",
    "..SSKKCCCOOOOCCCKKSS",
    ".SKKKKKKKOOOOKKKKKKS",
    "SKKKKKKKKKKKKKKKKKKS",
    ".SKKKKCC.O.O.CCKKKKS",
    "..SKKCCC..O..CCCKS..",
    "..SKKCCC.O.O.CCCKS..",
    "..SKKCCCCCCCCCCCCKS.",
    "..SKKCCCCCCCCCCCCKS.",
    "...SKKGGGGGGGGGGKS..",
    "....SKKKKKKKKKKKS...",
    "......SOOOOOOOOS....",
    "....LOOOOO...OOOO...",
    "...FOOOOO...........",
    "....................",
    "....................",
    "...................."
  ],

  // 22. STRUGGLE RIGHT: Pulled left, body leaning right, right foot braced, left kicking, flailing wings
  struggle_right: [
    "....SSSSSSSS........",
    "..SKKKKKKKKKKS......",
    "SKKKKKKKKKKKKKKS....",
    "SKKWWEWKKKKWWEWKS...",
    "SKKWEEWWKKKKWEEWWKS.",
    "SKKEEEEKKKKEEEEKKS..",
    "SKKCCCC....CCCCKKS..",
    "SKKCCCCOOOOCCCBKKKS.",
    "SSKKCCCOOOOCCCKKSS..",
    "SKKKKKKKOOOOKKKKKKS.",
    "SKKKKKKKKKKKKKKKKKKS",
    ".SKKKKCC.O.O.CCKKKKS",
    "..SKCCC..O..CCCKKS..",
    "..SKCCC.O.O.CCCKKS..",
    "..SKCCCCCCCCCCCCKKS.",
    "..SKCCCCCCCCCCCCKKS.",
    "..SKGGGGGGGGGGKKS...",
    "...SKKKKKKKKKKKS....",
    "....SOOOOOOOOS......",
    ".....OOOO...OOOOOL..",
    "............OOOOOF..",
    "....................",
    "....................",
    "...................."
  ],

  // 23. STRUGGLE UP: Pulled up, legs kicking down, body stretched
  struggle_up: [
    "......SSSSSSSS......",
    "....SKKKKKKKKKKS....",
    "...SKKWWEWKKKKWWEWKS",
    "..SKKWEEWWKKKKWEEWWK",
    "..SKKEEEEKKKKEEEEKKS",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCCOOOOCCCBKKKS",
    "..SKKCCCOOOOCCCKKS..",
    "..SKKKKKOOOOKKKKKS..",
    "...SKKKKKKKKKKKKS...",
    "..SKKKCCCCCCCCKKS...",
    ".SKKKCC.O.O.CCKKKS..",
    ".SKKCCC..O..CCCKKS..",
    ".SKKCCC.O.O.CCCKKS..",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKCCCCCCCCCCCCKKS.",
    "..SKKGGGGGGGGGGKKS..",
    "...SKKKKKKKKKKKKS...",
    "....SOOOOOOOOOOS....",
    "....LOOOO...OOOOL...",
    "....FOOO.....OOOF...",
    "....LOO.......OOL...",
    "....................",
    "...................."
  ],

  // 24. STRUGGLE DOWN: Pulled down, body compressed, feet resisting
  struggle_down: [
    "......SSSSSSSS......",
    "....SKKKKKKKKKKS....",
    "...SKKKKKKKKKKKKS...",
    "..SKKWWEWKKKKWWEWKKS",
    "..SKKWEEWWKKKKWEEWWK",
    ".SKKEEEEKKKKEEEEKKS.",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCCOOOOCCCBKKKS",
    "..SKKCCCOOOOCCCKKS..",
    "..SKKKKKOOOOKKKKKS..",
    "...SKKKKKKKKKKKKS...",
    "..SKKKCCCCCCCCKKS...",
    ".SKKKCC.O.O.CCKKKS..",
    ".SKKCCC..O..CCCKKS..",
    ".SKKCCC.O.O.CCCKKS..",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKCCCCCCCCCCCCKKS.",
    "..SKKGGGGGGGGGGKKS..",
    "...SKKKKKKKKKKKKS...",
    "....SOOOOOOOOOOS....",
    "...LOOOOO..OOOOOL...",
    "....................",
    "...................."
  ],

  // 25. RECOVER: Landed back, fluffing feathers / settling
  recover: [
    "..SS..SSSSSSSS..SS..",
    ".SKK.SKKKKKKKKS.KKS.",
    "SKKK.SKKKKKKKKS.KKKS",
    "SKKK.SKKKKKKKKS.KKKS",
    ".SKK.SKWWKKWWKS.KKS.",
    "..SS.SKEEKKEEKS.SS..",
    "....SKKCCCC..CKKS...",
    "...SKKCCCCOCCCBKKKS.",
    "...SKKKCOOOOCKKKKS..",
    "....SKKKOOOOKKKS....",
    ".....SKKKKKKKKS.....",
    "....SKKCCCCCCKKS....",
    "...SKKKC.O.O.CKKKS..",
    "..SKKKKC..O..CKKKKS.",
    "..SKKKKC.O.O.CKKKKS.",
    "...SKKKCCCCCCKKKS...",
    "....SKKGGGGGGKKS....",
    ".....SKKKKKKKKS.....",
    "......OOOOOOOO......",
    ".....OOOO..OOOO.....",
    "....................",
    "....................",
    "....................",
    "...................."
  ],

  // 26. ANNOYED: Crossed wings, sideways glance, tiny pout (signature post-drag 1.5s)
  annoyed: [
    "......SSSSSSSS......",
    "....SKKKKKKKKKKS....",
    "...SKKKKKKKKKKKKS...",
    "..SKKKKKKKKKKKKKKS..",
    "..SKKWWKKKKKKWWKKS..",
    ".SKK.EE.KKKK.EE.KKS.",
    ".SKKEEEEKKKKEEEEKKS.",
    ".SKKCCCC....CCCCBKKS",
    ".SKKCCCCOOOOCCCKKS..",
    "..SKKKKKOOOOKKKKS...",
    "...SKKKKKKKKKKKKS...",
    "..SKKKCCCCCCCCKKS...",
    ".SKKKKCC.O.O.CCKKKKS",
    ".SKKKKKK..O..KKKKKKS",
    ".SKKKKKK.O.O.KKKKKKS",
    ".SKKKKKKKKKKKKKKKKS.",
    ".SKKCCCCCCCCCCCCKKS.",
    ".SKKGGCCCCCCCCGGKKS.",
    "..SKKGGGGGGGGGGKKS..",
    "...SKKKKKKKKKKKKS...",
    "....SOOOOOOOOOOS....",
    "...LOOOOO..OOOOOL...",
    "...FOOOOO..OOOOOF...",
    "...................."
  ],
};

// 7x7 NEXUS Pixel-Art Heart
export const PIXEL_HEART: string[] = [
  ".RR.RR.",
  "RRRRRRR",
  "RRRRRRR",
  "RRRRRRR",
  ".RRRRR.",
  "..RRR..",
  "...R...",
];

// 5x5 NEXUS Orange Sparkle Node
export const PIXEL_NODE: string[] = [
  "..O..",
  ".OOO.",
  "OOOOO",
  ".OOO.",
  "..O..",
];
