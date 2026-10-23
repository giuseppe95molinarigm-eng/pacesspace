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
import foodShots from '../src/content/food-shots.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'illustrations');
const DPI = 300;
const px = (pt) => Math.ceil((pt / 72) * DPI);

// Food page picture area (pt) and the gap between the two halves of a spread.
const FOOD = { w: 493.2, h: 694 }; // framed photo inside the page margins, footer below

const RATIOS = [[1, 1], [4, 5], [3, 4], [2, 3], [9, 16], [5, 4], [4, 3], [3, 2], [16, 9], [2, 1], [5, 7], [7, 5]];
const nearestRatio = (w, h) => RATIOS.reduce((best, r) => (Math.abs(r[0] / r[1] - w / h) < Math.abs(best[0] / best[1] - w / h) ? r : best)).join(':');

// Client (round 3): scenes follow each story; vary season and time of day (no default sunset).
const HERO_STYLE = 'Photorealistic landscape photograph with a subtle painterly finish, natural true-to-season colours, deep perspective, crisp detail, timeless feel for a premium heritage American cookbook: no modern cars, paved roads, power lines or modern signage. Keep exactly the season and light described — do not turn it into a sunset.';
const HERO_FRAMING = 'A full, rectangular landscape photograph that fills the whole frame edge to edge: keep the main subject near the centre and the horizon in the upper third, with nothing important near the edges (the layout will crop it). Do not draw any map, outline, silhouette or cut-out shape.';
// Client (rounds 3 and 5): Bon Appétit style, natural early-morning or late-afternoon light, and the
// food-photography composition rules she listed (rule of thirds, balance, negative space, leading
// lines, focal point, movement, layers & depth, framing, repetition, golden ratio / triangle / spiral,
// dynamic symmetry, shot angle, orientation, props, surfaces, colour theory, depth of field).
const FOOD_STYLE = 'Bon Appétit–style editorial food photography, photorealistic, relaxed home-cooked styling, real and a little imperfect (crumbs, a drip, a portion already served). Not glossy, not restaurant plating, no studio flash.';
// Round 8 (feedback tracker): the recipe is the hero — the finished dish fills most of the frame,
// few props that belong to the recipe, no stray cutlery, no garnish the recipe does not list.
const FOOD_RULES = 'Composition: the finished dish is the clear hero and fills most of the frame (about two thirds of the picture), cropped close and fully inside the frame — nothing important cut off at the edges; a balanced, calm arrangement with clear space around the dish; shallow depth of field with the dish tack-sharp. Keep props to the minimum listed: no extra bowls, jars, spices, raw ingredients, herbs, cloths or plants. No forks, knives or spoons on or beside the plate unless one is named here. No garnish, herb or topping that is not named here. Natural surface, harmonious colour palette.';
// Shot, light, surface and composition device vary from picture to picture.
const LIGHTS = ['soft natural window light in the early morning, cool and fresh, gentle side light', 'warm natural window light in the late afternoon, low golden side light with long soft shadows'];
const SURFACES = ['a light marble counter', 'a pale linen tablecloth', 'a sage-green painted wooden table', 'a butcher-block kitchen counter', 'a white enamel tabletop', 'a soft blue tiled counter', 'a worn oak farmhouse table', 'a terracotta-coloured tablecloth'];
const DEVICES = ['arranged along a golden spiral that ends on the dish', 'arranged on golden-triangle diagonals', 'with dynamic-symmetry diagonals running through the dish', 'following the golden-ratio (phi) grid'];
// Flat dishes read best from above, tall ones straight on, the rest from the 45° "hero" angle.
function shotFor(dish) {
  const d = dish.toLowerCase();
  if (/(burger|slider|sandwich|dog|roll|cheesesteak|frenchee|bierock|pasty|stack)/.test(d)) return 'straight-on shot at table height';
  if (/(pizza|apizza|soup|chowder|gumbo|stew|burgoo|chili|pie|cobbler|cake|kringle|pancake|johnnycake|omelet|casserole|potatoes|perloo|boiled dinner|crabs|biscochito|fries|sauce)/.test(d)) return '90° overhead shot (flat lay)';
  return '45° hero shot';
}
let dishCount = 0;
const NEGATIVE = 'No people, no hands, no faces, no text, no lettering, no logos, no labels or packaging with writing (plain unlabeled bottles and jars only), no watermark, no frame or border.';

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
    .replace(/^((boneless|skinless|bone-in|fresh|ripe)[,\s]+)+/i, '')
    .replace(/\*/g, '')
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
const rows = [['file', 'state', 'what', 'min size (px)', 'aspect ratio', 'prompt', 'negative prompt', 'reference image']];
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

