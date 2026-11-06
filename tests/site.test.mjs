import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';

const read = path => readFile(resolve(path), 'utf8');
const counts = { A2: 20, B1: 30, B2: 30 };
const conversations = JSON.parse(await read('content/conversations.json'));
const levels = {};
for (const level of Object.keys(counts)) levels[level] = [...JSON.parse(await read(`content/${level.toLowerCase()}.json`)), ...conversations.filter(s => s.level === level)];
const stories = Object.values(levels).flat();

test('The library contains 80 distinct, fully translated stories at the requested levels', () => {
  assert.equal(stories.length, 80);
  assert.equal(new Set(stories.map(s => s.id)).size, 80);
  assert.equal(new Set(stories.map(s => s.title)).size, 80);
  for (const [level, list] of Object.entries(levels)) {
    assert.equal(list.length, counts[level]);
    for (const story of list) {
      assert.equal(story.level, level);
      assert.match(story.id, new RegExp(`^${level.toLowerCase()}-[a-z0-9-]+$`));
      for (const key of ['title', 'englishTitle', 'description', 'theme', 'imageQuery']) assert.ok(story[key]?.trim(), `${story.id}: missing ${key}`);
      assert.equal(story.paragraphs.length, 5, story.id);
      let words = 0;
      for (const paragraph of story.paragraphs) {
        const frWords = paragraph.fr.trim().split(/\s+/u).length;
        const enWords = paragraph.en.trim().split(/\s+/u).length;
        assert.ok(frWords >= 25 && enWords >= 25, `${story.id}: incomplete paragraph`);
        assert.notEqual(paragraph.fr, paragraph.en, `${story.id}: translation repeats French`);
        assert.ok(enWords / frWords > .6 && enWords / frWords < 1.8, `${story.id}: suspicious translation length`);
        words += frWords;
      }
      const minimum = { A2: 200, B1: 300, B2: 400 }[level];
      assert.ok(words >= minimum && words <= 650, `${story.id}: ${words} words`);
    }
  }
});

test('Every published story has five native translation controls and the correct cover tile', async () => {
  const catalogue = JSON.parse(await read('dist/catalogue.json'));
  const coverSlots = new Set();
  for (const story of stories) {
    const html = await read(`dist/stories/${story.id}.html`);
    assert.equal((html.match(/<details class="translation"/g) || []).length, 5, story.id);
    assert.equal((html.match(/lang="fr" class="french-paragraph[ "]/g) || []).length, 5, story.id);
    assert.match(html, /id="toggle-all"/);
    assert.match(html, /class="theme-toggle/);
    const cover = catalogue.find(item => item.id === story.id).cover;
    if (cover.type === 'conversation') {
      assert.match(html, /class="art-frame convo-art/, story.id);
      assert.equal((html.match(/<b class="speaker">/g) || []).length > 5, true, `${story.id}: script lines`);
      continue;
    }
    assert.ok(html.includes(`assets/${cover.file}`), story.id);
    assert.ok(cover.tile >= 0 && cover.tile < cover.columns * cover.rows, `${story.id}: cover lies outside atlas`);
    const slot = `${cover.file}:${cover.tile}`;
    assert.ok(!coverSlots.has(slot), `${story.id}: another story uses this thumbnail`);
    coverSlots.add(slot);
  }
});

test('Published local links and media resolve, including project-subpath deployment', async () => {
  for (const file of ['index.html', 'credits.html', 'words.html', ...stories.map(s => `stories/${s.id}.html`)]) {
    const html = await read(`dist/${file}`);
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = match[1];
      if (/^(https?:|#|mailto:|data:)/.test(url)) continue;
      assert.ok(!url.startsWith('/'), `${file}: absolute URL breaks GitHub project Pages: ${url}`);
      const clean = url.split(/[?#]/)[0] || './';
      const base = resolve('dist', file, '..');
      const target = resolve(base, clean);
      assert.ok(target.startsWith(resolve('dist')), `${file}: path escaped dist`);
      await access(target);
    }
  }
});

test('The library exposes all 80 covers and accurate level counts', async () => {
  const html = await read('dist/index.html');
  assert.equal((html.match(/class="story-card"/g) || []).length, 80);
  for (const [level, count] of Object.entries(counts)) assert.match(html, new RegExp(`data-level-filter="${level}"[^>]+>${level} <span>${count}</span>`));
  for (const id of ['story-search', 'theme-filter', 'reading-guide']) assert.match(html, new RegExp(`id="${id}"`));
});

test('Story pages offer the word popover and every page links to the Words page', async () => {
  for (const file of ['index.html', 'credits.html', 'words.html', `stories/${stories[0].id}.html`]) assert.match(await read(`dist/${file}`), /class="nav-words"/, file);
  for (const story of stories) {
    const html = await read(`dist/stories/${story.id}.html`);
    assert.equal((html.match(/class="word-popover"/g) || []).length, 1, story.id);
    for (const cls of ['wp-save', 'wp-result', 'word-hint']) assert.match(html, new RegExp(`class="[^"]*${cls}`), `${story.id}: ${cls}`);
  }
});

test('The Words page has a list, meaning editor, review card and Anki export', async () => {
  const html = await read('dist/words.html');
  assert.match(html, /data-page="words"/);
  for (const id of ['word-search', 'word-filter', 'start-review', 'export-words', 'review-view', 'show-answer', 'word-entry-template']) assert.match(html, new RegExp(`id="${id}"`), id);
  assert.match(html, /<textarea/);
  for (const grade of ['again', 'hard', 'good', 'easy']) assert.match(html, new RegExp(`data-grade="${grade}"`));
});

test('Each level has five conversation stories written as dialogue', () => {
  for (const level of Object.keys(counts)) {
    const list = conversations.filter(s => s.level === level);
    assert.equal(list.length, 5, level);
    for (const story of list) {
      assert.equal(story.theme, 'Conversation', story.id);
      assert.equal(story.bubbles.length, 2, story.id);
      for (const paragraph of story.paragraphs) {
        const fr = paragraph.fr.split('\n'), en = paragraph.en.split('\n');
        assert.equal(fr.length, en.length, `${story.id}: French and English line counts differ`);
        fr.forEach((line, i) => assert.equal(/^\(/.test(line), /^\(/.test(en[i]), `${story.id}: stage directions misaligned`));
        assert.ok(fr.filter(line => / : /.test(line)).length >= 2, `${story.id}: too little dialogue`);
      }
    }
  }
});
