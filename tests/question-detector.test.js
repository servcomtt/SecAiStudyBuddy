'use strict';

/**
 * tests/question-detector.test.js
 * Unit tests for question-importer/parsers/question-detector.js
 * Run with: node --test  (Node 18+ built-in test runner)
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { detectQuestions } = require(
  path.join(__dirname, '..', 'question-importer', 'parsers', 'question-detector.js')
);

// ── Fixtures ──────────────────────────────────────────────────────────────────

const BASIC_MC = `
1. What does SQL stand for?
A. Standard Query Language
B. Structured Query Language
C. Simple Query Language
D. Sequential Query Language
Answer: B

2. Which of the following is a NoSQL database?
A. MySQL
B. PostgreSQL
C. MongoDB
D. Oracle
Answer: C
`.trim();

const MULTI_SELECT = `
1. Which of the following are primary colors? (Select all that apply)
A. Red
B. Green
C. Blue
D. Yellow
Correct Answer: A, C
`.trim();

const ANSWER_KEY_SECTION = `
1. What is ETL?
A. Extract Test Load
B. Extract Transform Link
C. Extract Transform Load
D. Export Transform Load

2. Which SQL clause filters rows after grouping?
A. WHERE
B. HAVING
C. ORDER BY
D. GROUP BY

Answer Key
1. C
2. B
`.trim();

const WITH_EXPLANATION = `
1. What is a data warehouse optimised for?
A. Transactional writes
B. Analytical read queries
C. Real-time streaming
D. Key-value storage
Answer: B
Explanation: Data warehouses use columnar storage and are tuned for complex analytical (OLAP) queries, not transactional (OLTP) workloads.
`.trim();

const Q_PREFIX_STYLE = `
Q1. What is a primary key?
A. A key used to encrypt data
B. A unique identifier for each row in a table
C. A foreign key reference
D. An index on a column
Answer: B

Question 2. What does NULL represent in SQL?
A. Zero
B. An empty string
C. An unknown or missing value
D. False
Answer: C
`.trim();

const TRUE_FALSE = `
1. A data lake stores data in its raw, unprocessed form.
A. True
B. False
Answer: A

2. OLTP systems are optimised for complex reporting queries.
A. True
B. False
Answer: B
`.trim();

const NO_OPTIONS = `
1. Describe the difference between structured and unstructured data.
Answer: Structured data fits into predefined schemas (databases, CSV). Unstructured data lacks a fixed format (images, text, video).
`.trim();


// ── Tests ─────────────────────────────────────────────────────────────────────

describe('detectQuestions — basic multiple choice', () => {

  test('detects the correct number of questions', () => {
    const { questions } = detectQuestions(BASIC_MC);
    assert.equal(questions.length, 2);
  });

  test('extracts question numbers', () => {
    const { questions } = detectQuestions(BASIC_MC);
    assert.equal(questions[0].questionNumber, 1);
    assert.equal(questions[1].questionNumber, 2);
  });

  test('extracts stems correctly', () => {
    const { questions } = detectQuestions(BASIC_MC);
    assert.ok(questions[0].stem.includes('SQL stand for'));
    assert.ok(questions[1].stem.includes('NoSQL database'));
  });

  test('extracts 4 options per question', () => {
    const { questions } = detectQuestions(BASIC_MC);
    assert.equal(questions[0].options.length, 4);
    assert.equal(questions[1].options.length, 4);
  });

  test('maps option keys A-D correctly', () => {
    const { questions } = detectQuestions(BASIC_MC);
    const keys = questions[0].options.map(o => o.key);
    assert.deepEqual(keys, ['A', 'B', 'C', 'D']);
  });

  test('extracts inline Answer: line', () => {
    const { questions } = detectQuestions(BASIC_MC);
    assert.deepEqual(questions[0].correctAnswers, ['B']);
    assert.deepEqual(questions[1].correctAnswers, ['C']);
  });

  test('assigns questionType = single', () => {
    const { questions } = detectQuestions(BASIC_MC);
    assert.equal(questions[0].questionType, 'single');
    assert.equal(questions[1].questionType, 'single');
  });

  test('confidence is >= 0.7 for fully-specified questions', () => {
    const { questions } = detectQuestions(BASIC_MC);
    assert.ok(questions[0].confidence >= 0.7, `confidence was ${questions[0].confidence}`);
    assert.ok(questions[1].confidence >= 0.7, `confidence was ${questions[1].confidence}`);
  });

});


describe('detectQuestions — multi-select', () => {

  test('parses Correct Answer: A, C into array', () => {
    const { questions } = detectQuestions(MULTI_SELECT);
    assert.deepEqual(questions[0].correctAnswers, ['A', 'C']);
  });

  test('forced multi_select mode sets questionType = multi', () => {
    const { questions } = detectQuestions(MULTI_SELECT, { parsingMode: 'multi_select' });
    assert.equal(questions[0].questionType, 'multi');
  });

  test('auto mode detects multi when correctAnswers.length > 1', () => {
    const { questions } = detectQuestions(MULTI_SELECT);
    assert.equal(questions[0].questionType, 'multi');
  });

});


describe('detectQuestions — separate answer-key section', () => {

  test('strips answer-key section from body', () => {
    const { questions } = detectQuestions(ANSWER_KEY_SECTION);
    assert.equal(questions.length, 2, 'should detect 2 questions, not include answer-key lines as questions');
  });

  test('maps answer key entries to correct questions', () => {
    const { questions, answerKeyMap } = detectQuestions(ANSWER_KEY_SECTION);
    assert.deepEqual(answerKeyMap[1], ['C']);
    assert.deepEqual(answerKeyMap[2], ['B']);
    assert.deepEqual(questions[0].correctAnswers, ['C']);
    assert.deepEqual(questions[1].correctAnswers, ['B']);
  });

});


describe('detectQuestions — explanation extraction', () => {

  test('extracts explanation text', () => {
    const { questions } = detectQuestions(WITH_EXPLANATION);
    assert.ok(questions[0].explanation, 'explanation should be non-null');
    assert.ok(questions[0].explanation.includes('columnar'), 'explanation text should contain expected content');
  });

  test('high confidence when stem + options + answer + explanation present', () => {
    const { questions } = detectQuestions(WITH_EXPLANATION);
    assert.ok(questions[0].confidence >= 0.9, `confidence was ${questions[0].confidence}`);
  });

});


describe('detectQuestions — Q-prefix and "Question N" styles', () => {

  test('parses "Q1." prefix', () => {
    const { questions } = detectQuestions(Q_PREFIX_STYLE);
    assert.equal(questions[0].questionNumber, 1);
    assert.ok(questions[0].stem.includes('primary key'));
  });

  test('parses "Question 2." prefix', () => {
    const { questions } = detectQuestions(Q_PREFIX_STYLE);
    assert.equal(questions[1].questionNumber, 2);
    assert.ok(questions[1].stem.includes('NULL'));
  });

  test('answers correctly extracted for both prefix styles', () => {
    const { questions } = detectQuestions(Q_PREFIX_STYLE);
    assert.deepEqual(questions[0].correctAnswers, ['B']);
    assert.deepEqual(questions[1].correctAnswers, ['C']);
  });

});


describe('detectQuestions — true/false questions', () => {

  test('detects True/False option pairs as true_false type', () => {
    const { questions } = detectQuestions(TRUE_FALSE);
    assert.equal(questions[0].questionType, 'true_false');
    assert.equal(questions[1].questionType, 'true_false');
  });

  test('forced true_false mode overrides type detection', () => {
    const { questions } = detectQuestions(BASIC_MC, { parsingMode: 'true_false' });
    assert.equal(questions[0].questionType, 'true_false');
  });

  test('extracts correct answers for T/F questions', () => {
    const { questions } = detectQuestions(TRUE_FALSE);
    assert.deepEqual(questions[0].correctAnswers, ['A']);
    assert.deepEqual(questions[1].correctAnswers, ['B']);
  });

});


describe('detectQuestions — edge cases', () => {

  test('question with no options gets confidence < 0.5', () => {
    const { questions } = detectQuestions(NO_OPTIONS);
    assert.ok(questions[0].confidence < 0.5, `confidence should be low, was ${questions[0].confidence}`);
  });

  test('empty string returns zero questions', () => {
    const { questions, stats } = detectQuestions('');
    assert.equal(questions.length, 0);
    assert.equal(stats.total, 0);
  });

  test('whitespace-only string returns zero questions', () => {
    const { questions } = detectQuestions('   \n   \n   ');
    assert.equal(questions.length, 0);
  });

  test('rawText field preserves original block text', () => {
    const { questions } = detectQuestions(BASIC_MC);
    assert.ok(questions[0].rawText.length > 0);
    assert.ok(questions[0].rawText.includes('SQL'));
  });

  test('single question without number is still detected', () => {
    const single = `What is data governance?
A. Managing data pipelines
B. Policies for data quality and access
C. A type of database
D. A BI tool
Answer: B`;
    const { questions } = detectQuestions(single);
    assert.equal(questions.length, 1);
    assert.deepEqual(questions[0].correctAnswers, ['B']);
  });

  test('parseAnswerList handles A/C slash-separated format', () => {
    const text = `1. Multi-answer test
A. Option A
B. Option B
C. Option C
D. Option D
Answer: A/C`;
    const { questions } = detectQuestions(text);
    assert.deepEqual(questions[0].correctAnswers, ['A', 'C']);
  });

  test('parseAnswerList handles "A and C" format', () => {
    const text = `1. Multi-answer test
A. Option A
B. Option B
C. Option C
D. Option D
Answer: A and C`;
    const { questions } = detectQuestions(text);
    assert.deepEqual(questions[0].correctAnswers, ['A', 'C']);
  });

});


describe('detectQuestions — stats', () => {

  test('stats.total equals questions.length', () => {
    const { questions, stats } = detectQuestions(BASIC_MC);
    assert.equal(stats.total, questions.length);
  });

  test('stats.withAnswers counts questions with correctAnswers', () => {
    const { stats } = detectQuestions(BASIC_MC);
    assert.equal(stats.withAnswers, 2);
  });

  test('stats.withExplanations is 0 when no explanations', () => {
    const { stats } = detectQuestions(BASIC_MC);
    assert.equal(stats.withExplanations, 0);
  });

  test('stats.withExplanations is 1 for WITH_EXPLANATION fixture', () => {
    const { stats } = detectQuestions(WITH_EXPLANATION);
    assert.equal(stats.withExplanations, 1);
  });

  test('stats.avgConfidence is a number between 0 and 1', () => {
    const { stats } = detectQuestions(BASIC_MC);
    assert.ok(stats.avgConfidence >= 0 && stats.avgConfidence <= 1);
  });

  test('stats.highConfidence counts questions with confidence >= 0.7', () => {
    const { stats } = detectQuestions(BASIC_MC);
    assert.equal(stats.highConfidence, 2);
  });

  test('stats.singleChoice correct for basic MC', () => {
    const { stats } = detectQuestions(BASIC_MC);
    assert.equal(stats.singleChoice, 2);
    assert.equal(stats.multiSelect, 0);
    assert.equal(stats.trueFalse, 0);
  });

  test('stats.trueFalse correct for T/F fixture', () => {
    const { stats } = detectQuestions(TRUE_FALSE);
    assert.equal(stats.trueFalse, 2);
    assert.equal(stats.singleChoice, 0);
  });

  test('stats.multiSelect correct for multi-select fixture', () => {
    const { stats } = detectQuestions(MULTI_SELECT);
    assert.equal(stats.multiSelect, 1);
  });

});
