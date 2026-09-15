export const DEFAULT_USER = {
  id: 'usr-student-01',
  name: 'Alex Chen',
  email: 'alex.chen@university.edu',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  createdAt: '2026-09-01T08:00:00.000Z',
  preferences: {
    timeFormat: '12h',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
    weekStart: 'monday',
    priorityWeights: { academic: 60, personal: 25, goals: 15 },
    defaultPriority: 'Medium',
    notificationsEnabled: true,
    notify5MinBefore: true,
    notify1MinBefore: true,
    notifyAtStart: true,
    notifyOverdue: true,
    notifySleepWindDown: true,
    soundEnabled: true,
    theme: 'light',
  },
};

export const INITIAL_USER = DEFAULT_USER;
export const INITIAL_PREFERENCES = DEFAULT_USER.preferences;

export const INITIAL_SUBJECTS = [
  { id: 'sub-dbms', code: 'CS301', name: 'Database Management Systems', color: '#3b82f6', instructor: 'Dr. Michael Hansen', room: 'Hall B-204' },
  { id: 'sub-algo', code: 'CS304', name: 'Design & Analysis of Algorithms', color: '#8b5cf6', instructor: 'Prof. Elena Rostova', room: 'Turing Hall 101' },
  { id: 'sub-math', code: 'MATH215', name: 'Linear Algebra & Optimization', color: '#10b981', instructor: 'Dr. Sarah Lin', room: 'Math Building 312' },
  { id: 'sub-hum', code: 'HUM102', name: 'Technical Writing & Ethics', color: '#f59e0b', instructor: 'Prof. David Vance', room: 'Arts Complex 405' },
];

export const INITIAL_TIMETABLE = [
  { id: 'tt-1', subjectId: 'sub-dbms', dayOfWeek: 1, startTime: '09:00', endTime: '10:30', room: 'Hall B-204', type: 'Lecture' },
  { id: 'tt-2', subjectId: 'sub-algo', dayOfWeek: 1, startTime: '11:00', endTime: '12:30', room: 'Turing Hall 101', type: 'Lecture' },
  { id: 'tt-3', subjectId: 'sub-math', dayOfWeek: 1, startTime: '14:00', endTime: '15:30', room: 'Math Building 312', type: 'Lecture' },
  { id: 'tt-4', subjectId: 'sub-dbms', dayOfWeek: 2, startTime: '10:00', endTime: '12:00', room: 'CS Lab 3', type: 'Lab' },
  { id: 'tt-5', subjectId: 'sub-hum', dayOfWeek: 2, startTime: '13:30', endTime: '15:00', room: 'Arts Complex 405', type: 'Seminar' },
  { id: 'tt-6', subjectId: 'sub-dbms', dayOfWeek: 3, startTime: '09:00', endTime: '10:30', room: 'Hall B-204', type: 'Lecture' },
  { id: 'tt-7', subjectId: 'sub-algo', dayOfWeek: 3, startTime: '11:00', endTime: '12:30', room: 'Turing Hall 101', type: 'Lecture' },
  { id: 'tt-8', subjectId: 'sub-algo', dayOfWeek: 3, startTime: '15:00', endTime: '17:00', room: 'CS Lab 2', type: 'Lab' },
  { id: 'tt-9', subjectId: 'sub-math', dayOfWeek: 4, startTime: '10:00', endTime: '11:30', room: 'Math Building 312', type: 'Lecture' },
  { id: 'tt-10', subjectId: 'sub-hum', dayOfWeek: 4, startTime: '13:30', endTime: '15:00', room: 'Arts Complex 405', type: 'Seminar' },
  { id: 'tt-11', subjectId: 'sub-algo', dayOfWeek: 5, startTime: '09:30', endTime: '11:00', room: 'Turing Hall 101', type: 'Lecture' },
  { id: 'tt-12', subjectId: 'sub-math', dayOfWeek: 5, startTime: '11:30', endTime: '13:00', room: 'Math Lab 1', type: 'Tutorial' },
];

