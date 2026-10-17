// Generates the book illustrations on Replicate from illustrations/prompts.csv.
//   REPLICATE_API_TOKEN=... node build/generate-images.mjs --states arkansas,california --models imagen,flux
// Candidates land in illustrations/candidates/<state>/<image>--<model>.jpg (not committed);
// the chosen one is then copied to assets/img/states/<state>/ and upscaled.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN = process.env.REPLICATE_API_TOKEN;
if (!TOKEN) throw new Error('Set REPLICATE_API_TOKEN');

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : def;
};
const STATES = arg('states', '').split(',').filter(Boolean);
const MODELS = arg('models', 'imagen').split(',');
const ONLY = arg('only', ''); // e.g. "hero" or "dish-1"

// Aspect ratios each model accepts; the prompt's ratio is mapped to the closest one.
const MODEL = {
  imagen: {
    id: 'google/imagen-4-ultra',
    ratios: ['1:1', '9:16', '16:9', '3:4', '4:3'],
    input: (prompt, ar) => ({ prompt, aspect_ratio: ar, image_size: '2K', output_format: 'png', safety_filter_level: 'block_only_high' }),
  },
  flux: {
    id: 'black-forest-labs/flux-1.1-pro-ultra',
    ratios: ['21:9', '16:9', '3:2', '4:3', '5:4', '1:1', '4:5', '3:4', '2:3', '9:16', '9:21'],
    input: (prompt, ar) => ({ prompt, aspect_ratio: ar, raw: true, output_format: 'png', safety_tolerance: 2 }),
  },
};
const nearest = (ratio, list) => {
  const v = (r) => { const [a, b] = r.split(':').map(Number); return a / b; };
  return list.reduce((best, r) => (Math.abs(Math.log(v(r) / v(ratio))) < Math.abs(Math.log(v(best) / v(ratio))) ? r : best));
};

function parseCsv(text) {
  const rows = []; let row = []; let cell = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

async function api(url, body) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const res = await fetch(url, {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', Prefer: 'wait=60' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 6000 * (attempt + 1))); continue; }
    const json = await res.json();
    if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json)}`);
    return json;
  }
  throw new Error('Replicate API kept failing');
}

async function run(model, prompt, ratio) {
  const m = MODEL[model];
  const ar = nearest(ratio, m.ratios);
  let p = await api(`https://api.replicate.com/v1/models/${m.id}/predictions`, { input: m.input(prompt, ar) });
  while (!['succeeded', 'failed', 'canceled'].includes(p.status)) {
    await new Promise((r) => setTimeout(r, 2500));
    p = await api(p.urls.get);
  }
  if (p.status !== 'succeeded') throw new Error(`${model}: ${p.status} ${p.error || ''}`);
  const url = Array.isArray(p.output) ? p.output[0] : p.output;
  if (!url) throw new Error(`${model}: no image returned (likely filtered)`);
  const img = Buffer.from(await (await fetch(url)).arrayBuffer());
  return { img, ar, seconds: p.metrics?.predict_time };
}

const rows = parseCsv((await readFile(path.join(root, 'illustrations/prompts.csv'), 'utf8')).replace(/^﻿/, ''));
const [head, ...data] = rows;
const col = (n) => head.indexOf(n);
const jobs = data.filter((r) => r.length > 5).map((r) => ({
  file: r[col('file')], state: r[col('state')], ratio: r[col('aspect ratio')],
  prompt: `${r[col('prompt')]} ${r[col('negative prompt')]}`,
})).filter((j) => {
  const slug = j.file.split('/')[3];
  const name = path.basename(j.file, '.jpg');
  return (!STATES.length || STATES.includes(slug)) && (!ONLY || ONLY === name);
});

for (const j of jobs) {
  const slug = j.file.split('/')[3];
  const name = path.basename(j.file, '.jpg');
  const dir = path.join(root, 'illustrations/candidates', slug);
  await mkdir(dir, { recursive: true });
  for (const model of MODELS) {
    const out = path.join(dir, `${name}--${model}.png`);
    if (existsSync(out)) { console.log(`= ${slug}/${name} ${model} (exists)`); continue; }
    try {
      const { img, ar, seconds } = await run(model, j.prompt, j.ratio);
      await writeFile(out, img);
      console.log(`✓ ${slug}/${name} ${model} ${ar} ${seconds ? seconds.toFixed(1) + 's' : ''}`);
    } catch (e) {
      console.log(`✗ ${slug}/${name} ${model}: ${e.message.slice(0, 300)}`);
    }
  }
}
