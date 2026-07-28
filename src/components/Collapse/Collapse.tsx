import { useEffect, useRef, type ReactNode } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/motion';

type CollapseProps = {
  open: boolean;
  id: string;
  className?: string | undefined;
  children: ReactNode;
};

/**
 * Ouverture et fermeture d'un panneau, à hauteur réelle.
 *
 * GSAP mesure la hauteur du contenu : pas de valeur magique, pas de
 * `max-height` approximatif, et pas de second moteur d'animation. Sans
 * JavaScript le panneau reste déplié, donc son contenu demeure lisible.
 */
export function Collapse({ open, id, className, children }: CollapseProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // La hauteur cible est mesurée à chaque ouverture : `scrollHeight` reste
    // celle du contenu même lorsque le panneau est replié à zéro.
    const settle = () => {
      if (open) el.style.height = 'auto';
    };

    // Premier rendu, ou mouvement réduit : on pose l'état sans transition.
    if (!mounted.current || prefersReducedMotion()) {
      mounted.current = true;
      gsap.set(el, { height: open ? 'auto' : 0 });
      return;
    }

    const tween = gsap.to(el, {
      height: open ? el.scrollHeight : 0,
      duration: 0.52,
      ease: 'power3.out',
      // Une fois ouvert, la hauteur redevient fluide : le contenu peut changer.
      onComplete: settle,
    });
    return () => {
      tween.kill();
    };
  }, [open]);

  return (
    <div
      ref={ref}
      id={id}
      className={className}
      style={{ overflow: 'hidden' }}
      /* Un panneau replié sort du parcours clavier et de l'arbre d'accessibilité. */
      inert={!open}
    >
      {children}
    </div>
  );
}
