// Page templates. Each returns one <section class="page">; content comes from src/content.
import { flatStar, starRule, stateFooter, esc } from './components.mjs';

// ---------------------------------------------------------------- front matter

export function coverPage(c) {
  // Both five-star rules sit the same distance from the subtitle; the tagline
  // is grouped with the lower rule so the two always move together.
  // Measured on the output: 30pt above / 27pt below gives the same 39pt between
  // each rule and the subtitle capitals (the line box has more room below the caps).
  const RULE_TO_SUBTITLE = 22; // client (round 9): star lines tighter around the subtitle
  return `<section class="page cover recto" data-section="title">
    <div class="made-in">${esc(c.titleTop)}</div>
    <div class="the-usa"><span class="the">${esc(c.titleThe)}</span> <span class="usa">${esc(c.titleUsa)}</span></div>
    <div class="subtitle-group">
      ${starRule()}
      <div class="subtitle" style="margin-top:${RULE_TO_SUBTITLE}pt">${esc(c.subtitle)}</div>
      <div class="tagline-group" style="margin-top:${RULE_TO_SUBTITLE - 3}pt">
        ${starRule()}
        <div class="tagline" style="margin-top:24pt">${esc(c.tagline)}</div>
      </div>
    </div>
    <div class="author">${esc(c.author)}</div>
  </section>`;
}

// Client (round 8): the star footer on every general page except the title page.
const GENERAL_FOOTER = stateFooter('');

export function copyrightPage(c) {
  return `<section class="page copyright verso" data-section="copyright">
    <div class="live">
      <p class="book-title">${esc(c.title)}</p>
      ${c.lines.map((l) => `<p>${esc(l)}</p>`).join('')}
      <div class="registration">
        <p>ISBN: ${esc(c.isbn)}</p>
        <p>Library of Congress Control Number: ${esc(c.lccn)}</p>
      </div>
      ${c.closing.map((l) => `<p>${esc(l)}</p>`).join('')}
    </div>
    ${GENERAL_FOOTER}
  </section>`;
}

/** rows: [title, ref] — the page number is written in from the final layout (data-ref). */
export function tocPage(t) {
  const row = ([title, ref]) =>
    `<div class="toc-row"><span class="t">${esc(title)}</span><span class="lead"></span><span class="n" data-ref="${ref}">000</span></div>`;
  return `<section class="page toc verso" data-section="toc">
    <h1 class="page-title">TABLE OF CONTENTS</h1>
    ${starRule()}
    <div class="cols"><div>${t.left.map(row).join('')}</div><div>${t.right.map(row).join('')}</div></div>
    ${GENERAL_FOOTER}
  </section>`;
}

export function welcomePage(w) {
  // Single-star rule above the title removed at the client's request.
  return `<section class="page welcome recto" data-section="welcome">
    <h1 class="page-title">${w.title.map(esc).join('<br>')}</h1>
    ${starRule()}
    <div class="live body-text">
      ${w.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
      <div class="closing">${w.closing.map(esc).join('<br>')}</div>
    </div>
    ${GENERAL_FOOTER}
  </section>`;
}

export function temperaturesPage(k) {
  return `<section class="page kitchen recto" data-section="temperatures">
    <div class="kicker">${esc(k.kicker)}</div>
    <h1 class="page-title">${k.title.map(esc).join('<br>')}</h1>
    ${starRule()}
    <div class="live body-text">
      <p class="intro">${esc(k.intro)}</p>
      <p>${esc(k.lead)}</p>
      <table>
        <thead><tr>${k.table.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${k.table.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
      <p>${esc(k.after)}</p>
      <div class="closing">
        <p>${esc(k.closing)}</p>
        ${flatStar({ size: 12.8, color: '#a33522' })}
      </div>
    </div>
    ${GENERAL_FOOTER}
  </section>`;
}

// ---------------------------------------------------------------- state chapter
// A chapter is: hero page, story (1+ pages), recipe(s) (1+ pages), food image page(s).
// Story and recipes are emitted as <template class="flow"> blocks; src/paginate.js
// pours them into as many pages as they need, then numbers every page.

import { existsSync } from 'node:fs';
import { SINGLE_PHOTO_PAGE, ONE_PHOTO, PHOTO_NOTES, INLINE_PHOTO } from './content/food-shots.mjs';
import { styleText } from '../build/manuscript.mjs';
import closers from './content/closers.mjs';
import { statePath } from '../build/shapes.mjs';

