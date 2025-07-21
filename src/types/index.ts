export interface Project {
  title: string;
  description: string;
  tech: string[];
  image: string;
  images?: string[]; // Optional array for slideshow
  github: string;
  demo: string;
}