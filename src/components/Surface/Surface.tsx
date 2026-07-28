import styles from './Surface.module.css';

type SurfaceProps = {
  /** Fait varier la composition sans multiplier les fichiers. */
  variant?: 1 | 2 | 3 | 4;
  /** Rapport d'affichage du dessin. */
  ratio?: '16:9' | '4:3';
  className?: string;
};

const VIEWBOX = { '16:9': '0 0 1600 900', '4:3': '0 0 1200 900' } as const;

/**
 * Composition de substitution générée en SVG.
 *
 * Elle tient lieu de visuel tant qu'aucune photographie n'est fournie : pierre
 * calcaire, lumière rasante, ombres de feuillage et plans décalés. Purement
 * décorative, donc masquée aux technologies d'assistance.
 */
export function Surface({
  variant = 1,
  ratio = '16:9',
  className,
}: SurfaceProps) {
  const uid = `sf${variant}${ratio === '4:3' ? 'p' : 'l'}`;
  const w = ratio === '16:9' ? 1600 : 1200;
  const tilt = [-18, -26, -12, -22][variant - 1] ?? -18;
  const archX = [0.62, 0.34, 0.72, 0.46][variant - 1] ?? 0.62;

  return (
    <svg
      className={`${styles.surface}${className ? ` ${className}` : ''}`}
      viewBox={VIEWBOX[ratio]}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}-stone`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#f3f5f2" />
          <stop offset="52%" stopColor="#e4e8e4" />
          <stop offset="100%" stopColor="#cfd6d1" />
        </linearGradient>

        <radialGradient
          id={`${uid}-light`}
          cx={archX}
          cy="0.18"
          r="0.85"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={`${uid}-slab`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#e9ede9" />
          <stop offset="100%" stopColor="#c6cdc8" />
        </linearGradient>

        <filter id={`${uid}-soft`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="26" />
        </filter>

        <filter id={`${uid}-softer`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="54" />
        </filter>

        {/* Grain minéral : casse le côté « dégradé numérique ». */}
        <filter id={`${uid}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.34" />
          </feComponentTransfer>
        </filter>

        <clipPath id={`${uid}-arch`}>
          <path
            d={`M ${w * archX - 210} 900 L ${w * archX - 210} 340
               A 210 210 0 0 1 ${w * archX + 210} 340 L ${w * archX + 210} 900 Z`}
          />
        </clipPath>
      </defs>

      <rect width="100%" height="100%" fill={`url(#${uid}-stone)`} />

      {/* Ombres portées de feuillage, projetées en diagonale. */}
      <g
        opacity="0.3"
        filter={`url(#${uid}-soft)`}
        transform={`rotate(${tilt} ${w * 0.4} 320)`}
      >
        <ellipse cx={w * 0.18} cy="180" rx="150" ry="34" fill="#5c6a63" />
        <ellipse cx={w * 0.3} cy="252" rx="112" ry="26" fill="#5c6a63" />
        <ellipse cx={w * 0.12} cy="330" rx="86" ry="21" fill="#5c6a63" />
        <ellipse cx={w * 0.4} cy="150" rx="70" ry="18" fill="#5c6a63" />
        <ellipse cx={w * 0.26} cy="410" rx="128" ry="24" fill="#5c6a63" />
      </g>

      {/* Arche : la lumière tombe à l'intérieur. */}
      <g clipPath={`url(#${uid}-arch)`}>
        <rect width="100%" height="100%" fill="#dfe4e0" />
        <rect
          width="100%"
          height="100%"
          fill={`url(#${uid}-light)`}
          opacity="0.9"
        />
        <g opacity="0.22" filter={`url(#${uid}-softer)`}>
          <ellipse cx={w * archX} cy="760" rx="260" ry="120" fill="#173d33" />
        </g>
      </g>

      {/* Plans de pierre décalés, au premier plan. */}
      <path
        d={`M 0 ${ratio === '16:9' ? 660 : 690} L ${w * 0.52} ${
          ratio === '16:9' ? 612 : 640
        } L ${w * 0.52} 900 L 0 900 Z`}
        fill={`url(#${uid}-slab)`}
      />
      <path
        d={`M ${w * 0.52} ${ratio === '16:9' ? 612 : 640} L ${w} ${
          ratio === '16:9' ? 700 : 726
        } L ${w} 900 L ${w * 0.52} 900 Z`}
        fill="#d3dad5"
      />

      {/* Filet d'accent : unique trace de couleur saturée. */}
      <rect
        x={w * 0.52 - 1}
        y={ratio === '16:9' ? 612 : 640}
        width="2"
        height="288"
        fill="#315e50"
        opacity="0.55"
      />

      <g opacity="0.16" filter={`url(#${uid}-softer)`}>
        <rect
          x="0"
          y={ratio === '16:9' ? 640 : 668}
          width={w}
          height="70"
          fill="#173d33"
        />
      </g>

      <rect
        width="100%"
        height="100%"
        filter={`url(#${uid}-grain)`}
        opacity="0.09"
        style={{ mixBlendMode: 'multiply' }}
      />
    </svg>
  );
}
