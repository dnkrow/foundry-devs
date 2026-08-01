/**
 * Embarque Schibsted Grotesk dans le lockup « marque + nom ».
 *
 *   node brand/embed-fonts.mjs
 *
 * `lockup-source.svg` sort de l'outil de dessin avec une simple référence
 * `font-family: SchibstedGrotesk-Bold`. Sur une machine où la police n'est pas
 * installée — celle d'un client, d'un imprimeur, d'un webmail — le rendu
 * retombe silencieusement sur Arial : la marque part fausse sans que personne
 * s'en aperçoive.
 *
 * On réinjecte donc le woff2 du projet en base64 dans le fichier livrable. Il
 * pèse alors ~65 Ko, d'où sa place dans `brand/` et non dans `public/` : c'est
 * un fichier à transmettre, pas un fichier à servir.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(DIR, '..');

const SOURCE = path.join(DIR, 'lockup-source.svg');
const TARGET = path.join(DIR, 'logo-lockup.svg');
const FONT = path.join(ROOT, 'public', 'fonts', 'schibsted-grotesk-latin-wght-normal.woff2');

/**
 * Le nom de famille doit rester `SchibstedGrotesk-Bold` : c'est celui que la
 * source écrit dans ses classes. La police est variable (axe wght 400–900),
 * le `font-weight: 700` déjà présent y sélectionne le bold.
 */
const face = (base64) => `
    @font-face{font-family:'SchibstedGrotesk-Bold';font-weight:400 900;font-style:normal;src:url(data:font/woff2;base64,${base64}) format('woff2');}`;

const source = await readFile(SOURCE, 'utf8');
const base64 = (await readFile(FONT)).toString('base64');

// La source expose un unique bloc `<style>` : on s'y greffe plutôt que d'en
// ajouter un second, pour que le fichier reste lisible à la réouverture.
const marker = '<style>';
const at = source.indexOf(marker);
if (at === -1) {
  throw new Error(`Aucun bloc <style> dans ${path.basename(SOURCE)} : la source a changé de forme.`);
}

const out = source.slice(0, at + marker.length) + face(base64) + source.slice(at + marker.length);

await writeFile(TARGET, out, 'utf8');
console.log('%s  %d Ko', path.basename(TARGET), Math.round(out.length / 1024));
