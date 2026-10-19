import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';

const read = path => readFile(resolve(path), 'utf8');
const counts = { A2: 15, B1: 25, B2: 25 };
const levels = {};
for (const level of Object.keys(counts)) levels[level] = JSON.parse(await read(`content/${level.toLowerCase()}.json`));
const stories = Object.values(levels).flat();

test('The library contains 65 distinct, fully translated stories at the requested levels', () => {
  assert.equal(stories.length, 65);
  assert.equal(new Set(stories.map(s => s.id)).size, 65);
  assert.equal(new Set(stories.map(s => s.title)).size, 65);
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
    assert.equal((html.match(/lang="fr" class="french-paragraph"/g) || []).length, 5, story.id);
    assert.match(html, /id="toggle-all"/);
    assert.match(html, /class="theme-toggle/);
    const cover = catalogue.find(item => item.id === story.id).cover;
    assert.ok(html.includes(`assets/${cover.file}`), story.id);
    assert.ok(cover.tile >= 0 && cover.tile < cover.columns * cover.rows, `${story.id}: cover lies outside atlas`);
    const slot = `${cover.file}:${cover.tile}`;
    assert.ok(!coverSlots.has(slot), `${story.id}: another story uses this thumbnail`);
    coverSlots.add(slot);
  }
});

test('Published local links and media resolve, including project-subpath deployment', async () => {
  for (const file of ['index.html', 'credits.html', ...stories.map(s => `stories/${s.id}.html`)]) {
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

test('The library exposes all 65 covers and accurate level counts', async () => {
  const html = await read('dist/index.html');
  assert.equal((html.match(/class="story-card"/g) || []).length, 65);
  for (const [level, count] of Object.entries(counts)) assert.match(html, new RegExp(`data-level-filter="${level}"[^>]+>${level} <span>${count}</span>`));
  for (const id of ['story-search', 'theme-filter', 'reading-guide']) assert.match(html, new RegExp(`id="${id}"`));
});
