import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Skip scroll if navigating to projects page
    if (pathname === '/projects') return;

    // If there's a hash, scroll to that element
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        setTimeout(() => {
          window.scrollTo({
            behavior: 'smooth',
            top: element.getBoundingClientRect().top + window.scrollY - 100, // Offset for header
          });
        }, 100);
      }
      return;
    }

    // Otherwise scroll to top
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
