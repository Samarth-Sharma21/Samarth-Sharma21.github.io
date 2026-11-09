import { Download, Printer } from 'lucide-react';
import { profile } from '../data/profile';
import { projects } from '../data/projects';

const contactCard = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${profile.name}`, `EMAIL;TYPE=INTERNET:${profile.email}`, `URL:${profile.site}`, 'END:VCARD'].join('\r\n');

export default function ResumePage() {
  return (
    <section className="resume container-custom">
      <header className="resume-head">
        <div><h1>{profile.name}</h1><p>{profile.location}</p></div>
        <div className="resume-actions"><a className="button resume-card" href={`data:text/vcard;charset=utf-8,${encodeURIComponent(contactCard)}`} download="samarth-sharma.vcf"><Download size={16} aria-hidden="true" /> Save contact</a><button className="button button-primary" onClick={() => window.print()}><Printer size={16} aria-hidden="true" /> Print or save PDF</button></div>
      </header>
      <p className="resume-links"><a href={`mailto:${profile.email}`}>{profile.email}</a><a href={profile.github}>GitHub</a><a href={profile.linkedin}>LinkedIn</a><a href={profile.site}>Portfolio</a></p>
      <p className="resume-summary">{profile.summary}</p>
      <h2>Experience</h2>
      <article><h3>{profile.role}, {profile.company}</h3><p className="resume-meta">{profile.dates}</p><p>{profile.experienceSummary}</p><ul>{profile.experiencePoints.map(point => <li key={point}>{point}</li>)}</ul></article>
      <h2>Skills</h2>
      <dl className="resume-skills">{profile.capabilities.map(capability => <div key={capability.title}><dt>{capability.title}</dt><dd>{capability.tools}</dd></div>)}</dl>
      <h2>Projects</h2>
      <div className="resume-projects">{projects.map(project => <article key={project.id}><h3><a href={project.demo ?? project.github}>{project.title}</a></h3><p>{project.description}</p><p className="resume-meta">{project.tech.join(' · ')}</p></article>)}</div>
    </section>
  );
}
