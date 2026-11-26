# Data Sources and Licences

Last checked: **21 November 2026**. Every licence below was read on the official page on that date. Where a page failed to load or said nothing, this file says **unverified**; it never fills the gap with a guess.

**Project status:** non-commercial (client decision, Nov 2026). Some sources are fine now but would need permission or replacement if the project becomes commercial. These are marked **⚠ non-commercial only** or **⚠ commercial unclear**. Wherever we could, the recommended source also allows commercial use, so a later switch doesn't force a rebuild.

Legend:
- **Live** = call the API at runtime (server-side, cached).
- **Self-host** = download once, store in our repo or database, serve it ourselves.
- **Compute** = no data needed; calculated in code.

---

## Summary table

| Feature | Recommended | Backup | Mode |
|---|---|---|---|
| Arabic text, Uthmani | Tanzil Uthmani text | Quran Foundation API | Self-host |
| Arabic text, IndoPak | Quran Foundation API (`text_indopak`) | QUL IndoPak script download | Live (cached ≤ 7 days) |
| Urdu + English translations | QuranEnc | Quran Foundation API; Tanzil (⚠ non-commercial) | Self-host |
| Word-by-word + transliteration | Quran Foundation API | QUL word-by-word | Live (cached ≤ 7 days) |
| Tafsir | Quran Foundation API | QuranEnc (As-Saadi Urdu, unverified) | Live (cached ≤ 7 days) |
| Mushaf page view | Quran Foundation page fonts + layout | QUL mushaf layouts + fonts | Bundle (allowed, see terms) |
| Audio + verse timings | Quran Foundation chapter audio (`segments=true`) | EveryAyah / AlQuran Cloud CDN | Live stream |
| Hadith (6 books, Ar/Ur/En, grades) | fawazahmed0/hadith-api | HadithAPI.com | Self-host |
| Prayer times | adhan-js | AlAdhan API | Compute |
| Qibla | adhan-js `Qibla()` + device compass | Map via Leaflet + OpenStreetMap | Compute |
| Hijri calendar | Browser `Intl` (`islamic-umalqura`) | AlAdhan Hijri API | Compute |
| Duas / Azkar | Our own dataset compiled from Quran + Hadith sources | rn0x/Adhkar-json (Arabic only) | Self-host |
| 99 Names | Our own JSON (AlAdhan used as a checked reference) | AlAdhan `asmaAlHusna` | Self-host |
| Zakat calculator | Formula in code; nisab prices entered by admin | none | Compute |
| Tasbeeh | Local state | none | Compute |

---

## 1. Quran

### 1.1 Tanzil Quran text (recommended: Uthmani Arabic)
- **URL:** https://tanzil.net/download/ · licence: https://tanzil.net/docs/text_license
- **Covers:** Arabic Quran text (Uthmani and Simple scripts); text, XML and SQL formats.
- **Licence:** Creative Commons Attribution 3.0. Quote: *"Permission is granted to copy and distribute verbatim copies of this text, but CHANGING IT IS NOT ALLOWED."* It may be used *"in any website or application, provided that its source (Tanzil Project) is clearly indicated"*.
- **Commercial use:** yes. CC BY allows it, and the page puts no limit on it. Attribution and an unmodified text are required.
- **Key / rate limit:** none (file download).
- **Mode:** self-host. Store the file exactly as downloaded, with its copyright header.
- **In use (25 Nov 2026):** *Simple Clean* v1.1 (standard spelling, no diacritics), for **Arabic search only**. The reader still shows the QuranEnc Uthmani text. Stored verbatim with its notice in `src/data/quran/tanzil-simple-clean.txt` (`npm run data:quran-search`). `scripts/build-search-index.mjs` copies the verses unchanged into `public/search/quran-ar.json`, together with the notice. Normalisation happens only in memory while matching, and results show the text unchanged. The search page credits Tanzil and links to tanzil.net, as the licence requires.

### 1.2 Tanzil translations (⚠ non-commercial only)
- **URL:** https://tanzil.net/trans/
- **Covers:** 100+ translations in about 50 languages, including Urdu (e.g. Jalandhry, Junagarhi) and English (Sahih International, Pickthall, Yusuf Ali). Also English transliteration.
- **Licence:** *"The translations provided at this page are for non-commercial purposes only."* Commercial use needs *"necessary permission from the translator or the publisher."* A site using more than three translations must link back to the page.
- **Mode:** self-host. **Backup only**, because it would block a later commercial switch.

