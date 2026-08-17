import { useRef } from 'react';
import { contact, isPlaceholder, site } from '../../data/site';
import { D, EASE, gsap, useAnimation } from '../../lib/motion';
import { ContactForm } from './ContactForm';
import styles from './Contact.module.css';

type ContactProps = {
  /** Faux sur `/agences` : la page ne doit pas se renvoyer vers elle-même. */
  agencyLink?: boolean | undefined;
};

/** Unique bascule du site vers la surface sombre : la conclusion. */
export function Contact({ agencyLink = true }: ContactProps) {
  const root = useRef<HTMLElement | null>(null);

  useAnimation(root, () => {
    gsap.from('[data-line]', {
      yPercent: 132,
      duration: D.macro,
      stagger: 0.08,
      ease: EASE,
      scrollTrigger: { trigger: root.current, start: 'top 72%' },
    });

    // Transition de section par masque : le vert nuit se déploie vers le haut.
    gsap.from(root.current, {
      clipPath: 'inset(6% 0% 0% 0%)',
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: root.current, start: 'top 92%' },
    });
  });

  return (
    <section
      id="contact"
      ref={root}
      className={styles.section}
      data-theme="night"
      aria-labelledby="contact-titre"
    >
      <div className={`shell ${styles.grid}`}>
        <div className={styles.aside}>
          <p className={styles.label}>Contact</p>
          <h2 id="contact-titre" className={styles.title}>
            <span className="line-mask">
              <span data-line>Un projet à</span>
            </span>
            <span className="line-mask">
              <span data-line>
                <em className="accent-word">sous-traiter</em> ?
              </span>
            </span>
          </h2>

          <p className={styles.intro}>
            Décrivez le besoin en quelques lignes : le contexte, la stack si
            elle est déjà arrêtée, l’échéance. Vous obtenez une réponse d’un
            développeur, pas d’un commercial.
          </p>

          <dl className={styles.coords}>
            <div>
              <dt>E-mail</dt>
              <dd>
                {isPlaceholder(contact.email) ? (
                  <span className={styles.pending}>{contact.email}</span>
                ) : (
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                )}
              </dd>
            </div>
            <div>
              <dt>Zone d’intervention</dt>
              <dd>{site.area}</dd>
            </div>
            <div>
              <dt>Modalités</dt>
              <dd>
                Renfort ponctuel, projet au forfait, marque blanche
                {agencyLink ? (
                  <>
                    {' — voir '}
                    <a href="/agences">notre offre pour les agences</a>.
                  </>
                ) : (
                  '.'
                )}
              </dd>
            </div>
            {contact.availability ? (
              <div>
                <dt>Disponibilité</dt>
                <dd>{contact.availability}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className={styles.formWrap}>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
