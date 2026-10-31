import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projects } from '../../data/projects';
import ProjectCard from '../projects/ProjectCard';

export default function ProjectsSection() {
  const featured = projects.filter(project => project.featured);
  return (
    <section id="projects" className="work-section" tabIndex={-1}>
      <div className="container-custom">
        <div className="section-heading work-heading"><div><h2>Selected work.</h2></div><p>A few projects across the web, developer tools, and the problems I find interesting.</p></div>
        <div className="featured-grid">{featured.map((project, index) => <ProjectCard key={project.id} project={project} prominent={index === 0} />)}</div>
        <div className="work-footer"><p>More experiments. More things learned.</p><Link to="/projects" className="button button-light">All projects <ArrowUpRight size={17} /></Link></div>
      </div>
    </section>
  );
}
