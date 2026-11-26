/**
 * Roman Urdu support for search (docs/PLAN.md, "Search design").
 *
 * Roman Urdu has no standard spelling, so each word is reduced to a key (romanKey) that common variants share
 * (namaaz/namaz, hadees/hadith, wuzu/wazu/vuzu, shaitan/shaytan), then looked up in a small dictionary of
 * religious and everyday terms that maps it to Urdu script, Arabic and English. Unknown words of 5+ letters may
 * match a dictionary word one typo away.
 *
 * The dictionary is our own vocabulary list (not religious content), but its Urdu and Arabic spellings
 * should be checked by the client's reviewer. Add words freely: one line each, alternatives separated by "|".
 */

export type RomanEntry = { roman: string[]; ur: string[]; ar: string[]; en: string[] };

// [Roman spellings, Urdu, Arabic, English]. Arabic is left empty where every short form would match unrelated
// words (e.g. ام "mother" inside امر). English may hold phrases. Avoid Urdu forms that normalise to another
// word: ے and ی both become ي, so روزے (fasts) would also match روزی (provision).
const TERMS: [string, string, string, string][] = [
  // Worship
  ["namaz|namaaz|nimaz|salah|salat|salaat", "نماز", "صلاة", "prayer"],
  ["roza|rozah|roze|rozay|rozon|sawm|saum|siyam", "روزہ|روزوں", "صوم|صيام", "fast|fasting"],
  ["zakat|zakaat|zakah|zakaah", "زکوٰۃ|زکاۃ|زکات", "زكاة", "zakah|zakat|alms"],
  ["hajj|haj", "حج", "الحج", "hajj|pilgrimage"],
  ["umrah|umra", "عمرہ", "عمرة", "umrah"],
  ["wuzu|wudu|wazu|vuzu|wudhu", "وضو", "وضوء|توضأ", "ablution|wudu"],
  ["ghusl|gusal", "غسل", "غسل|اغتسل", "bath|ghusl"],
  ["tayammum|tayamum", "تیمم", "تيمم", "tayammum|dry ablution"],
  ["azan|azaan|adhan|aazan", "اذان", "أذان|الأذان|مؤذن", "adhan|call to prayer"],
  ["iqamat|iqamah|takbeer|takbir", "اقامت|تکبیر", "إقامة|تكبير", "iqamah|takbir"],
  ["sajda|sajdah|sujood|sujud", "سجدہ|سجدے", "سجد|سجود", "prostrate|prostration"],
  ["ruku|rukoo", "رکوع", "ركوع|ركع", "bow|bowing"],
  ["dua|duaa|dua'a", "دعا", "دعاء|دعا", "supplication|supplicate|invoke"],
  ["zikr|dhikr|zikar", "ذکر", "ذكر", "remembrance|remember"],
  ["tilawat|tilawah", "تلاوت", "تلاوة|تلا", "recite|recitation"],
  ["durood|darood|salawat", "درود", "صلى عليه", "blessings|invoke blessings"],
  ["tahajjud|tahajud", "تہجد", "تهجد", "tahajjud|night prayer"],
  ["witr|vitr", "وتر", "الوتر", "witr"],
  ["jumma|juma|jumuah|jummah", "جمعہ", "الجمعة", "friday|jumuah"],
  ["fajr|fajar", "فجر", "الفجر", "fajr|dawn"],
  ["zuhr|zohar|zohr|dhuhr", "ظہر", "الظهر", "dhuhr|noon"],
  ["asr|asar", "عصر", "العصر", "asr|afternoon"],
  ["maghrib|magrib", "مغرب", "المغرب", "maghrib|sunset"],
  ["isha|esha", "عشاء", "العشاء", "isha"],
  ["ramzan|ramadan|ramazan", "رمضان", "رمضان", "ramadan"],
  ["sehri|sahri|suhoor|suhur|sahoor", "سحری", "سحور|تسحر", "suhur|pre-dawn meal"],
  ["iftar|iftaar", "افطار", "إفطار|أفطر", "iftar|break the fast"],
  ["itikaf|aitkaf|etikaf", "اعتکاف", "اعتكاف", "itikaf|seclusion"],
  ["eid|eed", "عید", "العيد", "eid"],
  ["qurbani|udhiya|uzhiya", "قربانی", "أضحية|ضحى", "sacrifice"],
  ["qibla|qiblah", "قبلہ", "القبلة", "qiblah|qibla"],
  ["kaaba|kaba|kabah", "کعبہ", "الكعبة", "kaaba|ka'bah"],
  ["masjid|maseet", "مسجد", "مسجد", "mosque"],
  ["imam", "امام", "إمام", "imam"],
  ["tauheed|tawheed|tawhid|tohid", "توحید", "توحيد", "oneness|tawhid"],
  ["kalma|kalima|shahadah", "کلمہ|شہادت", "شهادة|لا إله إلا الله", "testimony|testify"],
  ["quran|qur'an|koran|kuran", "قرآن", "القرآن", "quran|qur'an"],
  ["hadees|hadith|hadis", "حدیث", "حديث", "hadith"],
  ["sunnat|sunnah|sunat", "سنت", "سنة|السنة", "sunnah"],
  ["farz|fard|faraiz|fariza", "فرض|فرائض", "فرض|فريضة", "obligatory|obligation"],
  ["wajib|waajib", "واجب", "واجب", "obligatory|wajib"],
  ["nafl|nawafil|nafil", "نفل|نوافل", "نافلة|تطوع", "voluntary|supererogatory"],
  ["rakat|rakaat|rakah|rakaah", "رکعت|رکعات", "ركعة|ركعتين|ركعات", "rak'ah|rak'ahs|rak'at"],
  ["khutba|khutbah", "خطبہ", "خطبة|خطب", "sermon|khutbah"],
  ["janaza|janazah|janazay", "جنازہ|جنازے", "جنازة|الجنازة", "funeral|funeral prayer"],
  ["kafan", "کفن", "كفن", "shroud"],
  ["waqt|waqat|auqat", "وقت|اوقات", "وقت|مواقيت", "time|times"],
  ["deen|deeni", "دین", "الدين|دين", "religion"],
  // Belief and the unseen
  ["allah", "اللہ", "الله", "allah"],
  ["nabi|nabee", "نبی", "النبي|نبي", "prophet"],
  ["rasool|rasul", "رسول", "رسول", "messenger"],
  ["imaan|iman|eman", "ایمان", "إيمان|الإيمان", "faith|belief|believe"],
  ["islam", "اسلام", "الإسلام", "islam"],
  ["momin|mumin|mominon", "مومن|مومنوں", "مؤمن|المؤمنين", "believer|believers"],
  ["kufr|kufar|kafir|kaafir", "کفر|کافر", "كفر|كافر", "disbelief|disbeliever"],
  ["shirk|mushrik", "شرک|مشرک", "شرك|مشرك", "polytheism|associate"],
  ["munafiq|munafik|nifaq", "منافق|نفاق", "منافق|نفاق", "hypocrite|hypocrisy"],
  ["jannat|jannah|janat|behisht", "جنت|بہشت", "الجنة", "paradise"],
  ["jahannam|jahanum|dozakh|dozak", "جہنم|دوزخ", "جهنم|النار", "hell|hellfire"],
  ["qiyamat|qayamat|qiyamah", "قیامت", "القيامة", "resurrection|day of judgement|day of judgment"],
  ["akhirat|aakhirat|akhirah", "آخرت", "الآخرة", "hereafter"],
  ["dunya|duniya|dunia", "دنیا", "الدنيا", "world|worldly"],
  ["maut|mout|wafat", "موت|وفات", "الموت", "death|die"],
  ["qabar|qabr|kabar", "قبر", "قبر|القبور", "grave"],
  ["farishta|farishte|farishtay|malaika", "فرشتہ|فرشتے", "ملائكة|الملائكة", "angel|angels"],
  ["shaitan|shaytan|shetan|iblees|iblis", "شیطان|ابلیس", "شيطان|إبليس", "satan|devil"],
  ["jinn|jinnat", "جنات", "الجن", "jinn"],
  ["taqdeer|taqdir|qadr", "تقدیر", "القدر", "decree|destiny"],
  ["wahi|wahee|wahy", "وحی", "الوحي|أوحى", "revelation|reveal"],
  ["mojza|mujiza|moajza", "معجزہ", "آية|آيات", "miracle|sign"],
  // Character and conduct
  ["sabr|sabar", "صبر", "صبر|الصبر", "patience|patient"],
  ["shukr|shukar", "شکر", "شكر", "grateful|gratitude|thank"],
  ["tauba|toba|tawbah|taubah", "توبہ", "توبة|تاب", "repent|repentance"],
  ["maghfirat|maghfirah|bakhshish|maafi|mafi", "مغفرت|بخشش|معافی", "مغفرة|غفر|استغفر", "forgive|forgiveness"],
  ["rehmat|rahmat|rahma|rahmah", "رحمت", "رحمة", "mercy|merciful"],
  ["niyyat|niyat|neeyat|niyyah|niyya", "نیت|نیتوں", "نية|النيات", "intention|intentions"],
  ["ikhlas|ikhlaas", "اخلاص", "إخلاص|مخلص", "sincere|sincerity"],
  ["taqwa|taqwah|parhezgari", "تقویٰ|پرہیزگاری", "التقوى|اتقوا", "piety|righteous|fear allah"],
  ["akhlaq|ikhlaq|akhlaaq", "اخلاق", "خلق|الخلق", "character|manners"],
  ["adab", "ادب", "", "manners|etiquette"],
  ["sach|sachai|sacchai|sidq", "سچ|سچائی", "صدق", "truth|truthful|truthfulness"],
  ["jhoot|jhoota|jhut|kizb", "جھوٹ", "كذب|الكذب", "lie|liar|lying"],
  ["ghibat|gheebat|gheebah|ghibah", "غیبت", "غيبة|الغيبة", "backbiting|backbite"],
  ["hasad", "حسد", "حسد|الحسد", "envy|jealousy"],
  ["takabbur|ghuroor|ghurur|kibr", "تکبر|غرور", "الكبر|متكبر", "arrogance|arrogant|pride"],
  ["ghussa|gussa|ghusa", "غصہ|غصے", "غضب", "anger|angry"],
  ["insaf|adl|adal", "انصاف|عدل", "العدل|عدل", "justice|just"],
  ["zulm|zulum|zalim", "ظلم|ظالم", "ظلم|الظلم", "oppression|wrongdoing|unjust"],
  ["amanat|amaanat", "امانت", "أمانة|الأمانة", "trust|trustworthy"],
  ["waada|wada|waadah", "وعدہ", "وعد", "promise"],
  ["qasam|kasam", "قسم", "يمين|حلف", "oath|swear"],
  ["gunah|gunaah|gunahon", "گناہ|گناہوں", "ذنب|إثم", "sin|sins"],
  ["neki|naiki|nekiyan", "نیکی|نیکیاں", "حسنة|الحسنات", "good deed|good deeds|righteousness"],
  ["ajr|sawab|sawaab|thawab", "اجر|ثواب", "أجر|ثواب", "reward"],
  ["azab|azaab", "عذاب", "عذاب", "punishment|torment"],
  ["haya|hayaa|sharm", "حیا|شرم", "الحياء", "modesty|shyness"],
  ["salam|salaam|assalamualaikum", "سلام", "السلام", "peace|greeting|salam"],
  // Family and society
  ["walidain|waldain|waledain", "والدین", "الوالدين|والديه", "parents"],
  ["maa|ammi|walida|waalida", "ماں|والدہ", "", "mother"],
  ["baap|abba|walid|waalid", "باپ|والد", "", "father"],
  ["aulad|olad|aulaad", "اولاد", "أولاد|ولد", "children|child|offspring"],
  ["beti|betiyan", "بیٹی|بیٹیاں", "بنت|بنات", "daughter|daughters"],
  ["beta", "بیٹا|بیٹے", "", "son|sons"],
  ["biwi|bivi|zauja|zoja", "بیوی|بیویاں", "زوجة|امرأته", "wife|wives"],
  ["shohar|shauhar|khawind", "شوہر|خاوند", "زوجها", "husband"],
  ["nikah|nikaah|shadi|shaadi", "نکاح|شادی", "نكاح|تزوج", "marriage|marry"],
  ["talaq|talaaq", "طلاق", "طلاق|الطلاق", "divorce"],
  ["aurat|orat|khawateen", "عورت|عورتوں|خواتین", "امرأة|النساء", "woman|women"],
  ["mard|mardon", "مرد|مردوں", "رجل|الرجال", "men"],
  ["rishtedar|rishtedaar|qarabat", "رشتہ دار|قرابت", "الرحم|ذوي القربى", "kin|kinship|relatives"],
  ["padosi|parosi|pardosi|hamsaya", "پڑوسی|ہمسایہ", "الجار|جاره", "neighbour|neighbor"],
  ["mehman|mehmaan", "مہمان", "ضيف|الضيف", "guest"],
  ["yateem|yatim|yatama", "یتیم|یتیموں", "يتيم|اليتامى", "orphan|orphans"],
  ["miskeen|miskin|masakeen", "مسکین|مسکینوں", "مسكين|المساكين", "needy|poor"],
  ["ghareeb|garib|gareeb|faqeer|faqir", "غریب|فقیر", "فقير|الفقراء", "poor|poverty"],
  ["sadqa|sadqah|sadaqah|sadaqa|khairat", "صدقہ|خیرات", "صدقة", "charity|sadaqah"],
  ["ummat|ummah|umat", "امت", "أمة|أمتي", "ummah|nation|community"],
  ["sahaba|sahabi|sahabah", "صحابہ|صحابی", "أصحاب|صحابي", "companions|companion"],
  ["ansar|ansaar", "انصار", "الأنصار", "ansar|helpers"],
  ["muhajir|muhajireen|muhajirin", "مہاجر|مہاجرین", "المهاجرين|المهاجر", "emigrant|emigrants|muhajir"],
  ["hijrat|hijrah|hijra", "ہجرت", "هجرة|هاجر", "emigration|emigrate|migration"],
  ["jihad|jehad", "جہاد", "جهاد|الجهاد", "jihad|striving|fight in the cause"],
  ["shaheed|shahid|shuhada", "شہید|شہداء", "شهيد|الشهداء", "martyr|martyrs"],
  // Daily life
  ["khana|khaana", "کھانا", "طعام|أكل", "food|eat|eating"],
  ["pani|paani", "پانی", "ماء|الماء", "water"],
  ["taharat|tahaarat|pakizgi|safai|safaai", "طہارت|پاکیزگی|صفائی", "طهارة|الطهور", "purity|purification|clean"],
  ["bimari|beemari|marz|mareez", "بیماری|مرض|مریض", "مرض|مريض", "sick|sickness|illness|disease"],
  ["ilaj|shifa|dawa", "علاج|شفا|دوا", "شفاء|دواء", "cure|medicine|heal"],
  ["khwab|khawab|khaab", "خواب", "رؤيا|الرؤيا|منام", "dream|vision"],
  ["safar|musafir", "سفر|مسافر", "سفر|مسافر", "travel|journey|traveller|traveler"],
  ["tijarat|karobar|kaarobaar", "تجارت|کاروبار", "تجارة|البيع", "trade|business|sale"],
  ["sood|sud|riba", "سود", "الربا|ربا", "interest|usury|riba"],
  ["haram|haraam", "حرام", "حرام", "forbidden|unlawful"],
  ["halal|halaal", "حلال", "حلال", "lawful|permissible"],
  ["maal|daulat|dolat", "مال|دولت", "مال|المال", "wealth|property"],
  ["ilm|ilam", "علم", "العلم|علم", "knowledge"],
  ["izzat|izat", "عزت", "عز|العزة", "honour|honor|dignity"],
  ["kapre|kapde|libas|libaas", "کپڑے|لباس", "ثوب|لباس", "clothes|garment|clothing"],
  ["sharab|sharaab", "شراب", "خمر|الخمر", "wine|intoxicant|alcohol"],
  ["jua|juwa", "جوا|جوئے", "الميسر", "gambling"],
  // People of the Quran and Sunnah
  ["muhammad|mohammad|muhammed", "محمد", "محمد", "muhammad"],
  ["ibrahim|ibraheem|ibraaheem", "ابراہیم", "إبراهيم", "abraham|ibrahim"],
  ["musa|moosa|musaa", "موسیٰ|موسی", "موسى", "moses|musa"],
  ["isa|eesa|esa", "عیسیٰ|عیسی", "عيسى", "jesus|isa"],
  ["nuh|nooh", "نوح", "نوح", "noah|nuh"],
  ["yusuf|yousuf|yousaf", "یوسف", "يوسف", "joseph|yusuf"],
  ["maryam|mariam", "مریم", "مريم", "mary|maryam"],
  ["adam|aadam", "آدم", "آدم", "adam"],
  ["dawood|dawud|daud", "داؤد|داود", "داود", "david|dawud"],
  ["sulaiman|suleman|sulayman", "سلیمان", "سليمان", "solomon|sulayman"],
  ["yunus|younus", "یونس", "يونس", "jonah|yunus"],
  ["luqman|lukman", "لقمان", "لقمان", "luqman"],
  ["aisha|ayesha|aishah", "عائشہ", "عائشة", "aisha|aishah"],
  ["fatima|fatimah", "فاطمہ", "فاطمة", "fatimah|fatima"],
  ["khadija|khadijah", "خدیجہ", "خديجة", "khadijah|khadija"],
  ["abubakr|abubakar", "ابوبکر|ابو بکر", "أبو بكر|أبي بكر", "abu bakr"],
  ["usman|uthman|osman", "عثمان", "عثمان", "uthman"],
];