// Finished artwork dropped in assets/img/states/<state>/ (hero.jpg, dish-1.jpg, …).
function stateImage(slug, name) {
  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
    const f = `assets/img/states/${slug}/${name}.${ext}`;
    if (existsSync(new URL(`../${f}`, import.meta.url))) return f;
  }
  return null;
}

function scallopRect(x0, y0, x1, y1, r) {
  return `M${x0 + r},${y0} H${x1 - r} A${r},${r} 0 0 0 ${x1},${y0 + r} V${y1 - r} A${r},${r} 0 0 0 ${x1 - r},${y1} H${x0 + r} A${r},${r} 0 0 0 ${x0},${y1 - r} V${y0 + r} A${r},${r} 0 0 0 ${x0 + r},${y0} Z`;
}

// Client (round 7): single gold line; navy band wider on the spine side (as in the sample:
// 20pt outside, 38pt toward the spine). Drawn for a left-hand page; right-hand pages shift
// the whole page content 18pt (CSS), so the wide band is always next to the spine.
const FRAME = { x0: 20, y0: 23.5, x1: 556, y1: 768.5, r: 18 };
const FLAG_H = (FRAME.x1 - FRAME.x0) * 1123 / 2009; // flag-wave artwork keeps its proportions
const HERO_CENTER_X = (FRAME.x0 + FRAME.x1) / 2;

// Advance widths (em) of the Cormorant Garamond SemiBold capitals, used to size the state name.
const CAP_W = { A: .711, B: .582, C: .683, D: .7, E: .547, F: .518, G: .725, H: .762, I: .339, J: .333, K: .653, L: .541, M: .85, N: .732, O: .766, P: .549, Q: .766, R: .689, S: .507, T: .64, U: .701, V: .662, W: .918, X: .649, Y: .616, Z: .602, ' ': .234 };
// Client (round 8, L9): one repeating template — name, star rule and nickname sit at the same
// place on every hero page; names stay on one line (long ones are set a little smaller).
const NAME = { maxWidth: 460, maxSize: 60, tracking: 0.04, baseline: 128 };
const RULE_TOP = 134;
const NAME_LIFT = { 'north-carolina': 6 };
const NICK_TOP = 166;
const emWidth = (t) => [...t].reduce((n, c) => n + (CAP_W[c] ?? .8) + NAME.tracking, 0);
// Fixed photo zone under the nickname; each outline is centred on the zone's centre point.
const ZONE = { top: 214, bottom: 704, w: 500 }; // centre sits close under the title block
// Same visual weight on every page: about the same surface, a little more for wide states and
// a little less for tall ones, a floor for the smallest (Delaware, Rhode Island).
const STATE_AREA = 92000; // pt²
const weightArea = (aspect) => STATE_AREA * Math.min(1.25, Math.max(0.85, aspect ** 0.2));
// Island and peninsula states, sized on purpose rather than by surface (client, L9).
const SPECIAL = {
  hawaii: { w: 500, h: 380 },   // the whole island chain across the zone, every island filled
  'rhode-island': { w: 420, h: 390, cy: 418 }, // v2.1 #301: Block Island kept clear of the flag band
  alaska: { w: 480, h: 420 },
  michigan: { w: 430, h: 470 }, // both peninsulas large; the Upper Peninsula carries the story
};

function heroLayout(name) {
  const upper = name.toUpperCase();
  const size = Math.min(NAME.maxSize, NAME.maxWidth / emWidth(upper));
  // Baseline locked: the line box starts higher for bigger type (Cormorant ascent ≈ .794 em at this leading).
  return { lines: [upper], size, lineH: size * 0.95, top: NAME.baseline - size * 0.794, ruleTop: RULE_TOP, nickTop: NICK_TOP };
}

