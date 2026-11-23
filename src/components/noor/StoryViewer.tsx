import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { BookOpen, ChevronUp, Copy, Home, Pause, Share2, X } from "lucide-react";
import { CATEGORIES, getCategory, type CategoryId, type StoryItem } from "@/data/stories";
import { dailyFeed, dateKey, type DailyCategory } from "@/lib/daily";
import { getSurah, useEdition, type Edition } from "@/lib/quran";
import { useSettings, type TranslationLang } from "@/lib/settings";
import { copyText, shareText } from "@/lib/share";
import { markSeen, useSeen } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { STORY_BG } from "./story-bg";
import { toArabicDigits, translationClass } from "./VerseList";

interface Resolved {
  eyebrow: string;
  title?: string;
  arabic?: string;
  body?: string;
  bodyLang?: TranslationLang;
  source?: string;
  glyph?: string;
  example?: string;
  link?: { surah: number; ayah: number };
}

function resolve(item: StoryItem, ar?: Edition, tr?: Edition, lang: TranslationLang = "en"): Resolved {
  if (item.kind === "ayah") {
    const [s, a] = item.ref;
    const surah = getSurah(s)!;
    return {
      eyebrow: item.theme,
      arabic: ar?.[s - 1]?.[a - 1] ?? "",
      body: tr?.[s - 1]?.[a - 1] ?? "",
      bodyLang: lang,
      source: `${surah.name} · ${s}:${a}`,
      link: { surah: s, ayah: a },
    };
  }
  if (item.kind === "letter") {
    return { eyebrow: "Lesson", title: item.title, body: item.body, glyph: item.glyph, ...(item.example ? { example: item.example } : {}) };
  }
  return {
    eyebrow: "Did you know?",
    title: item.title,
    body: item.body,
    ...(item.arabic ? { arabic: item.arabic } : {}),
    ...(item.source ? { source: item.source } : {}),
  };
}

const durationFor = (r: Resolved) =>
  Math.min(22000, 7000 + ((r.body?.length ?? 0) + (r.arabic?.length ?? 0) * 0.6) * 45);

function msToMidnight() {
  const now = new Date();
  const m = new Date(now);
  m.setHours(24, 0, 0, 0);
  return m.getTime() - now.getTime();
}

