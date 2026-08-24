import {
  ActivityItem,
  Candidate,
  DashboardKpis,
  Exam,
  ExamSession,
  LiveMonitorCandidate,
  NotificationItem,
  Organization,
  Question,
  ResultRow,
  User,
} from '../models';
import { CATEGORIES, DIFFICULTIES, QUESTION_TYPES } from '../constants';

const AVATAR_COLORS = [
  '#2563EB',
  '#7C3AED',
  '#DB2777',
  '#059669',
  '#D97706',
  '#0891B2',
  '#4F46E5',
  '#DC2626',
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function pad(n: number, width = 3): string {
  return String(n).padStart(width, '0');
}

function daysAgo(days: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, (days * 7) % 60, 0, 0);
  return d.toISOString();
}

function hoursFromNow(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

export const ORG_NAMES = [
  'Microsoft Learning',
  'AWS Training',
  'Cisco Academy',
  'Google Cloud',
  'CompTIA',
  'Pearson',
  'Oracle University',
  'IBM Skills',
  'Red Hat Training',
  'Salesforce Trailhead',
  'VMware Education',
  'Linux Foundation',
  'HashiCorp Academy',
  'Kubernetes Institute',
  'Cloudflare Learn',
  'Datadog University',
  'Snowflake Education',
  'MongoDB University',
  'Elastic Training',
  'Palo Alto Networks',
  'Fortinet NSE',
  'ServiceNow University',
  'Atlassian University',
  'GitHub Skills',
];

export function buildOrganizations(): Organization[] {
  return Array.from({ length: 48 }, (_, i) => ({
    id: `org-${pad(i + 1)}`,
    name: pick(ORG_NAMES, i) + (i >= ORG_NAMES.length ? ` ${Math.floor(i / ORG_NAMES.length) + 1}` : ''),
    industry: pick(
      ['Technology', 'Education', 'Government', 'Healthcare', 'Finance', 'Certification'],
      i
    ),
    candidates: 120 + ((i * 97) % 800),
    exams: 4 + (i % 18),
    status: i % 11 === 0 ? 'Inactive' : 'Active',
  }));
}

export function buildUsers(orgs: Organization[]): User[] {
  const people = [
    ['Emily Johnson', 'Super Administrator'],
    ['Michael Chen', 'Exam Manager'],
    ['Sarah Wilson', 'Organization Administrator'],
    ['David Kim', 'Proctor'],
    ['James Miller', 'Organization Administrator'],
    ['Priya Sharma', 'Question Author'],
    ['Alex Rivera', 'Reviewer'],
    ['Olivia Martinez', 'Invigilator'],
    ['Noah Patel', 'Read Only Auditor'],
    ['Emma Thompson', 'Exam Manager'],
    ['Liam Nguyen', 'Question Author'],
    ['Sophia Brooks', 'Proctor'],
    ['Lucas Andersen', 'Organization Administrator'],
    ['Ava Johansson', 'Exam Manager'],
    ['Mason Clark', 'Question Author'],
    ['Isabella Reed', 'Reviewer'],
    ['Ethan Hughes', 'Invigilator'],
    ['Mia Foster', 'Proctor'],
    ['Logan Price', 'Exam Manager'],
    ['Charlotte Hayes', 'Question Author'],
    ['Benjamin Cole', 'Organization Administrator'],
    ['Amelia Turner', 'Reviewer'],
    ['William Scott', 'Proctor'],
    ['Harper Bennett', 'Invigilator'],
  ] as const;

  return people.map((p, i) => {
    const org = orgs[i % Math.min(orgs.length, 12)];
    return {
      id: `user-${pad(i + 1)}`,
      name: p[0],
      email: p[0].toLowerCase().replace(' ', '.') + '@evalis.io',
      role: p[1] as User['role'],
      organizationId: org.id,
      organizationName: org.name,
      status: i % 9 === 0 ? 'Invited' : i % 17 === 0 ? 'Suspended' : 'Active',
      avatarColor: pick(AVATAR_COLORS, i),
      lastActive: daysAgo(i % 5, 8 + (i % 10)),
    };
  });
}

const EXAM_DEFS: Array<Partial<Exam> & { title: string; code: string }> = [
  {
    title: 'AWS Solutions Architect Associate',
    code: 'AWS-SAA-2024',
    category: 'IT Certification',
    type: 'Certification',
    durationMinutes: 120,
    questionCount: 50,
    totalMarks: 100,
    passingMarks: 70,
    status: 'Published',
  },
  {
    title: 'CompTIA Security+',
    code: 'COMPTIA-SY0-701',
    category: 'Security',
    type: 'Certification',
    durationMinutes: 90,
    questionCount: 75,
    totalMarks: 100,
    passingMarks: 80,
    status: 'Published',
  },
  {
    title: 'Google Associate Cloud Engineer',
    code: 'GCP-ACE-2024',
    category: 'Cloud',
    type: 'Certification',
    durationMinutes: 120,
    questionCount: 100,
    totalMarks: 100,
    passingMarks: 70,
    status: 'Scheduled',
  },
  {
    title: 'Microsoft AZ-104',
    code: 'MS-AZ104',
    category: 'Cloud',
    type: 'Certification',
    durationMinutes: 120,
    questionCount: 60,
    totalMarks: 100,
    passingMarks: 700,
    status: 'Live',
  },
  {
    title: 'Cisco CCNA',
    code: 'CISCO-CCNA-200',
    category: 'Networking',
    type: 'Certification',
    durationMinutes: 120,
    questionCount: 100,
    totalMarks: 1000,
    passingMarks: 825,
    status: 'Published',
  },
  {
    title: 'Kubernetes Administrator (CKA)',
    code: 'LF-CKA-2024',
    category: 'Containers',
    type: 'Certification',
    durationMinutes: 120,
    questionCount: 20,
    totalMarks: 100,
    passingMarks: 66,
    status: 'Approved',
  },
  {
    title: 'Azure Fundamentals AZ-900',
    code: 'MS-AZ900',
    category: 'Cloud',
    type: 'Practice',
    durationMinutes: 60,
    questionCount: 40,
    totalMarks: 100,
    passingMarks: 70,
    status: 'Draft',
  },
  {
    title: 'DevOps Foundations Assessment',
    code: 'EV-DEVOPS-101',
    category: 'DevOps',
    type: 'Assessment',
    durationMinutes: 75,
    questionCount: 45,
    totalMarks: 90,
    passingMarks: 63,
    status: 'Under Review',
  },
  {
    title: 'Linux System Administration',
    code: 'LF-LSA-201',
    category: 'Linux',
    type: 'Training',
    durationMinutes: 90,
    questionCount: 55,
    totalMarks: 100,
    passingMarks: 70,
    status: 'Completed',
  },
  {
    title: 'AI Ethics & Governance',
    code: 'EV-AI-ETH-01',
    category: 'AI',
    type: 'Compliance',
    durationMinutes: 45,
    questionCount: 30,
    totalMarks: 60,
    passingMarks: 48,
    status: 'Published',
  },
  {
    title: 'Database Design Fundamentals',
    code: 'EV-DB-100',
    category: 'Database',
    type: 'Placement',
    durationMinutes: 80,
    questionCount: 50,
    totalMarks: 100,
    passingMarks: 65,
    status: 'Archived',
  },
  {
    title: 'Zero Trust Security Essentials',
    code: 'EV-SEC-ZT-01',
    category: 'Security',
    type: 'Training',
    durationMinutes: 60,
    questionCount: 35,
    totalMarks: 70,
    passingMarks: 49,
    status: 'Published',
  },
];

export function buildExams(orgs: Organization[]): Exam[] {
  return EXAM_DEFS.map((def, i) => ({
    id: `exam-${pad(i + 1)}`,
    title: def.title,
    code: def.code,
    description: `${def.title} — enterprise certification / assessment blueprint aligned to current exam outline. Includes scenario items and practical knowledge checks.`,
    category: def.category || 'General',
    type: def.type || 'Assessment',
    language: 'English',
    totalMarks: def.totalMarks || 100,
    passingMarks: def.passingMarks || 70,
    durationMinutes: def.durationMinutes || 90,
    questionCount: def.questionCount || 40,
    negativeMarking: i % 3 === 0,
    negativeValue: 0.25,
    shuffleQuestions: true,
    shuffleAnswers: i % 2 === 0,
    attemptsAllowed: i % 4 === 0 ? 1 : 2,
    showResults: 'After Exam',
    status: def.status || 'Draft',
    organizationIds: [orgs[i % 8].id, orgs[(i + 3) % 8].id],
    questionIds: [],
    scheduledStart: hoursFromNow(24 + i * 6),
    scheduledEnd: hoursFromNow(28 + i * 6),
    createdBy: 'Emily Johnson',
    updatedAt: daysAgo(i % 6, 14),
    version: `3.${i + 1}`,
  }));
}

const STEMS = [
  'Which of the following AWS services is primarily used for identity and access management?',
  'What is the default port used by HTTPS traffic?',
  'In Kubernetes, which object ensures a desired number of pod replicas is running?',
  'Which Azure service provides managed relational databases?',
  'What does the principle of least privilege recommend?',
  'Which TCP flag is used to initiate a three-way handshake?',
  'Which Google Cloud service is best for serverless event-driven functions?',
  'What is the purpose of a network ACL in a VPC?',
  'Which storage class is intended for infrequently accessed objects?',
  'What metric is most relevant when sizing an autoscaling group?',
  'Which DevOps practice shortens feedback loops between commit and production?',
  'What is the primary benefit of infrastructure as code?',
  'Which encryption approach protects data at rest in cloud object storage?',
  'What does MFA stand for in authentication systems?',
  'Which Linux command lists open network sockets?',
  'What is a blue/green deployment designed to reduce?',
  'Which protocol is commonly used for secure remote shell access?',
  'What is the role of a CDN in application architecture?',
  'Which database isolation level prevents dirty reads?',
  'What is the purpose of a readiness probe in Kubernetes?',
];

export function buildQuestions(): Question[] {
  const count = 240;
  return Array.from({ length: count }, (_, i) => {
    const type = pick(
      [
        'Multiple Choice',
        'Multiple Response',
        'True / False',
        'Essay',
        'Fill in Blank',
        'Multiple Choice',
        'Multiple Choice',
      ] as const,
      i
    );
    const labels = ['A', 'B', 'C', 'D'];
    const optionTexts = [
      'AWS IAM',
      'Amazon S3',
      'Amazon EC2',
      'Amazon CloudFront',
      'True',
      'False',
      'Deployment',
      'Service',
      'ConfigMap',
      'Ingress',
    ];
    const options =
      type === 'Essay' || type === 'Fill in Blank'
        ? []
        : type === 'True / False'
          ? [
              { id: `opt-${i}-1`, label: 'A', text: 'True', isCorrect: i % 2 === 0 },
              { id: `opt-${i}-2`, label: 'B', text: 'False', isCorrect: i % 2 !== 0 },
            ]
          : labels.map((label, oi) => ({
              id: `opt-${i}-${oi}`,
              label,
              text: pick(optionTexts, i + oi),
              isCorrect: type === 'Multiple Response' ? oi < 2 : oi === 1,
            }));

    return {
      id: `q-${pad(i + 1, 4)}`,
      stem: pick(STEMS, i) + (i > 19 ? ` (variant ${i})` : ''),
      type,
      difficulty: pick(DIFFICULTIES, i),
      category: pick(CATEGORIES, i),
      tags: [pick(['aws', 'iam', 'security', 'cloud', 'k8s', 'network', 'devops', 'linux'], i), pick(['exam', 'core', 'scenario'], i + 3)],
      marks: type === 'Essay' ? 5 : 1 + (i % 3),
      options,
      explanation:
        'Correct answer reflects the service or concept aligned with the official exam guide. Review the associated documentation for deeper rationale.',
      status: i % 15 === 0 ? 'Draft' : i % 40 === 0 ? 'Archived' : 'Published',
      usageCount: (i * 3) % 120,
      createdBy: pick(['Priya Sharma', 'Liam Nguyen', 'Emily Johnson', 'Charlotte Hayes'], i),
      updatedAt: daysAgo(i % 20, 11),
      version: `1.${(i % 9) + 1}`,
      versions: [
        {
          version: `1.${(i % 9) + 1}`,
          updatedAt: daysAgo(i % 20, 11),
          updatedBy: 'Priya Sharma',
          note: 'Updated distractors for clarity',
        },
        {
          version: `1.${Math.max(1, (i % 9))}`,
          updatedAt: daysAgo((i % 20) + 4, 9),
          updatedBy: 'Liam Nguyen',
          note: 'Initial published version',
        },
      ],
    };
  });
}

const FIRST = [
  'John',
  'Emma',
  'Olivia',
  'Liam',
  'Sophia',
  'Noah',
  'Ava',
  'Mason',
  'Isabella',
  'Ethan',
  'Mia',
  'Lucas',
  'Harper',
  'James',
  'Amelia',
  'Benjamin',
  'Charlotte',
  'Henry',
  'Evelyn',
  'Alexander',
  'Ella',
  'Daniel',
  'Scarlett',
  'Matthew',
  'Grace',
];
const LAST = [
  'Carter',
  'Davis',
  'Brown',
  'Wilson',
  'Moore',
  'Taylor',
  'Anderson',
  'Thomas',
  'Jackson',
  'White',
  'Harris',
  'Martin',
  'Thompson',
  'Garcia',
  'Martinez',
  'Robinson',
  'Clark',
  'Rodriguez',
  'Lewis',
  'Lee',
  'Walker',
  'Hall',
  'Allen',
  'Young',
  'King',
];

export function buildCandidates(orgs: Organization[], exams: Exam[]): Candidate[] {
  const statuses: Candidate['status'][] = [
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
  return Array.from({ length: 48 }, (_, i) => {
    const org = orgs[i % 12];
    const exam = exams[i % exams.length];
    const status = pick(statuses, i);
    const score =
      status === 'Passed' || status === 'Failed' || status === 'Completed'
        ? 55 + ((i * 13) % 45)
        : undefined;
    return {
      id: `cand-${pad(i + 1)}`,
      firstName: pick(FIRST, i),
      lastName: pick(LAST, i + 5),
      email: `${pick(FIRST, i).toLowerCase()}.${pick(LAST, i + 5).toLowerCase()}@example.com`,
      phone: `+1 (555) ${100 + (i % 900)}-${1000 + ((i * 17) % 9000)}`,
      dateOfBirth: `19${70 + (i % 30)}-${pad((i % 12) + 1, 2)}-${pad((i % 28) + 1, 2)}`,
      gender: pick(['Male', 'Female', 'Non-binary', 'Prefer not to say'], i),
      address: `${100 + i} Market Street`,
      city: pick(['New York', 'Seattle', 'Austin', 'London', 'Toronto', 'Berlin', 'Singapore'], i),
      country: pick(['United States', 'United Kingdom', 'Canada', 'Germany', 'Singapore'], i),
      organizationId: org.id,
      organizationName: org.name,
      department: pick(
        ['Engineering', 'Security Operations', 'Cloud Infrastructure', 'Learning & Development'],
        i
      ),
      examIds: [exam.id],
      examTitles: [exam.title],
      status,
      score,
      avatarColor: pick(AVATAR_COLORS, i),
      registeredAt: daysAgo(i % 30, 9),
      groupName: pick(['Cohort Alpha', 'Cohort Beta', 'Enterprise Track', 'Partner Track'], i),
    };
  });
}

export function buildSessions(exams: Exam[]): ExamSession[] {
  const rooms = [
    'Hall A',
    'Hall B',
    'Lab 3',
    'Virtual Room East',
    'Virtual Room West',
    'Proctor Suite 1',
    'Proctor Suite 2',
    'Conference Center North',
    'Conference Center South',
    'Remote Cohort Alpha',
  ];
  const invigilators = [
    'David Kim',
    'Sophia Brooks',
    'Mia Foster',
    'Olivia Martinez',
    'Ethan Hughes',
    'William Scott',
  ];
  const hourSlots = [8, 9, 10, 11, 13, 14, 15, 16];
  const sessions: ExamSession[] = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let idx = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    // denser weekdays, lighter weekends — still at least one session most days
    const dow = new Date(year, month, day).getDay();
    const isWeekend = dow === 0 || dow === 6;
    const count = isWeekend ? 1 + (day % 2) : 2 + (day % 3);
    for (let s = 0; s < count; s++) {
      const exam = exams[idx % exams.length];
      const start = new Date(year, month, day, hourSlots[(idx + s) % hourSlots.length], idx % 2 === 0 ? 0 : 30, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + exam.durationMinutes);
      const statusPool: ExamSession['status'][] =
        start < today
          ? ['Completed', 'Completed', 'Live']
          : start.toDateString() === today.toDateString()
            ? ['Live', 'Scheduled', 'Scheduled']
            : ['Scheduled', 'Scheduled', 'Scheduled'];
      sessions.push({
        id: `sess-${pad(idx + 1, 3)}`,
        examId: exam.id,
        examTitle: exam.title,
        room: pick(rooms, idx + s),
        capacity: 40 + ((idx * 3) % 5) * 20,
        enrolled: 10 + ((idx * 11) % 70),
        start: start.toISOString(),
        end: end.toISOString(),
        invigilator: pick(invigilators, idx),
        status: pick(statusPool, idx),
      });
      idx += 1;
    }
  }

  // spill a few into next month for continuity
  for (let d = 1; d <= 5; d++) {
    const exam = exams[d % exams.length];
    const start = new Date(year, month + 1, d, 9 + (d % 4), 0, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + exam.durationMinutes);
    sessions.push({
      id: `sess-${pad(idx + 1, 3)}`,
      examId: exam.id,
      examTitle: exam.title,
      room: pick(rooms, d),
      capacity: 80,
      enrolled: 20 + d * 5,
      start: start.toISOString(),
      end: end.toISOString(),
      invigilator: pick(invigilators, d),
      status: 'Scheduled',
    });
    idx += 1;
  }

  return sessions;
}

export function buildLiveCandidates(exams: Exam[]): LiveMonitorCandidate[] {
  const states: LiveMonitorCandidate['state'][] = [
    'Online',
    'Online',
    'Online',
    'Warning',
    'Disconnected',
    'Suspicious',
  ];
  return Array.from({ length: 24 }, (_, i) => ({
    id: `live-${pad(i + 1)}`,
    name: `${pick(FIRST, i + 3)} ${pick(LAST, i + 8)}`,
    examTitle: pick(exams, i).title,
    progress: 10 + ((i * 11) % 90),
    timeRemainingMinutes: 15 + ((i * 5) % 90),
    state: pick(states, i),
    alerts: i % 5 === 0 ? 2 : i % 3 === 0 ? 1 : 0,
    lastActivity: `${(i % 4) + 1}m ago`,
  }));
}

export function buildResults(candidates: Candidate[], exams: Exam[]): ResultRow[] {
  return candidates
    .filter((c) => c.score != null)
    .map((c, i) => {
      const max = 100;
      const percent = c.score!;
      return {
        id: `res-${pad(i + 1)}`,
        candidateName: `${c.firstName} ${c.lastName}`,
        examTitle: c.examTitles[0] || pick(exams, i).title,
        score: percent,
        maxScore: max,
        percent,
        status: percent >= 70 ? 'Passed' : 'Failed',
        completedAt: daysAgo(i % 10, 16),
        organizationName: c.organizationName,
      };
    });
}

export function buildActivity(): ActivityItem[] {
  const actions = [
    ['Emily Johnson', 'published exam', 'AWS Solutions Architect Associate'],
    ['Michael Chen', 'approved question set', 'Security+ Domain 2'],
    ['Priya Sharma', 'updated question', 'q-0042 IAM policies'],
    ['David Kim', 'raised proctoring alert', 'Candidate #118'],
    ['Sarah Wilson', 'invited candidates', 'Cohort Beta (24)'],
    ['James Miller', 'rotated API key', 'org-integration-prod'],
    ['Alex Rivera', 'completed review', 'DevOps Foundations'],
    ['Emma Thompson', 'scheduled session', 'Hall A — AZ-104'],
    ['Liam Nguyen', 'imported question bank', '120 items'],
    ['Olivia Martinez', 'checked in candidates', 'Lab 3'],
  ] as const;
  return actions.map((a, i) => ({
    id: `act-${pad(i + 1)}`,
    actor: a[0],
    action: a[1],
    target: a[2],
    at: daysAgo(0, 8 + i),
  }));
}

export function buildNotifications(): NotificationItem[] {
  return [
    {
      id: 'n1',
      title: 'Live exam capacity warning',
      body: 'Hall B is at 92% capacity for AZ-104 session.',
      at: daysAgo(0, 9),
      read: false,
    },
    {
      id: 'n2',
      title: 'Question review requested',
      body: '8 Security+ items await reviewer approval.',
      at: daysAgo(0, 8),
      read: false,
    },
    {
      id: 'n3',
      title: 'Certificate batch ready',
      body: '46 certificates ready for CompTIA Security+.',
      at: daysAgo(1, 15),
      read: true,
    },
    {
      id: 'n4',
      title: 'SSO configuration updated',
      body: 'Microsoft Learning IdP metadata refreshed.',
      at: daysAgo(1, 11),
      read: true,
    },
    {
      id: 'n5',
      title: 'Suspicious activity detected',
      body: 'Multiple tab switches detected for Liam Wilson.',
      at: daysAgo(0, 10),
      read: false,
    },
  ];
}

export const DASHBOARD_KPIS: DashboardKpis = {
  activeExams: 128,
  questionBank: 24816,
  candidates: 18432,
  organizations: 84,
  upcomingExams: 23,
  todaysSessions: 41,
};

export function createSeed() {
  const organizations = buildOrganizations();
  const users = buildUsers(organizations);
  const exams = buildExams(organizations);
  const questions = buildQuestions();
  exams.forEach((exam, i) => {
    exam.questionIds = questions.slice(i * 5, i * 5 + exam.questionCount).map((q) => q.id);
    if (exam.questionIds.length < exam.questionCount) {
      exam.questionIds = questions.slice(0, Math.min(exam.questionCount, questions.length)).map((q) => q.id);
    }
  });
  const candidates = buildCandidates(organizations, exams);
  const sessions = buildSessions(exams);
  const liveCandidates = buildLiveCandidates(exams);
  const results = buildResults(candidates, exams);
  const activity = buildActivity();
  const notifications = buildNotifications();
  return {
    organizations,
    users,
    exams,
    questions,
    candidates,
    sessions,
    liveCandidates,
    results,
    activity,
    notifications,
    kpis: DASHBOARD_KPIS,
  };
}

export type SeedData = ReturnType<typeof createSeed>;
