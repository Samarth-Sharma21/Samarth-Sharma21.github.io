import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const targets = '.section-heading, .about-grid > *, .experience-grid > *, .contact-grid > *, .work-footer, .archive-bottom';

export default function useScrollReveal() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const elements = [...document.querySelectorAll<HTMLElement>(targets)].filter(element => element.getBoundingClientRect().top > innerHeight);
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.reveal = 'in';
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    for (const element of elements) { element.dataset.reveal = 'wait'; observer.observe(element); }
    return () => {
      observer.disconnect();
      for (const element of elements) delete element.dataset.reveal;
    };
  }, [pathname]);
}
