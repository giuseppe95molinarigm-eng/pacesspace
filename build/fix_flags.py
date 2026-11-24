"""Pull the stars in from the edge of the blue canton on flags whose artwork had them touching it
(client, 24 Nov: stars looked cut off on the paperback proof). The canton's star pattern is
scaled to 86% and centred on a plain navy field; stripes are untouched.
Usage: python3 build/fix_flags.py assets/flags/states/<state>.png ..."""
import sys
import numpy as np
from PIL import Image

SCALE = 0.86
for f in sys.argv[1:]:
    im = Image.open(f).convert('RGB')
    a = np.array(im).astype(int)
    navy = (a[..., 2] > 60) & (a[..., 0] < 60) & (a[..., 1] < 80)
    ys, xs = np.where(navy)
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    canton = im.crop((x0, y0, x1, y1))
    colour = tuple(int(v) for v in np.median(a[navy], axis=0))
    w, h = canton.size
    small = canton.resize((round(w * SCALE), round(h * SCALE)), Image.LANCZOS)
    field = Image.new('RGB', (w, h), colour)
    field.paste(small, ((w - small.width) // 2, (h - small.height) // 2))
    im.paste(field, (x0, y0))
    im.save(f, optimize=True)
    print('fixed', f)
