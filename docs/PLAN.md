# Build Plan: Improve Your Akhirah

Status: **approved, build started 22 Nov 2026** (name: Improve Your Akhirah). Week 1 progress: brand theme from logo, 3-language shell with RTL, proxy redirects, home + placeholder pages done. Data sources and licences: see [SOURCES.md](SOURCES.md).

**Assumptions:**
- one full-time developer
- a non-commercial project (client decision)
- hosting on Vercel's free Hobby plan with the client's own domain
- about **6 weeks** to launch
- database and login: **Supabase** (confirmed by the developer)

---

## 1. Stack

| Need | Choice | Free tier | Commercial on free tier? | Backup |
|---|---|---|---|---|
| Front end | Next.js 16 (App Router), TypeScript, Tailwind v4 | — | — | — |
| Hosting | **Vercel Hobby** | 100 GB transfer, 1M function calls, 5,000 image optimisations / month | **⚠ No.** Terms §4: *"only … for your personal or non-commercial use"* | Vercel Pro ($20/mo) or Cloudflare Workers via OpenNext (supports Next 16; free tier 100k requests/day) |
| Database | **Supabase Postgres** | 500 MB DB, 1 GB storage, 5 GB egress, 2 projects | Not restricted by the pricing page; ToS limits use to *"internal business purposes"* (normal SaaS wording) | Neon (free, never pauses, 1 GB/project) |
| Auth (email + Google) | **Supabase Auth** | 50,000 monthly active users | as above | Better Auth (MIT) on Neon |
| Auth emails | **Resend** (custom SMTP for Supabase) | 3,000 emails/month, 100/day | Yes | Supabase built-in SMTP (testing only, very low limit) |
| Sync (bookmarks, notes, progress, Khatam) | Supabase tables with row-level security; offline-first in IndexedDB, synced on login/reconnect | included | — | — |
| Search | **Orama** (Apache 2.0, Arabic stemmer included), indexes built at build time | free (library) | Yes | Postgres full-text search; Meilisearch self-hosted (MIT) |
| i18n + RTL | **Next.js built-in i18n** (chosen 22 Nov 2026 instead of next-intl: no dependency, and it is the pattern the bundled Next 16 docs use with Cache Components): `src/app/[lang]` root segment, `next/root-params`, JSON dictionaries in `src/i18n/`, locale redirect in `src/proxy.ts`, `<html lang dir>` per locale, logical CSS only | free | Yes | next-intl (MIT) |
| PWA + offline | Next.js `app/manifest.ts` + **Serwist** (`@serwist/turbopack`, MIT) service worker; saved surahs cached in Cache Storage/IndexedDB | free | Yes | Hand-written service worker (Next.js PWA guide) |
| Notifications | **Web Push** (VAPID, `web-push` MIT) sent by a Supabase Edge Function on a pg_cron schedule | free (Edge Functions 500k/month) | Yes | OneSignal free tier |
| Maps (Qibla fallback) | Leaflet + OpenStreetMap tiles | free, attribution required | ⚠ OSM may withdraw access from commercial sites | MapTiler / Stadia free tiers |

**Flagged non-commercial-only items:**
- Vercel Hobby (hosting)
- Tanzil translations (kept as backup only)
- AlQuran Cloud audio and OSM tiles (commercial use discouraged)

None of these block launch while the project stays non-commercial. **If it becomes commercial**, budget about $45/month: Vercel Pro $20 + Supabase Pro $25. Then re-check the items in SOURCES.md §7.

**Supabase free pause:** projects pause after **1 week without activity**. A live site with visitors won't hit this. During quiet development weeks, open the dashboard or app once a week.

### Search design
- One search box, three content indexes: Quran Arabic, Quran translations (Ur/En), and Hadith (Ar/Ur/En).
- **Arabic normalisation** before indexing and querying:
  - strip tashkeel and tatweel
  - unify alef forms (أ إ آ ٱ → ا), ى → ي, ة → ه
