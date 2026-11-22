# Improve Your Akhirah

A free Islamic companion website: Quran, Hadith, prayer times, Qibla, duas and daily tools, in Urdu, English and Arabic.

- Scope and constraints: [docs/PROJECT_BRIEF.md](docs/PROJECT_BRIEF.md)
- Build plan and stack: [docs/PLAN.md](docs/PLAN.md)
- Data sources and licences: [docs/SOURCES.md](docs/SOURCES.md)

## Run it

```bash
npm install
npm run dev     # http://localhost:3000 (redirects to /ur, /en or /ar)
npm run build   # production build
npm run lint
```

## Project layout

| Path | What it is |
|---|---|
| `src/app/[lang]/` | All pages. `[lang]` is `ur`, `en` or `ar` and is the root layout. |
| `src/i18n/` | Locale config and UI dictionaries (`en.json` is the reference; `ur`/`ar` must match its keys). |
| `src/proxy.ts` | Redirects `/` and other paths without a language to the visitor's language (saved cookie, then browser language, then Urdu). |
| `src/components/` | Header, footer, language switcher, theme toggle, icons. |
| `src/app/globals.css` | Brand colours from the logo (`brand-*` teal, `gold-*`, `cream-*`) and light/dark tokens. |
| `public/brand/` | Logo as supplied (PDF) plus SVG/PNG exports and icons. |

## Adding a UI string

1. Add the key to `src/i18n/dictionaries/en.json`.
2. Add the same key to `ur.json` and `ar.json` (TypeScript fails the build if one is missing).
3. Read it in a Server Component with `const dict = await getDictionary()`.

Urdu and Arabic UI text should be checked by a native speaker before launch.
