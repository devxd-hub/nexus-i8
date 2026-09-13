import fs from 'fs';
import path from 'path';

function normalizeName(filename: string): string {
  if (filename.toLowerCase().includes('untitled design')) {
    return 'om-pandey.png';
  }
  if (filename.toLowerCase().includes('nexus-removebg')) {
    return 'nexus-x.png';
  }
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  return base
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/conent/g, 'content')
    .replace(/coodinater/g, 'coordinator')
    + ext.toLowerCase();
}

function sync() {
  const possibleSourceDirs = [
    // 'assets/team' no longer exists; script is kept for future use when
    // new raw originals are dropped into these locations.
    path.resolve(process.cwd(), 'team images'),
    path.resolve(process.cwd(), 'team images '),
  ];

  // Canonical image root: nexus-i8-/images/
  const targetDirKebab = path.resolve(process.cwd(), 'images/team');

  if (!fs.existsSync(targetDirKebab)) {
    fs.mkdirSync(targetDirKebab, { recursive: true });
  }

  for (const srcDir of possibleSourceDirs) {
    if (!fs.existsSync(srcDir)) continue;

    const files = fs.readdirSync(srcDir);
    for (const file of files) {
      const fullPath = path.join(srcDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isFile() && /\.(png|jpe?g|webp|gif|svg)$/i.test(file)) {
        if (file.toLowerCase().includes('nexus-removebg')) {
          // Canonical logo location: nexus-i8-/images/logos/
          const canonicalLogo = path.resolve(process.cwd(), 'images/logos/NEXUS-removebg-preview-1.png');
          fs.copyFileSync(fullPath, canonicalLogo);
          continue;
        }

        const normalized = normalizeName(file);
        const destKebab = path.join(targetDirKebab, normalized);
        fs.copyFileSync(fullPath, destKebab);
        console.log(`[Sync] Copied ${file} -> ${normalized}`);
      }
    }
  }
}

sync();