- **Urdu:** normalise the Arabic/Urdu letter variants (ي/ی, ك/ک, ه/ہ/ھ).
- **Roman Urdu:**
  - normalise the query (lowercase, collapse spelling variants like `aa/a`, `ee/i`, `oo/u`, `kh`, `gh`)
  - match it against a Roman-transliteration field
  - also map common words through a small dictionary (e.g. *namaz → صلاة*, *roza → صوم*, *jannat → جنة*)
  - use fuzzy matching (typo tolerance) in Orama
- The Quran index (~6,236 verses × languages) loads in the browser. The Hadith index is large (~35k hadith × 3 languages), so it is searched in a server route handler instead of being downloaded.

### Data handling rules
- Tanzil, QuranEnc and the hadith data are **self-hosted**: imported into the repo or DB with their licence headers.
- Quran Foundation data is **fetched server-side only**, cached with `revalidate` ≤ 7 days, and **never committed to git**. This is required by their terms.
- Audio is **streamed** from the providers' CDNs, so we host no audio files and stay within Vercel's free bandwidth.

---

## 2. Phases (6 weeks)

The plan is now 6 weeks for one developer. The pace is tight, so phases overlap. If anything slips, the **Mushaf page view** and **tafsir** move to a post-launch update first; reading, audio, Hadith, search and accounts stay on schedule.

### Week 1: Foundations + start of the Quran reader
- Apply for Quran Foundation production access on **day 1**.
- i18n routing (`ar` / `ur` / `en`), RTL, fonts, light/dark theme, layout, placeholder logo.
- Import scripts (Tanzil, QuranEnc, hadith dataset); Supabase + Vercel projects; client domain connected.
- Surah list and surah page with translations.
- **M0:** site shell live on the client's domain in 3 languages.

### Week 2: Quran reader + audio (Phase 1, MVP)
- Uthmani/IndoPak toggle, word-by-word + transliteration, tafsir panel, Mushaf page view.
- Audio player: reciter picker, verse highlighting + auto-scroll from timing data, repeat verse/range, speed.
- **M1 (end of week 2):** full Quran reading and listening. **Client demo #1.**

### Week 3: Hadith + Search (Phases 2–3)
- Six major books (+ Muwatta Malik): books → chapters → hadith, Ar/Ur/En, grade badges.
- Unified search (Quran + Hadith; Arabic, Urdu, English, Roman Urdu).
- **M2:** Hadith browsable and searchable.

### Week 4: Accounts + notifications backend (Phase 4)
- Supabase Auth: email (verification, reset) and Google.
- Bookmarks, notes, continue reading, Khatam tracker; offline-first, merged at login.
- Push subscription table + sending function (see Notifications below).
- **M3:** a bookmark made on a phone appears on a laptop.

### Week 5: Daily tools + notifications + PWA (Phases 5–6)
- Prayer times, Qibla (compass + map + degrees), Hijri calendar, Tasbeeh, Duas & Azkar, 99 Names, Zakat.
- Notifications switched on (prayer times, daily ayah, Khatam reminder).
- Installable PWA; "save surah for offline"; offline banner.
- **M4:** daily tools, install and notifications work on Android and iPhone. **Client demo #2.**

### Week 6: Stories + testing + launch (Phase 7)
- Stories section with "pending scholar review" status; the first 5 drafts for the client's reviewer.
- QA: 320px mobile, RTL/LTR, keyboard/contrast, Lighthouse, credits page.
- **M5 (end of week 6):** public launch.

### Notifications design
- **Type:** Web Push (works on Android Chrome, desktop browsers, and iPhone **only when the site is installed to the home screen**, iOS 16.4+). No app store needed.
- **What users can turn on:**
  - prayer-time alerts (each prayer, optional 10-min early)
  - daily ayah
  - Khatam/daily reading reminder
  - Jumu'ah reminder
  - Ramadan Sehri/Iftar times
