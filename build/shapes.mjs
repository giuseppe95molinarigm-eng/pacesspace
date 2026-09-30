// State outlines for the hero pages (US Census data via the us-atlas package).
// Each state gets its own transverse-Mercator projection centred on it, so the
// shape is true to form (no Albers-USA insets for Alaska and Hawaii).
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import { geoTransverseMercator, geoPath, geoCentroid } from 'd3-geo';

const require = createRequire(import.meta.url);
const topo = require('us-atlas/states-10m.json');
const states = feature(topo, topo.objects.states).features;

/** SVG path of the state fitted inside a w × h box (pt), and its real width/height. */
export function statePath(name, w, h) {
  const f = states.find((s) => s.properties.name === name);
  if (!f) throw new Error(`No outline for ${name}`);
  const [lon, lat] = geoCentroid(f);
  const projection = geoTransverseMercator().rotate([-lon, -lat]).fitSize([w, h], f);
  const path = geoPath(projection);
  const [[x0, y0], [x1, y1]] = path.bounds(f);
  return { d: path(f), x0, y0, width: x1 - x0, height: y1 - y0 };
}
