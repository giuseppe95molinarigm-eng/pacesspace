# Crops each photo to exactly the part that shows in its frame (see build.mjs, "Photos cut to
# their frames"), so the PDF holds no image area outside the page margins.
#   python3 build/crop_images.py jobs.json
import json, sys
from PIL import Image
jobs = json.load(open(sys.argv[1]))
cache = {}
for j in jobs:
    im = cache.get(j['src']) or Image.open(j['src']).convert('RGB')
    cache[j['src']] = im
    x, y, w, h = (round(v) for v in j['crop'])
    x, y = max(0, x), max(0, y)
    im.crop((x, y, min(im.width, x + w), min(im.height, y + h))).save(j['out'], quality=92)
print(f'✓ {len(jobs)} photos cut to their frames')
