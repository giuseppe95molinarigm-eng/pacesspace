// Shared decorative elements. Every page draws its stars, rules and footer from
// here so that the approved look is identical across the whole book.

let uid = 0;
const nextId = (p) => `${p}${++uid}`;

// Five-point star, point up, in a 100 × 95 box.
const STAR_POINTS = (() => {
  const cx = 50, cy = 52.6, R = 50, r = 19.1;
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = (-90 + i * 36) * (Math.PI / 180);
    const rad = i % 2 === 0 ? R : r;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
})();

const GOLD_STOPS = `<stop offset="0" stop-color="#f3e2b3"/><stop offset=".45" stop-color="#c9a15c"/><stop offset="1" stop-color="#6f5021"/>`;
const RED_STOPS = `<stop offset="0" stop-color="#d9674f"/><stop offset=".5" stop-color="#a33522"/><stop offset="1" stop-color="#5e140b"/>`;

/** Gradient star as used in the sample ornaments ("gold" or "red"). */
export function star({ size = 9.84, tone = 'gold', cls = '' } = {}) {
  const id = nextId('st');
  const stops = tone === 'red' ? RED_STOPS : GOLD_STOPS;
  return `<svg class="star ${cls}" width="${size}pt" height="${(size * 0.95).toFixed(2)}pt" viewBox="0 0 100 95" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2=".35" y2="1">${stops}</linearGradient></defs>
    <polygon points="${STAR_POINTS}" fill="url(#${id})"/></svg>`;
}

/** Flat star (footer, ingredient markers, page 9 closing star). */
export function flatStar({ size = 7.56, color = '#bb9554', opacity = 1, cls = '' } = {}) {
  return `<svg class="star ${cls}" width="${size}pt" height="${(size * 0.95).toFixed(2)}pt" viewBox="0 0 100 95" aria-hidden="true"><polygon points="${STAR_POINTS}" fill="${color}" fill-opacity="${opacity}"/></svg>`;
}

/**
 * Red rule that fades out at both outer ends, with stars in the middle.
 * This is the Table of Contents / Our Culinary Map ornament; the client asked
 * for it to be the only five-star style used in the book (cover included).
 */
export function starRule({ stars = 5, lineLength = 71, starSize = 9.84, pitch = 15, gap = 4.8, bigStar = null, cls = '' } = {}) {
  const id = nextId('fade');
  const line = (dir) => `<svg class="rule-line" width="${lineLength}pt" height="1.6pt" viewBox="0 0 100 2" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="${id}${dir}" x1="${dir === 'l' ? 0 : 1}" x2="${dir === 'l' ? 1 : 0}" y1="0" y2="0">
        <stop offset="0" stop-color="#a33522" stop-opacity="0"/><stop offset=".55" stop-color="#b8563f" stop-opacity=".75"/><stop offset="1" stop-color="#a33522"/></linearGradient></defs>
      <rect width="100" height="2" fill="url(#${id}${dir})"/></svg>`;
  let middle;
  if (bigStar) {
    middle = star({ size: bigStar.size, tone: bigStar.tone });
  } else {
    const spacing = (pitch - starSize).toFixed(2);
    middle = `<span class="rule-stars" style="gap:${spacing}pt">${Array.from({ length: stars }, () => star({ size: starSize })).join('')}</span>`;
  }
  return `<div class="star-rule ${cls}" style="gap:${gap}pt">${line('l')}${middle}${line('r')}</div>`;
}

/**
 * Footer of the state chapters — reproduced 1:1 from the sample
 * (client: "KEEP THE FOOTER AS IS"). Recto pages sit 9pt right of verso ones,
 * exactly as in the InDesign master.
 */
export function stateFooter(folio, side) {
  const shift = side === 'verso' ? -9 : 0;
  const starsLeft = Array.from({ length: 11 }, (_, i) => 52.2 + shift + i * 20.235);
  const starsRight = Array.from({ length: 11 }, (_, i) => 335.49 + shift + i * 20.235);
  const s = [...starsLeft, ...starsRight]
    .map((x) => `<span class="fs" style="left:${x.toFixed(2)}pt">${flatStar({ size: 7.56 })}</span>`)
    .join('');
  const cx = 298.8 + shift;
  return `<footer class="state-footer">
    <div class="band-red"></div><div class="band-navy"></div>${s}
    <div class="folio-circle" style="left:${(cx - 14.53).toFixed(2)}pt"><span>${folio}</span></div>
  </footer>`;
}

/** Plain centred folio used on the front-matter pages. */
export function plainFolio(folio, side) {
  const cx = side === 'verso' ? 289.8 : 298.8;
  return `<div class="plain-folio" style="left:${cx - 30}pt">${folio}</div>`;
}

export const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
