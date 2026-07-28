import { useEffect } from 'react';
import { Nav } from './components/Nav/Nav';
import { Hero } from './components/Hero/Hero';
import { Manifesto } from './components/Manifesto/Manifesto';
import { Projects } from './components/Projects/Projects';
import { Expertise } from './components/Expertise/Expertise';
import { Collective } from './components/Collective/Collective';
import { Contact } from './components/Contact/Contact';
import { Footer } from './components/Footer/Footer';
import { ScrollTrigger, initSmoothScroll } from './lib/motion';

export default function App() {
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
      <Nav />
      <main id="contenu">
        <Hero />
        <Manifesto />
        <Projects />
        <Expertise />
        <Collective />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
