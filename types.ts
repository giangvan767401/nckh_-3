
export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'INSTRUCTOR'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  price: number;
  description: string;
  lessons: Lesson[];
  activeModelId?: string;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'VIDEO' | 'QUIZ';
  videoUrl?: string;
  duration: string;
  content: string;
  order: number;
}

export interface MLPredictionParams {
  student_id: string;
  session_id: string;
  timestamp: number;
  module_id: string;
  time_spent_minutes: number;
  pages_visited: number;
  video_watched_percent: number;
  click_events: number;
  notes_taken: number;
  forum_posts: number;
  revisit_flag: boolean;
  quiz_score: number;
  attempts_taken: number;
  assignment_score: number;
  feedback_rating: number;
  days_since_last_activity: number;
  cumulative_quiz_score: number;
  learning_trend: 'improving' | 'stable' | 'declining';
  attention_score: number;
  feedback_type: string;
  next_module_prediction?: string;
  success_label?: boolean;
}
