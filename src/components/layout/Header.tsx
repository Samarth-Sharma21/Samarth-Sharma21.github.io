import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path && location.hash === '';
    }
    if (path.includes('#')) {
      const hash = path.split('#')[1];
      return location.hash === `#${hash}`;
    }
    return location.pathname.startsWith(path);
  };

  // Track current section based on scroll position
  const [activeSection, setActiveSection] = useState('/');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'projects', 'skills', 'contact'];
      const scrollPosition = window.scrollY + 100;

      // Check if we're at the top of the page
      if (window.scrollY < 100) {
        setActiveSection('/');
        return;
      }

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(`/#${section}`);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once to set initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isCurrentlyActive = (path: string) => {
    return activeSection === path;
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/#about' },
    { name: 'Projects', path: '/#projects' },
    { name: 'Skills', path: '/#skills' },
    { name: 'Contact', path: '/#contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine if scrolled
      if (currentScrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Determine scroll direction
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Close menu when path changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <motion.header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'glassmorphic shadow-md border-none py-3'
          : 'py-5 shadow-none border-none'
      } ${
        scrollDirection === 'down' && scrolled
          ? '-translate-y-full'
          : 'translate-y-0'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}>
      <div className='container-custom flex justify-between items-center'>
        <Link to='/' className='flex items-center' onClick={closeMenu}>
          <motion.div
            className='font-clash text-2xl font-bold text-primary-light dark:text-primary-dark'
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}>
            Samarth Sharma
          </motion.div>
        </Link>

        <div className='flex items-center gap-4'>
          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-6'>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-300 relative ${
                  isCurrentlyActive(link.path)
                    ? 'text-primary-light dark:text-primary-dark'
                    : 'text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark'
                }`}>
                {link.name}
                {isCurrentlyActive(link.path) && (
                  <motion.span
                    className='absolute -bottom-1 left-0 w-full h-0.5 bg-primary-light dark:bg-primary-dark rounded-full'
                    layoutId='navbar-indicator'
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Theme toggle button */}
          <button
            aria-label='Toggle theme'
            onClick={toggleTheme}
            className='p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors'>
            <AnimatePresence mode='wait' initial={false}>
              <motion.div
                key={theme}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}>
                {theme === 'dark' ? (
                  <Sun className='w-5 h-5 text-text-dark' />
                ) : (
                  <Moon className='w-5 h-5 text-text-light' />
                )}
              </motion.div>
            </AnimatePresence>
          </button>

          {/* Mobile menu button */}
          <button
            aria-label='Toggle menu'
            onClick={toggleMenu}
            className='p-2 md:hidden rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors'>
            {isOpen ? (
              <X className='w-6 h-6 text-text-light dark:text-text-dark' />
            ) : (
              <Menu className='w-6 h-6 text-text-light dark:text-text-dark' />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className='md:hidden fixed inset-0 z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            {/* Background overlay with 80% blur */}
            <motion.div
              className='absolute inset-0 bg-white/40 dark:bg-background-dark/40 border-0'
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.4 }}
              style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            />

            {/* Menu content */}
            <motion.div
              className='relative z-10 container-custom pt-20 pb-8'
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, delay: 0.1 }}>
              <nav className='flex flex-col space-y-6'>
                {navLinks.map((link, index) => {
                  const isActive = isCurrentlyActive(link.path);
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{
                        delay: 0.1 * index,
                        duration: 0.5,
                        ease: [0.25, 0.1, 0.25, 1.0],
                      }}>
                      <Link
                        to={link.path}
                        className={`text-xl font-medium transition-all duration-300 relative inline-block ${
                          isActive
                            ? 'text-primary-light dark:text-primary-dark font-semibold'
                            : 'text-text-light dark:text-text-dark hover:text-primary-light/80 dark:hover:text-primary-dark/80'
                        }`}
                        onClick={closeMenu}>
                        <span className='relative z-10'>{link.name}</span>

                        {/* Active indicator with animation */}
                        {isActive && (
                          <motion.span
                            className='absolute -bottom-1 left-0 w-full h-0.5 bg-primary-light dark:bg-primary-dark rounded-full'
                            layoutId='mobile-navbar-indicator'
                            initial={{ width: '0%', left: '50%' }}
                            animate={{ width: '100%', left: '0%' }}
                            transition={{
                              type: 'spring',
                              stiffness: 300,
                              damping: 30,
                            }}
                          />
                        )}

                        {/* Hover indicator */}
                        {!isActive && (
                          <motion.span
                            className='absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-light/50 dark:bg-primary-dark/50 rounded-full'
                            initial={{ width: '0%' }}
                            whileHover={{ width: '100%' }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
