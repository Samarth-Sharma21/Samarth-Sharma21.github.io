import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { profile } from '../../data/profile';

export default function ExperienceSection() {
  return (
    <section id="experience" className="experience-section section-space" tabIndex={-1}>
      <div className="container-custom experience-grid">
        <div><h2>Experience.</h2><p className="experience-intro">Building reliable systems with the people who depend on them.</p></div>
        <article className="xp">
          <header className="xp-head">
            <div><p className="xp-company">{profile.company}</p><h3>{profile.role}</h3></div>
            <dl className="xp-meta"><div><dt>Started</dt><dd className="experience-dates">{profile.dates.split(',')[0]}</dd></div><div><dt>Length</dt><dd>{profile.length}</dd></div><div><dt>Based in</dt><dd>{profile.city}</dd></div></dl>
          </header>
          <p className="xp-summary">{profile.experienceSummary}</p>
          <ol className="xp-trace">{profile.experiencePoints.map(point => <li key={point}>{point}</li>)}</ol>
          <ul className="xp-tools" aria-label="Experience technologies">{profile.experienceTools.map(tech => <li key={tech}><img src={`/tool-icons/${profile.toolIcons[tech]}.svg`} alt="" width="20" height="20" />{tech}</li>)}</ul>
          <Link className="text-link" to="/resume">View the one page resume <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </article>
      </div>
    </section>
  );
}
