import { Project } from '../types';

export const projects: Project[] = [
  {
    title: 'ReKindle',
    description:
      'Memory-sharing app for dementia patients with collaborative family features.',
    tech: ['React', 'Node.js', 'Supabase'],
    image: 'public/Rekindle2.JPG',
    images: [
      'public/Rekindle1.JPG',
      'public/Rekindle2.JPG',
      'public/Rekindle3.JPG',
    ],
    github: 'https://github.com/Samarth-Sharma21/ReKindle',
    demo: 'https://samarth-sharma21.github.io/ReKindle',
  },
  {
    title: 'WordleParty',
    description:
      'A real-time multiplayer Wordle game built with React and Vite. Create or join rooms and race to guess the word first — no login required.',
    tech: ['React', 'WebRTC'],
    image: 'public/Wordle1.JPG',
    images: ['public/Wordle1.JPG', 'public/Wordle2.JPG', 'public/Wordle3.JPG'],
    github: 'https://github.com/Samarth-Sharma21/WordleParty',
    demo: 'https://samarth-sharma21.github.io/WordleParty',
  },
  {
    title: 'E-Commerce Platform',
    description:
      'Fully featured online store with product catalog and payment integration.',
    tech: ['React', 'Node.js', 'MongoDB'],
    image:
      'https://images.pexels.com/photos/5076516/pexels-photo-5076516.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    images: [
      'https://images.pexels.com/photos/5076516/pexels-photo-5076516.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    ],
    github: 'https://github.com/Samarth-Sharma21/ecommerce-platform',
    demo: 'https://samarth-ecommerce.netlify.app',
  },
  {
    title: 'Quote Generator',
    description:
      'This project was created to provide you with a random, inspiring quote at the click of a button. Whether you need some motivation, wisdom, or just a thoughtful reflection, this tool has you covered.',
    tech: ['Html', 'CSS', 'Javascript'],
    image: 'public/Quote1.JPG',
    images: [
      'public/Quote1.JPG',
      'public/Quote2.JPG',
    ],
    github: 'https://github.com/Samarth-Sharma21/portfolio',
    demo: 'https://samarth-sharma.dev',
  },
  {
    title: 'Weather Dashboard',
    description:
      'Real-time weather tracking with location-based forecasts and visualization.',
    tech: ['React', 'Node.js', 'Chart.js'],
    image:
      'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    github: 'https://github.com/Samarth-Sharma21/weather-app',
    demo: 'https://samarth-weather.netlify.app',
  },
  {
    title: 'Task Management App',
    description:
      'Collaborative todo application with team features and deadline tracking.',
    tech: ['React', 'Firebase', 'Redux'],
    image:
      'https://images.pexels.com/photos/3243/pen-calendar-to-do-checklist.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    github: 'https://github.com/Samarth-Sharma21/task-manager',
    demo: 'https://samarth-tasks.web.app',
  },
];