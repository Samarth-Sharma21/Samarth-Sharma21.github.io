import { ArrowDown, ArrowUpRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToolSculpture from './ToolSculpture';

export default function HeroSection() {
  return (
    <section id="home" className="hero container-custom" tabIndex={-1}>
      <div className="hero-main">
        <div className="hero-copy">
          <h1 className="hero-reveal">From systems<br /><span className="hero-heading-secondary">to interfaces.</span></h1>
          <p className="hero-description hero-reveal">I'm Samarth, a DevOps engineer working with cloud infrastructure and deployment pipelines. I also build web tools and explore AI.</p>
          <div className="hero-actions hero-reveal">
            <Link className="button button-primary" to="/#projects">Explore my work <ArrowDown size={17} /></Link>
            <Link className="text-link" to="/#contact">Get in touch <ArrowUpRight size={17} /></Link>
          </div>
        </div>
        <ToolSculpture />
      </div>
      <div className="hero-bottom"><span><MapPin size={14} /> Noida, India</span><span>Web development <i /> AI experiments <i /> Cloud infrastructure</span><Link to="/#projects" aria-label="Scroll to selected work"><ArrowDown size={17} /></Link></div>
    </section>
  );
}
