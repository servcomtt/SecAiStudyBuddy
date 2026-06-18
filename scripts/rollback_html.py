from pathlib import Path

study_index_path = Path(__file__).resolve().parents[1] / 'content' / 'study-spa' / 'index.html'

with study_index_path.open(encoding='utf-8') as f:
    lines = f.readlines()

# Remove lines 1421-1714 (0-indexed: 1420-1713) — public layer HTML + app-layer wrapper
# Also remove the instructor sidebar (lines around 1905) and instructor pages
# First pass: identify markers
start_pub    = None  # first line after the "Public Header removed" comment
end_app_wrap = None  # the <div id="app-layer"> opening line
instr_start  = None  # <!-- ── Instructor Sidebar
instr_end    = None  # </nav> after instructor sidebar
pages_start  = None  # <!-- INSTRUCTOR PAGES
pages_end    = None  # </div><!-- /instructor-settings -->

for i, line in enumerate(lines):
    s = line.strip()
    if start_pub is None and '<header class="pub-header">' in s:
        start_pub = i
    if end_app_wrap is None and '<div id="app-layer">' in s:
        end_app_wrap = i
    if instr_start is None and '<!-- ── Instructor Sidebar' in line:
        instr_start = i
    if instr_start is not None and instr_end is None and i > instr_start and s == '</nav>':
        instr_end = i
    if pages_start is None and 'INSTRUCTOR PAGES' in line:
        pages_start = i
    if pages_start is not None and pages_end is None and 'page-instructor-settings' in line:
        # find the closing </div> after this
        pages_settings_start = i
    if pages_start is not None and pages_end is None and i > pages_start and '</div><!-- /main -->' in line:
        pages_end = i - 1  # keep /main div

print(f'pub HTML: lines {start_pub}-{end_app_wrap}')
print(f'instr sidebar: lines {instr_start}-{instr_end}')
print(f'instr pages: lines {pages_start}-{pages_end}')

# Build new lines by skipping the ranges (process in reverse order)
ranges_to_remove = sorted([
    (start_pub, end_app_wrap),       # public HTML + APP LAYER comment + opening div
    (instr_start, instr_end + 1),    # instructor sidebar nav
    (pages_start, pages_end + 1),    # instructor pages
], reverse=True)

result = list(lines)
for (s, e) in ranges_to_remove:
    if s is not None and e is not None:
        del result[s:e]
        print(f'  Removed lines {s}-{e} ({e-s} lines)')

with study_index_path.open('w', encoding='utf-8') as f:
    f.writelines(result)

print(f'Done. Updated {study_index_path}. New line count: {len(result)}')
