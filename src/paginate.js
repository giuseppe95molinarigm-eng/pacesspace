// Runs in the browser before printing. Pours each <template class="flow"> into as
// many pages as it needs, then numbers pages, sets recto/verso, fits long state
// names and resolves the manuscript's "page XX" cross-references.
// Result is left on window.__layout for the build script.
(function () {
  const FOOTER = document.getElementById('footer-shell').innerHTML;
  const FIRST_FOLIO = Number(document.body.dataset.firstFolio || 1);

  function newPage(kind, state, flag) {
    const sec = document.createElement('section');
    sec.className = `page ${kind}`;
    if (state) sec.dataset.state = state;
    sec.dataset.role = kind;
    fill(sec, kind, flag);
    return sec;
  }
  // Recto/verso must be known before measuring: the margins differ.
  function place(sec, where, ref) {
    ref[where](sec);
    const i = [...document.querySelectorAll('section.page')].indexOf(sec);
    sec.classList.add((FIRST_FOLIO + i) % 2 ? 'recto' : 'verso');
    return sec;
  }
  function fill(sec, kind, flag) {
    sec.innerHTML = kind === 'story'
      ? `<div class="live body-text">${flag ? `<div class="story-flag" aria-hidden="true"><img src="${flag}" alt=""></div>` : ''}<div class="story-body"></div></div>${FOOTER}`
      : `<div class="live"></div>${FOOTER}`;
    return sec;
  }
  const holder = (sec) => sec.querySelector('.story-body') || sec.querySelector('.live');
  const blocksIn = (el) => [...el.children].filter((c) => !c.classList.contains('story-flag'));

  function fits(sec) {
    const live = sec.querySelector('.live').getBoundingClientRect();
    const last = blocksIn(holder(sec)).pop();
    if (!last) return true;
    const mb = parseFloat(getComputedStyle(last).marginBottom) || 0;
    const reserve = Number(sec.dataset.reserve || 0);
    return last.getBoundingClientRect().bottom - Math.min(mb, 0) <= live.bottom - reserve + 0.5;
  }

  // Split a paragraph at a word boundary so its first part fills the page.
  function splitText(p, sec, box) {
    const words = p.textContent.split(/\s+/);
    const head = p.cloneNode(false);
    head.classList.add('split-head');
    box.appendChild(head);
    let lo = 0, hi = words.length - 1;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      head.textContent = words.slice(0, mid).join(' ');
      if (fits(sec)) lo = mid; else hi = mid - 1;
    }
    // Need at least two lines on this page, otherwise move the whole paragraph.
    head.textContent = words.slice(0, lo).join(' ');
    const lineH = parseFloat(getComputedStyle(head).lineHeight) || 17;
    if (lo === 0 || head.getBoundingClientRect().height < lineH * 1.9) { head.remove(); return null; }
    const tail = p.cloneNode(false);
    tail.textContent = words.slice(lo).join(' ');
    return tail;
  }

  // Split a list: keep as many items as fit here, return a list with the rest.
  function splitItems(list, sec, box) {
    const part = list.cloneNode(false);
    box.appendChild(part);
    while (list.firstElementChild) {
      const li = list.firstElementChild;
      part.appendChild(li);
      if (!fits(sec)) { list.insertBefore(li, list.firstElementChild); break; }
    }
    // never end a page on a sub-heading
    while (part.lastElementChild && part.lastElementChild.classList.contains('sub')) {
      list.insertBefore(part.lastElementChild, list.firstElementChild);
    }
    if (!part.children.length) { part.remove(); return null; }
    return list.children.length ? list : 'done';
  }

  const usedShare = (sec) => {
    const live = sec.querySelector('.live').getBoundingClientRect();
    const lastBlock = blocksIn(holder(sec)).pop();
    return lastBlock ? (lastBlock.getBoundingClientRect().bottom - live.top) / live.height : 0;
  };
  // A flow that spills only a few lines onto an extra page (client, L3) is set again:
  // first with tighter spacing, then tighter still; if neither saves the page, the page
  // before it gives up some lines so the last page is not left nearly empty.
  function pourBest(tpl) {
    const spare = () => tpl.cloneNode(true);
    const copies = [spare(), spare(), spare()];
    let pages = pour(tpl, {});
    if (pages.length < 2) return;
    const used = usedShare(pages[pages.length - 1]);
    if (used > 0.35) return;
    const swap = (copy, opts) => {
      pages[0].before(copy);
      const old = pages;
      old.forEach((p) => p.remove());
      const next = pour(copy, opts);
      return next;
    };
    for (const level of ['compact', 'compact tight']) {
      const next = swap(copies.shift(), { cls: level });
      if (next.length < pages.length) return;
      pages = next;
    }
    // Could not save the page: balance the last two pages instead.
    const H = pages[pages.length - 1].querySelector('.live').getBoundingClientRect().height;
    const reserve = Math.max(0, (0.45 - usedShare(pages[pages.length - 1])) * H);
    swap(copies.shift(), { cls: 'compact tight', reserve: { index: pages.length - 2, px: reserve } });
  }

  function pour(tpl, opts) {
    const kind = tpl.dataset.kind;
    const state = tpl.dataset.state;
    const flag = tpl.dataset.flag;
    const queue = [...tpl.content.children].map((n) => document.importNode(n, true));
    const made = [];
    const mk = (where, ref) => {
      const p = newPage(kind, state, flag, made.length);
      if (tpl.dataset.section) p.dataset.section = tpl.dataset.section;
      if (opts.cls) p.classList.add(...opts.cls.split(' '));
      if (made.length) p.classList.add('cont'); // continuation page: text starts at the standard top margin
      if (opts.reserve && opts.reserve.index === made.length) p.dataset.reserve = opts.reserve.px;
      made.push(p);
      return place(p, where, ref);
    };
    let sec = mk('before', tpl);
    let box = holder(sec);
    while (queue.length) {
      const b = queue.shift();
      box.appendChild(b);
      if (fits(sec)) continue;
      box.removeChild(b);
      const emptyPage = blocksIn(box).length === 0;
      let rest = null;
      if (b.dataset.split === 'text') rest = splitText(b, sec, box);
      else if (b.dataset.split === 'items') rest = splitItems(b, sec, box);
      if (rest === 'done') continue;
      if (emptyPage && !rest) { box.appendChild(b); continue; } // too big for any page: keep it
      // keep headings/titles with what follows
      const carry = [];
      if (!rest) {
        let last = blocksIn(box).pop();
        while (last && blocksIn(box).length > 1 && last.hasAttribute('data-keep')) {
          last.remove();
          carry.unshift(last);
          last = blocksIn(box).pop();
        }
      }
      sec = mk('after', sec);
      box = holder(sec);
      carry.forEach((c) => box.appendChild(c));
      queue.unshift(rest || b);
    }
    tpl.remove();
    return made;
  }

  // Every state chapter has an even number of pages, so every hero page is a left-hand page
  // (client, L1/L2). An odd chapter gets its closing page: last, or just before a photo spread,
  // which must start on a left-hand page to face its other half.
  function finishState(tpl) {
    const state = tpl.dataset.state;
    const pages = [...document.querySelectorAll(`section.page[data-state="${state}"]`)];
    if (pages.length % 2 === 0) { tpl.remove(); return; }
    const spreadStart = pages.findIndex((p) => p.dataset.spread === 'left');
    const sec = document.importNode(tpl.content.firstElementChild, true);
    if (spreadStart > 0) place(sec, 'before', pages[spreadStart]);
    else place(sec, 'after', pages[pages.length - 1]);
    tpl.remove();
  }
  document.querySelectorAll('template.flow, template.closing').forEach((tpl) => {
    if (tpl.classList.contains('closing')) finishState(tpl); else pourBest(tpl);
  });

  // Long state names shrink to fit the frame.
  // (Sized at build time; this only guards against a name wider than the frame.)
  document.querySelectorAll('.hero .state-name').forEach((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    let size = parseFloat(getComputedStyle(el).fontSize);
    while (range.getBoundingClientRect().width > el.clientWidth - 20 && size > 30) { size -= 1; el.style.fontSize = `${size}px`; }
  });

  // Page numbers and sides.
  const pages = [...document.querySelectorAll('section.page')];
  const layout = { states: {}, recipes: [] };
  pages.forEach((p, i) => {
    const folio = FIRST_FOLIO + i;
    p.dataset.folio = folio;
    p.classList.remove('recto', 'verso');
    p.classList.add(folio % 2 ? 'recto' : 'verso');
    const n = p.querySelector('.folio-circle span');
    if (n) n.textContent = folio;
    const s = p.dataset.state;
    if (s) {
      const e = (layout.states[s] ||= { first: folio, last: folio, pages: [] });
      e.last = folio;
      e.pages.push(p.dataset.role);
    }
    p.querySelectorAll('.recipe-title').forEach((t) => layout.recipes.push({ state: s, title: t.dataset.title, folio }));
  });

  // "Serve with Fry Sauce (page XX)" → real page of the "Fry Sauce" recipe.
  layout.unresolved = [];
  document.querySelectorAll('.recipe-note').forEach((note) => {
    const state = note.closest('section').dataset.state;
    note.textContent = note.textContent.replace(/((?:See|with|or)\s+)(.+?)(\s*(?:\(|,\s*)page )XX/g, (all, pre, name, mid) => {
      const key = name.trim().toLowerCase();
      const hit = layout.recipes.filter((r) => r.title.toLowerCase().startsWith(key))
        .sort((a, b) => (b.state === state) - (a.state === state))[0];
      if (!hit) { layout.unresolved.push(`${state}: ${name}`); return all; }
      return `${pre}${name}${mid}${hit.folio}`;
    });
  });
  // Page numbers written after layout: table of contents, map legend, menus, indexes.
  const firstOf = (sel) => { const p = document.querySelector(sel); return p ? p.dataset.folio : null; };
  const recipeFolio = (title) => (layout.recipes.find((r) => r.title === title) || {}).folio;
  document.querySelectorAll('[data-ref]').forEach((el) => {
    const ref = el.dataset.ref;
    const type = ref.slice(0, ref.indexOf(':'));
    const key = ref.slice(ref.indexOf(':') + 1);
    const n = type === 'state' ? firstOf(`section.page[data-state="${key}"]`)
      : type === 'section' ? firstOf(`section.page[data-section="${key}"]`)
      : type === 'recipe' ? recipeFolio(key) : null;
    if (n) el.textContent = n; else layout.unresolved.push(`page reference ${el.dataset.ref}`);
  });
  layout.sections = {};
  pages.forEach((p) => { if (p.dataset.section) (layout.sections[p.dataset.section] ||= []).push(Number(p.dataset.folio)); });
  window.__layout = layout;
})();
