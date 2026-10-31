import { useState } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projectCategories, projects } from '../data/projects';
import type { ProjectCategory } from '../types';
import ProjectCard from '../components/projects/ProjectCard';

export default function ProjectsPage() {
  const [filter, setFilter] = useState<ProjectCategory | 'all'>('all');
  const filtered = filter === 'all' ? projects : projects.filter(project => project.category === filter);

  return (
    <section className="archive-page container-custom">
      <Link className="text-link archive-back" to="/#projects"><ArrowLeft size={16} /> Back to selected work</Link>
      <div className="section-heading archive-heading"><div><h1>The project<br />archive.</h1></div><p>A collection of applications, tools, and experiments. Some polished. Some early. Each one taught me something.</p></div>
      <div className="archive-toolbar"><div className="project-filters" aria-label="Filter projects"><button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All projects <span>{projects.length}</span></button>{projectCategories.map(category => <button key={category.id} aria-pressed={filter === category.id} onClick={() => setFilter(category.id)}>{category.label}</button>)}</div><p className="project-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'project' : 'projects'}</p></div>
      <div className="archive-grid">{filtered.map(project => <ProjectCard key={project.id} project={project} />)}</div>
      <div className="archive-bottom"><p>There's always another idea in the works.</p><a className="text-link" href="https://github.com/Samarth-Sharma21" target="_blank" rel="noopener noreferrer">More on GitHub <ArrowUpRight size={16} /></a></div>
    </section>
  );
}