**Common style — food:** ${FOOD_STYLE} Natural light only, early morning or late afternoon. ${FOOD_RULES}

**Negative prompt (all images):** ${NEGATIVE}

**Reference photos.** Alabama, Alaska and Arizona have a reference landscape from the client
(\`illustrations/references/\`, licensed for this use): attach it to the prompt in the image tool.

**Round 5 (client feedback):** food uses early-morning or late-afternoon natural light and the
composition rules the client listed; Alabama, Alaska and Arizona get new hero landscapes from the
reference photos. All earlier pictures follow older briefs and should be regenerated.
`);

for (const ch of chapters) {
  md.push(`\n## ${ch.name} — ${ch.nickname}\n`);
  {
    // Same size rule as the layout (box 470 wide, all states at about the same surface).
    const { width, height } = statePath(ch.name, 470, 470, 90000);
    const w = px(width * 1.08), h = px(height * 1.08);
    const ratio = nearestRatio(w, h);
    const { scene, light, ref } = landscapes[ch.slug];
    const refNote = ref ? ' Use the attached reference photo for the subject, mood and light: create a new, original image inspired by it, not a copy.' : '';
    const prompt = `${scene}. Season and light: ${light}.${refNote} ${HERO_STYLE} ${HERO_FRAMING} Aspect ratio ${ratio}.`;
    const file = `assets/img/states/${ch.slug}/hero.jpg`;
    // A crowd belongs in the Philadelphia street scene (client, round 9); people stay out of every other picture.
    const negative = landscapes[ch.slug].people ? NEGATIVE.replace('No people, no hands, no faces, ', 'No close-up faces, ') : NEGATIVE;
    rows.push([file, ch.name, 'hero landscape', `${w} × ${h}`, ratio, prompt, negative, ref || '']);
    md.push(`**Hero page** — \`${file}\` · min ${w} × ${h} px · ratio ${ratio}${ref ? ` · **attach reference:** \`${ref}\`` : ''}\n\n> ${prompt}\n`);
  }

  dishIllustrations(ch).forEach((ill, n) => {
    const dish = ill.description.split(/\s+—\s+/)[0].trim();
    const recipe = ch.recipes.find((r) => r.title.toLowerCase().startsWith(dish.toLowerCase()))
      || ch.recipes.find((r) => dish.toLowerCase().startsWith(r.title.toLowerCase())) || ch.recipes[0];
    const sides = ch.recipes.filter((r) => r !== recipe && dish.toLowerCase().includes(r.title.toLowerCase())).map((r) => r.title);
    const spread = ill.pages === 2;
    const w = px(FOOD.w * (spread ? 2 : 1)), h = px(FOOD.h);
    const ratio = spread ? '7:5' : '5:7';
    const ings = keyIngredients(recipe);
    const k = dishCount++;
    const spec = foodShots[ch.slug]?.[n + 1];
    const prompt = [
      spec
        ? `${dish}, the classic ${ch.name} dish, as made at home and just served: ${spec.show}.${spec.props && spec.props !== 'nothing else' ? ` Only props: ${spec.props}.` : ' No other props.'}`
        : `${dish}, the classic ${ch.name} dish, as made at home and just served${sides.length ? `, with ${sides.join(' and ')} alongside` : ''}. Ingredients: ${ings}.`,
      FOOD_STYLE,
      `${spec?.shot || shotFor(dish)}, ${spread ? 'horizontal' : 'vertical'} orientation, on ${SURFACES[k % SURFACES.length]}. Light: ${LIGHTS[k % LIGHTS.length]}.`,
      FOOD_RULES,
      `Elements ${DEVICES[k % DEVICES.length]}.`,
      spread ? 'Two-page spread: ONE single continuous photograph of one table, one camera angle and one light (not two pictures side by side, no ingredient flat lay); the finished dish is large and dominant, placed left or right of centre, never on the centre line (the book spine).' : '',
      `Aspect ratio ${ratio}.`,
    ].filter(Boolean).join(' ');
    const file = `assets/img/states/${ch.slug}/dish-${n + 1}.jpg`;
    rows.push([file, ch.name, spread ? 'food — two-page spread' : 'food — page', `${w} × ${h}`, ratio, prompt, NEGATIVE, '']);
    md.push(`**Food${spread ? ' — two-page spread' : ''}: ${dish}** — \`${file}\` · min ${w} × ${h} px · ratio ${ratio}\n\n> ${prompt}\n`);
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
