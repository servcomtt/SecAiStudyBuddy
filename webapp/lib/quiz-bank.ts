import 'server-only';

import { access, readFile } from 'node:fs/promises';

import { quizBankPath } from './content-paths';

export type QuizQuestion = {
  num: number;
  q: string;
  opts: [string, string][];
  ans: string;
  topic: string;
};

export type TopicSummary = {
  topic: string;
  count: number;
};

export type QuizBankSummary = {
  totalQuestions: number;
  multiSelectCount: number;
  topicCount: number;
  topTopics: TopicSummary[];
};

async function resolveQuizBankPath() {
  try {
    await access(quizBankPath);
    return quizBankPath;
  } catch {
    throw new Error(`Unable to locate questions.json for the webapp at ${quizBankPath}.`);
  }
}

export async function getQuizQuestions(): Promise<QuizQuestion[]> {
  const filePath = await resolveQuizBankPath();
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw) as QuizQuestion[];
}

export async function getQuizBankSummary(): Promise<QuizBankSummary> {
  const questions = await getQuizQuestions();
  const topicCounts = new Map<string, number>();

  for (const question of questions) {
    topicCounts.set(question.topic, (topicCounts.get(question.topic) ?? 0) + 1);
  }

  const topTopics = [...topicCounts.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));

  return {
    totalQuestions: questions.length,
    multiSelectCount: questions.filter((question) => question.ans.length > 1).length,
    topicCount: topicCounts.size,
    topTopics,
  };
}
