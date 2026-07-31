/**
 * Génère les marques de Foundry Devs en SVG vectoriel.
 *
 * La rose est construite géométriquement (spirale logarithmique échantillonnée
 * en segments droits) plutôt que décalquée : les contours sont exacts, la forme
 * est reproductible et chaque paramètre reste réglable.
 *
 *   node brand/generate-logos.mjs
 */

import { writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(DIR, '..');

/** Couleurs de marque. Le rose n'existe que sur le logo, jamais dans l'interface. */
const C = {
  rose: '#D94F70',
  roseDeep: '#B83D5B',
  ink: '#18201E',
  limestone: '#EEF1EE',
  night: '#173D33',
};

const n = (v) => Number(v.toFixed(2));

/* ------------------------------------------------------------------ *
 * 1. Rose géométrique
 * ------------------------------------------------------------------ */

const CX = 100;
const CY = 100;
const poly = (pts) => 'M ' + pts.map(([x, y]) => `${n(x)} ${n(y)}`).join(' L ') + ' Z';

/**
 * Silhouette extérieure : polygone à `sides` côtés, dont le rayon respire
 * légèrement pour éviter l'effet « panneau de signalisation ».
 */
function roseSilhouette({ r = 92, sides = 11, phase = -Math.PI / 2, wobble = 0.045 } = {}) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = phase + (i * Math.PI * 2) / sides;
    const rr = r * (1 + Math.sin(i * 2.4) * wobble);
    pts.push([CX + Math.cos(a) * rr, CY + Math.sin(a) * rr]);
  }
  return poly(pts);
}

/**
 * Fente en spirale. Ce n'est pas la matière du logo mais son vide : combinée à
 * la silhouette en `fill-rule="evenodd"`, elle creuse l'enroulement des pétales.
 * `thickness` est l'épaisseur du vide, constante pour rester nette en petit.
 */
function roseSlit({
  // Démarre à l'intérieur de la silhouette : seule l'amorce radiale franchit
  // le bord. Au-delà, la spirale longerait le contour et en isolerait un éclat.
  rStart = 84,
  rEnd = 21,
  turns = 2.75,
  sides = 9,
  thickness = 8.5,
  phase = -Math.PI / 2 + 0.34,
} = {}) {
  const steps = Math.round(turns * sides);
  const step = (Math.PI * 2) / sides;
  const k = Math.pow(rEnd / rStart, 1 / steps);

  const outer = [];
  const inner = [];

  // Amorce radiale : la fente aborde le bord perpendiculairement. Sans elle,
  // le premier segment rase la silhouette et en détache une lamelle.
  const a0 = phase;
  const t0 = thickness;
  outer.push([CX + Math.cos(a0) * 150 + Math.cos(a0 + Math.PI / 2) * (t0 / 2),
              CY + Math.sin(a0) * 150 + Math.sin(a0 + Math.PI / 2) * (t0 / 2)]);
  inner.push([CX + Math.cos(a0) * 150 - Math.cos(a0 + Math.PI / 2) * (t0 / 2),
              CY + Math.sin(a0) * 150 - Math.sin(a0 + Math.PI / 2) * (t0 / 2)]);

  for (let i = 0; i <= steps; i++) {
    const a = phase + i * step;
    const ro = rStart * Math.pow(k, i);
    // La fente s'affine vers le cœur : elle se ferme au lieu de s'arrêter net.
    const t = thickness * (0.42 + 0.58 * (1 - i / steps));
    outer.push([CX + Math.cos(a) * (ro + t / 2), CY + Math.sin(a) * (ro + t / 2)]);
    inner.push([CX + Math.cos(a) * (ro - t / 2), CY + Math.sin(a) * (ro - t / 2)]);
  }
  return poly([...outer, ...inner.reverse()]);
}

/**
 * La marque tient en deux tracés : une silhouette et le vide qui l'enroule.
 * Pas de cœur rapporté — la spirale s'arrête avant le centre, qui reste plein
 * et donne la masse nécessaire aux petites tailles.
 *
 * Le masque, plutôt qu'un `fill-rule`, borne le résultat à la silhouette :
 * l'amorce de l'entaille doit franchir le contour, et tout ce qui le dépasse
 * serait sinon peint en plein.
 */
const roseMark = (color = C.rose, id = 'r') => {
  const silhouette = roseSilhouette();
  return `<defs><mask id="mask-${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
      <path d="${silhouette}" fill="#fff" />
      <path d="${roseSlit()}" fill="#000" />
    </mask></defs>
  <path d="${silhouette}" fill="${color}" mask="url(#mask-${id})" />`;
};

/* ------------------------------------------------------------------ *
 * 2. Monogramme AR
 * ------------------------------------------------------------------ */

