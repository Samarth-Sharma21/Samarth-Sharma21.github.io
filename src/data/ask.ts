import { profile } from './profile';
import { projects } from './projects';

const titles = (list: typeof projects) => list.map(project => project.title).join(', ');
const allTech = [...new Set(projects.flatMap(project => project.tech))];

export function answerQuestion(question: string): string | null {
  const text = question.toLowerCase().trim();
  if (text.length < 3) return null;
  const tech = allTech.find(name => new RegExp(`(^|[^a-z0-9])${name.toLowerCase().replace(/[.+]/g, '\\$&')}([^a-z0-9]|$)`).test(text));
  if (tech) return `${tech} is used in ${titles(projects.filter(project => project.tech.includes(tech)))}.`;
  if (/\b(where|based|location|city|live)\b/.test(text) && !/demo/.test(text)) return `Samarth is based in ${profile.location}.`;
  if (/\b(intern|internship|experience|paytm|job|worked)\b/.test(text)) return `${profile.role} at ${profile.company}, ${profile.dates}. ${profile.experienceTools.join(', ')}.`;
  if (/\b(contact|email|mail|reach|hire|hiring)\b/.test(text)) return `Write to ${profile.email}, or use the message pipeline on the home page.`;
  if (/\b(demo|demos|live)\b/.test(text)) return `Live demos: ${titles(projects.filter(project => project.demo))}.`;
  if (/\b(ai|ml|machine learning|model)\b/.test(text)) return `AI experiments: ${titles(projects.filter(project => project.category === 'ai'))}.`;
  if (/\b(devops|cloud|infrastructure|kubernetes|docker|aws|terraform|jenkins)\b/.test(text)) return `DevOps work: ${profile.experienceTools.join(', ')}, from the ${profile.company} internship.`;
  if (/\b(projects?|built|build|made)\b/.test(text)) return `${projects.length} projects, including ${titles(projects.filter(project => project.featured))}.`;
  return null;
}
