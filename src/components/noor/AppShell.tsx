import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Home, Search, Settings, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/quran", label: "Quran", icon: BookOpen },
  { to: "/daily", label: "Daily", icon: Sparkles },
  { to: "/search", label: "Search", icon: Search },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const immersive = pathname.startsWith("/stories");

  if (immersive) return <>{children}</>;

  const activeFor = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to) ||
      (to === "/quran" && (pathname.startsWith("/surah") || pathname.startsWith("/juz") || pathname.startsWith("/bookmarks")));

  return (
    <div className="mx-auto min-h-screen max-w-2xl">
      <main className="pb-28">{children}</main>
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl">
        <ul className="mx-auto flex max-w-2xl items-stretch justify-around px-2">
          {TABS.map(({ to, label, icon: Icon }) => {
            const active = activeFor(to);
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-14 items-center justify-center rounded-full transition-all",
                      active && "bg-primary-soft",
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
