import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function MobileDock() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname !== '/') { setVisible(false); return; }
    let frame = 0;
    const measure = () => {
      frame = 0;
      const hero = document.getElementById('home')?.getBoundingClientRect();
      const contact = document.getElementById('contact')?.getBoundingClientRect();
      setVisible(Boolean(hero && contact && hero.bottom < innerHeight * .5 && contact.top > innerHeight * .85));
    };
    const schedule = () => { frame ||= requestAnimationFrame(measure); };
    measure();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    return () => { removeEventListener('scroll', schedule); removeEventListener('resize', schedule); cancelAnimationFrame(frame); };
  }, [pathname]);

  return (
    <aside aria-label="Contact shortcut" className="mobile-dock" data-visible={visible} aria-hidden={!visible}>
      <span>Want to work together?</span>
      <Link className="button" to="/#contact" tabIndex={visible ? undefined : -1}>Let's talk <ArrowUpRight size={16} aria-hidden="true" /></Link>
    </aside>
  );
}
