import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const images = React.useMemo(
    () => project.images || [project.image],
    [project.images, project.image]
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const nextImage = React.useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    },
    [images.length]
  );

  const prevImage = React.useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
    },
    [images.length]
  );

  // Handle touch events
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      nextImage();
    }
    if (isRightSwipe) {
      prevImage();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (!isHovered) return;
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [isHovered, nextImage, prevImage]);

  // Auto-cycle through images every 3 seconds when not hovered
  useEffect(() => {
    if (images.length > 1 && !isHovered) {
      const interval = setInterval(() => nextImage(), 3000);
      return () => clearInterval(interval);
    }
  }, [images.length, isHovered, nextImage]);

  return (
    <motion.div
      className='card h-full flex flex-col overflow-hidden group relative select-none'
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div className='relative overflow-hidden'>
        <AnimatePresence mode='wait'>
          <motion.img
            key={currentImageIndex}
            src={images[currentImageIndex]}
            alt={`${project.title} - Image ${currentImageIndex + 1}`}
            className='w-full h-48 object-cover object-center transition-transform duration-700 group-hover:scale-110'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        </AnimatePresence>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className='absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/90 z-20 focus:opacity-100'
              aria-label='Previous image'>
              <ChevronLeft className='w-5 h-5' />
            </button>
            <button
              onClick={nextImage}
              className='absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/90 z-20 focus:opacity-100'
              aria-label='Next image'>
              <ChevronRight className='w-5 h-5' />
            </button>
          </>
        )}

        {/* Image indicators */}
        {images.length > 1 && (
          <div className='absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm z-20'>
            {images.map((_, index) => (
              <motion.button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className='absolute top-3 right-3 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-white text-xs font-medium'>
            {currentImageIndex + 1} / {images.length}
          </div>
        )}

        <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-start p-4'>
          <div className='flex space-x-3'>
            {project.github && (
              <motion.a
                href={project.github}
                target='_blank'
                rel='noopener noreferrer'
                aria-label='View GitHub Repository'
                className='p-2 rounded-full bg-white/90 text-gray-900 hover:bg-white transition-colors'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}>
                <Github className='w-5 h-5' />
              </motion.a>
            )}

            {project.demo && (
              <motion.a
                href={project.demo}
                target='_blank'
                rel='noopener noreferrer'
                aria-label='View Live Demo'
                className='p-2 rounded-full bg-primary-light text-white hover:bg-primary-light/90 transition-colors'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}>
                <ExternalLink className='w-5 h-5' />
              </motion.a>
            )}
          </div>
        </div>
      </div>

      <div className='p-6 flex flex-col flex-grow'>
        <h3 className='text-xl font-clash font-semibold text-text-light dark:text-text-dark mb-2'>
          {project.title}
        </h3>

        <p className='text-secondary-light dark:text-secondary-dark text-sm mb-4 flex-grow'>
          {project.description}
        </p>

        <div className='flex flex-wrap gap-2 mt-auto pt-4'>
          {project.tech.map((tech) => (
            <span key={tech} className='tech-badge'>
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