export const INITIAL_ACADEMIC_WORKS = [
  { id: 'ac-1', subjectId: 'sub-dbms', title: 'DBMS Midterm Exam Preparation & SQL Queries', type: 'Exam', priority: 'High', estimatedMinutes: 120, dueDate: '2026-09-18', dueTime: '10:00', status: 'In Progress', linkedGoalId: 'goal-gpa', notes: 'Cover B+ trees, query normalization up to BCNF, ACID properties, and transaction isolation levels.', createdAt: '2026-09-10T10:00:00.000Z' },
  { id: 'ac-2', subjectId: 'sub-algo', title: 'Dynamic Programming Problem Set 3', type: 'Assignment', priority: 'High', estimatedMinutes: 90, dueDate: '2026-09-16', dueTime: '23:59', status: 'In Progress', linkedGoalId: 'goal-internship', notes: 'Problems: Knapsack variations, Longest Common Subsequence, Matrix Chain Multiplication.', createdAt: '2026-09-11T12:00:00.000Z' },
  { id: 'ac-3', subjectId: 'sub-dbms', title: 'Relational Schema Optimization Milestone', type: 'Project', priority: 'Medium', estimatedMinutes: 150, dueDate: '2026-09-25', dueTime: '17:00', status: 'Pending', linkedGoalId: 'goal-internship', notes: 'Benchmark indexing on 1M rows using PostgreSQL explain analyze.', createdAt: '2026-09-08T09:00:00.000Z' },
  { id: 'ac-4', subjectId: 'sub-math', title: 'Eigenvalues & SVD Practice Workshop', type: 'Study Session', priority: 'Medium', estimatedMinutes: 60, dueDate: '2026-09-15', dueTime: '16:00', status: 'Pending', notes: 'Focus on geometric interpretation of singular values and PCA projection.', createdAt: '2026-09-12T08:00:00.000Z' },
];

export const INITIAL_PERSONAL_WORKS = [
  { id: 'pw-sleep', title: 'Restorative Sleep & Recovery Block', category: 'Sleep', priority: 'High', estimatedMinutes: 480, startTime: '23:00', endTime: '07:00', isRecurring: true, recurringDays: [0, 1, 2, 3, 4, 5, 6], windDownMinutes: 30, notes: 'Screens off at 10:30 PM. Reading or light stretching before sleep.', status: 'Scheduled', createdAt: '2026-09-01T00:00:00.000Z' },
  { id: 'pw-gym', title: 'Strength Training & Cardio at Campus Gym', category: 'Exercise', priority: 'Medium', estimatedMinutes: 60, startTime: '07:30', endTime: '08:30', isRecurring: true, recurringDays: [1, 3, 5], notes: 'Push/pull workout and 15 min cool-down cycle.', status: 'Scheduled', createdAt: '2026-09-01T00:00:00.000Z' },
  { id: 'pw-meal', title: 'Nutritious Meal Prep & Dinner', category: 'Meal', priority: 'Low', estimatedMinutes: 45, startTime: '19:00', endTime: '19:45', isRecurring: true, recurringDays: [0, 1, 2, 3, 4, 5, 6], notes: 'High protein dinner and prepare lunch box for tomorrow.', status: 'Scheduled', createdAt: '2026-09-01T00:00:00.000Z' },
  { id: 'pw-chore', title: 'Room Organization & Laundry', category: 'Chore', priority: 'Low', estimatedMinutes: 45, scheduledDate: '2026-09-13', startTime: '16:00', endTime: '16:45', isRecurring: false, notes: 'Fold clean laundry, desk tidy, take out recycling.', status: 'Scheduled', createdAt: '2026-09-12T09:00:00.000Z' },
];

