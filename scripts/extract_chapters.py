"""
Extract Chapters 1-8 from CompTIA SecAI+ Digital book.pdf using pdfplumber.
Run with: python extract_chapters.py
Output: chapter3_extracted.txt through chapter8_extracted.txt
"""

import pdfplumber
import re
import os

PDF_PATH = "H:/SecAIPlusStudyBuddy/CompTIA SecAI+ Digital book.pdf"
OUTPUT_DIR = "H:/SecAIPlusStudyBuddy"

# Approximate search windows for each chapter (0-indexed page numbers)
# We search within a window around the expected start to find exact boundaries
CHAPTER_SEARCH_WINDOWS = {
    3: (70, 95),    # Chapter 3: Databases and Data Acquisition
    4: (115, 135),  # Chapter 4: Data Quality
    5: (160, 185),  # Chapter 5: Data Analysis and Statistics
    6: (210, 235),  # Chapter 6: Data Analytics Tools
    7: (240, 270),  # Chapter 7: Data Visualization
    8: (290, 320),  # Chapter 8: Data Governance
}

CHAPTER_TITLES = {
    3: "Databases and Data Acquisition",
    4: "Data Quality",
    5: "Data Analysis and Statistics",
    6: "Data Analytics Tools",
    7: "Data Visualization with Reports and Dashboards",
    8: "Data Governance",
}


def find_chapter_start(pdf, chapter_num, search_start, search_end):
    """Scan pages in range to find where a chapter begins."""
    total_pages = len(pdf.pages)
    search_end = min(search_end, total_pages)

    # Patterns that indicate a chapter title page
    patterns = [
        re.compile(rf'chapter\s+{chapter_num}\b', re.IGNORECASE),
        re.compile(rf'\bchapter\s+{chapter_num}\b', re.IGNORECASE),
    ]

    best_match = None
    for page_num in range(search_start, search_end):
        page = pdf.pages[page_num]
        text = page.extract_text()
        if not text:
            continue
        for pattern in patterns:
            if pattern.search(text):
                # Prefer pages where "Chapter N" appears near the top
                lines = text.strip().split('\n')
                for i, line in enumerate(lines[:10]):
                    if pattern.search(line):
                        best_match = page_num
                        print(f"  Found Chapter {chapter_num} at PDF page {page_num+1} "
                              f"(line {i+1}): {line.strip()[:80]}")
                        return best_match
    return best_match


def extract_chapter(pdf, chapter_num, start_page, end_page):
    """Extract all text from start_page to end_page (0-indexed)."""
    total_pages = len(pdf.pages)
    end_page = min(end_page, total_pages)

    all_text = []
    all_text.append(f"{'='*70}")
    all_text.append(f"CHAPTER {chapter_num}: {CHAPTER_TITLES[chapter_num]}")
    all_text.append(f"{'='*70}")
    all_text.append(f"Extracted from PDF pages {start_page+1} to {end_page} "
                    f"(0-indexed: {start_page} to {end_page-1})")
    all_text.append("")

    pages_extracted = 0
    for page_num in range(start_page, end_page):
        page = pdf.pages[page_num]
        text = page.extract_text()
        if text and text.strip():
            all_text.append(f"\n--- Page {page_num+1} ---\n")
            all_text.append(text.strip())
            pages_extracted += 1

    print(f"  Extracted {pages_extracted} pages of text "
          f"(pages {start_page+1}–{end_page})")
    return "\n".join(all_text)


def main():
    if not os.path.exists(PDF_PATH):
        print(f"ERROR: PDF not found at {PDF_PATH}")
        return

    print(f"Opening: {PDF_PATH}")
    with pdfplumber.open(PDF_PATH) as pdf:
        total_pages = len(pdf.pages)
        print(f"Total pages in PDF: {total_pages}\n")

        # Step 1: Find all chapter start pages
        print("=== Locating chapter boundaries ===")
        chapter_starts = {}
        for ch_num in [3, 4, 5, 6, 7, 8]:
            win_start, win_end = CHAPTER_SEARCH_WINDOWS[ch_num]
            start = find_chapter_start(pdf, ch_num, win_start, win_end)
            if start is None:
                # Fallback: use the midpoint of the search window
                start = (win_start + win_end) // 2
                print(f"  WARNING: Could not find Chapter {ch_num} automatically. "
                      f"Using fallback page {start+1}.")
            chapter_starts[ch_num] = start

        # Step 2: Determine end pages (next chapter start - 1, or +60 for last)
        chapter_ends = {}
        chapters = sorted(chapter_starts.keys())
        for i, ch_num in enumerate(chapters):
            if i + 1 < len(chapters):
                next_ch = chapters[i + 1]
                chapter_ends[ch_num] = chapter_starts[next_ch]
            else:
                # Chapter 8: search up to 60 pages from its start
                chapter_ends[ch_num] = min(
                    chapter_starts[ch_num] + 65, total_pages
                )

        print()
        print("=== Chapter page ranges (1-indexed PDF pages) ===")
        for ch_num in chapters:
            print(f"  Chapter {ch_num}: pages {chapter_starts[ch_num]+1} "
                  f"to {chapter_ends[ch_num]}")
        print()

        # Step 3: Extract each chapter and save
        print("=== Extracting chapters ===")
        summary = {}
        for ch_num in chapters:
            print(f"\nChapter {ch_num}: {CHAPTER_TITLES[ch_num]}")
            text = extract_chapter(
                pdf, ch_num,
                chapter_starts[ch_num],
                chapter_ends[ch_num]
            )

            out_path = os.path.join(OUTPUT_DIR, f"chapter{ch_num}_extracted.txt")
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(text)

            file_size = os.path.getsize(out_path)
            print(f"  Saved to: {out_path} ({file_size:,} bytes)")

            # Collect headings for summary
            headings = []
            for line in text.split('\n'):
                stripped = line.strip()
                # Detect lines that look like headings:
                # all-caps words, or title-case short lines, or numbered sections
                if (stripped and len(stripped) < 100 and len(stripped) > 3
                        and (stripped.isupper()
                             or re.match(r'^[A-Z][A-Za-z\s,:\-/()]+$', stripped)
                             or re.match(r'^\d+\.\d*\s+[A-Z]', stripped))
                        and not stripped.startswith('---')):
                    headings.append(stripped)

            # Deduplicate while preserving order
            seen = set()
            unique_headings = []
            for h in headings:
                if h not in seen and not h.isdigit():
                    seen.add(h)
                    unique_headings.append(h)

            summary[ch_num] = unique_headings[:40]  # top 40 headings

    # Print final summary
    print()
    print("=" * 70)
    print("EXTRACTION COMPLETE — SUMMARY")
    print("=" * 70)
    for ch_num in chapters:
        print(f"\nChapter {ch_num}: {CHAPTER_TITLES[ch_num]}")
        print(f"  File: {OUTPUT_DIR}/chapter{ch_num}_extracted.txt")
        print(f"  Detected headings/sections:")
        for h in summary[ch_num][:20]:
            print(f"    - {h}")


if __name__ == "__main__":
    main()
