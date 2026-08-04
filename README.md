# Foundry Devs — site vitrine

Site portfolio d'un collectif de développeurs indépendants basé à Toulouse.
Page unique, sept chapitres, thème clair avec une seule bascule vers le vert
nuit pour le contact et le pied de page.

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
| `npm run build` | Vérification des types puis build de production dans `dist/` |
| `npm run preview` | Sert le build de production localement |
| `npm run typecheck` | Vérification TypeScript seule |
| `npm run images` | Régénère `public/og.png` et décline `assets-source/` en AVIF/WebP/JPEG |

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
  lib/motion.ts  Hooks d'animation, smooth scroll, magnétisme
  styles/        fonts.css, tokens.css, global.css
  components/    Un dossier par section, .tsx + .module.css
api/contact.ts   Route serveur du formulaire (format Web standard)
scripts/         og.svg et chaîne de traitement d'images
public/          fonts, favicon, og.png, robots.txt, sitemap.xml
```

**Pour modifier un contenu, éditez `src/data/` — jamais les composants.**

---

## À compléter avant mise en ligne

Le site est fonctionnel mais volontairement incomplet : rien n'a été inventé.
Chaque valeur manquante apparaît entre crochets et **s'affiche comme telle**
dans la page, plutôt que d'être masquée.

| Fichier | À renseigner |
| --- | --- |
| `src/data/site.ts` | `url`, `email`, `linkedin`, `github`, `availability` |
| `src/data/projects.ts` | Les 4 fiches projets, leurs captures et leurs liens |
| `src/data/method.ts` | Noms, rôles et photos des membres |

Le domaine `foundrydevs.codes` est déjà en place dans `index.html`,
`public/robots.txt`, `public/sitemap.xml` et `src/data/site.ts`.

Pour ajouter une capture de projet : déposez le fichier dans `assets-source/`,
lancez `npm run images`, puis renseignez `image` et `imageAlt` dans
`projects.ts`. Les dimensions sont réservées côté CSS, le CLS reste nul.

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

**Un seul visuel** porte tout le site : `assets-source/hero.png`, image générée
(Higgsfield, Seedream 5.0 Pro, 2720 × 1536). Elle est réutilisée quatre fois
par recadrage, jamais dupliquée :

| Emplacement | Traitement |
| --- | --- |
| Fond du hero | plein cadre, `object-position: 60% 50%` |
| Manifeste | macro-recadrage à 1,32×, glissant au scroll |
| Aperçus Expertise | cinq points d'ancrage différents, un par domaine |
| `public/og.png` | recadrage 1200 × 630 |

`npm run images` régénère l'ensemble : quatre largeurs × trois formats (AVIF,
WebP, JPEG), soit 19 Ko en AVIF 640 et 99 Ko en AVIF 1600.

Les compositions SVG de `src/components/Surface/` restent utilisées pour les
fiches projets, en attendant les captures réelles. Aucun portrait n'est généré.

---

## Déploiement

**En ligne : <https://foundrydevs.codes>**

Le build produit un site statique dans `dist/`, plus une fonction serveur pour
`/api/contact` — le dossier `api/` est détecté automatiquement.

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
Pour en changer, remplacez-le dans `index.html`, `public/robots.txt`,
`public/sitemap.xml` et `src/data/site.ts`.
