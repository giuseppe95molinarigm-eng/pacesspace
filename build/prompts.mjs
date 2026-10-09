// Writes the image brief for every state: illustrations/PROMPTS.md (to read) and
// illustrations/prompts.csv (to paste or batch into an image generator).
//   node build/prompts.mjs
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readManuscript } from './manuscript.mjs';
import { statePath } from './shapes.mjs';
import { dishIllustrations } from '../src/pages.mjs';
import landscapes from '../src/content/landscapes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'illustrations');
const DPI = 300;
const px = (pt) => Math.ceil((pt / 72) * DPI);

// Food page picture area (pt) and the gap between the two halves of a spread.
const FOOD = { w: 594, h: 792 }; // full-bleed photo page (8.25 × 11 in)

const RATIOS = [[1, 1], [4, 5], [3, 4], [2, 3], [9, 16], [5, 4], [4, 3], [3, 2], [16, 9], [2, 1], [5, 7], [7, 5]];
const nearestRatio = (w, h) => RATIOS.reduce((best, r) => (Math.abs(r[0] / r[1] - w / h) < Math.abs(best[0] / best[1] - w / h) ? r : best)).join(':');

// Client (round 3): scenes follow each story; vary season and time of day (no default sunset).
const HERO_STYLE = 'Photorealistic landscape photograph with a subtle painterly finish, natural true-to-season colours, deep perspective, crisp detail, timeless feel for a premium heritage American cookbook: no modern cars, roads, power lines or signs. Keep exactly the season and light described — do not turn it into a sunset.';
const HERO_FRAMING = 'The picture will be clipped inside the outline of the state: keep the main subject in the centre and the horizon in the upper third, with nothing important near the edges.';
// Client (round 3): "more Bon Appétit style, less restaurant style".
const FOOD_STYLE = 'Bon Appétit–style food photography, photorealistic: bright natural window daylight, relaxed home-cook styling, real and a little imperfect (crumbs, drips, a used spoon, torn herbs, a portion already served), simple everyday tableware and linen, true-to-life colours, fresh and appetising. Not glossy, not restaurant plating, no dark rustic set.';
// Varied per picture so the book does not repeat one set-up.
const ANGLES = ['shot from directly overhead', 'shot at a 45-degree angle', 'shot at table height, close up', 'shot from overhead with the cook’s utensils at the edge of the frame'];
const SURFACES = ['a light marble counter', 'a pale linen tablecloth', 'a sage-green painted wooden table', 'a butcher-block kitchen counter', 'a white enamel tabletop', 'a soft blue tiled counter', 'a worn oak farmhouse table', 'a terracotta-coloured tablecloth'];
let dishCount = 0;
const NEGATIVE = 'No people, no hands, no faces, no text, no lettering, no logos, no labels, no watermark, no frame or border.';

// "1 ½ lb. boneless pork shoulder, cut into…" → "boneless pork shoulder"
function ingredientName(text) {
  // Lines with no quantity start with a sentence capital ("Lemon wedges"): lower-case it.
  if (/^[A-Z][a-z]/.test(text)) text = text[0].toLowerCase() + text.slice(1);
  return text
    .replace(/^juice of (?:\d+\s*)?(\w+)/i, '$1 juice')
    .replace(/^(a small amount of|a few|a pinch of|pinch of)\s+/i, '')
    .replace(/\(.*?\)/g, '')
    .replace(/^[\d\s½¼¾⅓⅔⅛.,/–-]+(?:to\s+[\d\s½¼¾⅓⅔⅛.,/–-]+)?/, '')
    .replace(/^(cups?|Tbsp|tsp|lb\.?|lbs\.?|oz\.?|ounces?|pounds?|cloves?|large|medium|small|whole|pinch of|a few|dashes? of|sticks?|packages?|cans?|slices?|stalks?|bunch(es)?|heads?|sprigs?)\b\.?\s*/i, '')
    .replace(/^(of)\s+/i, '')
    .split(',')[0]
    .trim();
}
const SKIP = /^(salt|pepper|salt and pepper|vegetable|oil|water|ice|cooking spray|nonstick)/i;

function keyIngredients(recipe) {
  const names = recipe.blocks.filter((b) => b.type === 'ingredient' && !b.text.replace(/\(.*?\)/g, '').includes(':')).map((b) => ingredientName(b.text))
    .filter((n) => n && !SKIP.test(n) && n.length < 45);
  return [...new Set(names)].slice(0, 8).join(', ');
}

const { chapters } = await readManuscript(path.join(root, 'manuscript/Made_in_the_USA_BASE.docx'));
const rows = [['file', 'state', 'what', 'min size (px)', 'aspect ratio', 'prompt', 'negative prompt']];
const md = [];