/** Outline of the state for its hero page, scaled for visual weight and centred in the zone. */
export function heroShape(ch) {
  const zoneH = ZONE.bottom - ZONE.top;
  let shape;
  if (SPECIAL[ch.slug]) {
    shape = statePath(ch.name, SPECIAL[ch.slug].w, SPECIAL[ch.slug].h);
    if (SPECIAL[ch.slug].cy) return { ...shape, left: HERO_CENTER_X - shape.width / 2, top: SPECIAL[ch.slug].cy - shape.height / 2 };
  } else {
    const probe = statePath(ch.name, 1000, 1000);
    const aspect = probe.width / probe.height;
    shape = statePath(ch.name, ZONE.w, zoneH, weightArea(aspect));
    if (shape.height < 0.82 * zoneH && aspect < 0.75) shape = statePath(ch.name, ZONE.w, 0.82 * zoneH); // thin states: never small
  }
  const cy = (ZONE.top + ZONE.bottom) / 2;
  return { ...shape, left: HERO_CENTER_X - shape.width / 2, top: cy - shape.height / 2 };
}

function silhouette(ch) {
  // Real state outline, gold-outlined. A landscape in assets/img/states/<state>/hero.jpg
  // is clipped inside it; without one, the outline carries a placeholder label.
  const { d, x0, y0, width, height, left, top, parts } = heroShape(ch);
  const pad = 4;
  const box = `style="left:${(left - pad).toFixed(2)}pt;top:${(top - pad).toFixed(2)}pt" width="${(width + 2 * pad).toFixed(2)}pt" height="${(height + 2 * pad).toFixed(2)}pt" viewBox="${(x0 - pad).toFixed(2)} ${(y0 - pad).toFixed(2)} ${(width + 2 * pad).toFixed(2)} ${(height + 2 * pad).toFixed(2)}"`;
  const hero = stateImage(ch.slug, 'hero');
  if (hero) {
    const id = `clip-${ch.slug}`;
    // Hawaii (client, L9): one picture across the chain would leave the small islands with
    // empty sea or sky, so every island carries its own framing of the same scene.
    const pieces = PER_ISLAND.includes(ch.slug) ? parts.filter((p) => p.width > 3) : [{ d, x0, y0, width, height }];
    return `<svg class="silhouette" ${box} aria-hidden="true">
      <defs>${pieces.map((p, i) => `<clipPath id="${id}-${i}"><path d="${p.d}"/></clipPath>`).join('')}</defs>
      <path d="${d}" fill="none" stroke="#bb9554" stroke-width="2.1" stroke-linejoin="round"/>
      ${pieces.map((p, i) => `<image href="${hero}" x="${p.x0}" y="${p.y0}" width="${p.width}" height="${p.height}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id}-${i})"/>`).join('\n      ')}
    </svg>`;
  }
  return `<svg class="silhouette" ${box} aria-hidden="true">
      <path d="${d}" fill="#e7dfcd" stroke="#bb9554" stroke-width="2.1" stroke-linejoin="round" paint-order="stroke"/>
    </svg>
    <div class="art-placeholder" style="top:${(top + height / 2 - 16).toFixed(2)}pt">
      <b>ILLUSTRATION PLACEHOLDER</b><i>Illustrated ${esc(ch.name)} landscape inside the state shape</i></div>`;
}
const PER_ISLAND = []; // states drawn island by island (none since round 9: Hawaii has one scene again)

export function heroPage(ch) {
  const L = heroLayout(ch.name);
  // v2.1 #297: North Carolina's long name gets a little more air above the star rule.
  if (NAME_LIFT[ch.slug]) L.top -= NAME_LIFT[ch.slug];
  // Approved template: gold star rule between name and nickname; state outlined in frame gold.
  return `<section class="page hero" data-state="${ch.slug}" data-role="hero"><div class="hero-inner">
    <svg class="frame" width="594pt" height="792pt" viewBox="0 0 594 792" aria-hidden="true">
      <defs><clipPath id="panel-${ch.slug}"><path d="${scallopRect(FRAME.x0, FRAME.y0, FRAME.x1, FRAME.y1, FRAME.r)}"/></clipPath></defs>
      <path d="${scallopRect(FRAME.x0, FRAME.y0, FRAME.x1, FRAME.y1, FRAME.r)}" fill="#f4efe5"/>
      <image href="assets/img/common/hero-flag-wave.png" x="${FRAME.x0}" y="${FRAME.y1 - FLAG_H}" width="${FRAME.x1 - FRAME.x0}" height="${FLAG_H}" preserveAspectRatio="xMidYMax slice" clip-path="url(#panel-${ch.slug})"/>
      <path d="${scallopRect(FRAME.x0, FRAME.y0, FRAME.x1, FRAME.y1, FRAME.r)}" fill="none" stroke="#bb9554" stroke-width="1"/>
    </svg>
    <div class="hero-art">
      <div class="state-name" style="top:${L.top.toFixed(1)}pt;font-size:${L.size.toFixed(1)}pt;line-height:${L.lineH.toFixed(1)}pt">${L.lines.map(esc).join('<br>')}</div>
      <div class="hero-rule" style="top:${L.ruleTop.toFixed(1)}pt">${starRule({ lineLength: 70.8, gap: 7.5, bigStar: { size: 25.2, tone: 'gold' } })}</div>
      <div class="nickname" style="top:${L.nickTop.toFixed(1)}pt">${esc(ch.nickname)}</div>
      ${silhouette(ch)}
    </div>
  </div></section>`;
}

