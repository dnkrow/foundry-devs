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
            {site.tagline} — {site.city}
          </p>
        </div>

        <nav className={styles.links} aria-label="Liens de pied de page">
          <ul>
            <li>
              <a href="#projets">Projets</a>
            </li>
            <li>
              <a href="#expertise">Expertise</a>
            </li>
            <li>
              <a href="#collectif">Collectif</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>
        </nav>

        <div className={styles.reach}>
          {isPlaceholder(contact.email) ? (
            <span className={styles.pending}>{contact.email}</span>
          ) : (
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          )}
          <p className={styles.note}>
            Site en cours de finalisation : les projets, les membres et les
            coordonnées définitives restent à renseigner.
          </p>
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
