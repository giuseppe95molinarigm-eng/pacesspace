# Lays out the option pages (screenshots) two by two as spreads with a caption, into one PDF.
import json, sys
from PIL import Image, ImageDraw, ImageFont
items = json.load(open(sys.argv[1]))
groups = []
for it in items:
    if groups and groups[-1][0] == it['option'] and len(groups[-1][1]) < 2:
        groups[-1][1].append(it['file'])
    else:
        groups.append((it['option'], [it['file']]))
font = None
for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
    try: font = ImageFont.truetype(f, 34)
    except OSError: pass
sheets = []
for caption, files in groups:
    pages = [Image.open(f).convert('RGB') for f in files]
    w, h = pages[0].size
    sheet = Image.new('RGB', (2 * w + 160, h + 190), '#e9e6df')
    for k, p in enumerate(pages):
        sheet.paste(p, (80 + k * w, 130))
    ImageDraw.Draw(sheet).text((80, 50), caption, fill='#1d3864', font=font or ImageFont.load_default())
    sheets.append(sheet)
sheets[0].save(sys.argv[2], save_all=True, append_images=sheets[1:], resolution=150)
print(f'✓ {sys.argv[2]} ({len(sheets)} sheets)')
