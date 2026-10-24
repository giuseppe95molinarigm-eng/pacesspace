// Design options for the client to choose from (round 9): the Culinary Map and the style of
// the Notes & Tips boxes, shown on the Ohio recipe (whose page the client also asked to rework).
//   node build/options.mjs   →  output/Options_Map_and_Notes.pdf
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
import * as fm from '../src/content/front-matter.mjs';
import { readManuscript, styleText } from './manuscript.mjs';
import { stateFooter, flatStar, esc } from '../src/components.mjs';
import { recipeFlow, temperaturesPage } from '../src/pages.mjs';
import { mapSpread } from '../src/matter.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chapters } = await readManuscript(path.join(root, 'manuscript/Made_in_the_USA_BASE.docx'));
const ohio = chapters.find((c) => c.slug === 'ohio');
const FOOTER = stateFooter('');

// Page 9 first, so a two-page view pairs the pages as in the book (10–11 as a spread).
const t = fm.temperatures;
const page9 = temperaturesPage({ ...t, intro: styleText(t.intro), lead: styleText(t.lead), after: styleText(t.after) })
  .replace('data-section="temperatures"', 'data-section="temperatures" data-option="Page 9 — for reference, so the spreads pair up"');
const maps = [
  ['mosaic', 'Map option A — Landscape mosaic: every state filled with its own hero landscape'],
  ['heritage', 'Map option B — Heritage colours: the book’s navy, red, gold and sage'],
  ['atlas', 'Map option C — Vintage atlas: cream land, pale sea, compass rose'],
].map(([style, label]) => mapSpread(fm.map, chapters, style, label)).join('\n');

// Ohio: the "ways" box and the time-saver tip.
const tips = (r) => {
  const out = []; let cur = null;
  for (const b of r.blocks) {
    if (b.type === 'callout-title' || (b.type === 'step-sub' && /tip/i.test(b.text))) { cur = { title: b.text.toUpperCase(), items: [] }; out.push(cur); }
    else if (b.type === 'callout-item' && cur) cur.items.push(b.text);
  }
  return out;
};
const star = () => flatStar({ size: 7, color: '#bb9554', opacity: 0.6 });
const photo = (overlay = '', option) => `<section class="page food verso" data-state="ohio" data-option="${esc(option)}"><div class="live"><figure class="full"><img src="assets/img/states/ohio/dish-1.jpg" alt="">${overlay}</figure></div>${FOOTER}</section>`;
const [ways] = tips(ohio.recipes[0]);
const overlay = `<div class="photo-overlay"><h3 class="recipe-h">${esc(ways.title)}</h3><ul>${ways.items.map((t) => `<li>${star()}<span>${esc(t)}</span></li>`).join('')}</ul></div>`;
const withoutWays = { ...ohio, recipes: [{ ...ohio.recipes[0], blocks: (() => {
  const bl = ohio.recipes[0].blocks; const i = bl.findIndex((b) => b.type === 'callout-title');
  let j = i + 1; while (bl[j] && bl[j].type === 'callout-item') j++;
  return [...bl.slice(0, i), ...bl.slice(j)];
})() }] };
const notes = [
  photo('', 'Notes option 1 — Cream box with a gold border (Ohio photo page)'),
  recipeFlow(ohio, ' data-cls="notes-a" data-option="Notes option 1 — Cream box with a gold border (Ohio recipe page)"'),
  photo('', 'Notes option 2 — Navy title band (Ohio photo page)'),
  recipeFlow(ohio, ' data-cls="notes-b" data-option="Notes option 2 — Navy title band (Ohio recipe page)"'),
  photo(overlay, 'Notes option 3 — The “ways” on the photo, the tip in a cream box (Ohio photo page)'),
  recipeFlow(withoutWays, ' data-cls="notes-a" data-option="Notes option 3 — The “ways” on the photo, the tip in a cream box (Ohio recipe page)"'),
].join('\n');

await mkdir(path.join(root, 'dist'), { recursive: true });
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Options</title>
<base href="${pathToFileURL(root + '/').href}"><link rel="stylesheet" href="src/styles/book.css"></head>
<body data-first-folio="9"><template id="footer-shell">${FOOTER}</template>${page9}${maps}${notes}</body></html>`;
const file = path.join(root, 'dist', 'options.html');
await writeFile(file, html);
const executablePath = process.env.CHROMIUM_PATH || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => existsSync(p));
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage({ deviceScaleFactor: 2 });
await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.addScriptTag({ content: await readFile(path.join(root, 'src/paginate.js'), 'utf8') });
// Real book pages (8.25 × 11 in, vector), each with a small caption above the live area.
await page.evaluate(() => document.querySelectorAll('section.page[data-option]').forEach((sec) => {
  const c = document.createElement('div');
  c.className = 'option-caption';
  c.textContent = sec.dataset.option.replace(/ \(Ohio (photo|recipe) page\)/, '');
  sec.appendChild(c);
}));
await writeFile(path.join(root, 'output/Options_Map_and_Notes.pdf'), await page.pdf({ preferCSSPageSize: true, printBackground: true }));
await browser.close();
console.log('✓ output/Options_Map_and_Notes.pdf — view in two-page mode (spreads)');
await rm(file, { force: true });
