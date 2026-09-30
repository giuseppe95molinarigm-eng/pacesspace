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

function scallopRect(x0, y0, x1, y1, r) {
  return `M${x0 + r},${y0} H${x1 - r} A${r},${r} 0 0 0 ${x1},${y0 + r} V${y1 - r} A${r},${r} 0 0 0 ${x1 - r},${y1} H${x0 + r} A${r},${r} 0 0 0 ${x0},${y1 - r} V${y0 + r} A${r},${r} 0 0 0 ${x0 + r},${y0} Z`;
}

// Silhouette PNG is rendered at 300 dpi; its size in pt follows from the pixels.
const SILHOUETTE = { wPt: 311.04, hPt: 492.24, top: 238 };
const HERO_CENTER_X = 288; // centre of the gold frame

export function heroPage(s) {
  const folio = s.firstPage;
  const left = HERO_CENTER_X - SILHOUETTE.wPt / 2;
  // Changes vs sample: five-star rule and red single-star rule removed; the gold
  // single-star rule now sits where the red one was (between name and nickname);
  // the state is larger, re-centred, and outlined in the frame gold.
  return `<section class="page hero ${side(folio)}">
    <svg class="frame" width="594pt" height="792pt" viewBox="0 0 594 792" aria-hidden="true">
      <path d="${scallopRect(20.14, 23.54, 555.86, 768.46, 18)}" fill="#f4efe5" stroke="#bb9554" stroke-width="1"/>
    </svg>
    <img class="flag-wave" src="assets/img/common/hero-flag-wave.jpg" alt="">
    <svg class="frame" width="594pt" height="792pt" viewBox="0 0 594 792" aria-hidden="true">
      <path d="${scallopRect(27.255, 33.445, 548.745, 758.555, 17.52)}" fill="none" stroke="#bb9554" stroke-width="1.05"/>
    </svg>
    <div class="state-name">${esc(s.name)}</div>
    ${starRule({ lineLength: 70.8, gap: 7.5, bigStar: { size: 25.2, tone: 'gold' } })}
    <div class="nickname">${esc(s.nickname)}</div>
    <img class="silhouette" src="${s.hero.silhouette}" alt="${esc(s.name)}" style="left:${left.toFixed(2)}pt;top:${SILHOUETTE.top}pt;width:${SILHOUETTE.wPt}pt;height:${SILHOUETTE.hPt}pt">
  </section>`;
}

export function storyPage(s) {
  const folio = s.firstPage + 1;
  const paras = s.story.map((p) => `<p>${esc(p)}</p>`).join('');
  return `<section class="page story ${side(folio)}">
    <div class="live body-text">
      <div class="story-body">
        <div class="story-flag" aria-hidden="true"><img src="${s.flag}" alt=""></div>
        ${paras}
      </div>
    </div>
    ${stateFooter(folio, side(folio))}
  </section>`;
}

function recipeBlock(r) {
  // Two columns once the list gets long; short lists stay in one column.
  const cols = r.ingredients.length > 5 ? 'cols-2' : '';
  const ing = r.ingredients
    .map((i) => `<li>${flatStar({ size: 7, color: '#bb9554', opacity: 0.6 })}<span>${esc(i)}</span></li>`)
    .join('');
  const steps = r.steps
    .map(([lead, text]) => `<li><span class="lead-in">${esc(lead.replace(/:$/, ''))}</span>: ${esc(text)}</li>`)
    .join('');
  // Order requested by the client: title, tagline, yield, five stars, ingredients, instructions.
  return `<div class="${r.sub ? 'sub-recipe' : 'main-recipe'}">
    <h2 class="recipe-title">${r.title.map(esc).join('<br>')}</h2>
    ${r.tagline ? `<p class="recipe-tagline">${esc(r.tagline)}</p>` : ''}
    <p class="recipe-yield">${esc(r.yield)}</p>
    ${starRule({ cls: 'title-stars' })}
    <h3 class="recipe-h">INGREDIENTS</h3>
    <ul class="ingredients ${cols}">${ing}${r.note ? `<li class="note">${esc(r.note)}</li>` : ''}</ul>
    <h3 class="recipe-h">INSTRUCTIONS</h3>
    <ol class="steps">${steps}</ol>
  </div>`;
}

export function recipePage(s) {
  const folio = s.firstPage + 2;
  return `<section class="page recipe ${side(folio)}">
    <div class="live">${s.recipes.map(recipeBlock).join('')}</div>
    ${stateFooter(folio, side(folio))}
  </section>`;
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

export function foodImagePage(s) {
  const folio = s.firstPage + 3;
  const f = s.foodImages;
  return `<section class="page food ${side(folio)}">
    <div class="live" style="left:57.6pt;right:43.2pt">
      ${figure(f.main)}
      <div class="details">${f.details.map(figure).join('')}</div>
    </div>
    ${stateFooter(folio, side(folio))}
  </section>`;
}
