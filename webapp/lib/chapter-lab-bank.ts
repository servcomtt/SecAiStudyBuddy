import 'server-only';

import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { cache } from 'react';

import { studySourceLabsPath } from './content-paths';
import type { ChapterSlug } from './course-data';

export type ChapterNotebook = {
  filename: string;
  title: string;
};

type ChapterLabBase = {
  id: string;
  title: string;
  instructions: string;
  objectives?: string[];
  graded?: boolean;
};

export type ClickMatchActivity = ChapterLabBase & {
  type: 'click-match';
  categories: string[];
  items: Array<{
    text: string;
    category: string;
  }>;
};

export type ClickOrderActivity = ChapterLabBase & {
  type: 'click-order';
  items: string[];
  answer: string[];
  explanation?: string;
};

export type FillBlankActivity = ChapterLabBase & {
  type: 'fill-blank';
  questions: Array<{
    prompt: string;
    answer: string;
    hints?: string[];
  }>;
};

export type CodeLabCell =
  | {
      type: 'markdown';
      content: string;
    }
  | {
      type: 'code';
      code: string;
    };

export type CodeLabActivity = ChapterLabBase & {
  type: 'code-lab';
  cells: CodeLabCell[];
};

export type ChapterLabActivity =
  | ClickMatchActivity
  | ClickOrderActivity
  | FillBlankActivity
  | CodeLabActivity;

export type ChapterLabDefinition = {
  notebook: ChapterNotebook | null;
  activities: ChapterLabActivity[];
};

type ChapterLabBank = Record<ChapterSlug, ChapterLabDefinition>;
const chapterKeys: ChapterSlug[] = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8'];

function isNotebook(value: unknown): value is ChapterNotebook {
  if (value == null) return true;
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  return typeof candidate.filename === 'string' && typeof candidate.title === 'string';
}

function isLabBase(value: unknown): value is ChapterLabBase {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.instructions === 'string' &&
    (candidate.objectives === undefined ||
      (Array.isArray(candidate.objectives) &&
        candidate.objectives.every((objective) => typeof objective === 'string'))) &&
    (candidate.graded === undefined || typeof candidate.graded === 'boolean')
  );
}

function isClickMatchActivity(value: unknown): value is ClickMatchActivity {
  if (!isLabBase(value)) return false;

  const candidate = value as Record<string, unknown>;
  return (
    candidate.type === 'click-match' &&
    Array.isArray(candidate.categories) &&
    candidate.categories.every((category) => typeof category === 'string') &&
    Array.isArray(candidate.items) &&
    candidate.items.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof (item as Record<string, unknown>).text === 'string' &&
        typeof (item as Record<string, unknown>).category === 'string',
    )
  );
}

function isClickOrderActivity(value: unknown): value is ClickOrderActivity {
  if (!isLabBase(value)) return false;

  const candidate = value as Record<string, unknown>;
  return (
    candidate.type === 'click-order' &&
    Array.isArray(candidate.items) &&
    candidate.items.every((item) => typeof item === 'string') &&
    Array.isArray(candidate.answer) &&
    candidate.answer.every((item) => typeof item === 'string') &&
    (candidate.explanation === undefined || typeof candidate.explanation === 'string')
  );
}

function isFillBlankActivity(value: unknown): value is FillBlankActivity {
  if (!isLabBase(value)) return false;

  const candidate = value as Record<string, unknown>;
  return (
    candidate.type === 'fill-blank' &&
    Array.isArray(candidate.questions) &&
    candidate.questions.every(
      (question) =>
        question &&
        typeof question === 'object' &&
        typeof (question as Record<string, unknown>).prompt === 'string' &&
        typeof (question as Record<string, unknown>).answer === 'string' &&
        ((question as Record<string, unknown>).hints === undefined ||
          (Array.isArray((question as Record<string, unknown>).hints) &&
            ((question as Record<string, unknown>).hints as unknown[]).every(
              (hint) => typeof hint === 'string',
            ))),
    )
  );
}

function isCodeLabCell(value: unknown): value is CodeLabCell {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  if (candidate.type === 'markdown') return typeof candidate.content === 'string';
  if (candidate.type === 'code') return typeof candidate.code === 'string';
  return false;
}

function isCodeLabActivity(value: unknown): value is CodeLabActivity {
  if (!isLabBase(value)) return false;

  const candidate = value as Record<string, unknown>;
  return candidate.type === 'code-lab' && Array.isArray(candidate.cells) && candidate.cells.every(isCodeLabCell);
}

function isChapterLabActivity(value: unknown): value is ChapterLabActivity {
  return (
    isClickMatchActivity(value) ||
    isClickOrderActivity(value) ||
    isFillBlankActivity(value) ||
    isCodeLabActivity(value)
  );
}

function assertChapterLabBank(value: unknown): asserts value is ChapterLabBank {
  if (!value || typeof value !== 'object') {
    throw new Error('Chapter labs did not evaluate to an object.');
  }

  for (const chapterKey of chapterKeys) {
    const chapterDefinition = (value as Record<string, unknown>)[chapterKey];

    if (!chapterDefinition || typeof chapterDefinition !== 'object') {
      throw new Error(`Lab definition for ${chapterKey} is missing.`);
    }

    const candidate = chapterDefinition as Record<string, unknown>;
    if (!isNotebook(candidate.notebook)) {
      throw new Error(`Notebook definition for ${chapterKey} is malformed.`);
    }

    if (!Array.isArray(candidate.activities) || !candidate.activities.every(isChapterLabActivity)) {
      throw new Error(`Lab activities for ${chapterKey} are missing or malformed.`);
    }
  }
}

const loadChapterLabBank = cache(async (): Promise<ChapterLabBank> => {
  const source = await readFile(studySourceLabsPath, 'utf8');
  const match = source.match(/var LABS = \{[\s\S]*\n\};\s*$/);

  if (!match) {
    throw new Error(`Unable to locate lab definitions in ${studySourceLabsPath}.`);
  }

  const evaluated = vm.runInNewContext(`${match[0]}\nLABS;`, Object.create(null), {
    timeout: 1000,
  });

  assertChapterLabBank(evaluated);
  return evaluated;
});

export async function getChapterLabDefinition(chapterSlug: ChapterSlug) {
  const bank = await loadChapterLabBank();
  return bank[chapterSlug];
}
