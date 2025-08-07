import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, MapPin } from 'lucide-react';

const ExperienceSection: React.FC = () => {
  const experiences = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'Tech Innovations Inc.',
      duration: 'Jan 2022 - Present',
      location: 'Mumbai, India',
      description: 'Leading development of cloud-native applications using React, Node.js, and AWS. Implemented CI/CD pipelines and mentored junior developers.'
    },
    
  ];

  return (
    <motion.section 
      id="experience" 
      className="section-padding bg-white dark:bg-gray-900 select-none"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-200px" }}
      transition={{ duration: 0.8 }}
    >
      <div className="container-custom">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-text-light dark:text-text-dark font-clash font-bold text-2xl sm:text-3xl md:text-4xl">
            My Experience
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-primary-light dark:bg-primary-dark mx-auto mt-3 sm:mt-4 rounded-full"></div>
          <p className="text-secondary-light dark:text-secondary-dark max-w-2xl mx-auto mt-4 sm:mt-6 text-sm sm:text-base px-4">
            My professional journey and work experience in the tech industry.
          </p>
        </motion.div>
        
        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <motion.div 
            className="absolute left-8 sm:left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-light/80 via-primary-light/50 to-primary-light/10 dark:from-primary-dark/80 dark:via-primary-dark/50 dark:to-primary-dark/10"
            initial={{ height: 0 }}
            whileInView={{ height: '100%' }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2 }}
          />
          
          {/* Experience cards */}
          <div className="relative space-y-12">
            {experiences.map((exp, index) => (
              <motion.div 
                key={exp.id}
                className="relative flex items-start pl-8 sm:pl-12"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* Timeline dot */}
                <motion.div 
                  className="absolute left-6 sm:left-10 w-6 h-6 rounded-full bg-primary-light dark:bg-primary-dark border-4 border-white dark:border-gray-900 transform -translate-x-1/2 z-10"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.2 }}
                />
                
                {/* Content */}
                <div className="w-full pl-8 sm:pl-12">
                  <motion.div 
                    className="card p-6 hover:translate-y-[-5px] transition-all duration-300 border-t-4 border-primary-light dark:border-primary-dark"
                    whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                  >
                    <div className="flex flex-col space-y-4">
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold text-text-light dark:text-text-dark">{exp.title}</h3>
                        <div className="flex items-center text-primary-light dark:text-primary-dark font-medium mt-1">
                          <Briefcase size={16} className="mr-1" />
                          <span>{exp.company}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-secondary-light dark:text-secondary-dark">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <Calendar size={14} className="mr-1" />
                          <span>{exp.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          <span>{exp.location}</span>
                        </div>
                      </div>
                      
                      <p className="text-secondary-light dark:text-secondary-dark text-sm md:text-base">
                        {exp.description}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default ExperienceSection;