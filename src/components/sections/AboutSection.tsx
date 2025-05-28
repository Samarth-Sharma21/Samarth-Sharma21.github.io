import React from 'react';
import { motion } from 'framer-motion';

const AboutSection: React.FC = () => {
  const profileImageUrl = 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=600';

  return (
    <section id="about" className="section-padding bg-gray-50 dark:bg-gray-900">
      <div className="container-custom">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-text-light dark:text-text-dark font-clash font-bold">
            About Me
          </h2>
          <div className="w-20 h-1 bg-primary-light dark:bg-primary-dark mx-auto mt-4 rounded-full"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative z-10">
              <img
                src={profileImageUrl}
                alt="Samarth Sharma"
                className="rounded-2xl shadow-lg w-full h-auto object-cover max-w-md mx-auto"
              />
            </div>
            
            <motion.div
              className="absolute inset-0 rounded-2xl bg-primary-light dark:bg-primary-dark -z-10 transform"
              initial={{ rotate: 0, scale: 0.9 }}
              whileInView={{ rotate: -3, scale: 0.95 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            ></motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-2xl md:text-3xl font-clash font-semibold text-text-light dark:text-text-dark mb-4">
              I'm a passionate developer and AI enthusiast
            </h3>
            
            <p className="text-secondary-light dark:text-secondary-dark mb-6">
              I'm a developer focused on building thoughtful, intelligent, and impactful experiences across web and AI technologies. With a passion for creating elegant solutions to complex problems, I strive to make technology more accessible and user-friendly.
            </p>
            
            <p className="text-secondary-light dark:text-secondary-dark mb-8">
              My journey in tech has led me to explore various domains including web development, machine learning, and user experience design. I'm constantly learning and experimenting with new technologies to expand my skillset and create better digital experiences.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-text-light dark:text-text-dark mb-2">
                  Education
                </h4>
                <p className="text-secondary-light dark:text-secondary-dark">
                  B.Tech in Computer Science
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-text-light dark:text-text-dark mb-2">
                  Location
                </h4>
                <p className="text-secondary-light dark:text-secondary-dark">
                  Bangalore, India
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-text-light dark:text-text-dark mb-2">
                  Interests
                </h4>
                <p className="text-secondary-light dark:text-secondary-dark">
                  AI, Web Development, UX
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-text-light dark:text-text-dark mb-2">
                  Experience
                </h4>
                <p className="text-secondary-light dark:text-secondary-dark">
                  3+ Years
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;