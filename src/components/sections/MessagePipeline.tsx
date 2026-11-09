import { CSSProperties, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export type Intent = 'role' | 'project' | 'question' | 'hello';
type Draft = { intent: Intent | null; message: string; name: string };
export type PipelinePreset = { intent: Intent; message?: string };
type Stage = { id: string; label: string; next: string; passes: (draft: Draft) => boolean };

const intents: ReadonlyArray<{ id: Intent; label: string; subject: string; prompt: string; starter: string }> = [
  { id: 'role', label: 'A role', subject: 'A role for you', prompt: 'The team, the role, and why you thought of me.', starter: 'We have a DevOps role on our team, and your portfolio caught my attention. Could we talk about it?' },
  { id: 'project', label: 'A project', subject: 'A project idea', prompt: 'What you want to build, and where it is stuck.', starter: 'I have an idea I would like to build, and I would value your thoughts on it. Here is the short version: ' },
  { id: 'question', label: 'A question', subject: 'A question from your portfolio', prompt: 'What are you curious about?', starter: 'I was looking through your portfolio and wanted to ask about ' },
  { id: 'hello', label: 'Just hello', subject: 'Saying hello', prompt: 'What caught your eye?', starter: 'Just saying hello. I liked your portfolio, especially ' },
];

const stages: readonly Stage[] = [
  { id: 'reason', label: 'Reason', next: 'Pick a reason to start the run.', passes: draft => draft.intent !== null },
  { id: 'message', label: 'Message', next: 'Write at least 20 characters.', passes: draft => draft.message.trim().length >= 20 },
  { id: 'signature', label: 'Signed', next: 'Sign it with your name.', passes: draft => draft.name.trim().length >= 2 },
];

function composeLinks(draft: Draft, address: string) {
  const name = draft.name.trim();
  const subject = `${intents.find(intent => intent.id === draft.intent)?.subject}, from ${name}`;
  const body = `Hi Samarth,\n\n${draft.message.trim()}\n\n${name}`;
  const gmail = new URL('https://mail.google.com/mail/');
  gmail.search = new URLSearchParams({ view: 'cm', fs: '1', to: address, su: subject, body }).toString();
  return { text: `To: ${address}\nSubject: ${subject}\n\n${body}`, gmail: gmail.href, mail: `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` };
}

const draftKey = 'pipeline-draft';
const presetKey = 'pipeline-preset-applied';

function readSession(key: string) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

function writeSession(key: string, value: string) {
  try { sessionStorage.setItem(key, value); } catch { return; }
}

function restoreDraft(): Draft {
  const empty: Draft = { intent: null, message: '', name: '' };
  try {
    const saved: Partial<Draft> = JSON.parse(readSession(draftKey) ?? '{}');
    return {
      intent: intents.find(intent => intent.id === saved.intent)?.id ?? null,
      message: typeof saved.message === 'string' ? saved.message : '',
      name: typeof saved.name === 'string' ? saved.name : '',
    };
  } catch {
    return empty;
  }
}

export default function MessagePipeline({ address }: { address: string }) {
  const [draft, setDraft] = useState<Draft>(restoreDraft);
  const [opened, setOpened] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [copied, setCopied] = useState(false);
  const messageField = useRef<HTMLTextAreaElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const preset = (location.state as { pipeline?: PipelinePreset } | null)?.pipeline;

  useEffect(() => {
    if (!preset || readSession(presetKey) === location.key) return;
    writeSession(presetKey, location.key);
    setDraft(current => ({ ...current, intent: preset.intent, message: preset.message ?? current.message }));
    setOpened(false);
    const field = messageField.current;
    if (!field) return;
    field.focus({ preventScroll: true });
    const end = (preset.message ?? field.value).length;
    field.setSelectionRange(end, end);
  }, [preset, location.key]);

  useEffect(() => { writeSession(draftKey, JSON.stringify(draft)); }, [draft]);

  useEffect(() => {
    if (location.hash !== '#contact') return;
    setArrived(true);
    const timer = window.setTimeout(() => setArrived(false), 1400);
    return () => window.clearTimeout(timer);
  }, [location.hash, location.key]);

  const results = stages.map(stage => stage.passes(draft));
  const firstOpen = results.indexOf(false);
  const ready = firstOpen === -1;
  const progress = (ready ? stages.length : firstOpen) / stages.length;
  const links = ready ? composeLinks(draft, address) : null;
  const prompt = intents.find(intent => intent.id === draft.intent)?.prompt ?? 'Choose a reason, or just start typing.';
  const summary = opened ? 'Draft opened. Press send in your mail app.' : ready ? 'All checks passed. Ready to deploy.' : stages[firstOpen].next;

  async function copyDraft() {
    if (!links) return;
    try { await navigator.clipboard.writeText(links.text); setCopied(true); } catch { setCopied(false); }
  }

  function focusStage(id: string) {
    if (id === 'inbox') {
      const deploy = root.current?.querySelector<HTMLAnchorElement>('a.pipeline-deploy');
      if (deploy) deploy.focus({ preventScroll: true }); else focusStage(stages[firstOpen].id);
      return;
    }
    const field = id === 'reason' ? root.current?.querySelector<HTMLInputElement>('.pipeline-intents input') : id === 'message' ? messageField.current : root.current?.querySelector<HTMLInputElement>('.pipeline-field input');
    field?.focus({ preventScroll: true });
  }

  function update(change: Partial<Draft>) {
    setDraft(current => ({ ...current, ...change }));
    setOpened(false);
    setCopied(false);
  }

  return (
    <div ref={root} className="pipeline" data-ready={ready} data-opened={opened} data-arrived={arrived} role="group" aria-labelledby="pipeline-title">
      <h3 id="pipeline-title">Send a message through my pipeline.</h3>
      <div className="pipeline-rail" style={{ '--progress': progress } as CSSProperties}>
        <div className="pipeline-track" aria-hidden="true"><span className="pipeline-fill" /></div>
        <div className="pipeline-runner" aria-hidden="true"><img src="/brand/skyray.png" alt="" width="30" height="30" /></div>
        <ol>
          {stages.map((stage, index) => <li key={stage.id} data-status={results[index] ? 'passed' : index === firstOpen ? 'active' : 'queued'}><button type="button" aria-label={`Go to ${stage.label}`} onClick={() => focusStage(stage.id)}><span className="pipeline-dot" />{stage.label}</button></li>)}
          <li data-status={ready ? 'passed' : 'queued'}><button type="button" aria-label="Go to Inbox" onClick={() => focusStage('inbox')}><span className="pipeline-dot" />Inbox</button></li>
        </ol>
      </div>

      <fieldset className="pipeline-intents">
        <legend>What brings you here?</legend>
        {intents.map(intent => <label key={intent.id}><input className="sr-only" type="radio" name="pipeline-intent" checked={draft.intent === intent.id} onChange={() => update({ intent: intent.id })} /><span>{intent.label}</span></label>)}
      </fieldset>

      <label className="pipeline-field"><span className="pipeline-label">Your message{draft.intent && !draft.message && <button type="button" className="pipeline-starter" onClick={() => { const starter = intents.find(intent => intent.id === draft.intent)?.starter ?? ''; update({ message: starter }); messageField.current?.focus({ preventScroll: true }); }}>Give me a starting line</button>}{draft.message.length > 0 && <small className="pipeline-meter" data-short={draft.message.trim().length < 20}>{draft.message.trim().length < 20 ? `${20 - draft.message.trim().length} more to pass` : `${draft.message.length} / 1200`}</small>}</span><textarea ref={messageField} rows={3} maxLength={1200} placeholder={prompt} value={draft.message} onChange={event => update({ message: event.target.value })} /></label>
      <label className="pipeline-field"><span>Your name</span><input type="text" autoComplete="name" maxLength={80} value={draft.name} onChange={event => update({ name: event.target.value })} /></label>

      <div className="pipeline-footer">
        <p aria-live="polite">{summary}</p>
        {links
          ? <a className="button pipeline-deploy" href={links.gmail} target="_blank" rel="noopener noreferrer" onClick={() => setOpened(true)}>Deploy to inbox <ArrowUpRight size={16} aria-hidden="true" /></a>
          : <span className="button pipeline-deploy">Deploy to inbox <ArrowUpRight size={16} aria-hidden="true" /></span>}
      </div>
      {links && <div className="pipeline-alt"><button type="button" onClick={copyDraft}>{copied ? 'Copied' : 'Copy message'}</button><a href={links.mail} onClick={() => setOpened(true)}>Use another mail app</a></div>}
    </div>
  );
}
