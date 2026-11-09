import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileDock from './components/layout/MobileDock';
import CommandPalette from './components/layout/CommandPalette';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import ScrollToTop from './components/utils/ScrollToTop';
import { ThemeProvider } from './contexts/ThemeContext';

const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ResumePage = lazy(() => import('./pages/ResumePage'));

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <a className="skip-link" href="#main-content">Skip to content</a>
        <a className="skip-link" href="/#contact">Skip to contact</a>
        <Header />
        <main id="main-content" tabIndex={-1}>
          <Suspense fallback={<div className="route-loading" role="status">Loading</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </Suspense>
        </main>
        <Footer />
        <MobileDock />
        <CommandPalette />
      </BrowserRouter>
    </ThemeProvider>
  );
}
