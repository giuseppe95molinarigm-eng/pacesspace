// General pages added in round 8 (dedication, Notes from the Kitchen, Our Culinary Map) and the
// back matter (closing essay, menus, allergen guide, recipe index).
// Long sections are <template class="flow"> blocks, poured into pages by src/paginate.js;
// every page number is a data-ref filled in from the final layout.
import { createRequire } from 'node:module';
import { feature, neighbors } from 'topojson-client';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { flatStar, starRule, stateFooter, esc } from './components.mjs';

const FOOTER = stateFooter('');
const bullet = () => flatStar({ size: 7, color: '#bb9554', opacity: 0.6 });

// ---------------------------------------------------------------- front

export function dedicationPage(d) {
  return `<section class="page dedication recto" data-section="dedication">
    <div class="live">
      ${flatStar({ size: 12.8, color: '#a33522' })}
      ${d.stanzas.map(([to, text]) => `<p class="to">${esc(to)}</p><p class="text">${esc(text)}</p>`).join('')}
      <div class="closing">${d.closing.map((l) => `<p>${esc(l)}</p>`).join('')}</div>
    </div>
    ${FOOTER}
  </section>`;
}

const header = (kicker, title) => `
  ${kicker ? `<div class="kicker" data-keep>${esc(kicker)}</div>` : ''}
  <h1 class="page-title" data-keep>${title.map(esc).join('<br>')}</h1>
  <div class="title-rule" data-keep>${starRule()}</div>`;

function proseBlock([type, text, items]) {
  switch (type) {
    case 'p': return `<p data-split="text">${esc(text)}</p>`;
    case 'deck': return `<p class="deck">${esc(text)}</p>`;
    case 'h2': return `<h2 class="prose-h" data-keep>${esc(text)}</h2>`;
    case 'h3': return `<h3 class="prose-sub" data-keep>${esc(text)}</h3>`;
    case 'callout': return `<div class="callout band"><h3 class="recipe-h">${esc(text)}</h3><ul>${items.map((t) => `<li>${bullet()}<span>${esc(t)}</span></li>`).join('')}</ul></div>`;
    default: throw new Error(`Unknown block ${type}`);
  }
}

/** One Notes from the Kitchen page (flows on if the text ever outgrows it). */
export function notesFlow(n, section) {
  return `<template class="flow" data-kind="prose" data-section="${section}">${header(n.kicker, n.title)}${n.blocks.map(proseBlock).join('')}</template>`;
}

// ---------------------------------------------------------------- map spread