export const INITIAL_GOALS = [
  {
    id: 'goal-internship', title: 'Master Python & Data Structures for Summer Tech Internships',
    description: 'Solve 150 LeetCode patterns, build two production-grade backend projects, and prepare for technical interviews.',
    type: 'Career', priority: 'High', targetDate: '2026-11-30', status: 'In Progress', progressPercent: 62,
    milestones: [
      { id: 'gm-1', title: 'Complete Python OOP & Advanced Iterators', completed: true, completedAt: '2026-09-05' },
      { id: 'gm-2', title: 'Solve 50 Blind 75 LeetCode problems (DP & Graphs)', completed: true, completedAt: '2026-09-11' },
      { id: 'gm-3', title: 'Build Full-Stack FastAPI/PostgreSQL project', completed: false, targetDate: '2026-10-15' },
      { id: 'gm-4', title: 'Conduct 4 mock behavioral and system design interviews', completed: false, targetDate: '2026-11-10' },
    ],
    createdAt: '2026-09-01T09:00:00.000Z',
  },
  {
    id: 'goal-gpa', title: 'Achieve 3.85+ Semester GPA in Junior Year',
    description: 'Secure A grades in CS301 (DBMS) and CS304 (Algorithms) with consistent weekly review and timely assignment submissions.',
    type: 'Academic', priority: 'High', targetDate: '2026-12-20', status: 'Active', progressPercent: 45,
    milestones: [
      { id: 'gm-5', title: 'Score 90%+ on DBMS Midterm', completed: false, targetDate: '2026-09-18' },
      { id: 'gm-6', title: 'Score 88%+ on Algorithms Midterm', completed: false, targetDate: '2026-10-02' },
      { id: 'gm-7', title: 'Submit all homework sets 24 hours prior to deadline', completed: false, targetDate: '2026-11-01' },
    ],
    createdAt: '2026-09-01T09:00:00.000Z',
  },
  {
    id: 'goal-health', title: 'Consistent Physical Health & 7+ Hours Sleep Habit',
    description: 'Maintain 4 gym workouts per week and strict 10:30 PM wind-down routine without screen exposure.',
    type: 'Health', priority: 'Medium', targetDate: '2026-12-31', status: 'Active', progressPercent: 78,
    milestones: [
      { id: 'gm-8', title: 'Log 14 consecutive days of 7h+ sleep', completed: true, completedAt: '2026-09-10' },
      { id: 'gm-9', title: 'Hit 3x weekly gym sessions for 4 weeks straight', completed: false, targetDate: '2026-09-30' },
    ],
    createdAt: '2026-09-01T09:00:00.000Z',
  },
];

export const INITIAL_TASKS = [
  { id: 'tsk-1', title: 'Review DBMS Normal Forms (1NF through BCNF) & practice decomposition', description: 'Review lecture 5 slides and complete practice problems 1 to 6 in textbook chapter 7.', classification: 'Academic', priority: 'High', estimatedMinutes: 60, status: 'Pending', scheduledDate: '2026-09-12', scheduledTime: '15:30', dueDate: '2026-09-13', dueTime: '18:00', linkedSubjectId: 'sub-dbms', linkedGoalId: 'goal-gpa', remindersEnabled: true, customReminderMinutes: 5, createdAt: '2026-09-11T14:00:00.000Z' },
  { id: 'tsk-2', title: 'Solve 2 LeetCode Dynamic Programming problems (Coin Change & Climbing Stairs)', description: 'Write solutions in Python, analyze time/space complexity, and document pattern insights.', classification: 'Academic', priority: 'High', estimatedMinutes: 45, status: 'In Progress', scheduledDate: '2026-09-12', scheduledTime: '17:00', dueDate: '2026-09-12', dueTime: '20:00', linkedGoalId: 'goal-internship', remindersEnabled: true, customReminderMinutes: 5, createdAt: '2026-09-12T08:30:00.000Z' },
  { id: 'tsk-3', title: 'Pack gym gear and fill electrolyte water bottle for tomorrow morning', description: 'Shoes, clean towel, lock, pre-workout snack.', classification: 'Personal', priority: 'Low', estimatedMinutes: 10, status: 'Pending', scheduledDate: '2026-09-12', scheduledTime: '21:30', remindersEnabled: true, customReminderMinutes: 5, createdAt: '2026-09-12T09:00:00.000Z' },
  { id: 'tsk-4', title: 'Order Linear Algebra textbook supplement from university library', description: 'Gilbert Strang 5th Edition reserve copy.', classification: 'Academic', priority: 'Medium', estimatedMinutes: 15, status: 'Completed', scheduledDate: '2026-09-12', scheduledTime: '11:00', linkedSubjectId: 'sub-math', remindersEnabled: false, createdAt: '2026-09-11T10:00:00.000Z', completedAt: '2026-09-12T11:15:00.000Z' },
  { id: 'tsk-5', title: 'Refill weekly pill organizer and buy groceries (eggs, spinach, chicken)', classification: 'Personal', priority: 'Medium', estimatedMinutes: 30, status: 'Pending', scheduledDate: '2026-09-13', scheduledTime: '10:00', remindersEnabled: true, createdAt: '2026-09-12T10:00:00.000Z' },
  { id: 'tsk-6', title: 'Draft Technical Writing abstract on Ethical AI in Healthcare', classification: 'Academic', priority: 'Medium', estimatedMinutes: 45, status: 'Pending', scheduledDate: '2026-09-14', scheduledTime: '14:00', dueDate: '2026-09-17', dueTime: '23:59', linkedSubjectId: 'sub-hum', linkedGoalId: 'goal-gpa', remindersEnabled: true, createdAt: '2026-09-12T10:30:00.000Z' },
];