/**
 * F et D construits en tracés, sans dépendance à une police installée.
 * Le D est ouvert d'une fente sur son flanc : la coulée de la fonderie.
 */
const monogram = (color = C.rose) => `<g fill="${color}">
    <!-- F : fût, barre haute et barre médiane -->
    <path d="M 26 44 L 104 44 L 104 66 L 52 66 L 52 88 L 96 88 L 96 110 L 52 110
             L 52 152 L 26 152 Z" />
    <!-- D : fût et panse -->
    <path d="M 130 44 L 168 44 C 200 44 218 66 218 98 C 218 130 200 152 168 152
             L 130 152 Z" />
    <!-- Contreforme de la panse -->
    <path d="M 156 66 L 168 66 C 186 66 196 78 196 98 C 196 118 186 130 168 130
             L 156 130 Z" fill="${C.limestone}" />
  </g>`;

/* ------------------------------------------------------------------ *
 * 3. Marque typographique
 * ------------------------------------------------------------------ */

/** Polices embarquées : le SVG se rend à l'identique partout, sans installation. */
async function embeddedFonts() {
  const load = async (file) =>
    (await readFile(path.join(ROOT, 'public', 'fonts', file))).toString('base64');
  const grotesk = await load('schibsted-grotesk-latin-wght-normal.woff2');
  const serif = await load('instrument-serif-latin-400-italic.woff2');
  return `<style>
      @font-face{font-family:'AR Grotesk';font-weight:400 900;src:url(data:font/woff2;base64,${grotesk}) format('woff2');}
      @font-face{font-family:'AR Serif';font-style:italic;src:url(data:font/woff2;base64,${serif}) format('woff2');}
    </style>`;
}

/* ------------------------------------------------------------------ *
 * Assemblage
 * ------------------------------------------------------------------ */

const svg = (w, h, body, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Foundry Devs">${extra}${body}</svg>\n`;

const files = {};

// 1 — Rose seule, sur fond transparent.
files['logo-rose.svg'] = svg(200, 200, roseMark(C.rose, 'solo'));

// 1b — Rose + nom, disposition horizontale.
files['logo-rose-lockup.svg'] = null; // rempli plus bas (nécessite les polices)

// 2 — Monogramme seul.
files['logo-monogram.svg'] = svg(240, 196, monogram());

// 2b — Monogramme en pastille, pour avatar et favicon.
files['logo-monogram-badge.svg'] = svg(
  256,
  256,
  `<rect width="256" height="256" rx="28" fill="${C.night}" />
   <g transform="translate(8 30)">${monogram(C.rose).replace(C.limestone, C.night)}</g>`,
);

const fonts = await embeddedFonts();

// 3 — Marque typographique seule.
//
// Les deux mots vivent dans un seul `<text>` : le second `tspan` se pose à la
// suite du premier quelle que soit sa largeur réelle. Des coordonnées absolues
// les feraient se chevaucher dès que la police change de chasse.
const wordmark = (inkColor = C.ink, roseColor = C.rose) =>
  `<text x="4" y="86" font-size="76" fill="${inkColor}">
     <tspan font-family="AR Grotesk" font-weight="500" letter-spacing="-2.6">Foundry</tspan><tspan font-family="AR Serif" font-style="italic" font-size="82" fill="${roseColor}" dx="14">Devs</tspan>
   </text>`;

// Largeurs mesurées dans le navigateur avec les polices réelles du projet,
// puis reportées ici : le cadre colle au dessin, sans blanc mort.
files['logo-wordmark.svg'] = svg(436, 112, wordmark(), fonts);

// 1b — Rose + nom.
files['logo-rose-lockup.svg'] = svg(
  584,
  200,
  `<g transform="translate(0 4) scale(0.96)">${roseMark(C.rose, 'lock')}</g>
   <text x="230" y="106" font-size="62" fill="${C.ink}">
     <tspan font-family="AR Grotesk" font-weight="500" letter-spacing="-2.2">Foundry</tspan><tspan font-family="AR Serif" font-style="italic" font-size="67" fill="${C.rose}" dx="11">Devs</tspan>
   </text>
   <text x="232" y="140" font-family="AR Grotesk" font-weight="500" font-size="15" letter-spacing="4.4" fill="#5A6560">STUDIO DE DÉVELOPPEMENT</text>`,
  fonts,
);

// Favicon : la rose seule, simplifiée, sur pastille sombre.
files['favicon-rose.svg'] = svg(
  64,
  64,
  `<rect width="64" height="64" rx="8" fill="${C.night}" />
   <g transform="translate(32 32) scale(0.30) translate(-100 -100)">${roseMark(C.rose, 'fav')}</g>`,
);

for (const [name, content] of Object.entries(files)) {
  await writeFile(path.join(DIR, name), content, 'utf8');
  console.log('%s  %d o', name.padEnd(26), content.length);
}
