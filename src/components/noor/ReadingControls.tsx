import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useSettings, type ArabicFont, type ReadingLayout, type TranslationLang } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const ARABIC_FONTS: { id: ArabicFont; label: string; family: string }[] = [
  { id: "amiri-quran", label: "Amiri Quran", family: "Amiri Quran" },
  { id: "amiri", label: "Amiri", family: "Amiri" },
  { id: "scheherazade", label: "Scheherazade", family: "Scheherazade New" },
  { id: "naskh", label: "Noto Naskh", family: "Noto Naskh Arabic" },
  { id: "lateef", label: "Lateef", family: "Lateef" },
  { id: "kufi", label: "Reem Kufi", family: "Reem Kufi" },
];

export const TRANSLATIONS: { id: TranslationLang; label: string; note: string }[] = [
  { id: "en", label: "English", note: "Saheeh International" },
  { id: "ur", label: "اردو Urdu", note: "Jalandhry" },
  { id: "hi", label: "हिन्दी Hindi", note: "Suhel Farooq Khan" },
  { id: "none", label: "Arabic only", note: "No translation" },
];

export function Chip({ active, onClick, children, className }: { active: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all",
        active ? "border-primary bg-primary-soft text-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ReadingControls() {
  const { settings, update } = useSettings();
  return (
    <div className="space-y-6">
      <div>
        <Label>Arabic font</Label>
        <div className="grid grid-cols-2 gap-2">
          {ARABIC_FONTS.map((f) => (
            <Chip key={f.id} active={settings.arabicFont === f.id} onClick={() => update({ arabicFont: f.id })} className="text-left">
              <span className="block text-xl leading-loose" style={{ fontFamily: `"${f.family}"` }} dir="rtl">
                بِسْمِ ٱللَّهِ
              </span>
              <span className="text-xs">{f.label}</span>
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <Label right={`${settings.arabicSize}px`}>Arabic size</Label>
        <Slider min={20} max={48} step={1} value={[settings.arabicSize]} onValueChange={([v]) => update({ arabicSize: v ?? 30 })} />
        <p className="font-arabic mt-3 text-center leading-loose" style={{ fontSize: settings.arabicSize }}>
          ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ
        </p>
      </div>

      <div>
        <Label>Translation</Label>
        <div className="grid grid-cols-2 gap-2">
          {TRANSLATIONS.map((t) => (
            <Chip key={t.id} active={settings.translation === t.id} onClick={() => update({ translation: t.id })} className="text-left">
              <span className="block">{t.label}</span>
              <span className="text-xs opacity-75">{t.note}</span>
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <Label right={`${settings.translationSize}px`}>Translation size</Label>
        <Slider min={12} max={26} step={1} value={[settings.translationSize]} onValueChange={([v]) => update({ translationSize: v ?? 16 })} />
      </div>

      <div>
        <Label>Reading style</Label>
        <div className="grid grid-cols-2 gap-2">
          {([
            ["verse", "Verse by verse", "Arabic + translation"],
            ["mushaf", "Mushaf", "Flowing Arabic text"],
          ] as [ReadingLayout, string, string][]).map(([id, label, note]) => (
            <Chip key={id} active={settings.layout === id} onClick={() => update({ layout: id })} className="text-left">
              <span className="block">{label}</span>
              <span className="text-xs opacity-75">{note}</span>
            </Chip>
          ))}
        </div>
      </div>

      <Row label="Show transliteration" hint="Roman letters to help with reading">
        <Switch checked={settings.showTransliteration} onCheckedChange={(v) => update({ showTransliteration: v })} />
      </Row>
    </div>
  );
}

export function Label({ children, right }: { children: React.ReactNode; right?: string }) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <p className="text-sm font-semibold">{children}</p>
      {right && <span className="text-xs text-muted-foreground">{right}</span>}
    </div>
  );
}

export function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
