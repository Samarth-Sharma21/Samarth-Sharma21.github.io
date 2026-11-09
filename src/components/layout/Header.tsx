import { CSSProperties, MouseEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { flushSync } from 'react-dom';
import useReducedMotion from '../../hooks/useReducedMotion';
import { useTheme } from '../../contexts/theme';
import type { Intent } from '../sections/MessagePipeline';

const navigation = [
  { label: 'Work', href: '/#projects' },
  { label: 'About', href: '/#about' },
  { label: 'Experience', href: '/#experience' },
];

const sectionCta: Readonly<Record<string, { label: string; intent: Intent }>> = {
  Work: { label: 'Ask about my work', intent: 'question' },
  About: { label: 'Say hello', intent: 'hello' },
  Experience: { label: 'Hiring? Let\'s talk', intent: 'role' },
};

function NavCta({ active }: { active: string }) {
  const label = sectionCta[active]?.label ?? "Let's talk";
  const [leaving, setLeaving] = useState<string | null>(null);
  const [width, setWidth] = useState<number>();
  const previous = useRef(label);
  const ruler = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const measure = () => setWidth(ruler.current?.offsetWidth);
    measure();
    void document.fonts?.ready.then(measure);
  }, [label]);

  useEffect(() => {
    if (previous.current === label) return;
    setLeaving(previous.current);
    previous.current = label;
    const timer = window.setTimeout(() => setLeaving(null), 340);
    return () => window.clearTimeout(timer);
  }, [label]);

  return (
    <Link className="button nav-contact" to="/#contact" state={sectionCta[active] ? { pipeline: { intent: sectionCta[active].intent } } : undefined} aria-label={label}>
      <span className="cta-label" style={{ width }}>
        <span key={label} className="cta-text cta-text-in">{label}</span>
        {leaving && <span key={`leaving-${leaving}`} className="cta-text cta-text-out" aria-hidden="true">{leaving}</span>}
      </span>
      <span ref={ruler} className="cta-ruler" aria-hidden="true">{label}</span>
      <ArrowUpRight size={16} />
    </Link>
  );
}

const scrollBands = [['projects', 'var(--cover)'], ['experience', 'var(--subtle)']] as const;

