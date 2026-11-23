import { useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, BookmarkCheck, Copy, Pause, Play, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  audioUrl,
  getSurah,
  isSajda,
  useEdition,
  type AyahRef,
  type Edition,
} from "@/lib/quran";
import { useSettings, type TranslationLang } from "@/lib/settings";
import { saveLastRead, useBookmarks } from "@/lib/storage";
import { copyText, shareText } from "@/lib/share";
import { cn } from "@/lib/utils";
import { NumberBadge } from "./SurahRow";

const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

export const toArabicDigits = (n: number) =>
  String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]!);

export function translationClass(lang: TranslationLang) {
  if (lang === "ur") return "font-urdu text-right leading-[2.4]";
  if (lang === "hi") return "font-hindi leading-relaxed";
  return "leading-relaxed";
}

export function SurahBanner({ surah }: { surah: number }) {
  const s = getSurah(surah)!;
  return (
    <div className="bg-hero pattern-stars relative mx-4 my-4 overflow-hidden rounded-3xl px-6 py-7 text-center text-primary-foreground shadow-glow">
      <p className="font-arabic text-4xl">{s.arabic}</p>
      <h2 className="mt-2 text-2xl font-semibold">{s.name}</h2>
      <p className="text-sm opacity-80">{s.meaning}</p>
      <div className="mx-auto my-4 h-px w-24 bg-primary-foreground/30" />
      <p className="text-xs uppercase tracking-widest opacity-80">
        {s.revelation} · {s.ayahs} ayahs
      </p>
      {surah !== 1 && surah !== 9 && <p className="font-arabic mt-5 text-3xl leading-loose">{BISMILLAH}</p>}
    </div>
  );
}

