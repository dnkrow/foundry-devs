# CLAUDE.md

Instructions pour Claude Code sur ce dépôt. À lire avant toute modification.

Le site est le portfolio de **Foundry Devs**, collectif de développeurs
indépendants à Toulouse. Page unique, sept chapitres, français.

---

## Commandes

```bash
npm run dev        # serveur de développement — http://localhost:5173
npm run build      # tsc -b puis vite build
npm run typecheck  # types seuls
npm run images     # régénère public/assets et public/og.jpg depuis assets-source/
```

**Le build doit passer avant toute livraison.** TypeScript est en mode strict
avec `exactOptionalPropertyTypes` et `noUncheckedIndexedAccess` : une prop
optionnelle se déclare `foo?: string | undefined`, et l'accès par index renvoie
`T | undefined`.

Le formulaire de contact ne fonctionne pas sous `npm run dev` (la route
`api/contact.ts` n'est pas servie). Utilisez le runtime de l'hébergeur, par
exemple `vercel dev`. Ce n'est pas un bug.

---

## Architecture

```
src/data/        Contenus. C'est ici qu'on édite les textes, pas dans les composants.
src/lib/motion.ts  Hooks GSAP, smooth scroll, magnétisme.
src/styles/      fonts.css (auto-hébergées), tokens.css (palette, échelle), global.css
src/components/  Un dossier par section : Section.tsx + Section.module.css
api/contact.ts   Route serveur, format Web standard (Request/Response)
```

Règle : **les données ne vivent jamais dans les composants.** Pour changer un
projet, une expertise ou une coordonnée, éditez `src/data/`.

---

## Direction artistique

Concept : « le code comme matière en mouvement ».

- Fond calcaire `#EEF1EE`, encre `#18201E`, **un seul accent** : vert `#315E50`.
  Vert nuit `#173D33` réservé au contact et au pied de page — c'est la seule
  bascule sombre du site, n'en ajoutez pas d'autre.
- Typographie : Schibsted Grotesk (titres, tracking serré), Inter Tight (texte),
  Instrument Serif italique pour **un seul mot par grand titre** — classe
  `.accent-word`. Ce motif est structurant, ne le généralisez pas.
- Composition asymétrique, beaucoup d'espace négatif. Pas de grille de trois
  cartes identiques, pas de hero centré, pas de badges marketing.

### Interdits

Fond noir à dégradé violet ou cyan, glow néon, esthétique crypto ou « IA
générique », pluie de particules, faux terminal décoratif, curseur
personnalisé, plus d'un marquee, jargon creux.

---

## Motion

**GSAP est le moteur unique.** Lenis ne fait qu'interpoler la position de
scroll et délègue son horloge au ticker GSAP.

- Jamais de listener `scroll` qui met à jour un state React. Utilisez
  ScrollTrigger et écrivez dans des attributs `data-*` (voir `Nav.tsx`).
- Jamais deux moteurs sur le même élément.
- Ne masquez pas une section à `opacity: 0` en attendant son entrée dans le
  viewport. Les révélations se font par **translation dans un masque**
  (`.line-mask`), le texte reste dans le flux.
- Durées : 500–900 ms pour les grands changements, 180–300 ms pour les
  micro-interactions. Easing physique (`power3.out`).
- Magnétisme réservé au **seul** CTA du hero.
- `prefers-reduced-motion` doit être respecté partout : `useAnimation` ne crée
  rien, et la composition finale s'affiche directement.

### Trois pièges déjà rencontrés

1. **`gsap.matchMedia` imbriqué dans un `gsap.context` perd ses écouteurs** au
   double montage de StrictMode et ne se réarme jamais au redimensionnement.
   Utilisez `useResponsiveAnimation` de `src/lib/motion.ts`.
2. **Le patron CSS `grid-template-rows: 0fr → 1fr` retombe à zéro** ici :
   `min-height: 0` annule la contribution min-content de la piste. Les
   ouvertures de panneaux passent par le composant `Collapse`, qui mesure
   `scrollHeight` et anime avec GSAP.
3. **`.line-mask` tranche l'italique.** Instrument Serif descend à 0.21em sous
   la ligne de base, et la boucle du « g » déborde de 0.08em **à gauche** de
   l'origine du texte : un mot en `.accent-word` qui ouvre sa ligne se fait
   couper par l'`overflow`. Les réserves sont dans `global.css`, compensées par
   des marges négatives. Si vous les touchez, ajustez aussi le `yPercent` de
   départ des révélations, sinon le texte apparaît avant son entrée.

Chaque animation doit servir une fonction : hiérarchie, progression narrative,
retour utilisateur ou transition d'état. Pas d'animation décorative.

---

## Accessibilité — non négociable

- Contraste **AA sur tous les textes**, y compris sur fond semi-transparent
  (composez les couches avant de conclure).
- Navigation clavier complète, anneau de focus visible.
- Formulaire : labels **visibles au-dessus** des champs. Jamais de placeholder
  en guise de label. `aria-invalid`, erreurs par champ, `role="status"` +
  `aria-live="polite"` pour les états.
- Un panneau replié doit être `inert`.
- Cibles tactiles ≥ 24 px (WCAG 2.5.8).
- Alt descriptif sur toute image porteuse de sens ; `alt=""` si décorative.

---

## Contenus — la règle la plus importante

**N'inventez jamais de donnée commerciale.** Ni client, ni témoignage, ni
chiffre de performance, ni logo, ni portrait, ni adresse, ni disponibilité.

Les valeurs manquantes sont des placeholders entre crochets (`[PROJET 02]`,
`[Type de produit]`) et **s'affichent comme tels** dans la page — l'helper
`isPlaceholder()` de `src/data/site.ts` adapte le rendu. Ne les masquez pas,
ne les remplacez pas par du contenu plausible : remplacez-les uniquement par
des informations réelles fournies par l'équipe.

Sans photo de membre, le rendu est une composition typographique. On ne génère
pas de portrait.

---

## Images

Un seul visuel généré porte le site — `assets-source/hero.png` — réutilisé par
recadrage à cinq endroits : fond du hero, macro-recadrage du manifeste, aperçus
de l'expertise, image de partage et bannière de profil. **Ne générez pas de
nouveau média sans accord explicite**, les générations sont payantes.
Privilégiez toujours un recadrage, un masque ou un changement de composition.

Nouveau visuel : déposer dans `assets-source/`, lancer `npm run images`, puis
utiliser le composant `Picture`. Toujours renseigner `width`/`height` pour
réserver la place. Jamais de hotlink vers un média distant.

Deux points appris à l'usage :

- **Une capture d'interface n'est pas une photographie.** Les réglages
  d'encodage calibrés pour la photo laissent un halo autour du texte fin.
  Inscrivez le nom du fichier dans `UI_CAPTURES` (`scripts/build-images.mjs`)
  pour un encodage haute qualité.
- **`sizes` doit refléter la largeur réelle**, pas une approximation en `vw` :
  au-delà de 96rem les cartes sont plafonnées par le shell et cessent de
  suivre le viewport. Un `vw` y fait télécharger une image trop petite, donc
  floue. Mesurez sur le rendu avant d'écrire la valeur.

La bannière de profil se régénère par
`node scripts/build-banner.mjs [largeur] [hauteur] [left|right]`.

---

## Marque

Le logo est de Lucas : `public/logo-mark.svg` (symbole seul, dans la nav),
`brand/logo-lockup.svg` et les exports PNG. `brand/FoundryDevsTypo.png` porte
le lockup complet en raster, avec transparence — utile en composition, car les
rendus SVG hors navigateur ne chargent pas les polices embarquées et retombent
sur une police de substitution.

Le rose `#D94F70` de la marque n'existe **que** sur le logo. L'interface reste
sur l'accent vert. N'introduisez pas de rose dans le site.

---

## Déploiement

Production : <https://foundrydevs.codes>, projet Vercel `agence`.

```bash
vercel deploy --prod
```

**TypeScript est épinglé en 5.9.** Le builder de fonctions Vercel utilise le
TypeScript du projet et échoue avec la 7.x, dont l'API interne diffère
(`Cannot read properties of undefined (reading 'readFile')`). Ne remontez pas
la version sans vérifier que le déploiement passe.

Le formulaire est **actif** : transport Brevo, variables `BREVO_API_KEY`,
`CONTACT_TO` et `CONTACT_FROM` définies sur le projet Vercel. Sans elles la
route répond 503 plutôt que de simuler un envoi.

---

## Travail à plusieurs

Le dépôt est partagé entre quatre personnes. **`git pull --rebase` avant de
commencer et avant chaque push.** Jamais de `git push --force` : cela efface le
travail des autres sans avertissement.

---

## État des contenus

Renseignés : identité, domaine, coordonnées, les quatre membres, et trois
projets (MAMA Bloom, Matrix Trader Pro, Maison Qalya).

Restent des placeholders visibles : la quatrième fiche projet et les portraits
des membres. Ils s'affichent tels quels dans la page — c'est voulu, ne les
masquez pas et ne les comblez pas.

Maison Qalya est une **marque fictive**, assumée comme telle dans la fiche et
dans le pied de page de la démonstration : c'est une vitrine de savoir-faire,
pas un client. Ne la présentez jamais comme une référence commerciale.

Une fiche peut porter une vidéo (`video` dans `src/data/projects.ts`). Elle se
superpose à la capture, qui reste le repli et porte le texte alternatif : même
rapport 1690 × 912, sinon les deux ne se recouvrent pas. La lecture ne démarre
qu'à l'entrée dans le viewport, et jamais sous `prefers-reduced-motion`.
Attention aussi à la longueur de `kind`, `role` et `outcome` : la hauteur du
cadre média suit celle de la colonne de texte, et une fiche plus bavarde que
les autres se retrouve plus haute, donc sa capture plus rognée en hauteur.

Chantier connu, non engagé : le HTML servi ne contient aucun titre, tout le
contenu étant injecté par React. Un prérendu au build est nécessaire pour que
les moteurs voient la page.
