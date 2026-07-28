# CLAUDE.md

Instructions pour Claude Code sur ce dépôt. À lire avant toute modification.

Le site est le portfolio d'**Atelier Rose**, collectif de développeurs
indépendants à Toulouse. Page unique, sept chapitres, français.

---

## Commandes

```bash
npm run dev        # serveur de développement — http://localhost:5173
npm run build      # tsc -b puis vite build
npm run typecheck  # types seuls
npm run images     # régénère public/assets et public/og.png depuis assets-source/
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

### Deux pièges déjà rencontrés

1. **`gsap.matchMedia` imbriqué dans un `gsap.context` perd ses écouteurs** au
   double montage de StrictMode et ne se réarme jamais au redimensionnement.
   Utilisez `useResponsiveAnimation` de `src/lib/motion.ts`.
2. **Le patron CSS `grid-template-rows: 0fr → 1fr` retombe à zéro** ici :
   `min-height: 0` annule la contribution min-content de la piste. Les
   ouvertures de panneaux passent par le composant `Collapse`, qui mesure
   `scrollHeight` et anime avec GSAP.

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

Les valeurs manquantes sont des placeholders entre crochets (`[PROJET 01]`,
`[EMAIL]`) et **s'affichent comme tels** dans la page — l'helper
`isPlaceholder()` de `src/data/site.ts` adapte le rendu. Ne les masquez pas,
ne les remplacez pas par du contenu plausible : remplacez-les uniquement par
des informations réelles fournies par l'équipe.

Sans photo de membre, le rendu est une composition typographique. On ne génère
pas de portrait.

---

## Images

Un seul visuel généré porte le site, réutilisé par recadrage à quatre endroits
(voir README). **Ne générez pas de nouveau média sans accord explicite** — les
générations sont payantes. Privilégiez toujours un recadrage, un masque ou un
changement de composition sur l'existant.

Nouveau visuel : déposer dans `assets-source/`, lancer `npm run images`, puis
utiliser le composant `Picture`. Toujours renseigner `width`/`height` pour
réserver la place. Jamais de hotlink vers un média distant.

---

## À compléter avant mise en ligne

- `src/data/site.ts` — url, email, LinkedIn, GitHub, disponibilité
- `src/data/projects.ts` — les quatre fiches et leurs captures
- `src/data/method.ts` — membres du collectif
- `index.html`, `public/robots.txt`, `public/sitemap.xml` —
  remplacer `REMPLACER-PAR-VOTRE-DOMAINE.fr`
- Variables d'environnement du formulaire chez l'hébergeur
