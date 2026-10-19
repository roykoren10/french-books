# Petites histoires

Original French short stories with optional English translations. Fifteen A2 stories, twenty-five B1 stories, and twenty-five B2 stories, each with five translated paragraphs and its own illustrated cover.

The library includes combined CEFR, theme, and text filters; saved stories; read markers; light/dark themes; reading text-size controls; and individual or global English translation toggles. Personal preferences stay in the reader's browser. Story pages and native paragraph translation controls work without JavaScript.

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

- `content/*.json`: original manuscripts with complete paragraph translations. Reading levels are editorial targets, not certified CEFR assessments.
- `content/library.json`: expected level counts and cover atlas groups; library totals and filter labels are generated from this configuration.
- `public/`: local stylesheet, progressive enhancement script, fonts, and generated illustrations.
- `scripts/build.mjs`: static page generator. All links are relative for GitHub project Pages.
- `PRODUCT.md`, `DESIGN.md`, and `docs/design-process.md`: product and design decisions.
- `docs/asset-provenance.json`: image generation prompts and cover tile order. The public credits page describes illustration and font provenance.
- `docs/story-review.md`: independent review of all 65 stories, including the final correction recheck. Exact changes are recorded in `docs/story-review-corrections.json`.

Stories and translations were authored by GPT-6.1 Sol writing agents. Illustrations were generated with OpenAI's image generation tool. Typography: Switzer by Indian Type Foundry, from Fontshare.
