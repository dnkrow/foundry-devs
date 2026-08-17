import { contact, isPlaceholder, site } from '../../data/site';
import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} data-theme="night">
      <div className={`shell ${styles.inner}`}>
        <div className={styles.brand}>
          <p className={styles.name}>{site.name}</p>
          <p className={styles.tagline}>
            Développeurs full-stack à {site.city}. Renfort technique et
            sous-traitance en marque blanche pour les agences.
          </p>
        </div>

        <nav className={styles.links} aria-label="Liens de pied de page">
          <ul>
            <li>
              <a href="/agences">Pour les agences</a>
            </li>
            <li>
              <a href="/#projets">Projets</a>
            </li>
            <li>
              <a href="/#expertise">Expertise</a>
            </li>
            <li>
              <a href="/#collectif">Collectif</a>
            </li>
            <li>
              <a href="/labo">Banc d’essai</a>
            </li>
          </ul>
        </nav>

        <div className={styles.reach}>
          {isPlaceholder(contact.email) ? (
            <span className={styles.pending}>{contact.email}</span>
          ) : (
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          )}
          <a className={styles.cta} href="/#contact">
            Démarrer une collaboration
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
      </div>

      <div className={`shell ${styles.legal}`}>
        <p>
          © {year} {site.name}
        </p>
        <p>Conception et développement — en interne</p>
      </div>
    </footer>
  );
}
