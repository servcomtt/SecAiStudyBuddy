import 'server-only';

import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { cache } from 'react';

import { studySourceIndexPath } from './content-paths';
import type { ChapterSlug } from './course-data';

export type ChapterQuizQuestion = {
  q: string;
  opts: string[];
  ans: number;
  exp: string;
};

type ChapterQuizBank = Record<ChapterSlug, ChapterQuizQuestion[]>;

function isChapterQuizQuestion(value: unknown): value is ChapterQuizQuestion {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.q === 'string' &&
    Array.isArray(candidate.opts) &&
    candidate.opts.every((option) => typeof option === 'string') &&
    typeof candidate.ans === 'number' &&
    typeof candidate.exp === 'string'
  );
}

function assertChapterQuizBank(value: unknown): asserts value is ChapterQuizBank {
  const chapterKeys: ChapterSlug[] = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8'];

  if (!value || typeof value !== 'object') {
    throw new Error('Chapter quiz bank did not evaluate to an object.');
  }

  for (const chapterKey of chapterKeys) {
    const questions = (value as Record<string, unknown>)[chapterKey];

    if (!Array.isArray(questions) || !questions.every(isChapterQuizQuestion)) {
      throw new Error(`Chapter quiz bank for ${chapterKey} is missing or malformed.`);
    }
  }
}

const loadChapterQuizBank = cache(async (): Promise<ChapterQuizBank> => {
  const source = await readFile(studySourceIndexPath, 'utf8');
  const match = source.match(/const quizzes = \{[\s\S]*?\n\};/);

  if (!match) {
    throw new Error(`Unable to locate chapter quiz definitions in ${studySourceIndexPath}.`);
  }

  const evaluated = vm.runInNewContext(`${match[0]}\nquizzes;`, Object.create(null), {
    timeout: 1000,
  });

  assertChapterQuizBank(evaluated);
  return evaluated;
});

export async function getChapterQuizDeck(chapterSlug: ChapterSlug) {
  const bank = await loadChapterQuizBank();
  return bank[chapterSlug];
}
