(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const store = {
    get(key, fallback) { try { const value = localStorage.getItem(`ph-${key}`); return value === null ? fallback : JSON.parse(value); } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(`ph-${key}`, JSON.stringify(value)); } catch { /* Reading remains available without storage. */ } }
  };
  const storedList = key => { const value = store.get(key, []); return Array.isArray(value) ? value.filter(id => typeof id === 'string') : []; };
  let saved = new Set(storedList('saved'));
  let read = new Set(storedList('read'));
  function refreshSaved() {
    $$('[data-save]').forEach(button => {
      const active = saved.has(button.dataset.save);
      button.setAttribute('aria-pressed', String(active));
      const title = button.dataset.title || button.getAttribute('aria-label').replace(/^(Save|Unsave) /, '');
      button.dataset.title = title;
      button.setAttribute('aria-label', `${active ? 'Unsave' : 'Save'} ${title}`);
      if ($('span', button)) $('span', button).textContent = active ? 'Saved to your library' : 'Save for later';
    });
    $$('.saved-count').forEach(count => { count.textContent = saved.size; count.hidden = !saved.size; });
  }
  $$('[data-save]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.save;
    if (saved.has(id)) saved.delete(id); else saved.add(id);
    store.set('saved', [...saved]);
    refreshSaved();
    if (document.body.dataset.page === 'library') filter();
  }));
  refreshSaved();
  const themeButton = $('.theme-toggle');
  function updateThemeLabel() {
    const dark = document.documentElement.dataset.theme === 'dark';
    themeButton?.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
    themeButton?.setAttribute('title', `Switch to ${dark ? 'light' : 'dark'} theme`);
    $('meta[name="theme-color"]')?.setAttribute('content', dark ? '#191c19' : '#e8e8e3');
  }
  themeButton?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('ph-theme', next); } catch { /* Theme still changes for this page. */ }
    updateThemeLabel();
  });
  updateThemeLabel();
  let filter = () => {};
  if (document.body.dataset.page === 'library') {
    const params = new URLSearchParams(location.search);
    let level = ['A2', 'B1', 'B2'].includes(params.get('level')) ? params.get('level') : 'all';
    const savedOnly = params.get('view') === 'saved';
    const search = $('#story-search');
    const theme = $('#theme-filter');
    const formatButton = $('[data-format]');
    const startTheme = params.get('theme');
    if (startTheme && [...theme.options].some(option => option.value === startTheme)) theme.value = startTheme;
    const cards = $$('.story-card');
    let current = cards;
    const hints = { all: 'Choose a level, follow your curiosity.', A2: 'Familiar words. Everyday adventures.', B1: 'Richer plots. Room to explore.', B2: 'Nuance, new ideas, and expressive French.' };
    if (savedOnly) {
      $('#library-title').textContent = 'Your saved stories';
      $('.library-heading p').textContent = 'A little shelf of your own.';
      $('#back-to-all').hidden = false;
      $('.book-cover').hidden = true;
      $('.nav-saved').setAttribute('aria-current', 'page');
    } else $('.nav-library').setAttribute('aria-current', 'page');
    filter = () => {
      const query = search.value.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
      current = cards.filter(card => {
        const show = (level === 'all' || card.dataset.level === level) && (theme.value === 'all' || card.dataset.theme === theme.value) && card.dataset.search.includes(query) && (!savedOnly || saved.has(card.dataset.id));
        card.hidden = !show;
        $('.read-marker', card).hidden = !read.has(card.dataset.id);
        return show;
      });
      $$('[data-level-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.levelFilter === level)));
      formatButton?.setAttribute('aria-pressed', String(theme.value === formatButton.dataset.format));
      $('#results-count').textContent = `${current.length} ${current.length === 1 ? 'story' : 'stories'}${level !== 'all' ? ` at ${level}` : ''}${savedOnly ? ' saved for later' : ' to get lost in'}`;
      $('#level-hint').textContent = hints[level];
      $('.empty-state').hidden = current.length > 0;
      $('.random-button').disabled = current.length === 0;
      const noSaved = savedOnly && saved.size === 0;
      $('.empty-state h3').textContent = noSaved ? 'Your next favourite is out there' : 'No stories on this shelf';
      $('#empty-description').textContent = noSaved ? 'Tap the bookmark on any story to keep it here for later.' : 'Try another search, level, or theme.';
      $('.show-all').hidden = level === 'all' && theme.value === 'all' && !query;
      const url = new URL(location.href);
      if (level === 'all') url.searchParams.delete('level'); else url.searchParams.set('level', level);
      if (theme.value === 'all') url.searchParams.delete('theme'); else url.searchParams.set('theme', theme.value);
      try { history.replaceState(null, '', url); } catch { /* Filtering does not depend on the URL. */ }
    };
    $$('[data-level-filter]').forEach(button => button.addEventListener('click', () => { level = button.dataset.levelFilter; filter(); }));
    search.addEventListener('input', filter);
    theme.addEventListener('change', filter);
    formatButton?.addEventListener('click', () => { theme.value = theme.value === formatButton.dataset.format ? 'all' : formatButton.dataset.format; filter(); });
    $$('.show-all,.clear-filters').forEach(button => button.addEventListener('click', () => {
      if (savedOnly && saved.size === 0) { location.href = './#library'; return; }
      level = 'all'; theme.value = 'all'; search.value = ''; filter();
    }));
    $('.random-button').addEventListener('click', () => {
      if (current.length) location.href = $('.cover-link', current[Math.floor(Math.random() * current.length)]).href;
    });
    filter();
  }
  if (document.body.dataset.page === 'reader') {
    const id = document.body.dataset.story;
    const translations = $$('.translation');
    const allButton = $('#toggle-all');
    const updateAll = () => {
      const allOpen = translations.every(item => item.open);
      allButton.setAttribute('aria-pressed', String(allOpen));
      allButton.firstChild.textContent = allOpen ? 'Hide all translations ' : 'Show all translations ';
    };
    allButton.addEventListener('click', () => {
      const open = !translations.every(item => item.open);
      translations.forEach(item => { item.open = open; });
      updateAll();
    });
    translations.forEach(item => item.addEventListener('toggle', updateAll));
    let size = Number(store.get('font-size', 19));
    if (!Number.isFinite(size)) size = 19;
    const updateSize = () => {
      size = Math.min(25, Math.max(17, size));
      $('.story-body').style.setProperty('--reading-size', `${size / 16}rem`);
      $('#font-decrease').disabled = size <= 17;
      $('#font-increase').disabled = size >= 25;
    };
    $('#font-decrease').addEventListener('click', () => { size -= 2; updateSize(); store.set('font-size', size); });
    $('#font-increase').addEventListener('click', () => { size += 2; updateSize(); store.set('font-size', size); });
    updateSize();
    const markButton = $('.mark-read');
    const updateRead = () => {
      const active = read.has(id);
      markButton.setAttribute('aria-pressed', String(active));
      markButton.lastChild.textContent = active ? ' Story completed' : ' Mark as read';
    };
    markButton.addEventListener('click', () => {
      if (read.has(id)) read.delete(id); else read.add(id);
      store.set('read', [...read]); updateRead();
    });
    updateRead();
    let ticking = false;
    function progress() {
      const body = $('.story-body');
      const top = body.getBoundingClientRect().top + scrollY;
      const available = Math.max(1, body.offsetHeight - innerHeight * .3);
      const value = Math.min(1, Math.max(0, (scrollY + innerHeight * .3 - top) / available));
      $('.reading-progress span').style.transform = `scaleX(${value})`;
      ticking = false;
    }
    addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(progress); ticking = true; } }, { passive: true });
    addEventListener('resize', progress);
    progress();
  }
  /* Saved words, shared by the reader and the Words page. */
  const DAY = 864e5;
  const loadWords = () => {
    const value = store.get('words', []);
    return Array.isArray(value) ? value.filter(item => item && typeof item.word === 'string' && item.word) : [];
  };
  let words = loadWords();
  const saveWords = () => store.set('words', words);
  const findWord = word => words.find(item => item.word === word);
  const refreshWordCount = () => $$('.words-count').forEach(count => { count.textContent = words.length; count.hidden = !words.length; });
  let onWordsChanged = () => {};
  addEventListener('storage', event => {
    if (event.key === 'ph-words') { words = loadWords(); refreshWordCount(); onWordsChanged(); }
    if (event.key === 'ph-saved') { saved = new Set(storedList('saved')); refreshSaved(); }
  });
  refreshWordCount();
  const el = (tag, props = {}, children = []) => {
    const node = Object.assign(document.createElement(tag), props);
    node.append(...children);
    return node;
  };

  /* Google Translate's public web endpoint: no key, CORS-enabled. The link is the fallback if it ever fails. */
  const translationCache = new Map();
  const googleLink = text => `https://translate.google.com/?sl=fr&tl=en&op=translate&text=${encodeURIComponent(text)}`;
  function translate(text) {
    const key = text.toLocaleLowerCase('fr');
    if (!translationCache.has(key)) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const request = fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=en&dt=t&dt=bd&q=${encodeURIComponent(text)}`, { signal: controller.signal })
        .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
        .then(data => {
          const main = (Array.isArray(data?.[0]) ? data[0] : []).map(part => part?.[0] || '').join('').trim();
          if (!main) throw new Error('Empty translation');
          const senses = (Array.isArray(data[1]) ? data[1] : [])
            .map(entry => ({ pos: String(entry?.[0] || ''), terms: (Array.isArray(entry?.[1]) ? entry[1] : []).map(String).slice(0, 5) }))
            .filter(sense => sense.pos && sense.terms.length).slice(0, 3);
          return { main, senses };
        })
        .finally(() => clearTimeout(timeout));
      translationCache.set(key, request);
      request.catch(() => translationCache.delete(key));
    }
    return translationCache.get(key);
  }
  const contextNodes = (sentence, word) => {
    const at = sentence.toLocaleLowerCase('fr').indexOf(word);
    if (at < 0) return [sentence];
    return [sentence.slice(0, at), el('mark', { textContent: sentence.slice(at, at + word.length) }), sentence.slice(at + word.length)];
  };

  /* Reader: hold a word to save or translate it. */
  const popover = $('.word-popover');
  if (popover && document.body.dataset.page === 'reader') {
    const storyId = document.body.dataset.story;
    const storyTitle = $('.story-heading h1')?.textContent || '';
    const saveButton = $('.wp-save', popover);
    const result = $('.wp-result', popover);
    const wordChar = /[\p{L}\p{M}'’-]/u;
    let pick = null;
    let press = null;
    const hint = $('.word-hint');
    hint.hidden = false;
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) hint.textContent = 'Double-click or hold any French word to see its translation and save it.';
    const highlight = range => {
      try {
        if (!window.Highlight || !CSS.highlights) return;
        if (range) CSS.highlights.set('picked-word', new Highlight(range)); else CSS.highlights.delete('picked-word');
      } catch { /* Highlighting is decorative. */ }
    };
    const caretAt = (x, y) => {
      if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(x, y); return p && { node: p.offsetNode, offset: p.offset }; }
      if (document.caretRangeFromPoint) { const r = document.caretRangeFromPoint(x, y); return r && { node: r.startContainer, offset: r.startOffset }; }
      return null;
    };
    function wordRange(node, offset) {
      if (!node || node.nodeType !== Node.TEXT_NODE || !node.parentElement?.closest('.french-paragraph') || node.parentElement.closest('.speaker')) return null;
      const text = node.data;
      let start = offset, end = offset;
      while (start > 0 && wordChar.test(text[start - 1])) start--;
      while (end < text.length && wordChar.test(text[end])) end++;
      while (start < end && /['’-]/.test(text[start])) start++;
      while (end > start && /['’-]/.test(text[end - 1])) end--;
      const elision = text.slice(start, end).match(/^(?:jusqu|lorsqu|puisqu|quoiqu|qu|[cdjlmnst])['’](?=\p{L})/iu);
      if (elision) start += elision[0].length;
      if (end <= start) return null;
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, end);
      return range;
    }
    const rangeAtPoint = (x, y) => {
      const caret = caretAt(x, y);
      const range = caret && wordRange(caret.node, caret.offset);
      if (!range) return null;
      const hit = [...range.getClientRects()].some(r => x >= r.left - 4 && x <= r.right + 4 && y >= r.top - 4 && y <= r.bottom + 4);
      return hit ? range : null;
    };
    function sentenceFor(range) {
      const paragraph = range.startContainer.parentElement.closest('.line') || range.startContainer.parentElement.closest('.french-paragraph');
      const before = document.createRange();
      before.selectNodeContents(paragraph);
      before.setEnd(range.startContainer, range.startOffset);
      const at = before.toString().length;
      const text = paragraph.textContent;
      const speaker = paragraph.querySelector?.('.speaker')?.textContent.length || 0;
      for (const match of text.matchAll(/[^.!?…\n]+(?:[.!?…]+[»”"’)]*|\n|$)/gu)) {
        if (at >= match.index && at < match.index + match[0].length) return match[0].slice(match.index < speaker ? speaker - match.index : 0).replace(/^[\s»”"’)]+/u, '').replace(/\s+/gu, ' ').trim().slice(0, 400);
      }
      return '';
    }
    function place() {
      if (!pick) return;
      const rect = pick.range.getClientRects()[0] || pick.range.getBoundingClientRect();
      const width = popover.offsetWidth, height = popover.offsetHeight, gap = 10;
      const viewport = document.documentElement.clientWidth;
      const left = Math.min(Math.max(12, rect.left + rect.width / 2 - width / 2), viewport - width - 12);
      let top = rect.bottom + gap;
      if (top + height > innerHeight - 12 && rect.top - gap - height > 12) top = rect.top - gap - height;
      popover.style.left = `${left + scrollX}px`;
      popover.style.top = `${top + scrollY}px`;
    }
    function updateSaveButton() {
      const active = Boolean(pick && findWord(pick.word));
      saveButton.setAttribute('aria-pressed', String(active));
      $('span', saveButton).textContent = active ? 'Saved' : 'Save word';
      saveButton.setAttribute('aria-label', active ? `Remove ${pick?.word} from your words` : `Save ${pick?.word} to your words`);
    }
    function open(range) {
      pick = { range, word: range.toString().toLocaleLowerCase('fr'), sentence: sentenceFor(range), translation: '' };
      highlight(range);
      $('.wp-word', popover).textContent = pick.word;
      updateSaveButton();
      popover.hidden = false;
      showTranslation(pick);
    }
    function close() {
      if (popover.hidden) return;
      popover.hidden = true;
      highlight(null);
      pick = null;
    }
    const cancelPress = () => { if (press) clearTimeout(press.timer); press = null; };
    $$('.french-paragraph').forEach(paragraph => {
      paragraph.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        cancelPress();
        const { clientX: x, clientY: y, pointerType } = event;
        press = { x, y, pointerType, timer: setTimeout(() => {
          const range = rangeAtPoint(x, y);
          press = null;
          if (!range) return;
          getSelection()?.removeAllRanges();
          navigator.vibrate?.(10);
          open(range);
        }, 450) };
      });
      paragraph.addEventListener('pointermove', event => { if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10) cancelPress(); });
      paragraph.addEventListener('contextmenu', event => { if (!popover.hidden && pick) event.preventDefault(); });
      paragraph.addEventListener('dblclick', event => {
        const range = rangeAtPoint(event.clientX, event.clientY);
        if (range) { getSelection()?.removeAllRanges(); open(range); }
      });
    });
    ['pointerup', 'pointercancel'].forEach(type => addEventListener(type, cancelPress));
    addEventListener('scroll', cancelPress, { passive: true });
    document.addEventListener('pointerdown', event => { if (!popover.contains(event.target)) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !popover.hidden) { close(); } });
    addEventListener('resize', place);
    $('.wp-close', popover).addEventListener('click', close);
    saveButton.addEventListener('click', () => {
      if (!pick) return;
      const existing = findWord(pick.word);
      if (existing) words = words.filter(item => item !== existing);
      else {
        const now = Date.now();
        words.unshift({ word: pick.word, sentence: pick.sentence, story: storyId, storyTitle, meaning: pick.translation, added: now, due: now, interval: 0, ease: 2.5, reps: 0 });
      }
      saveWords();
      refreshWordCount();
      updateSaveButton();
    });
    async function showTranslation(current) {
      result.replaceChildren(el('p', { className: 'wp-status', textContent: 'Translating…' }));
      place();
      const link = el('a', { className: 'wp-google', href: googleLink(current.sentence && current.word.length < 3 ? current.sentence : current.word), target: '_blank', rel: 'noopener' }, ['Open in Google Translate']);
      link.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6m0-6-9 9M18 14v6H4V6h6"/></svg>');
      try {
        const translation = await translate(current.word);
        if (pick !== current) return;
        current.translation = translation.main;
        const entry = findWord(current.word);
        if (entry && !entry.meaning) { entry.meaning = translation.main; saveWords(); }
        result.replaceChildren(
          el('p', { className: 'wp-main', lang: 'en', textContent: translation.main }),
          ...(translation.senses.length ? [el('dl', { className: 'wp-senses' }, translation.senses.map(sense => el('div', {}, [el('dt', { textContent: sense.pos }), el('dd', { lang: 'en', textContent: sense.terms.join(', ') })])))] : []),
          link
        );
      } catch {
        if (pick !== current) return;
        result.replaceChildren(el('p', { className: 'wp-status', textContent: 'Google Translate could not be reached just now.' }), link);
      }
      place();
    }
  }

  /* Words page: meanings, spaced-repetition review, Anki export. */
  if (document.body.dataset.page === 'words') {
    $('.nav-words')?.setAttribute('aria-current', 'page');
    const list = $('.word-list');
    const template = $('#word-entry-template');
    const search = $('#word-search');
    const filterSelect = $('#word-filter');
    const reviewButton = $('#start-review');
    const exportButton = $('#export-words');
    const listView = $('#word-list-view');
    const reviewView = $('#review-view');
    const toast = $('.words-toast');
    const fold = text => String(text || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    const isDue = item => (Number(item.due) || 0) <= Date.now();
    const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
    const days = n => n < 1 ? '<1 day' : n === 1 ? '1 day' : n < 30 ? `${n} days` : n < 365 ? `${Math.round(n / 30)} mo` : `${(n / 365).toFixed(1)} yr`;
    const dueLabel = item => {
      if (!item.reps) return 'New';
      if (isDue(item)) return 'Due now';
      return `Review in ${days(Math.ceil((item.due - Date.now()) / DAY))}`;
    };
    function schedule(item, grade) {
      const reps = Number(item.reps) || 0;
      const interval = Number(item.interval) || 0;
      let ease = Number(item.ease) || 2.5;
      if (grade === 'again') return { reps: 0, interval: 0, ease: Math.max(1.3, ease - .2), due: Date.now() + 60e3, lapses: (Number(item.lapses) || 0) + 1 };
      let next;
      if (grade === 'hard') { next = reps === 0 ? 1 : Math.max(interval + 1, Math.round(interval * 1.2)); ease = Math.max(1.3, ease - .15); }
      if (grade === 'good') next = reps === 0 ? 2 : Math.max(interval + 1, Math.round(interval * ease));
      if (grade === 'easy') { next = reps === 0 ? 4 : Math.max(interval + 2, Math.round(interval * ease * 1.3)); ease += .15; }
      return { reps: reps + 1, interval: next, ease, due: Date.now() + next * DAY };
    }
    const intervalLabel = (item, grade) => { const s = schedule(item, grade); return s.interval ? days(s.interval) : '1 min'; };

    function summary() {
      const due = words.filter(isDue).length;
      const todo = words.filter(item => !item.meaning?.trim()).length;
      $('#words-summary').textContent = words.length
        ? `${plural(words.length, 'word')} saved · ${due} due for review${todo ? ` · ${todo} without a meaning` : ''}`
        : 'Words you save while reading will gather here.';
      reviewButton.disabled = !words.length;
      $('span', reviewButton).textContent = due ? `Review ${due} due` : 'Practise all';
      exportButton.disabled = !words.length;
    }
    function render() {
      const query = fold(search.value.trim());
      const mode = filterSelect.value;
      const shown = words.filter(item => (mode === 'all' || (mode === 'todo' && !item.meaning?.trim()) || (mode === 'due' && isDue(item))) && (!query || fold(`${item.word} ${item.meaning}`).includes(query)));
      list.replaceChildren(...shown.map(entryNode));
      $('.words-empty').hidden = words.length > 0;
      $('.words-no-match').hidden = !words.length || shown.length > 0;
      $('.words-controls').hidden = !words.length;
      $('#words-count').textContent = words.length ? `Showing ${plural(shown.length, 'word')}` : '';
      summary();
    }
    function entryNode(item) {
      const node = template.content.firstElementChild.cloneNode(true);
      $('h2', node).textContent = item.word;
      $('.word-due', node).textContent = dueLabel(item);
      const context = $('.word-context', node);
      if (item.sentence) context.append(...contextNodes(item.sentence, item.word)); else context.remove();
      const remove = $('.word-delete', node);
      remove.setAttribute('aria-label', `Remove ${item.word}`);
      remove.addEventListener('click', () => removeWord(item));
      const textarea = $('textarea', node);
      textarea.value = item.meaning || '';
      textarea.setAttribute('aria-label', `Meaning of ${item.word}`);
      $('.meaning-field span', node).setAttribute('aria-hidden', 'true');
      let pending = 0;
      textarea.addEventListener('input', () => {
        item.meaning = textarea.value;
        clearTimeout(pending);
        pending = setTimeout(() => { saveWords(); summary(); }, 300);
      });
      textarea.addEventListener('blur', () => { clearTimeout(pending); saveWords(); summary(); });
      const suggestion = $('.word-suggestion', node);
      const suggest = $('.word-suggest', node);
      suggest.addEventListener('click', async () => {
        suggest.disabled = true;
        suggestion.hidden = false;
        suggestion.replaceChildren('Asking Google…');
        try {
          const { main, senses } = await translate(item.word);
          const options = [...new Set([main, ...senses.flatMap(sense => sense.terms)])].slice(0, 5);
          suggestion.replaceChildren(...options.map(option => el('button', { type: 'button', className: 'suggestion-chip', textContent: option, title: 'Add to meaning', onclick: () => {
            textarea.value = textarea.value.trim() ? `${textarea.value.trim()}, ${option}` : option;
            textarea.dispatchEvent(new Event('input'));
          } })));
          if (!textarea.value.trim()) { textarea.value = main; textarea.dispatchEvent(new Event('input')); }
        } catch {
          suggestion.replaceChildren('Google Translate could not be reached. ', el('a', { href: googleLink(item.word), target: '_blank', rel: 'noopener', textContent: 'Open it in a new tab' }));
        }
        suggest.disabled = false;
      });
      const source = $('.word-source', node);
      if (item.story && /^(a2|b1|b2)-[a-z0-9-]+$/.test(item.story)) {
        source.href = `stories/${item.story}.html`;
        source.append('From\u00a0', el('span', { lang: 'fr', textContent: item.storyTitle || 'a story' }));
      } else source.remove();
      return node;
    }
    let undo = null;
    let toastTimer = 0;
    function removeWord(item) {
      const index = words.indexOf(item);
      if (index < 0) return;
      words.splice(index, 1);
      saveWords(); refreshWordCount(); render();
      undo = { item, index };
      $('span', toast).textContent = `Removed “${item.word}”.`;
      toast.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toast.hidden = true; undo = null; }, 6000);
    }
    $('button', toast).addEventListener('click', () => {
      if (!undo) return;
      words.splice(Math.min(undo.index, words.length), 0, undo.item);
      saveWords(); refreshWordCount(); render();
      toast.hidden = true; undo = null;
    });
    search.addEventListener('input', render);
    filterSelect.addEventListener('change', render);
    onWordsChanged = () => { if (reviewView.hidden && !list.contains(document.activeElement)) render(); };

    exportButton.addEventListener('click', () => {
      const clean = value => String(value || '').replace(/[\t\r\n]+/g, ' ').trim();
      const lines = ['#separator:tab', '#html:false', '#columns:French\tMeaning\tContext\tStory', ...words.map(item => [item.word, item.meaning, item.sentence, item.storyTitle].map(clean).join('\t'))];
      const url = URL.createObjectURL(new Blob([lines.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' }));
      const link = el('a', { href: url, download: 'petites-histoires-words.txt' });
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });

    let queue = [], done = 0, practice = false, card = null;
    const flash = $('.flashcard');
    const showButton = $('#show-answer');
    const gradeGroup = $('.grade-buttons');
    function showCard() {
      card = queue[0];
      if (!card) {
        flash.hidden = true;
        $('.review-done').hidden = false;
        $('#review-progress').textContent = '';
        const next = words.filter(item => !isDue(item)).sort((a, b) => a.due - b.due)[0];
        $('#review-done-text').textContent = practice ? 'Practice round finished. Your schedule is unchanged.' : next ? `Your next review is in ${days(Math.ceil((next.due - Date.now()) / DAY))}.` : 'Come back later for your next review.';
        $('#back-to-words').focus();
        return;
      }
      flash.hidden = false;
      $('.review-done').hidden = true;
      $('#review-progress').textContent = `${done + 1} of ${done + queue.length}${practice ? ' · practice' : ''}`;
      $('.flash-word').textContent = card.word;
      const context = $('.flash-context');
      context.replaceChildren(...(card.sentence ? contextNodes(card.sentence, card.word) : []));
      context.hidden = !card.sentence;
      const meaning = card.meaning?.trim();
      $('.flash-meaning').textContent = meaning || 'No meaning yet. Add one from your word list.';
      $('.flash-meaning').classList.toggle('is-empty', !meaning);
      $('.flash-answer').hidden = true;
      gradeGroup.hidden = true;
      showButton.hidden = false;
      $$('[data-grade]', gradeGroup).forEach(button => { $('span', button).textContent = practice ? '' : intervalLabel(card, button.dataset.grade); });
      showButton.focus({ preventScroll: true });
    }
    function reveal() {
      if (!card || showButton.hidden) return;
      $('.flash-answer').hidden = false;
      showButton.hidden = true;
      gradeGroup.hidden = false;
      $('[data-grade="good"]', gradeGroup).focus({ preventScroll: true });
    }
    function grade(key) {
      if (!card || gradeGroup.hidden) return;
      queue.shift();
      if (key === 'again') queue.push(card);
      else done++;
      if (!practice) { Object.assign(card, schedule(card, key)); saveWords(); }
      showCard();
    }
    function startReview() {
      const due = words.filter(isDue).sort((a, b) => (a.due || 0) - (b.due || 0));
      practice = due.length === 0;
      queue = practice ? [...words].sort(() => Math.random() - .5) : due;
      done = 0;
      if (!queue.length) return;
      listView.hidden = true;
      $('.words-actions').hidden = true;
      reviewView.hidden = false;
      showCard();
    }
    function endReview() {
      reviewView.hidden = true;
      listView.hidden = false;
      $('.words-actions').hidden = false;
      card = null;
      render();
      reviewButton.focus({ preventScroll: true });
    }
    reviewButton.addEventListener('click', startReview);
    showButton.addEventListener('click', reveal);
    $$('[data-grade]', gradeGroup).forEach(button => button.addEventListener('click', () => grade(button.dataset.grade)));
    $('#end-review').addEventListener('click', endReview);
    $('#back-to-words').addEventListener('click', endReview);
    document.addEventListener('keydown', event => {
      if (reviewView.hidden || event.target.closest?.('input,textarea,select') || event.metaKey || event.ctrlKey || event.altKey) return;
      if ((event.key === ' ' || event.key === 'Enter') && !showButton.hidden) { event.preventDefault(); reveal(); return; }
      const index = ['1', '2', '3', '4'].indexOf(event.key);
      if (index >= 0) grade(['again', 'hard', 'good', 'easy'][index]);
    });
    render();
  }
})();
