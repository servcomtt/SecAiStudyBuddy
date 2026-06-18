#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const questionBankPath = path.join(repoRoot, 'content', 'question-bank', 'questions.json');
const quizDataPath = path.join(repoRoot, 'content', 'study-spa', 'quiz_data.js');

function loadQuestionBank() {
  const raw = fs.readFileSync(questionBankPath, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error('questions.json must contain an array.');
  }
  return data;
}

function loadQuizData() {
  const raw = fs.readFileSync(quizDataPath, 'utf8');
  const source = raw.replace(/^const QUIZ_BANK = /, '').trim().replace(/;$/, '');
  const data = eval(source); // eslint-disable-line no-eval
  if (!Array.isArray(data)) {
    throw new Error('quiz_data.js must define QUIZ_BANK as an array.');
  }
  return data;
}

function main() {
  const bank = loadQuestionBank();
  const quiz = loadQuizData();
  const byNum = new Map(quiz.map((q) => [Number(q.num), String(q.ans ?? '')]));

  const mismatches = [];
  for (const q of bank) {
    const num = Number(q.num);
    if (!Number.isFinite(num)) continue;
    if (!byNum.has(num)) continue;

    const bankAns = String(q.ans ?? '');
    const quizAns = byNum.get(num);
    if (bankAns !== quizAns) {
      mismatches.push({ num, questionBank: bankAns, quizData: quizAns });
    }
  }

  if (mismatches.length > 0) {
    console.error(
      `Found ${mismatches.length} answer-key mismatch(es) between questions.json and quiz_data.js.`,
    );
    for (const row of mismatches.slice(0, 25)) {
      console.error(
        `  - Q${row.num}: questions.json=${row.questionBank} vs quiz_data.js=${row.quizData}`,
      );
    }
    console.error(
      'Sync quiz_data.js from content/question-bank/questions.json before pushing.',
    );
    process.exit(1);
  }

  console.log('questions.json and quiz_data.js answer keys are in sync.');
}

main();
