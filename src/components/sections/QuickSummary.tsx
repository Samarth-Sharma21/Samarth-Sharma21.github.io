import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, X } from 'lucide-react';
import { profile } from '../../data/profile';
import { projects } from '../../data/projects';

const featured = projects.filter(project => project.featured);
const canShare = typeof navigator !== 'undefined' && 'share' in navigator;

export default function QuickSummary() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  async function copySummary() {
    const text = `${profile.name}\n${profile.role} at ${profile.company}, ${profile.dates}\n${profile.location}\n${profile.summary}\n\nWorks with: ${profile.experienceTools.join(', ')}\nEmail: ${profile.email}\nPortfolio: ${profile.site}\nGitHub: ${profile.github}\nLinkedIn: ${profile.linkedin}`;
    try { await navigator.clipboard.writeText(text); setCopied(true); } catch { setCopied(false); }
  }

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <>
      <button type="button" className="hero-route-button" onClick={() => setOpen(true)}>30-second version</button>
      <dialog ref={dialog} className="quick-summary" aria-labelledby="quick-summary-title" onClose={() => { setOpen(false); setCopied(false); }} onClick={event => { if (event.target === dialog.current) setOpen(false); }}>
        <div className="quick-summary-body">
          <div className="quick-summary-head"><h2 id="quick-summary-title">The 30-second version.</h2><button className="icon-button" aria-label="Close summary" onClick={() => setOpen(false)}><X size={20} /></button></div>
          <dl>
            <div><dt>Experience</dt><dd>{profile.role} at {profile.company}, {profile.dates}</dd></div>
            <div><dt>Based in</dt><dd>{profile.location}</dd></div>
            <div><dt>Works with</dt><dd>{profile.experienceTools.join(', ')}</dd></div>
            <div><dt>Also builds</dt><dd>{featured.map(project => <a key={project.id} href={project.demo ?? project.github} target="_blank" rel="noopener noreferrer">{project.title}</a>)}</dd></div>
          </dl>
          <div className="quick-summary-actions">
            <Link className="button button-primary" to="/#contact" state={{ pipeline: { intent: 'role' } }} onClick={() => setOpen(false)}>Start a conversation <ArrowUpRight size={16} aria-hidden="true" /></Link>
            <Link className="text-link" to="/resume" onClick={() => setOpen(false)}>Full resume</Link>
            <button type="button" className="text-link quick-copy" onClick={copySummary}>{copied ? 'Copied' : 'Copy as text'}</button>
            {canShare && <button type="button" className="text-link quick-copy quick-share" onClick={() => { navigator.share({ title: profile.name, text: profile.summary, url: profile.site }).catch(() => undefined); }}>Share</button>}
          </div>
        </div>
      </dialog>
    </>
  );
}