export function StoryViewer({ startCategory }: { startCategory: CategoryId }) {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const today = dateKey();
  const seen = useSeen(today);
  const feed: DailyCategory[] = useMemo(() => dailyFeed(), []);
  const lang: TranslationLang = settings.translation === "none" ? "en" : settings.translation;
  const ar = useEdition("ar");
  const tr = useEdition(lang);

  const startIdx = Math.max(0, feed.findIndex((c) => c.id === startCategory));
  const [catIdx, setCatIdx] = useState(startIdx);
  const [itemIdx, setItemIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const initialised = useRef(false);

  // Resume where the user left off in the chosen category
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const cat = feed[startIdx];
    const last = seen[startCategory] ?? -1;
    if (cat && last >= 0 && last < cat.items.length - 1) setItemIdx(last + 1);
  }, [feed, seen, startCategory, startIdx]);

  const cat = feed[catIdx]!;
  const meta = getCategory(cat.id)!;
  const item = cat.items[itemIdx]!;
  const r = resolve(item, ar.data, tr.data, lang);
  const needsText = item.kind === "ayah" && !(ar.data && tr.data);

  useEffect(() => {
    if (!done) markSeen(today, cat.id, itemIdx);
  }, [today, cat.id, itemIdx, done]);

  const next = useCallback(() => {
    setDir(1);
    if (itemIdx < cat.items.length - 1) setItemIdx((i) => i + 1);
    else if (catIdx < feed.length - 1) {
      setCatIdx((c) => c + 1);
      setItemIdx(0);
    } else setDone(true);
  }, [itemIdx, cat.items.length, catIdx, feed.length]);

  const prev = useCallback(() => {
    setDir(-1);
    if (done) return setDone(false);
    if (itemIdx > 0) setItemIdx((i) => i - 1);
    else if (catIdx > 0) {
      const pc = feed[catIdx - 1]!;
      setCatIdx((c) => c - 1);
      setItemIdx(pc.items.length - 1);
    }
  }, [done, itemIdx, catIdx, feed]);

  // Keyboard support (desktop preview)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") prev();
      if (e.key === "Escape") void navigate({ to: "/daily" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, navigate]);

  const holdTimer = useRef(0);
  const held = useRef(false);
  const onTapStart = () => {
    held.current = false;
    holdTimer.current = window.setTimeout(() => {
      held.current = true;
      setPaused(true);
    }, 220);
  };
  const onTap = (_: unknown, info: { point: { x: number } }) => {
    window.clearTimeout(holdTimer.current);
    if (held.current) {
      setPaused(false);
      return;
    }
    if (info.point.x < window.innerWidth * 0.3) prev();
    else next();
  };
  const onTapCancel = () => {
    window.clearTimeout(holdTimer.current);
    setPaused(false);
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    setPaused(false);
    if (info.offset.y < -70 || info.velocity.y < -450) next();
    else if (info.offset.y > 70 || info.velocity.y > 450) prev();
  };

  const shareCurrent = () => {
    const text = [r.title, r.arabic, r.body, r.source && `— ${r.source}`, "via Noor"].filter(Boolean).join("\n\n");
    void shareText(text);
  };
  const copyCurrent = () => {
    void copyText([r.title, r.arabic, r.body, r.source && `— ${r.source}`].filter(Boolean).join("\n\n"));
  };

  const totalToday = feed.reduce((n, c) => n + c.items.length, 0);
  const position = feed.slice(0, catIdx).reduce((n, c) => n + c.items.length, 0) + itemIdx + 1;
  const stopBubble = { onPointerDown: (e: React.PointerEvent) => e.stopPropagation() };

  if (done) return <EndScreen onReplay={() => { setDone(false); setCatIdx(0); setItemIdx(0); }} />;

  return (
    <div className={cn("fixed inset-0 overflow-hidden text-story-foreground transition-[background-image] duration-500", STORY_BG[cat.id])}>
      <div className="pattern-stars pointer-events-none absolute inset-0" />

      {/* Top bar */}
      <div className="safe-top absolute inset-x-0 top-0 z-20 px-3 pt-2">
        <div className="flex gap-1">
          {cat.items.map((_, i) => (
            <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-story-glass">
              <div
                key={`${catIdx}-${itemIdx}-${i}`}
                className="h-full origin-left rounded-full bg-story-foreground"
                style={
                  i < itemIdx
                    ? { transform: "scaleX(1)" }
                    : i > itemIdx
                      ? { transform: "scaleX(0)" }
                      : settings.storyAutoAdvance && !needsText
                        ? {
                            animation: `story-progress ${durationFor(r)}ms linear forwards`,
                            animationPlayState: paused ? "paused" : "running",
                          }
                        : { transform: "scaleX(1)" }
                }
                onAnimationEnd={i === itemIdx ? next : undefined}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-story-glass font-arabic text-xl">{meta.glyph}</span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold">{meta.title}</p>
            <p className="text-[11px] text-story-muted">
              {position} of {totalToday} today
            </p>
          </div>
          {paused && <Pause className="h-4 w-4 text-story-muted" />}
          <Link
            to="/daily"
            aria-label="Close"
            {...stopBubble}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-story-glass"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Card */}
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div
          key={`${catIdx}-${itemIdx}`}
          custom={dir}
          variants={{
            enter: (d: number) => ({ y: d > 0 ? "100%" : "-100%", opacity: 0.4 }),
            center: { y: 0, opacity: 1 },
            exit: (d: number) => ({ y: d > 0 ? "-35%" : "60%", opacity: 0, scale: 0.94 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 260, damping: 32 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.5}
          onDragStart={() => setPaused(true)}
          onDragEnd={onDragEnd}
          onTapStart={onTapStart}
          onTap={onTap}
          onTapCancel={onTapCancel}
          className="absolute inset-0 z-10 flex select-none flex-col justify-center px-7 pb-36 pt-28"
        >
          <StoryBody r={r} lang={lang} loading={needsText} />
        </motion.div>
      </AnimatePresence>

      {/* Bottom actions */}
      <div className="safe-bottom absolute inset-x-0 bottom-0 z-20 px-5 pb-4">
        {meta.note && <p className="mb-3 text-center text-[11px] text-story-muted">{meta.note}</p>}
        <div className="flex items-center justify-center gap-3">
          <StoryAction label="Share" onClick={shareCurrent} {...stopBubble}>
            <Share2 className="h-5 w-5" />
          </StoryAction>
          <StoryAction label="Copy" onClick={copyCurrent} {...stopBubble}>
            <Copy className="h-5 w-5" />
          </StoryAction>
          {r.link && (
            <Link
              to="/surah/$id"
              params={{ id: String(r.link.surah) }}
              search={{ ayah: r.link.ayah }}
              {...stopBubble}
              className="flex h-12 items-center gap-2 rounded-full bg-story-foreground px-5 text-sm font-semibold text-story-ink"
            >
              <BookOpen className="h-4 w-4" /> Read in Quran
            </Link>
          )}
        </div>
        <button
          {...stopBubble}
          onClick={next}
          className="mx-auto mt-3 flex flex-col items-center text-[11px] font-medium text-story-muted"
        >
          <ChevronUp className="animate-float-up h-5 w-5" />
          Swipe up
        </button>
      </div>
    </div>
  );
}

function StoryBody({ r, lang, loading }: { r: Resolved; lang: TranslationLang; loading: boolean }) {
  return (
    <div className="mx-auto w-full max-w-md text-center">
      <span className="inline-block rounded-full bg-story-glass px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
        {r.eyebrow}
      </span>
      {r.glyph && <p className="font-arabic mt-6 text-7xl leading-[1.6]">{r.glyph}</p>}
      {r.title && <h2 className="mt-5 text-3xl font-semibold leading-tight">{r.title}</h2>}
      {loading ? (
        <div className="mt-8 space-y-3">
          <div className="mx-auto h-6 w-4/5 animate-pulse rounded-full bg-story-glass" />
          <div className="mx-auto h-4 w-3/5 animate-pulse rounded-full bg-story-glass" />
        </div>
      ) : (
        <>
          {r.arabic && <p className="font-arabic mt-6 text-[1.9rem] leading-[2.1]">{r.arabic}</p>}
          {r.body && (
            <p
              dir={r.bodyLang === "ur" ? "rtl" : "ltr"}
              className={cn(
                "mt-5 text-lg text-story-foreground/95",
                r.bodyLang ? translationClass(r.bodyLang) : "leading-relaxed",
                r.bodyLang === "ur" && "text-center",
              )}
            >
              {r.body}
            </p>
          )}
        </>
      )}
      {r.example && <p className="font-arabic mt-6 rounded-2xl bg-story-glass px-4 py-3 text-2xl leading-loose">{r.example}</p>}
      {r.source && <p className="mt-6 text-xs font-medium tracking-wide text-story-muted">{r.source}</p>}
    </div>
  );
}

function StoryAction({
  children,
  label,
  onClick,
  onPointerDown,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      onPointerDown={onPointerDown}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-story-glass backdrop-blur"
    >
      {children}
    </button>
  );
}

function EndScreen({ onReplay }: { onReplay: () => void }) {
  const [left, setLeft] = useState(msToMidnight());
  useEffect(() => {
    const id = window.setInterval(() => setLeft(msToMidnight()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const h = Math.floor(left / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  const total = CATEGORIES.reduce((n, c) => n + c.perDay, 0);
  return (
    <div className="bg-hero pattern-stars fixed inset-0 flex flex-col items-center justify-center px-8 text-center text-primary-foreground">
      <p className="font-arabic text-6xl">{toArabicDigits(total)}</p>
      <h2 className="mt-4 text-3xl font-semibold">You're all caught up</h2>
      <p className="mt-3 max-w-xs text-sm opacity-85">
        You've seen all of today's Noor. New stories arrive in {h}h {m}m — come back tomorrow, in sha Allah.
      </p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Link to="/quran" className="flex h-12 items-center justify-center gap-2 rounded-full bg-primary-foreground font-semibold text-primary">
          <BookOpen className="h-4 w-4" /> Continue with the Quran
        </Link>
        <Link to="/" className="flex h-12 items-center justify-center gap-2 rounded-full border border-primary-foreground/40 font-semibold">
          <Home className="h-4 w-4" /> Back home
        </Link>
        <button onClick={onReplay} className="text-sm font-medium opacity-80 underline-offset-4 hover:underline">
          Watch today's again
        </button>
      </div>
    </div>
  );
}
