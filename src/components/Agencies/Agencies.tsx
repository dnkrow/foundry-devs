import { useRef, type RefObject } from 'react';
import { capabilities, modes, reasons, steps } from '../../data/agencies';
import { D, EASE, gsap, useAnimation } from '../../lib/motion';
import styles from './Agencies.module.css';

/**
 * Page `/agences` — l'offre de sous-traitance et de renfort technique.
 *
 * Composition entièrement statique : rien ne dépend du navigateur, donc le
 * HTML prérendu est celui que le client hydrate. Les sections réutilisent les
 * motifs du site — `.line-mask`, `.accent-word`, `.section-label`, filets et
 * espace négatif — sans introduire ni couleur, ni police, ni moteur nouveau.
 *
 * Le formulaire de contact n'est pas dupliqué ici : `App` place la section
 * `Contact` existante à la suite, et les appels à l'action y renvoient.
 */
export function Agencies() {
  return (
    <>
      <Intro />
      <Modes />
      <Process />
      <Reasons />
      <Capabilities />
    </>
  );
}

/** Révélations communes : lignes de titre sous masque, puis blocs de texte. */
function useReveal(root: RefObject<HTMLElement | null>, start = 'top 80%') {
  useAnimation(root, () => {
    gsap.from('[data-line]', {
      yPercent: 132,
      duration: D.macro,
      stagger: 0.08,
      ease: EASE,
      scrollTrigger: { trigger: root.current, start },
    });

    gsap.from('[data-fade]', {
      yPercent: 40,
      duration: D.mid,
      stagger: 0.06,
      ease: EASE,
      scrollTrigger: { trigger: root.current, start },
    });
  });
}

function Intro() {
  const root = useRef<HTMLElement | null>(null);
  useReveal(root, 'top 95%');

  return (
    <section ref={root} className={styles.intro} aria-labelledby="agences-titre">
      {/* Le titre occupe toute la largeur, comme sur le banc d'essai : deux
          phrases de vingt-cinq signes ne tiennent pas sur une ligne dans une
          colonne, et le mot accent doit ouvrir sa propre ligne. */}
      <div className={`shell ${styles.introHead}`}>
        <p className="section-label" data-fade>
          Pour les agences et les ESN
        </p>

        <h1 id="agences-titre" className={styles.introTitle}>
          <span className="line-mask">
            <span data-line>Votre équipe est pleine.</span>
          </span>
          <span className="line-mask">
            <span data-line>
              La nôtre prend le <em className="accent-word">relais</em>.
            </span>
          </span>
        </h1>

        <p className={styles.introLead} data-fade>
          Foundry Devs est une équipe de développeurs full-stack. Nous
          intervenons en sous-traitance pour les agences web, les studios et
          les ESN : un lot de développement, un projet entier, ou une présence
          régulière dans votre production — en marque blanche si vous le
          souhaitez.
        </p>
      </div>

      <div className={`shell ${styles.introFoot}`}>
        <p className={styles.introNote} data-fade>
          Vous vendez et vous pilotez la relation. Nous écrivons le code, et
          nous restons du côté technique.
        </p>
        <div className={styles.introActions} data-fade>
          <a href="#contact" className={styles.cta}>
            Parler d’un projet
            <Arrow />
          </a>
          <a href="/#projets" className={styles.ctaGhost}>
            Voir nos réalisations
          </a>
        </div>
      </div>
    </section>
  );
}

