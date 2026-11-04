import { useEffect, useRef, useState, type CSSProperties } from 'react';

export default function SkyrayWake() {
  const root = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const update = () => {
      setRunning(visible && !document.hidden && !preference.matches);
      if (visible) setEntered(true);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: 0.15 });
    observer.observe(element);
    document.addEventListener('visibilitychange', update);
    preference.addEventListener('change', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
      preference.removeEventListener('change', update);
    };
  }, []);

  return (
    <div ref={root} className="skyray-wake" aria-hidden="true" data-entered={entered} data-running={running}>
      <svg className="wake-rings" viewBox="0 0 600 420" fill="none">
        {Array.from({ length: 8 }, (_, index) => (
          <ellipse key={index} className="wake-ring" cx="300" cy="260" rx={44 + index * 31} ry={18 + index * 14}
            style={{ '--wake-delay': `${index * 110}ms` } as CSSProperties} />
        ))}
      </svg>
      <img className="wake-ray" src="/brand/skyray.png" alt="" width="256" height="256" draggable={false} />
    </div>
  );
}
