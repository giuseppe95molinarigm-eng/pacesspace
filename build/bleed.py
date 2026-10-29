# Print version with bleed: every page grows by the bleed on all four sides and the outermost
# strip of each page is stretched into it (navy hero bands, footers, closer pages and full-bleed
# photo spreads), so the trim never leaves a white sliver. TrimBox marks the 8.25 × 11 in page.
#   python3 build/bleed.py in.pdf out.pdf [bleed_pt=9]
import sys
import pymupdf

src = pymupdf.open(sys.argv[1])
b = float(sys.argv[3]) if len(sys.argv) > 3 else 9.0  # 0.125 in
out = pymupdf.open()
for i, p in enumerate(src):
    w, h = p.rect.width, p.rect.height
    page = out.new_page(width=w + 2 * b, height=h + 2 * b)
    page.show_pdf_page(pymupdf.Rect(b, b, b + w, b + h), src, i)
    e = 0.6  # width of the edge strip that is stretched into the bleed
    strips = [
        (pymupdf.Rect(0, b, b, b + h), pymupdf.Rect(0, 0, e, h)),                    # left
        (pymupdf.Rect(b + w, b, w + 2 * b, b + h), pymupdf.Rect(w - e, 0, w, h)),    # right
        (pymupdf.Rect(b, 0, b + w, b), pymupdf.Rect(0, 0, w, e)),                    # top
        (pymupdf.Rect(b, b + h, b + w, h + 2 * b), pymupdf.Rect(0, h - e, w, h)),    # bottom
        (pymupdf.Rect(0, 0, b, b), pymupdf.Rect(0, 0, e, e)),                        # corners
        (pymupdf.Rect(b + w, 0, w + 2 * b, b), pymupdf.Rect(w - e, 0, w, e)),
        (pymupdf.Rect(0, b + h, b, h + 2 * b), pymupdf.Rect(0, h - e, e, h)),
        (pymupdf.Rect(b + w, b + h, w + 2 * b, h + 2 * b), pymupdf.Rect(w - e, h - e, w, h)),
    ]
    for dst, clip in strips:
        page.show_pdf_page(dst, src, i, clip=clip, keep_proportion=False)
    page.set_bleedbox(page.rect)
    page.set_trimbox(pymupdf.Rect(b, b, b + w, b + h))
out.save(sys.argv[2], garbage=3, deflate=True)
print(f'✓ {sys.argv[2]}: {len(out)} pages with {b / 72:.3f} in bleed')
