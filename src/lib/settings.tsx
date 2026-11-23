import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type Accent = "emerald" | "ocean" | "rose" | "amber" | "violet" | "slate";
export type ArabicFont = "amiri-quran" | "amiri" | "scheherazade" | "naskh" | "lateef" | "kufi";
export type TranslationLang = "en" | "ur" | "hi" | "none";
export type ReadingLayout = "verse" | "mushaf";

export interface Settings {
  mode: ThemeMode;
  accent: Accent;
  amoled: boolean;
  sepia: boolean;
  arabicFont: ArabicFont;
  arabicSize: number;
  translationSize: number;
  translation: TranslationLang;
  showTransliteration: boolean;
  layout: ReadingLayout;
  storyAutoAdvance: boolean;
  name: string;
}

export const DEFAULT_SETTINGS: Settings = {
  mode: "system",
  accent: "emerald",
  amoled: false,
  sepia: false,
  arabicFont: "amiri-quran",
  arabicSize: 30,
  translationSize: 16,
  translation: "en",
  showTransliteration: false,
  layout: "verse",
  storyAutoAdvance: true,
  name: "",
};

const KEY = "noor.settings.v1";

interface Ctx {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
  isDark: boolean;
}

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) });
    } catch {
      /* ignore corrupt settings */
    }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const isDark = settings.mode === "dark" || (settings.mode === "system" && systemDark);

  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle("dark", isDark);
    el.dataset["accent"] = settings.accent;
    el.dataset["amoled"] = String(settings.amoled);
    el.dataset["paper"] = settings.sepia ? "sepia" : "plain";
    el.dataset["arabicFont"] = settings.arabicFont;
    el.style.colorScheme = isDark ? "dark" : "light";
    void import("./native").then((m) => m.syncStatusBar(isDark));
  }, [isDark, settings.accent, settings.amoled, settings.sepia, settings.arabicFont]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage full */
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(KEY);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, update, reset, isDark }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
