import {
  CandidateStatus,
  Difficulty,
  ExamStatus,
  QuestionType,
  UserRole,
} from '../models';

export const EXAM_STATUSES: ExamStatus[] = [
  'Draft',
  'Under Review',
  'Approved',
  'Published',
  'Scheduled',
  'Live',
  'Completed',
  'Archived',
];

export const CANDIDATE_STATUSES: CandidateStatus[] = [
  'Registered',
  'Verified',
  'Invited',
  'Scheduled',
  'Checked In',
  'Taking Exam',
  'Completed',
  'Passed',
  'Failed',
  'Disqualified',
];

export const QUESTION_TYPES: QuestionType[] = [
  'Multiple Choice',
  'Multiple Response',
  'True / False',
  'Essay',
  'Fill in Blank',
  'Drag & Drop',
  'Matching',
  'Ordering',
  'Hotspot',
  'Code Editor',
  'Case Study',
];

export const FULLY_SUPPORTED_QUESTION_TYPES: QuestionType[] = [
  'Multiple Choice',
  'Multiple Response',
  'True / False',
  'Fill in Blank',
  'Essay',
];

export const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard', 'Expert'];

export const CATEGORIES = [
  'Networking',
  'Cloud',
  'Programming',
  'Security',
  'Database',
  'AI',
  'DevOps',
  'Linux',
  'Containers',
  'Architecture',
  'AWS Security',
  'Identity & Access',
  'Compliance',
  'Data Engineering',
  'Kubernetes',
  'Observability',
  'IAM',
  'Storage',
  'Compute',
  'Governance',
  'IT Certification',
  'General',
];

export const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Japanese',
  'Chinese (Simplified)',
  'Korean',
  'Arabic',
  'Hindi',
  'Italian',
  'Dutch',
  'Polish',
  'Turkish',
  'Vietnamese',
  'Thai',
  'Indonesian',
  'Russian',
  'Swedish',
  'Norwegian',
  'Danish',
  'Finnish',
];

export const EXAM_TYPES = [
  'Certification',
  'Practice',
  'Assessment',
  'Placement',
  'Compliance',
  'Training',
  'Entrance',
  'Promotion',
];

export const SHOW_RESULTS_OPTIONS = [
  'Immediately',
  'After Exam',
  'After Review',
  'Manual Release',
  'Never',
];

export const ROLES: UserRole[] = [
  'Super Administrator',
  'Organization Administrator',
  'Exam Manager',
  'Question Author',
  'Reviewer',
  'Proctor',
  'Invigilator',
  'Candidate',
  'Read Only Auditor',
];

export const PERMISSIONS = [
  'Create Exams',
  'Publish Exams',
  'Delete Exams',
  'Manage Candidates',
  'View Reports',
  'Manage Organizations',
  'Manage Users',
  'Export Results',
  'Generate Certificates',
  'Manage Settings',
];

export const ROLE_PERMISSION_MATRIX: Record<UserRole, string[]> = {
  'Super Administrator': [...PERMISSIONS],
  'Organization Administrator': [
    'Create Exams',
    'Publish Exams',
    'Manage Candidates',
    'View Reports',
    'Manage Users',
    'Export Results',
    'Generate Certificates',
    'Manage Settings',
  ],
  'Exam Manager': [
    'Create Exams',
    'Publish Exams',
    'Manage Candidates',
    'View Reports',
    'Export Results',
  ],
  'Question Author': ['Create Exams', 'View Reports'],
  Reviewer: ['View Reports'],
  Proctor: ['Manage Candidates', 'View Reports'],
  Invigilator: ['Manage Candidates'],
  Candidate: [],
  'Read Only Auditor': ['View Reports'],
};

export const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Germany',
  'India',
  'Australia',
  'Singapore',
  'Japan',
  'Brazil',
  'France',
  'Netherlands',
  'UAE',
  'South Korea',
  'Spain',
  'Italy',
  'Mexico',
  'South Africa',
  'Sweden',
  'Ireland',
  'New Zealand',
  'Poland',
  'Switzerland',
];

export const DEPARTMENTS = [
  'Engineering',
  'Security Operations',
  'Cloud Infrastructure',
  'Learning & Development',
  'IT Support',
  'Product',
  'Sales Enablement',
  'Compliance',
  'Data Science',
  'DevOps',
  'Customer Success',
  'HR',
];

export const ROOMS = [
  'Hall A — Capacity 120',
  'Hall B — Capacity 80',
  'Lab 3 — Capacity 40',
  'Virtual Room East',
  'Virtual Room West',
  'Proctor Suite 1',
  'Proctor Suite 2',
  'Conference Center North',
  'Conference Center South',
  'Remote Cohort Alpha',
  'Remote Cohort Beta',
  'Overflow Room C',
];
