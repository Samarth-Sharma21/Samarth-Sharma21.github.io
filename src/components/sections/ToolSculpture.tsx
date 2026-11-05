import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Pause, Play } from 'lucide-react';

interface Tool {
  name: string;
  icon: string;
  proof?: string;
}

type ToolPosition = CSSProperties & { '--phase': string; '--counter-phase': string };

const tools: readonly Tool[] = [
  { name: 'React', icon: 'react', proof: 'ReKindle' }, { name: 'Python', icon: 'python', proof: 'Speech tools' },
  { name: 'Docker', icon: 'docker', proof: 'DevOps experience' }, { name: 'TypeScript', icon: 'typescript', proof: 'AI Therapist' },
  { name: 'Git', icon: 'git' }, { name: 'Java', icon: 'java' },
  { name: 'Kubernetes', icon: 'kubernetes', proof: 'DevOps experience' }, { name: 'Next.js', icon: 'nextjs', proof: 'README Generator' },
  { name: 'PostgreSQL', icon: 'postgresql' }, { name: 'Terraform', icon: 'terraform', proof: 'DevOps experience' },
  { name: 'Node.js', icon: 'nodejs' }, { name: 'Grafana', icon: 'grafana' },
  { name: 'GitHub', icon: 'github' }, { name: 'MongoDB', icon: 'mongodb' },
  { name: 'Ansible', icon: 'ansible' }, { name: 'JavaScript', icon: 'javascript', proof: 'README Generator' },
  { name: 'Prometheus', icon: 'prometheus' }, { name: 'Azure', icon: 'azure' },
  { name: 'Kafka', icon: 'apachekafka' }, { name: 'MySQL', icon: 'mysql' },
  { name: 'Jenkins', icon: 'jenkins', proof: 'DevOps experience' }, { name: 'Google Cloud', icon: 'googlecloud' },
  { name: 'Podman', icon: 'podman' }, { name: 'Elasticsearch', icon: 'elasticsearch' },
  { name: 'AWS', icon: 'amazonwebservices' },
];
const rings = [tools.slice(0, 10), tools.slice(10)];

