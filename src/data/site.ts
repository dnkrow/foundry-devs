/**
 * Source unique des informations d'identité et de contact.
 *
 * Les valeurs entre crochets sont des PLACEHOLDERS à remplacer avant mise en
 * ligne. Aucune donnée commerciale n'est inventée : tant qu'une information
 * n'est pas fournie, elle reste explicitement marquée comme manquante et le
 * rendu l'affiche comme telle plutôt que de la masquer.
 */

/** Détecte un placeholder du type `[EMAIL]` pour adapter le rendu. */
export const isPlaceholder = (value: string): boolean =>
  value.startsWith('[') && value.endsWith(']');

export const site = {
  name: 'Foundry Devs',
  /** Positionnement en une ligne. Affiché en tête du hero, avec la ville. */
  tagline: 'Renfort technique et marque blanche',
  city: 'Toulouse',
  area: 'Toulouse et à distance',
  url: 'https://foundrydevs.codes',
  description:
    'Foundry Devs est un collectif de développeurs full-stack à Toulouse : renfort technique et sous-traitance en marque blanche pour les agences, applications web, API et intégration IA.',
} as const;

export const contact = {
  email: 'devsfoundry@gmail.com',
  /** Ne renseigner que si la disponibilité est réelle, sinon laisser `null`. */
  availability: null as string | null,
} as const;

export type NavItem = {
  readonly id: string;
  readonly label: string;
  /**
   * Route à part entière plutôt qu'ancre de la page d'accueil. Le lien est
   * alors suivi normalement par le navigateur : pas de défilement interne.
   */
  readonly href?: string | undefined;
};

export const navItems: readonly NavItem[] = [
  { id: 'agences', label: 'Pour les agences', href: '/agences' },
  { id: 'projets', label: 'Projets' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'collectif', label: 'Collectif' },
  { id: 'contact', label: 'Contact' },
];
