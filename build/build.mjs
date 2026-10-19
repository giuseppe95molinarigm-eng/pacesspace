// Builds the delivery PDFs from the manuscript and the templates.
//   npm install && npm run build
// Set CHROMIUM_PATH if Playwright cannot find a Chromium on its own.
//
// The whole book is laid out as one document, so every page number is real (front matter,
// 50 state chapters, back matter), then split into the files the client reviews:
//   output/00_Front_Matter.pdf        pages 1–11 (title, copyright, dedication, contents, notes, map)
//   output/states/NN_<State>.pdf      one file per state chapter
//   output/99_Back_Matter.pdf         closing essay, menus, allergens, indexes, acknowledgments
//   output/Made_in_the_USA_Complete.pdf  the whole book (not committed: too large for git)
//   output/states/INDEX.md            page ranges and open points
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
import { PDFDocument } from 'pdf-lib';

import * as fm from '../src/content/front-matter.mjs';
import { readManuscript, readBackMatter } from './manuscript.mjs';
import { stateFooter } from '../src/components.mjs';
import {
  coverPage, copyrightPage, tocPage, welcomePage, temperaturesPage, stateChapter, dishIllustrations,
} from '../src/pages.mjs';
import {
  dedicationPage, notesFlow, mapSpread, backMatterFlows, indexFlows, acknowledgmentsPage,
} from '../src/matter.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'output');
const MANUSCRIPT = path.join(root, 'manuscript/Made_in_the_USA_BASE.docx');
const FIRST_STATE_FOLIO = 12; // pages 10–11 are the culinary map spread; Alabama's hero is a left page

const { chapters, skipped } = await readManuscript(MANUSCRIPT);
const back = await readBackMatter(MANUSCRIPT);

