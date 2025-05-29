import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ChevronDown } from 'lucide-react';
import FloatingElements from '../three/FloatingElements';
import { Link } from 'react-scroll';

const HeroSection: React.FC = () => {
  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const nameArray = 'Samarth Sharma'.split('');

  return (
    <section className='relative min-h-screen flex items-center pt-20'>
      <div className='absolute inset-0 overflow-hidden'>
        <FloatingElements />
      </div>

      <div className='container-custom relative z-10'>
        <div className='max-w-3xl'>
          <motion.div
            variants={container}
            initial='hidden'
            animate='show'
            className='mb-8'>
            <motion.p
              variants={item}
              className='text-primary-light dark:text-primary-dark text-lg font-medium mb-4'>
              Hello, I'm
            </motion.p>

            <motion.h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-clash font-bold text-text-light dark:text-text-dark leading-tight mb-4'>
              {nameArray.map((letter, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.215, 0.61, 0.355, 1],
                    delay: 0.5 + index * 0.04,
                  }}
                  className='inline-block whitespace-nowrap'>
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              variants={item}
              className='text-xl md:text-2xl text-secondary-light dark:text-secondary-dark mb-8'>
              I'm a developer focused on building thoughtful, intelligent, and
              impactful experiences across web and AI technologies.
            </motion.p>

            <motion.div variants={item} className='flex flex-wrap gap-4'>
              <motion.a
                href='#projects'
                className='btn btn-primary'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                View My Work
              </motion.a>

              <motion.a
                href='#contact'
                className='btn btn-secondary'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                Get In Touch
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll down button */}
      <motion.div
        className='absolute bottom-10 left-1/2 -translate-x-1/2 sm:left-10 sm:translate-x-0 md:left-20 lg:left-1/2 lg:-translate-x-1/2'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}>
        <Link
          to='about'
          className='flex items-center gap-2 text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors cursor-pointer'
          smooth={true}
          duration={500}>
          <motion.span
            className='text-xs sm:text-sm md:text-base'
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            Scroll Down
          </motion.span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown className='w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5' />
          </motion.div>
        </Link>
      </motion.div>
    </section>
  );
};

export default HeroSection;
