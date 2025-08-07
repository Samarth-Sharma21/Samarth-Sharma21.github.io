import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Briefcase, ChevronRight } from 'lucide-react';

const ExperienceSection: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const experiences = [
    {
      id: 'exp1',
      role: 'Devops Engineer Intern ',
      company: 'Paytm',
      period: 'June 2025 - Present',
      location: 'Noida, India',
      description: 'Leading development of cloud-native applications using React, TypeScript, and AWS. Implemented CI/CD pipelines that reduced deployment time by 40%. Mentored junior developers and conducted code reviews to maintain high code quality.',
      achievements: [
        'Architected and implemented a microservices-based application that improved system scalability by 60%',
        'Reduced cloud infrastructure costs by 30% through optimization of AWS resources',
        'Led a team of 5 developers to deliver projects consistently ahead of schedule'
      ]
    }
  ];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <motion.section
      id="experience"
      className="section-padding select-none"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-200px" }}
      transition={{ duration: 0.8 }}
    >
      <div className="container-custom">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-text-light dark:text-text-dark font-clash font-bold text-2xl sm:text-3xl md:text-4xl">
            Experience
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-primary-light dark:bg-primary-dark mx-auto mt-3 sm:mt-4 rounded-full"></div>
          <p className="text-secondary-light dark:text-secondary-dark max-w-2xl mx-auto mt-4 sm:mt-6 text-sm sm:text-base px-4">
            My professional journey and the impactful roles I've held throughout my career.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <motion.div 
            className="relative pl-8 sm:pl-12 before:absolute before:left-0 sm:before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-primary-light/30 dark:before:from-primary-dark/30 before:via-primary-light dark:before:via-primary-dark before:to-primary-light/30 dark:before:to-primary-dark/30"
            initial={{ opacity: 0, height: 0 }}
            whileInView={{ opacity: 1, height: "auto" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                className={`mb-12 last:mb-0 relative ${expandedId === exp.id ? 'z-10' : 'z-0'}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                {/* Timeline dot */}
                <motion.div 
                  className="absolute -left-8 sm:-left-12 top-0 w-6 h-6 rounded-full bg-primary-light dark:bg-primary-dark flex items-center justify-center shadow-md z-10"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: [0, 1.2, 1], opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 300, 
                    delay: index * 0.2 + 0.3,
                    duration: 0.8
                  }}
                >
                  <motion.div
                    animate={{ 
                      boxShadow: [
                        '0 0 0 0 rgba(var(--color-primary-light-rgb), 0)',
                        '0 0 0 8px rgba(var(--color-primary-light-rgb), 0.2)',
                        '0 0 0 0 rgba(var(--color-primary-light-rgb), 0)'
                      ] 
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      repeatDelay: 1 
                    }}
                    className="absolute inset-0 rounded-full dark:shadow-primary-dark/50"
                  />
                  <Briefcase className="w-3 h-3 text-white" />
                </motion.div>

                {/* Experience card */}
                <motion.div 
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
                  whileHover={{ y: -5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                >
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-1 bg-primary-light dark:bg-primary-dark"
                    initial={{ scaleX: 0, transformOrigin: 'left' }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.2 + 0.5 }}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <motion.h3 
                      className="text-lg sm:text-xl font-semibold text-text-light dark:text-text-dark"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                    >
                      {exp.role}
                    </motion.h3>
                    <motion.div 
                      className="flex items-center text-sm text-secondary-light dark:text-secondary-dark bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full"
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{exp.period}</span>
                    </motion.div>
                  </div>

                  <motion.div 
                    className="mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
                  >
                    <div className="text-primary-light dark:text-primary-dark font-medium flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 inline-block" />
                      {exp.company}
                    </div>
                    <div className="text-sm text-secondary-light dark:text-secondary-dark ml-6">{exp.location}</div>
                  </motion.div>

                  <motion.p 
                    className="text-secondary-light dark:text-secondary-dark mb-4 border-l-2 border-gray-200 dark:border-gray-700 pl-3 italic"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.6 }}
                  >
                    {exp.description}
                  </motion.p>

                  <motion.button
                    onClick={() => toggleExpand(exp.id)}
                    className="flex items-center text-sm font-medium text-primary-light dark:text-primary-dark hover:underline"
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    {expandedId === exp.id ? 'Hide achievements' : 'View achievements'}
                    <ChevronRight className={`w-4 h-4 ml-1 transition-transform duration-300 ${expandedId === exp.id ? 'rotate-90' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {expandedId === exp.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <ul className="mt-4 space-y-2">
                          {exp.achievements.map((achievement, i) => (
                            <motion.li
                              key={i}
                              className="flex items-start text-secondary-light dark:text-secondary-dark"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-light dark:bg-primary-dark mt-1.5 mr-2 flex-shrink-0"></span>
                              <span>{achievement}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default ExperienceSection;