// Footer shell; paginate.js writes the page number and sets recto/verso.
const FOOTER = stateFooter('', 'recto');

function storyFlow(ch) {
  const paras = ch.story.map((p) => `<p data-split="text">${esc(p)}</p>`).join('')
    // Client (round 9): serving suggestions at the end of a story sit in a boxed note.
    + (ch.storyNotes || []).map((t) => `<div class="callout band story-note"><h3 class="recipe-h">SERVING SUGGESTION</h3><p>${esc(t)}</p></div>`).join('');
  return `<template class="flow" data-kind="story" data-state="${ch.slug}" data-flag="assets/flags/states/${ch.slug}.png">${paras}</template>`;
}

function ingredientList(items) {
  // Two columns when the list is long and the lines are short enough to read in a column.
  const entries = items.filter((b) => b.type === 'ingredient');
  const avg = entries.reduce((n, b) => n + b.text.length, 0) / Math.max(entries.length, 1);
  const cols = entries.length > 5 && avg < 48 ? ' cols-2' : '';
  const li = (b) => b.type === 'ingredient-sub' ? `<li class="sub">${esc(b.text)}</li>`
    : b.type === 'ingredient-note' ? `<li class="note recipe-note">${esc(b.text)}</li>`
    : `<li>${flatStar({ size: 7, color: '#bb9554', opacity: 0.6 })}<span>${esc(b.text)}</span></li>`;
  // Client (round 9): a group (sub-heading and its items) never breaks across columns.
  const groups = [];
  for (const b of items) {
    if (b.type === 'ingredient-sub' || !groups.length) groups.push([]);
    groups[groups.length - 1].push(b);
  }
  // A list without sub-headings flows freely across the two columns.
  const lis = groups.length === 1 && groups[0][0].type !== 'ingredient-sub' ? groups[0].map(li).join('')
    : groups.map((g) => `<li class="group"><ul>${g.map(li).join('')}</ul></li>`).join('');
  return `<ul class="ingredients${cols}" data-split="items">${lis}</ul>`;
}

// Client (v2.1 #304–#305): Notes & Tips in a navy title band, time-saver tips in a cream box.
const calloutClass = (title) => (/TIME-SAVER/i.test(title) ? 'callout tip' : 'callout band');

