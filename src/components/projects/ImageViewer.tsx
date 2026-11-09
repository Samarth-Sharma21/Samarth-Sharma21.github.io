import { useCallback, useLayoutEffect, useRef, type PointerEvent, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import useReducedMotion from '../../hooks/useReducedMotion';

function paintedBounds(image: HTMLImageElement) {
  const box = image.getBoundingClientRect();
  const scale = Math.min(box.width / image.naturalWidth, box.height / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  return { x: box.x + (box.width - width) / 2, y: box.y + (box.height - height) / 2, width, height };
}

interface Props {
  title: string;
  src: string;
  images: readonly string[];
  visitUrl: string | null;
  index: number;
  count: number;
  animate: boolean;
  trigger: RefObject<HTMLButtonElement>;
  restoreFocus: RefObject<HTMLButtonElement>;
  onClose: () => void;
  onStep: (direction: number, keyboard: boolean) => void;
  error: string;
  movement: { direction: number; animate: boolean };
}

export default function ImageViewer({ title, src, images, visitUrl, index, count, animate, trigger, restoreFocus, onClose, onStep, error, movement }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const flight = useRef<Animation>();
  const closing = useRef(false);
  const reduced = useReducedMotion();
  const previousSrc = useRef(src);
  const swipeStart = useRef<number | null>(null);

  const thumbnailTransform = useCallback(() => {
    const thumb = trigger.current?.querySelector<HTMLImageElement>('img:not(.gallery-outgoing)');
    const target = image.current;
    if (!thumb || !target || !thumb.naturalWidth || !target.naturalWidth) return 'none';
    const from = paintedBounds(thumb);
    const to = paintedBounds(target);
    return `translate(${from.x + from.width / 2 - to.x - to.width / 2}px, ${from.y + from.height / 2 - to.y - to.height / 2}px) scale(${from.width / to.width}, ${from.height / to.height})`;
  }, [trigger]);

  useLayoutEffect(() => {
    const element = dialog.current;
    const target = image.current;
    if (!element || !target) return;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    const opener = restoreFocus.current;
    document.body.style.overflow = 'hidden';
    const enter = () => {
      if (!animate || matchMedia('(prefers-reduced-motion: reduce)').matches || closing.current) return;
      flight.current = target.animate([
        { transform: thumbnailTransform(), opacity: 0.5 },
        { transform: 'none', opacity: 1 },
      ], { duration: 250, easing: getComputedStyle(document.documentElement).getPropertyValue('--ease-out').trim() });
    };
    if (target.complete) enter();
    else target.addEventListener('load', enter, { once: true });
    return () => {
      target.removeEventListener('load', enter);
      flight.current?.cancel();
      element.close();
      document.body.style.overflow = previousOverflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [animate, thumbnailTransform, restoreFocus]);

  useLayoutEffect(() => {
    if (reduced) flight.current?.finish();
  }, [reduced]);

  useLayoutEffect(() => {
    if (src === previousSrc.current) return;
    previousSrc.current = src;
    if (closing.current || reduced || !movement.animate) return;
    flight.current?.cancel();
    flight.current = image.current?.animate([
      { transform: `translateX(${movement.direction * 12}px)`, opacity: 0.35 },
      { transform: 'none', opacity: 1 },
    ], { duration: 220, easing: getComputedStyle(document.documentElement).getPropertyValue('--ease-out').trim() });
  }, [src, reduced, movement.animate, movement.direction]);

  useLayoutEffect(() => {
    if (images.length < 2) return;
    new Image().src = images[(index + 1) % images.length];
    new Image().src = images[(index - 1 + images.length) % images.length];
  }, [images, index]);

  function step(direction: number, keyboard: boolean) {
    if (closing.current) return;
    flight.current?.cancel();
    onStep(direction, keyboard);
  }

  function endSwipe(event: PointerEvent<HTMLImageElement>) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (start === null || event.pointerType === 'mouse') return;
    const distance = event.clientX - start;
    if (Math.abs(distance) > 48) step(distance < 0 ? 1 : -1, false);
  }

  function close(keyboard: boolean) {
    if (closing.current) return;
    closing.current = true;
    const target = image.current;
    if (!target || reduced || keyboard) { onClose(); return; }
    const current = getComputedStyle(target).transform;
    flight.current?.cancel();
    flight.current = target.animate([
      { transform: current, opacity: 1 },
      { transform: thumbnailTransform(), opacity: 0.5 },
    ], { duration: 250, easing: getComputedStyle(document.documentElement).getPropertyValue('--ease-out').trim(), fill: 'forwards' });
    flight.current.onfinish = onClose;
  }

  return createPortal(
    <dialog ref={dialog} className="image-viewer" aria-label={`${title} image viewer`}
      onCancel={event => { event.preventDefault(); close(true); }}
      onClick={event => { if (event.target === event.currentTarget) close(event.detail === 0); }}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          step(event.key === 'ArrowLeft' ? -1 : 1, true);
        }
      }}>
      <div className="viewer-panel">
        <div className="viewer-heading"><span>{title}</span>{visitUrl && <a className="viewer-visit" href={visitUrl} target="_blank" rel="noopener noreferrer">Visit live <ArrowUpRight size={15} aria-hidden="true" /></a>}<button autoFocus className="icon-button" aria-label="Close image viewer" onClick={event => close(event.detail === 0)}><X size={22} /></button></div>
        <img ref={image} className="viewer-image" onPointerDown={event => { swipeStart.current = event.clientX; }} onPointerUp={endSwipe} onPointerCancel={() => { swipeStart.current = null; }} src={src} alt={`${title} screenshot ${index + 1} of ${count}`} />
        <div className="viewer-controls">
          <button className="icon-button" disabled={count < 2} aria-label="Previous enlarged image" onClick={event => step(-1, event.detail === 0)}><ChevronLeft size={20} /></button>
          <span aria-live="polite">{index + 1} / {count}</span>
          {count > 1 && <div className="viewer-thumbs">{images.map((image, position) => <button key={image} aria-label={`Show screenshot ${position + 1}`} aria-current={position === index} onClick={event => step(position - index, event.detail === 0)}><img src={image} alt="" /></button>)}</div>}
          <button className="icon-button" disabled={count < 2} aria-label="Next enlarged image" onClick={event => step(1, event.detail === 0)}><ChevronRight size={20} /></button>
        </div>
        {error && <p className="viewer-error" role="status">{error}</p>}
      </div>
    </dialog>, document.body,
  );
}
