/**
 * Script to generate crisp pixel-art PNG assets and pixel data for the NEXUS Penguin mascot.
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal pure-JS PNG generator for 24-bit RGBA images without external native dependencies
function createPNG(width: number, height: number, rgbaBuffer: Uint8Array): Buffer {
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // color type RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  const rawScanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawScanlines[y * (1 + width * 4)] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = y * (1 + width * 4) + 1 + x * 4;
      rawScanlines[dstIdx] = rgbaBuffer[srcIdx];
      rawScanlines[dstIdx + 1] = rgbaBuffer[srcIdx + 1];
      rawScanlines[dstIdx + 2] = rgbaBuffer[srcIdx + 2];
      rawScanlines[dstIdx + 3] = rgbaBuffer[srcIdx + 3];
    }
  }

  const compressed = zlib.deflateSync(rawScanlines);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type: string, data: Buffer): Buffer {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export const COLOR_PALETTE: Record<string, [number, number, number, number]> = {
  '.': [0, 0, 0, 0], // Transparent
  'K': [21, 19, 17, 255], // #151311 Near-black / dark charcoal
  'D': [35, 34, 31, 255], // #23221F Charcoal shade
  'W': [243, 238, 229, 255], // #F3EEE5 Cream white
  'G': [220, 213, 200, 255], // #DCD5C8 Cream shade
  'O': [239, 90, 42, 255], // #EF5A2A NEXUS Orange
  'L': [255, 125, 79, 255], // #FF7D4F Orange Highlight
  'E': [10, 10, 9, 255], // #0A0A09 Pupil
  'H': [255, 255, 255, 255], // Glint
  'F': [212, 71, 27, 255], // #D4471B Dark orange
  'X': [255, 140, 0, 255], // Nexus glowing orange
  'R': [230, 57, 70, 255], // Pixel heart red
};

export const FRAMES: Record<string, string[]> = {
  idle: [
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "..KKWWKKKKWWKK..",
    "..KKWEKKKKEWKK..",
    "..KKWWKKKKWWKK..",
    "..KKKKKOOKKKKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK...",
    "...KKKOOOOKKK...",
    "..KKKKKKKKKKKK..",
    ".KKKKWWWWWWKKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    "..KKWWWWWWWWKK..",
    "..KKGWWWWWWGKK..",
    "...KKGGGGGGKK...",
    "....KKKKKKKK....",
    "....OOOOOOOO....",
    "...OOOO..OOOO...",
    "................"
  ],
  smile: [
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "..KKKKKKKKKKKK..",
    "..KKWWKKKKWWKK..",
    "..KKWWKKKKWWKK..",
    "..KKKKKOOKKKKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK...",
    "...KKKOOOOKKK...",
    "..KKKKKKKKKKKK..",
    ".KKKKWWWWWWKKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    "..KKWWWWWWWWKK..",
    "..KKGWWWWWWGKK..",
    "...KKGGGGGGKK...",
    "....KKKKKKKK....",
    "....OOOOOOOO....",
    "...OOOO..OOOO...",
    "................"
  ],
  look_left: [
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "..KKEWKKKKEWKK..",
    "..KKEWKKKKEWKK..",
    "..KKWWKKKKWWKK..",
    "..KKKKKOOKKKKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK...",
    "...KKKOOOOKKK...",
    "..KKKKKKKKKKKK..",
    ".KKKKWWWWWWKKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    "..KKWWWWWWWWKK..",
    "..KKGWWWWWWGKK..",
    "...KKGGGGGGKK...",
    "....KKKKKKKK....",
    "....OOOOOOOO....",
    "...OOOO..OOOO...",
    "................"
  ],
  look_right: [
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "..KKWWKKKKWWKK..",
    "..KKWEKKKKWEKK..",
    "..KKWWKKKKWWKK..",
    "..KKKKKOOKKKKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK...",
    "...KKKOOOOKKK...",
    "..KKKKKKKKKKKK..",
    ".KKKKWWWWWWKKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    "..KKWWWWWWWWKK..",
    "..KKGWWWWWWGKK..",
    "...KKGGGGGGKK...",
    "....KKKKKKKK....",
    "....OOOOOOOO....",
    "...OOOO..OOOO...",
    "................"
  ],
  blink: [
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "..KKKKKKKKKKKK..",
    "..KKEEKKKKEEKK..",
    "..KKKKKKKKKKKK..",
    "..KKKKKOOKKKKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK...",
    "...KKKOOOOKKK...",
    "..KKKKKKKKKKKK..",
    ".KKKKWWWWWWKKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    "..KKWWWWWWWWKK..",
    "..KKGWWWWWWGKK..",
    "...KKGGGGGGKK...",
    "....KKKKKKKK....",
    "....OOOOOOOO....",
    "...OOOO..OOOO...",
    "................"
  ],
  wave: [
    "....KKKKKKKK.KK.",
    "...KKKKKKKKKKKK.",
    "..KKWWKKKKWWKKK.",
    "..KKWEKKKKEWKK..",
    "..KKWWKKKKWWKK..",
    "..KKKKKOOKKKKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK...",
    "...KKKOOOOKKK...",
    "..KKKKKKKKKKKK..",
    ".KKKKWWWWWWKKKK.",
    ".KKKWWWWWWWWKK..",
    ".KKKWWWWWWWWKK..",
    ".KKKWWWWWWWWKK..",
    ".KKKWWWWWWWWKK..",
    ".KKKWWWWWWWWKK..",
    ".KKKWWWWWWWWKK..",
    "..KKWWWWWWWWKK..",
    "..KKGWWWWWWGKK..",
    "...KKGGGGGGKK...",
    "....KKKKKKKK....",
    "....OOOOOOOO....",
    "...OOOO..OOOO...",
    "................"
  ],
  wave_smile: [
    "....KKKKKKKK.KK.",
    "...KKKKKKKKKKKK.",
    "..KKKKKKKKKKKKK.",
    "..KKWWKKKKWWKK..",
    "..KKWWKKKKWWKK..",
    "..KKKKKOOKKKKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK...",
    "...KKKOOOOKKK...",
    "..KKKKKKKKKKKK..",
    ".KKKKWWWWWWKKKK.",
    ".KKKWWWWWWWWKK..",
    ".KKKWWWWWWWWKK..",
    ".KKKWWWWWWWWKK..",
    ".KKKWWWWWWWWKK..",
    ".KKKWWWWWWWWKK..",
    ".KKKWWWWWWWWKK..",
    "..KKWWWWWWWWKK..",
    "..KKGWWWWWWGKK..",
    "...KKGGGGGGKK...",
    "....KKKKKKKK....",
    "....OOOOOOOO....",
    "...OOOO..OOOO...",
    "................"
  ],
  walk_1: [
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "..KKWWKKKKWWKK..",
    "..KKWEKKKKEWKK..",
    "..KKWWKKKKWWKK..",
    "..KKKKKOOKKKKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK...",
    "...KKKOOOOKKK...",
    "..KKKKKKKKKKKK..",
    "..KKKWWWWWWKKK..",
    ".KKKKWWWWWWKKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    "..KKWWWWWWWWKK..",
    "..KKWWWWWWWWKK..",
    "...KKGGGGGGKK...",
    "....KKKKKKKK....",
    ".....OOOOOOOO...",
    "....OOOO...OOO..",
    "....OOO.........",
    "................"
  ],
  walk_2: [
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "..KKWWKKKKWWKK..",
    "..KKWEKKKKEWKK..",
    "..KKWWKKKKWWKK..",
    "..KKKKKOOKKKKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK...",
    "...KKKOOOOKKK...",
    "..KKKKKKKKKKKK..",
    "..KKKWWWWWWKKK..",
    ".KKKKWWWWWWKKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    "..KKWWWWWWWWKK..",
    "..KKWWWWWWWWKK..",
    "...KKGGGGGGKK...",
    "....KKKKKKKK....",
    "...OOOOOOOO.....",
    "..OOO...OOOO....",
    ".........OOO....",
    "................"
  ],
  peek_bottom: [
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "..KKWWKKKKWWKK..",
    "..KKWEKKKKEWKK..",
    "..KKWWKKKKWWKK..",
    "..KKKKKOOKKKKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK...",
    "...KKKOOOOKKK...",
    "..KKKKKKKKKKKK..",
    ".KKKKWWWWWWKKKK.",
    ".KKKWWWWWWWWKKK.",
    "KKKKWWWWWWWWKKKK",
    "OOOO........OOOO",
    "................",
    "................",
    "................",
    "................"
  ],
  peek_bottom_smile: [
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "..KKKKKKKKKKKK..",
    "..KKWWKKKKWWKK..",
    "..KKWWKKKKWWKK..",
    "..KKKKKOOKKKKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK...",
    "...KKKOOOOKKK...",
    "..KKKKKKKKKKKK..",
    ".KKKKWWWWWWKKKK.",
    ".KKKWWWWWWWWKKK.",
    "KKKKWWWWWWWWKKKK",
    "OOOO........OOOO",
    "................",
    "................",
    "................",
    "................"
  ],
  peek_left: [
    "................",
    "................",
    "....KKKKK.......",
    "...KKKKKKKK.....",
    "..KKWWKKKKWW....",
    "..KKWEKKKKEW....",
    "..KKWWKKKKWW....",
    "..KKKKKOOKKK....",
    "..KKKKKOOKKK....",
    "...KKKOOOOKK....",
    "...KKKOOOOKK....",
    "..KKKKKKKKKK....",
    ".KKKKWWWWWWK....",
    ".KKKWWWWWWWW....",
    ".KKKWWWWWWWW....",
    ".KKKWWWWWWWW....",
    ".KKKWWWWWWWW....",
    "..KKWWWWWWWW....",
    "..KKGWWWWWWG....",
    "...KKGGGGGGK....",
    "....KKKKKKKK....",
    "....OOOOOOOO....",
    "................",
    "................"
  ],
  peek_right: [
    "................",
    "................",
    ".......KKKKK....",
    ".....KKKKKKKK...",
    "....WWKKKKWWKK..",
    "....WEKKKKWEKK..",
    "....WWKKKKWWKK..",
    "....KKKOOKKKKK..",
    "....KKKOOKKKKK..",
    "....KKOOOOKKK...",
    "....KKOOOOKKK...",
    "....KKKKKKKKKK..",
    "....KWWWWWWKKKK.",
    "....WWWWWWWWKKK.",
    "....WWWWWWWWKKK.",
    "....WWWWWWWWKKK.",
    "....WWWWWWWWKKK.",
    "....WWWWWWWWKK..",
    "....GWWWWWWGKK..",
    "....KGGGGGGKK...",
    "....KKKKKKKK....",
    "....OOOOOOOO....",
    "................",
    "................"
  ],
  curious: [
    ".........OO.....",
    "........OOOO....",
    ".........OO.....",
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "..KKWWKKKKWWKK..",
    "..KKWEKKKKEWKK..",
    "..KKWWKKKKWWKK..",
    "..KKKKKOOKKKKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK...",
    "...KKKOOOOKKK...",
    "..KKKKKKKKKKKK..",
    ".KKKKWWWWWWKKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    "..KKWWWWWWWWKK..",
    "...KKGGGGGGKK...",
    "....KKKKKKKK....",
    "....OOOOOOOO....",
    "...OOOO..OOOO...",
    "................"
  ],
  inspect: [
    "......KKKKKKKK..",
    ".....KKKKKKKKKK.",
    "....KKWWKKKKWWKK",
    "....KKWEKKKKEWKK",
    "....KKWWKKKKWWKK",
    "....KKKKKOOKKKKK",
    "....KKKKKOOKKKKK",
    ".....KKKOOOOKKK.",
    ".....KKKOOOOKKK.",
    "....KKKKKKKKKKKK",
    "...KKKKWWWWWWKKK",
    "..KKKWWWWWWWWKK.",
    "..KKKWWWWWWWWKK.",
    "..KKKWWWWWWWWKK.",
    "..KKKWWWWWWWWKK.",
    "..KKKWWWWWWWWKK.",
    "..KKKWWWWWWWWKK.",
    "...KKWWWWWWWWKK.",
    "...KKGWWWWWWGKK.",
    "....KKGGGGGGKK..",
    ".....KKKKKKKK...",
    ".....OOOOOOOO...",
    "....OOOO..OOOO..",
    "................"
  ],
  admire: [
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "..KKHHKKKKHHّهKK..",
    "..KKHEKKKKHEKK..",
    "..KKWWKKKKWWKK..",
    "..KKKKKOOKKKKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK...",
    "...KKKOOOOKKK...",
    "..KKKKKKKKKKKK..",
    ".KKKKWWWWWWKKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    "..KKWWWWWWWWKK..",
    "..KKGWWWWWWGKK..",
    "...KKGGGGGGKK...",
    "....KKKKKKKK....",
    "....OOOOOOOO....",
    "...OOOO..OOOO...",
    "................"
  ],
  shy: [
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "..KKWWKKKKWWKK..",
    "..KKEWKKKKEWKK..",
    "..KKWWKKKKWWKK..",
    "..KKKKKOOKKKKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK...",
    "..KKKKKKKKKKKK..",
    ".KKKKWWWWWWKKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    "..KKWWWWWWWWKK..",
    "..KKGWWWWWWGKK..",
    "...KKGGGGGGKK...",
    "....KKKKKKKK....",
    "....OOOOOOOO....",
    "...OOOO..OOOO...",
    "................",
    "................"
  ],
  nexus_touch: [
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "..KKWWKKKKWWKK..",
    "..KKWEKKKKEWKK..",
    "..KKWWKKKKWWKK..",
    "..KKKKKOOKKKKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK.XX",
    "...KKKOOOOKKK.XX",
    "..KKKKKKKKKKKOXX",
    ".KKKKWWWWWWKKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    "..KKWWWWWWWWKK..",
    "..KKGWWWWWWGKK..",
    "...KKGGGGGGKK...",
    "....KKKKKKKK....",
    "....OOOOOOOO....",
    "...OOOO..OOOO...",
    "................"
  ],
  celebrate: [
    "..KK........KK..",
    "..KKKKKKKKKKKK..",
    "...KKKKKKKKKK...",
    "..KKEEKKKKEEKK..",
    "..KKEEKKKKEEKK..",
    "..KKKKKOOKKKKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK...",
    "...KKKOOOOKKK...",
    "..KKKKKKKKKKKK..",
    ".KKKKWWWWWWKKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    "..KKWWWWWWWWKK..",
    "..KKGWWWWWWGKK..",
    "...KKGGGGGGKK...",
    "....KKKKKKKK....",
    "....OOOOOOOO....",
    "...OOOO..OOOO...",
    "................"
  ],
  struggle_left: [
    ".......KKKKKK...",
    "......KKKKKKKK..",
    "....KKEEKKKKEEKK",
    "....KKWWKKKKWWKK",
    "....KKKKKOOKKKKK",
    "..KK.KKKOOOOKKK.",
    ".KKK..KKKKKKKK..",
    ".KKK.KKKWWWWWWKK",
    "..KK.KKWWWWWWWWK",
    ".....KKWWWWWWWWK",
    ".....KKWWWWWWWWK",
    ".....KKWWWWWWWWK",
    "......KKWWWWWWKK",
    "......KKGWWWWGKK",
    ".......KKGGGGKK.",
    "........KKKKKK..",
    "......OOOOOOOO..",
    "....OOOO...OOOO.",
    "...OOO..........",
    "................",
    "................",
    "................",
    "................",
    "................"
  ],
  struggle_right: [
    "...KKKKKK.......",
    "..KKKKKKKK......",
    "KKEEKKKKEEKK....",
    "KKWWKKKKWWKK....",
    "KKKKKOOKKKKK....",
    ".KKKOOOOKKK.KK..",
    "..KKKKKKKK..KKK.",
    "KKWWWWWWKKK.KKK.",
    "KWWWWWWWWKK..KK.",
    "KWWWWWWWWKK.....",
    "KWWWWWWWWKK.....",
    "KWWWWWWWWKK.....",
    "KKWWWWWWKK......",
    "KKGWWWWGKK......",
    ".KKGGGGKK.......",
    "..KKKKKK........",
    "..OOOOOOOO......",
    ".OOOO...OOOO....",
    "..........OOO...",
    "................",
    "................",
    "................",
    "................",
    "................"
  ],
  struggle_up: [
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "..KKEEKKKKEEKK..",
    "..KKWWKKKKWWKK..",
    "..KKKKKOOKKKKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK...",
    "...KKKOOOOKKK...",
    "..KKKKKKKKKKKK..",
    ".KKKKWWWWWWKKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    "..KKWWWWWWWWKK..",
    "...KKGGGGGGKK...",
    "....KKKKKKKK....",
    "....OOOOOOOO....",
    "....OOO..OOO....",
    "....OO....OO....",
    "...OO......OO...",
    "................",
    "................",
    "................"
  ],
  struggle_down: [
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "..KKEEKKKKEEKK..",
    "..KKWWKKKKWWKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK...",
    "..KKKKKKKKKKKK..",
    ".KKKKWWWWWWKKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    "..KKWWWWWWWWKK..",
    "..KKWWWWWWWWKK..",
    "...KKGGGGGGKK...",
    "....KKKKKKKK....",
    "....OOOOOOOO....",
    "...OOOO..OOOO...",
    "................",
    "................",
    "................"
  ],
  annoyed: [
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "..KKWWKKKKWWKK..",
    "..KKEWKKKKEWKK..",
    "..KKWWKKKKWWKK..",
    "..KKKKKOOKKKKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK...",
    "..KKKKKKKKKKKK..",
    ".KKKKWWWWWWKKKK.",
    ".KKKKWWWWWWKKKK.",
    ".KKKKWWWWWWKKKK.",
    ".KKKKKKKKKKKKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    "..KKWWWWWWWWKK..",
    "..KKGWWWWWWGKK..",
    "...KKGGGGGGKK...",
    "....KKKKKKKK....",
    "....OOOOOOOO....",
    "...OOOO..OOOO...",
    "................",
    "................"
  ],
  shake_off: [
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "..KKKKKKKKKKKK..",
    "..KKEEKKKKEEKK..",
    "..KKKKKKKKKKKK..",
    "..KKKKKOOKKKKK..",
    "...KKKOOOOKKK...",
    "..KKKKKKKKKKKK..",
    ".KKKKWWWWWWKKKK.",
    "KKKKWWWWWWWWKKKK",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    ".KKKWWWWWWWWKKK.",
    "..KKWWWWWWWWKK..",
    "..KKGWWWWWWGKK..",
    "...KKGGGGGGKK...",
    "....KKKKKKKK....",
    "....OOOOOOOO....",
    "...OOOO..OOOO...",
    "................",
    "................",
    "................",
    "................"
  ],
};

async function main() {
  const targetDir = path.resolve(process.cwd(), 'public/mascot/penguin');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const width = 16;
  const height = 24;

  const scale = 4;
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  for (const [name, rows] of Object.entries(FRAMES)) {
    const rgbaBuffer = new Uint8Array(scaledWidth * scaledHeight * 4);

    for (let y = 0; y < height; y++) {
      const row = rows[y] || '................';
      for (let x = 0; x < width; x++) {
        const char = row[x] || '.';
        const color = COLOR_PALETTE[char] || [0, 0, 0, 0];

        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            const px = x * scale + dx;
            const py = y * scale + dy;
            const idx = (py * scaledWidth + px) * 4;
            rgbaBuffer[idx] = color[0];
            rgbaBuffer[idx + 1] = color[1];
            rgbaBuffer[idx + 2] = color[2];
            rgbaBuffer[idx + 3] = color[3];
          }
        }
      }
    }

    const pngBuffer = createPNG(scaledWidth, scaledHeight, rgbaBuffer);
    const outPath = path.join(targetDir, `penguin-${name.replace(/_/g, '-')}.png`);
    fs.writeFileSync(outPath, pngBuffer);
  }
  console.log(`Generated all PNG assets in ${targetDir}`);
}

main().catch(console.error);
