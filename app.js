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
      try { history.replaceState(null, '', url); } catch { /* Filtering does not depend on the URL. */ }
    };
    $$('[data-level-filter]').forEach(button => button.addEventListener('click', () => { level = button.dataset.levelFilter; filter(); }));
    search.addEventListener('input', filter);
    theme.addEventListener('change', filter);
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
})();
