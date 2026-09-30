// Builds the delivery PDFs from the manuscript and the templates.
//   npm install && npm run build
// Set CHROMIUM_PATH if Playwright cannot find a Chromium on its own.
//
// Output:
//   output/01_General_Pages_Corrected.pdf      cover, copyright, TOC, welcome, p. 9
//   output/states/NN_<State>.pdf               one file per state chapter (approved one by one)
//   output/00_Internal_Proof_with_markers.pdf  everything, open points highlighted (not for the client)
//   output/states/INDEX.md                     page ranges and open points per state
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
import { PDFDocument } from 'pdf-lib';

import * as fm from '../src/content/front-matter.mjs';
import alabamaArt from '../src/content/states/alabama.mjs';
import { readManuscript } from './manuscript.mjs';
import { stateFooter } from '../src/components.mjs';
import {
  coverPage, copyrightPage, tocPage, welcomePage, temperaturesPage, stateChapter,
} from '../src/pages.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'output');
const MANUSCRIPT = path.join(root, 'manuscript/Made_in_the_USA_BASE.docx');
const FIRST_STATE_FOLIO = 12; // pages 10–11 are the culinary map spread
const ART = { alabama: alabamaArt }; // finished artwork; other states use placeholders

const { chapters, skipped } = await readManuscript(MANUSCRIPT);

