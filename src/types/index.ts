// Re-export Prisma types with aliases to avoid conflicts
export type {
  User as DbUser,
  Project as DbProject,
  InterviewSession as DbInterviewSession,
  PRDDocument as DbPRDDocument,
  ApiUsage,
  Feedback,
} from '@prisma/client';

// Application types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  planType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  name?: string;
  initialIdea: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Extended types
export interface UserWithProjects extends User {
  projects: Project[];
}

export interface ProjectWithDetails extends Project {
  user: User;
  interviewSession?: InterviewSession;
  prdDocuments: PRDDocument[];
}

// Interview types
export interface Question {
  id: string;
  question: string;
  type: 'text' | 'select' | 'checkbox';
  options?: string[];
  explanation?: string;
}

export interface Answer {
  questionId: string;
  answer: string | string[];
}

export interface InterviewSession {
  id: string;
  projectId: string;
  questions: Question[];
  answers: Answer[];
  currentStep: number;
  completedAt?: Date;
  createdAt: Date;
}

// PRD types
export interface PRDSection {
  id: string;
  title: string;
  content: string;
  category:
    | 'frontend'
    | 'backend'
    | 'database'
    | 'security'
    | 'seo'
    | 'publish';
  cards: PRDCard[];
}

export interface PRDCard {
  id: string;
  title: string;
  description: string;
  implementationCode?: string;
  referenceLinks?: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedHours?: number;
}

export interface PRDDocument {
  id: string;
  projectId: string;
  sections: PRDSection[];
  version: number;
  generatedAt: Date;
}

// API types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Idea Analysis types
export interface IdeaAnalysis {
  category: string;
  targetUsers: string;
  coreValue: string;
  complexityLevel: number;
  similarServices: string[];
  keyQuestions: string[];
}

export interface FeasibilityScore {
  technical: number;
  market: number;
  resources: number;
  overall: number;
  reasoning: string;
}