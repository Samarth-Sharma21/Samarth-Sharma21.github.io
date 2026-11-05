import { ArrowUpRight } from 'lucide-react';
import PortraitNote from './PortraitNote';
import SkillsSection from './SkillsSection';

export default function AboutSection() {
  return (
    <section id="about" className="about-section section-space container-custom" tabIndex={-1}>
      <div className="section-heading"><div><h2>A little about me.</h2></div><p>I like understanding how things work.<br />Then finding a way to make them better.</p></div>
      <div className="about-grid">
        <PortraitNote />
        <div className="about-copy"><p className="about-lead">From infrastructure to the interface.</p><p>My work brings together web development, cloud infrastructure, and a growing interest in AI. I enjoy the whole process, from a first rough idea to the details that make a product useful.</p><p>I'm based in Noida, with a background in computer science. Outside my day-to-day work in DevOps, personal projects give me room to experiment, ask questions, and keep learning.</p><a href="https://github.com/Samarth-Sharma21" className="text-link" target="_blank" rel="noopener noreferrer">Follow the work on GitHub <ArrowUpRight size={16} aria-hidden="true" /></a><SkillsSection /></div>
      </div>
    </section>
  );
}
