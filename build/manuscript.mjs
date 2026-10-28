// Reads the client's manuscript (Word) and returns the 50 state chapters as data.
// The paragraph styles of the manuscript drive the parsing (HeroStateName,
// RecipeTagline, IngredientItem, …), so text edits in Word flow straight into the layout.
import { readFile } from 'node:fs/promises';
import JSZip from 'jszip';
import corrections from '../src/content/corrections.mjs';

const decode = (s) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'").replace(/&amp;/g, '&');

// Typographer's quotes (the Word file mixes straight and curly ones).
const smartQuotes = (s) => s
  .replace(/(^|[\s(\[—–-])"/g, '$1“').replace(/"/g, '”')
  .replace(/(^|[\s(\[—–-])'/g, '$1‘').replace(/'/g, '’');

async function paragraphs(docxPath) {
  const zip = await JSZip.loadAsync(await readFile(docxPath));
  const xml = await zip.file('word/document.xml').async('string');
  const out = [];
  for (const p of xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) || []) {
    const style = (p.match(/<w:pStyle w:val="([^"]+)"/) || [])[1] || '';
    const text = smartQuotes(decode([...p.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join('')).trim());
    if (text) out.push({ style, text });
  }
  return out;
}

export const slug = (name) => name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');

// "Prep the chicken: Pound the…" → ['Prep the chicken', 'Pound the…']
function splitLeadIn(text) {
  const m = text.match(/^([^:]{2,60}):\s+(.*)$/s);
  return m ? [m[1], m[2]] : ['', text];
}

export async function readManuscript(docxPath) {
  const paras = await paragraphs(docxPath);
  const chapters = [];
  const skipped = []; // unstyled notes left in the manuscript (reported, not printed)
  let state = null;
  let recipe = null;
  let section = null;
  let pendingPlaceholder = false;

  for (const { style, text } of paras) {
    if (style === 'Titolo1') {
      state = null; recipe = null;
      continue;
    }
    if (style === 'HeroStateName') {
      state = { name: text, slug: slug(text), nickname: '', story: [], recipes: [], dishImages: [] };
      chapters.push(state);
      continue;
    }
    if (!state) continue;

    if (text === 'ILLUSTRATION PLACEHOLDER') { pendingPlaceholder = true; continue; }
    if (pendingPlaceholder) {
      pendingPlaceholder = false;
      if (/finished dish illustration/i.test(text)) {
        state.dishImages.push({ description: text, spread: /full[\s-]*page[\s-]*spread/i.test(text) });
      } else if (!/state shape/i.test(text)) {
        skipped.push({ state: state.name, text });
      }
      continue;
    }

    // A "Notes & tips" box placed before the recipe in Word (Nebraska) is kept
    // and printed at the end of that recipe, where the other states have it.
    if (!recipe && (style === 'CalloutTitle' || style === 'CalloutItem')) {
      state.earlyCallout = state.earlyCallout || [];
      state.earlyCallout.push(style === 'CalloutTitle'
        ? { type: 'callout-title', text: text.toUpperCase() }
        : { type: 'callout-item', text: text.replace(/^→\s*/, '') });
      continue;
    }
    if (!recipe && !['HeroNickname', 'BookBodyText', 'Titolo2'].includes(style)) {
      skipped.push({ state: state.name, text: `[${style}] ${text}` });
      continue;
    }
    switch (style) {
      case 'HeroNickname': state.nickname = text; break;
      case 'BookBodyText':
        if (!recipe) state.story.push(text); else skipped.push({ state: state.name, text });
        break;
      case 'Titolo2':
        recipe = { title: text, tagline: '', yield: '', blocks: [] };
        state.recipes.push(recipe);
        section = null;
        break;
      case 'RecipeTagline': recipe.tagline = text; break;
      case 'YieldLabel': recipe.yield = text; break;
      case 'SectionLabel':
        section = /INSTRUCTION/i.test(text) ? 'instructions' : 'ingredients';
        recipe.blocks.push({ type: 'heading', text: section === 'instructions' ? 'INSTRUCTIONS' : 'INGREDIENTS' });
        break;
      case 'IngredientSubheader': recipe.blocks.push({ type: 'ingredient-sub', text }); break;
      case 'IngredientItem': recipe.blocks.push({ type: 'ingredient', text }); break;
      case 'InstructionSubheader': recipe.blocks.push({ type: 'step-sub', text }); break;
      case 'InstructionItem': recipe.blocks.push({ type: 'step', parts: splitLeadIn(text) }); break;
      case 'NoteText': recipe.blocks.push({ type: 'note', text }); break;
      case 'CalloutTitle': recipe.blocks.push({ type: 'callout-title', text: text.toUpperCase() }); break;
      case 'CalloutItem': recipe.blocks.push({ type: 'callout-item', text: text.replace(/^→\s*/, '') }); break;
      default: skipped.push({ state: state.name, text });
    }
  }
  for (const c of chapters) {
    if (c.earlyCallout && c.recipes[0]) c.recipes[0].blocks.push(...c.earlyCallout);
    delete c.earlyCallout;
  }
  for (const c of chapters) {
    if (!process.env.RAW) applyCorrections(c, corrections[c.slug] || []);
    c.story = c.story.filter((p) => p.trim());
    // Client (round 9): no "Serve with … (page XX)" lines; the recipes sit together anyway.
    for (const r of c.recipes) r.blocks = r.blocks.filter((b) => !(b.type === 'note' && /page XX/.test(b.text)));
    if (!process.env.RAW) applyHouseStyle(c);
  }
  return { chapters, skipped };
}

// Every editable string of a chapter, as [get, set] pairs.
function textFields(ch) {
  const f = [];
  ch.story.forEach((_, i) => f.push([() => ch.story[i], (v) => { ch.story[i] = v; }]));
  for (const r of ch.recipes) {
    for (const k of ['title', 'tagline', 'yield']) f.push([() => r[k], (v) => { r[k] = v; }]);
    for (const b of r.blocks) {
      if (b.parts) b.parts.forEach((_, i) => f.push([() => b.parts[i], (v) => { b.parts[i] = v; }]));
      else if (b.text !== undefined) f.push([() => b.text, (v) => { b.text = v; }]);
    }
  }
  return f;
}
const blockText = (b) => b.text ?? (b.parts ? b.parts.join(': ') : '');
const hit = (text, find) => (find instanceof RegExp ? find.test(text) : text.includes(find));

/**
 * Client corrections (src/content/corrections.mjs). Each entry is one of:
 *   { find, replace }              text change anywhere in the chapter (must match)
 *   { remove }                     drop the recipe blocks whose text matches
 *   { before, insert: {type,text} }   add a block before the block starting with `before`
 *   { after, insert: {type,text} }    … or after it
 *   { move, before }               move an ingredient group (sub-heading + items) before another
 *   { story: [...] }               new story text
 *   { storyNote }                  a story paragraph moved into a boxed note under the story
 *   { breakBefore }                the recipe starting with this title begins on a new page
 */
function applyCorrections(ch, list) {
  for (const k of list) {
    let done = false;
    if (k.story) { ch.story = k.story; done = true; }
    else if (k.yieldFor) {
      const r = ch.recipes.find((x) => x.title.startsWith(k.yieldFor));
      if (r) { r.yield = k.yield; done = true; }
    } else if (k.noteToCallout) {
      // A plain note becomes a boxed note at the end of the recipe (Wyoming serving tip).
      for (const r of ch.recipes) {
        const i = r.blocks.findIndex((b) => b.type === 'note' && hit(b.text, k.noteToCallout));
        if (i < 0) continue;
        const [b] = r.blocks.splice(i, 1);
        r.blocks.push({ type: 'callout-title', text: k.title }, { type: 'callout-item', text: b.text.replace(/^Serving Tip:\s*/, '') });
        done = true;
      }
    } else if (k.retype) {
      for (const r of ch.recipes) for (const b of r.blocks) if (b.text === k.retype) { b.type = k.type; done = true; }
    }
    else if (k.storyNote) {
      const i = ch.story.findIndex((p) => hit(p, k.storyNote));
      if (i >= 0) { (ch.storyNotes ||= []).push(ch.story[i]); ch.story.splice(i, 1); done = true; }
    } else if (k.breakBefore) {
      const r = ch.recipes.find((x) => x.title.startsWith(k.breakBefore));
      if (r) { r.newPage = true; done = true; }
    } else if (k.find !== undefined) {
      let n = 0;
      for (const [get, set] of textFields(ch)) {
        const t = get();
        if (typeof t === 'string' && hit(t, k.find) && (!k.nth || ++n === k.nth)) {
          set(k.find instanceof RegExp ? t.replace(k.find, k.replace) : t.split(k.find).join(k.replace));
          done = true;
        }
      }
    } else {
      for (const r of ch.recipes) {
        if (k.remove) {
          const n = r.blocks.length;
          r.blocks = r.blocks.filter((b) => !hit(blockText(b), k.remove));
          done ||= r.blocks.length < n;
        } else if (k.insert) {
          const at = r.blocks.findIndex((b) => blockText(b).startsWith(k.before ?? k.after));
          if (at >= 0) { r.blocks.splice(k.before ? at : at + 1, 0, { ...k.insert }); done = true; }
        } else if (k.move) {
          const from = r.blocks.findIndex((b) => b.type === 'ingredient-sub' && b.text === k.move);
          if (from < 0) continue;
          let end = from + 1;
          while (end < r.blocks.length && r.blocks[end].type === 'ingredient') end++;
          const group = r.blocks.splice(from, end - from);
          const to = r.blocks.findIndex((b) => b.type === 'ingredient-sub' && b.text === k.before);
          r.blocks.splice(to, 0, ...group);
          done = to >= 0;
        }
      }
    }
    if (!done) throw new Error(`Correction not applied for ${ch.name}: ${JSON.stringify(k).slice(0, 120)}`);
  }
}

// ---------------------------------------------------------------- house style (client, round 9)
// Words kept capitalised when a step title is set in sentence case.
const PROPER = /^(Alabama|Arkansas|Arizona|Idaho|Key|Kalua|Nashville|Pecorino|Romano|Old|Bay|French|Denver|Philly|Vermont|Cheddar|Dutch|Carolina|Gold|Cajun|Creole|Instant|Pot|Kringle|Danish|Texas|Utica|Cincinnati|New|England|Maine|Montana|Wyoming|Sonoran|Jo|Hawaiian|Worcestershire|Dijon|Old Bay|American)$/;
const sentenceCase = (lead) => lead.split(' ').map((w, i) => {
  if (i === 0) return w[0].toUpperCase() + w.slice(1).toLowerCase();
  return PROPER.test(w.replace(/[^A-Za-z]/g, '')) ? w : w.toLowerCase();
}).join(' ').replace(/ & /g, ' and ');

const WJ = '⁠'; // word joiner: no line break at this point
function houseStyle(t) {
  return t
    .replace(/ ?— ?/g, '—')                            // closed em dashes (never a line starting with one)
    .replace(/(\d) ([½¼¾⅓⅔⅛])/g, '$1$2')              // closed mixed numbers (1½)
    .replace(/(\S)–(?=\S)/g, `$1${WJ}–${WJ}`)          // ranges never break at the dash
    .replace(/°F \/ (\d)/g, '°F / $1');     // 110°F / 43°C stays on one line
}

export function applyHouseStyle(ch) {
  for (const r of ch.recipes) for (const b of r.blocks) if (b.type === 'step' && b.parts[0]) b.parts[0] = sentenceCase(b.parts[0]);
  for (const [get, set] of textFields(ch)) { const t = get(); if (typeof t === 'string') set(houseStyle(t)); }
  ch.storyNotes = (ch.storyNotes || []).map(houseStyle);
}
export const styleText = houseStyle;

/**
 * Back matter after the last state (The Table We Set Together, Menus, Allergens):
 * one section per "BonusEyebrow", its paragraphs typed by their Word style.
 */
export async function readBackMatter(docxPath) {
  const paras = await paragraphs(docxPath);
  const start = paras.findIndex((p) => p.style === 'BonusEyebrow');
  const sections = [];
  let sec = null;
  for (const { style, text } of paras.slice(start)) {
    if (style === 'Titolo1') { sec = null; continue; }
    if (style === 'BonusEyebrow') { sec = { eyebrow: text, title: '', blocks: [] }; sections.push(sec); continue; }
    if (!sec) continue;
    if (style === 'BonusTitle') sec.title = text;
    else if (style === 'BonusDivider') { if (sec.blocks.length) sec.blocks.push({ type: 'ornament' }); }
    else if (style === 'GroupItem') {
      const [recipe, state] = text.split(/\s+·\s+/);
      sec.blocks.push({ type: 'item', recipe: recipe.trim(), state: (state || '').trim() });
    } else sec.blocks.push({ type: style, text });
  }
  return sections;
}