md.push(`# Illustrations — prompts and file names

Made in the USA: A Plate for Every State · generated from the manuscript.

**How to use.** Generate each image with your AI image tool using the prompt below, then save it with
the exact file name shown in \`assets/img/states/<state>/\` (e.g. \`assets/img/states/alaska/hero.jpg\`).
Run \`npm run build\`: hero landscapes are clipped inside the state outline with the gold rule, food
images fill the food page, and spreads are split across the two facing pages automatically.

**Sizes** are minimums for print at ${DPI} dpi; larger is fine (the layout crops to fit). If your tool
offers fixed aspect ratios, pick the one listed and generate at the highest resolution available, then
upscale if needed.

**Spreads** (two facing pages): keep the main subject off the centre line — the book's spine falls
exactly in the middle of the picture.

**Common style — hero landscapes:** ${HERO_STYLE} ${HERO_FRAMING}

**Common style — food:** ${FOOD_STYLE}

**Negative prompt (all images):** ${NEGATIVE}

**Round 3 (client feedback):** landscapes now follow each story, each with its own season and time
of day; food is Bon Appétit style (bright, home-made, a little imperfect) instead of restaurant style.
The Alaska, Arizona and Arkansas pictures made earlier follow the old brief: regenerate them.

Alabama is already complete (hero and food photo from the approved sample). Its two smaller food
pictures are still crops of the main photo: optional prompts for them are at the end.
`);

for (const ch of chapters) {
  const done = ch.slug === 'alabama';
  md.push(`\n## ${ch.name} — ${ch.nickname}${done ? ' ✓ complete' : ''}\n`);
  if (!done) {
    const { width, height } = statePath(ch.name, 440, 490);
    const w = px(width * 1.08), h = px(height * 1.08);
    const ratio = nearestRatio(w, h);
    const { scene, light } = landscapes[ch.slug];
    const prompt = `${scene}. Season and light: ${light}. ${HERO_STYLE} ${HERO_FRAMING} Aspect ratio ${ratio}.`;
    const file = `assets/img/states/${ch.slug}/hero.jpg`;
    rows.push([file, ch.name, 'hero landscape', `${w} × ${h}`, ratio, prompt, NEGATIVE]);
    md.push(`**Hero page** — \`${file}\` · min ${w} × ${h} px · ratio ${ratio}\n\n> ${prompt}\n`);
  }

  dishIllustrations(ch).forEach((ill, n) => {
    if (done) return;
    const dish = ill.description.split(/\s+—\s+/)[0].trim();
    const recipe = ch.recipes.find((r) => r.title.toLowerCase().startsWith(dish.toLowerCase()))
      || ch.recipes.find((r) => dish.toLowerCase().startsWith(r.title.toLowerCase())) || ch.recipes[0];
    const sides = ch.recipes.filter((r) => r !== recipe && dish.toLowerCase().includes(r.title.toLowerCase())).map((r) => r.title);
    const spread = ill.pages === 2;
    const w = px(FOOD.w * (spread ? 2 : 1)), h = px(FOOD.h);
    const ratio = spread ? '3:2' : '3:4';
    const ings = keyIngredients(recipe);
    const prompt = [
      `${dish}, the classic ${ch.name} dish, as made at home and just served${sides.length ? `, with ${sides.join(' and ')} alongside` : ''}.`,
      ings ? `A few of its ingredients casually nearby: ${ings}.` : '',
      FOOD_STYLE,
      `On ${SURFACES[dishCount % SURFACES.length]}, ${ANGLES[dishCount++ % ANGLES.length]}.`,
      spread ? 'Wide horizontal composition for a two-page spread: dish placed left or right of centre, never on the centre line, with room around it.' : 'Vertical composition.',
      `Aspect ratio ${ratio}.`,
    ].filter(Boolean).join(' ');
    const file = `assets/img/states/${ch.slug}/dish-${n + 1}.jpg`;
    rows.push([file, ch.name, spread ? 'food — two-page spread' : 'food — full page', `${w} × ${h}`, ratio, prompt, NEGATIVE]);
    md.push(`**Food${spread ? ' — two-page spread' : ' — full page'}: ${dish}** — \`${file}\` · min ${w} × ${h} px · ratio ${ratio}\n\n> ${prompt}\n`);
  });
}

md.push(`\n## Optional — Alabama detail pictures

Replace the two provisional crops on the Alabama food page (each min 1100 × 2200 px, ratio 1:2).

> Overhead flat-lay of the ingredients for Alabama white sauce and grilled chicken sliders: a jar of mayonnaise, apple cider vinegar, a halved lemon, prepared horseradish, cracked black pepper, raw chicken breasts on a board, soft slider buns. ${FOOD_STYLE} Vertical composition. Aspect ratio 1:2.

> A glass bowl of freshly whisked Alabama white sauce with the whisk resting in it, specks of black pepper, a small dish of pickle chips beside it. ${FOOD_STYLE} Vertical composition. Aspect ratio 1:2.
`);

const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, 'PROMPTS.md'), md.join('\n'));
await writeFile(path.join(outDir, 'prompts.csv'), '﻿' + csv);
console.log(`✓ illustrations/PROMPTS.md and prompts.csv (${rows.length - 1} images)`);
