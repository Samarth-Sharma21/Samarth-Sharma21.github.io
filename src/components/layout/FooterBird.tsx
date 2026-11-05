import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import useReducedMotion from '../../hooks/useReducedMotion';
import { composeUrl, email } from '../../data/contact';

type Point = { x: number; y: number };

export default function FooterBird() {
  const perch = useRef<HTMLSpanElement>(null);
  const bird = useRef<HTMLButtonElement>(null);
  const picture = useRef<HTMLImageElement>(null);
  const position = useRef<Point | null>(null);
  const angle = useRef(0);
  const scale = useRef(1);
  const restingRef = useRef(false);
  const held = useRef(false);
  const stop = useRef(() => {});
  const returnHome = useRef(() => {});
  const copyRequest = useRef(0);
  const mounted = useRef(true);
  const [resting, setResting] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'unavailable'>('idle');
  const [copyCount, setCopyCount] = useState(0);
  const [finePointer, setFinePointer] = useState(() => matchMedia('(hover: hover) and (pointer: fine)').matches);
  const reduced = useReducedMotion();
  const canFollow = finePointer && !reduced;

  useEffect(() => {
    mounted.current = true;
    const media = matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setFinePointer(media.matches);
    media.addEventListener('change', update);
    return () => { media.removeEventListener('change', update); mounted.current = false; };
  }, []);

  useLayoutEffect(() => {
    const button = bird.current, image = picture.current, anchor = perch.current;
    const footer = button?.closest('footer');
    if (!footer || !button || !image || !anchor) return;
    let frame = 0;
    let previousTime = 0;
    let home = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    let bounds = { x: 0, y: 0 };
    let returning = true;
    const clamp = (point: Point) => ({ x: Math.max(0, Math.min(bounds.x, point.x)), y: Math.max(0, Math.min(bounds.y, point.y)) });
    const paint = () => {
      button.style.transform = `translate(${position.current!.x}px, ${position.current!.y}px)`;
      const radians = angle.current * Math.PI / 180;
      const containedScale = 1 / (Math.abs(Math.cos(radians)) + Math.abs(Math.sin(radians)));
      image.style.transform = `rotate(${angle.current}deg) scale(${Math.min(scale.current, containedScale)})`;
    };
    const cancel = () => { cancelAnimationFrame(frame); frame = 0; previousTime = 0; };
    stop.current = cancel;
    const measure = (initial = false) => {
      const box = footer.getBoundingClientRect(), spot = anchor.getBoundingClientRect();
      const nextBounds = { x: footer.clientWidth - button.offsetWidth, y: footer.clientHeight - button.offsetHeight };
      const nextHome = { x: spot.left - box.left - footer.clientLeft, y: spot.top - box.top - footer.clientTop };
      if (!initial && nextBounds.x === bounds.x && nextBounds.y === bounds.y && Math.hypot(nextHome.x - home.x, nextHome.y - home.y) < .1) return;
      cancel();
      bounds = nextBounds;
      home = clamp(nextHome);
      position.current = clamp(position.current ?? home);
      if (!canFollow || (!restingRef.current && !footer.matches(':hover'))) { position.current = home; angle.current = 0; scale.current = 1; returning = true; }
      target = { ...position.current };
      paint();
    };
    const tick = (time: number) => {
      frame = 0;
      if (restingRef.current || held.current || document.hidden || !canFollow) return;
      const elapsed = previousTime ? Math.min(time - previousTime, 32) : 16;
      previousTime = time;
      const current = position.current!;
      const dx = target.x - current.x, dy = target.y - current.y;
      const distance = Math.hypot(dx, dy);
      let heading = returning && distance < 1 ? 0 : distance > .2 ? Math.atan2(dy, dx) * 180 / Math.PI + 33 : angle.current;
      heading += Math.round((angle.current - heading) / 360) * 360;
      angle.current += (heading - angle.current) * (1 - Math.exp(-elapsed / 90));
      const response = 1 - Math.exp(-elapsed / 100);
      scale.current += ((returning ? 1 : .82) - scale.current) * response;
      position.current = clamp({ x: current.x + dx * response, y: current.y + dy * response });
      if (distance < .2 && Math.abs(heading - angle.current) < .2 && Math.abs(scale.current - (returning ? 1 : .82)) < .001) {
        position.current = target;
        angle.current = heading;
        previousTime = 0;
        paint();
        return;
      }
      paint();
      frame = requestAnimationFrame(tick);
    };
    const start = () => { if (!frame) frame = requestAnimationFrame(tick); };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !canFollow || restingRef.current || held.current || document.hidden) return;
      const box = footer.getBoundingClientRect();
      const pointer = { x: event.clientX - box.left, y: event.clientY - box.top };
      const current = position.current!;
      // Leave a catchable space around the cursor instead of making the bird evade clicks.
      if (Math.hypot(pointer.x - current.x - 24, pointer.y - current.y - 24) < 64) { cancel(); return; }
      returning = false;
      target = clamp({ x: pointer.x + (pointer.x > box.width / 2 ? -68 : 20), y: pointer.y - 24 });
      start();
    };
    const leave = () => {
      held.current = button.matches(':focus-visible');
      if (restingRef.current || held.current || !canFollow) return;
      returning = true;
      target = home;
      start();
    };
    const visibility = () => { if (document.hidden) cancel(); };
    returnHome.current = leave;
    measure(true);
    const observer = new ResizeObserver(() => measure());
    observer.observe(footer);
    footer.addEventListener('pointermove', move);
    footer.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      cancel();
      stop.current = () => {};
      returnHome.current = () => {};
      observer.disconnect();
      footer.removeEventListener('pointermove', move);
      footer.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [canFollow]);

  async function activate() {
    restingRef.current = false;
    setResting(false);
    const request = ++copyRequest.current;
    try {
      await navigator.clipboard.writeText(email);
      if (!mounted.current || request !== copyRequest.current) return;
      setCopyState('copied');
    } catch {
      if (!mounted.current || request !== copyRequest.current) return;
      setCopyState('unavailable');
    }
    setCopyCount(count => count + 1);
  }

  function rest() {
    stop.current();
    restingRef.current = true;
    copyRequest.current++;
    setResting(true);
    setCopyState('idle');
  }

  return <div className="footer-bird-contact" data-resting={resting} data-follow={canFollow}>
    <div className="footer-signature">
      <span className="footer-bird-perch" ref={perch}>
        <button ref={bird} type="button" className="footer-bird" aria-label={resting ? 'Wake the bird and copy my email' : 'Copy my email'} aria-describedby="footer-bird-status" onClick={activate}
          onPointerEnter={() => { held.current = true; stop.current(); }} onPointerLeave={() => { held.current = bird.current?.matches(':focus-visible') ?? false; }}
          onFocus={() => { held.current = true; stop.current(); }} onBlur={() => { held.current = bird.current?.matches(':hover') ?? false; if (!bird.current?.closest('footer')?.matches(':hover')) returnHome.current(); }}>
          <img ref={picture} src="/brand/skyray.png" alt="" width="48" height="48" draggable={false} />
        </button>
      </span>
      <Link className="footer-name" to="/" aria-label="Samarth Sharma home">Samarth Sharma<span>.</span></Link>
      {canFollow && <button type="button" className="footer-bird-rest" onClick={rest} disabled={resting} title="Stops the bird until you click it again."><X size={14} aria-hidden="true" />{resting ? 'Resting' : 'Let it rest'}</button>}
    </div>
    <p className="footer-bird-status" id="footer-bird-status" role="status" aria-atomic="true"><span key={copyCount}>
      {copyState === 'copied' ? 'Email copied. I’d be happy to hear from you.' : copyState === 'unavailable' ? <>Copy didn’t work. Reach me at <a href={composeUrl} target="_blank" rel="noopener noreferrer">{email}</a>.</> : resting ? 'Resting here. Click the bird to wake it.' : `${canFollow ? 'Click' : 'Tap'} the bird to copy my email.`}
    </span></p>
  </div>;
}
