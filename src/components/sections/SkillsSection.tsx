const capabilities = [
  { title: 'Interfaces & applications', description: 'Turning an idea into something people can use.', tools: 'React · TypeScript · Node.js · Tailwind CSS' },
  { title: 'Systems & infrastructure', description: 'Keeping the path from development to deployment dependable.', tools: 'Docker · Kubernetes · AWS · Terraform · Jenkins' },
  { title: 'Experiments & exploration', description: 'Learning by building with new tools and unfamiliar problems.', tools: 'Python · Computer vision · TensorFlow · Supabase' },
];

export default function SkillsSection() {
  return <div id="skills" className="capabilities" tabIndex={-1}>{capabilities.map(capability => <div className="capability" key={capability.title}><div><h3>{capability.title}</h3><p>{capability.description}</p><span className="capability-tools">{capability.tools}</span></div></div>)}</div>;
}
