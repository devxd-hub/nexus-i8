import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function optimizeFolder(folderPath, maxWidth = 1440, quality = 82) {
  if (!fs.existsSync(folderPath)) return;
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);
    if (entry.isDirectory()) {
      await optimizeFolder(fullPath, maxWidth, quality);
    } else if (/\.(png|jpg|jpeg)$/i.test(entry.name)) {
      const ext = path.extname(entry.name);
      const base = path.basename(entry.name, ext);
      const webpName = `${base}.webp`;
      const webpPath = path.join(folderPath, webpName);

      try {
        const metadata = await sharp(fullPath).metadata();
        const resizeOptions = metadata.width && metadata.width > maxWidth ? { width: maxWidth } : null;

        // Generate WebP
        let pipeline = sharp(fullPath);
        if (resizeOptions) {
          pipeline = pipeline.resize(resizeOptions);
        }
        await pipeline
          .webp({ quality, effort: 5 })
          .toFile(webpPath);

        const origSize = fs.statSync(fullPath).size;
        const webpSize = fs.statSync(webpPath).size;
        console.log(`[Optimized] ${entry.name} (${(origSize / 1024).toFixed(1)}KB) -> ${webpName} (${(webpSize / 1024).toFixed(1)}KB) [-${(((origSize - webpSize) / origSize) * 100).toFixed(1)}%]`);
      } catch (err) {
        console.error(`Error processing ${entry.name}:`, err.message);
      }
    }
  }
}

async function run() {
  console.log('--- Optimizing Gallery Images ---');
  await optimizeFolder(path.resolve('./public/gallery-img'), 1440, 80);
  console.log('--- Optimizing Team Images ---');
  await optimizeFolder(path.resolve('./public/team-images'), 800, 80);
  console.log('--- Optimization Complete ---');
}

run();
