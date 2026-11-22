/**
 * Verse-by-verse recitations from EveryAyah.com (https://everyayah.com/recitations_ayat.html).
 * One MP3 per verse, so the verse being played is the verse to highlight; no timing data needed.
 * Planned upgrade: Quran Foundation recitations with word timings once API access is approved.
 */
export const reciters = [
  { id: "alafasy", name: "Mishary Rashid Alafasy", nameAr: "مشاري راشد العفاسي", folder: "Alafasy_128kbps" },
  { id: "husary", name: "Mahmoud Khalil Al-Husary", nameAr: "محمود خليل الحصري", folder: "Husary_128kbps" },
  { id: "abdulbasit", name: "Abdul Basit Abdus Samad", nameAr: "عبد الباسط عبد الصمد", folder: "Abdul_Basit_Murattal_192kbps" },
  { id: "minshawi", name: "Mohamed Siddiq Al-Minshawi", nameAr: "محمد صديق المنشاوي", folder: "Minshawy_Murattal_128kbps" },
  { id: "sudais", name: "Abdur-Rahman As-Sudais", nameAr: "عبد الرحمن السديس", folder: "Abdurrahmaan_As-Sudais_192kbps" },
  { id: "muaiqly", name: "Maher Al-Muaiqly", nameAr: "ماهر المعيقلي", folder: "Maher_AlMuaiqly_64kbps" },
  { id: "shuraim", name: "Saud Ash-Shuraim", nameAr: "سعود الشريم", folder: "Saood_ash-Shuraym_128kbps" },
] as const;

export type ReciterId = (typeof reciters)[number]["id"];

export const defaultReciter: ReciterId = "alafasy";

export function verseAudioUrl(reciterId: string, surah: number, verse: number): string {
  const reciter = reciters.find((r) => r.id === reciterId) ?? reciters[0];
  const pad = (n: number) => String(n).padStart(3, "0");
  return `https://everyayah.com/data/${reciter.folder}/${pad(surah)}${pad(verse)}.mp3`;
}
