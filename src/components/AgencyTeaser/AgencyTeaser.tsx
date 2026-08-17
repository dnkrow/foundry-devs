import { useRef } from 'react';
import { modes } from '../../data/agencies';
import { D, EASE, gsap, useAnimation } from '../../lib/motion';
import styles from './AgencyTeaser.module.css';

/**
 * Passerelle vers `/agences`, sur la page d'accueil.
 *
 * Elle existe pour le visiteur qui déroule sans cliquer dans la navigation :
 * l'offre de sous-traitance doit se lire dans le fil de la page, pas seulement
 * derrière un lien. Le détail — modes d'intervention, déroulé, capacités —
 * reste sur la page dédiée, qui est la seule source : on ne réécrit ici que
 * les intitulés, tirés des mêmes données.
 */
export function AgencyTeaser() {
  const root = useRef<HTMLElement | null>(null);

  useAnimation(root, () => {
    gsap.from('[data-line]', {
      yPercent: 132,
      duration: D.macro,
      stagger: 0.08,
      ease: EASE,
      scrollTrigger: { trigger: root.current, start: 'top 80%' },
    });
    gsap.from('[data-fade]', {
      yPercent: 40,
      duration: D.mid,
      stagger: 0.06,
      ease: EASE,
      scrollTrigger: { trigger: root.current, start: 'top 76%' },
    });
  });

  return (
    <section
      id="agences"
      ref={root}
      className={styles.section}
      aria-labelledby="agences-teaser-titre"
    >
      <div className={`shell ${styles.grid}`}>
        <div className={styles.copy}>
          <p className="section-label" data-fade>
            Agences et ESN
          </p>

          {/* Lignes courtes : à `--t-display` dans une colonne de 7fr, une
              phrase de vingt-cinq signes se casserait en deux. La formulation
              complète est portée par l'accroche juste en dessous. */}
          <h2 id="agences-teaser-titre" className={styles.title}>
            <span className="line-mask">
              <span data-line>Nous prenons</span>
            </span>
            <span className="line-mask">
              <span data-line>
                le <em className="accent-word">relais</em>.
              </span>
            </span>
          </h2>

          <p className={styles.lead} data-fade>
            Votre équipe est pleine ? Nous intervenons en sous-traitance pour
            les agences et les équipes produit : un lot de développement, un
            projet entier, ou une présence régulière dans votre production. En
            marque blanche si vous le souhaitez — votre client reste votre
            client.
          </p>

          <a className={styles.link} href="/agences" data-fade>
            Notre offre pour les agences
            <svg
              width="18"
              height="10"
              viewBox="0 0 18 10"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M0 5h16m0 0-4.5-4.5M16 5l-4.5 4.5"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
          </a>
        </div>

        <ul className={styles.modes} data-fade>
          {modes.map((mode) => (
            <li key={mode.id}>{mode.title}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
