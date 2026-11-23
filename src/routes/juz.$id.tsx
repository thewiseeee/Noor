import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/noor/PageHeader";
import { ReaderTools } from "@/components/noor/ReaderTools";
import { VerseList } from "@/components/noor/VerseList";
import { juzAyahs, JUZ_NAMES } from "@/lib/quran";

export const Route = createFileRoute("/juz/$id")({
  loader: ({ params }) => {
    const juz = Number(params.id);
    if (!Number.isInteger(juz) || juz < 1 || juz > 30) throw notFound();
    return { juz };
  },
  head: ({ loaderData }) => {
    const j = loaderData?.juz ?? 1;
    const title = `Para ${j} — ${JUZ_NAMES[j - 1]} | Noor`;
    const description = `Read Para (Juz) ${j}, ${JUZ_NAMES[j - 1]}, with Arabic text and translation.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: JuzPage,
});

function JuzPage() {
  const { juz } = Route.useLoaderData();
  const refs = useMemo(() => juzAyahs(juz), [juz]);
  return (
    <div>
      <PageHeader back title={`Para ${juz}`} subtitle={`${JUZ_NAMES[juz - 1]} · ${refs.length} ayahs`} right={<ReaderTools />} />
      <VerseList key={juz} refs={refs} surahHeaders />
      <nav className="flex gap-3 px-4 pb-6">
        {juz > 1 ? (
          <Link to="/juz/$id" params={{ id: String(juz - 1) }} className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-card p-3 text-sm">
            <ChevronLeft className="h-4 w-4" /> Para {juz - 1}
          </Link>
        ) : <span className="flex-1" />}
        {juz < 30 ? (
          <Link to="/juz/$id" params={{ id: String(juz + 1) }} className="flex flex-1 items-center justify-end gap-2 rounded-2xl border border-border bg-card p-3 text-sm">
            Para {juz + 1} <ChevronRight className="h-4 w-4" />
          </Link>
        ) : <span className="flex-1" />}
      </nav>
    </div>
  );
}
