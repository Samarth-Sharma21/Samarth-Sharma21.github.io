import React from 'react';
import { motion } from 'framer-motion';

const AboutSection: React.FC = () => {
  const profileImageUrl = '/me.jpeg';

  return (
    <section id='about' className='section-padding bg-gray-50 dark:bg-gray-900 select-none'>
      <div className='container-custom'>
        <motion.div
          className='text-center mb-16'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}>
          <h2 className='text-text-light dark:text-text-dark font-clash font-bold'>
            About Me
          </h2>
          <div className='w-20 h-1 bg-primary-light dark:bg-primary-dark mx-auto mt-4 rounded-full'></div>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
          <motion.div
            className='relative flex justify-center'
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}>
            <div
              className='relative w-full max-w-md rounded-2xl mx-auto
                before:absolute before:inset-0 before:rounded-2xl 
                before:bg-[radial-gradient(circle,_rgba(96,165,250,0.6)_0%,_transparent_70%)] 
                dark:before:bg-[radial-gradient(circle,_rgba(168,85,247,0.4)_0%,_transparent_70%)]
                before:blur-2xl before:z-[-1]'>
              <img
                src={profileImageUrl}
                alt='Samarth Sharma'
                className='rounded-2xl shadow-lg w-full h-auto object-cover'
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}>
            <h3 className='text-2xl md:text-3xl font-clash font-semibold text-text-light dark:text-text-dark mb-4'>
              I'm a passionate developer and AI enthusiast
            </h3>

            <p className='text-secondary-light dark:text-secondary-dark mb-6'>
              I'm a developer focused on building thoughtful, intelligent, and
              impactful experiences across web and AI technologies. With a
              passion for creating elegant solutions to complex problems, I
              strive to make technology more accessible and user-friendly.
            </p>

            <p className='text-secondary-light dark:text-secondary-dark mb-8'>
              My journey in tech has led me to explore various domains including 
              devops, web development, machine learning, and user experience design. I'm
              constantly learning and experimenting with new technologies to
              expand my skillset and create better digital experiences.
            </p>

            <div className='grid grid-cols-2 gap-6'>
              <div>
                <h4 className='text-lg font-semibold text-text-light dark:text-text-dark mb-2'>
                  Education
                </h4>
                <p className='text-secondary-light dark:text-secondary-dark'>
                  B.Tech in Computer Science
                </p>
              </div>

              <div>
                <h4 className='text-lg font-semibold text-text-light dark:text-text-dark mb-2'>
                  Location
                </h4>
                <p className='text-secondary-light dark:text-secondary-dark'>
                  Mumbai, India
                </p>
              </div>

              <div>
                <h4 className='text-lg font-semibold text-text-light dark:text-text-dark mb-2'>
                  Interests
                </h4>
                <p className='text-secondary-light dark:text-secondary-dark'>
                  AI, Web Development, DevOps
                </p>
              </div>

              <div>{/* Reserved for Experience */}</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
