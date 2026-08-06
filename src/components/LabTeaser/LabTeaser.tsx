import { useRef } from 'react';
import { D, EASE, gsap, useAnimation } from '../../lib/motion';
import styles from './LabTeaser.module.css';

/**
 * Renvoi vers le banc d'essai public.
 *
 * Volontairement sobre et sans chiffre : les résultats vivent sur `/labo`,
 * alimentés par un instantané qui change. Répéter une performance ici
 * obligerait à la tenir à jour à deux endroits — et un chiffre périmé sur la
 * page d'accueil coûte plus cher que pas de chiffre du tout.
 */
export function LabTeaser() {
  const root = useRef<HTMLElement | null>(null);

  useAnimation(root, () => {
    gsap.from('[data-teaser-line]', {
      yPercent: 132,
      duration: D.macro,
      stagger: 0.08,
      ease: EASE,
      scrollTrigger: { trigger: root.current, start: 'top 80%' },
    });
    gsap.from('[data-teaser-fade]', {
      yPercent: 40,
      duration: D.mid,
      stagger: 0.06,
      ease: EASE,
      scrollTrigger: { trigger: root.current, start: 'top 76%' },
    });
  });

  return (
    <section ref={root} className={styles.section} aria-labelledby="labo-teaser-titre">
      <div className={`shell ${styles.grid}`}>
        <p className="section-label" data-teaser-fade>
          Banc d’essai
        </p>

        <h2 id="labo-teaser-titre" className={styles.title}>
          <span className="line-mask">
            <span data-teaser-line>Nous faisons tourner</span>
          </span>
          <span className="line-mask">
            <span data-teaser-line>
              nos idées en <em className="accent-word">public</em>.
            </span>
          </span>
        </h2>

        <div className={styles.aside} data-teaser-fade>
          <p>
            Neuf modèles de langage gèrent chacun un portefeuille simulé, sur
            les mêmes données et sous la même contrainte de risque. Les
            résultats sont publiés en continu, y compris quand ils sont
            mauvais.
          </p>
          <a className={styles.link} href="/labo">
            Voir le banc d’essai
          </a>
        </div>
      </div>
    </section>
  );
}
