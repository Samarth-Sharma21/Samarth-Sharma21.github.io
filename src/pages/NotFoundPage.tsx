import { Link, useLocation } from 'react-router-dom';
import { projects } from '../data/projects';

const pages = [{ label: 'Selected work', to: '/#projects', words: 'work projects portfolio' }, { label: 'Project archive', to: '/projects', words: 'archive all projects' }, { label: 'Resume', to: '/resume', words: 'resume cv hire' }, { label: 'Contact', to: '/#contact', words: 'contact email talk' }];

export default function NotFoundPage() {
  const { pathname } = useLocation();
  const term = pathname.replace(/[^a-z0-9]+/gi, ' ').trim().toLowerCase();
  const matches = term ? [
    ...projects.filter(project => `${project.id} ${project.title}`.toLowerCase().includes(term)).map(project => ({ label: project.title, to: `/projects#${project.id}` })),
    ...pages.filter(page => page.words.includes(term)),
  ] : [];
  const suggestions = matches.length ? matches : pages;
  return (
    <section className="container-custom not-found">
      <ol className="build-log" aria-label="Deployment log for this address">
        <li data-state="ok">Resolved samarth-sharma21.github.io</li>
        <li data-state="ok">Loaded portfolio</li>
        <li data-state="failed">No route matches <code>{pathname}</code></li>
      </ol>
      <h1>This page isn't here.</h1>
      <p>That build failed. Everything else is still here.</p>
      <nav className="not-found-links" aria-label="Suggested pages">{suggestions.map(item => <Link key={item.to} to={item.to}>{item.label}</Link>)}</nav>
      <Link className="button button-primary" to="/">Back to home</Link>
    </section>
  );
}