function paintScrollTrack() {
  const root = document.documentElement;
  let stops = 'var(--canvas) 0';
  let middle: string | undefined;
  for (const [id, colour] of scrollBands) {
    const box = document.getElementById(id)?.getBoundingClientRect();
    if (!box || box.bottom <= 0 || box.top >= innerHeight) continue;
    const top = Math.max(box.top, 0);
    const bottom = Math.min(box.bottom, innerHeight);
    stops += ` ${top}px, ${colour} ${top}px ${bottom}px, var(--canvas) ${bottom}px`;
    if (id === 'projects' && top <= innerHeight / 2 && bottom >= innerHeight / 2) middle = 'dark';
  }
  root.style.setProperty('--scroll-track', `linear-gradient(${stops})`);
  root.dataset.scrollSurface = middle ?? 'page';
}

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const reduced = useReducedMotion();
  const [active, setActive] = useState('');
  const [condensed, setCondensed] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [pill, setPill] = useState<CSSProperties>({});
  const [overDark, setOverDark] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.key]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) dialog.showModal();
    if (!menuOpen && dialog.open) dialog.close();
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [menuOpen]);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const closeAtDesktop = () => { if (media.matches) setMenuOpen(false); };
    media.addEventListener('change', closeAtDesktop);
    return () => media.removeEventListener('change', closeAtDesktop);
  }, []);

  useEffect(() => {
    if (location.pathname !== '/') { setActive(''); return; }
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = innerHeight * .4;
      const current = navigation.filter(link => {
        const section = document.getElementById(link.href.slice(2));
        return section && section.getBoundingClientRect().top <= line;
      }).pop();
      const contact = document.getElementById('contact');
      const inContact = contact && contact.getBoundingClientRect().top <= line;
      setActive(inContact ? '' : current?.label ?? '');
    };
    const schedule = () => { frame ||= requestAnimationFrame(measure); };
    measure();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    return () => { removeEventListener('scroll', schedule); removeEventListener('resize', schedule); cancelAnimationFrame(frame); };
  }, [location.pathname]);

  useEffect(() => {
    const update = () => {
      setCondensed(current => current ? scrollY > 40 : scrollY > 96);
      const range = document.documentElement.scrollHeight - innerHeight;
      progressRef.current?.style.setProperty('--read', String(range > 0 ? Math.min(scrollY / range, 1) : 0));
      const work = document.getElementById('projects')?.getBoundingClientRect();
      setOverDark(Boolean(work && work.top <= 44 && work.bottom >= 44));
      paintScrollTrack();
    };
    update();
    const settle = window.setTimeout(update, 400);
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    return () => { window.clearTimeout(settle); removeEventListener('scroll', update); removeEventListener('resize', update); };
  }, [location.pathname]);

  useLayoutEffect(() => {
    const link = navRef.current?.querySelector<HTMLElement>('a[aria-current]');
    if (link) setPill({ width: link.offsetWidth, transform: `translateX(${link.offsetLeft}px)` });
  }, [active]);

  function switchTheme(event: MouseEvent<HTMLButtonElement>) {
    const start = (document as Document & { startViewTransition?: (update: () => void) => unknown }).startViewTransition;
    if (!start || reduced) { toggleTheme(); return; }
    const root = document.documentElement;
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    root.style.setProperty('--reveal-x', `${left + width / 2}px`);
    root.style.setProperty('--reveal-y', `${top + height / 2}px`);
    start.call(document, () => flushSync(toggleTheme));
  }

  function closeMenu() {
    setMenuOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <>
      <header className="site-header" data-condensed={condensed} data-over-dark={overDark}>
        <div className="nav-shell">
          <Link className="brand" to="/" aria-label="Samarth Sharma home">
            <img className="brand-mark" src="/brand/skyray.png" width="36" height="36" alt="" />
            <span>Samarth Sharma<span className="brand-period">.</span></span>
          </Link>
          <nav ref={navRef} className="desktop-nav" aria-label="Main navigation">
            <span className="nav-pill" aria-hidden="true" data-visible={Boolean(active)} style={pill} />
            {navigation.map(link => <Link key={link.label} to={link.href} aria-current={active === link.label ? 'location' : undefined}>
              <span className="nav-label">{link.label}</span>
            </Link>)}
          </nav>
          <div className="nav-actions">
            <button className="palette-trigger" aria-label="Open command menu" aria-keyshortcuts="Meta+K Control+K" onClick={() => dispatchEvent(new Event('palette:open'))}><Search size={15} aria-hidden="true" /><kbd>⌘K</kbd></button>
            <button className="icon-button theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} onClick={switchTheme}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <NavCta active={active} />
            <button ref={buttonRef} className="icon-button menu-toggle" aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(true)}>
              <Menu size={22} />
            </button>
          </div>
          <span ref={progressRef} className="nav-progress" aria-hidden="true" />
        </div>
      </header>
      <dialog ref={dialogRef} id="mobile-navigation" className="mobile-dialog" aria-label="Navigation" onCancel={closeMenu} onClose={() => setMenuOpen(false)} onClick={event => { if (event.target === dialogRef.current) closeMenu(); }}>
        <div className="mobile-dialog-content">
          <div className="mobile-dialog-heading"><h2 className="menu-title">Navigation</h2><button className="icon-button" aria-label="Close navigation" onClick={closeMenu}><X size={24} /></button></div>
          <nav aria-label="Mobile navigation">
            {navigation.map(link => <Link key={link.label} to={link.href} onClick={closeMenu}>{link.label}<ArrowUpRight size={26} /></Link>)}
            <Link to="/projects" onClick={closeMenu}>All projects<ArrowUpRight size={26} /></Link>
            <Link to="/resume" onClick={closeMenu}>Resume<ArrowUpRight size={26} /></Link>
            <Link to="/#contact" onClick={closeMenu}>Contact<ArrowUpRight size={26} /></Link>
          </nav>
          <Link className="button mobile-menu-cta" to="/#contact" state={{ pipeline: { intent: 'question' } }} onClick={closeMenu}>Start a message <ArrowUpRight size={18} aria-hidden="true" /></Link>
          <p className="mobile-menu-note">Web, cloud, and the things in between.</p>
        </div>
      </dialog>
    </>
  );
}
