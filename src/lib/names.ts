/**
 * The 99 Names of Allah (al-Asma' al-Husna), in the order of the list in Jami' at-Tirmidhi 3507 (our edition).
 * - Arabic: copied from that hadith in src/data/hadith/tirmidhi/48.json. The edition counts "Allah" as the first
 *   name, then 98 more ending with as-Sabur. Other narrations differ slightly (e.g. some include al-Ahad).
 * - Transliterations and the short English and Urdu meanings are written by us.
 * - `quran`: a verse where the name, or the action it describes, is mentioned (checked by scripts/check-names.mjs).
 * - `hadith`: a hadith in our data that uses the name or describes the attribute (also checked).
 * ⚠ Needs scholar review (meanings, spellings and references), like other content we write.
 */
import type { HadithBookSlug } from "@/lib/hadith";

export type AllahName = {
  n: number;
  ar: string;
  translit: string;
  meaning: { en: string; ur: string };
  quran?: [surah: number, ayah: number];
  hadith?: { book: HadithBookSlug; chapter: number; n: number };
};

export const allahNames: AllahName[] = [
  { n: 1, ar: "اللَّهُ", translit: "Allah", meaning: { en: "Allah: the proper name of the One true God", ur: "اللہ: معبودِ برحق کا ذاتی نام" }, quran: [59, 22] },
  { n: 2, ar: "الرَّحْمَنُ", translit: "Ar-Rahman", meaning: { en: "The Most Merciful", ur: "بے حد رحم فرمانے والا" }, quran: [1, 3] },
  { n: 3, ar: "الرَّحِيمُ", translit: "Ar-Rahim", meaning: { en: "The Especially Merciful", ur: "نہایت مہربان" }, quran: [1, 3] },
  { n: 4, ar: "الْمَلِكُ", translit: "Al-Malik", meaning: { en: "The King", ur: "حقیقی بادشاہ" }, quran: [59, 23] },
  { n: 5, ar: "الْقُدُّوسُ", translit: "Al-Quddus", meaning: { en: "The Most Holy", ur: "ہر عیب سے پاک" }, quran: [59, 23] },
  { n: 6, ar: "السَّلاَمُ", translit: "As-Salam", meaning: { en: "The Source of Peace", ur: "سلامتی والا" }, quran: [59, 23] },
  { n: 7, ar: "الْمُؤْمِنُ", translit: "Al-Mu'min", meaning: { en: "The Giver of Security", ur: "امن دینے والا" }, quran: [59, 23] },
  { n: 8, ar: "الْمُهَيْمِنُ", translit: "Al-Muhaymin", meaning: { en: "The Guardian over all", ur: "سب کا نگہبان" }, quran: [59, 23] },
  { n: 9, ar: "الْعَزِيزُ", translit: "Al-Aziz", meaning: { en: "The Almighty", ur: "سب پر غالب" }, quran: [59, 23] },
  { n: 10, ar: "الْجَبَّارُ", translit: "Al-Jabbar", meaning: { en: "The Compeller", ur: "زبردست، سب کو اپنے حکم کے تابع رکھنے والا" }, quran: [59, 23] },
  { n: 11, ar: "الْمُتَكَبِّرُ", translit: "Al-Mutakabbir", meaning: { en: "The Supreme in Greatness", ur: "بڑائی والا" }, quran: [59, 23] },
  { n: 12, ar: "الْخَالِقُ", translit: "Al-Khaliq", meaning: { en: "The Creator", ur: "پیدا کرنے والا" }, quran: [59, 24] },
  { n: 13, ar: "الْبَارِئُ", translit: "Al-Bari'", meaning: { en: "The Maker", ur: "عدم سے وجود میں لانے والا" }, quran: [59, 24] },
  { n: 14, ar: "الْمُصَوِّرُ", translit: "Al-Musawwir", meaning: { en: "The Fashioner of forms", ur: "صورت بنانے والا" }, quran: [59, 24] },
  { n: 15, ar: "الْغَفَّارُ", translit: "Al-Ghaffar", meaning: { en: "The Ever-Forgiving", ur: "بار بار بخشنے والا" }, quran: [38, 66] },
  { n: 16, ar: "الْقَهَّارُ", translit: "Al-Qahhar", meaning: { en: "The All-Subduing", ur: "سب پر قابو رکھنے والا" }, quran: [13, 16] },
  { n: 17, ar: "الْوَهَّابُ", translit: "Al-Wahhab", meaning: { en: "The Bestower", ur: "بے حساب عطا کرنے والا" }, quran: [3, 8] },
  { n: 18, ar: "الرَّزَّاقُ", translit: "Ar-Razzaq", meaning: { en: "The Provider", ur: "رزق دینے والا" }, quran: [51, 58] },
  { n: 19, ar: "الْفَتَّاحُ", translit: "Al-Fattah", meaning: { en: "The Opener and Judge", ur: "کھولنے والا، فیصلہ فرمانے والا" }, quran: [34, 26] },
  { n: 20, ar: "الْعَلِيمُ", translit: "Al-Alim", meaning: { en: "The All-Knowing", ur: "سب کچھ جاننے والا" }, quran: [2, 32] },
  { n: 21, ar: "الْقَابِضُ", translit: "Al-Qabid", meaning: { en: "The Withholder", ur: "تنگی دینے والا" }, quran: [2, 245] },
  { n: 22, ar: "الْبَاسِطُ", translit: "Al-Basit", meaning: { en: "The Extender", ur: "کشادگی دینے والا" }, quran: [2, 245] },
  { n: 23, ar: "الْخَافِضُ", translit: "Al-Khafid", meaning: { en: "The Abaser", ur: "پست کرنے والا" } },
  { n: 24, ar: "الرَّافِعُ", translit: "Ar-Rafi'", meaning: { en: "The Exalter", ur: "بلند کرنے والا" }, quran: [6, 83] },
  { n: 25, ar: "الْمُعِزُّ", translit: "Al-Mu'izz", meaning: { en: "The Giver of honour", ur: "عزت دینے والا" }, quran: [3, 26] },
  { n: 26, ar: "الْمُذِلُّ", translit: "Al-Mudhill", meaning: { en: "The Giver of disgrace", ur: "ذلت دینے والا" }, quran: [3, 26] },
  { n: 27, ar: "السَّمِيعُ", translit: "As-Sami'", meaning: { en: "The All-Hearing", ur: "سب کچھ سننے والا" }, quran: [42, 11] },
  { n: 28, ar: "الْبَصِيرُ", translit: "Al-Basir", meaning: { en: "The All-Seeing", ur: "سب کچھ دیکھنے والا" }, quran: [42, 11] },
  { n: 29, ar: "الْحَكَمُ", translit: "Al-Hakam", meaning: { en: "The Judge", ur: "فیصلہ کرنے والا" }, quran: [6, 114] },
  { n: 30, ar: "الْعَدْلُ", translit: "Al-Adl", meaning: { en: "The Utterly Just", ur: "سراپا عدل" }, quran: [6, 115] },
  { n: 31, ar: "اللَّطِيفُ", translit: "Al-Latif", meaning: { en: "The Subtle, the Gentle", ur: "باریک بین، لطف و کرم والا" }, quran: [67, 14] },
  { n: 32, ar: "الْخَبِيرُ", translit: "Al-Khabir", meaning: { en: "The All-Aware", ur: "ہر بات سے باخبر" }, quran: [67, 14] },
  { n: 33, ar: "الْحَلِيمُ", translit: "Al-Halim", meaning: { en: "The Forbearing", ur: "بردبار" }, quran: [2, 225] },
  { n: 34, ar: "الْعَظِيمُ", translit: "Al-Azim", meaning: { en: "The Magnificent", ur: "عظمت والا" }, quran: [2, 255] },
  { n: 35, ar: "الْغَفُورُ", translit: "Al-Ghafur", meaning: { en: "The All-Forgiving", ur: "بہت بخشنے والا" }, quran: [15, 49] },
  { n: 36, ar: "الشَّكُورُ", translit: "Ash-Shakur", meaning: { en: "The Most Appreciative", ur: "قدر دان" }, quran: [35, 30] },
  { n: 37, ar: "الْعَلِيُّ", translit: "Al-Aliyy", meaning: { en: "The Most High", ur: "سب سے بلند" }, quran: [2, 255] },
  { n: 38, ar: "الْكَبِيرُ", translit: "Al-Kabir", meaning: { en: "The Most Great", ur: "سب سے بڑا" }, quran: [13, 9] },
  { n: 39, ar: "الْحَفِيظُ", translit: "Al-Hafiz", meaning: { en: "The Preserver", ur: "حفاظت کرنے والا" }, quran: [11, 57] },
  { n: 40, ar: "الْمُقِيتُ", translit: "Al-Muqit", meaning: { en: "The Sustainer", ur: "سب کو روزی اور قوت پہنچانے والا" }, quran: [4, 85] },
  { n: 41, ar: "الْحَسِيبُ", translit: "Al-Hasib", meaning: { en: "The Reckoner, the Sufficient", ur: "حساب لینے والا، کافی" }, quran: [4, 6] },
  { n: 42, ar: "الْجَلِيلُ", translit: "Al-Jalil", meaning: { en: "The Majestic", ur: "جلال والا" }, quran: [55, 27] },
  { n: 43, ar: "الْكَرِيمُ", translit: "Al-Karim", meaning: { en: "The Most Generous", ur: "کرم کرنے والا" }, quran: [82, 6] },
  { n: 44, ar: "الرَّقِيبُ", translit: "Ar-Raqib", meaning: { en: "The Watchful", ur: "نگرانی کرنے والا" }, quran: [4, 1] },
  { n: 45, ar: "الْمُجِيبُ", translit: "Al-Mujib", meaning: { en: "The Responsive", ur: "دعا قبول کرنے والا" }, quran: [11, 61] },
  { n: 46, ar: "الْوَاسِعُ", translit: "Al-Wasi'", meaning: { en: "The All-Encompassing", ur: "وسعت والا" }, quran: [2, 115] },
  { n: 47, ar: "الْحَكِيمُ", translit: "Al-Hakim", meaning: { en: "The All-Wise", ur: "حکمت والا" }, quran: [2, 32] },
  { n: 48, ar: "الْوَدُودُ", translit: "Al-Wadud", meaning: { en: "The Loving", ur: "محبت کرنے والا" }, quran: [85, 14] },
  { n: 49, ar: "الْمَجِيدُ", translit: "Al-Majeed", meaning: { en: "The All-Glorious", ur: "بزرگی والا" }, quran: [11, 73] },
  { n: 50, ar: "الْبَاعِثُ", translit: "Al-Ba'ith", meaning: { en: "The Resurrector", ur: "مُردوں کو زندہ کر کے اٹھانے والا" }, quran: [22, 7] },
  { n: 51, ar: "الشَّهِيدُ", translit: "Ash-Shahid", meaning: { en: "The Witness", ur: "ہر چیز پر گواہ" }, quran: [22, 17] },
  { n: 52, ar: "الْحَقُّ", translit: "Al-Haqq", meaning: { en: "The Truth", ur: "حق" }, quran: [22, 6] },
  { n: 53, ar: "الْوَكِيلُ", translit: "Al-Wakil", meaning: { en: "The Trustee", ur: "کارساز" }, quran: [3, 173] },
  { n: 54, ar: "الْقَوِيُّ", translit: "Al-Qawiyy", meaning: { en: "The All-Strong", ur: "بڑی قوت والا" }, quran: [42, 19] },
  { n: 55, ar: "الْمَتِينُ", translit: "Al-Matin", meaning: { en: "The Firm", ur: "نہایت مضبوط" }, quran: [51, 58] },
  { n: 56, ar: "الْوَلِيُّ", translit: "Al-Waliyy", meaning: { en: "The Protecting Friend", ur: "حمایت کرنے والا دوست" }, quran: [42, 28] },
  { n: 57, ar: "الْحَمِيدُ", translit: "Al-Hamid", meaning: { en: "The Praiseworthy", ur: "تعریف کے لائق" }, quran: [42, 28] },
  { n: 58, ar: "الْمُحْصِي", translit: "Al-Muhsi", meaning: { en: "The Counter of all things", ur: "ہر چیز کو گن رکھنے والا" }, quran: [72, 28] },
  { n: 59, ar: "الْمُبْدِئُ", translit: "Al-Mubdi'", meaning: { en: "The Originator", ur: "پہلی بار پیدا کرنے والا" }, quran: [85, 13] },
  { n: 60, ar: "الْمُعِيدُ", translit: "Al-Mu'id", meaning: { en: "The Restorer", ur: "دوبارہ پیدا کرنے والا" }, quran: [85, 13] },
  { n: 61, ar: "الْمُحْيِي", translit: "Al-Muhyi", meaning: { en: "The Giver of life", ur: "زندگی دینے والا" }, quran: [30, 50] },
  { n: 62, ar: "الْمُمِيتُ", translit: "Al-Mumit", meaning: { en: "The Bringer of death", ur: "موت دینے والا" }, quran: [57, 2] },
  { n: 63, ar: "الْحَيُّ", translit: "Al-Hayy", meaning: { en: "The Ever-Living", ur: "ہمیشہ زندہ" }, quran: [2, 255] },
  { n: 64, ar: "الْقَيُّومُ", translit: "Al-Qayyum", meaning: { en: "The Sustainer of all", ur: "سب کو قائم رکھنے والا" }, quran: [2, 255] },
  { n: 65, ar: "الْوَاجِدُ", translit: "Al-Wajid", meaning: { en: "The Finder, who lacks nothing", ur: "ہر چیز پانے والا، جسے کوئی کمی نہیں" } },
  { n: 66, ar: "الْمَاجِدُ", translit: "Al-Maajid", meaning: { en: "The Noble", ur: "شان والا" } },
  { n: 67, ar: "الْوَاحِدُ", translit: "Al-Wahid", meaning: { en: "The One", ur: "ایک، یکتا" }, quran: [13, 16] },
  { n: 68, ar: "الصَّمَدُ", translit: "As-Samad", meaning: { en: "The Eternal Refuge", ur: "بے نیاز، جس کے سب محتاج ہیں" }, quran: [112, 2] },
  { n: 69, ar: "الْقَادِرُ", translit: "Al-Qadir", meaning: { en: "The All-Capable", ur: "قدرت والا" }, quran: [6, 65] },
  { n: 70, ar: "الْمُقْتَدِرُ", translit: "Al-Muqtadir", meaning: { en: "The All-Powerful", ur: "کامل قدرت والا" }, quran: [54, 55] },
  { n: 71, ar: "الْمُقَدِّمُ", translit: "Al-Muqaddim", meaning: { en: "The One who brings forward", ur: "آگے کرنے والا" }, hadith: { book: "bukhari", chapter: 80, n: 6317 } },
  { n: 72, ar: "الْمُؤَخِّرُ", translit: "Al-Mu'akhkhir", meaning: { en: "The One who puts back", ur: "پیچھے کرنے والا" }, hadith: { book: "bukhari", chapter: 80, n: 6317 } },
  { n: 73, ar: "الأَوَّلُ", translit: "Al-Awwal", meaning: { en: "The First", ur: "سب سے پہلا" }, quran: [57, 3] },
  { n: 74, ar: "الآخِرُ", translit: "Al-Akhir", meaning: { en: "The Last", ur: "سب سے آخر" }, quran: [57, 3] },
  { n: 75, ar: "الظَّاهِرُ", translit: "Az-Zahir", meaning: { en: "The Manifest", ur: "ظاہر" }, quran: [57, 3] },
  { n: 76, ar: "الْبَاطِنُ", translit: "Al-Batin", meaning: { en: "The Hidden", ur: "پوشیدہ" }, quran: [57, 3] },
  { n: 77, ar: "الْوَالِي", translit: "Al-Wali", meaning: { en: "The Governor", ur: "سب کا والی" }, quran: [13, 11] },
  { n: 78, ar: "الْمُتَعَالِي", translit: "Al-Muta'ali", meaning: { en: "The Supremely Exalted", ur: "سب سے برتر" }, quran: [13, 9] },
  { n: 79, ar: "الْبَرُّ", translit: "Al-Barr", meaning: { en: "The Source of all goodness", ur: "بڑا محسن" }, quran: [52, 28] },
  { n: 80, ar: "التَّوَّابُ", translit: "At-Tawwab", meaning: { en: "The Accepter of repentance", ur: "توبہ قبول کرنے والا" }, quran: [2, 37] },
  { n: 81, ar: "الْمُنْتَقِمُ", translit: "Al-Muntaqim", meaning: { en: "The Avenger", ur: "بدلہ لینے والا" }, quran: [32, 22] },
  { n: 82, ar: "الْعَفُوُّ", translit: "Al-Afuww", meaning: { en: "The Pardoner", ur: "معاف کرنے والا" }, quran: [4, 43] },
  { n: 83, ar: "الرَّءُوفُ", translit: "Ar-Ra'uf", meaning: { en: "The Most Kind", ur: "نہایت شفیق" }, quran: [2, 143] },
  { n: 84, ar: "مَالِكُ الْمُلْكِ", translit: "Malik al-Mulk", meaning: { en: "Owner of all sovereignty", ur: "ساری بادشاہی کا مالک" }, quran: [3, 26] },
  { n: 85, ar: "ذُو الْجَلاَلِ وَالإِكْرَامِ", translit: "Dhul-Jalali wal-Ikram", meaning: { en: "Lord of majesty and honour", ur: "جلال اور عزت والا" }, quran: [55, 27] },
  { n: 86, ar: "الْمُقْسِطُ", translit: "Al-Muqsit", meaning: { en: "The Equitable", ur: "انصاف کرنے والا" }, quran: [3, 18] },
  { n: 87, ar: "الْجَامِعُ", translit: "Al-Jami'", meaning: { en: "The Gatherer", ur: "جمع کرنے والا" }, quran: [3, 9] },
  { n: 88, ar: "الْغَنِيُّ", translit: "Al-Ghaniyy", meaning: { en: "The Self-Sufficient", ur: "بے نیاز" }, quran: [35, 15] },
  { n: 89, ar: "الْمُغْنِي", translit: "Al-Mughni", meaning: { en: "The Enricher", ur: "غنی کرنے والا" }, quran: [9, 28] },
  { n: 90, ar: "الْمَانِعُ", translit: "Al-Mani'", meaning: { en: "The Preventer", ur: "روکنے والا" } },
  { n: 91, ar: "الضَّارُّ", translit: "Ad-Darr", meaning: { en: "The One who decrees harm", ur: "نقصان کا مالک" }, quran: [48, 11] },
  { n: 92, ar: "النَّافِعُ", translit: "An-Nafi'", meaning: { en: "The One who brings benefit", ur: "نفع پہنچانے والا" }, quran: [48, 11] },
  { n: 93, ar: "النُّورُ", translit: "An-Nur", meaning: { en: "The Light", ur: "نور" }, quran: [24, 35] },
  { n: 94, ar: "الْهَادِي", translit: "Al-Hadi", meaning: { en: "The Guide", ur: "ہدایت دینے والا" }, quran: [25, 31] },
  { n: 95, ar: "الْبَدِيعُ", translit: "Al-Badi'", meaning: { en: "The Originator without model", ur: "بے مثال پیدا کرنے والا" }, quran: [2, 117] },
  { n: 96, ar: "الْبَاقِي", translit: "Al-Baqi", meaning: { en: "The Everlasting", ur: "ہمیشہ باقی رہنے والا" }, quran: [55, 27] },
  { n: 97, ar: "الْوَارِثُ", translit: "Al-Warith", meaning: { en: "The Inheritor", ur: "سب کا وارث" }, quran: [15, 23] },
  { n: 98, ar: "الرَّشِيدُ", translit: "Ar-Rashid", meaning: { en: "The Guide to the right way", ur: "سیدھی راہ دکھانے والا" } },
  { n: 99, ar: "الصَّبُورُ", translit: "As-Sabur", meaning: { en: "The Most Patient", ur: "بڑا صبر کرنے والا" }, hadith: { book: "bukhari", chapter: 78, n: 6099 } },
];

/** The hadith that lists the names (graded weak in our data) and a sahih hadith on their virtue. */
export const NAMES_LIST_SOURCE = { book: "tirmidhi", chapter: 48, n: 3507 } as const;
export const NAMES_VIRTUE_SOURCE = { book: "bukhari", chapter: 97, n: 7392 } as const;
