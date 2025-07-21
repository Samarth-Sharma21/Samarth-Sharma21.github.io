import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { projects } from '../../data/projects';
import ProjectCard from '../projects/ProjectCard';

const ProjectsSection: React.FC = () => {
  // Only show the first 3 projects on the homepage
  const featuredProjects = projects.slice(0, 3);

  return (
    <motion.section 
      id="projects" 
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
          <h2 className="text-text-light dark:text-text-dark font-clash font-bold ">
            Featured Projects
          </h2>
          <div className="w-20 h-1 bg-primary-light dark:bg-primary-dark mx-auto mt-4 rounded-full"></div>
          <p className="text-secondary-light dark:text-secondary-dark max-w-2xl mx-auto mt-6">
            A selection of my recent work across web development and AI technologies. 
            Each project represents a unique challenge and solution.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 80, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.8, 
                delay: 0.6 + index * 0.2,
                ease: [0.25, 0.1, 0.25, 1]
              }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Link
            to="/projects"
            className="btn btn-secondary inline-flex items-center"
          >
            View All Projects
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ProjectsSection;