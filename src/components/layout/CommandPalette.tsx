import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects } from '../../data/projects';
import { profile } from '../../data/profile';
import { useTheme } from '../../contexts/theme';
import PaletteTerminal from './PaletteTerminal';
import { answerQuestion } from '../../data/ask';

type Command = { id: string; label: string; group: string; run: () => void };

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const [view, setView] = useState<'menu' | 'terminal' | 'shortcuts'>('menu');
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const [shortcutsRequested, setShortcutsRequested] = useState(false);
  const toggleThemeRef = useRef(toggleTheme);
  const navigateRef = useRef(navigate);
  useEffect(() => { toggleThemeRef.current = toggleTheme; navigateRef.current = navigate; });

  const commands = useMemo<Command[]>(() => [
    { id: 'work', label: 'Selected work', group: 'Go to', run: () => navigate('/#projects') },
    { id: 'about', label: 'About', group: 'Go to', run: () => navigate('/#about') },
    { id: 'experience', label: 'Experience', group: 'Go to', run: () => navigate('/#experience') },
    { id: 'contact', label: 'Contact', group: 'Go to', run: () => navigate('/#contact') },
    { id: 'archive', label: 'Project archive', group: 'Go to', run: () => navigate('/projects') },
    { id: 'resume', label: 'Resume', group: 'Go to', run: () => navigate('/resume') },
    { id: 'copy-email', label: 'Copy email address', group: 'Do', run: () => { void navigator.clipboard.writeText(profile.email).catch(() => undefined); } },
    { id: 'terminal', label: 'Open terminal', group: 'Do', run: () => setView('terminal') },
    { id: 'shortcuts', label: 'Keyboard shortcuts', group: 'Do', run: () => setView('shortcuts') },
    { id: 'theme', label: 'Switch theme', group: 'Do', run: toggleTheme },
    { id: 'message', label: 'Start a message', group: 'Do', run: () => navigate('/#contact', { state: { pipeline: { intent: 'question' } } }) },
    { id: 'github', label: 'Open GitHub', group: 'Do', run: () => { window.open(profile.github, '_blank', 'noopener'); } },
    { id: 'linkedin', label: 'Open LinkedIn', group: 'Do', run: () => { window.open(profile.linkedin, '_blank', 'noopener'); } },
    ...projects.map(project => ({ id: project.id, label: project.title, group: 'Projects', run: () => navigate(`/projects#${project.id}`) })),
  ], [navigate, toggleTheme]);

  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results = commands.filter(command => words.every(word => `${command.label} ${command.group}`.toLowerCase().includes(word)));
  const answer = answerQuestion(query);
  const selected = Math.min(index, Math.max(results.length - 1, 0));

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(value => !value); return; }
      const target = event.target as HTMLElement;
      if (event.metaKey || event.ctrlKey || event.altKey || target.closest('input, textarea, select, [contenteditable], dialog')) return;
      if (event.key === '?') { event.preventDefault(); setView('shortcuts'); setShortcutsRequested(true); setOpen(true); }
      if (event.key === '/') { event.preventDefault(); setOpen(true); }
      if (event.key === 't') toggleThemeRef.current();
      if (event.key === 'c') navigateRef.current('/#contact');
    };
    const show = () => setOpen(true);
    addEventListener('keydown', onKey);
    addEventListener('palette:open', show);
    return () => { removeEventListener('keydown', onKey); removeEventListener('palette:open', show); };
  }, []);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) { setQuery(''); setIndex(0); if (!shortcutsRequested) setView('menu'); setShortcutsRequested(false); element.showModal(); input.current?.focus(); }
    if (!open && element.open) element.close();
  }, [open, shortcutsRequested]);

  function choose(command?: Command) {
    if (!command) return;
    if (command.id !== 'terminal' && command.id !== 'shortcuts') setOpen(false);
    command.run();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const delta = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
    if (delta && results.length) { event.preventDefault(); setIndex((selected + delta + results.length) % results.length); }
    if (event.key === 'Enter') { event.preventDefault(); choose(results[selected]); }
  }

  return (
    <dialog ref={dialog} className="palette" aria-label="Command menu" onClose={() => setOpen(false)} onClick={event => { if (event.target === dialog.current) setOpen(false); }}>
      {view === 'terminal' ? <PaletteTerminal onExit={() => setOpen(false)} /> : view === 'shortcuts' ? <dl className="shortcuts"><h2>Keyboard shortcuts</h2>{[['⌘K', 'Command menu'], ['/', 'Search the site'], ['T', 'Switch theme'], ['C', 'Go to contact'], ['J / K', 'Next or previous project'], ['?', 'This list']].map(([key, label]) => <div key={key}><dt><kbd>{key}</kbd></dt><dd>{label}</dd></div>)}</dl> : <>
      <input ref={input} className="palette-input" role="combobox" aria-expanded="true" aria-controls="palette-list" aria-activedescendant={results[selected] ? `palette-${results[selected].id}` : undefined} aria-label="Search the portfolio" placeholder="Search, or ask: what uses React?" value={query} onChange={event => { setQuery(event.target.value); setIndex(0); }} onKeyDown={onKeyDown} autoComplete="off" spellCheck={false} />
      {answer && <p className="palette-answer" role="status"><small>From this portfolio</small>{answer}</p>}
      <ul id="palette-list" role="listbox" aria-label="Results" className="palette-list">
        {results.map((command, position) => <li key={command.id} id={`palette-${command.id}`} role="option" aria-selected={position === selected} onMouseMove={() => setIndex(position)} onClick={() => choose(command)}><span>{command.label}</span><small>{command.group}</small></li>)}
        {!results.length && !answer && <li className="palette-empty">Nothing matches that.</li>}
      </ul>
      </>}
    </dialog>
  );
}
