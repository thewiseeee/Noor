import { createFileRoute } from "@tanstack/react-router";
import { Moon, Smartphone, Sun } from "lucide-react";
import { PageHeader } from "@/components/noor/PageHeader";
import { Chip, Label, ReadingControls, Row } from "@/components/noor/ReadingControls";
import { Switch } from "@/components/ui/switch";
import { useSettings, type Accent, type ThemeMode } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — theme, fonts & translation | Noor" },
      { name: "description", content: "Choose light or dark mode, colour styles, Arabic fonts, text size and translation language." },
      { property: "og:title", content: "Settings | Noor" },
      { property: "og:description", content: "Personalise how Noor looks and reads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const ACCENTS: { id: Accent; label: string; swatch: string }[] = [
  { id: "emerald", label: "Emerald", swatch: "oklch(0.5 0.09 165)" },
  { id: "ocean", label: "Ocean", swatch: "oklch(0.5 0.1 235)" },
  { id: "rose", label: "Rose", swatch: "oklch(0.55 0.11 10)" },
  { id: "amber", label: "Amber", swatch: "oklch(0.6 0.11 60)" },
  { id: "violet", label: "Violet", swatch: "oklch(0.5 0.1 295)" },
  { id: "slate", label: "Slate", swatch: "oklch(0.5 0.03 250)" },
];

function SettingsPage() {
  const { settings, update, reset } = useSettings();
  return (
    <div>
      <PageHeader title="Settings" subtitle="Make Noor yours" />
      <div className="space-y-8 p-4">
        <section className="space-y-6 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div>
            <Label>Your name</Label>
            <input
              value={settings.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Used in your greeting"
              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <Label>Appearance</Label>
            <div className="grid grid-cols-3 gap-2">
              {([
                ["light", "Light", Sun],
                ["dark", "Dark", Moon],
                ["system", "System", Smartphone],
              ] as [ThemeMode, string, typeof Sun][]).map(([id, label, Icon]) => (
                <Chip key={id} active={settings.mode === id} onClick={() => update({ mode: id })} className="flex flex-col items-center gap-1">
                  <Icon className="h-5 w-5" />
                  {label}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <Label>Colour style</Label>
            <div className="grid grid-cols-3 gap-2">
              {ACCENTS.map((a) => (
                <Chip key={a.id} active={settings.accent === a.id} onClick={() => update({ accent: a.id })} className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full" style={{ background: a.swatch }} />
                  {a.label}
                </Chip>
              ))}
            </div>
          </div>
          <Row label="Paper (sepia) background" hint="Warm page colour in light mode">
            <Switch checked={settings.sepia} onCheckedChange={(v) => update({ sepia: v })} />
          </Row>
          <Row label="Pure black (AMOLED)" hint="Saves battery in dark mode">
            <Switch checked={settings.amoled} onCheckedChange={(v) => update({ amoled: v })} />
          </Row>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold">Reading</h2>
          <ReadingControls />
        </section>

        <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-lg font-semibold">Daily stories</h2>
          <Row label="Auto-advance" hint="Move to the next story automatically">
            <Switch checked={settings.storyAutoAdvance} onCheckedChange={(v) => update({ storyAutoAdvance: v })} />
          </Row>
        </section>

        <button onClick={reset} className={cn("w-full rounded-2xl border border-border py-3 text-sm font-semibold text-destructive")}>
          Reset all settings
        </button>
        <p className="pb-4 text-center text-xs text-muted-foreground">
          Noor · Quran text from Tanzil · Recitation by Mishary Alafasy (needs internet)
        </p>
      </div>
    </div>
  );
}
