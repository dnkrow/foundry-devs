import { useEffect } from 'react';
import { Nav } from './components/Nav/Nav';
import { Hero } from './components/Hero/Hero';
import { Manifesto } from './components/Manifesto/Manifesto';
import { Projects } from './components/Projects/Projects';
import { Expertise } from './components/Expertise/Expertise';
import { Collective } from './components/Collective/Collective';
import { Contact } from './components/Contact/Contact';
import { Footer } from './components/Footer/Footer';
import { Lab } from './components/Lab/Lab';
import { LabTeaser } from './components/LabTeaser/LabTeaser';
import { Agencies } from './components/Agencies/Agencies';
import { AgencyTeaser } from './components/AgencyTeaser/AgencyTeaser';
import { ScrollTrigger, initSmoothScroll } from './lib/motion';
import { toRoute } from './routes';

type AppProps = {
  /** Chemin rendu. Fourni par le serveur au prérendu, par l'URL au montage. */
  path?: string | undefined;
};

export default function App({ path = '/' }: AppProps) {
  const route = toRoute(path);

  useEffect(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;

    void initSmoothScroll().then((cleanup) => {
      if (cancelled) cleanup();
      else dispose = cleanup;
    });

    // Les polices modifient les hauteurs : on recalcule une fois chargées.
    void document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <Nav home={route === '/'} />
      <main id="contenu">
        {route === '/labo' ? (
          <Lab />
        ) : route === '/agences' ? (
          <>
            {/* Le formulaire n'est pas dupliqué : c'est la même section que sur
                l'accueil, et tous les appels à l'action de la page y mènent. */}
            <Agencies />
            <Contact agencyLink={false} />
          </>
        ) : (
          <>
            <Hero />
            <Manifesto />
            <Projects />
            <Expertise />
            <AgencyTeaser />
            <LabTeaser />
            <Collective />
            <Contact />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
