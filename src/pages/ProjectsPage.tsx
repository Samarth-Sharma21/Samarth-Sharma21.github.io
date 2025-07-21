import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';
import ProjectCard from '../components/projects/ProjectCard';

const ProjectsPage: React.FC = () => {
  const [filter, setFilter] = React.useState<string>('all');
  
  // Get unique tags from all projects
  const allTags = Array.from(
    new Set(projects.flatMap((project) => project.tech))
  ).sort();
  
  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter((project) => project.tech.includes(filter));

  return (
    <motion.div
      className="min-h-screen py-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container-custom">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-primary-light dark:text-primary-dark hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portfolio
          </Link>
          
          <motion.h1
            className="text-4xl md:text-5xl font-clash font-bold text-text-light dark:text-text-dark mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            My Projects
          </motion.h1>
          
          <motion.p
            className="text-secondary-light dark:text-secondary-dark max-w-2xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            A comprehensive collection of my work, showcasing my skills and experience
            in web development, design, and AI/ML technologies.
          </motion.p>
        </div>
        
        {/* Filter tabs */}
        <motion.div
          className="mb-12 flex flex-wrap gap-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-light text-white dark:bg-primary-dark'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            All Projects
          </button>
          
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === tag
                  ? 'bg-primary-light text-white dark:bg-primary-dark'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </motion.div>
        
        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
        
        {filteredProjects.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-secondary-light dark:text-secondary-dark">
              No projects found with the selected filter.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectsPage;