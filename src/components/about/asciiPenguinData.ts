/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Authentic ASCII Penguin Artwork
 * Provided character art with anatomical proportions, cross-hatched shading, and stippled texture.
 */
export const RAW_ASCII_PENGUIN_LINES: string[] = [
  "                                 .-++++++-.                                         ",
  "                   .-+--.....+###############+.                                     ",
  "                  -#+++#########################.                                   ",
  "                      +#####++#########+#########+                                  ",
  "                          ########################-                                 ",
  "                           .#######################.                                ",
  "                             +#####################+                                ",
  "                              +####################+                                ",
  "                               -####################-                               ",
  "                                ####################+                               ",
  "                               .#++-.-.  ..++########-                              ",
  "                              .-...          .+#######-                             ",
  "                             .         .        ++#####-                            ",
  "                            --...                 -#####+-                          ",
  "                           --....                  ######-                          ",
  "                           ---..                    -+#+#+-.                        ",
  "                           ++-...                    .+##+--                        ",
  "                          -#+..    .                 .-+##+.                        ",
  "                          +++.                        -+###+                        ",
  "                         .##++......   .              .++##++.                      ",
  "                        -+++#+-. ..    .              ..+#####.                     ",
  "                       -+++-++--....   .  .  .         . ######-                    ",
  "                      +#++++#++- .----......   .       . -######+                   ",
  "                     ###+++#+#+++-----.-----..   .     .  -######+                  ",
  "                    -###++++#####+++++-------... .        -#######+                 ",
  "                    ####+-+++++++++++++++++----...     .  .########-                ",
  "                   -####+-++####+#++#++++++++#+--...     . ++#######                ",
  "                  .#####--+++#####+++#+#++##+#+++---      .+..+#####-               ",
  "                  -#####.-+++#+###########++++++++--.. .. .#-  +####+.              ",
  "                  +####-.-++###++#+#######++++++++--....  .+.   -+###-              ",
  "                  +##++. -+################+###+++++--..  .+.    -++++              ",
  "                  +##+. .+++#################++##++++--....+      +##+.             ",
  "                  +##+   --+###############+++++####+++..--+  .   -+#+-             ",
  "                  +##.   .-+####################+####+++--++       ++#+             ",
  "                  +++     -+##########################+++++-       .+#+             ",
  "                   -       +###########################+#++         -+-             ",
  "                            +############################+-          .              ",
  "                            .#############################-                         ",
  "                              +##########################-                          ",
  "                              #######+++######+. -######+                           ",
  "                              +######             ####+#-                           ",
  "                          --++#######+.         .###+++++                           ",
  "                         -+###########+.     -+###++##+#+-                          ",
  "                                 ..               ..  -.-                           ",
];

export interface AsciiGlyphParticle {
  char: string;
  origRow: number;
  origCol: number;
  u: number; // 0..1 horizontal normalized
  v: number; // 0..1 vertical normalized
  opacity: number;
  weightClass: 'heavy' | 'medium' | 'light' | 'dot';
  // Skinning weights
  wTorso: number;
  wHead: number;
  wLeftFoot: number;
  wRightFoot: number;
  wLeftFlipper: number;
  wRightFlipper: number;
}

/**
 * Parses the raw ASCII lines into animated particles with anatomical bone skinning.
 */
