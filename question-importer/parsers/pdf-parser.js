'use strict';

/**
 * pdf-parser.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Extracts text and images from PDF files.
 *
 * Strategy:
 *   1. Try pdfjs-dist for native text extraction (fast, no OCR needed).
 *   2. If extracted text is too sparse (< MIN_CHARS_PER_PAGE per page on average),
 *      fall back to Tesseract.js OCR on rendered page images.
 *   3. Extract embedded images from each page and save them to disk.
 *
 * Returns:
 * {
 *   text        : string,          // full extracted / OCR'd text
 *   ocrUsed     : boolean,
 *   images      : [{ pageNum, index, buffer, mimeType, width, height }],
 *   pageCount   : number,
 *   warnings    : string[],
 * }
 */

const fs   = require('fs');
const path = require('path');

// Dynamic requires — these are prod deps in package.json
// We require lazily so the module can be loaded even when optional deps are absent
// (unit-test environments, etc.)
let pdfjs;
let Tesseract;
let { createCanvas } = {};  // canvas — required for pdf.js rendering

const MIN_CHARS_PER_PAGE = 80;   // below this → likely scanned, trigger OCR
const OCR_RENDER_SCALE   = 2.0;  // render scale for OCR quality

/**
 * parsePdf(filePath, outputDir)
 *
 * @param {string} filePath   - Absolute path to the PDF file
 * @param {string} outputDir  - Directory where extracted images will be saved
 * @returns {Promise<ParseResult>}
 */
async function parsePdf(filePath, outputDir) {
  const warnings = [];

  // ── Lazy-load dependencies ──────────────────────────────────────────────────
  try {
    pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
  } catch (e) {
    throw new Error('pdfjs-dist is not installed. Run: npm install pdfjs-dist');
  }

  let canvasFactory;
  try {
    const canvasMod = require('canvas');
    createCanvas = canvasMod.createCanvas;
    canvasFactory = buildCanvasFactory(createCanvas);
  } catch {
    warnings.push('canvas module not found — image extraction and OCR rendering disabled.');
    canvasFactory = null;
  }

  // ── Load PDF ────────────────────────────────────────────────────────────────
  const data = new Uint8Array(fs.readFileSync(filePath));
  const loadingTask = pdfjs.getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
  });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;

  // ── Text extraction pass ────────────────────────────────────────────────────
  const pageTexts = [];
  for (let p = 1; p <= pageCount; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const pageText = content.items
      .map(item => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
    pageTexts.push(pageText);
  }

  const totalChars    = pageTexts.reduce((s, t) => s + t.length, 0);
  const avgCharsPage  = pageCount > 0 ? totalChars / pageCount : 0;
  const needsOcr      = avgCharsPage < MIN_CHARS_PER_PAGE;

  let finalText = pageTexts.join('\n\n');
  let ocrUsed   = false;

  // ── OCR fallback ────────────────────────────────────────────────────────────
  if (needsOcr) {
    if (!canvasFactory) {
      warnings.push('OCR needed but canvas module is unavailable — text may be incomplete.');
    } else {
      try {
        Tesseract = require('tesseract.js');
        const ocrTexts = [];
        for (let p = 1; p <= pageCount; p++) {
          const page      = await pdf.getPage(p);
          const viewport  = page.getViewport({ scale: OCR_RENDER_SCALE });
          const canvas    = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
          const ctx       = canvas.getContext('2d');

          await page.render({ canvasContext: ctx, viewport }).promise;

          const imageDataUrl = canvas.toDataURL('image/png');
          const { data: { text } } = await Tesseract.recognize(imageDataUrl, 'eng', {
            logger: () => {},
          });
          ocrTexts.push(text.trim());
        }
        finalText = ocrTexts.join('\n\n');
        ocrUsed   = true;
      } catch (e) {
        warnings.push(`OCR failed: ${e.message} — using sparse native text.`);
      }
    }
  }

  // ── Image extraction ────────────────────────────────────────────────────────
  const images = [];
  if (canvasFactory && outputDir) {
    fs.mkdirSync(outputDir, { recursive: true });
    for (let p = 1; p <= pageCount; p++) {
      const page     = await pdf.getPage(p);
      const ops      = await page.getOperatorList();
      const imgNames = new Set();

      // Collect image XObject names from operator list
      for (let i = 0; i < ops.fnArray.length; i++) {
        if (
          ops.fnArray[i] === pdfjs.OPS.paintImageXObject ||
          ops.fnArray[i] === pdfjs.OPS.paintImageXObjectRepeat
        ) {
          imgNames.add(ops.argsArray[i][0]);
        }
      }

      let imgIdx = 0;
      for (const name of imgNames) {
        try {
          const imgData = await page.objs.get(name);
          if (!imgData || !imgData.data) continue;

          const { width, height, data: pixelData } = imgData;
          const canvas  = createCanvas(width, height);
          const ctx     = canvas.getContext('2d');
          const imgObj  = ctx.createImageData(width, height);
          imgObj.data.set(pixelData);
          ctx.putImageData(imgObj, 0, 0);

          const buffer   = canvas.toBuffer('image/png');
          const filename = `page${p}_img${imgIdx}.png`;
          const savePath = path.join(outputDir, filename);
          fs.writeFileSync(savePath, buffer);

          images.push({
            pageNum  : p,
            index    : imgIdx,
            filename,
            filePath : savePath,
            mimeType : 'image/png',
            width,
            height,
            buffer,
          });
          imgIdx++;
        } catch (imgErr) {
          warnings.push(`Could not extract image ${name} from page ${p}: ${imgErr.message}`);
        }
      }
    }
  }

  return { text: finalText, ocrUsed, images, pageCount, warnings };
}

// ── Canvas factory for pdf.js ─────────────────────────────────────────────────

function buildCanvasFactory(createCanvasFn) {
  return {
    create(width, height) {
      const canvas  = createCanvasFn(width, height);
      const context = canvas.getContext('2d');
      return { canvas, context };
    },
    reset(canvasAndCtx, width, height) {
      canvasAndCtx.canvas.width  = width;
      canvasAndCtx.canvas.height = height;
    },
    destroy(canvasAndCtx) {
      canvasAndCtx.canvas.width  = 0;
      canvasAndCtx.canvas.height = 0;
      canvasAndCtx.canvas  = null;
      canvasAndCtx.context = null;
    },
  };
}

module.exports = { parsePdf };
