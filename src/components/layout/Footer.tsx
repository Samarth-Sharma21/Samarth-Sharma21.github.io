import { ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer container-custom">
      <div className="footer-top">
        <p>Built with curiosity. © {new Date().getFullYear()}</p>
        <nav className="footer-nav" aria-label="Footer navigation"><Link to="/#projects">Work</Link><Link to="/#about">About</Link><Link to="/#contact">Contact</Link></nav>
        <Link className="back-top" to="/#home">Back to top <ArrowUp size={16} /></Link>
      </div>
      <Link className="footer-signature" to="/">Samarth Sharma<span>.</span></Link>
    </footer>
  );
}
