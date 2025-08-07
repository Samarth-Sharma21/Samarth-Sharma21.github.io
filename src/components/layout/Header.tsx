import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent scrolling when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Restore scrolling when menu is closed
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Handle smooth scrolling for mobile menu links
  const handleMobileNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith('/#')) {
      e.preventDefault();
      const targetId = path.substring(2);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // Close menu first
        setIsOpen(false);
        
        // Then scroll after a short delay to allow menu animation to complete
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    } else {
      // For non-hash links, just close the menu
      setIsOpen(false);
    }
  };
  // Track current section based on scroll position
  const [activeSection, setActiveSection] = useState('/');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'skills', 'projects', 'contact'];
      const scrollPosition = window.scrollY + 150; // Increased offset for better detection

      // Check if we're at the top of the page
      if (window.scrollY < 100) {
        setActiveSection('/');
        return;
      }

      // Find the section that takes up the most space in the viewport
      let maxVisibleSection = null;
      let maxVisibleHeight = 0;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
          
          // Only consider elements that are actually visible in the viewport
          if (visibleHeight > 0 && visibleHeight > maxVisibleHeight) {
            maxVisibleHeight = visibleHeight;
            maxVisibleSection = section;
          }

          // Fallback to traditional position-based detection
          if (!maxVisibleSection) {
            const offsetTop = element.offsetTop;
            const offsetBottom = offsetTop + element.offsetHeight;

            if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
              setActiveSection(`/#${section}`);
              return;
            }
          }
        }
      }

      // Set the section with maximum visibility as active
      if (maxVisibleSection) {
        setActiveSection(`/#${maxVisibleSection}`);
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
    { name: 'Skills', path: '/#skills' },
    { name: 'Projects', path: '/#projects' },
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
      className={`fixed w-full z-[100] transition-all duration-300 before:absolute before:inset-0 before:z-[-1] ${
        scrolled ? 'before:glassmorphic py-3' : 'before:bg-transparent py-5'
      } ${
        scrollDirection === 'down' && scrolled && !isOpen
          ? '-translate-y-full'
          : 'translate-y-0'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}>
      <div className='container-custom flex justify-between items-center relative z-[101]'>
        <Link to='/' className='flex items-center' onClick={closeMenu}>
          <motion.div
            className='font-clash text-2xl font-bold text-primary-light dark:text-white'
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
            ref={menuButtonRef}
            aria-label='Toggle menu'
            onClick={toggleMenu}
            className='p-2 md:hidden rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={isOpen ? 'close' : 'menu'}
                initial={{ rotate: 0, opacity: 0 }}
                animate={{ rotate: isOpen ? 90 : 0, opacity: 1 }}
                exit={{ rotate: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}>
                {isOpen ? (
                  <X className='w-6 h-6 text-text-light dark:text-text-dark' />
                ) : (
                  <Menu className='w-6 h-6 text-text-light dark:text-text-dark' />
                )}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence mode='wait'>
        {isOpen && (
          <motion.div
            className='md:hidden fixed inset-0 z-[99]'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            {/* Background overlay */}
            <motion.div
              className='fixed inset-0 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md shadow-lg border-b border-gray-200/10 dark:border-gray-800/10'
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.3 }}
              onClick={closeMenu}
            />

            {/* Menu content */}
            <div
              ref={menuRef}
              className='relative z-[102] container-custom pt-24 pb-8'>
              {/* Close button - absolute positioned */}
              <motion.button
                className='absolute top-6 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors'
                onClick={closeMenu}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}>
                <X className='w-6 h-6 text-text-light dark:text-text-dark' />
              </motion.button>

              <nav className='flex flex-col space-y-6'>
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{
                      delay: 0.05 * index,
                      duration: 0.4,
                      ease: [0.25, 0.1, 0.25, 1.0],
                    }}>
                    <Link
                      to={link.path}
                      className={`text-xl font-medium transition-all duration-300 relative inline-block hover:text-primary-light dark:hover:text-primary-dark ${
                        isCurrentlyActive(link.path)
                          ? 'text-primary-light dark:text-primary-dark font-semibold'
                          : 'text-text-light dark:text-text-dark'
                      }`}
                      onClick={(e) => handleMobileNavClick(e, link.path)}>
                      {link.name}
                      {isCurrentlyActive(link.path) && (
                        <motion.span
                          className='absolute -bottom-1 left-0 w-full h-0.5 bg-primary-light dark:bg-primary-dark rounded-full'
                          layoutId='mobile-navbar-indicator'
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
