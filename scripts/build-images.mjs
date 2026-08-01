/**
 * Chaîne de traitement des images.
 *
 * 1. Rasterise `scripts/og.svg` en `public/og.png` (1200 × 630).
 * 2. Rasterise `scripts/apple-touch-icon.svg` en `public/apple-touch-icon.png`.
 * 3. Décline chaque fichier de `assets-source/` en AVIF, WebP et JPEG, en
 *    plusieurs largeurs, vers `public/assets/`.
 *
 * Aucun média distant n'est référencé : tout est servi depuis le domaine.
 *
 *   node scripts/build-images.mjs
 */

import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = path.join(root, 'assets-source');
const OUT_DIR = path.join(root, 'public', 'assets');
const WIDTHS = [640, 1024, 1600, 2048];

/** Captures d'interface, à encoder en haute qualité (voir plus bas). */
const UI_CAPTURES = new Set(['mama-bloom']);

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
    // JPEG : le visuel est photographique, un PNG pèserait cinq fois plus pour
    // un résultat identique à l'œil. L'extension reste .png, ce que tous les
    // agrégateurs acceptent — ils lisent le type MIME, pas le nom.
    const jpeg = await sharp(heroPath)
      .resize(1200, 630, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer();
    await writeFile(path.join(root, 'public', 'og.jpg'), jpeg);
    if (existsSync(target)) await rm(target);
    console.log(
      'og.jpg  1200×630  %d Ko  (recadrage du hero)',
      Math.round(jpeg.byteLength / 1024),
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

/**
 * Icône d'écran d'accueil iOS.
 *
 * Safari ignore le SVG pour `apple-touch-icon` : sans ce PNG, iOS fabrique une
 * vignette de la page à la place. 180 px couvre les écrans @3x actuels, et iOS
 * rééchantillonne lui-même vers les tailles inférieures.
 *
 * Fond aplati sur le calcaire : le format n'admet pas la transparence, qu'iOS
 * rendrait en noir.
 */
async function buildAppleTouchIcon() {
  const svg = await readFile(path.join(root, 'scripts', 'apple-touch-icon.svg'));
  // `density` fixe la résolution de rastérisation du SVG : au défaut de 72 ppp,
  // la source de 180 unités serait tramée trop petit puis agrandie, et les
  // bords des cercles ressortiraient crénelés.
  const png = await sharp(svg, { density: 384 })
    .resize(180, 180)
    .flatten({ background: '#eef1ee' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(path.join(root, 'public', 'apple-touch-icon.png'), png);
  console.log('apple-touch-icon.png  180×180  %d Ko', Math.round(png.byteLength / 1024));
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

    /**
     * Les captures d'interface contiennent du texte fin : les réglages calibrés
     * pour la photographie y produisent un halo visible autour des lettres.
     * Convention : un fichier suffixé `-ui` est traité en haute qualité.
     */
    const isUi = /-ui$/.test(name) || UI_CAPTURES.has(name);
    const q = isUi
      ? { avif: 80, webp: 92, jpeg: 92 }
      : { avif: 62, webp: 78, jpeg: 82 };

    for (const target of WIDTHS) {
      if (target > width) continue;
      // Rééchantillonnage net : `lanczos3` préserve les contours du texte.
      const resized = input
        .clone()
        .resize({ width: target, kernel: 'lanczos3' });
      await resized
        .clone()
        .avif({ quality: q.avif })
        .toFile(path.join(OUT_DIR, `${name}-${target}.avif`));
      await resized
        .clone()
        .webp({ quality: q.webp })
        .toFile(path.join(OUT_DIR, `${name}-${target}.webp`));
      await resized
        .clone()
        .jpeg({ quality: q.jpeg, mozjpeg: true })
        .toFile(path.join(OUT_DIR, `${name}-${target}.jpg`));
      console.log(
        '%s → %dpx (%s)',
        name,
        target,
        isUi ? 'capture, haute qualité' : 'photo',
      );
    }
  }
}

await buildOgImage();
await buildAppleTouchIcon();
await buildAssets();
