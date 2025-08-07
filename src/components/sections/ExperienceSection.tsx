import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, MapPin, ChevronDown, ChevronUp, Server, Cloud, Code, GitBranch } from 'lucide-react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { styled } from '@mui/material/styles';

const ExperienceSection: React.FC = () => {
  // State to track which experience cards have their details expanded
  const [expandedCards, setExpandedCards] = useState<number[]>([]);

  // Toggle function for expanding/collapsing details
  const toggleCardDetails = (id: number) => {
    setExpandedCards(prev => 
      prev.includes(id) ? prev.filter(cardId => cardId !== id) : [...prev, id]
    );
  };

  const experiences = [
    {
      id: 1,
      title: 'DevOps Engineer',
      company: 'Paytm',
      duration: 'June 2025 - Present',
      location: 'Noida, India',
      description: 'Assisted in implementing and maintaining CI/CD pipelines for cloud-native applications. Collaborated with development teams to automate deployment processes and improve infrastructure reliability.',
      skills: ['Docker', 'Kubernetes', 'Jenkins', 'AWS', 'Terraform'],
      detailedPoints: [
        {
          title: 'CI/CD Pipeline Management',
          icon: <GitBranch size={16} className="text-blue-500" />,
          points: [
            'Configured and maintained Jenkins pipelines for automated testing and deployment',
            'Implemented automated code quality checks and security scanning',
            'Reduced deployment time by 40% through pipeline optimization'
          ]
        },
        {
          title: 'Cloud Infrastructure',
          icon: <Cloud size={16} className="text-blue-500" />,
          points: [
            'Provisioned and managed AWS resources using Terraform',
            'Implemented infrastructure-as-code practices for consistent environments',
            'Monitored cloud resource utilization and optimized for cost efficiency'
          ]
        },
        {
          title: 'Containerization',
          icon: <Server size={16} className="text-blue-500" />,
          points: [
            'Created and optimized Docker images for microservices',
            'Deployed and managed applications on Kubernetes clusters',
            'Implemented auto-scaling policies based on resource utilization'
          ]
        },
        {
          title: 'Automation & Scripting',
          icon: <Code size={16} className="text-blue-500" />,
          points: [
            'Developed shell scripts to automate routine maintenance tasks',
            'Created monitoring dashboards using Grafana and Prometheus',
            'Implemented automated backup and disaster recovery procedures'
          ]
        }
      ]
    },

  ];

  // Custom styled Timeline component for right alignment with modern look
  const StyledTimeline = styled(Timeline)(({ theme }) => ({
    padding: 0,
    marginLeft: 0,
    '& .MuiTimelineItem-root': {
      minHeight: 0,
      '&:before': {
        display: 'none',
      },
    },
    '& .MuiTimelineContent-root': {
      padding: '0 0 32px 16px',
    },
    '& .MuiTimelineDot-root': {
      margin: 0,
      backgroundColor: '#ffffff', // white
      border: '1px solid #60a5fa', // blue-400 border
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 30,
      height: 30,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'scale(1.1)',
      },
    },
    '& .MuiTimelineConnector-root': {
      backgroundColor: '#60a5fa', // blue-400
      width: 2,
    },
  }));

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
        
        {/* Timeline using Material UI */}
        <div className="relative max-w-4xl mx-auto">
          <StyledTimeline position="right">
            {experiences.map((exp, index) => (
              <TimelineItem key={exp.id}>
                <TimelineSeparator>
                  <TimelineDot>
                    <Briefcase size={18} className="text-blue-400" />
                  </TimelineDot>
                  {index < experiences.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <motion.div 
                    className="card p-6 hover:translate-y-[-5px] transition-all duration-300 border-l-4 border-primary-light dark:border-primary-dark mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                  >
                    <div className="flex flex-col space-y-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div>
                          <h3 className="text-lg md:text-xl font-semibold text-text-light dark:text-text-dark">{exp.title}</h3>
                          <div className="flex items-center text-primary-light dark:text-primary-dark font-medium mt-1">
                            <Briefcase size={16} className="mr-1" />
                            <span>{exp.company}</span>
                          </div>
                        </div>
                        <div className="mt-2 md:mt-0 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-xs font-medium inline-flex items-center">
                          <Calendar size={12} className="mr-1" />
                          <span>{exp.duration}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-secondary-light dark:text-secondary-dark">
                        <MapPin size={14} className="mr-1" />
                        <span>{exp.location}</span>
                      </div>
                      
                      <p className="text-secondary-light dark:text-secondary-dark text-sm md:text-base">
                        {exp.description}
                      </p>
                      
                      {exp.skills && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {exp.skills.map((skill, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Detailed Points Dropdown */}
                      {exp.detailedPoints && (
                        <div className="mt-2">
                          <button 
                            onClick={() => toggleCardDetails(exp.id)}
                            className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                          >
                            <span>View Detailed Responsibilities</span>
                            {expandedCards.includes(exp.id) ? 
                              <ChevronUp size={16} /> : 
                              <ChevronDown size={16} />}
                          </button>
                          
                          {expandedCards.includes(exp.id) && (
                            <div className="mt-3 space-y-4 pl-2 border-l-2 border-blue-400 dark:border-blue-500">
                              {exp.detailedPoints.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="space-y-2">
                                  <div className="flex items-center">
                                    {section.icon}
                                    <h4 className="ml-2 font-medium text-gray-800 dark:text-gray-200">{section.title}</h4>
                                  </div>
                                  <ul className="space-y-1 pl-6">
                                    {section.points.map((point, pointIndex) => (
                                      <li key={pointIndex} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></span>
                                        <span>{point}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </TimelineContent>
              </TimelineItem>
            ))}
          </StyledTimeline>
        </div>
      </div>
    </motion.section>
  );
};

export default ExperienceSection;