import { useEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// En développement uniquement : permet d'inspecter et de piloter les timelines
// depuis la console. Retiré du bundle de production par l'élagage de Vite.
if (import.meta.env.DEV) {
  Object.assign(window, { gsap, ScrollTrigger });
}

/**
 * GSAP est le moteur d'animation unique du site. Lenis ne fait qu'interpoler la
 * position de scroll et délègue son horloge au ticker GSAP : aucun élément n'est
 * piloté par deux moteurs, et aucun `scroll` listener ne met à jour un state
 * React.
 */

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, ScrollTrigger };

/** Durées issues des jetons : macro 500–900 ms, micro 180–300 ms. */
export const D = { macro: 0.72, mid: 0.54, micro: 0.24 } as const;
export const EASE = 'power3.out';

/**
 * Exécute `setup` dans un `gsap.context` limité à `scope`, et le nettoie au
 * démontage. Rien n'est joué si l'utilisateur demande un mouvement réduit :
 * le DOM garde alors son état CSS, c'est-à-dire la composition finale.
 */
export function useAnimation(
  scope: RefObject<HTMLElement | null>,
  /** Peut retourner une fonction de nettoyage, exécutée par le contexte GSAP. */
  setup: (ctx: gsap.Context) => void | (() => void),
): void {
  useEffect(() => {
    if (!scope.current || prefersReducedMotion()) return;
    const ctx = gsap.context(setup, scope.current);
    return () => ctx.revert();
    // `setup` est volontairement hors dépendances : les composants le
    // définissent inline et la configuration ne dépend que du montage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);
}

/**
 * Anime uniquement lorsque `query` est vraie, et défait tout dès qu'elle
 * devient fausse. Volontairement hors de `useAnimation` : imbriqué dans un
 * `gsap.context`, le `matchMedia` perd ses écouteurs au double montage de
 * StrictMode et ne se réarme jamais au redimensionnement.
 */
export function useResponsiveAnimation(
  query: string,
  setup: (context: gsap.Context) => void,
): void {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add(query, setup);
    return () => {
      mm.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);
}

/**
 * Initialise le smooth scroll. Retourne une fonction de nettoyage.
 * Désactivé si mouvement réduit, et sur pointeur grossier pour ne jamais
 * interférer avec le défilement natif tactile.
 */
export async function initSmoothScroll(): Promise<() => void> {
  if (
    prefersReducedMotion() ||
    window.matchMedia('(pointer: coarse)').matches
  ) {
    return () => {};
  }

  const { default: Lenis } = await import('lenis');
  const lenis = new Lenis({
    duration: 0.9,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
    // Le scroll clavier et les ancres restent gérés nativement.
    smoothWheel: true,
  });

  const raf = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);

  return () => {
    gsap.ticker.remove(raf);
    lenis.destroy();
  };
}

/**
 * Aimantation légère d'un bouton vers le curseur. Réservée à un seul CTA.
 * Ignore les pointeurs tactiles et le mouvement réduit.
 */
export function useMagnetic(strength = 0.28) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const move = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const moveY = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

    const onMove = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      move((event.clientX - (box.left + box.width / 2)) * strength);
      moveY((event.clientY - (box.top + box.height / 2)) * strength);
    };
    const onLeave = () => {
      move(0);
      moveY(0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [strength]);

  return ref;
}
