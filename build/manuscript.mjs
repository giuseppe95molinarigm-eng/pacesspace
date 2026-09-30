// Reads the client's manuscript (Word) and returns the 50 state chapters as data.
// The paragraph styles of the manuscript drive the parsing (HeroStateName,
// RecipeTagline, IngredientItem, …), so text edits in Word flow straight into the layout.
import { readFile } from 'node:fs/promises';
import JSZip from 'jszip';

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
  return { chapters, skipped };
}
