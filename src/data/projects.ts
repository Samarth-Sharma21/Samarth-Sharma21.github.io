import { Project } from '../types';

export const projects: Project[] = [
  {
    title: 'ReKindle',
    description:
      'Memory-sharing app for dementia patients with collaborative family features.',
    tech: ['React', 'Node.js', 'Supabase'],
    image: '/Rekindle2.JPG',
    images: [
      '/Rekindle1.JPG',
      '/Rekindle2.JPG',
      '/Rekindle3.JPG',
    ],
    github: 'https://github.com/Samarth-Sharma21/ReKindle',
    demo: 'https://samarth-sharma21.github.io/ReKindle',
  },
  {
    title: 'WordleParty',
    description:
      'A real-time multiplayer Wordle game built with React and Vite. Create or join rooms and race to guess the word first — no login required.',
    tech: ['React', 'WebRTC'],
    image: '/Wordle1.JPG',
    images: ['/Wordle1.JPG', '/Wordle2.JPG', '/Wordle3.JPG'],
    github: 'https://github.com/Samarth-Sharma21/WordleParty',
    demo: 'https://samarth-sharma21.github.io/WordleParty',
  },
  {
    title: 'Ai Therapist',
    description:
      'Currently working on this project.',
    tech: ['React', 'Llama Api'],
    image:
      '/AiTherpist1.JPG',
    images: [
      '/AiTherapist1.JPG',
      '/AiTherapist2.JPG'],
    github: 'https://github.com/Samarth-Sharma21/AI_Therapist',
    demo: '',
  },
  {
    title: 'Quote Generator',
    description:
      'This project was created to provide you with a random, inspiring quote at the click of a button. Whether you need some motivation, wisdom, or just a thoughtful reflection, this tool has you covered.',
    tech: ['Html', 'CSS', 'Javascript'],
    image: '/Quote1.JPG',
    images: [
      '/Quote1.JPG',
      '/Quote2.JPG',
    ],
    github: 'https://github.com/Samarth-Sharma21/portfolio',
    demo: 'https://samarth-sharma.dev',
  },
  {
    title: 'Sign Language Detection',
    description:
      'This project uses a Multi-Layer Perceptron (MLP) model to detect Sign language. It is trained on the a custom dataset.',
    tech: ['Python', 'MediaPipe', 'TensorFlow'],
    image:
      '',
    github: 'https://github.com/Samarth-Sharma21/SignLanguageDetection',
    demo: '',
  },
];