// Asset paths in the templates are relative to the repo root, hence the <base>.
function html({ title, body }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title>
<base href="${pathToFileURL(root + '/').href}"><link rel="stylesheet" href="src/styles/book.css"></head>
<body data-first-folio="1">
<template id="footer-shell">${stateFooter('')}</template>
${body}</body></html>`;
}

for (const old of ['previews', 'states', 'ready']) await rm(path.join(out, old), { recursive: true, force: true });
for (const old of ['01_General_Pages_Corrected.pdf', '00_Internal_Proof_with_markers.pdf']) await rm(path.join(out, old), { force: true });
await mkdir(path.join(out, 'states'), { recursive: true });
await mkdir(path.join(root, 'dist'), { recursive: true });

const executablePath = process.env.CHROMIUM_PATH
  || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => existsSync(p));
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage({ deviceScaleFactor: 1.5 });
const paginate = await readFile(path.join(root, 'src/paginate.js'), 'utf8');

// Contents: front sections, the 50 states, back matter — two balanced columns.
const tocRows = [
  ['Welcome to Our Place', 'section:welcome'], ['Notes from the Kitchen', 'section:notes-1'], ['Our Culinary Map', 'section:map'],
  ...chapters.map((c) => [c.name, `state:${c.slug}`]),
  ['The Table We Set Together', 'section:table'], ['Menus for the Occasion', 'section:menus'],
  ['A Guide for Allergens', 'section:allergens'], ['Recipe Index', 'section:recipe-index'],
  ['Ingredient Index', 'section:ingredient-index'], ['State Index', 'section:state-index'],
  ['Acknowledgments', 'section:acknowledgments'],
];
const half = Math.ceil(tocRows.length / 2);
const toc = { left: tocRows.slice(0, half), right: tocRows.slice(half) };

const front = [
  coverPage(fm.cover), copyrightPage(fm.copyright), dedicationPage(fm.dedication), tocPage(toc),
  welcomePage(fm.welcome),
  ...fm.notes.map((n, i) => notesFlow(n, `notes-${i + 1}`)),
  temperaturesPage(fm.temperatures),
  mapSpread(fm.map, chapters),
].join('\n');
const states = chapters.map((c) => stateChapter(c)).join('\n');
const backMatter = [...backMatterFlows(back, chapters), ...indexFlows(chapters), acknowledgmentsPage(fm.acknowledgments)].join('\n');

const htmlPath = path.join(root, 'dist', 'book.html');
await writeFile(htmlPath, html({ title: 'Made in the USA: A Plate for Every State', body: front + states + backMatter }));
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.addScriptTag({ content: paginate });
const layout = await page.evaluate(() => window.__layout);
const bookBytes = await page.pdf({ preferCSSPageSize: true, printBackground: true });
if (process.env.PREVIEWS) {
  await rm(path.join(out, 'previews'), { recursive: true, force: true });
  await mkdir(path.join(out, 'previews'), { recursive: true });
  const sections = await page.$$('section.page');
  for (let i = 0; i < sections.length; i++) {
    await sections[i].screenshot({ path: path.join(out, 'previews', `p${String(i + 1).padStart(3, '0')}.jpg`), type: 'jpeg', quality: 80 });
  }
}
await browser.close();
await rm(path.join(root, 'dist'), { recursive: true, force: true });

const book = await PDFDocument.load(bookBytes);
const total = book.getPageCount();
await writeFile(path.join(out, 'Made_in_the_USA_Complete.pdf'), bookBytes);

// The front matter must end on the map spread, so Alabama's hero lands on page 12 (left page).
const alabama = layout.states.alabama.first;
if (alabama !== FIRST_STATE_FOLIO) console.warn(`! Alabama starts on page ${alabama}, expected ${FIRST_STATE_FOLIO}: check the front matter length`);

async function extract(file, first, last, title) {
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  const idx = Array.from({ length: last - first + 1 }, (_, k) => first - 1 + k);
  (await doc.copyPages(book, idx)).forEach((p) => doc.addPage(p));
  await writeFile(file, await doc.save());
}

await extract(path.join(out, '00_Front_Matter.pdf'), 1, alabama - 1, 'Made in the USA — Front matter');
const index = [];
for (const [i, c] of chapters.entries()) {
  const L = layout.states[c.slug];
  const file = `${String(i + 1).padStart(2, '0')}_${c.name.replace(/ /g, '_')}.pdf`;
  await extract(path.join(out, 'states', file), L.first, L.last, `Made in the USA — ${c.name}`);
  index.push({ file, c, L });
}
const backFirst = layout.states.wyoming.last + 1;
await extract(path.join(out, '99_Back_Matter.pdf'), backFirst, total, 'Made in the USA — Back matter');
console.log(`✓ ${total} pages: front 1–${alabama - 1}, states ${alabama}–${backFirst - 1}, back matter ${backFirst}–${total}`);

// Index of the state files, with what is still open.
const has = (c, n) => ['jpg', 'jpeg', 'png', 'webp'].some((e) => existsSync(path.join(root, `assets/img/states/${c.slug}/${n}.${e}`)));
const rows = index.map(({ file, c, L }) => {
  const counts = L.pages.reduce((m, r) => ((m[r] = (m[r] || 0) + 1), m), {});
  const images = has(c, 'hero') && dishIllustrations(c).every((_, k) => has(c, `dish-${k + 1}`)) ? '✓' : 'missing';
  const count = L.last - L.first + 1;
  return `| ${file} | ${L.first}–${L.last} | ${count}${count % 2 ? ' ⚠ odd' : ''} | ${counts.story || 0} / ${counts.recipe || 0} / ${counts.food || 0} / ${counts.closing || 0} | ${images} |`;
});
const odd = index.filter(({ L }) => (L.last - L.first + 1) % 2 || L.first % 2);
const notes = [
  ...odd.map(({ c }) => `- ${c.name}: hero page not on a left-hand page or odd page count`),
  ...layout.unresolved.map((u) => `- Unresolved reference — ${u}`),
  ...skipped.map((s) => `- Text in the manuscript not printed (${s.state}): "${s.text.slice(0, 160)}${s.text.length > 160 ? '…' : ''}"`),
];
const sections = Object.entries(layout.sections).map(([k, v]) => `| ${k} | ${v[0]}${v.length > 1 ? `–${v[v.length - 1]}` : ''} |`);
await writeFile(path.join(out, 'states', 'INDEX.md'), `# Made in the USA — page map

Generated from \`manuscript/Made_in_the_USA_BASE.docx\`. One continuous book of ${total} pages.

| Section | Pages |
|---|---|
${sections.join('\n')}

| File | Pages | Count | Story / recipe / photo / closing pages | Images |
|---|---|---|---|---|
${rows.join('\n')}

## To check
${notes.join('\n') || '- nothing'}
`);
console.log(notes.length ? `! ${notes.length} points to check in output/states/INDEX.md` : '✓ nothing to check');
