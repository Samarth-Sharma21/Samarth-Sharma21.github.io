import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects } from '../../data/projects';
import { profile } from '../../data/profile';

type Line = { id: number; text: string; kind: 'input' | 'output' };

const help = 'help  whoami  ls  status  open <project>  contact  resume  clear  exit';

export default function PaletteTerminal({ onExit }: { onExit: () => void }) {
  const [lines, setLines] = useState<Line[]>([{ id: 0, text: `Type a command. ${help}`, kind: 'output' }]);
  const [value, setValue] = useState('');
  const nextId = useRef(1);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => { input.current?.focus(); }, []);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }); }, [lines]);

  function respond(raw: string): string {
    const [command = '', ...rest] = raw.trim().split(/\s+/);
    const argument = rest.join(' ').toLowerCase();
    switch (command.toLowerCase()) {
      case 'help': return help;
      case 'whoami': return `${profile.name}. ${profile.role} at ${profile.company}, ${profile.dates}. Based in ${profile.location}.`;
      case 'ls': return projects.map(project => project.id).join('  ');
      case 'status': return `build ${__BUILD_TIME__.slice(0, 10)}. ${projects.length} projects listed, ${projects.filter(project => project.demo).length} with live demos.`;
      case 'open': {
        const match = projects.find(project => project.id === argument || project.title.toLowerCase().includes(argument));
        if (!argument || !match) return 'open: no such project. Try ls.';
        window.open(match.demo ?? match.github, '_blank', 'noopener');
        return `Opening ${match.title}.`;
      }
      case 'contact': onExit(); navigate('/#contact', { state: { pipeline: { intent: 'question' } } }); return '';
      case 'resume': onExit(); navigate('/resume'); return '';
      case 'exit': onExit(); return '';
      case '': return '';
      default: return `${command}: command not found. Try help.`;
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (value.trim().toLowerCase() === 'clear') { setLines([]); setValue(''); return; }
    const output = respond(value);
    setLines(current => [...current, { id: nextId.current++, text: value, kind: 'input' as const }, ...(output ? [{ id: nextId.current++, text: output, kind: 'output' as const }] : [])]);
    setValue('');
  }

  return (
    <div className="terminal">
      <div ref={log} className="terminal-log" role="log" aria-label="Terminal output">{lines.map(line => <p key={line.id} data-kind={line.kind}>{line.text}</p>)}</div>
      <form onSubmit={submit} className="terminal-prompt"><span aria-hidden="true">$</span><input ref={input} aria-label="Terminal command" value={value} onChange={event => setValue(event.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} /></form>
    </div>
  );
}
