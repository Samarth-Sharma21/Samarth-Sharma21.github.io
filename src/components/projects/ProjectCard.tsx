import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ImageViewer from './ImageViewer';
import useReducedMotion from '../../hooks/useReducedMotion';
import { ChevronLeft, ChevronRight, Code2, Expand, Pause, Play } from 'lucide-react';
import type { Project } from '../../types';

export default function ProjectCard({ project, prominent = false }: { project: Project; prominent?: boolean }) {
  const media = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const autoplayAllowed = useRef(false);
  const [automatic, setAutomatic] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [imageIndex, setImageIndex] = useState(0);
  const [viewer, setViewer] = useState<{ animate: boolean } | null>(null);
  const [error, setError] = useState('');
  const [previousImage, setPreviousImage] = useState<string>();
  const outgoing = useRef<HTMLImageElement>(null);
  const fade = useRef<Animation>();
  const trigger = useRef<HTMLButtonElement>(null);
  const picture = useRef<HTMLImageElement>(null);
  const animation = useRef<Animation>();
  const requested = useRef(0);
  const requestId = useRef(0);
  const transition = useRef({ direction: 1, animate: false });
  const reduced = useReducedMotion();
  const images = useMemo(() => project.images.length > 0 ? project.images : project.image ? [project.image] : [], [project.images, project.image]);
  const selectedImage = images[imageIndex];
  const closeViewer = useCallback(() => setViewer(null), []);

  useEffect(() => () => { requestId.current++; animation.current?.cancel(); fade.current?.cancel(); }, []);

  useLayoutEffect(() => {
    animation.current?.cancel();
    fade.current?.cancel();
    if (outgoing.current) outgoing.current.style.opacity = '0';
    if (!transition.current.animate || reduced || !picture.current) return;
    fade.current = outgoing.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: getComputedStyle(document.documentElement).getPropertyValue('--ease-out').trim() });
    animation.current = picture.current.animate([
      { transform: `translateX(${transition.current.direction * 12}px)`, opacity: 0.35 },
      { transform: 'none', opacity: 1 },
    ], { duration: 220, easing: getComputedStyle(document.documentElement).getPropertyValue('--ease-out').trim() });
  }, [imageIndex, reduced]);

  const step = useCallback(async (direction: number, keyboard: boolean, isAutomatic = false) => {
    if (images.length < 2) return;
    const next = (requested.current + direction + images.length) % images.length;
    if (!isAutomatic) requested.current = next;
    const id = ++requestId.current;
    const preload = new Image();
    preload.src = images[next];
    try {
      await preload.decode();
      if (id !== requestId.current) return;
      if (isAutomatic && !autoplayAllowed.current) { requested.current = imageIndex; return; }
      requested.current = next;
      transition.current = { direction, animate: !keyboard };
      setPreviousImage(images[imageIndex]);
      setImageIndex(next);
      setError('');
    } catch {
      if (id !== requestId.current) return;
      if (isAutomatic && !autoplayAllowed.current) { requested.current = imageIndex; return; }
      requested.current = imageIndex;
      setError('This image could not load. Try again.');
    }
  }, [images, imageIndex]);

  const running = automatic && !reduced && !hovered && !keyboardFocus && inView && pageVisible && !viewer && !error && images.length > 1;

  autoplayAllowed.current = running;

  useEffect(() => {
    const element = media.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= 0.35), { threshold: [0, 0.35] });
    observer.observe(element);
    const visible = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', visible);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visible); };
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => { void step(1, false, true); }, 4000);
    return () => window.clearTimeout(timer);
  }, [running, step]);

  function openViewer(button: HTMLButtonElement, keyboard: boolean) {
    opener.current = button;
    setViewer({ animate: !keyboard && !reduced });
  }

  return (
    <article className={`project-card${prominent ? ' project-card-prominent' : ''}`} data-project-id={project.id}>
      <div ref={media} className={`project-media project-media-${project.id}`} data-autoplay={running ? 'running' : 'paused'}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        onFocusCapture={event => setKeyboardFocus(event.target.matches(':focus-visible'))}
        onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setKeyboardFocus(false); }}>
        {selectedImage ? <button ref={trigger} className="project-preview" aria-label={`Enlarge ${project.title} screenshot ${imageIndex + 1}`} onClick={event => openViewer(event.currentTarget, event.detail === 0)}>
          {previousImage && <img ref={outgoing} className="gallery-outgoing" src={previousImage} alt="" aria-hidden="true" />}
          <img ref={picture} src={selectedImage} alt={`${project.title} screenshot ${imageIndex + 1} of ${images.length}`} loading="lazy" width="1280" height="720" />
        </button> : <div className="project-no-media"><Code2 size={40} aria-hidden="true" /><span>{project.title}</span><span className="project-media-note">Code experiment</span></div>}
        {images.length > 0 && <div className="gallery-controls">
          <button className="icon-button" aria-label={`Open image viewer for ${project.title}`} onClick={event => openViewer(event.currentTarget, event.detail === 0)}><Expand size={16} /></button>
          <button className="icon-button" disabled={images.length < 2} aria-label={`Previous image for ${project.title}`} onClick={event => step(-1, event.detail === 0)}><ChevronLeft size={17} /></button>
          <span className="gallery-count" aria-live={running ? 'off' : 'polite'}><span className="gallery-count-value" key={imageIndex}>{imageIndex + 1}<span aria-hidden="true"> / </span><span className="sr-only">of </span>{images.length}</span></span>
          <button className="icon-button" disabled={images.length < 2} aria-label={`Next image for ${project.title}`} onClick={event => step(1, event.detail === 0)}><ChevronRight size={17} /></button>
          <button className="icon-button gallery-autoplay" disabled={reduced || images.length < 2} aria-label={reduced ? `Automatic images disabled for reduced motion: ${project.title}` : `${automatic ? 'Pause' : 'Play'} automatic images for ${project.title}`} aria-pressed={!automatic} onClick={() => setAutomatic(value => !value)}>{automatic && !reduced ? <Pause size={15} /> : <Play size={15} />}</button>
        </div>}
      </div>
      {viewer && <ImageViewer title={project.title} src={selectedImage} index={imageIndex} count={images.length} animate={viewer.animate} trigger={trigger} restoreFocus={opener} onClose={closeViewer} onStep={step} error={error} movement={transition.current} />}
      <div className="project-copy">
        {error && <p className="gallery-error" role="status">{error}</p>}
        <h3>{project.title}</h3>
        <p className="project-category">{project.category === 'web' ? 'Web application' : project.category === 'ai' ? 'AI experiment' : 'Developer tool'}</p>
        <p className="project-description">{project.description}</p>
        <ul className="tech-list" aria-label={`${project.title} technologies`}>{project.tech.map(tech => <li key={tech}>{tech}</li>)}</ul>
        <div className="project-links">
          <a href={project.github} target="_blank" rel="noopener noreferrer">View code <span className="sr-only"> for {project.title}, opens in a new tab</span></a>
          {project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer">Live demo <span className="sr-only"> of {project.title}, opens in a new tab</span></a>}
        </div>
      </div>
    </article>
  );
}
