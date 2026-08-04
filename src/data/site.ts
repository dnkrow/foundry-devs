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
  tagline: 'Studio de développement indépendant',
  city: 'Toulouse',
  area: 'Toulouse et à distance',
  url: 'https://foundrydevs.codes',
  description:
    'Foundry Devs est un collectif de développeurs à Toulouse : sites web sur mesure, applications, intégration IA, API et back-end.',
} as const;

export const contact = {
  email: 'devsfoundry@gmail.com',
  linkedin: '[URL LINKEDIN]',
  github: '[URL GITHUB]',
  /** Ne renseigner que si la disponibilité est réelle, sinon laisser `null`. */
  availability: null as string | null,
} as const;

export const navItems = [
  { id: 'projets', label: 'Projets' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'collectif', label: 'Collectif' },
  { id: 'contact', label: 'Contact' },
] as const;
