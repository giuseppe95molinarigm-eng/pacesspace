# Rebuilds the Caslon proof fonts (assets/fonts/local, not in git: licensed outlines) from the
# Type3 glyph programs Chrome embedded in the committed PDFs. The proof subset had no kerning or
# ligatures, so outlines, advance widths and the character map are all there is to restore.
#   git show <commit>:output/states/01_Alabama.pdf > a.pdf   (and the other committed PDFs)
#   python3 build/rebuild_proof_fonts.py assets/fonts/local a.pdf b.pdf …
# Styles are told apart by their descriptors (StemV, XHeight, CapHeight).
import sys, re, os, json
import pymupdf
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.t2CharStringPen import T2CharStringPen

outdir, pdfs = sys.argv[1], sys.argv[2:]
fonts = {}  # signature -> {gid: (width, unicode, ops)}, bbox

def tounicode(data):
    m = {}
    txt = data.decode('latin1')
    for blk in re.findall(r'beginbfchar(.*?)endbfchar', txt, re.S):
        for a, b in re.findall(r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', blk):
            m[int(a, 16)] = bytes.fromhex(b).decode('utf-16-be')
    for blk in re.findall(r'beginbfrange(.*?)endbfrange', txt, re.S):
        for a, b, c in re.findall(r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', blk):
            s = int(c, 16)
            for k in range(int(a, 16), int(b, 16) + 1):
                m[k] = chr(s + k - int(a, 16))
    return m

for f in pdfs:
    d = pymupdf.open(f)
    for x in range(1, d.xref_length()):
        try:
            if d.xref_get_key(x, 'Subtype') != ('name', '/Type3'):
                continue
        except Exception:
            continue
        fdx = int(d.xref_get_key(x, 'FontDescriptor')[1].split()[0])
        fam = d.xref_get_key(fdx, 'FontFamily')[1]
        if 'Caslon' not in fam:
            continue
        sig = tuple(d.xref_get_key(fdx, k)[1] for k in ('StemV', 'XHeight', 'CapHeight'))
        F = fonts.setdefault(sig, {'glyphs': {}, 'bbox': d.xref_get_key(x, 'FontBBox')[1]})
        first = int(d.xref_get_key(x, 'FirstChar')[1])
        widths = [float(w) for w in d.xref_get_key(x, 'Widths')[1].strip('[]').split()]
        enc = d.xref_object(x)
        diffs = re.search(r'/Differences \[(.*?)\]', enc, re.S).group(1).split()
        names = {}
        code = 0
        for t in diffs:
            if t.startswith('/'):
                names[code] = t[1:]; code += 1
            else:
                code = int(t)
        procs = dict(re.findall(r'/(g[0-9A-F]+) (\d+) 0 R', re.search(r'/CharProcs <<(.*?)>>', enc, re.S).group(1)))
        tu = tounicode(d.xref_stream(int(d.xref_get_key(x, 'ToUnicode')[1].split()[0])))
        for code, name in names.items():
            if code not in tu or name not in procs:
                continue
            gid = int(name[1:], 16)
            if gid in F['glyphs']:
                continue
            ops = d.xref_stream(int(procs[name])).decode('latin1')
            F['glyphs'][gid] = (widths[code - first], tu[code], ops)

def draw(ops, pen):
    toks = ops.split()
    st = []
    open_ = False
    for t in toks:
        if t in ('m', 'l', 'c', 'h', 're', 'f', 'f*', 'd0', 'd1', 'n', 'q', 'Q', 'cm', 'S', 'W'):
            n = [float(v) for v in st]
            st = []
            if t == 'm':
                if open_: pen.closePath()
                pen.moveTo((n[0], -n[1])); open_ = True
            elif t == 'l':
                pen.lineTo((n[0], -n[1]))
            elif t == 'c':
                pen.curveTo((n[0], -n[1]), (n[2], -n[3]), (n[4], -n[5]))
            elif t == 'h':
                if open_: pen.closePath(); open_ = False
            elif t == 're':
                x, y, w, h = n
                pen.moveTo((x, -y)); pen.lineTo((x + w, -y)); pen.lineTo((x + w, -y - h)); pen.lineTo((x, -y - h)); pen.closePath()
        else:
            st.append(t)
    if open_:
        pen.closePath()

STYLE = {('234', '424', '719'): 'CaslonProof-Regular', ('266', '426', '703'): 'CaslonProof-Italic', ('281', '750', '719'): 'CaslonProof-Bold'}
os.makedirs(outdir, exist_ok=True)
summary = {}
for i, (sig, F) in enumerate(sorted(fonts.items())):
    gl = F['glyphs']
    maxgid = max(gl)
    order = ['.notdef'] + [f'g{g:X}' for g in range(1, maxgid + 1)]
    charstrings, metrics, cmap = {}, {}, {}
    for g in range(0, maxgid + 1):
        name = '.notdef' if g == 0 else f'g{g:X}'
        pen = T2CharStringPen(0, None)
        w = 500
        if g in gl and g != 0:
            w, u, ops = gl[g]
            draw(ops, pen)
            if len(u) == 1:
                cmap[ord(u)] = name
        charstrings[name] = pen.getCharString()
        metrics[name] = (round(w), 0)
    bbox = [float(v) for v in F['bbox'].strip('[]').split()]
    asc, desc = round(-bbox[3]), -round(bbox[1])
    fam = STYLE.get(tuple(sig), f'CaslonProof-Unknown{i}')
    fb = FontBuilder(1000, isTTF=False)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupCFF(fam, {'FullName': fam}, charstrings, {})
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=asc, descent=desc)
    fb.setupNameTable({'familyName': fam, 'styleName': 'Regular'})
    fb.setupOS2(sTypoAscender=asc, sTypoDescender=desc, usWinAscent=asc, usWinDescent=-desc)
    fb.setupPost()
    path = os.path.join(outdir, f'{fam}.otf')
    fb.save(path)
    summary[path] = {'sig': sig, 'glyphs': len(gl), 'chars': ''.join(sorted(gl[g][1] for g in gl))[:120]}
print(json.dumps(summary, indent=1, ensure_ascii=False))
