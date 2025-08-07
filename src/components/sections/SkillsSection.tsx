import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SkillsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('frontend');
  
  // Only keeping technologies as requested
  
  const skillCategories = {
    frontend: [
      { name: 'React', level: 85 },
      { name: 'JavaScript', level: 80 },
      { name: 'TypeScript', level: 75 },
      { name: 'HTML & CSS', level: 95 },
      { name: 'Tailwind CSS', level: 85 },
      { name: 'Next.js', level: 75 },
    ],
    backend: [
      { name: 'Node.js', level: 80 },
      { name: 'Express', level: 80 },
      { name: 'MongoDB', level: 75 },
      { name: 'SupaBase', level: 85 },
      { name: 'PostgreSQL', level: 70 },
      { name: 'GraphQL', level: 65 },
    ],
    aiml: [
      { name: 'Python', level: 85 },
      { name: 'TensorFlow', level: 70 },
      { name: 'PyTorch', level: 75 },
      { name: 'NLP', level: 80 },
      { name: 'Computer Vision', level: 75 },
      { name: 'Data Science', level: 75 },
    ],
    devops: [
      { name: 'Docker', level: 90 },
      { name: 'Kubernetes', level: 85 },
      { name: 'GitHub Actions', level: 85 },
      { name: 'Jenkins', level: 80 },
      { name: 'Prometheus', level: 75 },
      { name: 'Grafana', level: 75 },
      { name: 'Ansible', level: 70 },
    ],
    cloud: [
      { name: 'AWS EC2', level: 85 },
      { name: 'AWS S3', level: 90 },
      { name: 'AWS Lambda', level: 75 },
      { name: 'AWS VPC', level: 80 },
      { name: 'AWS RDS', level: 80 },
      { name: 'AWS CloudFormation', level: 75 },
      { name: 'Terraform', level: 80 },
    ],
  };
  
  const tabs = [
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'aiml', label: 'AI/ML' },
    { id: 'devops', label: 'DevOps' },
    { id: 'cloud', label: 'Cloud' },
  ];
  
  const getSkillLevel = (level: number) => {
    if (level >= 90) return 'Expert';
    if (level >= 80) return 'Advanced';
    if (level >= 70) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <motion.section 
      id="skills" 
      className="section-padding bg-gray-50 dark:bg-gray-900 select-none"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-200px" }}
      transition={{ duration: 0.8 }}
    >
      <div className="container-custom">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-text-light dark:text-text-dark font-clash font-bold text-2xl sm:text-3xl md:text-4xl">
            My Skills
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-primary-light dark:bg-primary-dark mx-auto mt-3 sm:mt-4 rounded-full"></div>
          <p className="text-secondary-light dark:text-secondary-dark max-w-2xl mx-auto mt-4 sm:mt-6 text-sm sm:text-base px-4">
            I've developed a diverse skill set across various technologies and domains. 
            Here's an overview of my technical expertise.
          </p>
        </motion.div>
        
        {/* Removed toggle as requested */}
        
        {/* Tabs - Improved for mobile */}
        <motion.div 
          className="flex justify-center mb-8 overflow-x-auto scrollbar-hide pb-4 px-4 -mx-2 w-full"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="inline-flex p-1 rounded-xl bg-gray-200 dark:bg-gray-800 flex-nowrap max-w-full mx-auto">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-2 sm:px-4 md:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-text-light dark:text-text-dark'
                    : 'text-secondary-light dark:text-secondary-dark hover:text-text-light dark:hover:text-text-dark'
                }`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
        
        {/* Skills Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {skillCategories[activeTab as keyof typeof skillCategories].map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-text-light dark:text-text-dark font-medium text-sm sm:text-base">
                      {skill.name}
                    </h4>
                    <span className="text-xs sm:text-sm text-secondary-light dark:text-secondary-dark sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity">
                      {getSkillLevel(skill.level)}
                    </span>
                  </div>
                  
                  <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary-light dark:bg-primary-dark rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                    ></motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default SkillsSection;