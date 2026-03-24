@AGENTS.md

# Project: inspo-marcin-1

## Tech Stack
- **Framework:** Next.js 16.2.1 (App Router)
- **Language:** TypeScript 5
- **UI:** React 19.2.4
- **Styling:** Tailwind CSS 4 (via PostCSS plugin `@tailwindcss/postcss`)
- **Fonts:** Geist Sans + Geist Mono (via `next/font/google`)
- **Linting:** ESLint 9 with `eslint-config-next` (core-web-vitals + typescript)

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint

## Project Structure
```
src/
  app/
    layout.tsx        — root layout (Geist fonts, html/body setup)
    page.tsx          — home page (scroll orchestration, section logic)
    globals.css       — Tailwind import + CSS custom properties
    favicon.ico
  components/
    Navigation.tsx    — top nav bar (appears on scroll, links to sections)
    GridBackground.tsx — 10x10 grid overlay
    HeroText.tsx      — "DEVELOPER" watermark text
    CenterLine.tsx    — vertical center line with accent progress
    SectionCard.tsx   — card with dot, thread, border, text animations
    ScrollIndicator.tsx — "Scroll to explore" indicator
    Footer.tsx        — footer with split lines
  lib/
    theme.ts          — color palette & design tokens
    sections.ts       — section content data
    math.ts           — easing, seeded random, thread path builder
public/               — static assets (SVGs)
```

## Design System (`src/lib/theme.ts`)
- **Accent:** `#e85d04` (warm orange) — borders, threads, dots, highlights
- **Grid:** `#e0e0e0` — 10x10px background grid
- **Card:** 400x220px, snapped to grid, 60px gap from center line
- **Typography:** mono font, uppercase tracking, minimal

## Key Patterns
- Scroll-driven animations with `easeInOutCubic`
- SVG `pathLength={1}` + `strokeDashoffset` for draw/undraw animations
- Seeded pseudo-random for consistent thread paths across renders
- Sticky card positioning during animation, released after completion
- Thread paths: Catmull-Rom spline with irregular sine wave modulation

## Conventions
- Path alias: `@/*` maps to `./src/*`
- Tailwind v4 syntax: use `@import "tailwindcss"` and `@theme inline` in CSS
- ESLint flat config (`eslint.config.mjs`)

## Important
- This uses **Next.js 16** which has breaking changes vs older versions. Always check `node_modules/next/dist/docs/` for current API docs before writing code.
