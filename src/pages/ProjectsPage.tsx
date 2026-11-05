import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useReducedMotion from '../hooks/useReducedMotion';

import { Link } from 'react-router-dom';
import { projectCategories, projects } from '../data/projects';
import type { ProjectCategory } from '../types';
import ProjectCard from '../components/projects/ProjectCard';

export default function ProjectsPage() {
  const [filter, setFilter] = useState<ProjectCategory | 'all'>('all');
  const reduced = useReducedMotion();
  const [keyboard, setKeyboard] = useState(false);
  const instant = reduced || keyboard;
  const filtered = filter === 'all' ? projects : projects.filter(project => project.category === filter);

  return (
    <section className="archive-page container-custom">
      <Link className="text-link archive-back" to="/#projects"><ArrowLeft size={16} aria-hidden="true" /> Back to selected work</Link>
      <div className="section-heading archive-heading"><div><h1>The project<br />archive.</h1></div><p>A collection of applications, tools, and experiments. Some polished. Some early. Each one taught me something.</p></div>
      <div className="archive-toolbar">
        <div className="project-filters" aria-label="Filter projects">
          {[{ id: 'all' as const, label: 'All projects' }, ...projectCategories].map(category => <button key={category.id} aria-pressed={filter === category.id} onClick={event => { setKeyboard(event.detail === 0); setFilter(category.id); }}>
            {filter === category.id && <motion.span className="filter-indicator" layoutId="project-filter" aria-hidden="true" transition={{ duration: instant ? 0 : 0.18, ease: [0.23, 1, 0.32, 1] }} />}
            <span className="filter-label">{category.label}{category.id === 'all' && <span>{projects.length}</span>}</span>
          </button>)}
        </div>
        <p className="project-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'project' : 'projects'}</p>
      </div>
      <div className="archive-grid">
        <AnimatePresence initial={false} mode="popLayout">
          {filtered.map(project => <motion.div key={project.id} layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ opacity: { duration: instant ? 0 : 0.15 }, layout: { duration: instant ? 0 : 0.22, ease: [0.23, 1, 0.32, 1] } }}><ProjectCard project={project} /></motion.div>)}
        </AnimatePresence>
      </div>
      <div className="archive-bottom"><p>There's always another idea in the works.</p><a className="text-link" href="https://github.com/Samarth-Sharma21" target="_blank" rel="noopener noreferrer">More on GitHub <ArrowUpRight size={16} aria-hidden="true" /></a></div>
    </section>
  );
}