function recipeBlocks(r, isSub) {
  const out = [];
  out.push(`<h2 class="recipe-title${isSub ? ' sub' : ''}" data-keep data-title="${esc(r.title)}"${r.newPage ? ' data-break-before' : ''}>${esc(r.title)}</h2>`);
  if (r.tagline) out.push(`<p class="recipe-tagline" data-keep>${esc(r.tagline)}</p>`);
  // Client's order: title, tagline, yield, five stars, ingredients, instructions.
  if (r.yield) out.push(`<p class="recipe-yield" data-keep>${esc(r.yield)}</p>`);
  out.push(`<div class="title-stars-wrap" data-keep>${starRule({ cls: 'title-stars' })}</div>`);
  let step = 0;
  let ingredients = [];
  let callout = null;
  const flushIngredients = () => { if (ingredients.length) out.push(ingredientList(ingredients)); ingredients = []; };
  const flushCallout = () => {
    if (callout) out.push(`<div class="${calloutClass(callout.title)}"><h3 class="recipe-h">${esc(callout.title)}</h3><ul>${callout.items.map((t) => `<li>${flatStar({ size: 7, color: '#bb9554', opacity: 0.6 })}<span>${esc(t)}</span></li>`).join('')}</ul></div>`);
    callout = null;
  };
  for (const [k, b] of r.blocks.entries()) {
    if (b.type === 'step-sub' && r.blocks[k + 1]?.type === 'callout-item') { flushCallout(); callout = { title: b.text.toUpperCase(), items: [] }; continue; }
    // A short note right after the ingredients sits at the foot of the list (as approved for Alabama).
    if (b.type === 'note' && ingredients.length && b.text.length < 60) { ingredients.push({ type: 'ingredient-note', text: b.text }); continue; }
    if (b.type !== 'ingredient' && b.type !== 'ingredient-sub') flushIngredients();
    if (b.type !== 'callout-item' && b.type !== 'callout-title') flushCallout();
    switch (b.type) {
      case 'heading': out.push(`<h3 class="recipe-h" data-keep>${b.text}</h3>`); break;
      case 'ingredient': case 'ingredient-sub': ingredients.push(b); break;
      case 'note': out.push(`<p class="recipe-note">${esc(b.text)}</p>`); break;
      case 'step-sub': out.push(`<h4 class="step-sub" data-keep>${esc(b.text)}</h4>`); break;
      case 'step': {
        step += 1;
        const [lead, text] = b.parts;
        // data-split="step": a long step continues on the next page instead of moving whole.
        out.push(`<p class="step" data-split="step"><span class="n">${step}.</span>${lead ? `<span class="lead-in">${esc(lead)}</span>: ` : ''}<span class="step-text">${esc(text)}</span></p>`);
        break;
      }
      case 'callout-title': callout = { title: b.text, items: [] }; break;
      case 'callout-item': (callout ||= { title: 'NOTES & TIPS', items: [] }).items.push(b.text); break;
    }
  }
  flushIngredients();
  flushCallout();
  return out.join('');
}

export function recipeFlow(ch, attrs = '') {
  return `<template class="flow" data-kind="recipe" data-state="${ch.slug}"${attrs}>${ch.recipes.map((r, i) => recipeBlocks(r, i > 0)).join('')}</template>`;
}

// Photo pages use the text margins (client, L5); photo spreads run full bleed (v2.2 #337).
export const BLEED = 9; // 0.125in print bleed (KDP)
// Spread pictures moved sideways so the dish clears the binding (v2.3 #388), in pt.
const SPREAD_SHIFT = { louisiana: { x: 36 } };
const tipList = (items) => `<ul>${items.map((t) => `<li>${flatStar({ size: 7, color: '#bb9554', opacity: 0.6 })}<span>${esc(t)}</span></li>`).join('')}</ul>`;

function foodPages(ch, notes = null) {
  const ills = dishIllustrations(ch);
  return ills.map((ill, n) => {
    const file = stateImage(ch.slug, `dish-${n + 1}`);
    const name = `assets/img/states/${ch.slug}/dish-${n + 1}.jpg`;
    return Array.from({ length: ill.pages }, (_, half) => {
      let inner;
      if (file) {
        // A spread runs full bleed (v2.2 #337): one picture across both pages and 9pt (the print
        // bleed) past the outer, top and bottom edges. In spread coordinates each page's frame
        // covers [-9, 594] (left page) or [594, 1197] (right page), 810pt tall from -9.
        // SPREAD_SHIFT nudges a picture sideways (zooming just enough to keep the edges covered).
        let style = '';
        if (ill.pages === 2) {
          const { x = 0 } = SPREAD_SHIFT[ch.slug] || {};
          const zoom = 1 + (2 * Math.abs(x)) / (594 * 2 + 2 * BLEED) + 0.002;
          const W = (594 * 2 + 2 * BLEED) * zoom, H = (792 + 2 * BLEED) * zoom;
          const left = -BLEED - (W - (594 * 2 + 2 * BLEED)) / 2 + x; // spread coordinates
          const ml = half ? left - 594 : left + BLEED;
          style = `width:${W.toFixed(2)}pt;height:${H.toFixed(2)}pt;max-width:none;margin-left:${ml.toFixed(2)}pt;margin-top:${(-(H - 792 - 2 * BLEED) / 2).toFixed(2)}pt`;
        }
        inner = `<figure class="full${ill.pages === 2 ? ' spread' : ''}"><img src="${file}" alt="${esc(ill.description)}" style="${style}"></figure>`;
      } else {
        const where = ill.pages === 2 ? ` — full-page spread, ${half ? 'right' : 'left'} page` : '';
        inner = `<div class="img-placeholder"><b>ILLUSTRATION PLACEHOLDER</b><i>${esc(ill.description)}${where}</i><span>Food only (finished dish, ingredients or preparation) — no people</span><span class="file">${name}</span></div>`;
      }
      const spread = ill.pages === 2 ? ` data-spread="${half ? 'right' : 'left'}"` : '';
      // The photo may move onto the last recipe page when that saves a page (client's list).
      const single = INLINE_PHOTO.includes(ch.slug) && ills.length === 1 && ill.pages === 1 && !notes ? ' data-photo="single"' : '';
      if (notes && n === 0) {
        const box = (c) => `<div class="${calloutClass(c.title)} photo-note"><h3 class="recipe-h">${esc(c.title)}</h3>${c.intro ? `<p>${esc(styleText(c.intro))}</p>` : ''}${tipList(c.items.map(styleText))}</div>`;
        const above = notes.callout && notes.where === 'above' ? box(notes.callout) : '';
        const below = [notes.callout && notes.where === 'below' ? box(notes.callout) : '', notes.below ? box(notes.below) : ''].join('');
        inner = above + (notes.fit ? inner.replace('<figure class="full', '<figure data-fit class="full') : inner) + below;
      }
      // Framed photo with the book footer (client: not full page).
      return `<section class="page food" data-state="${ch.slug}" data-role="food"${spread}${single}><div class="live">${inner}</div>${FOOTER}</section>`;
    }).join('');
  }).join('');
}