export function parseAsciiPenguinParticles(): {
  particles: AsciiGlyphParticle[];
  totalRows: number;
  totalCols: number;
} {
  const lines = RAW_ASCII_PENGUIN_LINES;
  const totalRows = lines.length;
  let maxCols = 0;
  for (const line of lines) {
    if (line.length > maxCols) maxCols = line.length;
  }

  const particles: AsciiGlyphParticle[] = [];

  for (let r = 0; r < totalRows; r++) {
    const line = lines[r];
    const v = r / (totalRows - 1);

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === ' ' || char === '\t' || char === '\r') continue;

      const u = c / (maxCols - 1);

      let opacity = 1.0;
      let weightClass: 'heavy' | 'medium' | 'light' | 'dot' = 'heavy';

      if (char === '#') {
        opacity = 0.95;
        weightClass = 'heavy';
      } else if (char === '+') {
        opacity = 0.82;
        weightClass = 'medium';
      } else if (char === '-') {
        opacity = 0.68;
        weightClass = 'light';
      } else if (char === '.') {
        opacity = 0.52;
        weightClass = 'dot';
      }

      // Anatomical landmark distances on the ASCII character grid:
      // Head / Beak / Crown: (u ~ 0.45, v ~ 0.14)
      // Left Flipper: (u ~ 0.28, v ~ 0.55)
      // Right Flipper: (u ~ 0.74, v ~ 0.52)
      // Left Foot: (u ~ 0.38, v ~ 0.93)
      // Right Foot: (u ~ 0.64, v ~ 0.93)
      // Torso / Belly: (u ~ 0.50, v ~ 0.55)

      const dHead = Math.hypot(u - 0.45, (v - 0.14) * 1.5);
      const dLeftFoot = Math.hypot(u - 0.38, (v - 0.93) * 2.2);
      const dRightFoot = Math.hypot(u - 0.64, (v - 0.93) * 2.2);
      const dLeftFlipper = Math.hypot(u - 0.26, (v - 0.55) * 1.3);
      const dRightFlipper = Math.hypot(u - 0.74, (v - 0.52) * 1.3);

      let wHead = 0;
      let wLeftFoot = 0;
      let wRightFoot = 0;
      let wLeftFlipper = 0;
      let wRightFlipper = 0;
      let wTorso = 1.0;

      // 1. Head influence: Top rows (r <= 11, v < 0.28)
      if (v < 0.28 && u < 0.75) {
        wHead = Math.max(0, 1.0 - dHead * 2.8);
        wHead = Math.pow(wHead, 1.4);
      }

      // 2. Left Foot influence (viewer left): Bottom-left (v > 0.82, u < 0.52)
      if (v > 0.82 && u < 0.52) {
        wLeftFoot = Math.max(0, 1.0 - dLeftFoot * 3.6);
        wLeftFoot = Math.pow(wLeftFoot, 1.5);
      }

      // 3. Right Foot influence (viewer right): Bottom-right (v > 0.82, u >= 0.50)
      if (v > 0.82 && u >= 0.50) {
        wRightFoot = Math.max(0, 1.0 - dRightFoot * 3.6);
        wRightFoot = Math.pow(wRightFoot, 1.5);
      }

      // 4. Left Flipper (viewer left, rows 13..36, cols < 36):
      if (u < 0.36 && v >= 0.28 && v <= 0.80) {
        wLeftFlipper = Math.max(0, 1.0 - dLeftFlipper * 3.2);
        wLeftFlipper = Math.pow(wLeftFlipper, 1.3);
      }

      // 5. Right Flipper (viewer right, rows 16..36, cols > 62):
      if (u > 0.62 && v >= 0.28 && v <= 0.82) {
        wRightFlipper = Math.max(0, 1.0 - dRightFlipper * 3.2);
        wRightFlipper = Math.pow(wRightFlipper, 1.3);
      }

      const total = wHead + wLeftFoot + wRightFoot + wLeftFlipper + wRightFlipper;
      if (total > 0.98) {
        wTorso = 0;
        const inv = 1.0 / total;
        wHead *= inv;
        wLeftFoot *= inv;
        wRightFoot *= inv;
        wLeftFlipper *= inv;
        wRightFlipper *= inv;
      } else {
        wTorso = 1.0 - total;
      }

      particles.push({
        char,
        origRow: r,
        origCol: c,
        u,
        v,
        opacity,
        weightClass,
        wTorso,
        wHead,
        wLeftFoot,
        wRightFoot,
        wLeftFlipper,
        wRightFlipper,
      });
    }
  }

  return { particles, totalRows, totalCols: maxCols };
}
