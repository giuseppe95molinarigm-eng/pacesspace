// General pages added in round 8 (dedication, Notes from the Kitchen, Our Culinary Map) and the
// back matter (closing essay, menus, allergen guide, indexes, acknowledgments).
// Long sections are <template class="flow"> blocks, poured into pages by src/paginate.js;
// every page number is a data-ref filled in from the final layout.
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
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
    case 'callout': return `<div class="callout"><h3 class="recipe-h">${esc(text)}</h3><ul>${items.map((t) => `<li>${bullet()}<span>${esc(t)}</span></li>`).join('')}</ul></div>`;
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

function mapSvg(chapters) {
  const states = feature(topo, topo.objects.states).features.filter((f) => POSTAL[f.properties.name]);
  const box = [[78, 182], [1040, 716]]; // across the spread (1188 × 792 pt)
  const projection = geoAlbersUsa().fitExtent(box, { type: 'FeatureCollection', features: states });
  const path = geoPath(projection);
  const shapes = states.map((f) => `<path d="${path(f)}"/>`).join('');
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
  return `<svg class="usmap" width="1188pt" height="792pt" viewBox="0 0 1188 792" aria-hidden="true">
    <g class="states">${shapes}</g><g class="labels">${labels.join('')}</g></svg>`;
}

/** Pages 10–11: title and line on the left page, the map across both. */
export function mapSpread(m, chapters) {
  const svg = mapSvg(chapters);
  return `<section class="page map verso" data-section="map">
    <div class="map-head">
      <h1 class="page-title">${esc(m.title)}</h1>
      ${starRule()}
      <p class="map-intro">${esc(m.intro)}</p>
    </div>
    <div class="map-art">${svg}</div>
    ${FOOTER}
  </section>
  <section class="page map recto" data-section="map-right">
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
    const hit = inState.find((r) => norm(title).includes(norm(r.title)) || norm(r.title).includes(norm(title))) || inState[0];
    if (!hit) throw new Error(`No recipe for "${title}" (${state})`);
    return hit;
  };
}

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
          out.push(row(`${esc(b.recipe)} <i>· ${esc(b.state)}</i>`, `recipe:${r.title}`, ' item'));
          break;
        }
        default: throw new Error(`Back matter: unknown block ${b.type}`);
      }
    }
    return `<template class="flow" data-kind="prose" data-section="${slugs[i] || `back-${i}`}">${out.join('')}</template>`;
  });
}

// Ingredient index: the main ingredients readers look up, matched against the ingredient lines.
const INGREDIENTS = [
  ['Apples', /\bapples?\b(?! cider| butter)/i], ['Bacon', /\bbacon\b/i],
  ['Beef', /\bbeef\b(?! (broth|stock|tallow))|ribeye|sirloin|chuck|brisket|prime rib/i],
  ['Berries', /berries|huckleberr/i], ['Buckwheat flour', /buckwheat/i], ['Buttermilk', /buttermilk/i],
  ['Cabbage', /cabbage|coleslaw/i], ['Catfish', /catfish/i], ['Cheddar cheese', /cheddar/i],
  ['Chicken', /chicken(?! (broth|stock|soup))/i], ['Chocolate', /chocolate|cocoa/i], ['Clams', /clams?\b/i],
  ['Coconut', /coconut/i], ['Cornmeal', /cornmeal/i], ['Crab', /\bcrabs?\b|crabmeat/i], ['Cream cheese', /cream cheese/i],
  ['Elk', /\belk\b/i], ['Fish, white', /white fish|grouper|cod\b|halibut/i], ['Green tomatoes', /green tomatoes/i],
  ['Ham', /\bham\b/i], ['Lamb', /\blamb\b|mutton/i], ['Lobster', /lobster/i], ['Maple syrup', /maple syrup/i],
  ['Okra', /okra/i], ['Peaches', /peach/i], ['Peanut butter and peanuts', /peanut butter|roasted peanuts/i],
  ['Pecans', /pecan/i], ['Pork', /\bpork\b(?! roll| fat)|pork shoulder|salt pork/i], ['Pork roll', /pork roll/i],
  ['Potatoes', /potato|hash browns/i], ['Rice', /\brice\b(?! cereal)/i], ['Salmon', /salmon/i],
  ['Sausage', /sausage|andouille|hot dog/i], ['Scrapple', /scrapple/i], ['Shrimp', /shrimp/i],
  ['Trout', /trout/i], ['Venison', /venison/i], ['Wild rice', /wild rice/i],
];

function indexFlow(section, title, intro, groups) {
  const lis = groups.map(([head, entries]) => [
    head ? `<li class="sub">${esc(head)}</li>` : '',
    ...entries.map(([label, ref]) => `<li>${row(label, ref)}</li>`),
  ].join('')).join('');
  return `<template class="flow" data-kind="prose" data-section="${section}">${header('', [title])}${intro ? `<p class="deck">${esc(intro)}</p>` : ''}<ul class="ix-list" data-split="items">${lis}</ul></template>`;
}

export function indexFlows(chapters) {
  const recipes = chapters.flatMap((c) => c.recipes.map((r) => ({ r, c })));
  const byTitle = (a, b) => a.r.title.localeCompare(b.r.title);
  const recipeIndex = indexFlow('recipe-index', 'RECIPE INDEX', '', [
    ['', [...recipes].sort(byTitle).map(({ r, c }) => [`${esc(r.title)} <i>· ${esc(c.name)}</i>`, `recipe:${r.title}`])],
  ]);
  const ingredientGroups = INGREDIENTS.map(([name, re]) => [name, recipes
    .filter(({ r }) => r.blocks.some((b) => b.type === 'ingredient' && re.test(b.text)))
    .sort(byTitle)
    .map(({ r, c }) => [`${esc(r.title)} <i>· ${esc(c.name)}</i>`, `recipe:${r.title}`])]).filter(([, e]) => e.length);
  const ingredientIndex = indexFlow('ingredient-index', 'INGREDIENT INDEX', '', ingredientGroups);
  const stateIndex = indexFlow('state-index', 'STATE INDEX', '', chapters.map((c) => [c.name, [
    [`<i>${esc(c.nickname)}</i>`, `state:${c.slug}`],
    ...c.recipes.map((r) => [esc(r.title), `recipe:${r.title}`]),
  ]]));
  return [recipeIndex, ingredientIndex, stateIndex];
}

export function acknowledgmentsPage(a) {
  return `<template class="flow" data-kind="prose" data-section="acknowledgments">${header('', [a.title])}<p class="placeholder">${esc(a.placeholder)}</p></template>`;
}
