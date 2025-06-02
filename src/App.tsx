import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ScrollToTop from './components/utils/ScrollToTop';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark'>
        <div className='animate-pulse flex flex-col items-center'>
          <div className='h-24 w-24 rounded-full bg-primary-light dark:bg-primary-dark'></div>
          <p className='mt-4 text-text-light dark:text-text-dark font-clash'>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <div className='relative'>
          <Header />
          <main>
            <Routes>
              <Route path='/' element={<HomePage />} />
              <Route path='/projects' element={<ProjectsPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
