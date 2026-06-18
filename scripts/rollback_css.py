from pathlib import Path

study_index_path = Path(__file__).resolve().parents[1] / 'content' / 'study-spa' / 'index.html'

with study_index_path.open(encoding='utf-8') as f:
    lines = f.readlines()

css_start = None
css_end = None

for i, line in enumerate(lines):
    if css_start is None and 'PUBLIC / MARKETING LAYER' in line:
        css_start = i - 1  # include the /* line before
    if css_start is not None and css_end is None and i > css_start:
        if line.strip() == '</style>':
            css_end = i  # keep </style>
            break

print(f'CSS block: lines {css_start}-{css_end} ({css_end - css_start} lines to remove)')

del lines[css_start:css_end]
print(f'New line count: {len(lines)}')

with study_index_path.open('w', encoding='utf-8') as f:
    f.writelines(lines)
print(f'Done. Updated {study_index_path}.')
