import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../../contexts/theme';

const navigation = [
  { label: 'Work', href: '/#projects' },
  { label: 'About', href: '/#about' },
  { label: 'Experience', href: '/#experience' },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

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

  function closeMenu() {
    setMenuOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <>
      <header className="site-header">
        <div className="nav-shell">
          <Link className="brand" to="/" aria-label="Samarth Sharma home">
            <img className="brand-mark" src="/brand/skyray.png" width="36" height="36" alt="" />
            <span>Samarth Sharma<span className="brand-period">.</span></span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.map(link => <Link key={link.label} to={link.href}>{link.label}</Link>)}
          </nav>
          <div className="nav-actions">
            <button className="icon-button theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link className="button nav-contact" to="/#contact">Let's talk </Link>
            <button ref={buttonRef} className="icon-button menu-toggle" aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(true)}>
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>
      <dialog ref={dialogRef} id="mobile-navigation" className="mobile-dialog" aria-label="Navigation" onCancel={closeMenu} onClose={() => setMenuOpen(false)} onClick={event => { if (event.target === dialogRef.current) closeMenu(); }}>
        <div className="mobile-dialog-content">
          <div className="mobile-dialog-heading"><h2 className="menu-title">Navigation</h2><button className="icon-button" aria-label="Close navigation" onClick={closeMenu}><X size={24} /></button></div>
          <nav aria-label="Mobile navigation">
            {navigation.map(link => <Link key={link.label} to={link.href} onClick={closeMenu}>{link.label}</Link>)}
            <Link to="/projects" onClick={closeMenu}>All projects</Link>
            <Link to="/#contact" onClick={closeMenu}>Contact</Link>
          </nav>
          <p className="mobile-menu-note">Web, cloud, and the things in between.</p>
        </div>
      </dialog>
    </>
  );
}
