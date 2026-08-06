// Injecte le HTML rendu côté serveur dans dist/ après le build client + SSR.
// Une page complète est écrite par route : chaque URL est donc un fichier
// statique servi tel quel, sans réécriture ni routeur client.
// dist-ssr est jetable, supprimé en fin de script.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const ssrEntry = path.join(root, 'dist-ssr/entry-server.js');
const distDir = path.join(root, 'dist');
const templatePath = path.join(distDir, 'index.html');

const { render, ROUTES, fileForRoute } = await import(
  `file://${ssrEntry.replaceAll('\\', '/')}`
);

const template = readFileSync(templatePath, 'utf-8');

if (!template.includes('<div id="root"></div>')) {
  throw new Error('Marqueur <div id="root"></div> introuvable dans dist/index.html.');
}

const ORIGIN = 'https://foundrydevs.codes';

/**
 * Métadonnées par route. Sans cela chaque page hériterait du titre, de la
 * description et surtout du `canonical` de l'accueil : deux URL déclarées
 * identiques, et les moteurs n'en indexent qu'une. C'est une préoccupation de
 * build, elle n'a rien à faire dans le bundle client.
 */
const META = {
  '/': null, // l'accueil garde le gabarit tel quel
  '/labo': {
    title:
      'Banc d’essai — neuf IA gèrent un portefeuille | Foundry Devs',
    description:
      'Neuf modèles de langage gèrent chacun un portefeuille simulé sur les mêmes données de marché. Résultats comparés à l’indice de référence. Une démonstration technique signée Foundry Devs, collectif de développeurs à Toulouse.',
  },
};

const escape = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/** Remplace le contenu des balises de tête pour une route donnée. */
function applyMeta(html, route) {
  const meta = META[route];
  if (!meta) return html;

  // Sans barre finale, en accord avec `trailingSlash: false` de vercel.json :
  // une seule URL canonique par page, pas de doublon /labo et /labo/.
  const url = route === '/' ? `${ORIGIN}/` : `${ORIGIN}${route}`;
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(meta.title)}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[\s\S]*?(")/,
      `$1${escape(meta.description)}$2`,
    )
    .replace(
      /(<link rel="canonical" href=")[^"]*(")/,
      `$1${url}$2`,
    )
    .replace(
      /(<meta property="og:title"\s+content=")[\s\S]*?(")/,
      `$1${escape(meta.title)}$2`,
    )
    .replace(
      /(<meta\s+property="og:description"\s+content=")[\s\S]*?(")/,
      `$1${escape(meta.description)}$2`,
    )
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(
      /(<meta\s+name="twitter:title"\s+content=")[\s\S]*?(")/,
      `$1${escape(meta.title)}$2`,
    )
    .replace(
      /(<meta\s+name="twitter:description"\s+content=")[\s\S]*?(")/,
      `$1${escape(meta.description)}$2`,
    );
}

for (const route of ROUTES) {
  const html = applyMeta(template, route).replace(
    '<div id="root"></div>',
    `<div id="root">${render(route)}</div>`,
  );

  const target = path.join(distDir, fileForRoute(route));
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, html);
  console.log(`  ${route} → ${path.relative(distDir, target)}`);
}

rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });

console.log(`Prérendu injecté pour ${ROUTES.length} route(s).`);
