import { MapPin } from 'lucide-react';

export default function ExperienceSection() {
  return (
    <section id="experience" className="experience-section section-space" tabIndex={-1}>
      <div className="container-custom experience-grid"><div><h2>Experience.</h2><p className="experience-intro">Building reliable systems with the people who depend on them.</p></div><div className="experience-detail"><div className="experience-title"><div><h3>DevOps Engineer</h3><p>Paytm</p></div></div><div className="experience-top"><span className="experience-dates">June 2025 to present</span><span><MapPin size={13} /> Noida, India</span></div><p>Supporting CI/CD pipelines and cloud infrastructure. Working with development teams to automate deployments and improve the reliability of their applications.</p><ul className="experience-points"><li>Configure and maintain Jenkins pipelines for testing and deployment.</li><li>Manage containerized applications with Docker and Kubernetes.</li><li>Work with AWS infrastructure and Terraform configuration.</li><li>Build automation scripts and monitor application infrastructure.</li></ul><ul className="tech-list" aria-label="Experience technologies">{['Docker', 'Kubernetes', 'Jenkins', 'AWS', 'Terraform'].map(tech => <li key={tech}>{tech}</li>)}</ul></div></div>
    </section>
  );
}
