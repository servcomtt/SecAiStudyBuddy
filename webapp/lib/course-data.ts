export type ChapterSlug = 'ch1' | 'ch2' | 'ch3' | 'ch4' | 'ch5' | 'ch6' | 'ch7' | 'ch8';

export type StepDefinition = {
  id:
    | 'topics'
    | 'scenarios'
    | 'labs'
    | 'flashcards'
    | 'quiz'
    | 'summary'
    | 'acronyms'
    | 'terminology'
    | 'practice-quiz';
  label: string;
  shortLabel: string;
  description: string;
};

export type ChapterMeta = {
  slug: ChapterSlug;
  number: number;
  title: string;
  fullTitle: string;
  description: string;
  tags: string[];
};

export const appMeta = {
  title: 'CompTIA SecAI+ Study Buddy',
  subtitle:
    'An all-in-one study companion for the CY0-001 exam, organized by domains and exam objectives.',
};

export const steps: StepDefinition[] = [
  { id: 'topics', shortLabel: 'Topics', label: 'Topics', description: 'Core domain concepts and objective walkthroughs.' },
  { id: 'scenarios', shortLabel: 'Scenarios', label: 'Scenarios', description: 'CY0-001 style scenario training prompts and explanations.' },
  { id: 'labs', shortLabel: 'Labs', label: 'Labs', description: 'Hands-on security and AI practice labs.' },
  { id: 'flashcards', shortLabel: 'Flashcards', label: 'Flashcards', description: 'Rapid drill and retention review.' },
  { id: 'quiz', shortLabel: 'Quiz', label: 'Objective Quiz', description: 'Timed and untimed objective checks.' },
  { id: 'acronyms', shortLabel: 'Acronyms', label: 'Acronym Flashcards', description: 'Acronym-focused flashcard drills for this domain.' },
  { id: 'terminology', shortLabel: 'Terms', label: 'Terminology', description: 'Key definitions and terms for this domain.' },
  { id: 'practice-quiz', shortLabel: 'Practice', label: 'Practice Quiz', description: 'Practice quiz mode for this domain.' },
  { id: 'summary', shortLabel: 'Summary', label: 'Summary', description: 'Progress, weak spots, and next-step objective review.' },
];

export const chapters: ChapterMeta[] = [
  {
    slug: 'ch1',
    number: 1,
    title: 'AI in Cybersecurity',
    fullTitle: 'Domain 1: AI in Cybersecurity',
    description: 'AI types, model training techniques, prompt engineering, and AI life cycle fundamentals.',
    tags: ['Generative AI', 'ML', 'Prompt Engineering', 'AI Life Cycle'],
  },
  {
    slug: 'ch2',
    number: 2,
    title: 'Security and the AI Life Cycle',
    fullTitle: 'Domain 2: Security and the AI Life Cycle',
    description: 'OWASP, MITRE ATLAS, MIT AI Risk Repository, and AI threat modeling frameworks.',
    tags: ['OWASP LLM Top 10', 'MITRE ATLAS', 'Threat Modeling', 'CVE AI WG'],
  },
  {
    slug: 'ch3',
    number: 3,
    title: 'AI Threats and Attacks',
    fullTitle: 'Domain 3: AI Threats and Attacks',
    description: 'Model and gateway controls, guardrails, and AI access control implementation.',
    tags: ['Guardrails', 'Prompt Firewall', 'Rate Limits', 'Least Privilege'],
  },
  {
    slug: 'ch4',
    number: 4,
    title: 'AI Security Controls',
    fullTitle: 'Domain 4: AI Security Controls',
    description: 'Encryption, data controls, monitoring, auditing, and AI attack analysis.',
    tags: ['Encryption', 'Prompt Monitoring', 'Hallucination Audits', 'Attack Evidence'],
  },
  {
    slug: 'ch5',
    number: 5,
    title: 'AI Monitoring and Auditing',
    fullTitle: 'Domain 5: AI Monitoring and Auditing',
    description: 'AI-enabled tools, MCP workflows, and security operations use cases.',
    tags: ['MCP', 'IDE Plugins', 'Vulnerability Analysis', 'Threat Modeling'],
  },
  {
    slug: 'ch6',
    number: 6,
    title: 'AI-Enhanced Attacks',
    fullTitle: 'Domain 6: AI-Enhanced Attacks',
    description: 'Deepfakes, adversarial misuse, reconnaissance, and automated attack generation.',
    tags: ['Deepfake', 'Social Engineering', 'Obfuscation', 'DDoS'],
  },
  {
    slug: 'ch7',
    number: 7,
    title: 'Enabling Security With AI',
    fullTitle: 'Domain 7: Enabling Security With AI',
    description: 'AI-driven automation for IR, change management, CI/CD, and security testing.',
    tags: ['AI Agents', 'CI/CD', 'SCA', 'Automated Testing'],
  },
  {
    slug: 'ch8',
    number: 8,
    title: 'AI Governance, Risk, and Compliance',
    fullTitle: 'Domain 8: AI Governance, Risk, and Compliance',
    description: 'Governance structures, responsible AI risk, and global compliance impacts.',
    tags: ['EU AI Act', 'NIST AIRMF', 'OECD', 'ISO AI Standards'],
  },
];

export function getChapter(slug: string) {
  return chapters.find((chapter) => chapter.slug === slug);
}

export function getStep(stepId: string) {
  return steps.find((step) => step.id === stepId);
}