- **How it runs:**
  1. The user taps "Enable notifications". The browser asks permission, and the push subscription is saved to Supabase together with the user's location, prayer method and choices.
  2. A **Supabase scheduled job (pg_cron)** runs every 5 minutes. It calls a Supabase Edge Function that works out who has a prayer (or reminder) due in that window, using the same adhan calculation, and sends the pushes with the `web-push` library (VAPID keys).
  3. The service worker (the same one that handles offline) shows the notification. A tap opens the right page.
- **Cost:** free. Uses the Supabase free tier (Edge Function calls: 500k/month) and no paid push service.
- **Limits to tell the client:** iPhone users must install the app first. Users who block notifications can't be reached. Alerts may arrive up to ~5 minutes off. Notifications are not email; email stays for login only (Resend free limit).

---

## 3. Milestone summary

| # | When | Deliverable | Client action |
|---|---|---|---|
| M0 | End wk 1 | Site shell live on domain | Confirm name; send logo if ready |
| M1 | End wk 2 | Quran reader + audio + translations | **Demo 1:** feedback within 3 days |
| M2 | End wk 3 | Hadith + search | — |
| M3 | End wk 4 | Accounts + sync | — |
| M4 | End wk 5 | Daily tools, notifications, PWA | **Demo 2:** feedback within 3 days; logo due |
| M5 | End wk 6 | Stories (first 5, reviewed) + launch | Reviewer approves stories; final sign-off |

---

## 4. Open risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Quran Foundation production access** is slow or refused | IndoPak, word-by-word, tafsir, timings and the mushaf view are delayed | Apply on day 1. Build against pre-live (Fatihah + Baqarah). Fallback: QUL downloads (licence to confirm) + EveryAyah per-verse audio for highlighting |
| **Hadith translation rights** (English/Urdu) are unclear | Fine non-commercially; a problem if the project goes commercial | Show translator credits. Ask rights holders before any commercial switch |
| **Going commercial** later | Vercel Hobby no longer allowed; several sources need re-checking | ~$45/mo plan (Vercel Pro + Supabase Pro). Work through SOURCES.md §7 |
| **Supabase pauses** after 1 idle week | Login and sync go down until restored | Normal traffic prevents it; weekly check during development |
| **Compass** unreliable on some phones (no sensor, iOS permission, magnetic interference) | Wrong or no direction | Always show the map line and degree bearing; ask users to calibrate; the compass is an extra, not the only method |
| **Scholar review** is slow | Stories can't launch | Stories ship hidden until approved; the rest of the site launches regardless |
| **Hijri date** differs from local moon sighting | User confusion around Ramadan/Eid | ±1 day setting, plus an admin-set offset for Pakistan |
| **Search quality** for Roman Urdu (no standard spelling) | Missed results | Normalisation + fuzzy matching + a growing synonym dictionary |
| **Vercel free limits** (100 GB/month) | Site throttled if traffic spikes | Audio streamed from external CDNs; pages statically generated; monitor usage |
| **External API outages** (Quran Foundation, CDNs) | Feature temporarily unavailable | Server-side caching; core Arabic + translations self-hosted, so reading never depends on a third party |
| **Next.js 16 is very new** | Library incompatibilities | Check the bundled docs before each new API; pin versions |
| **6-week timeline** is tight | Launch slips | Mushaf view and tafsir are the first to move to a post-launch update; demos catch problems early |
| **iPhone notifications** need the site installed to the home screen | Some iPhone users get no alerts | In-app prompt explaining "Add to Home Screen"; prayer times always visible in the app |
| **Scope creep** (extra features during the build) | Timeline slips | Extras go on a post-launch list, quoted separately |

---

## 5. Decisions needed from the client
1. Approve the feature list and this plan.
2. Final platform name (and logo when ready).
3. Name the content/story reviewer.
4. Confirmed: **non-commercial** for now (Nov 2026). Tell us before adding ads or paid features.
5. Default translations to show first (suggested: Urdu Junagarhi, English Saheeh International) and default reciter (suggested: Mishary Alafasy).
