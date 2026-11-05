import { useEffect, useRef, useState } from 'react';

const notes = ['Learning by building.', 'From cloud infrastructure to interfaces.', 'Usually exploring another idea.'];

export default function PortraitNote() {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(0);
  const nextNote = useRef(0);
  const hovering = useRef(false);
  const touch = useRef(false);
  const suppressHover = useRef(false);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); suppressHover.current = true; } };
    document.addEventListener('keydown', dismiss);
    return () => document.removeEventListener('keydown', dismiss);
  }, [open]);

  function reveal() {
    if (open) return;
    setNote(nextNote.current % notes.length);
    nextNote.current++;
    setOpen(true);
  }

  return (
    <div className="portrait-frame">
      <button className="portrait-trigger" type="button" aria-label="A note from Samarth" aria-expanded={open} aria-controls="portrait-note" aria-describedby={open ? 'portrait-note' : undefined}
        onPointerEnter={event => { if (event.pointerType === 'mouse') { hovering.current = true; if (!suppressHover.current) reveal(); } }}
        onPointerLeave={event => { if (event.pointerType === 'mouse') { hovering.current = false; suppressHover.current = false; setOpen(false); } }}
        onPointerDown={event => { touch.current = event.pointerType === 'touch'; }}
        onFocus={event => { if (event.currentTarget.matches(':focus-visible')) reveal(); }}
        onBlur={() => setOpen(false)}
        onClick={() => { if (touch.current || !hovering.current) { if (open) setOpen(false); else reveal(); } else { setNote(nextNote.current++ % notes.length); setOpen(true); } }}>
        <img src="/me.jpeg" alt="Samarth Sharma" loading="lazy" width="720" height="900" draggable={false} />
        <span className="portrait-note" id="portrait-note" hidden={!open}>{notes[note]}</span>
      </button>
      <div className="portrait-caption"><span>Samarth Sharma</span><span>Noida, India</span></div>
    </div>
  );
}
