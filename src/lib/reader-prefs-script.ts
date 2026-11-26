/**
 * Shared by Server and Client Components, so this module must not be "use client":
 * values exported from a client module reach Server Components as client references,
 * not as their real values.
 */
export const PREFS_KEY = "reader:v1";

/**
 * Applies saved translation/size prefs to #reader before first paint (full page loads only).
 * Mirrors applyPrefsToReader() in reader-prefs.ts.
 */
export const prefsScript = `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(PREFS_KEY)})||"null");var r=document.getElementById("reader");if(!s||!r)return;if(s.tr){if("ur" in s.tr)r.dataset.trUr=String(!!s.tr.ur);if("en" in s.tr)r.dataset.trEn=String(!!s.tr.en)}if(s.size)r.style.setProperty("--quran-scale",String(s.size))}catch(e){}})()`;
