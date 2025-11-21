export interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
  seriesName: string | null;
  tags: string[];
  createdAt: string;
}

export interface PostCreateRequest {
  title: string;
  content: string;
  slug: string;
  seriesName?: string;
  tags: string[];
  status: 'PUBLISHED' | 'DRAFT';
}

export interface UserProfile {
  name: string;
  description: string;
  avatarUrl: string;
  socials: {
    github?: string;
    instagram?: string;
    linkedin?: string;
    email?: string;
  };
}
