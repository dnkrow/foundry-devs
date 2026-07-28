import styles from './Picture.module.css';

/** Largeurs produites par `npm run images`. */
const WIDTHS = [640, 1024, 1600, 2048] as const;

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
};

const srcset = (name: string, ext: string) =>
  WIDTHS.map((w) => `/assets/${name}-${w}.${ext} ${w}w`).join(', ');

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
}: PictureProps) {
  return (
    <picture className={styles.picture}>
      <source type="image/avif" srcSet={srcset(name, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcset(name, 'webp')} sizes={sizes} />
      <img
        className={`${styles.img}${className ? ` ${className}` : ''}`}
        src={`/assets/${name}-1600.jpg`}
        srcSet={srcset(name, 'jpg')}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        style={objectPosition ? { objectPosition } : undefined}
      />
    </picture>
  );
}
