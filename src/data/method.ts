export type Phase = {
  readonly title: string;
  readonly summary: string;
  /** Livrable concret et vérifiable. Aucune promesse chiffrée. */
  readonly deliverable: string;
};

export const phases: readonly Phase[] = [
  {
    title: 'Cadrer',
    summary:
      'Nous clarifions le besoin, les contraintes techniques et ce qui ne sera pas fait.',
    deliverable: 'Un périmètre écrit, une architecture cible et un chiffrage.',
  },
  {
    title: 'Prototyper',
    summary:
      'Nous rendons l’idée manipulable avant d’écrire la première ligne de production.',
    deliverable: 'Une maquette navigable ou un prototype fonctionnel.',
  },
  {
    title: 'Construire',
    summary:
      'Nous livrons par incréments visibles, sur un environnement que vous pouvez tester.',
    deliverable: 'Des mises en préproduction régulières et un suivi partagé.',
  },
  {
    title: 'Faire évoluer',
    summary:
      'Nous transmettons un produit maintenable, puis nous l’accompagnons dans la durée.',
    deliverable: 'Un dépôt documenté, une passation et un plan d’évolution.',
  },
];

export type Member = {
  readonly name: string;
  readonly role: string;
  /** Photo réelle uniquement. `null` déclenche un rendu typographique. */
  readonly photo: string | null;
  /** Profil GitHub public, ou `null`. */
  readonly github?: string | undefined;
};

/**
 * Aucun portrait n'est généré : sans photo réelle, la carte est composée
 * typographiquement à partir des initiales.
 */
export const members: readonly Member[] = [
  {
    name: 'Malou Valdes',
    role: 'Développeur full-stack',
    photo: null,
    github: 'https://github.com/dnkrow',
  },
  {
    name: 'Lucas N.',
    role: 'Développeur full-stack',
    photo: null,
    github: 'https://github.com/LucasN-ux',
  },
  {
    name: 'Mario Colomas',
    role: 'Développeur full-stack',
    photo: null,
    github: 'https://github.com/Writingway',
  },
  {
    name: 'Matéo Marques',
    role: 'Développeur full-stack',
    photo: null,
    github: 'https://github.com/serkam31',
  },
];
