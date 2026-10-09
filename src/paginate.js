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
    sec.dataset.state = state;
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
    return last.getBoundingClientRect().bottom - Math.min(mb, 0) <= live.bottom + 0.5;
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

  // If a flow spills only a few lines onto an extra page, set it again with
  // slightly tighter spacing and keep that version when it saves the page.
  function pourBest(tpl) {
    const spare = tpl.cloneNode(true);
    const pages = pour(tpl, false);
    if (pages.length < 2) return;
    const last = pages[pages.length - 1];
    const live = last.querySelector('.live').getBoundingClientRect();
    const lastBlock = blocksIn(holder(last)).pop();
    const used = lastBlock ? (lastBlock.getBoundingClientRect().bottom - live.top) / live.height : 0;
    if (used > 0.35) return;
    pages[0].before(spare);
    pages.forEach((p) => p.remove());
    const tight = pour(spare, true);
    if (tight.length < pages.length) return;
    tight[0].before(...pages);
    tight.forEach((p) => p.remove());
  }

  function pour(tpl, compact) {
    const kind = tpl.dataset.kind;
    const state = tpl.dataset.state;
    const flag = tpl.dataset.flag;
    const queue = [...tpl.content.children].map((n) => document.importNode(n, true));
    const made = [];
    const mk = (where, ref) => {
      const p = newPage(kind, state, flag);
      if (compact) p.classList.add('compact');
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

  document.querySelectorAll('template.flow').forEach(pourBest);

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
  window.__layout = layout;
})();
