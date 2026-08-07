# Foundry Devs — site vitrine

Site portfolio d'un collectif de développeurs indépendants basé à Toulouse.
Deux pages prérendues : l'accueil, en sept chapitres qui s'enchaînent au
scroll, et `/labo`, le banc d'essai public. Thème clair avec une seule bascule
vers le vert nuit, pour le contact et le pied de page.

---

## Démarrer

```bash
npm install
```

```bash
npm run dev
```

Le site est servi sur <http://localhost:5173>.

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Types, bundle client, bundle SSR, puis prérendu des routes dans `dist/` |
| `npm run preview` | Sert le build de production localement |
| `npm run typecheck` | Vérification TypeScript seule |
| `npm run images` | Régénère `public/og.jpg` et décline `assets-source/` en AVIF/WebP/JPEG |

---

## Stack

- **Vite 8** + **React 19** + **TypeScript strict**
  (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess` activés)
- **CSS Modules** par composant, jetons partagés dans `src/styles/tokens.css`
- **GSAP + ScrollTrigger** : moteur d'animation unique
- **Lenis** : interpolation du scroll uniquement, branchée sur le ticker GSAP
- **Polices auto-hébergées** (`public/fonts/`), aucun CDN tiers

---

## Structure

```
src/
  data/          Contenus éditoriaux, séparés de la présentation
    site.ts        identité, coordonnées, navigation
    projects.ts    fiches projets
    expertise.ts   domaines de compétence
    method.ts      phases de travail et membres
  routes.ts      Table des routes prérendues
  App.tsx        Compose la page selon la route — pas de routeur client
  entry-server.tsx  Rend le HTML au build ; main.tsx l'hydrate ensuite
  lib/motion.ts  Hooks d'animation, smooth scroll, magnétisme
  styles/        fonts.css, tokens.css, global.css
  components/    Un dossier par section, .tsx + .module.css
api/
  contact.ts     Formulaire de contact (format Web standard)
  snapshot.ts    Instantané du banc d'essai : POST authentifié, GET public
scripts/         images, bannière, et prerender.mjs (un HTML par route)
brand/           logo, déclinaisons et bannières de profil
public/          fonts, favicon, og.jpg, robots.txt, sitemap.xml
```

**Pour modifier un contenu, éditez `src/data/` — jamais les composants.**

### Pages et prérendu

Le site reste un multi-pages classique : `npm run build` écrit un fichier HTML
complet par route, et passer d'une page à l'autre est une navigation
navigateur normale. Ajouter une page tient en deux gestes — la déclarer dans
`ROUTES` (`src/routes.ts`), et lui donner ses métadonnées dans la table `META`
de `scripts/prerender.mjs`. Sans la première, elle est servie vide ; sans la
seconde, elle hérite du `canonical` de l'accueil et les moteurs n'en indexent
qu'une.

Le HTML est ensuite **hydraté**, pas reconstruit. Le premier rendu doit donc
être identique côté serveur et côté client : tout ce qui dépend du navigateur
— données distantes, dimensions, heure — s'affiche après montage. `Lab.tsx`
sert de référence.

---

## Ce qui reste à compléter

Le site est en ligne et fonctionnel. Ce qui manque encore apparaît entre
crochets et **s'affiche comme tel** dans la page, plutôt que d'être masqué :
rien n'est inventé pour combler.

| Fichier | Reste à renseigner |
| --- | --- |
| `src/data/projects.ts` | La quatrième fiche — MAMA Bloom, Matrix Trader Pro et Maison Qalya sont renseignés |
| `src/data/method.ts` | Les portraits des quatre membres |
| `src/data/site.ts` | `linkedin`, `github`, `availability` — en attente des profils du collectif |

Identité, domaine, adresse de contact et les quatre membres sont en place.

Pour ajouter une capture de projet : déposez le fichier dans `assets-source/`,
lancez `npm run images`, puis renseignez `image`, `imageAlt` et `imageWidths`
dans `projects.ts`. Inscrivez aussi le nom du fichier dans `UI_CAPTURES`
(`scripts/build-images.mjs`) s'il s'agit d'une capture d'interface : les
réglages d'encodage de la photographie brouillent le texte fin.

Le cadre des fiches projets suit le rapport de la capture de MAMA Bloom
(1690 × 912). Cadrez les suivantes au même rapport, sinon elles seront
rognées.

Tant qu'aucune photo de membre n'est fournie, chaque personne est représentée
par une composition typographique — aucun portrait n'est généré.

---

## Formulaire de contact

`api/contact.ts` est écrit au format Web standard (`Request`/`Response`) : il
fonctionne sur Vercel Functions, Netlify Functions et tout runtime compatible.
Aucun fournisseur n'est câblé en dur, aucun secret ne transite par le client.

Deux modes, choisis par variables d'environnement :

```bash
# Option A — transmettre à un service (e-mail, automatisation, CRM)
CONTACT_WEBHOOK_URL=https://…
```

```bash
# Option B — envoi direct par l'API HTTP de Resend
RESEND_API_KEY=…
CONTACT_TO=contact@votre-domaine.fr
CONTACT_FROM=site@votre-domaine.fr
```

```bash
# Option C — envoi direct par l'API HTTP de Brevo (en place)
BREVO_API_KEY=…
CONTACT_TO=devsfoundry@gmail.com
CONTACT_FROM=devsfoundry@gmail.com   # expéditeur validé côté Brevo
```

**En production, c'est Brevo qui est branché**, vérifié par un envoi réel : le
message arrive en boîte de réception. Le champ « répondre à » porte l'adresse
du prospect, il suffit donc de répondre au message reçu.

**Sans configuration, la route répond 503** avec un message explicite. Le
formulaire n'annonce jamais un envoi qui n'a pas eu lieu — y compris en
développement, où la route n'existe pas : le client refuse toute réponse qui
n'est pas du JSON.

Pour tester la route localement, utilisez le runtime de votre hébergeur
(`vercel dev` par exemple) plutôt que `npm run dev`.

---

## Banc d'essai — `/labo`

Neuf modèles de langage gèrent chacun un portefeuille simulé. Les chiffres
viennent d'un bot externe, jamais du site : il publie un instantané sur
`api/snapshot.ts`, la page le lit.

```bash
SNAPSHOT_TOKEN=…   # le POST y est authentifié ; sans lui, la route répond 503
```

- **POST** — réservé au bot, `Authorization: Bearer <token>`. Le corps est
  re-filtré côté serveur sur une liste blanche : un champ que le bot n'aurait
  pas dû pousser est ignoré, pas publié. L'instantané est stocké sur Vercel
  Blob.
- **GET** — public, en lecture seule, même origine : la CSP du site est en
  `connect-src 'self'`, la page ne peut donc pas appeler un domaine de
  stockage directement.

Le texte explicatif de la page est prérendu — c'est lui qui porte le
référencement. Les chiffres n'arrivent qu'après montage : le serveur n'a pas
de données au build, et l'hydratation doit rester propre.

Le bot tourne sur une machine qui peut être éteinte. La page distingue donc
l'âge des **données** de celui de la **publication**, plutôt que d'afficher
des chiffres périmés comme s'ils étaient frais.

---

## Parti pris de motion

Le mouvement raconte le passage de l'idée au produit. Chaque animation a une
fonction ; aucune n'est décorative.

- **Hero** — la scène est collée pendant une hauteur de défilement
  supplémentaire : le média occupe d'abord tout l'écran, puis se contracte en
  fenêtre intégrée à la page (`clip-path` piloté au scroll) pendant que le
  titre se recompose. Desktop uniquement.
- **Titres** — construction ligne par ligne, par translation dans un masque.
  Le texte reste dans le flux et jamais à `opacity: 0`.
- **Projets** — pile collée sur desktop, un projet dominant à la fois, fond
  très légèrement décalé d'une carte à l'autre. Le détail technique se révèle
  au survol **et au focus clavier**.
- **Contact** — transition de section par masque vers le vert nuit.
- **Bouton d'envoi** — effet d'impression : le bouton s'enfonce et diffuse une
  empreinte d'encre. Le chargement est un filet qui se remplit, pas un
  rotateur générique.

`prefers-reduced-motion` est respecté partout : le smooth scroll est désactivé,
les timelines ne sont pas créées, et la composition finale s'affiche
directement. Le smooth scroll est également désactivé sur pointeur grossier
pour ne jamais interférer avec le défilement tactile.

---

## Accessibilité

Vérifié sur le rendu réel, pas seulement dans le code :

- Contraste **AA sur l'ensemble des textes** (180 nœuds mesurés, y compris les
  fonds semi-transparents composés couche par couche)
- Navigation clavier complète, anneau de focus visible à 2 px sur l'accent
- Lien d'évitement, un seul `h1`, hiérarchie de titres cohérente, `lang="fr"`
- Menu mobile : piège de focus, fermeture par `Échap`, focus rendu au bouton,
  panneau replié rendu `inert`
- Formulaire : labels visibles au-dessus des champs (jamais de placeholder en
  guise de label), `aria-invalid`, erreurs par champ, `role="status"` +
  `aria-live="polite"` pour les changements d'état
- Cibles tactiles ≥ 24 px (WCAG 2.5.8)

---

## Visuels

**Un seul visuel généré** porte le site : `assets-source/hero.png` (Higgsfield,
Seedream 5.0 Pro, 2720 × 1536). Il est réutilisé cinq fois par recadrage,
jamais dupliqué :

| Emplacement | Traitement |
| --- | --- |
| Fond du hero | plein cadre, `object-position: 60% 50%` |
| Manifeste | macro-recadrage à 1,32×, glissant au scroll |
| Aperçus Expertise | cinq points d'ancrage différents, un par domaine |
| `public/og.jpg` | recadrage 1200 × 630 |
| Bannière de profil | bande panoramique, `scripts/build-banner.mjs` |

`npm run images` régénère l'ensemble : quatre largeurs × trois formats (AVIF,
WebP, JPEG), soit 19 Ko en AVIF 640 et 99 Ko en AVIF 1600.

Le reste n'est pas généré : les fiches projets portent des **captures réelles**
des sites livrés (1690 × 912), et les compositions SVG de
`src/components/Surface/` ne servent plus que pour les emplacements encore
vides. Aucun portrait n'est généré.

---

## Déploiement

**En ligne : <https://foundrydevs.codes>**

Le build produit un site statique dans `dist/` — un fichier HTML complet par
route — plus les fonctions serveur de `/api/contact` et `/api/snapshot` : le
dossier `api/` est détecté automatiquement.

```bash
vercel deploy --prod
```

`vercel.json` fixe les en-têtes de cache : un an immuable sur les polices,
un jour avec revalidation en arrière-plan sur les images.

### Deux points à connaître

**TypeScript est épinglé en 5.9.** Le builder de fonctions Vercel utilise le
TypeScript du projet et échoue avec la 7.x, dont l'API interne diffère
(`Cannot read properties of undefined (reading 'readFile')`). Ne remontez pas
la version sans vérifier que le déploiement passe encore.

**Le formulaire répond 503 tant que le transport n'est pas configuré.** C'est
volontaire. Déclarez les variables d'environnement (voir plus haut) dans les
réglages du projet, puis redéployez.

Le domaine `foundrydevs.codes` et son `www` sont rattachés au projet Vercel.
Pour en changer, remplacez-le à cinq endroits : `index.html`,
`public/robots.txt`, `public/sitemap.xml`, `src/data/site.ts` et la constante
`ORIGIN` de `scripts/prerender.mjs`.