### 1.3 QuranEnc (recommended: Urdu and English translations)
- **URL:** https://quranenc.com · API: https://quranenc.com/en/home/api/
- **Covers:** Urdu: Muhammad Junagarhi, Dr. Muhammad Luqman Al-Salafi. English: Saheeh International (Noor International), Rowwad Translation Center, Hilali & Khan. Formats: XML, CSV, Excel, SQLite, JSON API.
- **Licence:** *"Contents of the translations can be downloaded and re-published, subject to these Terms and Policies"*. The conditions are:
  - no modification, addition or deletion of the content
  - clearly credit the publisher and QuranEnc.com
  - mention the version number
  - keep the translation's own information
  - update to the latest version
  - *"Inappropriate advertisements must not be included when displaying translations"*
- **Commercial use:** ⚠ not stated either way. Fine for now. Email QuranEnc before any commercial launch.
- **Key / rate limit:** *"No authentication is required and CORS is open."* No rate limit stated.
- **Mode:** self-host. Record the version, and re-check for updates each quarter.
- **Unverified:** whether the Urdu As-Saadi tafsir is listed (only a page summary mentioned it).

### 1.4 Quran Foundation API (Quran.com API v4) (recommended: IndoPak, word-by-word, tafsir, audio timings, mushaf fonts)
- **URL:** https://api-docs.quran.foundation · terms: https://api-docs.quran.foundation/legal/developer-terms/ (updated 2026-11-20)
- **Covers:** Quran text in several scripts (including IndoPak), translations, word-by-word translation and transliteration, tafsir, recitations with audio URLs and timing data, and mushaf page fonts.
- **Access:** a Developer Console account and OAuth2 *client credentials*. The token lasts 1 hour. **The client secret must stay on the server**, so all calls go through our Next.js server. Pre-live has only Al-Fatihah and Al-Baqarah. **Production needs approved access.**
- **Licence:** a free, *"non-exclusive, revocable, non-transferable"* licence to build *"Applications that provide beneficial Quranic experiences"*.
- **Commercial use:** yes. *"A Developer may charge for an Application, … display advertising, accept donations"*.
- **Restrictions:**
  - **Redistribution:** no *"Selling, sublicensing, or redistributing Quran Foundation Content or raw API data"*. Putting it *"in a public source-code repository, package, or other downloadable data file is redistribution."*
  - **Caching:** no caching longer than **1 week**, except through their Content Sync, for font/Mushaf bundles, or for user offline audio downloads.
  - **Offline audio:** users may keep downloaded audio *"with no 1-week limit"*, in private storage.
  - **Fonts and Mushaf images:** may be bundled with the app if we keep an active Developer Console account and credit Quran Foundation.
  - **AI:** no training of AI models on the content.
  - **Attribution:** "Quran data provided by Quran Foundation", plus a named credit for each translation, tafsir and reciter.
- **Rate limits:** not published (the terms treat the values as confidential). Handle HTTP 429 with backoff.
- **Mode:** live, server-side, with Next.js caching set to revalidate within **7 days**. **Never commit their data to git.**
- **Verse timing:** `GET /chapter_recitations/{id}/{chapter}?segments=true` returns, for each verse, `timestamp_from`/`timestamp_to` plus word segments `[word_index, start_ms, end_ms]`. This drives verse **and** word highlighting.

### 1.5 QUL (Quranic Universal Library, by Tarteel) (backup)
- **URL:** https://qul.tarteel.ai/resources
- **Covers:**
  - 220 translations (22 of them word-by-word)
  - 115 tafsirs
  - 11 transliterations
  - 28 mushaf layouts
  - 30 scripts (Madani, IndoPak, Uthmani)
  - 26 fonts
  - 131 recitations (58 with timestamps)
