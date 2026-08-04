import { useRef } from 'react';
import { members, phases } from '../../data/method';
import { isPlaceholder } from '../../data/site';
import { D, EASE, gsap, useAnimation } from '../../lib/motion';
import styles from './Collective.module.css';

/** Initiales tirées du nom, utilisées quand aucune photo n'est fournie. */
const initials = (name: string): string =>
  name
    .replace(/[[\]]/g, '')
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

/**
 * Méthode et collectif.
 *
 * Aucun portrait n'est généré : sans photo réelle, chaque membre est représenté
 * par une composition typographique.
 */
export function Collective() {
  const root = useRef<HTMLElement | null>(null);

  useAnimation(root, () => {
    gsap.from('[data-line]', {
      yPercent: 132,
      duration: D.macro,
      stagger: 0.08,
      ease: EASE,
      scrollTrigger: { trigger: root.current, start: 'top 78%' },
    });

    gsap.from('[data-phase]', {
      yPercent: 35,
      duration: D.mid,
      stagger: 0.08,
      ease: EASE,
      scrollTrigger: { trigger: '[data-phases]', start: 'top 82%' },
    });

    // Le filet de progression se dessine à mesure que la section défile.
    gsap.fromTo(
      '[data-progress]',
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-phases]',
          start: 'top 72%',
          end: 'bottom 65%',
          scrub: 0.4,
        },
      },
    );
  });

  return (
    <section
      id="collectif"
      ref={root}
      className={styles.section}
      aria-labelledby="collectif-titre"
    >
      <div className={`shell ${styles.head}`}>
        <p className="section-label">Collectif</p>
        <h2 id="collectif-titre" className={styles.title}>
          <span className="line-mask">
            <span data-line>Vous travaillez directement</span>
          </span>
          <span className="line-mask">
            <span data-line>
              avec ceux qui <em className="accent-word">construisent</em>.
            </span>
          </span>
        </h2>
        <p className={styles.intro}>
          Pas de couche intermédiaire ni de relais commercial : les personnes qui
          conçoivent et développent votre produit sont celles avec qui vous
          échangez.
        </p>
      </div>

      <div className={`shell ${styles.phasesWrap}`} data-phases>
        <span className={styles.progress} data-progress aria-hidden="true" />
        <ol className={styles.phases}>
          {phases.map((phase) => (
            <li key={phase.title} className={styles.phase} data-phase>
              <h3 className={styles.phaseTitle}>{phase.title}</h3>
              <p className={styles.phaseSummary}>{phase.summary}</p>
              <p className={styles.phaseDeliverable}>
                <span className={styles.phaseLabel}>Livrable</span>
                {phase.deliverable}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <div className={`shell ${styles.membersWrap}`}>
        <h3 className={styles.membersTitle}>L’équipe</h3>
        <ul className={styles.members}>
          {members.map((member) => {
            const draft = isPlaceholder(member.name);
            return (
              <li key={member.name} className={styles.member}>
                {member.photo ? (
                  <img
                    className={styles.photo}
                    src={member.photo}
                    alt={`Portrait de ${member.name}`}
                    width={480}
                    height={600}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className={styles.initials} aria-hidden="true">
                    {initials(member.name) || '—'}
                  </span>
                )}
                <p className={styles.memberName} data-draft={draft}>
                  {member.name}
                </p>
                <p className={styles.memberRole}>{member.role}</p>
                {member.github ? (
                  <a
                    className={styles.memberLink}
                    href={member.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                    <span className="sr-only"> de {member.name}</span>
                  </a>
                ) : null}
              </li>
            );
          })}
        </ul>
        <p className={styles.membersNote}>
          Noms, rôles et photographies seront ajoutés dès qu’ils nous seront
          transmis.
        </p>
      </div>
    </section>
  );
}
