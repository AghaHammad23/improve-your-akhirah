@AGENTS.md

# Improve Your Akhirah

Free Islamic companion website (Quran, Hadith, translations, audio, daily tools, user accounts) in Arabic, English and Urdu.

Read `docs/PROJECT_BRIEF.md` first: it holds the full scope, the constraints and the client's open decisions.

## Tech stack
- Next.js (App Router, `src/` directory), React, TypeScript, Tailwind CSS v4 (configured in `src/app/globals.css`, no tailwind.config file).
- Import alias: `@/*` → `src/*`.
- This Next.js version is newer than most training data: check `node_modules/next/dist/docs/` before using an API you're unsure of (see AGENTS.md).

## Design rules
- **Fully responsive.** Every page and component must work well on mobile (from 320px), tablet and desktop. Design mobile-first; no horizontal scrolling; touch targets at least 44px.
- **Color theme: deep teal from the logo, with gold and cream accents.** Use the tokens in `src/app/globals.css`:
  - `brand-*`: teal; `brand-700` #0F5E5E and `brand-800` #0A4444 are the logo colours
  - `gold-*`: accent; `gold-400` #D9C48F is the logo ring
  - `cream-*`: `cream-200` #F3E6C8 is the logo lettering
  - semantic `surface` / `ink` / `muted` / `line` tokens that switch for dark mode

  Never hard-code colours. Gold is decorative or for use on dark teal only: it fails contrast as text on light backgrounds. Support light and dark mode (`data-theme` on `<html>`).
- **Logo and brand assets** are in `public/brand/`:
  - the original PDF, `logo.svg`, PNG sizes and `apple-touch-icon.png`
  - name: **Improve Your Akhirah**; Arabic wordmark: الآخرة

  Use them as supplied; don't redraw or alter the logo.
- **Fonts:**
  - Noto Serif for headings (matches the logo wordmark) and Inter for English UI
  - Noto Naskh Arabic for Arabic UI
  - Noto Nastaliq Urdu for Urdu
  - Amiri Quran for Quran text
- **RTL support:** Arabic and Urdu need correct right-to-left layout (`dir="rtl"`) and proper fonts. Use logical CSS properties (`ms-`/`me-`, `ps-`/`pe-`, `start`/`end`) rather than left/right so layouts flip correctly. Test both directions.
- Accessible: semantic HTML, keyboard navigation, sufficient contrast.

## Content rules
- Never copy content, design, text or branding from Islam360 or any other app. Use original, openly licensed sources only.
- Check the licence of every translation, dataset and API before using it; record it in `docs/SOURCES.md`.
- Religious content we write (e.g. Prophet and Sahaba stories) must cite Quran/Hadith references and be marked as needing scholar review.
- Prefer free services; note any non-commercial-only terms.

## Commands
- `npm run dev` — dev server at http://localhost:3000
- `npm run build` — production build
- `npm run lint` — ESLint
