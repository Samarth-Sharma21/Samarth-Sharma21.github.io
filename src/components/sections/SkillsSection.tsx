import { useState } from 'react';
import { profile } from '../../data/profile';

export default function SkillsSection() {
  const [open, setOpen] = useState(1);
  return (
    <div id="skills" className="capabilities" tabIndex={-1}>
      {profile.capabilities.map((capability, index) => (
        <div className="capability" key={capability.title} data-open={open === index}>
          <h3><button type="button" aria-expanded={open === index} aria-controls={`capability-${index}`} onClick={() => setOpen(index)}><span className="capability-layer" aria-hidden="true">{`L${index + 1}`}</span>{capability.title}</button></h3>
          <div id={`capability-${index}`} className="capability-body"><div><p>{capability.description}</p><span className="capability-tools">{capability.tools}</span></div></div>
        </div>
      ))}
    </div>
  );
}
