import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/noor/PageHeader";
import { translationClass } from "@/components/noor/VerseList";
import { getSurah, useEdition } from "@/lib/quran";
import { useSettings } from "@/lib/settings";
import { useBookmarks } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({
    meta: [
      { title: "Bookmarked Ayahs | Noor" },
      { name: "description", content: "Your saved ayahs from the Quran, ready to revisit." },
      { property: "og:title", content: "Bookmarked Ayahs | Noor" },
      { property: "og:description", content: "Your saved ayahs from the Quran." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookmarksPage,
});

function BookmarksPage() {
  const { bookmarks, toggle } = useBookmarks();
  const { settings } = useSettings();
  const lang = settings.translation === "none" ? "en" : settings.translation;
  const ar = useEdition("ar");
  const tr = useEdition(lang);

  return (
    <div>
      <PageHeader back title="Bookmarks" subtitle={`${bookmarks.length} saved ayahs`} />
      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center px-8 py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft text-primary">
            <Bookmark className="h-7 w-7" />
          </span>
          <p className="mt-4 font-semibold">No bookmarks yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Tap the bookmark icon on any ayah to save it here.</p>
          <Link to="/quran" className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            Open the Quran
          </Link>
        </div>
      ) : (
        <div className="space-y-3 p-4">
          {bookmarks.map((b) => {
            const s = getSurah(b.surah)!;
            return (
              <div key={`${b.surah}:${b.ayah}`} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center justify-between">
                  <Link to="/surah/$id" params={{ id: String(b.surah) }} search={{ ayah: b.ayah }} className="text-sm font-semibold text-primary">
                    {s.name} · {b.surah}:{b.ayah}
                  </Link>
                  <button aria-label="Remove bookmark" onClick={() => toggle(b.surah, b.ayah)} className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <Link to="/surah/$id" params={{ id: String(b.surah) }} search={{ ayah: b.ayah }} className="block">
                  <p className="font-arabic mt-2 line-clamp-3 text-right text-2xl leading-[2.1]">{ar.data?.[b.surah - 1]?.[b.ayah - 1]}</p>
                  <p dir={lang === "ur" ? "rtl" : "ltr"} className={cn("mt-2 line-clamp-3 text-sm text-muted-foreground", translationClass(lang))}>
                    {tr.data?.[b.surah - 1]?.[b.ayah - 1]}
                  </p>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
