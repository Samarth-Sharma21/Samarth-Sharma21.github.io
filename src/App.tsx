import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ScrollToTop from './components/utils/ScrollToTop';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [loading, setLoading] = useState(true);
  const nameArray = 'Samarth Sharma'.split('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // Increased time to show the full animation

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark'>
        <div className='text-center'>
          <div className='mb-2 flex justify-center overflow-hidden'>
            {nameArray.map((letter, index) => (
              <motion.span
                key={index}
                className={`inline-block text-4xl md:text-5xl font-clash font-bold text-primary-light dark:text-primary-dark`}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                  delay: index * 0.1
                }}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </motion.span>
            ))}
          </div>
          <motion.div
            className='h-1 bg-primary-light dark:bg-primary-dark rounded-full'
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              delay: 1
            }}
          />
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
