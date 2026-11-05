import { useLayoutEffect, useRef, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { rayMorph } from './rayMorph';
import { flightPath } from './flightPath';

export interface FlightStart {
  icon: string;
  x: number;
  y: number;
  size: number;
  filter: string;
  opacity: string;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

export default function OrbFlight({ starts, targets, onFinish }: {
  starts: FlightStart[];
  targets: RefObject<Array<HTMLButtonElement | null>>;
  onFinish: () => void;
}) {
  const layer = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const nodes = layer.current?.querySelectorAll<HTMLElement>('.orb-flyer');
    if (!nodes) return;
    let disposed = false;
    const animations: Animation[] = [];
    const sculpture = targets.current?.[0]?.closest('.tool-sculpture');
    // Resolve pending CSS pause hold times before measuring the return positions.
    sculpture?.getAnimations({ subtree: true }).filter(a => a.playState === 'paused').forEach(a => { a.currentTime = a.currentTime ?? 0; });
    const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
    layer.current!.style.clipPath = `inset(${headerBottom + 8}px 0 0)`;
    const centre = starts.reduce((p, s) => ({ x: p.x + s.x / starts.length, y: p.y + s.y / starts.length }), { x: 0, y: 0 });
    const order = starts.map((s, index) => ({ index, angle: Math.atan2(s.y - centre.y, s.x - centre.x) })).sort((a, b) => a.angle - b.angle);
    const easing = 'cubic-bezier(0.77, 0, 0.175, 1)';
    for (const [rank, { index }] of order.entries()) {
      const from = starts[index];
      const original = targets.current?.[index]?.querySelector('img');
      const destination = original?.getBoundingClientRect();
      if (!destination || !original) continue;
      const node = nodes[index];
      const image = node.querySelector('img')!;
      const shape = node.querySelector<HTMLElement>('.orb-ray')!;
      const morph = rayMorph(original);
      const end = { x: destination.x + destination.width / 2, y: destination.y + destination.height / 2 };
      const start = { x: from.x, y: from.y };
      const margin = from.size + 16;
      const left = margin, right = innerWidth - margin, top = headerBottom + margin, bottom = innerHeight - margin;
      const path = flightPath(start, end, { left, right, top, bottom });
      const duration = 4800;
      const delay = rank * 65;
      const timing = { duration, delay, fill: 'both' as const };
      let previousHeading: number | undefined;
      const frames = Array.from({ length: 721 }, (_, frame) => {
        const time = frame / 720 * duration;
        const t = Math.max(0, Math.min(1, (time - 700) / 3400));
        const point = path(smooth(t));
        const envelope = Math.sin(Math.PI * t);
        // The ray's nose points 33 degrees above the asset's horizontal axis.
        let heading = point.heading + 33;
        if (previousHeading !== undefined) heading += Math.round((previousHeading - heading) / 360) * 360;
        else heading = (heading + 540) % 360 - 180;
        previousHeading = heading;
        const bank = time < 700 ? heading * smooth(time / 700)
          : time > 4100 ? heading + (Math.round(heading / 360) * 360 - heading) * smooth((time - 4100) / 700) : heading;
        return { offset: frame / 720, transform: `translate3d(${point.x - start.x}px, ${point.y - start.y}px, ${-80 * envelope}px) rotate(${bank}deg) scale(${1 - .12 * envelope})` };
      });
      animations.push(node.animate(frames, timing));
      if (morph) {
        shape.style.backgroundImage = `url("${morph.texture}")`;
        shape.dataset.source = morph.source;
        shape.dataset.ray = morph.ray;
        animations.push(shape.animate([
          { offset: 0, clipPath: morph.source, opacity: 0, easing },
          { offset: .03, clipPath: morph.source, opacity: 1, easing },
          { offset: 700 / 4800, clipPath: morph.ray, opacity: 1 },
          { offset: 4100 / 4800, clipPath: morph.ray, opacity: 1, easing },
          { offset: .97, clipPath: morph.source, opacity: 1, easing },
          { offset: 1, clipPath: morph.source, opacity: 0 },
        ], timing));
        animations.push(image.animate([
          { offset: 0, opacity: 1 }, { offset: .06, opacity: 0 },
          { offset: .94, opacity: 0 }, { offset: 1, opacity: 1 },
        ], timing));
      }
    }
    void Promise.all(animations.map(animation => animation.finished)).then(() => { if (!disposed) onFinish(); }).catch(() => { /* Cancellation restores the real orbit. */ });
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
    {starts.map(item => <div className="orb-flyer" key={item.icon}
      style={{ left: item.x - item.size / 2, top: item.y - item.size / 2, width: item.size, height: item.size, filter: item.filter, opacity: item.opacity }}>
      <span className="orb-ray" />
      <img src={`/tool-icons/${item.icon}.svg`} alt="" draggable={false} />
    </div>)}
  </div>, document.body);
}