/**
 * Common Roman Urdu grammar words, dropped from a query once it is recognised as Roman Urdu
 * (some are also English words, so they are only dropped in that case).
 */
const STOPWORDS = new Set(
  "ka ki ke ko se me mein main mai aur or hai hain ha tha thi the kya kia kaise kese kyun kyon jo ye yeh wo woh is us un in par pe per bhi nahi nahin na ek liye lie wala wali wale karna karne kar kare karo hota hoti hote baare bare mutalliq bare barey wale hum ham aap tum".split(
    " ",
  ),
);

/**
 * Reduces a Roman Urdu word to a key shared by its usual spellings:
 * dh/zh→z, th→s, gh→g, q→k, w→v; au→o, ou→u, ai/ay/ey→e (not at the start: aisha ≠ isha); then e→i, o→u; repeated letters collapsed;
 * a final h dropped (sunnah → sunna).
 */
export function romanKey(word: string): string {
  let k = word.toLowerCase().replace(/[^a-z]/g, "");
  k = k
    .replace(/dh|zh/g, "z")
    .replace(/th/g, "s")
    .replace(/gh/g, "g")
    .replace(/q/g, "k")
    .replace(/w/g, "v")
    .replace(/au/g, "o")
    .replace(/ou/g, "u")
    .replace(/(.)(ai|ay|ey)/g, "$1e")
    .replace(/e/g, "i")
    .replace(/o/g, "u")
    .replace(/(.)\1+/g, "$1");
  if (k.length > 3 && k.endsWith("h")) k = k.slice(0, -1);
  return k;
}

