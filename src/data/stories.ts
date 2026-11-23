/**
 * Daily feed content. Ayah stories pull their Arabic + translation from the bundled
 * Quran files, so only the reference is stored here. Hadith carry their collection
 * reference so readers can verify them.
 */
export type StoryItem =
  | { kind: "ayah"; ref: [number, number]; theme: string }
  | { kind: "text"; title: string; body: string; arabic?: string; source?: string }
  | { kind: "letter"; glyph: string; title: string; body: string; example?: string };

export type CategoryId =
  | "ayah"
  | "hadith"
  | "prophets"
  | "life"
  | "aqeedah"
  | "fiqh"
  | "qaida"
  | "history";

export interface StoryCategory {
  id: CategoryId;
  title: string;
  short: string;
  tagline: string;
  glyph: string;
  perDay: number;
  note?: string;
  items: StoryItem[];
}

const ayah = (s: number, a: number, theme: string): StoryItem => ({ kind: "ayah", ref: [s, a], theme });
const t = (title: string, body: string, source?: string, arabic?: string): StoryItem => ({
  kind: "text",
  title,
  body,
  ...(source ? { source } : {}),
  ...(arabic ? { arabic } : {}),
});
const l = (glyph: string, title: string, body: string, example?: string): StoryItem => ({
  kind: "letter",
  glyph,
  title,
  body,
  ...(example ? { example } : {}),
});

