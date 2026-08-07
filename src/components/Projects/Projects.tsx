import { useCallback, useEffect, useRef } from 'react';
import { projects, type Project } from '../../data/projects';
import { isPlaceholder } from '../../data/site';
import { Surface } from '../Surface/Surface';
import { Picture } from '../Picture/Picture';
import {
  D,
  EASE,
  gsap,
  useAnimation,
  useResponsiveAnimation,
} from '../../lib/motion';
import styles from './Projects.module.css';

/**
 * Portfolio.
 *
 * Desktop : pile collée, un projet dominant à la fois, fond très légèrement
 * décalé d'une carte à l'autre. Mobile : défilement horizontal natif avec
 * aimantation, doublé de boutons utilisables au clavier. Aucun scroll forcé.
 */
export function Projects() {
  const root = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLOListElement | null>(null);

  useAnimation(root, () => {
    gsap.from('[data-line]', {
      yPercent: 132,
      duration: D.macro,
      stagger: 0.08,
      ease: EASE,
      scrollTrigger: { trigger: root.current, start: 'top 78%' },
    });

  });

  // Le média de chaque carte se recadre pendant sa traversée : le mouvement
  // signale quelle carte est active sans clignotement d'opacité.
  useResponsiveAnimation('(min-width: 62rem)', () => {
    gsap.utils.toArray<HTMLElement>('[data-project-crop]').forEach((crop) => {
      gsap.fromTo(
        crop,
        { yPercent: -6, scale: 1.06 },
        {
          yPercent: 6,
          scale: 1.12,
          ease: 'none',
          scrollTrigger: {
            trigger: crop.closest('[data-project-card]'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    });
  });

  const scrollRail = useCallback((direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>('[data-project-card]');
    const step = card ? card.offsetWidth + 20 : rail.clientWidth * 0.86;
    rail.scrollBy({ left: step * direction, behavior: 'smooth' });
  }, []);

  return (
    <section
      id="projets"
      ref={root}
      className={styles.section}
      aria-labelledby="projets-titre"
    >
      <div className={`shell ${styles.head}`}>
        <p className="section-label">Projets</p>
        <h2 id="projets-titre" className={styles.title}>
          <span className="line-mask">
            <span data-line>Des projets qui</span>
          </span>
          <span className="line-mask">
            <span data-line>
              tiennent dans le <em className="accent-word">temps</em>.
            </span>
          </span>
        </h2>
        {/* Formulée comme une règle, pas comme un état : elle reste vraie
            quel que soit le nombre de fiches, et n'aura pas à être reprise
            à chaque projet ajouté. */}
        <p className={styles.intro}>
          Nous ne montrons que ce que nous avons construit. Chaque fiche
          précise pour qui : un client, le collectif lui-même, ou une
          démonstration assumée comme telle.
        </p>

        <div className={styles.railNav}>
          <button
            type="button"
            className={styles.railButton}
            onClick={() => scrollRail(-1)}
          >
            <span className="sr-only">Projet précédent</span>
            <Arrow direction="left" />
          </button>
          <button
            type="button"
            className={styles.railButton}
            onClick={() => scrollRail(1)}
          >
            <span className="sr-only">Projet suivant</span>
            <Arrow direction="right" />
          </button>
        </div>
      </div>

      <ol ref={railRef} className={styles.stack}>
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </ol>
    </section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const draft = isPlaceholder(project.name);
  const variant = ((index % 4) + 1) as 1 | 2 | 3 | 4;

  return (
    <li
      className={styles.card}
      data-project-card
      style={{ ['--i' as string]: index }}
    >
      <article className={styles.cardInner} aria-label={`Projet ${project.name}`}>
        <div className={styles.cardMedia}>
          {project.image ? (
            <div className={styles.shot}>
              <Picture
                name={project.image}
                alt={project.imageAlt ?? ''}
                width={1690}
                height={912}
                /* Mesuré sur le rendu : au-delà de 96rem la carte est plafonnée
                   par le shell, la largeur cesse d'être proportionnelle au
                   viewport. Un `sizes` en vw y faisait choisir le 640. */
                sizes="(min-width: 96rem) 52rem, (min-width: 62rem) 45vw, 82vw"
                widths={project.imageWidths}
                /* Capture d'interface : elle se montre entière. Le cadre suit
                   la hauteur de la rangée, donc son rapport varie avec la
                   longueur du texte — en `cover`, une fiche bavarde amputerait
                   la capture de près de 40 % de sa largeur. */
                fit="contain"
              />
              {project.video ? <ProjectMotion src={project.video} /> : null}
            </div>
          ) : (
            <div className={styles.crop} data-project-crop>
              <Surface variant={variant} ratio="4:3" />
            </div>
          )}

          {/* Détail technique révélé au survol et au focus clavier. */}
          <div className={styles.detail}>
            <p className={styles.detailLabel}>Stack</p>
            <ul className={styles.stackList}>
              {project.stack.map((tech, i) => (
                <li key={`${tech}-${i}`}>{tech}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.cardBody}>
          <p className={styles.number}>
            Projet {String(index + 1).padStart(2, '0')}
            <span aria-hidden="true"> / </span>
            {String(projects.length).padStart(2, '0')}
          </p>

          <h3 className={styles.name} data-draft={draft}>
            {project.name}
          </h3>

          <dl className={styles.meta}>
            <div>
              <dt>Type</dt>
              <dd>{project.kind}</dd>
            </div>
            <div>
              <dt>Rôle</dt>
              <dd>{project.role}</dd>
            </div>
            <div>
              <dt>Année</dt>
              <dd>{project.year}</dd>
            </div>
          </dl>

          <p className={styles.outcome}>{project.outcome}</p>

          {project.href ? (
            <a
              className={styles.link}
              href={project.href}
              target="_blank"
              rel="noreferrer"
            >
              {project.hrefLabel ?? 'Voir l’étude de cas'}
              <Arrow direction="right" />
            </a>
          ) : (
            <p className={styles.linkPending}>Étude de cas à venir</p>
          )}
        </div>
      </article>
    </li>
  );
}

/**
 * Vitrine animée posée par-dessus la capture.
 *
 * La capture reste dessous : elle porte le texte alternatif, occupe la place
 * dès le premier rendu, et redevient seule visible si la lecture échoue. La
 * vidéo ne se télécharge qu'une fois la carte à l'écran (`preload="none"`
 * jusque-là) et n'apparaît qu'au premier `playing`, pour ne jamais laisser
 * voir un cadre noir. Sous `prefers-reduced-motion`, rien ne démarre.
 */
function ProjectMotion({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const reveal = () => video.setAttribute('data-playing', 'true');
    video.addEventListener('playing', reveal);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          video.preload = 'auto';
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(video);

    return () => {
      observer.disconnect();
      video.removeEventListener('playing', reveal);
    };
  }, []);

  return (
    <video
      ref={ref}
      className={styles.motion}
      width={1690}
      height={912}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

function Arrow({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="18"
      height="10"
      viewBox="0 0 18 10"
      fill="none"
      aria-hidden="true"
      style={direction === 'left' ? { rotate: '180deg' } : undefined}
    >
      <path
        d="M0 5h16m0 0-4.5-4.5M16 5l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}
