// Injecte le HTML rendu côté serveur dans dist/index.html après le build
// client + le build SSR. dist-ssr est jetable, supprimé en fin de script.
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const ssrEntry = path.join(root, 'dist-ssr/entry-server.js');
const templatePath = path.join(root, 'dist/index.html');

const { render } = await import(`file://${ssrEntry.replaceAll('\\', '/')}`);

const template = readFileSync(templatePath, 'utf-8');
const appHtml = render();

if (!template.includes('<div id="root"></div>')) {
  throw new Error('Marqueur <div id="root"></div> introuvable dans dist/index.html.');
}

const html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
writeFileSync(templatePath, html);

rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });

console.log('Prérendu injecté dans dist/index.html.');