function useAyahAudio(refs: AyahRef[]) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const refsRef = useRef(refs);
  refsRef.current = refs;

  const stop = () => {
    audioRef.current?.pause();
    setPlaying(null);
  };

  const play = (ref: AyahRef) => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    const key = `${ref.surah}:${ref.ayah}`;
    audio.src = audioUrl(ref.surah, ref.ayah);
    audio.onended = () => {
      const list = refsRef.current;
      const i = list.findIndex((r) => r.surah === ref.surah && r.ayah === ref.ayah);
      const next = list[i + 1];
      if (next) {
        play(next);
        document.getElementById(`a-${next.surah}-${next.ayah}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else setPlaying(null);
    };
    audio.onerror = () => {
      toast.error("Recitation needs an internet connection");
      setPlaying(null);
    };
    void audio.play().catch(() => setPlaying(null));
    setPlaying(key);
  };

  useEffect(() => () => audioRef.current?.pause(), []);
  return { playing, play, stop };
}

export function VerseList({
  refs,
  focusAyah,
  surahHeaders = false,
}: {
  refs: AyahRef[];
  focusAyah?: AyahRef | undefined;
  surahHeaders?: boolean;
}) {
  const { settings } = useSettings();
  const ar = useEdition("ar");
  const tr = useEdition(settings.translation === "none" ? null : settings.translation);
  const translit = useEdition(settings.showTransliteration ? "tr" : null);
  const { isBookmarked, toggle } = useBookmarks();
  const audio = useAyahAudio(refs);
  const [selected, setSelected] = useState<AyahRef | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const ready = !!ar.data && (settings.translation === "none" || !!tr.data);

  // Jump to the requested ayah once text is on screen
  useEffect(() => {
    if (!ready || !focusAyah) return;
    const el = document.getElementById(`a-${focusAyah.surah}-${focusAyah.ayah}`);
    if (el) {
      el.scrollIntoView({ block: "center" });
      el.dataset["flash"] = "true";
      const id = window.setTimeout(() => delete el.dataset["flash"], 2200);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [ready, focusAyah]);

  // Remember the topmost visible ayah as "last read"
  useEffect(() => {
    if (!ready || !listRef.current) return;
    let timer = 0;
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const key = (e.target as HTMLElement).dataset["ref"]!;
          if (e.isIntersecting) visible.set(key, e.boundingClientRect.top);
          else visible.delete(key);
        }
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          const top = [...visible.entries()].sort((a, b) => a[1] - b[1])[0];
          if (top) {
            const [s, a] = top[0].split(":").map(Number);
            saveLastRead(s!, a!);
          }
        }, 700);
      },
      { rootMargin: "-20% 0px -50% 0px" },
    );
    listRef.current.querySelectorAll("[data-ref]").forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [ready, refs]);

  const groups = useMemo(() => {
    const out: { surah: number; refs: AyahRef[] }[] = [];
    for (const r of refs) {
      const last = out[out.length - 1];
      if (last && last.surah === r.surah) last.refs.push(r);
      else out.push({ surah: r.surah, refs: [r] });
    }
    return out;
  }, [refs]);

  if (!ready) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-3xl border border-border bg-card p-5">
            <Skeleton className="ml-auto h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  const arabic = ar.data!;
  const textOf = (ed: Edition | undefined, r: AyahRef) => ed?.[r.surah - 1]?.[r.ayah - 1] ?? "";

  const shareAyah = (r: AyahRef) => {
    const s = getSurah(r.surah)!;
    const parts = [textOf(arabic, r), textOf(tr.data, r), `— ${s.name} ${r.surah}:${r.ayah}`];
    void shareText(parts.filter(Boolean).join("\n\n"), `${s.name} ${r.surah}:${r.ayah}`);
  };
  const copyAyah = (r: AyahRef) => {
    const s = getSurah(r.surah)!;
    void copyText([textOf(arabic, r), textOf(tr.data, r), `— ${s.name} ${r.surah}:${r.ayah}`].filter(Boolean).join("\n\n"));
  };
  const onToggleBookmark = (r: AyahRef) => {
    const added = toggle(r.surah, r.ayah);
    toast(added ? "Bookmarked" : "Bookmark removed");
  };

  const arabicStyle = { fontSize: `${settings.arabicSize}px` };
  const transStyle = { fontSize: `${settings.translationSize}px` };

  return (
    <div ref={listRef}>
      {groups.map((g) => (
        <section key={g.surah}>
          {g.refs[0]?.ayah === 1 && <SurahBanner surah={g.surah} />}
          {surahHeaders && g.refs[0]?.ayah !== 1 && (
            <p className="px-6 pb-1 pt-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {getSurah(g.surah)!.name} · continued
            </p>
          )}

          {settings.layout === "mushaf" ? (
            <div className="mx-4 mb-4 rounded-3xl border border-border bg-card px-5 py-6 shadow-soft">
              <p className="font-arabic text-justify leading-[2.3] text-card-foreground" style={arabicStyle}>
                {g.refs.map((r) => (
                  <span
                    key={r.ayah}
                    id={`a-${r.surah}-${r.ayah}`}
                    data-ref={`${r.surah}:${r.ayah}`}
                    onClick={() => setSelected(r)}
                    className={cn(
                      "cursor-pointer rounded-lg transition-colors data-[flash=true]:bg-gold-soft",
                      audio.playing === `${r.surah}:${r.ayah}` && "bg-primary-soft",
                    )}
                  >
                    {textOf(arabic, r)}{" "}
                    <span className="text-gold">﴿{toArabicDigits(r.ayah)}﴾</span>{" "}
                  </span>
                ))}
              </p>
            </div>
          ) : (
            <div className="space-y-3 px-4 pb-4">
              {g.refs.map((r) => {
                const key = `${r.surah}:${r.ayah}`;
                const marked = isBookmarked(r.surah, r.ayah);
                const isPlaying = audio.playing === key;
                return (
                  <article
                    key={key}
                    id={`a-${r.surah}-${r.ayah}`}
                    data-ref={key}
                    className={cn(
                      "scroll-mt-24 rounded-3xl border border-border bg-card p-4 shadow-soft transition-colors data-[flash=true]:border-gold data-[flash=true]:bg-gold-soft",
                      isPlaying && "border-primary/40 bg-primary-soft",
                    )}
                  >
                    <div className="mb-3 flex items-center gap-1">
                      <NumberBadge n={r.ayah} />
                      {isSajda(r.surah, r.ayah) && (
                        <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
                          Sajdah
                        </span>
                      )}
                      <div className="ml-auto flex items-center">
                        <IconBtn label={isPlaying ? "Pause" : "Play recitation"} onClick={() => (isPlaying ? audio.stop() : audio.play(r))}>
                          {isPlaying ? <Pause className="h-[18px] w-[18px]" /> : <Play className="h-[18px] w-[18px]" />}
                        </IconBtn>
                        <IconBtn label={marked ? "Remove bookmark" : "Bookmark"} onClick={() => onToggleBookmark(r)} active={marked}>
                          {marked ? <BookmarkCheck className="h-[18px] w-[18px]" /> : <Bookmark className="h-[18px] w-[18px]" />}
                        </IconBtn>
                        <IconBtn label="Copy" onClick={() => copyAyah(r)}>
                          <Copy className="h-[18px] w-[18px]" />
                        </IconBtn>
                        <IconBtn label="Share" onClick={() => shareAyah(r)}>
                          <Share2 className="h-[18px] w-[18px]" />
                        </IconBtn>
                      </div>
                    </div>
                    <p className="font-arabic text-right leading-[2.2] text-card-foreground" style={arabicStyle}>
                      {textOf(arabic, r)}
                      <span className="mr-2 text-gold">﴿{toArabicDigits(r.ayah)}﴾</span>
                    </p>
                    {settings.showTransliteration && translit.data && (
                      <p className="mt-3 text-sm italic text-primary/90">{textOf(translit.data, r)}</p>
                    )}
                    {settings.translation !== "none" && (
                      <p
                        dir={settings.translation === "ur" ? "rtl" : "ltr"}
                        className={cn("mt-3 text-muted-foreground", translationClass(settings.translation))}
                        style={transStyle}
                      >
                        {textOf(tr.data, r)}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ))}

      <Drawer open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DrawerContent>
          {selected && (
            <div className="mx-auto w-full max-w-lg px-5 pb-8">
              <DrawerHeader className="px-0">
                <DrawerTitle className="font-display">
                  {getSurah(selected.surah)!.name} · {selected.surah}:{selected.ayah}
                </DrawerTitle>
              </DrawerHeader>
              <p className="font-arabic max-h-40 overflow-y-auto text-right text-2xl leading-loose">{textOf(arabic, selected)}</p>
              {settings.translation !== "none" && (
                <p
                  dir={settings.translation === "ur" ? "rtl" : "ltr"}
                  className={cn("mt-3 max-h-40 overflow-y-auto text-muted-foreground", translationClass(settings.translation))}
                >
                  {textOf(tr.data, selected)}
                </p>
              )}
              <div className="mt-5 grid grid-cols-4 gap-2">
                <DrawerAction label="Play" onClick={() => audio.play(selected)}>
                  <Play className="h-5 w-5" />
                </DrawerAction>
                <DrawerAction label={isBookmarked(selected.surah, selected.ayah) ? "Saved" : "Save"} onClick={() => onToggleBookmark(selected)}>
                  {isBookmarked(selected.surah, selected.ayah) ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                </DrawerAction>
                <DrawerAction label="Copy" onClick={() => copyAyah(selected)}>
                  <Copy className="h-5 w-5" />
                </DrawerAction>
                <DrawerAction label="Share" onClick={() => shareAyah(selected)}>
                  <Share2 className="h-5 w-5" />
                </DrawerAction>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        active && "text-gold",
      )}
    >
      {children}
    </button>
  );
}

function DrawerAction({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-2xl bg-muted py-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
    >
      {children}
      {label}
    </button>
  );
}
