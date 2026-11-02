// Kindle / EPUB edition: a reflowable EPUB 3 built from the same corrected text as the print book.
// node build/ebook.mjs  →  output/Made_in_the_USA_eBook.epub
//
// Pictures: the dish photos (full frame, not the print crops), each state's landscape inside its
// outline (rendered from the print hero art), the state flags and the culinary map (cut from the
// print PDF, so run build.mjs first). Text: no fixed layout, no page numbers; the reader's own
// font and size apply to the body, the titles keep the book's Cormorant Garamond.
import { mkdir, writeFile, rm, readFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright-core';

import * as frontMatter from '../src/content/front-matter.mjs';
import { PHOTO_NOTES } from '../src/content/food-shots.mjs';
import { readManuscript, readBackMatter, styleText } from './manuscript.mjs';
import { fixBackMatter } from './backmatter.mjs';
import { heroPage, dishIllustrations } from '../src/pages.mjs';
import { recipeLookup } from '../src/matter.mjs';
import { starRule, flatStar } from '../src/components.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANUSCRIPT = path.join(root, 'manuscript/Made_in_the_USA_BASE.docx');
const PRINT_PDF = path.join(root, 'output/Made_in_the_USA_Complete.pdf');
const work = path.join(root, 'dist/ebook');
const OEBPS = path.join(work, 'OEBPS');
const OUT = path.join(root, 'output/Made_in_the_USA_eBook.epub');

const { chapters } = await readManuscript(MANUSCRIPT);
const back = fixBackMatter(await readBackMatter(MANUSCRIPT), chapters);
const styled = (v) => (typeof v === 'string' ? styleText(v) : Array.isArray(v) ? v.map(styled)
  : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, styled(x)])) : v);
const fm = Object.fromEntries(Object.entries(frontMatter).map(([k, v]) => [k, styled(v)]));

