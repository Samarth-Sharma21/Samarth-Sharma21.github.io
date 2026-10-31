import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

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
