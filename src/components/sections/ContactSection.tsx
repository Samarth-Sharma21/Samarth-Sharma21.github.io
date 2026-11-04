import { useState } from 'react';
import SkyrayWake from './SkyrayWake';
import { ArrowUpRight, Check, Copy } from 'lucide-react';

const email = 'samarthsharma7621@gmail.com';
const composeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
type CopyState = 'idle' | 'copied' | 'unavailable';

export default function ContactSection() {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [copyCount, setCopyCount] = useState(0);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopyCount(count => count + 1);
      setCopyState('copied');
    } catch {
      setCopyState('unavailable');
    }
  }

  return (
    <section id="contact" className="contact-section section-space container-custom" tabIndex={-1}>
      <SkyrayWake />
      <div className="contact-grid">
        <h2>Have a question?<br />Let's talk.</h2>
        <p>Curious about something in my portfolio, or have an idea you'd like to build? My inbox is open.</p>
      </div>
      <div className="contact-details">
        <div className="email-row">
          <a href={composeUrl} target="_blank" rel="noopener noreferrer" aria-label={`Email ${email} using Gmail, opens in a new tab`}>samarthsharma7621<wbr />@gmail.com <ArrowUpRight aria-hidden="true" /></a>
          <button className="icon-button" onClick={copyEmail} aria-label="Copy email"><span className="copy-icon" key={`${copyState}-${copyCount}`} data-copied={copyState === 'copied'}>{copyState === 'copied' ? <Check size={18} /> : <Copy size={18} />}</span></button>
        </div>
        <div className="contact-meta">
          <p className="copy-feedback" role="status">{copyState === 'copied' ? 'Email address copied.' : copyState === 'unavailable' ? 'Copy is unavailable. You can select the email address above.' : 'Opens Gmail in a new tab, or copy the address.'}</p>
          <div className="contact-socials"><a href="https://github.com/Samarth-Sharma21" target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={15} /></a><a href="https://linkedin.com/in/samarth-sh" target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={15} /></a></div>
        </div>
      </div>
    </section>
  );
}
