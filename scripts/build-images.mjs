/**
 * Chaîne de traitement des images.
 *
 * 1. Rasterise `scripts/og.svg` en `public/og.png` (1200 × 630).
 * 2. Décline chaque fichier de `assets-source/` en AVIF, WebP et JPEG, en
 *    plusieurs largeurs, vers `public/assets/`.
 *
 * Aucun média distant n'est référencé : tout est servi depuis le domaine.
 *
 *   node scripts/build-images.mjs
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = path.join(root, 'assets-source');
const OUT_DIR = path.join(root, 'public', 'assets');
const WIDTHS = [640, 1024, 1600, 2048];

/**
 * Image de partage social.
 *
 * Dès que le visuel du hero existe, l'OG en est un simple recadrage : un seul
 * média, aucune génération supplémentaire. À défaut, on rasterise la
 * composition de repli `scripts/og.svg`.
 */
async function buildOgImage() {
  const heroPath = path.join(SOURCE_DIR, 'hero.png');
  const target = path.join(root, 'public', 'og.png');

  if (existsSync(heroPath)) {
    const png = await sharp(heroPath)
      .resize(1200, 630, { fit: 'cover', position: 'attention' })
      .png({ compressionLevel: 9, quality: 88 })
      .toBuffer();
    await writeFile(target, png);
    console.log(
      'og.png  1200×630  %d Ko  (recadrage du hero)',
      Math.round(png.byteLength / 1024),
    );
    return;
  }

  const svg = await readFile(path.join(root, 'scripts', 'og.svg'));
  const png = await sharp(svg, { density: 200 })
    .resize(1200, 630, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(target, png);
  console.log('og.png  1200×630  %d Ko  (repli SVG)', Math.round(png.byteLength / 1024));
}

async function buildAssets() {
  if (!existsSync(SOURCE_DIR)) {
    console.log(
      'assets-source/ absent : aucune image à décliner. Déposez-y les visuels sources.',
    );
    return;
  }

  const files = (await readdir(SOURCE_DIR)).filter((file) =>
    /\.(png|jpe?g|webp|avif|tiff?)$/i.test(file),
  );

  if (files.length === 0) {
    console.log('assets-source/ est vide : rien à décliner.');
    return;
  }

  await mkdir(OUT_DIR, { recursive: true });

  for (const file of files) {
    const name = path.parse(file).name;
    const input = sharp(path.join(SOURCE_DIR, file));
    const { width = 0 } = await input.metadata();

    for (const target of WIDTHS) {
      if (target > width) continue;
      const resized = input.clone().resize({ width: target });
      await resized
        .clone()
        .avif({ quality: 62 })
        .toFile(path.join(OUT_DIR, `${name}-${target}.avif`));
      await resized
        .clone()
        .webp({ quality: 78 })
        .toFile(path.join(OUT_DIR, `${name}-${target}.webp`));
      await resized
        .clone()
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(path.join(OUT_DIR, `${name}-${target}.jpg`));
      console.log('%s → %dpx (avif, webp, jpg)', name, target);
    }
  }
}

await buildOgImage();
await buildAssets();
