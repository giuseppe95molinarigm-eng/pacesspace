// State outlines for the hero pages (US Census data via the us-atlas package).
// Each state gets its own transverse-Mercator projection centred on it, so the
// shape is true to form (no Albers-USA insets for Alaska and Hawaii).
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import { geoTransverseMercator, geoPath, geoCentroid } from 'd3-geo';

const require = createRequire(import.meta.url);
const topo = require('us-atlas/states-10m.json');
const states = feature(topo, topo.objects.states).features;

// Rhode Island: at print size the 10m outline of Narragansett Bay breaks the state into
// jagged slivers (client: "star-shaped cutout"). The mainland and bay islands are drawn as one
// clean outline (their hull, as on most state maps at this scale); Block Island stays separate.
function hull(points) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const q of p) { while (lower.length > 1 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); }
  for (const q of p.reverse()) { while (upper.length > 1 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}
function rhodeIsland(f) {
  const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
  const mean = (poly) => poly[0].reduce((m, [, lat]) => m + lat, 0) / poly[0].length;
  const main = polys.filter((poly) => mean(poly) > 41.3);
  const block = polys.filter((poly) => mean(poly) <= 41.3);
  const ring = hull(main.flatMap((poly) => poly[0]));
  ring.push(ring[0]);
  // d3-geo wants clockwise exterior rings: the monotone-chain hull is counter-clockwise (lon/lat).
  return { ...f, geometry: { type: 'MultiPolygon', coordinates: [[ring.reverse()], ...block] } };
}

// Alaska: leave out the far Aleutian islands (west of the Alaska Peninsula),
// otherwise the chain stretches the shape so wide that the state prints tiny.
function trim(f) {
  if (f.properties.name === 'Rhode Island') return rhodeIsland(f);
  if (f.properties.name !== 'Alaska') return f;
  const keep = f.geometry.coordinates.filter((poly) => {
    const lons = poly[0].map(([lon]) => (lon > 0 ? lon - 360 : lon));
    return lons.reduce((a, b) => a + b, 0) / lons.length > -164;
  });
  return { ...f, geometry: { type: 'MultiPolygon', coordinates: keep } };
}

/**
 * SVG path of the state fitted inside a w × h box (pt), and its real width/height.
 * With `area` (pt²), the state is drawn no larger than that surface, so that all
 * states look about the same size on their hero pages (client request); states
 * that cannot reach it inside the box (very wide ones) simply fill the box.
 */
export function statePath(name, w, h, area = Infinity) {
  const found = states.find((s) => s.properties.name === name);
  if (!found) throw new Error(`No outline for ${name}`);
  const f = trim(found);
  const [lon, lat] = geoCentroid(f);
  const projection = geoTransverseMercator().rotate([-lon, -lat]).fitSize([w, h], f);
  let path = geoPath(projection);
  const fitted = path.area(f);
  if (fitted > area) {
    const k = Math.sqrt(area / fitted);
    projection.fitSize([w * k, h * k], f);
    path = geoPath(projection);
  }
  const [[x0, y0], [x1, y1]] = path.bounds(f);
  // Each island / separate piece, for states drawn piece by piece (Hawaii).
  const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
  const parts = polys.map((coordinates) => {
    const g = { type: 'Polygon', coordinates };
    const [[a, b], [c, e]] = path.bounds(g);
    return { d: path(g), x0: a, y0: b, width: c - a, height: e - b };
  });
  return { d: path(f), x0, y0, width: x1 - x0, height: y1 - y0, area: path.area(f), parts };
}
