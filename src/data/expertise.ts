export type Expertise = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  /** Mots-clés affichés dans l'aperçu au survol : concrets, pas décoratifs. */
  readonly keywords: readonly string[];
};

export const expertise: readonly Expertise[] = [
  {
    id: 'sites-web',
    title: 'Sites web sur mesure',
    description:
      'Sites vitrines et éditoriaux dessinés au pixel, rapides à charger et simples à faire vivre au quotidien.',
    keywords: ['Rendu serveur', 'Core Web Vitals', 'Édition de contenu'],
  },
  {
    id: 'software',
    title: 'Applications et logiciels',
    description:
      'Interfaces métier, espaces clients et outils internes conçus pour rester clairs et faciles à faire évoluer.',
    keywords: ['Espaces authentifiés', 'Temps réel', 'Design système léger'],
  },
  {
    id: 'ia',
    title: 'Intégration IA',
    description:
      'Assistants, recherche sémantique et automatisations branchés sur vos données, avec des garde-fous explicites.',
    keywords: ['Recherche vectorielle', 'Appels d’outils', 'Garde-fous'],
  },
  {
    id: 'api',
    title: 'API et back-end',
    description:
      'Services, modèles de données et intégrations tierces : la mécanique fiable qui tient sous l’interface.',
    keywords: ['REST et typage', 'Schéma de données', 'Intégrations tierces'],
  },
  {
    id: 'full-stack',
    title: 'Full-stack',
    description:
      'Une seule équipe du schéma de base de données jusqu’à la dernière micro-interaction, sans zone grise.',
    keywords: ['Une équipe', 'Un dépôt', 'Une chaîne de livraison'],
  },
];