function Modes() {
  const root = useRef<HTMLElement | null>(null);
  useReveal(root, 'top 78%');

  return (
    <section
      ref={root}
      className={styles.modes}
      aria-labelledby="modes-titre"
    >
      <div className={`shell ${styles.head}`}>
        <p className="section-label" data-fade>
          Modes d’intervention
        </p>
        <h2 id="modes-titre" className={styles.title}>
          <span className="line-mask">
            <span data-line>Cinq façons de nous</span>
          </span>
          <span className="line-mask">
            <span data-line>
              faire <em className="accent-word">travailler</em>.
            </span>
          </span>
        </h2>
      </div>

      <ol className={`shell ${styles.modeList}`}>
        {modes.map((mode, index) => (
          <li key={mode.id} className={styles.mode} data-fade>
            <span className={styles.modeIndex} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className={styles.modeTitle}>{mode.title}</h3>
            <p className={styles.modeSummary}>{mode.summary}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Process() {
  const root = useRef<HTMLElement | null>(null);
  useReveal(root, 'top 78%');

  return (
    <section
      ref={root}
      className={styles.process}
      aria-labelledby="process-titre"
    >
      <div className={`shell ${styles.head}`}>
        <p className="section-label" data-fade>
          Comment ça marche
        </p>
        <h2 id="process-titre" className={styles.title}>
          <span className="line-mask">
            <span data-line>Aucune friction</span>
          </span>
          <span className="line-mask">
            <span data-line>
              à <em className="accent-word">prévoir</em>.
            </span>
          </span>
        </h2>
        <p className={styles.sectionIntro} data-fade>
          Le déroulé est toujours le même, que le lot fasse deux semaines ou
          six mois.
        </p>
      </div>

      <ol className={`shell ${styles.steps}`}>
        {steps.map((step, index) => (
          <li key={step.title} className={styles.step} data-fade>
            <span className={styles.stepIndex} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepSummary}>{step.summary}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Reasons() {
  const root = useRef<HTMLElement | null>(null);
  useReveal(root, 'top 78%');

  return (
    <section
      ref={root}
      className={styles.reasons}
      aria-labelledby="reasons-titre"
    >
      <div className={`shell ${styles.head}`}>
        <p className="section-label" data-fade>
          Pourquoi nous
        </p>
        <h2 id="reasons-titre" className={styles.title}>
          <span className="line-mask">
            <span data-line>Ce qui compte quand</span>
          </span>
          <span className="line-mask">
            <span data-line>
              on <em className="accent-word">délègue</em>.
            </span>
          </span>
        </h2>
      </div>

      <dl className={`shell ${styles.reasonList}`}>
        {reasons.map((reason) => (
          <div key={reason.title} className={styles.reason} data-fade>
            <dt className={styles.reasonTitle}>{reason.title}</dt>
            <dd className={styles.reasonBody}>{reason.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Capabilities() {
  const root = useRef<HTMLElement | null>(null);
  useReveal(root, 'top 78%');

  return (
    <section
      ref={root}
      className={styles.capabilities}
      aria-labelledby="capacites-titre"
    >
      <div className={`shell ${styles.head}`}>
        <p className="section-label" data-fade>
          Ce que nous prenons en charge
        </p>
        <h2 id="capacites-titre" className={styles.title}>
          <span className="line-mask">
            <span data-line>Du schéma de données</span>
          </span>
          <span className="line-mask">
            <span data-line>
              à la mise en <em className="accent-word">production</em>.
            </span>
          </span>
        </h2>
      </div>

      <div className={`shell ${styles.capList}`}>
        {capabilities.map((group) => (
          <section
            key={group.id}
            className={styles.capGroup}
            aria-labelledby={`cap-${group.id}`}
            data-fade
          >
            <h3 id={`cap-${group.id}`} className={styles.capTitle}>
              {group.title}
            </h3>
            <ul className={styles.capItems}>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Dernier appel à l'action avant la section de contact, qui suit
          immédiatement : un lien, pas une nouvelle promesse. */}
      <div className={`shell ${styles.closing}`} data-fade>
        <p className={styles.closingText}>
          Un projet vendu à couvrir, un sprint à absorber, une application à
          reprendre ?
        </p>
        <a href="#contact" className={styles.cta}>
          Besoin de renfort ?
          <Arrow />
        </a>
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
      <path
        d="M0 5h16m0 0-4.5-4.5M16 5l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}
