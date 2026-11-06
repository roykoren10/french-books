# Petites histoires

Original French short stories with optional English translations. Twenty A2 stories, thirty B1 stories, and thirty B2 stories, each with five translated paragraphs. Five stories per level are **conversations**: scripts of people talking, with speaker names and short stage directions. The 65 narrative stories have illustrated covers; the conversations have typographic speech-bubble covers built from their opening lines.

The library includes combined CEFR, theme, and text filters; saved stories; read markers; light/dark themes; reading text-size controls; and individual or global English translation toggles. In any story, hold (or double-click) a French word to see its Google Translate translation straight away and **save** it. Saved words gather on the **Words** page (`words.html`), where readers add their own meanings, review them as flashcards with Anki-style spaced repetition (Again / Hard / Good / Easy), and export them as a tab-separated file Anki can import. Personal preferences and saved words stay in the reader's browser. Story pages and native paragraph translation controls work without JavaScript.

## Run locally

Requires Node 20 or later. No dependencies to install.

```sh
npm run build
npm test
npm run dev
```

Open http://localhost:4173/french-books/.

## Publish

Live site: https://roykoren10.github.io/french-books/

Source lives on `main`. Built static files live on `gh-pages`, which is the GitHub Pages source branch. With authenticated Git credentials, run `npm run publish:pages` to rebuild, validate, and replace that generated deployment branch. It intentionally replaces the generated branch's history, never the source branch.

## Content and design

- `content/*.json`: original manuscripts with complete paragraph translations. `content/conversations.json` holds the conversation stories; each paragraph is a list of lines (`Speaker : …`, or `(stage direction)`) and `bubbles` gives the two cover lines. Reading levels are editorial targets, not certified CEFR assessments.
- `content/library.json`: expected level counts and cover atlas groups; library totals and filter labels are generated from this configuration.
- `public/`: local stylesheet, progressive enhancement script, fonts, and generated illustrations.
- Word translation calls Google Translate's public web endpoint (`translate.googleapis.com`, no API key). It is unofficial and can rate-limit; when it fails the popover offers an "Open in Google Translate" link instead.
- `scripts/build.mjs`: static page generator. All links are relative for GitHub project Pages.
- `PRODUCT.md`, `DESIGN.md`, and `docs/design-process.md`: product and design decisions.
- `docs/asset-provenance.json`: image generation prompts and cover tile order. The public credits page describes illustration and font provenance.
- `docs/story-review.md`: independent review of all 65 stories, including the final correction recheck. Exact changes are recorded in `docs/story-review-corrections.json`.

The 65 narrative stories and translations were authored by GPT-6.1 Sol writing agents. The 15 conversation stories were written by Claude (Anthropic) and are not part of the independent review in `docs/story-review.md`. Illustrations were generated with OpenAI's image generation tool. Typography: Switzer by Indian Type Foundry, from Fontshare.