export default function ToolSculpture() {
  const inspectorRef = useRef<HTMLDivElement>(null);
  const inspectorFlight = useRef<Animation>();
  const hasExplored = useRef(false);
  const sculptureRef = useRef<HTMLElement>(null);
  const toolRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hoveredTool, setHoveredTool] = useState<Tool | null>(null);
  const [focusedTool, setFocusedTool] = useState<Tool | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  useEffect(() => {
    const element = sculptureRef.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedTool) return;
    const timeout = window.setTimeout(() => setSelectedTool(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [selectedTool]);

  const activeTool = focusedTool ?? hoveredTool ?? selectedTool;
  useEffect(() => {
    if (!activeTool || hasExplored.current) return;
    hasExplored.current = true;
    if (!focusedTool && !reducedMotion) {
      inspectorFlight.current = inspectorRef.current?.animate([
        { opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' },
      ], { duration: 150, easing: getComputedStyle(document.documentElement).getPropertyValue('--ease-out').trim() });
    }
  }, [activeTool, focusedTool, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || focusedTool) inspectorFlight.current?.cancel();
    return () => inspectorFlight.current?.cancel();
  }, [reducedMotion, focusedTool]);

  const running = !paused && !reducedMotion && inView && pageVisible;

  function clearTool() {
    setHoveredTool(null);
    setFocusedTool(null);
    setSelectedTool(null);
  }

  function closeFromKeyboard() {
    clearTool();
    const nextControl = sculptureRef.current?.querySelector<HTMLButtonElement>('.tool-motion-control:not(:disabled)')
      ?? document.querySelector<HTMLButtonElement>('#projects .project-preview');
    nextControl?.focus({ preventScroll: true });
  }

  return (
    <figure ref={sculptureRef} className="tool-sculpture" data-motion={running ? 'running' : 'paused'} data-reduced-motion={String(reducedMotion)} data-exploring={Boolean(activeTool)} aria-labelledby="tool-sculpture-caption" onKeyDown={event => { if (event.key === 'Escape') { if (event.target instanceof Node && event.currentTarget.querySelector('.tool-inspector')?.contains(event.target)) closeFromKeyboard(); else clearTool(); } }}>
      <div className="tool-scene">
        <div className="tool-background" role="toolbar" aria-label="Explore technologies" aria-describedby="tool-keyboard-help">
          {rings.map((ring, ringIndex) => <div className={`tool-ring tool-ring-${ringIndex}`} key={ringIndex}>
            {ring.map((tool, index) => {
              const phase = index * 360 / ring.length;
              const toolIndex = ringIndex === 0 ? index : index + rings[0].length;
              const position: ToolPosition = { '--phase': `${phase}deg`, '--counter-phase': `${-phase}deg` };
              return <div className="tool-orbit-arm" style={position} key={tool.icon}><div className="tool-orbit-position"><div className="tool-counter-rotation">
                <button className="tool-target" type="button" ref={element => { toolRefs.current[toolIndex] = element; }} tabIndex={focusedIndex === toolIndex ? 0 : -1} aria-label={`Explore ${tool.name}`} data-active={activeTool?.icon === tool.icon}
                  onPointerEnter={event => { if (event.pointerType === 'mouse') { setHoveredTool(tool); } }} onPointerLeave={() => setHoveredTool(null)}
                  onFocus={event => { setFocusedIndex(toolIndex); setFocusedTool(event.currentTarget.matches(':focus-visible') ? tool : null); }} onBlur={event => { if (!(event.relatedTarget instanceof Node && sculptureRef.current?.querySelector('.tool-inspector')?.contains(event.relatedTarget))) setFocusedTool(null); }}
                  onKeyDown={event => { const delta = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0; if (delta) { event.preventDefault(); toolRefs.current[(toolIndex + delta + tools.length) % tools.length]?.focus(); } }}
                  onClick={() => setSelectedTool(current => current?.icon === tool.icon ? null : tool)}>
                  <img className="tool-logo" src={`/tool-icons/${tool.icon}.svg`} alt="" width="36" height="36" draggable={false} />
                </button>
              </div></div></div>;
            })}
          </div>)}
        </div>
        <div className="tool-core" aria-hidden="true">
          <svg className="tool-rosette" viewBox="0 0 120 120" fill="none">
            {Array.from({ length: 8 }, (_, index) => <ellipse key={index} cx="60" cy="60" rx="46" ry="17" transform={`rotate(${index * 22.5} 60 60)`} />)}
            <circle className="tool-rosette-center" cx="60" cy="60" r="5" />
            <circle className="tool-rosette-point" cx="106" cy="60" r="4" />
          </svg>
        </div>
        <div ref={inspectorRef} className="tool-inspector" aria-live="polite" aria-atomic="true" onBlur={event => { if (!(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))) setFocusedTool(null); }}>
          {activeTool && <><span className="tool-inspector-label">In my toolkit</span><strong>{activeTool.name}</strong>{activeTool.proof && <span className="tool-inspector-proof">{activeTool.proof}</span>}<button type="button" onClick={event => { if (event.detail === 0) closeFromKeyboard(); else clearTool(); }}>Close <span aria-hidden="true">×</span></button></>}
        </div>
      </div>
      <figcaption id="tool-sculpture-caption" className="tool-sculpture-caption">
        <p>Curiosity, in motion.<br /><span>Hover or tap a tool to explore.</span></p>
        <span id="tool-keyboard-help" className="sr-only">Use the arrow keys to move between tools.</span>
        <button className="tool-motion-control" type="button" disabled={reducedMotion} aria-label={reducedMotion ? 'Tool animation paused for reduced motion' : paused ? 'Play tool animation' : 'Pause tool animation'} aria-pressed={paused} onClick={() => setPaused(value => !value)}>
          {running ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
          <span>{reducedMotion ? 'Static view' : paused ? 'Play' : 'Pause'}</span>
        </button>
      </figcaption>
    </figure>
  );
}
