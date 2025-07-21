import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/Samarth-Sharma21',
      icon: <Github className='w-5 h-5' />,
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/samarth-sh',
      icon: <Linkedin className='w-5 h-5' />,
    },
    {
      name: 'Email',
      url: 'https://mail.google.com/mail/?view=cm&fs=1&to=samarthsharma7621@gmail.com',
      icon: <Mail className='w-5 h-5' />,
    },
  ];

  return (
    <footer className='py-8 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 select-none'>
      <div className='container-custom'>
        <div className='flex flex-col md:flex-row justify-between items-center'>
          <div>
            <p className='text-center md:text-left font-clash font-medium text-lg text-text-light dark:text-text-dark'>
              Samarth Sharma
            </p>
            <p className='text-center md:text-left text-secondary-light dark:text-secondary-dark text-sm mt-1'>
              &copy; {currentYear} All rights reserved
            </p>
          </div>

          <div className='flex items-center space-x-4 mt-4 md:mt-0'>
            {socialLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={link.name}
                className='p-2 rounded-full bg-white dark:bg-gray-800 text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-300 shadow-sm'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}>
                {link.icon}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