// Asset paths in the templates are relative to the repo root, hence the <base>.
function html({ title, body, proof, firstFolio }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title>
<base href="${pathToFileURL(root + '/').href}"><link rel="stylesheet" href="src/styles/book.css"></head>
<body class="${proof ? 'proof' : ''}" data-first-folio="${firstFolio || 1}">
<template id="footer-shell">${stateFooter('')}</template>
${body}</body></html>`;
}

await rm(path.join(out, 'previews'), { recursive: true, force: true });
await rm(path.join(out, 'states'), { recursive: true, force: true });
await rm(path.join(out, '02_Alabama_Section.pdf'), { force: true });
await mkdir(path.join(out, 'previews'), { recursive: true });
await mkdir(path.join(out, 'states'), { recursive: true });
await mkdir(path.join(root, 'dist'), { recursive: true });

const executablePath = process.env.CHROMIUM_PATH
  || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => existsSync(p));
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage({ deviceScaleFactor: 1.5 });
const paginate = await readFile(path.join(root, 'src/paginate.js'), 'utf8');

async function render(name, doc, { flow = false, previews = null } = {}) {
  const htmlPath = path.join(root, 'dist', `${name}.html`);
  await writeFile(htmlPath, html(doc));
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  let layout = null;
  if (flow) {
    await page.addScriptTag({ content: paginate });
    layout = await page.evaluate(() => window.__layout);
  }
  const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
  if (previews) {
    const sections = await page.$$('section.page');
    for (let i = 0; i < sections.length; i++) {
      await sections[i].screenshot({ path: path.join(out, 'previews', `${previews}_p${i + 1}.jpg`), type: 'jpeg', quality: 85 });
    }
  }
  return { pdf, layout };
}

// 1. State chapters, paginated as one continuous run so page numbers are real.
const chaptersHtml = chapters.map((c) => stateChapter(c, ART[c.slug])).join('\n');
const body = await render('states', { title: 'Made in the USA — State chapters', body: chaptersHtml, firstFolio: FIRST_STATE_FOLIO }, { flow: true });
const layout = body.layout;
const bodyPdf = await PDFDocument.load(body.pdf);

const index = [];
for (const [i, c] of chapters.entries()) {
  const L = layout.states[c.slug];
  const doc = await PDFDocument.create();
  doc.setTitle(`Made in the USA — ${c.name}`);
  const idx = Array.from({ length: L.last - L.first + 1 }, (_, k) => L.first - FIRST_STATE_FOLIO + k);
  (await doc.copyPages(bodyPdf, idx)).forEach((p) => doc.addPage(p));
  const file = `${String(i + 1).padStart(2, '0')}_${c.name.replace(/ /g, '_')}.pdf`;
  await writeFile(path.join(out, 'states', file), await doc.save());
  index.push({ file, c, L });
}
console.log(`✓ ${chapters.length} state PDFs (pages ${FIRST_STATE_FOLIO}–${FIRST_STATE_FOLIO + bodyPdf.getPageCount() - 1})`);

// 2. General pages — the TOC takes the real page numbers of the chapters just laid out.
const pageOf = Object.fromEntries(chapters.map((c) => [c.name, layout.states[c.slug].first]));
// Back matter is not laid out yet: its numbers from the manuscript are moved to
// start right after Wyoming, keeping their spacing (still marked "to check").
const lastStatePage = FIRST_STATE_FOLIO + bodyPdf.getPageCount() - 1;
const backShift = lastStatePage + 1 - fm.BACK_MATTER_FIRST_PAGE;
const tocNumber = ([t, n, o]) => {
  if (t === 'Welcome to Our Place') return [t, fm.welcome.folio, o];
  if (pageOf[t]) return [t, pageOf[t], o];
  return [t, n + backShift, { ...o, check: true }];
};
const toc = { left: fm.toc.left.map(tocNumber), right: fm.toc.right.map(tocNumber) };
const generalPages = [coverPage(fm.cover), copyrightPage(fm.copyright), tocPage(toc), welcomePage(fm.welcome), temperaturesPage(fm.temperatures)].join('\n');
const general = await render('general', { title: 'Made in the USA — General pages', body: generalPages }, { previews: '01_General_Pages_Corrected' });
await writeFile(path.join(out, '01_General_Pages_Corrected.pdf'), general.pdf);
console.log('✓ 01_General_Pages_Corrected.pdf');

// 3. Internal proof: same pages with the open points highlighted.
const proofG = await render('proof-general', { title: 'INTERNAL PROOF', body: generalPages, proof: true });
const proofS = await render('proof-states', { title: 'INTERNAL PROOF', body: chaptersHtml, proof: true, firstFolio: FIRST_STATE_FOLIO }, { flow: true });
const proof = await PDFDocument.create();
proof.setTitle('INTERNAL PROOF — not for the client');
for (const bytes of [proofG.pdf, proofS.pdf]) {
  const src = await PDFDocument.load(bytes);
  (await proof.copyPages(src, src.getPageIndices())).forEach((p) => proof.addPage(p));
}
await writeFile(path.join(out, '00_Internal_Proof_with_markers.pdf'), await proof.save());
console.log('✓ 00_Internal_Proof_with_markers.pdf');

// 4. Index of the state files, with what is still open.
const rows = index.map(({ file, c, L }) => {
  const counts = L.pages.reduce((m, r) => ((m[r] = (m[r] || 0) + 1), m), {});
  const art = ART[c.slug] ? 'definitive' : 'placeholder';
  return `| ${file} | ${L.first}–${L.last} | ${L.last - L.first + 1} | ${counts.story || 0} / ${counts.recipe || 0} / ${counts.food || 0} | ${art} |`;
});
const notes = [
  ...layout.unresolved.map((u) => `- Unresolved "page XX" reference — ${u}`),
  ...skipped.map((s) => `- Text in the manuscript not printed (${s.state}): "${s.text.slice(0, 160)}${s.text.length > 160 ? '…' : ''}"`),
];
await writeFile(path.join(out, 'states', 'INDEX.md'), `# State chapters

Generated from \`manuscript/Made_in_the_USA_BASE.docx\`. Pages are numbered from ${FIRST_STATE_FOLIO}
(Alabama hero page), continuously through Wyoming.

| File | Pages | Count | Story / recipe / food pages | Images |
|---|---|---|---|---|
${rows.join('\n')}

## To check
${notes.join('\n') || '- nothing'}
`);

await browser.close();
await rm(path.join(root, 'dist'), { recursive: true, force: true });
