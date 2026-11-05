import { useLayoutEffect, useRef, type RefObject } from 'react';
import { createPortal } from 'react-dom';

export interface FlightStart {
  icon: string;
  x: number;
  y: number;
  size: number;
  filter: string;
  opacity: string;
}

type Point = { x: number; y: number };
const bezier = (a: Point, b: Point, c: Point, d: Point, t: number): Point => {
  const u = 1 - t;
  return { x: u ** 3 * a.x + 3 * u ** 2 * t * b.x + 3 * u * t ** 2 * c.x + t ** 3 * d.x,
    y: u ** 3 * a.y + 3 * u ** 2 * t * b.y + 3 * u * t ** 2 * c.y + t ** 3 * d.y };
};

export default function OrbFlight({ starts, targets, onFinish }: {
  starts: FlightStart[];
  targets: RefObject<Array<HTMLButtonElement | null>>;
  onFinish: () => void;
}) {
  const layer = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const nodes = layer.current?.querySelectorAll('img');
    if (!nodes) return;
    let disposed = false;
    const animations = starts.map((from, index) => {
      const destination = targets.current?.[index]?.querySelector('img')?.getBoundingClientRect();
      if (!destination) return null;
      const end = { x: destination.x + destination.width / 2, y: destination.y + destination.height / 2 };
      const start = { x: from.x, y: from.y };
      const margin = from.size + 12;
      const upper = Math.min(120, innerHeight / 4);
      const away = { x: margin + Math.random() * Math.max(1, innerWidth - 2 * margin), y: upper + Math.random() * Math.max(1, innerHeight - upper - margin) };
      if (Math.hypot(away.x - start.x, away.y - start.y) < innerWidth * 0.2) away.x = start.x > innerWidth / 2 ? margin : innerWidth - margin;
      const bend = (index % 2 ? 1 : -1) * Math.min(85, innerWidth * 0.12);
      const clamp = (point: Point) => ({ x: Math.min(innerWidth - margin, Math.max(margin, point.x)), y: Math.min(innerHeight - margin, Math.max(margin, point.y)) });
      const outward = [start, clamp({ x: start.x + bend, y: start.y - 80 }), clamp({ x: away.x - bend, y: away.y - 60 }), away];
      const inward = [away, clamp({ x: away.x + bend, y: away.y + 70 }), clamp({ x: end.x - bend, y: end.y + 80 }), end];
      const frames = Array.from({ length: 61 }, (_, frame) => {
        const t = frame / 60;
        const outwardPhase = t < 0.48;
        const local = outwardPhase ? t / 0.48 : (t - 0.48) / 0.52;
        const p = outwardPhase ? outward : inward;
        const point = bezier(p[0], p[1], p[2], p[3], local);
        const envelope = Math.sin(Math.PI * t);
        const bank = Math.sin(t * Math.PI * 3 + index) * 22 * envelope;
        const flutter = Math.sin(t * Math.PI * 8 + index) * 48 * envelope;
        return { offset: t, transform: `translate(${point.x - start.x}px, ${point.y - start.y}px) rotate(${bank}deg) rotateY(${flutter}deg)`, opacity: Number(from.opacity) };
      });
      return nodes[index].animate(frames, { duration: 2200, delay: index * 7, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', fill: 'both' });
    }).filter((animation): animation is Animation => Boolean(animation));
    void Promise.all(animations.map(animation => animation.finished)).then(() => { if (!disposed) onFinish(); }).catch(() => { /* Interruption restores the real orbit in cleanup. */ });
    const originScroll = { x: scrollX, y: scrollY };
    const originViewport = { width: innerWidth, height: innerHeight };
    const resized = () => { if (innerWidth !== originViewport.width || innerHeight !== originViewport.height) onFinish(); };
    const scrolled = () => { if (scrollX !== originScroll.x || scrollY !== originScroll.y) onFinish(); };
    window.addEventListener('resize', resized);
    window.addEventListener('scroll', scrolled, { passive: true });
    return () => {
      disposed = true;
      animations.forEach(animation => animation.cancel());
      window.removeEventListener('resize', resized);
      window.removeEventListener('scroll', scrolled);
    };
  }, [starts, targets, onFinish]);

  return createPortal(<div className="orb-flight" ref={layer} aria-hidden="true">
    {starts.map(item => <img key={item.icon} src={`/tool-icons/${item.icon}.svg`} alt="" draggable={false}
      style={{ left: item.x - item.size / 2, top: item.y - item.size / 2, width: item.size, height: item.size, filter: item.filter }} />)}
  </div>, document.body);
}
