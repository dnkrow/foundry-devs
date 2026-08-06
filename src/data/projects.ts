/**
 * Projets présentés dans le portfolio.
 *
 * Rien n'est inventé ici : chaque entrée est un gabarit à compléter avec des
 * données réelles. Remplacer les valeurs entre crochets, poser la capture dans
 * `public/assets/projets/` et renseigner `image`. Un projet dont `image` vaut
 * `null` affiche une composition de substitution, pas une fausse capture.
 */

export type Project = {
  /** Identifiant d'ancre, en minuscules sans accent. */
  readonly id: string;
  readonly name: string;
  /** Type de produit : « Application métier », « Site éditorial »… */
  readonly kind: string;
  /** Rôle tenu par l'atelier sur le projet. */
  readonly role: string;
  readonly year: string;
  readonly stack: readonly string[];
  /** Objectif poursuivi ou résultat constaté. Aucun chiffre non vérifié. */
  readonly outcome: string;
  /**
   * Nom de base du fichier dans `public/assets`, sans largeur ni extension —
   * déposez la source dans `assets-source/` et lancez `npm run images`.
   * `null` tant qu'aucune capture n'est fournie.
   */
  readonly image: string | null;
  /** Texte alternatif décrivant la capture. Obligatoire dès que `image` existe. */
  readonly imageAlt: string | null;
  /** Largeurs réellement générées, si la source ne couvre pas toute l'échelle. */
  readonly imageWidths?: readonly number[] | undefined;
  /** Lien vers l'étude de cas ou le site en ligne, ou `null`. */
  readonly href: string | null;
  /** Libellé du lien. Il doit dire où il mène : un site en ligne n'est pas
   *  une étude de cas. Par défaut « Voir l'étude de cas ». */
  readonly hrefLabel?: string | undefined;
};

export const projects: readonly Project[] = [
  {
    id: 'mama-bloom',
    name: 'MAMA Bloom',
    kind: 'Application web de suivi de grossesse',
    role: 'Conception et développement',
    year: '2026',
    stack: ['Next.js 16', 'TypeScript', 'Prisma / PostgreSQL', 'Tailwind CSS'],
    outcome:
      'Accompagner la grossesse semaine après semaine, sur un ton chaleureux et jamais clinique. Les données de santé sont hébergées en France, chez un hébergeur agréé HDS.',
    image: 'mama-bloom',
    imageAlt:
      'Page d’accueil de MAMA Bloom : titre éditorial « Ta grossesse, accompagnée semaine après semaine » et photographie d’une femme enceinte dans une pièce claire.',
    imageWidths: [640, 1024, 1600],
    href: 'https://app.mama-bloom.fr',
    hrefLabel: 'Voir le site en ligne',
  },
  {
    id: 'matrix-trader',
    name: 'Matrix Trader Pro',
    kind: 'Banc d’essai algorithmique multi-agents',
    role: 'Conception et développement',
    year: '2026',
    stack: ['Python 3.12', 'Architecture multi-processus', 'LLM en cascade', 'Alpaca (paper)'],
    outcome:
      'Neuf agents pilotés par des modèles de langage gèrent chacun un portefeuille simulé, sur les mêmes données et sous la même contrainte de risque. La question posée est falsifiable : battre l’indice de référence, et pouvoir le prouver. D’où une référence naïve sans modèle, des groupes de contrôle et une mesure publiée y compris quand elle est défavorable.',
    image: 'matrix-trader',
    imageAlt:
      'Tableau de bord de Matrix Trader Pro sur fond sombre : bandeau de synthèse, indicateur de régime de marché, et une grille de neuf agents affichant chacun la valeur de son portefeuille, sa performance face à l’indice et sa courbe d’évolution.',
    // La source fait 1690 px de large : annoncer 2048 dans le srcset
    // pointerait vers un fichier que le script ne génère pas.
    imageWidths: [640, 1024, 1600],
    href: '/labo',
    hrefLabel: 'Voir le banc d’essai en direct',
  },
  {
    id: 'projet-03',
    name: '[PROJET 03]',
    kind: '[Type de produit]',
    role: '[Rôle de l’atelier]',
    year: '[Année]',
    stack: ['[Technologie]', '[Technologie]', '[Technologie]'],
    outcome: '[Objectif du projet ou résultat réellement constaté.]',
    image: null,
    imageAlt: null,
    href: null,
  },
  {
    id: 'projet-04',
    name: '[PROJET 04]',
    kind: '[Type de produit]',
    role: '[Rôle de l’atelier]',
    year: '[Année]',
    stack: ['[Technologie]', '[Technologie]', '[Technologie]'],
    outcome: '[Objectif du projet ou résultat réellement constaté.]',
    image: null,
    imageAlt: null,
    href: null,
  },
];
