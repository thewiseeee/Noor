import { Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/data/stories";
import { dateKey } from "@/lib/daily";
import { useSeen } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { STORY_BG } from "./story-bg";

export function StoryRings() {
  const seen = useSeen(dateKey());
  return (
    <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1">
      {CATEGORIES.map((c) => {
        const done = (seen[c.id] ?? -1) >= c.perDay - 1;
        return (
          <Link
            key={c.id}
            to="/stories/$category"
            params={{ category: c.id }}
            className="flex w-[72px] shrink-0 flex-col items-center gap-1.5"
          >
            <span className={cn("rounded-full p-[3px]", done ? "bg-border" : "bg-ring")}>
              <span className="block rounded-full bg-background p-[3px]">
                <span
                  className={cn(
                    STORY_BG[c.id],
                    "flex h-[58px] w-[58px] items-center justify-center rounded-full font-arabic text-3xl text-story-foreground",
                  )}
                >
                  {c.glyph}
                </span>
              </span>
            </span>
            <span className={cn("max-w-full truncate text-[11px] font-medium", done ? "text-muted-foreground" : "text-foreground")}>
              {c.short}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