const split = (s: string) => (s ? s.split("|") : []);
export const romanEntries: RomanEntry[] = TERMS.map(([roman, ur, ar, en]) => ({
  roman: split(roman),
  ur: split(ur),
  ar: split(ar),
  en: split(en),
}));

const byKey = new Map<string, RomanEntry>();
for (const entry of romanEntries) {
  for (const r of entry.roman) {
    const key = romanKey(r);
    if (!byKey.has(key)) byKey.set(key, entry);
  }
}

/** Damerau–Levenshtein distance, stopping early above 1. */
function withinOne(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (i === a.length || i === b.length) return Math.abs(a.length - b.length) <= 1;
  const rest = (x: number, y: number) => a.slice(x) === b.slice(y);
  return (
    rest(i + 1, i + 1) || // substitution
    rest(i + 1, i) || // deletion
    rest(i, i + 1) || // insertion
    (a[i] === b[i + 1] && a[i + 1] === b[i] && rest(i + 2, i + 2)) // transposition
  );
}

/** Dictionary entry for a Latin word: exact key, else (for 5+ letters) one typo away. */
export function lookupRoman(word: string): RomanEntry | undefined {
  const key = romanKey(word);
  if (key.length < 2) return undefined;
  const exact = byKey.get(key);
  if (exact || key.length < 5) return exact;
  for (const [k, entry] of byKey) if (k.length >= 4 && withinOne(key, k)) return entry;
  return undefined;
}

export function isRomanStopword(word: string): boolean {
  return STOPWORDS.has(word);
}
