// Page templates. Each returns one <section class="page">; content comes from src/content.
import { star, flatStar, starRule, stateFooter, plainFolio, esc } from './components.mjs';

const side = (folio) => (folio % 2 === 0 ? 'verso' : 'recto');

// ---------------------------------------------------------------- front matter

export function coverPage(c) {
  // Both five-star rules sit the same distance from the subtitle; the tagline
  // is grouped with the lower rule so the two always move together.
  // Measured on the output: 30pt above / 27pt below gives the same 39pt between
  // each rule and the subtitle capitals (the line box has more room below the caps).
  const RULE_TO_SUBTITLE = 30;
  return `<section class="page cover recto">
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

export function copyrightPage(c) {
  return `<section class="page copyright verso">
    <div class="live">
      <p class="book-title">${esc(c.title)}</p>
      ${c.lines.map((l) => `<p>${esc(l)}</p>`).join('')}
      <div class="registration">
        <p>ISBN: ${esc(c.isbn)}</p>
        <p>Library of Congress Control Number: ${esc(c.lccn)}</p>
      </div>
      ${c.closing.map((l) => `<p>${esc(l)}</p>`).join('')}
    </div>
  </section>`;
}

export function tocPage(t, folio = 4) {
  const row = ([title, n, opts = {}]) =>
    `<div class="toc-row${opts.check ? ' check' : ''}"><span class="t">${esc(title)}</span><span class="lead"></span><span class="n">${n}</span></div>`;
  return `<section class="page toc ${side(folio)}">
    <div class="bg"></div>
    <h1 class="page-title">TABLE OF CONTENTS</h1>
    ${starRule()}
    <div class="cols"><div>${t.left.map(row).join('')}</div><div>${t.right.map(row).join('')}</div></div>
    ${plainFolio(folio, side(folio))}
  </section>`;
}

export function welcomePage(w) {
  // Single-star rule above the title removed at the client's request.
  return `<section class="page welcome ${side(w.folio)}">
    <h1 class="page-title">${w.title.map(esc).join('<br>')}</h1>
    ${starRule()}
    <div class="live body-text">
      ${w.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
      <div class="closing">${w.closing.map(esc).join('<br>')}</div>
    </div>
    ${plainFolio(w.folio, side(w.folio))}
  </section>`;
}

export function temperaturesPage(k) {
  return `<section class="page kitchen ${side(k.folio)}">
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
    ${plainFolio(k.folio, side(k.folio))}
  </section>`;
}

// ---------------------------------------------------------------- state chapter
// A chapter is: hero page, story (1+ pages), recipe(s) (1+ pages), food image page(s).
// Story and recipes are emitted as <template class="flow"> blocks; src/paginate.js
// pours them into as many pages as they need, then numbers every page.

import { existsSync } from 'node:fs';
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

const HERO_CENTER_X = 288; // centre of the gold frame (verso; mirrored on recto)
const ART_BOTTOM = 730; // lowest point of the state artwork (pt)
const PNG_SILHOUETTE = { wPt: 311.04, hPt: 492.24 }; // Alabama artwork, 300 dpi

// Advance widths (em) of the Libre Caslon Bold capitals, used to size the state name.
const CAP_W = { A: .781, B: .751, C: .813, D: .878, E: .731, F: .684, G: .855, H: .923, I: .425, J: .409, K: .807, L: .699, M: 1.073, N: .878, O: .869, P: .694, Q: .869, R: .778, S: .647, T: .778, U: .821, V: .781, W: 1.212, X: .84, Y: .745, Z: .73, ' ': .253 };
const NAME = { maxWidth: 470, maxSize: 80, minSingle: 58, tracking: 0.02, top: 66 };
const emWidth = (t) => [...t].reduce((n, c) => n + (CAP_W[c] ?? .8) + NAME.tracking, 0);

/**
 * Client: state name "much bigger and bolder", star rule directly beneath it.
 * Short names run up to 80pt; two-word names too long for one line are stacked
 * so they stay large. Everything below (rule, nickname, state) follows.
 */
function heroLayout(name) {
  const upper = name.toUpperCase();
  let lines = [upper];
  let size = Math.min(NAME.maxSize, NAME.maxWidth / emWidth(upper));
  if (size < NAME.minSingle && upper.includes(' ')) {
    const words = upper.split(' ');
    lines = [words.slice(0, -1).join(' '), words[words.length - 1]];
    size = Math.min(72, NAME.maxWidth / Math.max(...lines.map(emWidth)));
  }
  const lineH = size * 0.92;
  const nameBottom = NAME.top + lineH * lines.length;
  const ruleTop = nameBottom - size * 0.12 + 5; // caps baseline sits ~0.2em above the line box end
  const nickTop = ruleTop + 24 + 10;
  const artTop = nickTop + 22.5 + 20;
  return { lines, size, lineH, ruleTop, nickTop, artTop, artH: ART_BOTTOM - artTop };
}

function silhouette(ch, art, L) {
  if (art?.silhouette) {
    const left = HERO_CENTER_X - PNG_SILHOUETTE.wPt / 2;
    const top = L.artTop + Math.max(0, (L.artH - PNG_SILHOUETTE.hPt) / 2);
    return `<img class="silhouette" src="${art.silhouette}" alt="${esc(ch.name)}" style="left:${left.toFixed(2)}pt;top:${top.toFixed(2)}pt;width:${PNG_SILHOUETTE.wPt}pt;height:${PNG_SILHOUETTE.hPt}pt">`;
  }
  const SHAPE_BOX = { w: 440, h: L.artH, top: L.artTop };
  // Real state outline, gold-outlined. A landscape in assets/img/states/<state>/hero.jpg
  // is clipped inside it; without one, the outline carries a placeholder label.
  const { d, x0, y0, width, height } = statePath(ch.name, SHAPE_BOX.w, SHAPE_BOX.h);
  const pad = 4;
  const left = HERO_CENTER_X - width / 2 - pad;
  const top = SHAPE_BOX.top + (SHAPE_BOX.h - height) / 2 - pad;
  const box = `style="left:${left.toFixed(2)}pt;top:${top.toFixed(2)}pt" width="${(width + 2 * pad).toFixed(2)}pt" height="${(height + 2 * pad).toFixed(2)}pt" viewBox="${(x0 - pad).toFixed(2)} ${(y0 - pad).toFixed(2)} ${(width + 2 * pad).toFixed(2)} ${(height + 2 * pad).toFixed(2)}"`;
  const hero = stateImage(ch.slug, 'hero');
  if (hero) {
    const id = `clip-${ch.slug}`;
    return `<svg class="silhouette" ${box} aria-hidden="true">
      <defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>
      <path d="${d}" fill="none" stroke="#bb9554" stroke-width="4.4" stroke-linejoin="round"/>
      <image href="${hero}" x="${x0}" y="${y0}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>
    </svg>`;
  }
  return `<svg class="silhouette" ${box} aria-hidden="true">
      <path d="${d}" fill="#e7dfcd" stroke="#bb9554" stroke-width="4.4" stroke-linejoin="round" paint-order="stroke"/>
    </svg>
    <div class="art-placeholder" style="top:${(SHAPE_BOX.top + SHAPE_BOX.h / 2 - 16).toFixed(2)}pt">
      <b>ILLUSTRATION PLACEHOLDER</b><i>Illustrated ${esc(ch.name)} landscape inside the state shape</i></div>`;
}

export function heroPage(ch, art) {
  const L = { ...heroLayout(ch.name), top: NAME.top };
  // Approved template: no five-star rule, no red single-star rule; gold star rule
  // between name and nickname; large re-centred state outlined in frame gold.
  return `<section class="page hero" data-state="${ch.slug}" data-role="hero">
    <svg class="frame" width="594pt" height="792pt" viewBox="0 0 594 792" aria-hidden="true">
      <path class="mirror" d="${scallopRect(20.14, 23.54, 555.86, 768.46, 18)}" fill="#f4efe5" stroke="#bb9554" stroke-width="1"/>
    </svg>
    <div class="hero-art">
      <img class="flag-wave" src="assets/img/common/hero-flag-wave.jpg" alt="">
      <svg class="frame" width="594pt" height="792pt" viewBox="0 0 594 792" aria-hidden="true">
        <path d="${scallopRect(27.255, 33.445, 548.745, 758.555, 17.52)}" fill="none" stroke="#bb9554" stroke-width="1.05"/>
      </svg>
      <div class="state-name" style="top:${L.top}pt;font-size:${L.size.toFixed(1)}pt;line-height:${L.lineH.toFixed(1)}pt">${L.lines.map(esc).join('<br>')}</div>
      <div class="hero-rule" style="top:${L.ruleTop.toFixed(1)}pt">${starRule({ lineLength: 70.8, gap: 7.5, bigStar: { size: 25.2, tone: 'gold' } })}</div>
      <div class="nickname" style="top:${L.nickTop.toFixed(1)}pt">${esc(ch.nickname)}</div>
      ${silhouette(ch, art, L)}
    </div>
  </section>`;
}

// Footer shell; paginate.js writes the page number and sets recto/verso.
const FOOTER = stateFooter('', 'recto');

function storyFlow(ch) {
  const paras = ch.story.map((p) => `<p data-split="text">${esc(p)}</p>`).join('');
  return `<template class="flow" data-kind="story" data-state="${ch.slug}" data-flag="assets/flags/states/${ch.slug}.png">${paras}</template>`;
}

function ingredientList(items) {
  // Two columns when the list is long and the lines are short enough to read in a column.
  const entries = items.filter((b) => b.type === 'ingredient');
  const avg = entries.reduce((n, b) => n + b.text.length, 0) / Math.max(entries.length, 1);
  const cols = entries.length > 5 && avg < 48 ? ' cols-2' : '';
  const lis = items.map((b) => b.type === 'ingredient-sub' ? `<li class="sub">${esc(b.text)}</li>`
    : b.type === 'ingredient-note' ? `<li class="note recipe-note">${esc(b.text)}</li>`
    : `<li>${flatStar({ size: 7, color: '#bb9554', opacity: 0.6 })}<span>${esc(b.text)}</span></li>`).join('');
  return `<ul class="ingredients${cols}" data-split="items">${lis}</ul>`;
}

function recipeBlocks(r, isSub) {
  const out = [];
  out.push(`<h2 class="recipe-title${isSub ? ' sub' : ''}" data-keep data-title="${esc(r.title)}">${esc(r.title)}</h2>`);
  if (r.tagline) out.push(`<p class="recipe-tagline" data-keep>${esc(r.tagline)}</p>`);
  // Client's order: title, tagline, yield, five stars, ingredients, instructions.
  if (r.yield) out.push(`<p class="recipe-yield" data-keep>${esc(r.yield)}</p>`);
  out.push(`<div class="title-stars-wrap" data-keep>${starRule({ cls: 'title-stars' })}</div>`);
  let step = 0;
  let ingredients = [];
  let callout = null;
  const flushIngredients = () => { if (ingredients.length) out.push(ingredientList(ingredients)); ingredients = []; };
  const flushCallout = () => {
    if (callout) out.push(`<div class="callout"><h3 class="recipe-h">${esc(callout.title)}</h3><ul>${callout.items.map((t) => `<li>${flatStar({ size: 7, color: '#bb9554', opacity: 0.6 })}<span>${esc(t)}</span></li>`).join('')}</ul></div>`);
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
        out.push(`<p class="step"><span class="n">${step}.</span>${lead ? `<span class="lead-in">${esc(lead)}</span>: ` : ''}${esc(text)}</p>`);
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

function recipeFlow(ch) {
  return `<template class="flow" data-kind="recipe" data-state="${ch.slug}">${ch.recipes.map((r, i) => recipeBlocks(r, i > 0)).join('')}</template>`;
}

function figure(img) {
  if (!img.crop) return `<figure class="main"><img src="${img.src}" alt="${esc(img.alt)}"></figure>`;
  // Frames fill the space left on the page; `crop` picks which part of the photo shows.
  const [x, y, w, h] = img.crop;
  const [sw, sh] = img.sourceSize;
  const pos = (off, size, total) => (total > size ? (off / (total - size)) * 100 : 50).toFixed(1);
  const style = `width:100%;height:100%;object-fit:cover;object-position:${pos(x, w, sw)}% ${pos(y, h, sh)}%`;
  return `<figure class="${img.provisional ? 'provisional' : ''}"><img src="${img.src}" alt="${esc(img.alt)}" style="${style}"></figure>`;
}

function foodPages(ch, art) {
  if (art?.foodImages) {
    const f = art.foodImages;
    return `<section class="page food" data-state="${ch.slug}" data-role="food">
      <div class="live">${figure(f.main)}<div class="details">${f.details.map(figure).join('')}</div></div>${FOOTER}</section>`;
  }
  return dishIllustrations(ch).map((ill, n) => {
    const file = stateImage(ch.slug, `dish-${n + 1}`);
    const name = `assets/img/states/${ch.slug}/dish-${n + 1}.jpg`;
    return Array.from({ length: ill.pages }, (_, half) => {
      let inner;
      if (file) {
        // A spread is one wide image shown across two facing pages.
        const style = ill.pages === 2 ? `width:200%;margin-left:${half ? '-100%' : '0'}` : '';
        inner = `<figure class="full"><img src="${file}" alt="${esc(ill.description)}" style="${style}"></figure>`;
      } else {
        const where = ill.pages === 2 ? ` — full-page spread, ${half ? 'right' : 'left'} page` : '';
        inner = `<div class="img-placeholder"><b>ILLUSTRATION PLACEHOLDER</b><i>${esc(ill.description)}${where}</i><span>Food only (finished dish, ingredients or preparation) — no people</span><span class="file">${name}</span></div>`;
      }
      // Full-bleed photo page: the picture covers the whole page, no footer band.
      return `<section class="page food bleed" data-state="${ch.slug}" data-role="food"><div class="live">${inner}</div></section>`;
    }).join('');
  }).join('');
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
  return out.map((o) => (o.spread ? { ...o, pages: 2 } : o));
}

export function stateChapter(ch, art) {
  return heroPage(ch, art) + storyFlow(ch) + recipeFlow(ch) + foodPages(ch, art);
}