// Word joiners keep print lines together; e-readers reflow, and some Kindle fonts lack the glyph.
const clean = (s) => String(s).replace(/⁠/g, '');
const x = (s) => clean(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const xi = (s) => clean(s).replace(/&(?![a-z]+;|#\d+;)/g, '&amp;'); // text that carries its own <i>
const idOf = (t) => 'r-' + clean(t).toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const stateFile = (slug) => `state-${slug}.xhtml`;

await rm(work, { recursive: true, force: true });
for (const d of ['META-INF', 'OEBPS/images', 'OEBPS/fonts', 'OEBPS/text']) await mkdir(path.join(work, d), { recursive: true });

// ------------------------------------------------------------------ pictures
const executablePath = process.env.CHROMIUM_PATH
  || ['/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => existsSync(p));
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage({ deviceScaleFactor: 3 });
page.setDefaultTimeout(0);
// Pages are loaded from a file: an about:blank page may not read file:// pictures.
const show = async (htmlText) => { const f = path.join(work, 'tmp/page.html'); await writeFile(f, htmlText); await page.goto(pathToFileURL(f).href, { waitUntil: 'load' }); };
const shell = (body, css = '') => `<!doctype html><html><head><meta charset="utf-8">
<base href="${pathToFileURL(root + '/').href}"><link rel="stylesheet" href="src/styles/book.css">
<style>body{margin:0;background:#fff} ${css}</style></head><body>${body}</body></html>`;

// Ornaments: the book's red star rule and single star.
const tmpPng = path.join(work, 'tmp');
await mkdir(tmpPng, { recursive: true });
await mkdir(path.join(work, 'tmp'), { recursive: true });
await show(shell(`<div id="rule" style="display:inline-block;padding:2pt">${starRule()}</div>
  <div id="star" style="display:inline-block;padding:1pt">${flatStar({ size: 12.8, color: '#a33522' })}</div>`));
await page.locator('#rule').screenshot({ path: path.join(OEBPS, 'images/star-rule.png'), omitBackground: true });
await page.locator('#star').screenshot({ path: path.join(OEBPS, 'images/star.png'), omitBackground: true });

// Each state's landscape inside its outline, as on the print hero page (no frame, flag or title).
await page.setViewportSize({ width: 600, height: 800 });
for (const ch of chapters) {
  await show(shell(heroPage(ch), `.hero{background:#fff!important}.hero .frame,.hero .state-name,.hero .hero-rule,.hero .nickname{display:none}
    .recto.hero .hero-inner,.hero .hero-inner{transform:none}`));
  // SVG <image> elements are not in document.images: decode their pictures before the shot.
  await page.evaluate(() => Promise.all([...document.querySelectorAll('svg image')].map((el) => {
    const im = new Image(); im.src = el.href.baseVal; return im.decode().catch(() => {});
  })));
  await page.waitForTimeout(300);
  await page.locator('.silhouette').screenshot({ path: path.join(tmpPng, `sil-${ch.slug}.png`) });
}
await browser.close();

// Resize and compress with Pillow; the map comes from the print PDF (pages 10–11).
const jobs = [];
const images = []; // [file, alt-less id] for the manifest
for (const ch of chapters) {
  jobs.push(['jpg', path.join(tmpPng, `sil-${ch.slug}.png`), path.join(OEBPS, `images/sil-${ch.slug}.jpg`), 1200]);
  images.push(`images/sil-${ch.slug}.jpg`);
  const flag = path.join(root, `assets/flags/states/${ch.slug}.png`);
  if (existsSync(flag)) { jobs.push(['png', flag, path.join(OEBPS, `images/flag-${ch.slug}.png`), 360]); images.push(`images/flag-${ch.slug}.png`); }
  dishIllustrations(ch).forEach((_, n) => {
    const src = path.join(root, `assets/img/states/${ch.slug}/dish-${n + 1}.jpg`);
    if (!existsSync(src)) throw new Error(`Missing ${src}`);
    jobs.push(['jpg', src, path.join(OEBPS, `images/dish-${ch.slug}-${n + 1}.jpg`), 1400]);
    images.push(`images/dish-${ch.slug}-${n + 1}.jpg`);
  });
}
images.push('images/star-rule.png', 'images/star.png', 'images/map.jpg');
await writeFile(path.join(work, 'jobs.json'), JSON.stringify(jobs));
execFileSync('python3', ['-c', `
import json, sys, fitz
from PIL import Image
for kind, src, dst, w in json.load(open(sys.argv[1])):
    im = Image.open(src)
    if kind == 'jpg':
        if im.mode in ('RGBA', 'LA', 'P'):
            im = im.convert('RGBA'); bg = Image.new('RGB', im.size, 'white'); bg.paste(im, mask=im.split()[3]); im = bg
        im = im.convert('RGB')
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    if kind == 'jpg': im.save(dst, quality=78, optimize=True, progressive=False)
    else: im.save(dst, optimize=True)
doc = fitz.open(sys.argv[2]); dpi = 220; s = dpi / 72
halves = []
for n in (9, 10):
    pm = doc[n].get_pixmap(dpi=dpi, clip=fitz.Rect(0, 140, 594, 738))
    halves.append(Image.frombytes('RGB', (pm.width, pm.height), pm.samples))
m = Image.new('RGB', (halves[0].width * 2, halves[0].height), 'white')
m.paste(halves[0], (0, 0)); m.paste(halves[1], (halves[0].width, 0))
bbox = Image.eval(m.convert('L'), lambda v: 255 if v < 245 else 0).getbbox()
m = m.crop((max(bbox[0] - 30, 0), max(bbox[1] - 30, 0), min(bbox[2] + 30, m.width), min(bbox[3] + 30, m.height)))
m.save(sys.argv[3], quality=85, optimize=True)
`, path.join(work, 'jobs.json'), PRINT_PDF, path.join(OEBPS, 'images/map.jpg')], { stdio: 'inherit' });

// Title fonts (SIL Open Font License), converted to OpenType for Kindle.
const fonts = [
  ['cormorant-garamond-latin-600-normal', 'Cormorant Garamond', 600, 'normal'],
  ['cormorant-garamond-latin-700-normal', 'Cormorant Garamond', 700, 'normal'],
  ['cormorant-garamond-latin-700-italic', 'Cormorant Garamond', 700, 'italic'],
  ['montserrat-latin-700-normal', 'Montserrat', 700, 'normal'],
];
execFileSync('python3', ['-c', `
import sys
from fontTools.ttLib import TTFont
for name in sys.argv[2:]:
    f = TTFont(f'{sys.argv[1]}/assets/fonts/{name}.woff2'); f.flavor = None
    f.save(f'${OEBPS}/fonts/{name}.ttf')
`, root, ...fonts.map((f) => f[0])]);

// ------------------------------------------------------------------ pages
const CSS = `
${fonts.map(([file, fam, w, st]) => `@font-face { font-family: "${fam}"; font-weight: ${w}; font-style: ${st}; src: url(../fonts/${file}.ttf); }`).join('\n')}
body { margin: 0 5%; line-height: 1.45; widows: 2; orphans: 2; }
p { margin: 0; text-indent: 1.2em; text-align: justify; }
p.first, .noindent, h1 + p, h2 + p, h3 + p, .rule + p, .flag + p { text-indent: 0; }
h1, h2, h3, h4, .kicker, .nickname, .tagline, .yield { text-indent: 0; text-align: center; hyphens: none; -webkit-hyphens: none; page-break-after: avoid; }
h1 { font-family: "Cormorant Garamond", serif; font-weight: 600; font-size: 1.9em; line-height: 1.15; letter-spacing: .05em; color: #1d3864; margin: 1.6em 0 .3em; }
h2 { font-family: "Cormorant Garamond", serif; font-weight: 700; font-size: 1.45em; line-height: 1.2; letter-spacing: .04em; color: #a33522; margin: 1.4em 0 .3em; }
h2.prose-h { color: #1d3864; font-size: 1.3em; }
h3 { font-family: "Montserrat", sans-serif; font-weight: 700; font-size: .72em; letter-spacing: .14em; color: #1d3864; margin: 1.5em 0 .5em; }
h3.group { font-family: "Cormorant Garamond", serif; font-size: 1.15em; letter-spacing: .02em; color: #a33522; text-align: left; margin: 1.2em 0 .2em; }
h4 { font-family: "Montserrat", sans-serif; font-weight: 700; font-size: .66em; letter-spacing: .12em; color: #1d3864; text-align: left; margin: 1em 0 .3em; }
.kicker { font-family: "Montserrat", sans-serif; font-weight: 700; font-size: .62em; letter-spacing: .2em; color: #a33522; margin: 2em 0 0; }
.rule { text-align: center; text-indent: 0; margin: .4em 0 1.1em; }
.rule img { width: 9em; max-width: 60%; }
.ornament { text-align: center; text-indent: 0; margin: 1.2em 0; }
.ornament img { width: 1.1em; }
.deck { font-style: italic; text-align: center; text-indent: 0; margin: 0 4% 1.2em; }
.deck i { font-style: normal; }
.closing { font-style: italic; text-align: center; text-indent: 0; }
.center { text-align: center; text-indent: 0; }
.chapter { page-break-before: always; }
/* state opener */
.opener h1 { font-size: 2.3em; color: #a33522; margin-top: 1.2em; }
.nickname { font-family: "Cormorant Garamond", serif; font-style: italic; font-weight: 700; font-size: 1.3em; color: #1d3864; margin: 0 0 1.2em; }
.sil { text-align: center; text-indent: 0; margin: 0; }
.sil img { max-width: 100%; max-height: 70vh; }
.story { page-break-before: always; }
.flag { text-align: center; text-indent: 0; margin: 1.5em 0 1em; }
.flag img { width: 6em; border: 1px solid #ccc; }
/* recipes */
.recipe { page-break-before: always; }
.photo { text-align: center; text-indent: 0; margin: 0 0 1em; page-break-inside: avoid; }
.photo img { max-width: 100%; }
.tagline { font-style: italic; color: #1d3864; margin: 0 6% .5em; }
.yield { font-size: .9em; margin: 0; }
ul.ing { margin: 0 0 .6em 1.2em; padding: 0; }
ul.ing li { margin: 0 0 .2em; text-align: left; }
ul.ing li.note { list-style: none; font-style: italic; font-size: .92em; }
p.step { text-indent: 0; text-align: left; margin: 0 0 .6em; }
p.step .n { font-weight: bold; color: #a33522; }
p.step .lead { font-style: italic; }
p.note { text-indent: 0; font-style: italic; font-size: .92em; margin: .6em 0; }
.box { border: 1px solid #1d3864; margin: 1.2em 0; padding: 0 0 .5em; page-break-inside: avoid; }
.box h4 { background-color: #1d3864; color: #ffffff; text-align: center; margin: 0 0 .5em; padding: .35em .5em; }
.box.tip { border-color: #bb9554; background-color: #f6f1e7; }
.box.tip h4 { background-color: transparent; color: #a33522; }
.box p, .box li { text-align: left; text-indent: 0; font-size: .92em; }
.box p { margin: 0 .8em .4em; font-style: italic; }
.box ul { margin: 0 .8em 0 2em; padding: 0; }
.box li { margin: 0 0 .3em; }
/* lists in the back matter */
ul.items { list-style: none; margin: 0 0 .8em; padding: 0; }
ul.items li { text-indent: -1.2em; margin: 0 0 .25em 1.2em; text-align: left; }
.state { font-style: italic; color: #555; }
a { color: inherit; text-decoration: none; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; }
th, td { text-align: left; padding: .35em .4em; border-bottom: 1px solid #ccc; font-size: .92em; vertical-align: top; }
th { font-family: "Montserrat", sans-serif; font-size: .66em; letter-spacing: .1em; color: #1d3864; }
.toc ul { list-style: none; padding: 0; margin: 0; }
.toc li { margin: .3em 0; text-align: left; }
.toc li.part { margin-top: 1em; font-family: "Montserrat", sans-serif; font-weight: 700; font-size: .7em; letter-spacing: .14em; color: #a33522; }
.title-page { text-align: center; margin-top: 18%; }
.title-page .t1 { font-family: "Cormorant Garamond", serif; font-weight: 700; font-size: 1.6em; letter-spacing: .2em; color: #1d3864; margin: 0; }
.title-page .t2 { font-family: "Cormorant Garamond", serif; font-weight: 700; font-size: 3.4em; letter-spacing: .08em; color: #a33522; margin: 0; line-height: 1.1; }
.title-page .t3 { font-family: "Montserrat", sans-serif; font-weight: 700; font-size: .8em; letter-spacing: .22em; color: #1d3864; margin: .4em 0 1.2em; }
.title-page .by { font-family: "Montserrat", sans-serif; font-weight: 700; font-size: .75em; letter-spacing: .24em; color: #1d3864; margin-top: 3em; }
.copyright p { text-indent: 0; text-align: left; font-size: .85em; margin: 0 0 .7em; }
.dedication p.to { font-style: italic; text-indent: 0; margin-top: 1.2em; }
`;

const files = []; // { id, href, title, html }
const doc = (title, body, cls = '') => `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en-US" xml:lang="en-US">
<head><meta charset="utf-8"/><title>${x(title)}</title><link rel="stylesheet" type="text/css" href="../css/book.css"/></head>
<body${cls ? ` class="${cls}"` : ''}>
${body}
</body></html>`;
const add = (id, title, body, extra = {}) => files.push({ id, href: `text/${id}.xhtml`, title, html: doc(title, body), ...extra });
const RULE = '<div class="rule"><img src="../images/star-rule.png" alt=""/></div>';
const ORN = '<div class="ornament"><img src="../images/star.png" alt=""/></div>';
const head = (kicker, title, id) => `${kicker ? `<p class="kicker">${x(kicker)}</p>` : ''}<h1${id ? ` id="${id}"` : ''}>${x([].concat(title).join(' '))}</h1>${RULE}`;
const box = (title, items, intro = '', tip = false) => `<div class="box${tip ? ' tip' : ''}"><h4>${x(title)}</h4>${intro ? `<p>${x(intro)}</p>` : ''}<ul>${items.map((t) => `<li>${x(t)}</li>`).join('')}</ul></div>`;
const paras = (list) => list.map((p, i) => `<p${i === 0 ? ' class="first"' : ''}>${x(p)}</p>`).join('\n');

// Title page and copyright (the ebook has no ISBN of its own; the hardcover's is listed as such).
add('title', 'Made in the USA', `<section epub:type="titlepage" class="title-page">
  <p class="t1">MADE IN THE</p><p class="t2">USA</p><p class="t3">A PLATE FOR EVERY STATE</p>${RULE}
  <p class="center">${x(fm.cover.tagline.replace(/\s+·\s+/g, ' · '))}</p>
  <p class="by">${x(fm.cover.author)}</p></section>`);
const c = fm.copyright;
add('copyright', 'Copyright', `<section epub:type="copyright-page" class="copyright">
  <p><i>${x(c.title)}</i></p>${c.lines.map((l) => `<p>${x(l)}</p>`).join('')}
  <p>Hardcover ISBN: ${x(c.isbn)}<br/>Library of Congress Control Number: ${x(c.lccn)}</p>
  <p>${x(c.closing[0])} Kindle edition.</p></section>`);
add('dedication', 'Dedication', `<section epub:type="dedication" class="dedication">${ORN}
  ${fm.dedication.stanzas.map(([to, text]) => `<p class="to">${x(to)}</p><p class="noindent">${x(text)}</p>`).join('')}
  ${ORN}${fm.dedication.closing.map((l) => `<p class="closing">${x(l)}</p>`).join('')}</section>`);

// Contents: written after the chapters are known (below), placed here in the reading order.
const tocIndex = files.length;

add('welcome', 'Welcome to Our Place', `<section epub:type="foreword">${head('', fm.welcome.title.join(' '))}
  ${paras(fm.welcome.paragraphs)}${ORN}${fm.welcome.closing.map((l) => `<p class="closing">${x(l)}</p>`).join('')}</section>`, { toc: 'Welcome to Our Place' });
fm.notes.forEach((n, i) => {
  const body = n.blocks.map(([t, v, items], k) => {
    if (t === 'p') return `<p${k === 0 || ['h2', 'h3', 'deck'].includes(n.blocks[k - 1]?.[0]) ? ' class="first"' : ''}>${x(v)}</p>`;
    if (t === 'deck') return `<p class="deck">${x(v)}</p>`;
    if (t === 'h2') return `<h2 class="prose-h">${x(v)}</h2>`;
    if (t === 'h3') return `<h4>${x(v)}</h4>`;
    if (t === 'callout') return box(v, items);
    throw new Error(`notes block ${t}`);
  }).join('\n');
  add(`notes-${i + 1}`, n.title.join(' '), `<section class="chapter">${head(n.kicker, n.title.join(' '))}${body}</section>`, { toc: i === 0 ? 'Notes from the Kitchen' : null });
});
const k = fm.temperatures;
add('temperatures', 'Temperatures & Doneness', `<section class="chapter">${head(k.kicker, k.title.join(' '))}
  <p class="deck">${x(k.intro)}</p><p class="first">${x(k.lead)}</p>
  <table><thead><tr>${k.table.head.map((h) => `<th>${x(h.toUpperCase())}</th>`).join('')}</tr></thead>
  <tbody>${k.table.rows.map((r) => `<tr>${r.map((v) => `<td>${x(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>
  <p class="first">${x(k.after)}</p>${ORN}<p class="closing">${x(k.closing)}</p></section>`);
add('map', 'Our Culinary Map', `<section class="chapter">${head('', 'OUR CULINARY MAP')}<p class="deck">${x(fm.map.intro)}</p>
  <div class="photo"><img src="../images/map.jpg" alt="Map of the United States with a landscape photograph inside each state"/></div></section>`, { toc: 'Our Culinary Map' });

// ------------------------------------------------------------------ states
function recipeHtml(ch, r, photos, extraBelow) {
  const out = [];
  for (const p of photos) out.push(`<div class="photo"><img src="../images/${p}" alt="${x(r.title)}"/></div>`);
  out.push(`<h2 id="${idOf(r.title)}">${x(r.title)}</h2>`);
  if (r.tagline) out.push(`<p class="tagline">${x(r.tagline)}</p>`);
  if (r.yield) out.push(`<p class="yield">${x(r.yield)}</p>`);
  out.push(RULE);
  let step = 0, list = null, callout = null;
  const flushList = () => { if (list) out.push(`<ul class="ing">${list.join('')}</ul>`); list = null; };
  const flushCallout = () => {
    if (callout) out.push(box(callout.title, callout.items, '', /TIME-SAVER/i.test(callout.title)));
    if (callout && /NOTES/i.test(callout.title) && extraBelow) { out.push(box(extraBelow.title, extraBelow.items, extraBelow.intro)); extraBelow = null; }
    callout = null;
  };
  for (const [n, b] of r.blocks.entries()) {
    if (b.type === 'step-sub' && r.blocks[n + 1]?.type === 'callout-item') { flushList(); flushCallout(); callout = { title: b.text.toUpperCase(), items: [] }; continue; }
    if (b.type === 'note' && list && b.text.length < 60) { list.push(`<li class="note">${x(b.text)}</li>`); continue; }
    if (b.type !== 'ingredient' && b.type !== 'ingredient-sub') flushList();
    if (b.type !== 'callout-item' && b.type !== 'callout-title') flushCallout();
    switch (b.type) {
      case 'heading': out.push(`<h3>${x(b.text)}</h3>`); break;
      case 'ingredient-sub': flushList(); out.push(`<h4>${x(b.text.toUpperCase())}</h4>`); list = []; break;
      case 'ingredient': (list ||= []).push(`<li>${x(b.text)}</li>`); break;
      case 'note': out.push(`<p class="note">${x(b.text)}</p>`); break;
      case 'step-sub': out.push(`<h4>${x(b.text)}</h4>`); break;
      case 'step': {
        step += 1;
        const [lead, text] = b.parts;
        out.push(`<p class="step"><span class="n">${step}.</span> ${lead ? `<span class="lead">${x(lead)}:</span> ` : ''}${x(text)}</p>`);
        break;
      }
      case 'callout-title': callout = { title: b.text, items: [] }; break;
      case 'callout-item': (callout ||= { title: 'NOTES & TIPS', items: [] }).items.push(b.text); break;
      default: throw new Error(`recipe block ${b.type}`);
    }
  }
  flushList(); flushCallout();
  if (extraBelow) out.push(box(extraBelow.title, extraBelow.items, extraBelow.intro));
  return `<section class="recipe" epub:type="chapter">${out.join('\n')}</section>`;
}

const recipeHref = new Map();
for (const ch of chapters) {
  const photos = dishIllustrations(ch).map((_, n) => `dish-${ch.slug}-${n + 1}.jpg`);
  const perRecipe = ch.recipes.map((_, i) => (photos.length === ch.recipes.length ? [photos[i]] : i === 0 ? photos : []));
  const below = styled(PHOTO_NOTES[ch.slug]?.below || null);
  const flag = existsSync(path.join(OEBPS, `images/flag-${ch.slug}.png`))
    ? `<div class="flag"><img src="../images/flag-${ch.slug}.png" alt="Flag of ${x(ch.name)}"/></div>` : '';
  const body = `<section class="opener" epub:type="chapter">
  <h1 id="top">${x(ch.name.toUpperCase())}</h1>${RULE}<p class="nickname">${x(ch.nickname)}</p>
  <div class="sil"><img src="../images/sil-${ch.slug}.jpg" alt="Outline of ${x(ch.name)} filled with a landscape of the state"/></div></section>
<section class="story">${flag}${paras(ch.story)}
${(ch.storyNotes || []).map((t) => box('SERVING SUGGESTION', [], t)).join('')}</section>
${ch.recipes.map((r, i) => recipeHtml(ch, r, perRecipe[i], i === 0 ? below : null)).join('\n')}`;
  add(`state-${ch.slug}`, ch.name, body, { state: ch });
  for (const r of ch.recipes) recipeHref.set(r.title, `state-${ch.slug}.xhtml#${idOf(r.title)}`);
}

// ------------------------------------------------------------------ back matter
const find = recipeLookup(chapters);
const link = (title, state, label, note, mark = '') => {
  const r = find(title, state);
  return `<li><a href="${recipeHref.get(r.title)}">${x(label || r.title)}${mark}</a> · <span class="state">${x(state)}</span>${note ? ` <i>(${x(note)})</i>` : ''}</li>`;
};
const backIds = ['table', 'menus', 'allergens'];
back.forEach((s, i) => {
  const out = [head(s.eyebrow, s.title.toUpperCase())];
  let items = null, prevType = null;
  const flush = () => { if (items) out.push(`<ul class="items">${items.join('')}</ul>`); items = null; };
  for (const b of s.blocks) {
    if (b.type !== 'item') flush();
    switch (b.type) {
      case 'BookBodyText': out.push(`<p${prevType !== 'BookBodyText' ? ' class="first"' : ''}>${x(b.text)}</p>`); break;
      case 'BonusIntro': out.push(`<p class="deck">${x(b.text)}</p>`); break;
      case 'ornament': out.push(ORN); break;
      case 'ClosingLine': out.push(`<p class="closing">${x(b.text)}</p>`); break;
      case 'SectionLabel': out.push(`<h2 class="prose-h">${x(b.text)}</h2>`); break;
      case 'GroupName': out.push(`<h3 class="group">${x(b.text)}</h3>`); break;
      case 'GroupDescription': out.push(`<p class="note">${x(b.text)}</p>`); break;
      case 'item': (items ||= []).push(link(b.recipe, b.state, b.label, b.note, b.mark)); break;
      case 'footnote': out.push(`<p class="note">${x(b.text)}</p>`); break;
      default: throw new Error(`back matter block ${b.type}`);
    }
    prevType = b.type;
  }
  flush();
  add(backIds[i], s.title, `<section class="chapter" epub:type="${i === 0 ? 'afterword' : 'appendix'}">${out.join('\n')}</section>`, { toc: s.title, back: true });
});
const all = chapters.flatMap((ch) => ch.recipes.map((r) => ({ r, ch }))).sort((a, b) => a.r.title.localeCompare(b.r.title));
add('recipe-index', 'Recipe Index', `<section class="chapter" epub:type="index">${head('', 'RECIPE INDEX')}
  <ul class="items">${all.map(({ r, ch }) => `<li><a href="${recipeHref.get(r.title)}">${x(r.title)}</a> · <span class="state">${x(ch.name)}</span></li>`).join('')}</ul></section>`, { toc: 'Recipe Index', back: true });
const a = fm.about;
add('about', 'About the Author', `<section class="chapter" epub:type="appendix">${head(a.kicker, a.title)}
  <p class="deck">${xi(a.deck)}</p>${a.paragraphs.map((p, i) => `<p${i === 0 ? ' class="first"' : ''}>${xi(p)}</p>`).join('')}
  ${ORN}${a.closing.map((l) => `<p class="closing">${x(l)}</p>`).join('')}</section>`, { toc: 'About the Author', back: true });

// Contents page (in the book) and the navigation document (the reader's menu).
const front = files.filter((f) => f.toc && !f.back);
const states = files.filter((f) => f.state);
const backs = files.filter((f) => f.back);
const rel = (f) => f.href.replace('text/', '');
const tocBody = `<nav epub:type="toc" id="toc" class="toc"><h1>CONTENTS</h1>${RULE}<ul>
  ${front.map((f) => `<li><a href="${rel(f)}">${x(f.toc)}</a></li>`).join('')}
  <li class="part">THE FIFTY STATES</li>
  ${states.map((f) => `<li><a href="${rel(f)}">${x(f.title)}</a></li>`).join('')}
  <li class="part">AT THE TABLE</li>
  ${backs.map((f) => `<li><a href="${rel(f)}">${x(f.toc)}</a></li>`).join('')}</ul></nav>`;
files.splice(tocIndex, 0, { id: 'contents', href: 'text/contents.xhtml', title: 'Contents', html: doc('Contents', tocBody) });

const navList = (list) => list.map((f) => `<li><a href="${f.href}">${x(f.toc || f.title)}</a></li>`).join('\n');
const nav = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en-US" xml:lang="en-US">
<head><meta charset="utf-8"/><title>Contents</title></head><body>
<nav epub:type="toc" id="toc"><h1>Contents</h1><ol>
<li><a href="text/contents.xhtml">Contents</a></li>
${navList(front)}
<li><a href="${states[0].href}">The Fifty States</a><ol>${navList(states)}</ol></li>
${navList(backs)}
</ol></nav>
<nav epub:type="landmarks" hidden=""><ol>
<li><a epub:type="toc" href="text/contents.xhtml">Contents</a></li>
<li><a epub:type="bodymatter" href="text/welcome.xhtml">Start of Content</a></li>
</ol></nav></body></html>`;

// NCX for older readers.
let order = 0;
const point = (f, inner = '') => `<navPoint id="np${++order}" playOrder="${order}"><navLabel><text>${x(f.toc || f.title)}</text></navLabel><content src="${f.href}"/>${inner}</navPoint>`;
const UID = 'urn:uuid:5b0c3c2e-6f1e-4b8a-9a52-1d6a2f0e7c11';
const ncx = `<?xml version="1.0" encoding="utf-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="${UID}"/></head>
<docTitle><text>Made in the USA: A Plate for Every State</text></docTitle><navMap>
${point({ toc: 'Contents', href: 'text/contents.xhtml' })}
${front.map((f) => point(f)).join('\n')}
${point({ toc: 'The Fifty States', href: states[0].href }, states.map((f) => point(f)).join(''))}
${backs.map((f) => point(f)).join('\n')}
</navMap></ncx>`;

const mediaType = (f) => (f.endsWith('.png') ? 'image/png' : 'image/jpeg');
const modified = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const opf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" xml:lang="en-US">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:identifier id="uid">${UID}</dc:identifier>
  <dc:title>Made in the USA: A Plate for Every State</dc:title>
  <dc:creator>Christina Reed</dc:creator>
  <dc:language>en-US</dc:language>
  <dc:publisher>Christina Reed</dc:publisher>
  <dc:rights>Copyright © 2026 Christina Reed. All rights reserved.</dc:rights>
  <dc:subject>Cooking / Regional &amp; Ethnic / American</dc:subject>
  <dc:description>Fifty states, fifty stories, and the dishes their people grow up with: 56 recipes from every corner of the American table.</dc:description>
  <meta property="dcterms:modified">${modified}</meta>
</metadata>
<manifest>
  <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
  <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
  <item id="css" href="css/book.css" media-type="text/css"/>
${fonts.map(([f]) => `  <item id="font-${f}" href="fonts/${f}.ttf" media-type="font/ttf"/>`).join('\n')}
${images.map((f, i) => `  <item id="img${i}" href="${f}" media-type="${mediaType(f)}"/>`).join('\n')}
${files.map((f) => `  <item id="${f.id}" href="${f.href}" media-type="application/xhtml+xml"/>`).join('\n')}
</manifest>
<spine toc="ncx">
${files.map((f) => `  <itemref idref="${f.id}"/>`).join('\n')}
</spine>
<guide><reference type="toc" title="Contents" href="text/contents.xhtml"/><reference type="text" title="Welcome" href="text/welcome.xhtml"/></guide>
</package>`;

await mkdir(path.join(OEBPS, 'css'), { recursive: true });
await writeFile(path.join(OEBPS, 'css/book.css'), CSS);
await writeFile(path.join(OEBPS, 'nav.xhtml'), nav);
await writeFile(path.join(OEBPS, 'toc.ncx'), ncx);
await writeFile(path.join(OEBPS, 'content.opf'), opf);
for (const f of files) await writeFile(path.join(OEBPS, f.href), f.html);
await writeFile(path.join(work, 'mimetype'), 'application/epub+zip');
await writeFile(path.join(work, 'META-INF/container.xml'), `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles>
<rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`);

// Zip: "mimetype" first and uncompressed, as the EPUB spec requires.
await rm(OUT, { force: true });
execFileSync('python3', ['-c', `
import os, sys, zipfile
base, out = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(out, 'w') as z:
    z.write(os.path.join(base, 'mimetype'), 'mimetype', compress_type=zipfile.ZIP_STORED)
    for d in ('META-INF', 'OEBPS'):
        for dp, _, fs in os.walk(os.path.join(base, d)):
            for f in sorted(fs):
                p = os.path.join(dp, f)
                z.write(p, os.path.relpath(p, base), compress_type=zipfile.ZIP_DEFLATED)
`, work, OUT]);
const size = (await readFile(OUT)).length / 1e6;
console.log(`✓ ${path.relative(root, OUT)}: ${files.length} sections, ${images.length} pictures, ${size.toFixed(1)} MB`);
