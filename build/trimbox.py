# Marks the trimmed page (TrimBox) inside each KDP sheet: the bleed sits on the outside edge,
# right on odd (right-hand) pages and left on even (left-hand) pages, plus top and bottom.
#   python3 build/trimbox.py book.pdf
import sys
import pymupdf

B = 9.0
doc = pymupdf.open(sys.argv[1])
W, H = 603.0, 810.0  # 8.375 × 11.25 in exactly (Chrome rounds the width up by a fraction of a point)
for i, page in enumerate(doc):
    page.set_mediabox(pymupdf.Rect(0, 0, W, H))
    r = page.rect
    x0 = 0 if i % 2 == 0 else B  # page 1 (index 0) is a right-hand page
    page.set_bleedbox(r)
    page.set_trimbox(pymupdf.Rect(x0, B, x0 + r.width - B, r.height - B))
doc.saveIncr()
print(f'✓ {sys.argv[1]}: {len(doc)} pages, {r.width / 72:.3f} × {r.height / 72:.3f} in with TrimBox')
