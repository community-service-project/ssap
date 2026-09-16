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
