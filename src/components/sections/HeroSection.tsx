import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import FloatingElements from '../three/FloatingElements';

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

  const nameArray = "Samarth Sharma".split('');

  return (
    <section className="relative min-h-screen flex items-center pt-20">
      <div className="absolute inset-0 overflow-hidden">
        <FloatingElements />
      </div>
      
      <div className="container-custom relative z-10">
        <div className="max-w-3xl">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mb-8"
          >
            <motion.p
              variants={item}
              className="text-primary-light dark:text-primary-dark text-lg font-medium mb-4"
            >
              Hello, I'm
            </motion.p>
            
            <motion.h1 className="text-5xl md:text-6xl lg:text-7xl font-clash font-bold text-text-light dark:text-text-dark leading-tight mb-4">
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
                  className="inline-block"
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              ))}
            </motion.h1>
            
            <motion.p
              variants={item}
              className="text-xl md:text-2xl text-secondary-light dark:text-secondary-dark mb-8"
            >
              I'm a developer focused on building thoughtful, intelligent, and impactful experiences across web and AI technologies.
            </motion.p>
            
            <motion.div variants={item} className="flex flex-wrap gap-4">
              <motion.a
                href="#projects"
                className="btn btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View My Work
              </motion.a>
              
              <motion.a
                href="#contact"
                className="btn btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get In Touch
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer"
        onClick={scrollToAbout}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <motion.p className="text-sm text-secondary-light dark:text-secondary-dark mb-2">
          Scroll Down
        </motion.p>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ArrowDown className="w-5 h-5 text-primary-light dark:text-primary-dark" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;