export const CATEGORIES: StoryCategory[] = [
  {
    id: "ayah",
    title: "Ayah of the Day",
    short: "Ayah",
    tagline: "Words from the Quran to carry with you",
    glyph: "ق",
    perDay: 4,
    items: [
      ayah(94, 5, "Hope"), ayah(94, 6, "Hope"), ayah(2, 286, "Ease"), ayah(2, 152, "Remembrance"),
      ayah(2, 153, "Patience"), ayah(13, 28, "Peace of heart"), ayah(39, 53, "Mercy"), ayah(65, 3, "Trust"),
      ayah(2, 186, "Allah is near"), ayah(14, 7, "Gratitude"), ayah(3, 139, "Strength"), ayah(40, 60, "Dua"),
      ayah(93, 3, "Comfort"), ayah(93, 5, "Hope"), ayah(29, 69, "Effort"), ayah(16, 97, "A good life"),
      ayah(49, 13, "Equality"), ayah(17, 23, "Parents"), ayah(31, 18, "Humility"), ayah(3, 159, "Gentleness"),
      ayah(20, 114, "Knowledge"), ayah(50, 16, "Closeness"), ayah(57, 4, "He is with you"), ayah(2, 216, "Wisdom"),
      ayah(12, 87, "Never lose hope"), ayah(25, 63, "Character"), ayah(41, 34, "Kindness"), ayah(3, 8, "Dua"),
      ayah(2, 201, "Dua"), ayah(33, 41, "Remembrance"), ayah(9, 40, "Do not grieve"), ayah(64, 11, "Qadr"),
      ayah(67, 2, "Purpose"), ayah(112, 1, "Oneness"), ayah(103, 3, "Time"), ayah(55, 13, "Blessings"),
    ],
  },
  {
    id: "hadith",
    title: "Hadith",
    short: "Hadith",
    tagline: "Sayings of the Prophet ﷺ",
    glyph: "ح",
    perDay: 3,
    items: [
      t("Intentions", "Actions are judged by intentions, and every person will get what they intended.", "Sahih al-Bukhari 1 · Sahih Muslim 1907"),
      t("Love for your brother", "None of you truly believes until he loves for his brother what he loves for himself.", "Sahih al-Bukhari 13 · Sahih Muslim 45"),
      t("The best of you", "The best of you are those who learn the Quran and teach it.", "Sahih al-Bukhari 5027"),
      t("Speak good", "Whoever believes in Allah and the Last Day, let him speak good or remain silent.", "Sahih al-Bukhari 6018 · Sahih Muslim 47"),
      t("True strength", "The strong person is not the one who overpowers others. The strong one is he who controls himself when angry.", "Sahih al-Bukhari 6114 · Sahih Muslim 2609"),
      t("A smile", "Your smiling in the face of your brother is charity.", "Jami' at-Tirmidhi 1956"),
      t("Make it easy", "Make things easy and do not make them difficult. Give glad tidings and do not drive people away.", "Sahih al-Bukhari 69"),
      t("Small but steady", "The most beloved deeds to Allah are those done consistently, even if they are small.", "Sahih al-Bukhari 6464 · Sahih Muslim 783"),
      t("Hearts and deeds", "Allah does not look at your appearance or your wealth, but He looks at your hearts and your deeds.", "Sahih Muslim 2564"),
      t("Purity", "Purity is half of faith.", "Sahih Muslim 223"),
      t("Path of knowledge", "Whoever follows a path seeking knowledge, Allah makes easy for him a path to Paradise.", "Sahih Muslim 2699"),
      t("Charity", "Charity does not decrease wealth.", "Sahih Muslim 2588"),
      t("Heavy on the scale", "Two phrases are light on the tongue, heavy on the scale and beloved to the Most Merciful: SubhanAllahi wa bihamdihi, SubhanAllahil-'Azeem.", "Sahih al-Bukhari 6406 · Sahih Muslim 2694", "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ"),
      t("Thank people", "Whoever does not thank people has not thanked Allah.", "Sunan Abi Dawud 4811 · Jami' at-Tirmidhi 1954"),
      t("Best character", "The best among you are those with the best character.", "Sahih al-Bukhari 3559"),
      t("A traveler", "Be in this world as if you were a stranger or a traveler.", "Sahih al-Bukhari 6416"),
      t("Erase the bad", "Fear Allah wherever you are, follow a bad deed with a good one and it will erase it, and treat people with good character.", "Jami' at-Tirmidhi 1987"),
      t("Relieve hardship", "Whoever relieves a believer of a hardship of this world, Allah will relieve him of a hardship on the Day of Resurrection.", "Sahih Muslim 2699"),
      t("Sincerity", "The religion is sincerity (naseehah).", "Sahih Muslim 55"),
      t("Your mother", "A man asked: who most deserves my good company? He ﷺ said: your mother — three times — then your father.", "Sahih al-Bukhari 5971 · Sahih Muslim 2548"),
      t("Serve people", "Feed the hungry, visit the sick, and set the captive free.", "Sahih al-Bukhari 5649"),
    ],
  },
  {
    id: "prophets",
    title: "Prophets",
    short: "Prophets",
    tagline: "Facts about the messengers of Allah",
    glyph: "ن",
    perDay: 3,
    items: [
      t("25 in the Quran", "The Quran mentions 25 prophets by name — from Adam to Muhammad ﷺ. Many more were sent to every nation.", "Quran 16:36"),
      t("Adam (AS)", "The first human and the first prophet. Allah taught him the names of all things.", "Quran 2:31"),
      t("Idris (AS)", "One of the earliest prophets. Allah says: \"We raised him to a high station.\"", "Quran 19:57"),
      t("Nuh (AS)", "He called his people to Allah for 950 years, then built the Ark by Allah's command.", "Quran 29:14"),
      t("Hud & Salih (AS)", "Hud was sent to the people of 'Aad, and Salih to Thamud, who were tested with the she-camel.", "Quran 7:65–79"),
      t("Ibrahim (AS)", "Called Khalilullah — the close friend of Allah. With his son Ismail he raised the foundations of the Kaaba.", "Quran 4:125 · 2:127"),
      t("Ismail (AS)", "The well of Zamzam sprang up for him and his mother Hajar. He is an ancestor of Prophet Muhammad ﷺ.", "Sahih al-Bukhari 3364"),
      t("Lut (AS)", "The nephew of Ibrahim (AS), sent to call his people away from shameful deeds.", "Quran 29:26"),
      t("Yusuf (AS)", "His story is called \"the best of stories\". He forgave his brothers saying: \"No blame upon you today.\"", "Quran 12:3 · 12:92"),
      t("Shu'aib (AS)", "Sent to Madyan, he told his people to give full measure and weight, and never cheat in trade.", "Quran 11:84–85"),
      t("Ayyub (AS)", "The example of patience. Allah says: \"Indeed, We found him patient. An excellent servant.\"", "Quran 38:44"),
      t("Musa (AS)", "The prophet named most often in the Quran. Allah spoke to him directly, so he is called Kalimullah.", "Quran 4:164"),
      t("Dawud (AS)", "Given the Zabur (Psalms). The mountains and birds glorified Allah with him, and iron was made soft for him.", "Quran 4:163 · 34:10"),
      t("Sulaiman (AS)", "He understood the speech of birds and ants, and the wind and jinn were made to serve him.", "Quran 27:16–19"),
      t("Yunus (AS)", "Inside the whale he prayed: \"There is no god but You, glory be to You, I was among the wrongdoers.\"", "Quran 21:87", "لَّآ إِلَٰهَ إِلَّآ أَنتَ سُبْحَٰنَكَ إِنِّى كُنتُ مِنَ ٱلظَّٰلِمِينَ"),
      t("Zakariyya & Yahya (AS)", "Zakariyya prayed in old age and was given Yahya — a name given to no one before him.", "Quran 19:2–7"),
      t("Isa (AS)", "Born to Maryam without a father, like Adam was created without parents. Maryam is the only woman named in the Quran.", "Quran 3:59"),
      t("Muhammad ﷺ", "The Seal of the Prophets, sent as a mercy to all the worlds.", "Quran 33:40 · 21:107"),
    ],
  },
  {
    id: "life",
    title: "Way of Life",
    short: "Life",
    tagline: "Small sunnahs for every day",
    glyph: "س",
    perDay: 3,
    items: [
      t("Before you eat", "Say Bismillah, eat with your right hand, and eat from what is in front of you.", "Sahih al-Bukhari 5376"),
      t("Drink calmly", "The Prophet ﷺ would breathe three times while drinking — outside the cup.", "Sahih Muslim 2028"),
      t("Spread salam", "Shall I tell you something that will make you love one another? Spread salam among yourselves.", "Sahih Muslim 54"),
      t("Before sleep", "Sleep on your right side, and recite Ayat al-Kursi — a protector stays with you until morning.", "Sahih al-Bukhari 247 · 2311"),
      t("The miswak", "Were it not a burden on my Ummah, I would have ordered them to use the miswak before every prayer.", "Sahih al-Bukhari 887"),
      t("One third", "Fill one third of the stomach with food, one third with drink, and leave one third for air.", "Jami' at-Tirmidhi 2380"),
      t("Family ties", "Whoever wants his provision increased and his life extended should keep ties with his relatives.", "Sahih al-Bukhari 5986"),
      t("Clear the path", "Removing something harmful from the road is a branch of faith.", "Sahih Muslim 35"),
      t("Honest trade", "The truthful, trustworthy merchant will be with the prophets, the truthful and the martyrs.", "Jami' at-Tirmidhi 1209"),
      t("Don't overdo it", "Eat and drink, but do not be excessive. Indeed, He does not like those who waste.", "Quran 7:31"),
      t("Kindness to animals", "A man gave water to a thirsty dog, so Allah thanked him and forgave him.", "Sahih al-Bukhari 2363"),
      t("Start with Fajr", "Whoever prays Fajr is under the protection of Allah.", "Sahih Muslim 657"),
      t("Say thank you well", "When someone does you a favour, say \"JazakAllahu khayran\" — you have praised them well.", "Jami' at-Tirmidhi 2035", "جَزَاكَ ٱللَّهُ خَيْرًا"),
      t("When you sneeze", "Say Alhamdulillah. The one who hears replies: Yarhamuk-Allah (may Allah have mercy on you).", "Sahih al-Bukhari 6224"),
      t("Look your best", "Allah is beautiful and loves beauty. Keep clean and dress neatly.", "Sahih Muslim 91"),
      t("Visit the sick", "Visiting the sick is one of the rights a Muslim has over another.", "Sahih al-Bukhari 1240"),
    ],
  },
  {
    id: "aqeedah",
    title: "Aqeedah",
    short: "Aqeedah",
    tagline: "What a Muslim believes",
    glyph: "ع",
    perDay: 3,
    items: [
      t("Tawheed", "Allah is One. He neither begets nor is born, and there is nothing like Him.", "Surah Al-Ikhlas 112", "قُلْ هُوَ ٱللَّهُ أَحَدٌ"),
      t("Six pillars of Iman", "Belief in Allah, His angels, His books, His messengers, the Last Day, and divine decree (Qadr).", "Sahih Muslim 8"),
      t("Five pillars of Islam", "Shahadah, Salah, Zakah, fasting Ramadan, and Hajj for those who are able.", "Sahih al-Bukhari 8"),
      t("Ihsan", "To worship Allah as though you see Him — and if you cannot see Him, know that He sees you.", "Sahih Muslim 8"),
      t("The Shahadah", "There is no god worthy of worship except Allah, and Muhammad is His Messenger.", undefined, "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا ٱللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ ٱللَّهِ"),
      t("99 Names", "Allah has ninety-nine names. Whoever learns and lives by them will enter Paradise.", "Sahih al-Bukhari 2736"),
      t("Angels, jinn, humans", "Angels were created from light, jinn from smokeless fire, and humans from clay.", "Sahih Muslim 2996 · Quran 55:14–15"),
      t("The revealed books", "Tawrat to Musa, Zabur to Dawud, Injil to Isa, and the Quran to Muhammad ﷺ.", "Quran 4:163 · 5:46"),
      t("Qadr", "Believing that everything — good and bad — happens by Allah's knowledge and will.", "Sahih Muslim 8"),
      t("A protected Book", "\"Indeed, We sent down the Reminder and indeed, We will guard it.\" The Quran is preserved letter by letter.", "Quran 15:9"),
      t("Mercy first", "Allah wrote: \"My mercy prevails over My wrath.\"", "Sahih al-Bukhari 7404"),
      t("Noble recorders", "Two honourable angels write down every deed you do.", "Quran 82:10–12"),
      t("Nothing is lost", "Whoever does an atom's weight of good will see it.", "Quran 99:7"),
      t("Fitrah", "Every child is born upon the fitrah — a natural inclination to recognise Allah.", "Sahih al-Bukhari 1385"),
      t("The gravest sin", "Associating partners with Allah (shirk) is the one sin He will not forgive if one dies upon it.", "Quran 4:48"),
    ],
  },
  {
    id: "fiqh",
    title: "Fiqh",
    short: "Fiqh",
    tagline: "Practical rules of worship",
    glyph: "ف",
    perDay: 3,
    note: "Details can differ between schools of fiqh — ask a trusted local scholar.",
    items: [
      t("Wudu essentials", "Wash the face, the arms up to the elbows, wipe the head, and wash the feet up to the ankles.", "Quran 5:6"),
      t("Daily fard rakats", "Fajr 2 · Dhuhr 4 · Asr 4 · Maghrib 3 · Isha 4 — 17 obligatory rakats each day.", "Sahih al-Bukhari 350"),
      t("No water?", "If water is unavailable or harmful, perform tayammum with clean earth.", "Quran 5:6"),
      t("What breaks wudu", "Using the toilet, passing wind, and deep sleep all break wudu.", "Quran 5:6 · Sahih al-Bukhari 135"),
      t("Zakat", "2.5% of savings that stay above the nisab threshold for one lunar year.", "Sunan Abi Dawud 1572"),
      t("Fasting", "From true dawn (Fajr) until sunset. Eating by mistake does not break the fast.", "Quran 2:187 · Sahih al-Bukhari 1933"),
      t("Prayer while travelling", "Travellers may shorten 4-rakat prayers to 2 (qasr).", "Quran 4:101"),
      t("Forgot in prayer?", "Two prostrations of forgetfulness (sujood as-sahw) make up for a missed or added part.", "Sahih al-Bukhari 1224"),
      t("Jumu'ah", "Friday prayer in congregation is obligatory on adult men. When the call is made, leave trade.", "Quran 62:9"),
      t("Hajj", "Hajj is due once in a lifetime upon every Muslim who is able to make the journey.", "Quran 3:97 · Sahih Muslim 1337"),
      t("Witr", "Make Witr the last prayer of your night.", "Sahih al-Bukhari 998"),
      t("Halal & haram food", "Pork, carrion, blood and intoxicants are forbidden. Everything good and pure is allowed.", "Quran 5:3 · 5:90"),
      t("Zakat al-Fitr", "A small charity given for every family member before the Eid prayer.", "Sahih al-Bukhari 1503"),
      t("Pray together", "Prayer in congregation is 27 times better than praying alone.", "Sahih al-Bukhari 645"),
    ],
  },
  {
    id: "qaida",
    title: "Qaida & Tajweed",
    short: "Qaida",
    tagline: "Learn to read the Quran, one step a day",
    glyph: "ب",
    perDay: 3,
    items: [
      l("ا ب ت", "28 letters", "Arabic has 28 letters and is written from right to left. Most letters join to the next one.", "ا ب ت ث ج ح خ"),
      l("ا", "Alif", "The first letter. It has no dots and often carries a vowel or lengthens one.", "أَ  إِ  أُ"),
      l("ب ت ث", "Dots matter", "Ba has one dot below, Ta two dots above, Tha three dots above — same shape, different letters.", "بَ  تَ  ثَ"),
      l("ج ح خ", "The Jeem family", "Jeem has a dot inside, Ha has none, Kha has a dot above.", "جَ  حَ  خَ"),
      l("بَ بِ بُ", "Harakat", "Fatha (a) sits above, Kasra (i) sits below, Damma (u) is a small waw above.", "بَ = ba · بِ = bi · بُ = bu"),
      l("بْ", "Sukoon", "A small circle means the letter has no vowel — stop on it.", "أَبْ  ·  قُلْ"),
      l("بّ", "Shaddah", "A small 'w' shape doubles the letter — read it twice: once stopped, once voiced.", "رَبَّ  ·  إِنَّ"),
      l("بً بٍ بٌ", "Tanween", "Double vowel marks add an 'n' sound: an, in, un.", "بًا = ban · بٍ = bin · بٌ = bun"),
      l("ا و ي", "Madd letters", "Alif, Waw and Ya stretch the vowel before them for 2 counts.", "قَالَ  ·  يَقُولُ  ·  قِيلَ"),
      l("ن", "Ghunnah", "Noon and Meem with shaddah are read with a nasal sound held for 2 counts.", "إِنَّ  ·  ثُمَّ"),
      l("ء ه ع ح غ خ", "Izhar", "Noon sakinah or tanween before these 6 throat letters is pronounced clearly.", "مِنْ عِلْمٍ"),
      l("ي ر م ل و ن", "Idgham", "Noon sakinah or tanween merges into these 6 letters — remember them as \"yarmaloon\".", "مَن يَقُولُ"),
      l("ب", "Iqlab", "Noon sakinah or tanween before Ba turns into a soft Meem sound.", "مِنۢ بَعْدِ"),
      l("ت ث ج د ذ ز س", "Ikhfa", "Before 15 letters, noon sakinah is hidden — said lightly through the nose.", "مِن تَحْتِهَا  ·  أَنتُمْ"),
      l("ق ط ب ج د", "Qalqalah", "These 5 letters bounce slightly when they have sukoon. Remember: \"qutbu jad\".", "ٱلْفَلَقِ  ·  أَحَدْ"),
      l("ش س", "Sun & Moon letters", "With sun letters the 'l' of al- is silent; with moon letters it is pronounced.", "ٱلشَّمْسُ  ·  ٱلْقَمَرُ"),
      l("خ ص ض غ ط ق ظ", "Heavy letters", "These 7 letters are always read with a full, heavy mouth.", "خُصَّ ضَغْطٍ قِظْ"),
      l("ٱللَّه", "The name Allah", "The 'l' in Allah is heavy after fatha or damma, and light after kasra.", "قَالَ ٱللَّهُ  ·  بِسْمِ ٱللَّهِ"),
    ],
  },
  {
    id: "history",
    title: "Islamic History",
    short: "History",
    tagline: "Moments that shaped the Ummah",
    glyph: "ت",
    perDay: 3,
    items: [
      t("The first word", "In 610 CE, in the cave of Hira during Ramadan, the first revelation came: \"Iqra — Read!\"", "Quran 96:1–5", "ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ"),
      t("The first believer", "Khadijah (RA), the Prophet's wife, was the first person to accept Islam.", "Sahih al-Bukhari 3"),
      t("The Hijrah", "In 622 CE the Prophet ﷺ migrated to Madinah. Umar (RA) later made it year 1 of the Islamic calendar.", undefined),
      t("The first mosque", "Masjid Quba, built on the way to Madinah, was the first mosque in Islam.", "Quran 9:108"),
      t("Bilal's call", "Bilal ibn Rabah (RA), once enslaved for his faith, became the first muezzin of Islam.", undefined),
      t("The Qiblah changes", "Muslims first prayed towards Al-Aqsa, then the Qiblah turned to the Kaaba in 2 AH.", "Quran 2:144"),
      t("Badr", "In 2 AH, around 313 Muslims faced an army of about 1,000 — and Allah granted victory.", "Quran 3:123"),
      t("Isra & Mi'raj", "On the Night Journey the Prophet ﷺ ascended through the heavens and the five daily prayers were given.", "Quran 17:1 · Sahih al-Bukhari 349"),
      t("Hudaybiyyah", "A treaty that looked like a setback in 6 AH — the Quran called it \"a clear victory\".", "Quran 48:1"),
      t("Conquest of Makkah", "In 8 AH the Prophet ﷺ entered Makkah peacefully and forgave those who had fought him.", undefined),
      t("The Farewell Sermon", "At Arafat in 10 AH: no Arab is superior to a non-Arab — except by righteousness.", "Musnad Ahmad 23489"),
      t("Rightly Guided Caliphs", "Abu Bakr, Umar, Uthman and Ali (RA) led the Ummah after the Prophet ﷺ.", undefined),
      t("The Quran compiled", "Abu Bakr (RA) gathered the Quran into one book; Uthman (RA) sent standard copies to the cities.", "Sahih al-Bukhari 4986–4987"),
      t("Oldest university", "Fatima al-Fihri founded al-Qarawiyyin in Fez in 859 CE — still teaching today.", undefined),
      t("House of Wisdom", "In Baghdad, scholars like al-Khwarizmi gave the world algebra — a word from Arabic \"al-jabr\".", undefined),
    ],
  },
];

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
