---
name: Petites histoires
description: An illustrated paperback library for reading French.
colors:
  ground: "#e8e8e3"
  paper: "#f7f7f2"
  support: "#dcdcd6"
  ink: "#222520"
  muted: "#595e54"
  accent: "#d4d356"
  accent-ink: "#252719"
  tint: "#dce5cf"
  tint-blue: "#d7e5eb"
  tint-b2: "#ebdccb"
  focus: "#3e6746"
  dark-ground: "#191c19"
  dark-paper: "#242824"
  dark-support: "#30372f"
  dark-ink: "#f0f1e9"
  dark-muted: "#b9c1b4"
  dark-accent: "#dddf86"
  dark-tint: "#354634"
  dark-tint-blue: "#30454d"
  dark-tint-b2: "#4b3f32"
typography:
  display:
    fontFamily: "Switzer, sans-serif"
    fontSize: "clamp(2.75rem,5.2vw,5rem)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-.04em"
  headline:
    fontFamily: "Switzer, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-.035em"
  title:
    fontFamily: "Switzer, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.18
    letterSpacing: "-.025em"
  body:
    fontFamily: "Switzer, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "-.012em"
  reading:
    fontFamily: "Switzer, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.85
    letterSpacing: "0"
  label:
    fontFamily: "Switzer, sans-serif"
    fontSize: ".875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "-.012em"
rounded:
  square: "0"
  badge: "5px"
  button: "32px"
  filter: "28px"
  circle: "50%"
spacing:
  step-4: "4px"
  step-8: "8px"
  step-12: "12px"
  step-16: "16px"
  step-24: "24px"
  step-32: "32px"
  step-48: "48px"
  step-64: "64px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.button}"
    padding: "13px 24px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
  level-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.filter}"
    padding: "10px 21px"
  search:
    backgroundColor: "{colors.paper}"
    height: "52px"
  level-badge:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.badge}"
    padding: "2px 8px"
---

# Design System: Petites histoires

## Overview

**Creative North Star: "The Illustrated Paperback"**

A small illustrated French paperback becomes a browsable digital reading collection. Newsprint surfaces, brass accents and original gouache scenes give the page a material identity, while Switzer keeps navigation and long passages clear.

The library helps readers choose; Read mode gives prose the space. A clipped book ribbon supplies the recurring motif. Motion belongs to the cover and its illustrations, with a reduced-motion alternative and visible content by default.

Taste direction: page-is-the-object, seed 1445470789. This refresh preserves the incumbent newsprint-and-brass world.

**Key Characteristics:**
- Newsprint and brass with theme-specific ink and paper.
- Square editorial surfaces with rounded interactive controls.
- Illustrated covers and generous, adjustable reading measure.

## Colors

### Primary
Brass accent marks the book ribbon, selection, progress and selected save artwork. Ink-filled primary actions switch to brass on hover. Focus uses the dedicated focus color, with brass in dark mode.

### Secondary
The three gentle level tints distinguish A2, B1 and B2 without taking attention from the cover art. Their dark equivalents retain readable ink contrast.

### Neutral
Ground surrounds the page; paper carries the printed cover, search fields and reading article. Support supplies quiet control grouping. Muted ink identifies descriptions, metadata and translation prompts. The dark theme replaces these variables rather than inverting illustrations.

**The Paper and Ink Rule.** Use theme variables together so text and surfaces retain their intended contrast.

## Typography

Switzer is self-hosted at weights 400, 500 and 600 with a sans-serif fallback. Display and headings use medium weight and compact tracking; prose uses regular weight and open leading. Weight 600 is reserved for the wordmark and level badges.

The frontmatter records the desktop role defaults. The display scales fluidly; section headings become 2rem below 800px, with the library heading 1.875rem below 560px. Story headings use clamp(2rem,3vw,2.75rem), then 2rem on phones. Descriptions and controls use 1rem; small metadata uses the label role. Reading size defaults to 19px and the controls allow 17–25px in two-pixel steps.

**The Reading Measure Rule.** Keep story prose at a maximum of 65ch with 1.85 line height and zero letter spacing.

## Layout

The main wrapper is capped at 1280px with 32px side gutters, reduced to 20px below 800px. The catalogue is three columns, two below 800px, and one below 560px. Its desktop gaps are 28px horizontally and 44px vertically. Controls share a row from 1100px; search and theme controls stack on phones.

The cover pairs two panels with a 12px gutter; below 560px the printed copy sits above a compact illustration and caption pair. The reader is capped at 1056px with 56px 64px 64px padding, reducing through 40px and 36px 28px to 32px 24px 40px on phones. Reading tools cap at 710px; translation panels sit directly beneath their French paragraph.

## Elevation & Depth

No box shadows are implemented. Depth comes from paper against ground, tonal translation panels, image cropping and the clipped ribbon. Covers receive a restrained zoom on hover. The cover enters over 0.8s; illustrations drift over 16s. The shared easing is recorded in the sidecar. Reduced-motion preference disables animations and transitions and removes smooth scrolling.

**The Flat Paper Rule.** Convey structure through tonal surfaces and spacing, preserving the unshadowed page material.

## Shapes

Page panels, search fields and illustrations retain square corners. Primary actions are pills; icon actions are circles; level badges have a slight corner softening. The narrow ribbon ends in a clipped notch. Line icons use inline stroked SVG rather than text glyphs.

## Components

### Buttons
Ink on paper is reversed for the primary filled action, with brass on hover. The default action has a 50px minimum height and the frontmatter padding. Text actions use underline on hover; circular icon actions use a support-colored hover surface. Pressed primary and icon buttons scale to .97. Keyboard focus is a 3px outline with 5px offset. Disabled font controls have .45 opacity.

### Chips
Level filters sit within a support-colored pill group. The selected filter uses ink and paper with aria-pressed; unselected filters gain ground on hover. Compact colored level badges identify editorial difficulty.

### Cards / Containers
Story cards are unboxed editorial entries: square illustration, metadata, title, teaser and bookmark action. Hovering a cover scales its art to 1.035; a small reading prompt appears on desktop hover or keyboard focus. Read markers overlay the upper corner. Saved bookmarks receive brass fill. Phone covers omit the hover prompt.

### Inputs / Fields
Search and theme selection use flat paper fields, minimum 52px on desktop. Search has a leading inline SVG; the native select has a trailing SVG chevron. Both retain the shared keyboard focus outline.

### Navigation
The wordmark and two plain text links share the header with a circular theme control. Links underline on hover. Below 560px the library link hides while Saved and theme remain available. The saved count appears only when needed.

### Paragraph translation
Native details/summary reveals each English counterpart in a ground-colored inset. The summary changes between show and hide wording, and its SVG chevron rotates. The reading toolbar can reveal or hide all five translations. Completed stories gain a tinted completion action and catalogue marker.

## Do's and Don'ts

### Do:
- **Do** use the existing theme variables for paper, ink and semantic states.
- **Do** preserve the 65ch reading measure and 1.85 leading.
- **Do** keep native paragraph translations and visible keyboard focus.
- **Do** use original story illustrations as catalogue content.

### Don't:
- **Don't** introduce resting shadows into the flat paper system.
- **Don't** apply cover entrance motion to reading paragraphs.
- **Don't** turn story covers into generic rounded feature tiles.
