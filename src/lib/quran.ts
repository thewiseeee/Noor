import { queryOptions, useQuery } from "@tanstack/react-query";
import { JUZ_STARTS, SAJDA_AYAHS, SURAH_DATA } from "@/data/quran-meta";

export type EditionKey = "ar" | "en" | "ur" | "hi" | "tr";
export type Edition = string[][];

export interface Surah {
  number: number;
  arabic: string;
  name: string;
  meaning: string;
  revelation: "Meccan" | "Medinan";
  ayahs: number;
}

export const SURAHS: Surah[] = SURAH_DATA.map(([number, arabic, name, meaning, revelation, ayahs]) => ({
  number,
  arabic,
  name,
  meaning,
  revelation: revelation as Surah["revelation"],
  ayahs,
}));

export const getSurah = (n: number) => SURAHS[n - 1];

export const EDITION_LABELS: Record<EditionKey, string> = {
  ar: "Arabic (Uthmani)",
  en: "English — Saheeh International",
  ur: "اردو — Fateh Muhammad Jalandhry",
  hi: "हिन्दी — Suhel Farooq Khan",
  tr: "Transliteration",
};

export const editionQuery = (key: EditionKey) =>
  queryOptions({
    queryKey: ["edition", key],
    queryFn: async (): Promise<Edition> => {
      const res = await fetch(`/quran/${key}.json`);
      if (!res.ok) throw new Error(`Could not load ${key}`);
      return (await res.json()) as Edition;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

/** Loads an edition on the client only (files live in /public and are bundled in the APK). */
export function useEdition(key: EditionKey | null) {
  return useQuery({ ...editionQuery(key ?? "ar"), enabled: key !== null });
}

/* ---------- Juz / Para ---------- */
export interface AyahRef {
  surah: number;
  ayah: number;
}

export function juzRange(juz: number): { start: AyahRef; end: AyahRef } {
  const s = JUZ_STARTS[juz - 1];
  if (!s) throw new Error(`Invalid juz ${juz}`);
  const next = JUZ_STARTS[juz];
  let end: AyahRef;
  if (next) {
    const [ns, na] = next;
    end = na > 1 ? { surah: ns, ayah: na - 1 } : { surah: ns - 1, ayah: getSurah(ns - 1)!.ayahs };
  } else {
    end = { surah: 114, ayah: 6 };
  }
  return { start: { surah: s[0], ayah: s[1] }, end };
}

/** All ayah refs in a juz, in order. */
export function juzAyahs(juz: number): AyahRef[] {
  const { start, end } = juzRange(juz);
  const out: AyahRef[] = [];
  for (let s = start.surah; s <= end.surah; s++) {
    const from = s === start.surah ? start.ayah : 1;
    const to = s === end.surah ? end.ayah : getSurah(s)!.ayahs;
    for (let a = from; a <= to; a++) out.push({ surah: s, ayah: a });
  }
  return out;
}

export function juzOf(surah: number, ayah: number): number {
  for (let j = JUZ_STARTS.length - 1; j >= 0; j--) {
    const [s, a] = JUZ_STARTS[j]!;
    if (surah > s || (surah === s && ayah >= a)) return j + 1;
  }
  return 1;
}

export const JUZ_NAMES = [
  "Alif Lam Meem", "Sayaqool", "Tilkal Rusul", "Lan Tana Loo", "Wal Mohsanat",
  "La Yuhibbullah", "Wa Iza Samiu", "Wa Lau Annana", "Qalal Malao", "Wa A'lamu",
  "Yatazeroon", "Wa Mamin Da'abat", "Wa Ma Ubrioo", "Rubama", "Subhanallazi",
  "Qal Alam", "Aqtarabat", "Qadd Aflaha", "Wa Qalallazina", "A'man Khalaq",
  "Utlu Ma Oohi", "Wa Manyaqnut", "Wa Mali", "Faman Azlam", "Elahe Yuruddo",
  "Ha'a Meem", "Qala Fama Khatbukum", "Qadd Sami Allah", "Tabarakallazi", "Amma Yatasa'aloon",
];

export function isSajda(surah: number, ayah: number) {
  return SAJDA_AYAHS.some(([s, a]) => s === surah && a === ayah);
}

/** Global ayah number (1..6236), used for recitation audio. */
const OFFSETS: number[] = (() => {
  const o: number[] = [];
  let sum = 0;
  for (const s of SURAHS) {
    o.push(sum);
    sum += s.ayahs;
  }
  return o;
})();
export const globalAyahNumber = (surah: number, ayah: number) => (OFFSETS[surah - 1] ?? 0) + ayah;

export const audioUrl = (surah: number, ayah: number) =>
  `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyahNumber(surah, ayah)}.mp3`;

/* ---------- Search ---------- */
const TASHKEEL = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;

export function normalizeArabic(text: string): string {
  return text
    .replace(TASHKEEL, "")
    .replace(/[ٱأإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

export const hasArabic = (s: string) => /[\u0600-\u06FF]/.test(s);

function simplifyLatin(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function matchSurahs(query: string): Surah[] {
  const q = query.trim();
  if (!q) return [];
  if (hasArabic(q)) {
    const nq = normalizeArabic(q);
    return SURAHS.filter((s) => normalizeArabic(s.arabic).includes(nq));
  }
  if (/^\d+$/.test(q)) {
    const n = Number(q);
    return n >= 1 && n <= 114 ? [getSurah(n)!] : [];
  }
  const sq = simplifyLatin(q).replace(/^(surah|sura|surat)/, "");
  if (!sq) return [];
  const strip = (s: string) => simplifyLatin(s).replace(/^(al|an|ar|as|at|ad|az|ash)/, "");
  return SURAHS.filter((s) => {
    const n = simplifyLatin(s.name);
    return n.includes(sq) || strip(s.name).startsWith(strip(q) || sq) || simplifyLatin(s.meaning).includes(sq);
  });
}

/** "2:255", "2 255", "baqarah 255" style references. */
export function parseReference(query: string): AyahRef | null {
  const m = query.trim().match(/^(\d{1,3})\s*[:.\s]\s*(\d{1,3})$/);
  if (m) {
    const surah = Number(m[1]);
    const ayah = Number(m[2]);
    const s = getSurah(surah);
    if (s && ayah >= 1 && ayah <= s.ayahs) return { surah, ayah };
  }
  return null;
}

export function parseJuz(query: string): number | null {
  const m = query.trim().toLowerCase().match(/^(juz|para|parah|sipara|siparah)\s*(\d{1,2})$/);
  if (!m) return null;
  const n = Number(m[2]);
  return n >= 1 && n <= 30 ? n : null;
}

export interface SearchHit extends AyahRef {
  text: string;
}

export function searchEdition(edition: Edition, query: string, isArabic: boolean, limit = 200): SearchHit[] {
  const hits: SearchHit[] = [];
  const q = isArabic ? normalizeArabic(query) : query.trim().toLowerCase();
  if (q.length < 2) return hits;
  for (let s = 0; s < edition.length; s++) {
    const ayahs = edition[s]!;
    for (let a = 0; a < ayahs.length; a++) {
      const text = ayahs[a]!;
      const hay = isArabic ? normalizeArabic(text) : text.toLowerCase();
      if (hay.includes(q)) {
        hits.push({ surah: s + 1, ayah: a + 1, text });
        if (hits.length >= limit) return hits;
      }
    }
  }
  return hits;
}
