// Builds the review PDFs (and PNG previews) from the HTML templates.
//   npm install && npm run build
// Set CHROMIUM_PATH if Playwright cannot find a Chromium on its own.
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

import * as fm from '../src/content/front-matter.mjs';
import alabama from '../src/content/states/alabama.mjs';
import {
  coverPage, copyrightPage, tocPage, welcomePage, temperaturesPage,
  heroPage, storyPage, recipePage, foodImagePage,
} from '../src/pages.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'output');

const documents = [
  {
    file: '01_General_Pages_Corrected',
    title: 'Made in the USA — General pages (corrected)',
    pages: [
      coverPage(fm.cover),
      copyrightPage(fm.copyright),
      tocPage(fm.toc),
      welcomePage(fm.welcome),
      temperaturesPage(fm.temperatures),
    ],
  },
  {
    file: '02_Alabama_Section',
    title: 'Made in the USA — Alabama (template chapter)',
    pages: [heroPage(alabama), storyPage(alabama), recipePage(alabama), foodImagePage(alabama)],
  },
  {
    file: '03_Text_Styling_Options',
    title: 'Made in the USA — Text styling options',
    pages: [
      recipePage(alabama, { styleClass: 'ts-a', label: 'OPTION A — AS IN THE APPROVED SAMPLE (MONTSERRAT TITLES)' }),
      recipePage(alabama, { styleClass: 'ts-b', label: 'OPTION B — CLASSIC SERIF (CORMORANT TITLES, OPEN TAGLINE)' }),
      recipePage(alabama, { styleClass: 'ts-c', label: 'OPTION C — HERITAGE CAPITALS (SPACED CAPS, GOLD-RULED TAGLINE)' }),
      storyPage(alabama, { variant: 'dropcap', label: 'STORY PAGE OPTION — DROP CAP + SMALL-CAPS OPENING (TEXT UNCHANGED)' }),
    ],
  },
];

// Internal proof: everything in one file, with open points highlighted.
documents.push({
  file: '00_Internal_Proof_with_markers',
  title: 'INTERNAL PROOF — not for the client',
  proof: true,
  pages: documents.flatMap((d) => d.pages),
});

// Asset paths in the templates are relative to the repo root, hence the <base>.
function html({ title, pages, proof }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title>
<base href="${pathToFileURL(root + '/').href}"><link rel="stylesheet" href="src/styles/book.css"></head>
<body class="${proof ? 'proof' : ''}">${pages.join('\n')}</body></html>`;
}

await rm(path.join(out, 'previews'), { recursive: true, force: true });
await mkdir(path.join(out, 'previews'), { recursive: true });
await mkdir(path.join(root, 'dist'), { recursive: true });

const executablePath = process.env.CHROMIUM_PATH
  || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => existsSync(p));
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage({ deviceScaleFactor: 1.5 });

for (const doc of documents) {
  const htmlPath = path.join(root, 'dist', `${doc.file}.html`);
  await writeFile(htmlPath, html(doc));
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.join(out, `${doc.file}.pdf`), preferCSSPageSize: true, printBackground: true });

  if (!doc.proof) {
    const sections = await page.$$('section.page');
    for (let i = 0; i < sections.length; i++) {
      await sections[i].screenshot({ path: path.join(out, 'previews', `${doc.file}_p${i + 1}.jpg`), type: 'jpeg', quality: 85 });
    }
  }
  console.log(`✓ ${doc.file}.pdf (${doc.pages.length} pages)`);
}

await browser.close();
await rm(path.join(root, 'dist'), { recursive: true, force: true });
