/**
 * Dhikr phrases for the Tasbeeh counter. Arabic with diacritics, a common transliteration, and our own short
 * Urdu and English meanings. ⚠ Needs scholar review (meanings and spellings), like other content we write.
 */
export type Dhikr = {
  id: string;
  ar: string;
  translit: string;
  meaning: { en: string; ur: string };
};

export const dhikrList: Dhikr[] = [
  {
    id: "subhanallah",
    ar: "سُبْحَانَ اللَّهِ",
    translit: "SubhanAllah",
    meaning: { en: "Glory be to Allah", ur: "اللہ پاک ہے" },
  },
  {
    id: "alhamdulillah",
    ar: "الْحَمْدُ لِلَّهِ",
    translit: "Alhamdulillah",
    meaning: { en: "All praise is for Allah", ur: "تمام تعریفیں اللہ کے لیے ہیں" },
  },
  {
    id: "allahuakbar",
    ar: "اللَّهُ أَكْبَرُ",
    translit: "Allahu Akbar",
    meaning: { en: "Allah is the Greatest", ur: "اللہ سب سے بڑا ہے" },
  },
  {
    id: "tahlil",
    ar: "لَا إِلَٰهَ إِلَّا اللَّهُ",
    translit: "La ilaha illallah",
    meaning: { en: "There is no god but Allah", ur: "اللہ کے سوا کوئی معبود نہیں" },
  },
  {
    id: "istighfar",
    ar: "أَسْتَغْفِرُ اللَّهَ",
    translit: "Astaghfirullah",
    meaning: { en: "I seek Allah's forgiveness", ur: "میں اللہ سے مغفرت مانگتا ہوں" },
  },
  {
    id: "subhanallahiwabihamdihi",
    ar: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    translit: "SubhanAllahi wa bihamdihi",
    meaning: { en: "Glory be to Allah, and praise be to Him", ur: "اللہ پاک ہے اور اسی کی تعریف ہے" },
  },
  {
    id: "hawqala",
    ar: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    translit: "La hawla wa la quwwata illa billah",
    meaning: { en: "There is no power and no strength except with Allah", ur: "اللہ کی مدد کے بغیر نہ کوئی طاقت ہے نہ قوت" },
  },
  {
    id: "salawat",
    ar: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
    translit: "Allahumma salli ala Muhammad",
    meaning: { en: "O Allah, send blessings upon Muhammad", ur: "اے اللہ! محمد ﷺ پر رحمت نازل فرما" },
  },
];

/**
 * After every obligatory prayer: SubhanAllah 33, Alhamdulillah 33, Allahu Akbar 34
 * (Sahih Muslim, Ka'b ibn 'Ujrah; hadith 1349 in our edition, Arabic edition no. 596).
 */
export const afterPrayerSteps: { id: string; target: number }[] = [
  { id: "subhanallah", target: 33 },
  { id: "alhamdulillah", target: 33 },
  { id: "allahuakbar", target: 34 },
];

/** Where the after-prayer hadith lives in src/data/hadith (looked up at build time for the link). */
export const AFTER_PRAYER_SOURCE = { book: "muslim", chapter: 5, n: 1349 } as const;

export const TARGETS = [33, 34, 99, 100, 0] as const;