- **Licence:** **unverified.** The site says resources are *"intended for you to download and package with your own project; no API is available"*. Its credits say most resources were *"created or curated by the community"*, and the fonts and images come from the King Fahd Complex. The Tarteel terms page (https://www.tarteel.ai/terms) did not render. Ask Tarteel before using QUL in production.
- **Key / rate limit:** none (downloads).

### 1.6 fawazahmed0/quran-api (backup, translations and Roman Urdu)
- **URL:** https://github.com/fawazahmed0/quran-api
- **Covers:** 440+ translations in about 98 languages, including Latin-script editions (useful as Roman Urdu search input). Served from the jsDelivr CDN.
- **Licence:** Unlicense (public domain) for the repo. **⚠ That does not cover the rights of the translations it contains.** Some translations were OCR'd and *"may contain mistakes"*.
- **Key / rate limit:** none; the README says *"No Rate limits"*.

### 1.7 AlQuran Cloud API (backup)
- **URL:** https://alquran.cloud/api · terms: https://alquran.cloud/terms-and-conditions (updated 13 Nov 2026)
- **Licence:**
  - Quran text: *"You may use, store and show the text freely."*
  - Translations and recitations: *"remain the copyright of their translators and reciters."*
  - Audio: may be used *"for personal and educational use"*, but *"If you put them in a commercial product, the reciters may ask you to remove them."* ⚠
- **Key / rate limit:** *"None of them needs an account or an API key."* There is a soft per-IP limit on requests per second (number not stated). They ask: *"Please cache audio on your side."*

### 1.8 Mushaf page images (status)
- quran.com-images (https://github.com/quran/quran.com-images): the code is GPL, but *"the actual fonts and pages … belong to the King Fahd Quran Complex"*. No open licence for the images.
- King Fahd Complex (https://qurancomplex.gov.sa): the fonts section is marked "coming soon"; the footer says "All rights reserved". No published font licence.
- quran_android: the code is GPL-3.0 with a request to keep use *"for non-profit purposes only"*. The data is *"typically … CC BY-NC-ND"*.
- **Decision:** build the page view from **Quran Foundation page fonts and layout data**, whose terms explicitly allow bundling. Do not take images from apps.

---

## 2. Audio

| Source | Covers | Licence / terms | Commercial | Key | Mode |
|---|---|---|---|---|---|
| **Quran Foundation recitations** (recommended) | Many reciters; chapter audio with verse + word timings | Developer Terms (see 1.4); credit each reciter; offline download allowed with conditions | Yes | OAuth (server) | Stream audio URLs; fetch timings server-side |
| **EveryAyah.com** (backup) https://everyayah.com/recitations_ayat.html | Verse-by-verse MP3s for ~40 reciters (Alafasy, Husary, Abdul Basit, Minshawi, Sudais…); Urdu translation audio; timing files | **No terms published** (unverified) | ⚠ unclear | None | Stream, verse files (playing one file per verse means no timing data is needed) |
| **AlQuran Cloud / Islamic Network CDN** (backup) https://alquran.cloud/cdn | Verse MP3s at 32–192 kbps for ~15 reciters | Personal/educational use; reciters may ask commercial products to remove | ⚠ | None | Stream |
| **MP3Quran** https://mp3quran.net/api | Large reciter list (full surahs) | API page is a bare file index; **no terms found** | ⚠ unclear | None | Not recommended until terms are found |

**Highlighting method:** use Quran Foundation timings. As a fallback, play EveryAyah's one-file-per-verse audio, where the verse being played *is* the verse to highlight. **Repeat/memorise** works with either: loop a verse or a verse range N times.

---

## 3. Hadith

| Source | Books | Languages | Grades | Licence | Commercial | Key | Mode |
|---|---|---|---|---|---|---|---|
| **fawazahmed0/hadith-api** (recommended) https://github.com/fawazahmed0/hadith-api | Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah, Malik, 40 Nawawi, 40 Qudsi | Arabic, English, **Urdu (all 7 major books)**, + others | **Yes**: a `grades` array per hadith (Al-Albani, Zubair Ali Zai, Shuaib Al Arnaut, …), and coverage varies by book | Unlicense: *"free and unencumbered software released into the public domain"* | Repo: yes. **⚠ The English/Urdu translations inside it are third-party works with their own rights** | None; *"No Rate limits"* | Self-host (import into DB) |
| **HadithAPI.com** (backup) https://hadithapi.com | Major books | Arabic, Urdu, English: *"We are providing hadiths in arabic, urdu and english languages."* | Not stated | No licence or terms page found; *"free for everyone"* | ⚠ unclear | Free key on registration | Live or one-time import |
| **Sunnah.com API** https://github.com/sunnah-com/api | Many collections | Arabic, English | Yes (on site) | **Unverified**: the developer page returned 403 and the docs returned 404 | Unknown | Key on request | Not used until verified |
| **Open-Hadith-Data** https://github.com/mhashim6/Open-Hadith-Data | 9 books incl. Musnad Ahmad, Darimi | Arabic only | No | ODbL / Database Contents License | Yes (share-alike for the database) | None | Backup Arabic source |
| **AhmedBaset/hadith-json** | 17 books | Arabic, English (scraped from Sunnah.com) | No | **No licence** | No | n/a | **Do not use** |

**Data quality found during import (25 Nov 2026), fawazahmed0/hadith-api@1:**

| Book | Hadith | Missing Arabic | Missing English | Missing Urdu |
|---|---|---|---|---|
| Bukhari | 7,583 | 9 | 9 | **570** |
| Muslim | 7,481 | 203 | 203 | 105 |
| Abu Dawud | 5,274 | 2 | 2 | 1 |
| Tirmidhi | 3,989 | 74 | 72 | 67 |
| Nasa'i | 5,683 | 86 | 86 | **1,891 (33%)** |
| Ibn Majah | 4,342 | 5 | 3 | 14 |

- **Gradings:** present for Abu Dawud, Tirmidhi, Nasa'i and Ibn Majah, with several graders per hadith (Al-Albani, Zubair Ali Zai, Shuaib Al Arnaut, Muhammad Muhyi Al-Din Abdul Hamid). There are none for Bukhari and Muslim.
- **Chapter titles** exist only in English, in every edition. Arabic and Urdu titles are still needed: write them and have them reviewed, or take them from a licensed source.
- **Muslim's Urdu edition** is ordered differently, so languages are merged by hadith number. A spot check of narrator names gave about 92% agreement; the misses are mostly where the Urdu shortens the chain.
- **About 1% of hadith have no chapter reference**; the importer places them by each chapter's number range.
- **Urdu quality:** Bukhari #1's Urdu starts mid-sentence ("کو حمیدی نے…", missing "ہم"). Urdu needs a review pass before launch.
- **To fill the Urdu gaps:** HadithAPI.com (backup) has Urdu, but it publishes no terms; ask before using it.
- **Storage:** about 80 MB, generated by `scripts/import-hadith.mjs` before each build and gitignored. Candidate to move into Supabase with search.

**Note:** the Arabic hadith text itself is classical and not copyrighted. The risk sits in modern **translations**. That is fine while the project is non-commercial. Before any commercial launch, confirm the translation rights (see the PLAN risks).

---

## 4. Daily tools

### 4.1 Prayer times: adhan-js (recommended)
- **URL:** https://github.com/batoulapps/adhan-js · **Licence:** MIT · commercial use allowed · no key.
- Computes all five prayer times and sunrise in the browser from latitude/longitude, with selectable methods (Karachi/Hanafi, MWL, Umm al-Qura, ISNA, Egyptian…) and Hanafi/Shafi Asr. It works offline and costs nothing per request.
- **Backup:** AlAdhan API (https://aladhan.com/prayer-times-api). Free and needs no account (per its credits-and-terms page), but **no licence, commercial terms or rate limits are published**. The /terms URL returns 404.

### 4.2 Qibla: adhan-js `Qibla(coordinates)` (recommended)
- Returns the bearing in degrees from true North to the Kaaba. It is pure maths (great-circle bearing), so no API is needed.
- **Compass:** the browser `DeviceOrientationEvent` (iOS requires a permission tap; some Android browsers give no absolute heading).
- **Map fallback:** Leaflet (BSD-2) + OpenStreetMap tiles.
  - The OSM tile policy requires *"© OpenStreetMap contributors"* attribution and a custom User-Agent.
  - It forbids bulk/offline download: *"Offline use is not permitted on tile.openstreetmap.org."*
  - It warns *"Commercial services … should be especially aware that access may be withdrawn"*. If we go commercial, switch to a paid or free-tier tile provider.

### 4.3 Hijri calendar: built-in browser `Intl` (recommended)
- `new Intl.DateTimeFormat('ur-PK-u-ca-islamic-umalqura')` gives Umm al-Qura dates with no data or licence. We add a user "±1 day" setting, because moon sighting in Pakistan often differs from Umm al-Qura.
- **Backup:** AlAdhan Hijri endpoints (same terms caveat as 4.1).

### 4.4 Duas and Azkar
- **No verified openly licensed dataset with Arabic + English + Urdu exists.**
  - hisnmuslim.com returned 403.
  - nawafalqari/azkar-api has no licence and sources its text from islambook.com.
  - rn0x/Adhkar-json is Arabic-only and archived. Its README states, informally, that the files have no licence and may be used freely.
- **Recommendation:** build our own dataset.
  - The **Arabic text** of each dua is Quran or hadith wording, so it carries no copyright.
  - Each entry cites its source (e.g. Bukhari 6306), checked against our hadith dataset.
  - **English and Urdu meanings are written by us** and marked for scholar review.
  - Start with about 60 core azkar: morning/evening, after salah, sleep, travel, eating.
- **Backup:** rn0x/Adhkar-json for the Arabic only.

### 4.5 99 Names of Allah
- AlAdhan `GET https://api.aladhan.com/v1/asmaAlHusna` returns all 99 (Arabic, transliteration, English meaning). It contains spelling errors ("Maginificent", "Inhertior", "Soverign"), and no licence is stated.
- **Recommendation:** our own JSON file. The names themselves are not copyrightable. Write our own English and Urdu meanings (scholar-reviewed), and use AlAdhan only to cross-check.
- **As built (26 Nov 2026):** `src/lib/names.ts`. No new dependency or dataset.
  - **Arabic and order:** copied from Jami' at-Tirmidhi 3507 in our hadith data. That edition counts "Allah" as the first name, then 98 more (al-Rahman … al-Sabur); it has no al-Ahad.
  - **Grading:** the list's chain is graded Da'if in our data (al-Albani, Ahmad Shakir, Zubair Ali Zai). The Junagarhi footnote on Quran 7:180 (our QuranEnc data) also says the lists are weak and *mudraj* (a narrator's addition). The page says so. The virtue ("99 names … enters Paradise") is cited from Sahih al-Bukhari 7392.
  - **References:** 91 names link to a Quran verse and 3 to a Bukhari hadith (6317 for al-Muqaddim/al-Mu'akhkhir, 6099 for al-Sabur); 5 have none (al-Khafid, al-Wajid, al-Majid, al-Mani', al-Rashid). Some verses use the name itself, others the action it describes. `node scripts/check-names.mjs` re-checks the Arabic against Tirmidhi 3507 and every reference against our Quran and hadith text.
  - **Transliterations and English/Urdu meanings:** written by us, marked for scholar review. The Arabic page shows no meaning.

### 4.6 Zakat calculator
- Pure formula (2.5% of zakatable wealth above nisab).
- Nisab needs current gold and silver prices. In v1 an admin enters the PKR price per tola (and the user can override it). This avoids a paid metals-price API.

---

## 5. Fonts (all free)
| Font | Use | Licence |
|---|---|---|
| Quran Foundation page fonts (QCF) | Mushaf page view | Developer Terms, bundling allowed with credit |
| Amiri Quran / Scheherazade New (Google Fonts) | Arabic verse text | SIL Open Font License |
| Noto Nastaliq Urdu (Google Fonts) | Urdu UI and translations | SIL Open Font License |
| Inter / Noto Sans (Google Fonts) | English UI | SIL Open Font License |

(The licences in section 5 are the standard Google Fonts licences. Re-confirm each font's licence on fonts.google.com when we add it.)

---

## 6. Attribution page (required)
The site must have a "Sources & Credits" page listing:
- Tanzil (with link)
- Quran Foundation ("Quran data provided by Quran Foundation")
- QuranEnc (each translation with its version number)
- each reciter by name
- the hadith dataset and the translator of each book
- adhan-js
- © OpenStreetMap contributors
- every font

## 7. Open licence questions (to ask before any commercial launch)
1. QuranEnc: is commercial use allowed? (email them)
2. Tarteel / QUL: what licence applies to the downloads?
3. Hadith English/Urdu translations: who holds the rights (e.g. Darussalam)?
4. EveryAyah: are there any terms of use?
5. Sunnah.com API: what are the key terms (the page blocked automated reading)?
