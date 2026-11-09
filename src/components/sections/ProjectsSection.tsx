import { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projects } from '../../data/projects';
import ProjectCard from '../projects/ProjectCard';

export default function ProjectsSection() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = section.current;
    const card = root?.querySelector<HTMLElement>('.project-card-prominent');
    const next = root?.querySelector<HTMLElement>('.featured-rest');
    if (!card || !next) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const box = card.getBoundingClientRect();
      const pinned = getComputedStyle(card).position === 'sticky';
      const progress = pinned ? Math.min(Math.max((box.top + card.offsetHeight - next.getBoundingClientRect().top) / (card.offsetHeight * .78), 0), 1) : 0;
      card.style.setProperty('--covered', progress.toFixed(3));
      if (progress > 0) card.dataset.covering = progress >= 1 ? 'done' : 'active'; else delete card.dataset.covering;
    };
    const schedule = () => { frame ||= requestAnimationFrame(measure); };
    measure();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    return () => { removeEventListener('scroll', schedule); removeEventListener('resize', schedule); cancelAnimationFrame(frame); };
  }, []);

  const [lead, ...rest] = projects.filter(project => project.featured);
  return (
    <section ref={section} id="projects" className="work-section" tabIndex={-1} onPointerMove={event => { const card = (event.target as HTMLElement).closest<HTMLElement>('.project-card'); if (!card || event.pointerType !== 'mouse') return; const box = card.getBoundingClientRect(); card.style.setProperty('--spot-x', `${event.clientX - box.left}px`); card.style.setProperty('--spot-y', `${event.clientY - box.top}px`); }}>
      <div className="container-custom">
        <div className="section-heading work-heading"><div><h2>Selected work.</h2><p className="work-count">{rest.length + 1} of {projects.length} projects</p></div><p>A few projects across the web, developer tools, and the problems I find interesting.</p></div>
        <div className="featured-grid"><ProjectCard project={lead} prominent /><div className="featured-rest">{rest.map(project => <ProjectCard key={project.id} project={project} />)}</div></div>
        <div className="work-footer"><p>More experiments. More things learned.</p><Link to="/projects" className="button button-light">See all {projects.length} projects <ArrowUpRight size={17} /></Link></div>
      </div>
    </section>
  );
}
