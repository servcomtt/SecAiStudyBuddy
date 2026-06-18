import 'server-only';

import { cache } from 'react';

import { getChapterLabDefinition } from './chapter-lab-bank';
import { getChapterQuizDeck } from './chapter-quiz-bank';
import { getChapterScenarios, getChapterTopics } from './chapter-study-bank';
import { getChapter, type ChapterSlug } from './course-data';

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export const getChapterContext = cache(async (chapterSlug: ChapterSlug) => {
  const chapter = getChapter(chapterSlug);

  if (!chapter) {
    return null;
  }

  const [topics, scenarios, quizDeck, labs] = await Promise.all([
    getChapterTopics(chapterSlug),
    getChapterScenarios(chapterSlug),
    getChapterQuizDeck(chapterSlug),
    getChapterLabDefinition(chapterSlug),
  ]);

  const topicLines = topics
    .slice(0, 4)
    .map((topic, index) => `${index + 1}. ${topic.title}: ${truncate(topic.keypoint, 140)}`);

  const scenarioLines = scenarios
    .slice(0, 2)
    .map((scenario, index) => `${index + 1}. ${truncate(stripHtml(scenario.promptHtml), 160)}`);

  const quizLines = quizDeck
    .slice(0, 3)
    .map((question, index) => `${index + 1}. ${truncate(question.q, 150)}`);

  const labLines = labs.activities
    .slice(0, 3)
    .map((activity, index) => `${index + 1}. ${activity.title} (${activity.type})`);

  return [
    `Active chapter: ${chapter.fullTitle}`,
    `Description: ${chapter.description}`,
    `Tags: ${chapter.tags.join(', ')}`,
    topicLines.length ? `Important topics:\n${topicLines.join('\n')}` : null,
    scenarioLines.length ? `Typical scenario prompts:\n${scenarioLines.join('\n')}` : null,
    quizLines.length ? `Common quiz checks:\n${quizLines.join('\n')}` : null,
    labLines.length ? `Hands-on lab focus:\n${labLines.join('\n')}` : null,
    labs.notebook ? `Notebook: ${labs.notebook.title}` : null,
  ]
    .filter(Boolean)
    .join('\n\n');
});
