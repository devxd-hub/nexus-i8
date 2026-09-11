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
    path.resolve(process.cwd(), 'team images'),
    path.resolve(process.cwd(), 'team images '),
  ];

  const targetDirKebab = path.resolve(process.cwd(), 'public/team-images');
  const targetDirOriginal = path.resolve(process.cwd(), 'public/team images');

  if (!fs.existsSync(targetDirKebab)) {
    fs.mkdirSync(targetDirKebab, { recursive: true });
  }
  if (!fs.existsSync(targetDirOriginal)) {
    fs.mkdirSync(targetDirOriginal, { recursive: true });
  }

  for (const srcDir of possibleSourceDirs) {
    if (!fs.existsSync(srcDir)) continue;

    const files = fs.readdirSync(srcDir);
    for (const file of files) {
      const fullPath = path.join(srcDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isFile() && /\.(png|jpe?g|webp|gif|svg)$/i.test(file)) {
        const normalized = normalizeName(file);
        
        // Copy to public/team-images with normalized name
        const destKebab = path.join(targetDirKebab, normalized);
        fs.copyFileSync(fullPath, destKebab);

        // Also copy with exact file name to public/team-images and public/team images
        fs.copyFileSync(fullPath, path.join(targetDirOriginal, file));
        fs.copyFileSync(fullPath, path.join(targetDirKebab, file));

        if (file.toLowerCase().includes('nexus-removebg')) {
          const rootTargets = [
            'public/NEXUS-removebg-preview-1.png',
            'public/NEXUS-removebg-preview.png',
            'public/nexus-x.png',
            'dist/NEXUS-removebg-preview-1.png',
            'dist/NEXUS-removebg-preview.png',
            'dist/nexus-x.png',
          ];
          for (const rt of rootTargets) {
            const dir = path.dirname(path.resolve(process.cwd(), rt));
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.copyFileSync(fullPath, path.resolve(process.cwd(), rt));
          }
        }

        console.log(`[Sync] Copied ${file} -> ${normalized}`);
      }
    }
  }
}

sync();
