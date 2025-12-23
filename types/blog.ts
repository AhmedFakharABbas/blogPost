export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  published: boolean;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export type BlogFormData = {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  published: boolean;
  category: string;
  tags: string[];
};