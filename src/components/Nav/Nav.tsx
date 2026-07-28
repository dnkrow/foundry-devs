import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { navItems, site } from '../../data/site';
import { ScrollTrigger, prefersReducedMotion } from '../../lib/motion';
import { Collapse } from '../Collapse/Collapse';
import styles from './Nav.module.css';

/**
 * Navigation fixe et translucide.
 *
 * L'opacité de la surface et la section active sont pilotées par ScrollTrigger
 * qui écrit directement des attributs `data-*` : aucun listener de scroll ne
 * déclenche de rendu React.
 */
export function Nav() {
  const headerRef = useRef<HTMLElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<HTMLUListElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const panelId = useId();

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const triggers: ScrollTrigger[] = [];

    // Surface légèrement opaque dès que le hero est dépassé.
    triggers.push(
      ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        onToggle: (self) => {
          header.dataset.scrolled = String(self.isActive);
        },
      }),
    );

    // Indication discrète de la section courante.
    const setActive = (id: string | null) => {
      header
        .querySelectorAll<HTMLAnchorElement>('[data-nav-link]')
        .forEach((link) => {
          link.dataset.active = String(link.dataset.navLink === id);
          if (link.dataset.navLink === id) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
    };

    navItems.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (!section) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: section,
          start: 'top 45%',
          end: 'bottom 45%',
          onToggle: (self) => {
            if (self.isActive) setActive(id);
            else if (!ScrollTrigger.isInViewport(section, 0.4)) setActive(null);
          },
        }),
      );
    });

    return () => triggers.forEach((t) => t.kill());
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Piège de focus, fermeture clavier et verrouillage du fond pendant l'ouverture.
  useEffect(() => {
    if (!menuOpen) return;
    const panel = panelRef.current;
    if (!panel) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.querySelector<HTMLElement>('a, button')?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusables = panel.querySelectorAll<HTMLElement>('a[href], button');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen, closeMenu]);

  const goTo = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    setMenuOpen(false);
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
    // Le focus suit la navigation pour rester utilisable au clavier.
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  };

  return (
    <header ref={headerRef} className={styles.header} data-scrolled="false">
      <nav className={styles.bar} aria-label="Navigation principale">
        <a
          href="#top"
          className={styles.brand}
          onClick={(event) => goTo(event, 'top')}
        >
          <span className={styles.monogram} aria-hidden="true">
            {site.monogram}
          </span>
          <span className={styles.brandName}>{site.name}</span>
        </a>

        <ul className={styles.links}>
          {navItems.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={styles.link}
                data-nav-link={id}
                data-active="false"
                onClick={(event) => goTo(event, id)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-expanded={menuOpen}
          aria-controls={panelId}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">
            {menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          </span>
          <span className={styles.toggleIcon} data-open={menuOpen} aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </nav>

      <Collapse
        open={menuOpen}
        id={panelId}
        className={styles.panel}
      >
        <ul ref={panelRef} className={styles.panelList} data-open={menuOpen}>
          {navItems.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={styles.panelLink}
                onClick={(event) => goTo(event, id)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </Collapse>
    </header>
  );
}
