import { useRef } from 'react';
import { Picture, SHARED_HERO_SIZES } from '../Picture/Picture';
import { D, EASE, gsap, useAnimation } from '../../lib/motion';
import styles from './Manifesto.module.css';

/**
 * Bloc éditorial. Le visuel de droite est un macro-recadrage de la même
 * matière que le hero : un seul média, plusieurs lectures.
 */
export function Manifesto() {
  const root = useRef<HTMLElement | null>(null);

  useAnimation(root, () => {
    gsap.from('[data-line]', {
      yPercent: 132,
      duration: D.macro,
      stagger: 0.08,
      ease: EASE,
      scrollTrigger: { trigger: root.current, start: 'top 78%' },
    });

    gsap.from('[data-manifesto-media]', {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 1,
      ease: 'power3.inOut',
      scrollTrigger: { trigger: '[data-manifesto-media]', start: 'top 82%' },
    });

    // Recadrage progressif : l'image glisse dans un cadre qui, lui, ne bouge pas.
    gsap.to('[data-manifesto-crop] > *', {
      yPercent: -9,
      scale: 1.44,
      ease: 'none',
      scrollTrigger: {
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  return (
    <section ref={root} className={styles.section} aria-labelledby="manifeste-titre">
      <div className={`shell ${styles.grid}`}>
        <div className={styles.copy}>
          <p className="section-label">Manifeste</p>

          <h2 id="manifeste-titre" className={styles.title}>
            <span className="line-mask">
              <span data-line>Une petite équipe.</span>
            </span>
            <span className="line-mask">
              <span data-line>Une exigence de</span>
            </span>
            <span className="line-mask">
              <span data-line>
                <em className="accent-word">grand studio</em>.
              </span>
            </span>
          </h2>

          <p className={styles.body}>
            Quatre développeurs full-stack, une direction technique assumée en
            interne, et du code que d’autres doivent pouvoir reprendre. Nous
            travaillons pour des agences comme pour des clients directs.
          </p>

          <dl className={styles.facts}>
            <div>
              <dt>Interlocuteur</dt>
              <dd>Les personnes qui écrivent le code</dd>
            </div>
            <div>
              <dt>Intervention</dt>
              <dd>Projet au forfait, renfort ou marque blanche</dd>
            </div>
            <div>
              <dt>Terrain</dt>
              <dd>Toulouse et à distance</dd>
            </div>
          </dl>
        </div>

        <figure className={styles.media} data-manifesto-media>
          <div className={styles.crop} data-manifesto-crop>
            <Picture
              name="hero"
              alt="Détail : plaques de verre gravées de trames régulières, superposées en volume."
              width={2720}
              height={1536}
              sizes={SHARED_HERO_SIZES}
              objectPosition="66% 62%"
            />
          </div>
        </figure>
      </div>
    </section>
  );
}
