'use strict';

/**
 * docx-parser.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Extracts text and embedded images from DOCX files using mammoth.
 *
 * Returns:
 * {
 *   text     : string,          // plain text content of the document
 *   images   : [{ index, buffer, mimeType, originalName }],
 *   warnings : string[],
 * }
 */

const fs   = require('fs');
const path = require('path');

let mammoth;

/**
 * parseDocx(filePath, outputDir)
 *
 * @param {string} filePath   - Absolute path to the .docx file
 * @param {string} outputDir  - Directory where extracted images will be saved
 * @returns {Promise<DocxResult>}
 */
async function parseDocx(filePath, outputDir) {
  const warnings = [];

  // Lazy-load mammoth
  try {
    mammoth = require('mammoth');
  } catch {
    throw new Error('mammoth is not installed. Run: npm install mammoth');
  }

  // ── Extract plain text ──────────────────────────────────────────────────────
  let rawText = '';
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    rawText = result.value || '';
    if (result.messages && result.messages.length > 0) {
      result.messages.forEach(m => {
        if (m.type === 'warning' || m.type === 'error') {
          warnings.push(`mammoth: ${m.message}`);
        }
      });
    }
  } catch (err) {
    throw new Error(`Failed to extract text from DOCX: ${err.message}`);
  }

  // ── Clean up text ───────────────────────────────────────────────────────────
  // mammoth preserves paragraph structure with newlines; normalise multiple blanks
  const text = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // ── Extract embedded images ─────────────────────────────────────────────────
  const images = [];
  if (outputDir) {
    fs.mkdirSync(outputDir, { recursive: true });

    // mammoth.convertToHtml gives us access to image data via the convertImage callback
    let imgIndex = 0;
    try {
      await mammoth.convertToHtml(
        { path: filePath },
        {
          convertImage: mammoth.images.imgElement(async (image) => {
            try {
              const buffer      = await image.read();
              const mimeType    = image.contentType || 'image/png';
              const ext         = mimeTypeToExt(mimeType);
              const filename    = `docx_img${imgIndex}.${ext}`;
              const savePath    = path.join(outputDir, filename);

              fs.writeFileSync(savePath, buffer);

              images.push({
                index        : imgIndex,
                filename,
                filePath     : savePath,
                mimeType,
                buffer,
                width        : null,   // mammoth doesn't expose dimensions
                height       : null,
              });
              imgIndex++;
            } catch (imgErr) {
              warnings.push(`Could not extract image ${imgIndex}: ${imgErr.message}`);
            }
            return {};  // returning empty object suppresses the <img> tag in HTML
          }),
        }
      );
    } catch (convErr) {
      warnings.push(`Image extraction pass failed: ${convErr.message}`);
    }
  }

  return { text, images, warnings };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mimeTypeToExt(mimeType) {
  const map = {
    'image/png'  : 'png',
    'image/jpeg' : 'jpg',
    'image/gif'  : 'gif',
    'image/webp' : 'webp',
    'image/bmp'  : 'bmp',
    'image/tiff' : 'tiff',
    'image/svg+xml' : 'svg',
    'image/emf'  : 'emf',
    'image/wmf'  : 'wmf',
  };
  return map[mimeType] || 'png';
}

module.exports = { parseDocx };
