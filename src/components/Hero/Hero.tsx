import { useRef } from 'react';
import { Picture, SHARED_HERO_SIZES } from '../Picture/Picture';
import { site } from '../../data/site';
import {
  D,
  EASE,
  gsap,
  useAnimation,
  useMagnetic,
  useResponsiveAnimation,
} from '../../lib/motion';
import styles from './Hero.module.css';

/**
 * Hero cinématographique.
 *
 * La scène est collée (`position: sticky`) pendant une hauteur de défilement
 * supplémentaire : le média occupe d'abord tout l'écran, puis se contracte en
 * fenêtre intégrée à la page pendant que le titre se recompose. Le premier
 * viewport, lui, contient exactement la composition complète.
 */
export function Hero() {
  const root = useRef<HTMLElement | null>(null);
  const ctaRef = useMagnetic();

  useAnimation(root, () => {
    // 1. Ouverture : les lignes montent depuis leur masque. Rien n'est masqué
    //    en CSS, donc sans JS la composition finale est déjà à l'écran.
    const intro = gsap.timeline({ defaults: { ease: EASE } });
    intro
      .from('[data-hero-line]', {
        yPercent: 132,
        duration: 0.9,
        stagger: 0.09,
      })
      .from(
        '[data-hero-fade]',
        { yPercent: 60, duration: D.macro, stagger: 0.07 },
        '-=0.55',
      )
      .from(
        '[data-hero-media] > *',
        { scale: 1.14, duration: 1.6, ease: 'power2.out' },
        0,
      );
  });

  // 2. Contraction du média en fenêtre, liée au scroll. Desktop uniquement :
  //    sur petit écran la scène n'est pas collée et l'effet n'a pas lieu.
  useResponsiveAnimation('(min-width: 62rem)', () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
      },
    });

    tl.to(
      '[data-hero-media]',
      { clipPath: 'inset(12% 30% 22% 8% round 2px)', ease: 'power2.inOut' },
      0,
    )
      .to('[data-hero-media] > *', { scale: 1.18, ease: 'none' }, 0)
      .to('[data-hero-copy]', { yPercent: -14, ease: 'none' }, 0)
      .to('[data-hero-veil]', { opacity: 0.62, ease: 'none' }, 0);
  });

  return (
    <section id="top" ref={root} className={styles.hero}>
      <div className={styles.stage}>
        <div className={styles.media} data-hero-media>
          <div className={styles.mediaInner}>
            <Picture
              name="hero"
              alt="Intérieur d’un studio en pierre calcaire où des plaques de verre gravées de grilles sont posées comme des objets, éclairées par une lumière rasante."
              width={2720}
              height={1536}
              sizes={SHARED_HERO_SIZES}
              priority
              objectPosition="60% 50%"
            />
          </div>
          <span className={styles.veil} data-hero-veil aria-hidden="true" />
        </div>

        <div className={styles.copy} data-hero-copy>
          <p className={styles.eyebrow} data-hero-fade>
            {site.tagline}
            <span aria-hidden="true"> — </span>
            <span className={styles.city}>{site.city}</span>
          </p>

          <h1 className={styles.title}>
            <span className="line-mask">
              <span data-hero-line>Nous développons des expériences</span>
            </span>
            <span className="line-mask">
              <span data-hero-line>
                numériques qui <em className="accent-word">restent</em>.
              </span>
            </span>
          </h1>

          <p className={styles.lead} data-hero-fade>
            Collectif de développeurs à Toulouse. Nous concevons, construisons
            et faisons évoluer des produits web sur mesure.
          </p>

          <div className={styles.actions} data-hero-fade>
            <a ref={ctaRef} href="#projets" className={styles.cta}>
              Voir nos projets
              <svg
                width="18"
                height="10"
                viewBox="0 0 18 10"
                aria-hidden="true"
                fill="none"
              >
                <path
                  d="M0 5h16m0 0-4.5-4.5M16 5l-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </a>
            <a href="#contact" className={styles.ctaGhost}>
              Nous contacter
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
