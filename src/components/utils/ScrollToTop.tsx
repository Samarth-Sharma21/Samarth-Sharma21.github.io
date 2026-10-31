import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();
  const previousPath = useRef(pathname);
  const keyboardInput = useRef(true);

  useEffect(() => {
    const onKeyDown = () => { keyboardInput.current = true; };
    const onPointerDown = () => { keyboardInput.current = false; };
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, []);

  useEffect(() => {
    const samePage = previousPath.current === pathname;
    previousPath.current = pathname;
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    let id: string;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }
    let frame = 0;
    const stop = () => {
      cancelAnimationFrame(frame);
    };
    frame = requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (!target) return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion || keyboardInput.current || !samePage || navigationType === 'POP') {
        target.scrollIntoView({ behavior: 'instant', block: 'start' });
        target.focus({ preventScroll: true });
        return;
      }
      target.focus({ preventScroll: true });
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const start = window.scrollY;
      const end = Math.max(0, Math.min(start + target.getBoundingClientRect().top - margin, document.documentElement.scrollHeight - window.innerHeight));
      const duration = 440;
      let startedAt: number | undefined;

      const step = (time: number) => {
        startedAt ??= time;
        const progress = Math.min((time - startedAt) / duration, 1);
        const eased = progress < .5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        window.scrollTo({ top: start + (end - start) * eased, behavior: 'instant' });
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    });
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('pointerdown', stop, true);
    window.addEventListener('keydown', stop, true);
    return () => {
      stop();
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('pointerdown', stop, true);
      window.removeEventListener('keydown', stop, true);
    };
  }, [pathname, hash, key, navigationType]);

  return null;
}
