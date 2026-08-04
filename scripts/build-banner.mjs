/**
 * Bannière de profil pour une plateforme de mise en relation.
 *
 * Aucune génération : le visuel du hero est recadré en bande panoramique et le
 * logo posé dessus. Un dégradé calcaire éclaircit la zone du logo pour garantir
 * le contraste quel que soit le recadrage.
 *
 * Le logo se pose à droite par défaut : sur la plupart des plateformes, la
 * photo de profil vient chevaucher le coin bas-gauche de la bannière.
 *
 *   node scripts/build-banner.mjs [largeur] [hauteur] [left|right]
 */

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const W = Number(process.argv[2]) || 1920;
const H = Number(process.argv[3]) || 320;
const COTE = process.argv[4] === 'left' ? 'left' : 'right';

const HERO = path.join(root, 'assets-source', 'hero.png');
const LOGO = path.join(root, 'brand', 'FoundryDevsTypo.png');
const SRC = { w: 2720, h: 1536 };

/**
 * Bande découpée au rapport demandé, centrée sur les plaques de verre.
 *
 * Prendre toute la largeur de la source donnerait une bande si fine qu'il ne
 * resterait que le mur nu : on resserre sur le sujet. Le point d'intérêt est
 * décalé vers la droite de la source, là où sont les plaques — le voile
 * couvrant le côté du logo, elles doivent tomber à l'opposé.
 */
const FOCUS = { x: 1980, y: 700 };
const ZOOM = 0.58;

const bandeLargeur = Math.round(SRC.w * ZOOM);
const bandeHauteur = Math.min(SRC.h, Math.round(bandeLargeur / (W / H)));
const borne = (v, max) => Math.max(0, Math.min(max, v));
const bandeLeft = borne(
  Math.round(FOCUS.x - bandeLargeur / 2),
  SRC.w - bandeLargeur,
);
const bandeTop = borne(
  Math.round(FOCUS.y - bandeHauteur / 2),
  SRC.h - bandeHauteur,
);

/** Le voile s'ouvre du côté du logo et s'efface vers l'image. */
const veil = (w, h) => {
  const [x1, x2] = COTE === 'right' ? [1, 0] : [0, 1];
  return Buffer.from(`<svg width="${w}" height="${h}">
  <defs>
    <linearGradient id="v" x1="${x1}" y1="0" x2="${x2}" y2="0">
      <stop offset="0%" stop-color="#EEF1EE" stop-opacity="0.95"/>
      <stop offset="40%" stop-color="#EEF1EE" stop-opacity="0.9"/>
      <stop offset="70%" stop-color="#EEF1EE" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#EEF1EE" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#v)"/>
</svg>`);
};

const fond = await sharp(HERO)
  .extract({
    left: bandeLeft,
    top: bandeTop,
    width: bandeLargeur,
    height: bandeHauteur,
  })
  .resize(W, H, { fit: 'cover', kernel: 'lanczos3' })
  .toBuffer();

// `trim` retire la transparence autour du logo : sa marge d'export fausserait
// le calage optique.
const logoHauteur = Math.round(H * 0.62);
const logo = await sharp(LOGO)
  .trim()
  .resize({ height: logoHauteur, kernel: 'lanczos3' })
  .toBuffer();
const { width: lw = 0, height: lh = 0 } = await sharp(logo).metadata();

const marge = Math.round(H * 0.19);
const logoLeft = COTE === 'right' ? W - lw - marge : marge;
const composee = sharp(fond).composite([
  { input: veil(W, H), top: 0, left: 0 },
  { input: logo, top: Math.round((H - lh) / 2), left: logoLeft },
]);

// JPEG pour l'usage courant — le fond est photographique, un PNG pèse six fois
// plus. Le PNG reste fourni pour les plateformes qui le réclament.
const jpeg = await composee.clone().jpeg({ quality: 90, mozjpeg: true }).toBuffer();
const png = await composee.clone().png({ compressionLevel: 9 }).toBuffer();

await writeFile(path.join(root, 'brand', `banniere-${W}x${H}.jpg`), jpeg);
await writeFile(path.join(root, 'brand', `banniere-${W}x${H}.png`), png);
console.log(
  'banniere-%dx%d  jpg %d Ko  png %d Ko  | logo %d×%d à %s | bande source %d×%d',
  W, H,
  Math.round(jpeg.byteLength / 1024), Math.round(png.byteLength / 1024),
  lw, lh, COTE === 'right' ? 'droite' : 'gauche',
  bandeLargeur, bandeHauteur,
);
