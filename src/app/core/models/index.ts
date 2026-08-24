export type ExamStatus =
  | 'Draft'
  | 'Under Review'
  | 'Approved'
  | 'Published'
  | 'Scheduled'
  | 'Live'
  | 'Completed'
  | 'Archived';

export type CandidateStatus =
  | 'Registered'
  | 'Verified'
  | 'Invited'
  | 'Scheduled'
  | 'Checked In'
  | 'Taking Exam'
  | 'Completed'
  | 'Passed'
  | 'Failed'
  | 'Disqualified';

export type QuestionType =
  | 'Multiple Choice'
  | 'Multiple Response'
  | 'True / False'
  | 'Essay'
  | 'Fill in Blank'
  | 'Drag & Drop'
  | 'Matching'
  | 'Ordering'
  | 'Hotspot'
  | 'Code Editor'
  | 'Case Study';

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export type UserRole =
  | 'Super Administrator'
  | 'Organization Administrator'
  | 'Exam Manager'
  | 'Question Author'
  | 'Reviewer'
  | 'Proctor'
  | 'Invigilator'
  | 'Candidate'
  | 'Read Only Auditor';

export type LiveCandidateState = 'Online' | 'Disconnected' | 'Warning' | 'Suspicious';

export interface Organization {
  id: string;
  name: string;
  industry: string;
  candidates: number;
  exams: number;
  status: 'Active' | 'Inactive';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  status: 'Active' | 'Invited' | 'Suspended';
  avatarColor: string;
  lastActive: string;
}

export interface Exam {
  id: string;
  title: string;
  code: string;
  description: string;
  category: string;
  type: string;
  language: string;
  totalMarks: number;
  passingMarks: number;
  durationMinutes: number;
  questionCount: number;
  negativeMarking: boolean;
  negativeValue: number;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  attemptsAllowed: number;
  showResults: string;
  status: ExamStatus;
  organizationIds: string[];
  questionIds: string[];
  scheduledStart?: string;
  scheduledEnd?: string;
  createdBy: string;
  updatedAt: string;
  version: string;
}

export interface AnswerOption {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionVersion {
  version: string;
  updatedAt: string;
  updatedBy: string;
  note: string;
}

export interface Question {
  id: string;
  stem: string;
  type: QuestionType;
  difficulty: Difficulty;
  category: string;
  tags: string[];
  marks: number;
  options: AnswerOption[];
  explanation: string;
  status: 'Draft' | 'Published' | 'Archived';
  usageCount: number;
  createdBy: string;
  updatedAt: string;
  version: string;
  versions: QuestionVersion[];
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  country: string;
  organizationId: string;
  organizationName: string;
  department: string;
  examIds: string[];
  examTitles: string[];
  status: CandidateStatus;
  score?: number;
  avatarColor: string;
  registeredAt: string;
  groupName: string;
}

export interface ExamSession {
  id: string;
  examId: string;
  examTitle: string;
  room: string;
  capacity: number;
  enrolled: number;
  start: string;
  end: string;
  invigilator: string;
  status: 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
}

export interface LiveMonitorCandidate {
  id: string;
  name: string;
  examTitle: string;
  progress: number;
  timeRemainingMinutes: number;
  state: LiveCandidateState;
  alerts: number;
  lastActivity: string;
}

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
}

export interface ResultRow {
  id: string;
  candidateName: string;
  examTitle: string;
  score: number;
  maxScore: number;
  percent: number;
  status: 'Passed' | 'Failed';
  completedAt: string;
  organizationName: string;
}

export interface DashboardKpis {
  activeExams: number;
  questionBank: number;
  candidates: number;
  organizations: number;
  upcomingExams: number;
  todaysSessions: number;
}
