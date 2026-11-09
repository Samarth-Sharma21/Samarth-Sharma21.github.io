import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { profile } from './data/profile';

const redirectedRoute = new URLSearchParams(location.search).get('portfolio-route');
if (redirectedRoute?.startsWith('/') && !redirectedRoute.startsWith('//')) {
  const destination = new URL(redirectedRoute, location.origin);
  if (destination.origin === location.origin) {
    history.replaceState(history.state, '', destination.pathname + destination.search + destination.hash);
  }
}

const navigation = performance.getEntriesByType('navigation')[0];
const isReload = navigation && 'type' in navigation
  ? navigation.type === 'reload'
  : performance.navigation?.type === 1;
if (isReload) {
  history.scrollRestoration = 'manual';
  history.replaceState(history.state, '', location.pathname + location.search);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

console.info(`%cReading the console? We should talk.%c\n${profile.email}`, 'font: 600 16px sans-serif; color: #ad1457', 'font: 13px sans-serif');
