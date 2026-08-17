/**
 * Table des routes prérendues.
 *
 * Le site reste multi-pages classique : chaque route est un fichier HTML
 * complet écrit au build, et la navigation entre pages est une navigation
 * navigateur normale. Pas de routeur client, pas de dépendance en plus —
 * les ancres internes de la page d'accueil continuent de fonctionner comme
 * avant, et chaque page a sa propre URL indexable.
 *
 * Ajouter une route ici suffit : `scripts/prerender.mjs` la génère.
 */

export const ROUTES = ['/', '/agences', '/labo'] as const;

export type Route = (typeof ROUTES)[number];

/** Normalise une URL entrante vers une route connue. `/` par défaut. */
export function toRoute(pathname: string): Route {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return (ROUTES as readonly string[]).includes(clean) ? (clean as Route) : '/';
}

/** Chemin du fichier généré pour une route. */
export const fileForRoute = (route: string): string =>
  route === '/' ? 'index.html' : `${route.replace(/^\//, '')}/index.html`;