const require = createRequire(import.meta.url);
const topo = require('us-atlas/states-10m.json');
const POSTAL = { Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY' };
// States too small for a label inside: labelled in the Atlantic with a leader line.
const OFFSHORE = ['VT', 'NH', 'MA', 'RI', 'CT', 'NJ', 'DE', 'MD'];
// Label nudges (pt) where the centroid sits awkwardly.
const NUDGE = { FL: [14, 6], LA: [-8, 0], MI: [10, 18], KY: [4, 2], WV: [-2, 4], VA: [6, 2], ID: [0, 14], CA: [-6, 0], NY: [8, 0], HI: [-34, 4] };

// Map styles (client, round 9: "other options for the Culinary Map"):
//   navy     — round 8: navy states, cream labels
//   mosaic   — every state filled with its own hero landscape, gold borders
//   heritage — the book's red, navy, gold and sage, no two neighbours alike
//   atlas    — vintage atlas: cream land, pale sea, navy hairlines, compass rose
const HERITAGE = ['#1d3864', '#a33623', '#bb9554', '#6f8a73'];
const slugOf = (name) => name.toLowerCase().replace(/[^a-z]+/g, '-');

function mapSvg(chapters, style = 'navy') {
  const all = topo.objects.states.geometries;
  const keep = all.map((g, i) => (POSTAL[g.properties.name] ? i : -1)).filter((i) => i >= 0);
  const states = feature(topo, topo.objects.states).features.filter((f) => POSTAL[f.properties.name]);
  const box = [[78, 182], [1040, 716]]; // across the spread (1188 × 792 pt)
  const projection = geoAlbersUsa().fitExtent(box, { type: 'FeatureCollection', features: states });
  const path = geoPath(projection);
  let shapes;
  if (style === 'mosaic') {
    shapes = states.map((f, i) => {
      const [[x0, y0], [x1, y1]] = path.bounds(f);
      const img = `assets/img/map/${slugOf(f.properties.name)}.jpg`; // small copies of the hero landscapes (assets/img/map)
      return `<clipPath id="mc${i}"><path d="${path(f)}"/></clipPath><image href="${img}" x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" preserveAspectRatio="xMidYMid slice" clip-path="url(#mc${i})"/>`;
    }).join('') + `<g class="borders">${states.map((f) => `<path d="${path(f)}"/>`).join('')}</g>`;
  } else if (style === 'heritage') {
    // Greedy colouring over the real neighbours, so no two touching states share a colour.
    const nb = neighbors(all);
    const colour = {};
    for (const i of keep) {
      const used = new Set(nb[i].map((j) => colour[j]));
      colour[i] = HERITAGE.findIndex((_, c) => !used.has(c));
    }
    shapes = keep.map((i, k) => `<path d="${path(states[k])}" style="fill:${HERITAGE[Math.max(0, colour[i])]}"/>`).join('');
  } else {
    shapes = states.map((f) => `<path d="${path(f)}"/>`).join('');
  }
  const extra = style === 'atlas' ? compass(1020, 640) : '';
  const labels = [];
  const offshore = [];
  for (const f of states) {
    const code = POSTAL[f.properties.name];
    const [x, y] = path.centroid(f);
    if (OFFSHORE.includes(code)) { offshore.push({ code, x, y }); continue; }
    const [dx, dy] = NUDGE[code] || [0, 0];
    labels.push(`<text x="${(x + dx).toFixed(1)}" y="${(y + dy + 2.6).toFixed(1)}">${code}</text>`);
  }
  // Offshore labels in one column off the coast, at least 13pt apart.
  offshore.sort((a, b) => a.y - b.y);
  let last = -Infinity;
  const colX = 1062;
  for (const o of offshore) {
    const ly = Math.max(o.y, last + 13);
    last = ly;
    labels.push(`<line x1="${o.x.toFixed(1)}" y1="${o.y.toFixed(1)}" x2="${colX - 4}" y2="${(ly - 2.4).toFixed(1)}" class="leader"/><circle cx="${o.x.toFixed(1)}" cy="${o.y.toFixed(1)}" r="1.3" class="dot"/><text x="${colX}" y="${ly.toFixed(1)}" class="off">${o.code}</text>`);
  }
  if (chapters.length !== 50) throw new Error('Map expects 50 states');
  const sea = style === 'atlas' ? '<rect class="sea" x="60" y="168" width="1068" height="560" rx="10"/>' : '';
  return `<svg class="usmap ${style}" width="1188pt" height="792pt" viewBox="0 0 1188 792" aria-hidden="true">
    ${sea}<g class="states">${shapes}</g>${extra}<g class="labels">${labels.join('')}</g></svg>`;
}

// Compass rose for the atlas style.
function compass(cx, cy) {
  const r = 34;
  const pt = (a, d) => `${(cx + d * Math.sin(a)).toFixed(1)},${(cy - d * Math.cos(a)).toFixed(1)}`;
  const arm = (a, len, cls) => `<polygon class="${cls}" points="${pt(a, len)} ${pt(a + 0.35, r * 0.22)} ${pt(a + Math.PI, 0)} ${pt(a - 0.35, r * 0.22)}"/>`;
  const arms = [0, Math.PI / 2, Math.PI, 1.5 * Math.PI].map((a) => arm(a, r, 'main')).join('')
    + [0.25, 0.75, 1.25, 1.75].map((k) => arm(k * Math.PI, r * 0.6, 'minor')).join('');
  return `<g class="compass"><circle cx="${cx}" cy="${cy}" r="${r * 0.75}"/>${arms}<text x="${cx}" y="${cy - r - 6}">N</text></g>`;
}

/** Pages 10–11: title and line on the left page, the map across both. */
/** Pages 10–11: the client's choice (v2.1 #303) — option A, the landscape mosaic; the heading on the
 * left page and the line on the right page mirror each other, no star rule. */
export function mapSpread(m, chapters, style = 'mosaic', option = '') {
  const svg = mapSvg(chapters, style);
  const opt = option ? ` data-option="${esc(option)}"` : '';
  return `<section class="page map verso" data-section="map"${opt}>
    <div class="map-head"><h1 class="page-title">${esc(m.title)}</h1></div>
    <div class="map-art">${svg}</div>
    ${FOOTER}
  </section>
  <section class="page map recto" data-section="map-right"${opt}>
    <div class="map-head right"><p class="map-intro">${esc(m.intro)}</p></div>
    <div class="map-art" style="left:-594pt">${svg}</div>
    ${FOOTER}
  </section>`;
}

// ---------------------------------------------------------------- back matter

/** Find the recipe a menu / allergen line names ("Maryland Steamed Crabs · Maryland"). */
export function recipeLookup(chapters) {
  const norm = (t) => t.toLowerCase().replace(/[^a-z]+/g, ' ').trim();
  return (title, state) => {
    const all = chapters.flatMap((c) => c.recipes.map((r) => ({ title: r.title, state: c.name })));
    const exact = all.find((r) => norm(r.title) === norm(title));
    if (exact) return exact;
    const inState = all.filter((r) => r.state === state);
    // Otherwise the recipe of that state sharing the most words with the line.
    const words = (t) => new Set(norm(t).split(' '));
    const score = (r) => [...words(title)].filter((w) => words(r.title).has(w)).length;
    const hit = [...inState].sort((a, b) => score(b) - score(a))[0];
    if (!hit) throw new Error(`No recipe for "${title}" (${state})`);
    return hit;
  };
}

// The state stays attached to the end of the title (client: no stranded middle dot).
const STATE_SEP = '\u00a0·\u00a0';
const row = (label, ref, cls = '') =>
  `<div class="ix-row${cls}"><span class="t">${label}</span><span class="lead"></span><span class="n" data-ref="${esc(ref).replace(/"/g, '&quot;')}">000</span></div>`;

/** The Table We Set Together, Menus for the Occasion, A Guide for Allergens (from the manuscript). */
export function backMatterFlows(sections, chapters) {
  const find = recipeLookup(chapters);
  const slugs = ['table', 'menus', 'allergens'];
  return sections.map((s, i) => {
    const out = [header(s.eyebrow, [s.title.toUpperCase()])];
    for (const b of s.blocks) {
      switch (b.type) {
        case 'BookBodyText': out.push(`<p data-split="text">${esc(b.text)}</p>`); break;
        case 'BonusIntro': out.push(`<p class="deck">${esc(b.text)}</p>`); break;
        case 'ornament': out.push(`<div class="ornament">${flatStar({ size: 12.8, color: '#a33522' })}</div>`); break;
        case 'ClosingLine': out.push(`<p class="closing-line">${esc(b.text)}</p>`); break;
        case 'SectionLabel': out.push(`<h2 class="prose-h divider" data-keep>${esc(b.text)}</h2>`); break;
        case 'GroupName': out.push(`<h3 class="group-name" data-keep>${esc(b.text)}</h3>`); break;
        case 'GroupDescription': out.push(`<p class="group-desc" data-keep>${esc(b.text)}</p>`); break;
        case 'item': {
          const r = find(b.recipe, b.state);
          out.push(row(`${esc(r.title)}${b.mark || ''}${STATE_SEP}<i>${esc(b.state).replace(/ /g, '\u00a0')}</i>`, `recipe:${r.title}`, ' item'));
          break;
        }
        case 'footnote': out.push(`<p class="group-desc footnote">${esc(b.text)}</p>`); break;
        default: throw new Error(`Back matter: unknown block ${b.type}`);
      }
    }
    return `<template class="flow" data-kind="prose" data-section="${slugs[i] || `back-${i}`}">${out.join('')}</template>`;
  });
}

function indexFlow(section, title, intro, groups) {
  const lis = groups.map(([head, entries]) => [
    head ? `<li class="sub">${esc(head)}</li>` : '',
    ...entries.map(([label, ref]) => `<li>${row(label, ref)}</li>`),
  ].join('')).join('');
  return `<template class="flow" data-kind="prose" data-section="${section}">${header('', [title])}${intro ? `<p class="deck">${esc(intro)}</p>` : ''}<ul class="ix-list" data-split="items">${lis}</ul></template>`;
}

export function indexFlows(chapters) {
  // Client (round 9): only the recipe index (ingredient and state indexes removed).
  const recipes = chapters.flatMap((c) => c.recipes.map((r) => ({ r, c })));
  const byTitle = (a, b) => a.r.title.localeCompare(b.r.title);
  const recipeIndex = indexFlow('recipe-index', 'RECIPE INDEX', '', [
    ['', [...recipes].sort(byTitle).map(({ r, c }) => [`${esc(r.title)}${STATE_SEP}<i>${esc(c.name).replace(/ /g, '\u00a0')}</i>`, `recipe:${r.title}`])],
  ]);
  return [recipeIndex];
}

