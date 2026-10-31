export type ProjectCategory = 'web' | 'ai' | 'tools';

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: readonly string[];
  image: string | null;
  images: readonly string[];
  github: string;
  demo: string | null;
  featured: boolean;
  category: ProjectCategory;
}
