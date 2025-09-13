export interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  codePanelRatio: number;
  language: string;
  notifications: boolean;
}

export interface CodeSnippet {
  id: string;
  title: string;
  content: string;
  language: string;
  description?: string;
  isPublic: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningProgress {
  id: string;
  userId: string;
  chapterId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

