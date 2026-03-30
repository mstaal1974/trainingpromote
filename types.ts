export enum SocialPlatform {
  LINKEDIN = 'LinkedIn',
  TWITTER = 'Twitter',
  FACEBOOK = 'Facebook',
  INSTAGRAM = 'Instagram',
  GITLAB = 'GitLab'
}

export interface Provider {
  id: string;
  name: string;
  type: string;
  verified: boolean;
  websiteUrl?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface Course {
  id: string;
  providerId: string;
  title: string;
  category: string;
  description: string;
  students: number;
  rating: number; // 0-5 stars
  url?: string;
  learningObjectives?: string[];
  targetAudience?: string;
}

export interface ScheduledPost {
  id: string;
  platform: SocialPlatform;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  scheduledDate: string; // ISO String
  status: 'scheduled' | 'published' | 'draft';
  courseId: string;
  providerId: string;
}

export interface AnalyticsData {
  name: string;
  impressions: number;
  clicks: number;
  conversions: number;
}
