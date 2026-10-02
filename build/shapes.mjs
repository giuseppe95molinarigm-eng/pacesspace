// State outlines for the hero pages (US Census data via the us-atlas package).
// Each state gets its own transverse-Mercator projection centred on it, so the
// shape is true to form (no Albers-USA insets for Alaska and Hawaii).
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import { geoTransverseMercator, geoPath, geoCentroid } from 'd3-geo';

const require = createRequire(import.meta.url);
const topo = require('us-atlas/states-10m.json');
const states = feature(topo, topo.objects.states).features;

// Alaska: leave out the far Aleutian islands (west of the Alaska Peninsula),
// otherwise the chain stretches the shape so wide that the state prints tiny.
function trim(f) {
  if (f.properties.name !== 'Alaska') return f;
  const keep = f.geometry.coordinates.filter((poly) => {
    const lons = poly[0].map(([lon]) => (lon > 0 ? lon - 360 : lon));
    return lons.reduce((a, b) => a + b, 0) / lons.length > -164;
  });
  return { ...f, geometry: { type: 'MultiPolygon', coordinates: keep } };
}

/** SVG path of the state fitted inside a w × h box (pt), and its real width/height. */
export function statePath(name, w, h) {
  const found = states.find((s) => s.properties.name === name);
  if (!found) throw new Error(`No outline for ${name}`);
  const f = trim(found);
  const [lon, lat] = geoCentroid(f);
  const projection = geoTransverseMercator().rotate([-lon, -lat]).fitSize([w, h], f);
  const path = geoPath(projection);
  const [[x0, y0], [x1, y1]] = path.bounds(f);
  return { d: path(f), x0, y0, width: x1 - x0, height: y1 - y0 };
}