// Client (L2, option b): a chapter with an odd number of pages ends on a full-bleed navy page
// with the star ornament and a short closing line. paginate.js keeps it only where needed.
function closingPage(ch) {
  const nick = ch.nickname.replace(/^The /, 'the ');
  return `<template class="closing" data-state="${ch.slug}"><section class="page closing-page" data-state="${ch.slug}" data-role="closing">
    <div class="closing-inner">
      ${starRule({ lineLength: 70.8, gap: 7.5, bigStar: { size: 25.2, tone: 'gold' } })}
      <p class="closing-line">${esc(closers[ch.slug] || `From ${nick} to your table.`)}</p>
      <div class="closing-stars">${starRule({ cls: 'gold-rule' })}</div>
    </div>
  </section></template>`;
}

/** Food illustrations of a chapter; the two "full page spread" entries of the manuscript are one image. */
export function dishIllustrations(ch) {
  const out = [];
  for (const d of ch.dishImages) {
    const description = d.description.replace(/\s*[–-]\s*full[\s-]*page[\s-]*spread/i, '').trim();
    const prev = out[out.length - 1];
    if (d.spread && prev?.spread && prev.pages === 1 && prev.description === description) { prev.pages = 2; continue; }
    out.push({ description, spread: d.spread, pages: 1 });
  }
  // a spread always takes two facing pages, even if listed once
  const single = SINGLE_PHOTO_PAGE.includes(ch.slug);
  if (ONE_PHOTO.includes(ch.slug)) out.length = 1;
  return out.map((o) => (o.spread && !single ? { ...o, pages: 2 } : { ...o, pages: single ? 1 : o.pages }));
}

export function stateChapter(ch) {
  // Client (round 9): the dish is shown before its recipe, so the reader sees what they are making.
  let notes = null;
  const extra = PHOTO_NOTES[ch.slug];
  if (extra) {
    notes = { below: extra.below, where: extra.moveRecipeNotes, fit: extra.fit };
    if (extra.moveRecipeNotes) {
      // The recipe's first boxed note (its title and the items right after it) moves to the photo page.
      const r = ch.recipes[0];
      const at = r.blocks.findIndex((b) => b.type === 'callout-title');
      let end = at + 1;
      while (r.blocks[end]?.type === 'callout-item') end++;
      notes.callout = { title: r.blocks[at].text, items: r.blocks.slice(at + 1, end).map((b) => b.text) };
      ch = { ...ch, recipes: [{ ...r, blocks: [...r.blocks.slice(0, at), ...r.blocks.slice(end)] }, ...ch.recipes.slice(1)] };
    }
  }
  return heroPage(ch) + storyFlow(ch) + foodPages(ch, notes) + recipeFlow(ch) + closingPage(ch);
}
