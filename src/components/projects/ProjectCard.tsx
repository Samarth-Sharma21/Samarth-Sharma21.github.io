import { useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Code2 } from 'lucide-react';
import type { Project } from '../../types';

export default function ProjectCard({ project, prominent = false }: { project: Project; prominent?: boolean }) {
  const [imageIndex, setImageIndex] = useState(0);
  const images = project.images.length > 0 ? project.images : project.image ? [project.image] : [];
  const selectedImage = images[imageIndex % Math.max(images.length, 1)];

  return (
    <article className={`project-card${prominent ? ' project-card-prominent' : ''}`} data-project-id={project.id}>
      <div className={`project-media project-media-${project.id}`}>
        {selectedImage ? <img src={selectedImage} alt={`${project.title} screenshot ${imageIndex + 1} of ${images.length}`} loading="lazy" width="1280" height="720" /> : <div className="project-no-media"><Code2 size={40} aria-hidden="true" /><span>{project.title}</span><span className="project-media-note">Code experiment</span></div>}
        {images.length > 1 && <div className="gallery-controls">
          <button className="icon-button" aria-label={`Previous image for ${project.title}`} onClick={() => setImageIndex(index => (index - 1 + images.length) % images.length)}><ChevronLeft size={17} /></button>
          <span className="gallery-count" aria-live="polite"><span className="gallery-count-value" key={imageIndex}>{imageIndex + 1}<span aria-hidden="true"> / </span><span className="sr-only">of </span>{images.length}</span></span>
          <button className="icon-button" aria-label={`Next image for ${project.title}`} onClick={() => setImageIndex(index => (index + 1) % images.length)}><ChevronRight size={17} /></button>
        </div>}
      </div>
      <div className="project-copy">
        <h3>{project.title}</h3>
        <p className="project-category">{project.category === 'web' ? 'Web application' : project.category === 'ai' ? 'AI experiment' : 'Developer tool'}</p>
        <p className="project-description">{project.description}</p>
        <ul className="tech-list" aria-label={`${project.title} technologies`}>{project.tech.map(tech => <li key={tech}>{tech}</li>)}</ul>
        <div className="project-links">
          <a href={project.github} target="_blank" rel="noopener noreferrer">View code <ArrowUpRight size={16} /><span className="sr-only"> for {project.title}, opens in a new tab</span></a>
          {project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer">Live demo <ArrowUpRight size={16} /><span className="sr-only"> of {project.title}, opens in a new tab</span></a>}
        </div>
      </div>
    </article>
  );
}
