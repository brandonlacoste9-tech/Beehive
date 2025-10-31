export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  html_url: string;
  language?: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  created_at: string;
  topics?: string[];
  default_branch: string;
  archived: boolean;
}

export interface ProjectDetails {
  name: string;
  description: string;
  features: string[];
  techStack: string[];
  liveUrl?: string;
  repo: string;
  highlights?: string[];
}

export const featuredProjects: ProjectDetails[] = [
  {
    name: 'AdGenXAI',
    description: 'AI-Powered Advertising Creative Platform - Complete production-ready SaaS solution combining Google Gemini AI, Stripe payments, Supabase authentication, and newsletter integration.',
    features: [
      'AI-powered ad generation with multiple models',
      'Complete monetization with Stripe',
      'User authentication and security',
      'Real-time analytics dashboard',
      'Newsletter integration with Beehiv'
    ],
    techStack: ['Next.js', 'TypeScript', 'Google Gemini AI', 'Stripe', 'Supabase', 'Tailwind CSS'],
    liveUrl: 'https://www.adgenxai.pro',
    repo: 'Beehive',
    highlights: [
      '3-tier pricing model',
      'Real-time usage analytics',
      'Advanced fraud detection',
      'Webhook sensory cortex'
    ]
  },
  {
    name: 'Content Ops Starter',
    description: 'Netlify starter template with flexible content model, visual editing, and Git Content Source integration.',
    features: [
      'Visual editing capabilities',
      'Flexible content model',
      'Algolia search integration',
      'Netlify deployment ready'
    ],
    techStack: ['Next.js', 'TypeScript', 'Netlify', 'Algolia'],
    repo: 'netlify-templates-content-ops-starter'
  },
  {
    name: 'React + Vite TypeScript',
    description: 'Modern React application with Vite, TypeScript, and comprehensive ESLint configuration.',
    features: [
      'Fast HMR with Vite',
      'TypeScript support',
      'ESLint configuration',
      'Production-ready build'
    ],
    techStack: ['React', 'Vite', 'TypeScript', 'ESLint'],
    repo: 'sb1-rqq6e2k7'
  }
];
