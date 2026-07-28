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
  /** Chemin local vers la capture, ou `null` tant qu'elle n'est pas fournie. */
  readonly image: string | null;
  /** Texte alternatif décrivant la capture. Obligatoire dès que `image` existe. */
  readonly imageAlt: string | null;
  /** Lien vers l'étude de cas ou le site en ligne, ou `null`. */
  readonly href: string | null;
};

export const projects: readonly Project[] = [
  {
    id: 'projet-01',
    name: '[PROJET 01]',
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
    id: 'projet-02',
    name: '[PROJET 02]',
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
