import { ArrowLeft, ArrowUpRight, LayoutGrid, List, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useReducedMotion from '../hooks/useReducedMotion';

import { Link, useSearchParams } from 'react-router-dom';
import { projectCategories, projects } from '../data/projects';
import type { ProjectCategory } from '../types';
import ProjectCard from '../components/projects/ProjectCard';

const tally = [...projects.flatMap(project => project.tech).reduce((counts, tech) => counts.set(tech, (counts.get(tech) ?? 0) + 1), new Map<string, number>())].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches ? value : 0);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const started = performance.now();
    const tick = (time: number) => {
      const progress = Math.min((time - started) / 700, 1);
      setShown(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <dd aria-label={String(value)}>{shown}</dd>;
}

export default function ProjectsPage() {
  const [params, setParams] = useSearchParams();
  const update = (key: string, value: string | null) => setParams(current => {
    const next = new URLSearchParams(current);
    if (value) next.set(key, value); else next.delete(key);
    return next;
  }, { replace: true });
  const requested = params.get('type');
  const filter: ProjectCategory | 'all' = projectCategories.find(category => category.id === requested)?.id ?? 'all';
  const reduced = useReducedMotion();
  const cardCursor = useRef(-1);
  const [keyboard, setKeyboard] = useState(false);
  const instant = reduced || keyboard;
  const search = params.get('q') ?? '';
  const tech = params.get('tech');
  const view = params.get('view') === 'list' ? 'list' : 'grid';
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = projects.filter(project => (filter === 'all' || project.category === filter) && (!tech || project.tech.includes(tech)) && words.every(word => `${project.title} ${project.description} ${project.tech.join(' ')}`.toLowerCase().includes(word)));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.key !== 'j' && event.key !== 'k') || event.metaKey || event.ctrlKey || (event.target as HTMLElement).closest('input, textarea, dialog')) return;
      const cards = [...document.querySelectorAll<HTMLElement>('.archive-grid .project-card')];
      const next = cardCursor.current + (event.key === 'j' ? 1 : -1);
      if (next < 0 || next >= cards.length) return;
      cardCursor.current = next;
      cards[next].scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      cards[next].querySelector<HTMLElement>('.project-links a')?.focus({ preventScroll: true });
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  return (
    <section className="archive-page container-custom">
      <Link className="text-link archive-back" to="/#projects"><ArrowLeft size={16} aria-hidden="true" /> Back to selected work</Link>
      <div className="section-heading archive-heading"><div><h1>The project<br />archive.</h1></div><p>A collection of applications, tools, and experiments. Some polished. Some early. Each one taught me something.</p></div>
      <dl className="archive-stats"><div><CountUp value={projects.length} /><dt>Projects</dt></div><div><CountUp value={projects.filter(project => project.demo).length} /><dt>Live demos</dt></div><div><CountUp value={tally.length} /><dt>Technologies</dt></div></dl>
      <div className="archive-toolbar">
        <div className="project-filters" aria-label="Filter projects">
          {[{ id: 'all' as const, label: 'All projects' }, ...projectCategories].map(category => <button key={category.id} aria-pressed={filter === category.id} onClick={event => { setKeyboard(event.detail === 0); update('type', category.id === 'all' ? null : category.id); }}>
            {filter === category.id && <motion.span className="filter-indicator" layoutId="project-filter" aria-hidden="true" transition={{ duration: instant ? 0 : 0.18, ease: [0.23, 1, 0.32, 1] }} />}
            <span className="filter-label">{category.label}{category.id === 'all' && <span>{projects.length}</span>}</span>
          </button>)}
        </div>
        <label className="archive-search"><Search size={15} aria-hidden="true" /><span className="sr-only">Search projects</span><input type="search" placeholder="Search projects" value={search} onChange={event => update('q', event.target.value || null)} /></label>
        <div className="view-toggle" role="group" aria-label="Layout"><button aria-label="Grid view" aria-pressed={view === 'grid'} onClick={() => update('view', null)}><LayoutGrid size={16} aria-hidden="true" /></button><button aria-label="List view" aria-pressed={view === 'list'} onClick={() => update('view', 'list')}><List size={16} aria-hidden="true" /></button></div>
        <p className="project-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'project' : 'projects'}</p>
      </div>
      <div className="tech-filter" aria-label="Filter by technology">{tally.map(([name, count]) => <button key={name} aria-pressed={tech === name} onClick={() => update('tech', tech === name ? null : name)}>{name}{count > 1 && <span>{count}</span>}</button>)}</div>
      <div className="archive-grid" data-view={view}>
        <AnimatePresence initial={false} mode="popLayout">
          {filtered.map(project => <motion.div key={project.id} layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ opacity: { duration: instant ? 0 : 0.15 }, layout: { duration: instant ? 0 : 0.22, ease: [0.23, 1, 0.32, 1] } }}><ProjectCard project={project} /></motion.div>)}
        </AnimatePresence>
      </div>
      {filtered.length === 0 && <div className="archive-empty"><h2>No projects match.</h2><p>Try fewer filters, or tell me what you were hoping to find.</p><div><button className="button button-primary" onClick={() => setParams(current => { const next = new URLSearchParams(); const layout = current.get('view'); if (layout) next.set('view', layout); return next; }, { replace: true })}>Clear filters</button><Link className="text-link" to="/#contact" state={{ pipeline: { intent: 'question', message: search ? `Do you have anything on ${search}? ` : undefined } }}>Ask me</Link></div></div>}
      <div className="archive-bottom"><p>There's always another idea in the works.</p><a className="text-link" href="https://github.com/Samarth-Sharma21" target="_blank" rel="noopener noreferrer">More on GitHub <ArrowUpRight size={16} aria-hidden="true" /></a></div>
    </section>
  );
}
