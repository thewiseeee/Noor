import { createFileRoute, notFound } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { StoryViewer } from "@/components/noor/StoryViewer";
import { getCategory } from "@/data/stories";

export const Route = createFileRoute("/stories/$category")({
  loader: ({ params }) => {
    const category = getCategory(params.category);
    if (!category) throw notFound();
    return { id: category.id, title: category.title, tagline: category.tagline };
  },
  head: ({ loaderData }) => {
    const title = `${loaderData?.title ?? "Stories"} — Today's Noor`;
    const description = loaderData?.tagline ?? "Daily Islamic stories";
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
  component: StoriesPage,
});

function StoriesPage() {
  const { id } = Route.useLoaderData();
  return (
    <ClientOnly fallback={<div className="fixed inset-0 bg-hero" />}>
      <StoryViewer key={id} startCategory={id} />
    </ClientOnly>
  );
}
