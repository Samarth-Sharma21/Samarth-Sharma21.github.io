import { ArrowDown, ArrowUpRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToolSculpture from './ToolSculpture';
import LocalClock from './LocalClock';
import QuickSummary from './QuickSummary';

export default function HeroSection() {
  return (
    <section id="home" className="hero container-custom" tabIndex={-1}>
      <div className="hero-main">
        <div className="hero-copy">
          <p className="hero-role hero-reveal"><i aria-hidden="true" />DevOps internship at Paytm, 2025</p>
          <h1><span className="hero-line"><span>From <em className="hero-word" data-word="systems">systems</em></span></span> <span className="hero-line"><span className="hero-heading-secondary">to <em className="hero-word" data-word="interfaces">interfaces</em>.</span></span></h1>
          <p className="hero-description hero-reveal">I'm Samarth, a DevOps engineer working with cloud infrastructure and deployment pipelines. I also build web tools and explore AI.</p>
          <div className="hero-actions hero-reveal">
            <Link className="button button-primary" to="/#projects">Explore my work <ArrowDown size={17} /></Link>
            <Link className="text-link" to="/#contact">Get in touch <ArrowUpRight size={17} /></Link>
          </div>
          <div className="hero-routes hero-reveal" role="group" aria-label="Choose why you are here"><Link to="/#contact" state={{ pipeline: { intent: 'role' } }}>Hiring?</Link><Link to="/#contact" state={{ pipeline: { intent: 'project' } }}>Have an idea?</Link><button type="button" className="hero-route-plain" onClick={() => dispatchEvent(new Event('palette:open'))}>Ask my portfolio</button><QuickSummary /></div>
        </div>
        <ToolSculpture />
      </div>
      <div className="hero-bottom"><span><MapPin size={14} /> Noida, India <i /> <LocalClock /></span><span>Web development <i /> AI experiments <i /> Cloud infrastructure</span><Link to="/#projects" aria-label="Scroll to selected work"><ArrowDown size={17} /></Link></div>
    </section>
  );
}
