import path from 'node:path';
import { fileURLToPath } from 'node:url';

const libDir = path.dirname(fileURLToPath(import.meta.url));

export const studySourceIndexPath = path.resolve(libDir, '../../content/study-spa/index.html');
export const studySourceLabsPath = path.resolve(libDir, '../../content/study-spa/labs.js');
export const quizBankPath = path.resolve(libDir, '../../content/question-bank/questions.json');
export const notebooksDir = path.resolve(libDir, '../../content/notebooks');
