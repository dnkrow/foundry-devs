import styles from './Picture.module.css';

/**
 * Largeurs produites par `npm run images`. Une source plus petite que la borne
 * haute n'est pas agrandie : il faut alors restreindre `widths`, sinon le
 * `srcset` annonce un fichier qui n'existe pas.
 */
const WIDTHS = [640, 1024, 1600, 2048] as const;

/**
 * `sizes` commun à toutes les réutilisations du visuel `hero`.
 *
 * Ces cinq emplacements pointent le *même* fichier : le navigateur ne retient
 * qu'un seul candidat pour l'ensemble et réemploie celui déjà en cache. Depuis
 * le prérendu, les recadrages réduits sont présents dès le HTML initial et
 * peuvent gagner la course : `hero-640` est alors téléchargé, puis réutilisé
 * pour le hero pleine largeur — qui devient flou jusqu'au rechargement.
 *
 * Déclarer la même largeur partout rend le choix déterministe : le candidat
 * retenu est celui du plus grand emplacement, et il ne coûte aucun octet de
 * plus puisque c'est de toute façon le fichier dont le hero a besoin.
 * Ne pas remplacer par un `vw` par emplacement, le bug reviendrait.
 */
export const SHARED_HERO_SIZES = '100vw';

type PictureProps = {
  /** Nom de base du fichier dans `public/assets`, sans largeur ni extension. */
  name: string;
  /** Description utile de l'image. Chaîne vide si purement décorative. */
  alt: string;
  /** Dimensions intrinsèques : réservent la place et évitent tout décalage. */
  width: number;
  height: number;
  sizes?: string;
  className?: string | undefined;
  /** Image du premier écran : chargée sans attendre, en priorité haute. */
  priority?: boolean;
  /** Point d'ancrage du recadrage, pour réutiliser un même visuel. */
  objectPosition?: string | undefined;
  /** Largeurs réellement générées, si la source ne couvre pas toute l'échelle. */
  widths?: readonly number[] | undefined;
  /**
   * `cover` remplit le cadre en rognant — bon pour une photographie.
   * `contain` montre l'image entière — nécessaire pour une capture
   * d'interface, qu'on ne peut pas amputer sans la trahir.
   */
  fit?: 'cover' | 'contain' | undefined;
};

const srcset = (name: string, ext: string, widths: readonly number[]) =>
  widths.map((w) => `/assets/${name}-${w}.${ext} ${w}w`).join(', ');

/**
 * Image responsive auto-hébergée.
 *
 * AVIF d'abord, WebP ensuite, JPEG en dernier recours. Aucun média distant :
 * tous les fichiers sont servis depuis le domaine.
 */
export function Picture({
  name,
  alt,
  width,
  height,
  sizes = '100vw',
  className,
  priority = false,
  objectPosition,
  widths = WIDTHS,
  fit = 'cover',
}: PictureProps) {
  const largest = widths[widths.length - 1] ?? 1600;
  return (
    <picture className={styles.picture}>
      <source
        type="image/avif"
        srcSet={srcset(name, 'avif', widths)}
        sizes={sizes}
      />
      <source
        type="image/webp"
        srcSet={srcset(name, 'webp', widths)}
        sizes={sizes}
      />
      <img
        className={`${styles.img}${className ? ` ${className}` : ''}`}
        src={`/assets/${name}-${largest}.jpg`}
        srcSet={srcset(name, 'jpg', widths)}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        style={{ objectFit: fit, ...(objectPosition ? { objectPosition } : {}) }}
      />
    </picture>
  );
}
