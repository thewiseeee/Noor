import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  back,
  right,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  back?: boolean;
  right?: ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="safe-top sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-4 py-3">
        {back && (
          <button
            onClick={() => router.history.back()}
            aria-label="Go back"
            className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}