export const INITIAL_FREE_TIME_SLOTS = [
  { id: 'free-slot-1', title: 'Afternoon Free Window', date: '2026-09-12', startTime: '14:00', endTime: '17:00', notes: 'Open study & task focus block after morning classes', isRecurring: true, recurringDays: [1, 2, 3, 4, 5] },
  { id: 'free-slot-2', title: 'Evening Free Slot', date: '2026-09-12', startTime: '19:30', endTime: '21:30', notes: 'Wind-down study, reviewing notes and personal tasks', isRecurring: true, recurringDays: [1, 2, 3, 4] },
];

export const CREATORS_DATA = [
  {
    id: 'creator-mentor', name: 'Dr. Aris Thorne', role: 'Distinguished Faculty Mentor & Advisory Lead', category: 'mentor', badge: 'Project Mentor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&auto=format&fit=crop&q=80',
    bio: 'Professor of Computer Science & Human-Computer Interaction. Specializes in cognitive load reduction, personal productivity operating systems, and intelligent student support environments.',
    contributions: ['Architectural oversight and cognitive workflow modeling', 'Dual-priority paradigm definition (Category distribution vs Individual task priority)', 'Human-computer interface heuristics for minimal context switching', 'Long-term self-hosting and zero-vendor-lockin roadmap advisory'],
    skills: ['Cognitive Systems', 'Software Architecture', 'HCI Design', 'Educational Tech', 'Distributed Systems'],
    socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com', website: 'https://cs.university.edu/~thorne' },
  },
  {
    id: 'creator-lead', name: 'Bhaskar Sharma', role: 'Team Leader & Systems Architect', category: 'leader', badge: 'Team Leader',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&auto=format&fit=crop&q=80',
    bio: 'Final-year Computer Science student passionate about building resilient, privacy-first software tools. Spearheaded SSAP v3.0 product vision, technical architecture, and schedule conflict engine.',
    contributions: ['Overall product architecture, state management, and unified data contracts', 'Schedule collision algorithm with 12h/24h dual formatting', '100% Work Priority Distribution mathematical validator', 'End-to-end integration and release engineering'],
    skills: ['TypeScript', 'React', 'Node.js', 'Relational DBs', 'System Design', 'PWA Engineering'],
    socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'bhaskar324650@gmail.com' },
  },
  {
    id: 'creator-frontend', name: 'Maya Patel', role: 'Lead Frontend & UI/UX Specialist', category: 'member', badge: 'Core Team',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=320&auto=format&fit=crop&q=80',
    bio: 'Specialist in accessible web typography, responsive design tokens, and fluid student-focused dashboard layouts with zero visual noise.',
    contributions: ['Mobile-first responsive layout with strict contrast AA standards', 'Dashboard command center visual hierarchy and agenda time-blocks', 'Quick Add actionable modal with keyboard shortcuts', 'Interactive Goal Milestones and progress meter visualizers'],
    skills: ['Tailwind CSS', 'React 19', 'Figma', 'Web Accessibility (a11y)', 'Motion Design'],
    socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
  },
  {
    id: 'creator-data', name: 'David Kim', role: 'Database & Scheduling Logic Specialist', category: 'member', badge: 'Core Team',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=320&auto=format&fit=crop&q=80',
    bio: 'Undergraduate researcher in algorithms and combinatorial optimization. Designed the timetable recurrence logic and non-destructive conflict alerts.',
    contributions: ['Relational schema design and data normalization model', 'Timetable repeating rule engine and agenda projection', 'JSON/CSV data import, export, and disaster recovery routines', 'Workload calculation hours-versus-waking-time metrics'],
    skills: ['MySQL', 'Data Modeling', 'Algorithms', 'TypeScript', 'Query Optimization'],
    socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
  },
  {
    id: 'creator-pwa', name: 'Priya Nair', role: 'PWA & Smart Notification Systems Specialist', category: 'member', badge: 'Core Team',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=320&auto=format&fit=crop&q=80',
    bio: 'Software engineer focusing on modern browser APIs, offline-first service workers, and gentle, non-intrusive reminder schedulers.',
    contributions: ['Service worker cache strategy and Web App Manifest configuration', '5-minute and 1-minute smart countdown notification dispatcher', 'Sleep routine gentle wind-down reminder handler', 'In-app notification drawer and Web Audio subtle chime synthesizer'],
    skills: ['Service Workers', 'Web Push', 'Cache API', 'Web Audio API', 'PWA Auditing'],
    socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
  },
];
