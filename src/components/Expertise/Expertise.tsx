import { useId, useRef, useState } from 'react';
import { expertise } from '../../data/expertise';
import { Picture } from '../Picture/Picture';
import { Collapse } from '../Collapse/Collapse';
import { D, EASE, gsap, useAnimation } from '../../lib/motion';
import styles from './Expertise.module.css';

/**
 * Un seul visuel, six lectures : chaque domaine ouvre le même plan sur une
 * zone différente plutôt que de multiplier les images.
 */
const CROPS = ['22% 42%', '54% 74%', '72% 30%', '84% 58%', '62% 80%'] as const;

/**
 * Liste typographique interactive.
 *
 * Desktop : survol ou focus d'une ligne pour faire apparaître l'aperçu de
 * droite. Mobile : le même bouton se comporte en accordéon. Un seul état React
 * pilote les deux, il n'est jamais alimenté par le scroll.
 */
export function Expertise() {
  const root = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<number>(0);
  const [open, setOpen] = useState<number | null>(null);
  const panelId = useId();

  useAnimation(root, () => {
    gsap.from('[data-line]', {
      yPercent: 132,
      duration: D.macro,
      stagger: 0.08,
      ease: EASE,
      scrollTrigger: { trigger: root.current, start: 'top 78%' },
    });

    gsap.from('[data-expertise-row]', {
      yPercent: 40,
      duration: D.mid,
      stagger: 0.06,
      ease: EASE,
      scrollTrigger: { trigger: '[data-expertise-list]', start: 'top 82%' },
    });
  });

  return (
    <section
      id="expertise"
      ref={root}
      className={styles.section}
      aria-labelledby="expertise-titre"
    >
      <div className={`shell ${styles.grid}`}>
        <header className={styles.head}>
          <p className="section-label">Expertise</p>
          <h2 id="expertise-titre" className={styles.title}>
            <span className="line-mask">
              <span data-line>Ce que nous</span>
            </span>
            <span className="line-mask">
              <span data-line>
                savons <em className="accent-word">construire</em>.
              </span>
            </span>
          </h2>
        </header>

        <ul className={styles.list} data-expertise-list>
          {expertise.map((item, index) => {
            const isOpen = open === index;
            return (
              <li key={item.id} className={styles.row} data-expertise-row>
                <button
                  type="button"
                  className={styles.rowButton}
                  data-active={active === index}
                  aria-expanded={isOpen}
                  aria-controls={`${panelId}-${item.id}`}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  onClick={() => setOpen(isOpen ? null : index)}
                >
                  <span className={styles.rowIndex} aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.rowTitle}>{item.title}</span>
                  <span className={styles.rowSign} aria-hidden="true" data-open={isOpen}>
                    <i />
                    <i />
                  </span>
                </button>

                <Collapse open={isOpen} id={`${panelId}-${item.id}`}>
                  <p className={styles.panelText}>{item.description}</p>
                  <ul className={styles.keywords}>
                    {item.keywords.map((keyword) => (
                      <li key={keyword}>{keyword}</li>
                    ))}
                  </ul>
                </Collapse>
              </li>
            );
          })}
        </ul>

        {/* Aperçu desktop : strictement décoratif. Toute l'information reste
            dans la liste, accessible sans survol. */}
        <aside className={styles.preview} aria-hidden="true">
          <div className={styles.previewMedia}>
            <Picture
              name="hero"
              alt=""
              width={2720}
              height={1536}
              sizes="(min-width: 62rem) 30vw, 100vw"
              objectPosition={CROPS[active] ?? CROPS[0]}
            />
          </div>
          <p className={styles.previewCaption}>{expertise[active]?.title}</p>
        </aside>
      </div>
    </section>
  );
}
