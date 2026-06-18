'use strict';

/**
 * question-importer/tests/question-detector.test.js
 * Standalone detector tests for running inside the question-importer package.
 * Symlinks to the same source as the root test file.
 *
 * Run with: node --test  (from question-importer/ directory)
 */

// Re-export root tests by delegating to the shared module
// This keeps a single source of truth while allowing `npm test` to work
// from inside the question-importer package directory as well.
require('../../tests/question-detector.test.js');
