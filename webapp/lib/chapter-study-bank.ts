import 'server-only';

import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { cache } from 'react';

import { studySourceIndexPath } from './content-paths';
import type { ChapterSlug } from './course-data';

export type ChapterTopic = {
  title: string;
  paragraphs: string[];
  keypoint: string;
};

export type ChapterFlashcard = {
  term: string;
  def: string;
};

export type ChapterScenario = {
  promptHtml: string;
  answerHtml: string;
};

type ChapterTopicsMap = Record<ChapterSlug, ChapterTopic[]>;
type ChapterFlashcardsMap = Record<ChapterSlug, ChapterFlashcard[]>;
type ChapterScenariosMap = Record<ChapterSlug, ChapterScenario[]>;
const chapterKeys: ChapterSlug[] = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8'];

function extractLegacyConst(source: string, constName: string) {
  const pattern = new RegExp(`const ${constName} = \\{[\\s\\S]*?\\n\\};`);
  const match = source.match(pattern);

  if (!match) {
    throw new Error(`Unable to locate ${constName} in ${studySourceIndexPath}.`);
  }

  return match[0];
}

function isChapterTopic(value: unknown): value is ChapterTopic {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.title === 'string' &&
    Array.isArray(candidate.paragraphs) &&
    candidate.paragraphs.every((paragraph) => typeof paragraph === 'string') &&
    typeof candidate.keypoint === 'string'
  );
}

function isChapterFlashcard(value: unknown): value is ChapterFlashcard {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  return typeof candidate.term === 'string' && typeof candidate.def === 'string';
}

function isChapterScenario(value: unknown): value is ChapterScenario {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  return typeof candidate.promptHtml === 'string' && typeof candidate.answerHtml === 'string';
}

function assertTopicsMap(value: unknown): asserts value is ChapterTopicsMap {
  if (!value || typeof value !== 'object') {
    throw new Error('Legacy topics did not evaluate to an object.');
  }

  for (const chapterKey of chapterKeys) {
    const topics = (value as Record<string, unknown>)[chapterKey];

    if (!Array.isArray(topics) || !topics.every(isChapterTopic)) {
      throw new Error(`Legacy topics for ${chapterKey} are missing or malformed.`);
    }
  }
}

function assertFlashcardsMap(value: unknown): asserts value is ChapterFlashcardsMap {
  if (!value || typeof value !== 'object') {
    throw new Error('Legacy flashcards did not evaluate to an object.');
  }

  for (const chapterKey of chapterKeys) {
    const cards = (value as Record<string, unknown>)[chapterKey];

    if (!Array.isArray(cards) || !cards.every(isChapterFlashcard)) {
      throw new Error(`Legacy flashcards for ${chapterKey} are missing or malformed.`);
    }
  }
}

function assertScenariosMap(value: unknown): asserts value is ChapterScenariosMap {
  if (!value || typeof value !== 'object') {
    throw new Error('Legacy scenarios did not evaluate to an object.');
  }

  for (const chapterKey of chapterKeys) {
    const scenarios = (value as Record<string, unknown>)[chapterKey];

    if (!Array.isArray(scenarios) || !scenarios.every(isChapterScenario)) {
      throw new Error(`Legacy scenarios for ${chapterKey} are missing or malformed.`);
    }
  }
}

function extractScenarioMap(source: string): ChapterScenariosMap {
  const scenarioBlocks = [...source.matchAll(
    /<div class="scenarios-list">([\s\S]*?)<\/div>\s*<\/div>\s*<!-- PRACTICE LABS -->/g,
  )];

  if (scenarioBlocks.length !== chapterKeys.length) {
    throw new Error(
      `Expected ${chapterKeys.length} scenario blocks in ${studySourceIndexPath}, found ${scenarioBlocks.length}.`,
    );
  }

  const scenarios = Object.create(null) as ChapterScenariosMap;

  scenarioBlocks.forEach((blockMatch, chapterIndex) => {
    const blockHtml = blockMatch[1] ?? '';
    const chapterKey = chapterKeys[chapterIndex];
    const chapterScenarios: ChapterScenario[] = [];
    const itemRegex =
      /<div class="scenario-item"><div class="scenario-q"[\s\S]*?<span class="sq-text">([\s\S]*?)<\/span><\/div><div class="scenario-a"><span class="sa-label">[\s\S]*?<\/span>([\s\S]*?)<\/div><\/div>/g;

    for (const itemMatch of blockHtml.matchAll(itemRegex)) {
      chapterScenarios.push({
        promptHtml: itemMatch[1]?.trim() ?? '',
        answerHtml: itemMatch[2]?.trim() ?? '',
      });
    }

    if (chapterScenarios.length === 0) {
      throw new Error(`Chapter scenarios for ${chapterKey} could not be parsed from ${studySourceIndexPath}.`);
    }

    scenarios[chapterKey] = chapterScenarios;
  });

  return scenarios;
}

const loadStudyContent = cache(async () => {
  const source = await readFile(studySourceIndexPath, 'utf8');

  const evaluatedTopics = vm.runInNewContext(
    `${extractLegacyConst(source, 'TOPICS')}\nTOPICS;`,
    Object.create(null),
    { timeout: 1000 },
  );
  const evaluatedFlashcards = vm.runInNewContext(
    `${extractLegacyConst(source, 'flashcards')}\nflashcards;`,
    Object.create(null),
    { timeout: 1000 },
  );

  assertTopicsMap(evaluatedTopics);
  assertFlashcardsMap(evaluatedFlashcards);
  const extractedScenarios = extractScenarioMap(source);
  assertScenariosMap(extractedScenarios);

  return {
    topics: evaluatedTopics,
    flashcards: evaluatedFlashcards,
    scenarios: extractedScenarios,
  };
});

export async function getChapterTopics(chapterSlug: ChapterSlug) {
  const content = await loadStudyContent();
  return content.topics[chapterSlug];
}

export async function getChapterFlashcards(chapterSlug: ChapterSlug) {
  const content = await loadStudyContent();
  return content.flashcards[chapterSlug];
}

export async function getChapterScenarios(chapterSlug: ChapterSlug) {
  const content = await loadStudyContent();
  return content.scenarios[chapterSlug];
}
