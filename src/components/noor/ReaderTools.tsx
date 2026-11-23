import { Type } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ReadingControls } from "./ReadingControls";

export function ReaderTools() {
  return (
    <Sheet>
      <SheetTrigger aria-label="Reading settings" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted">
        <Type className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
        <SheetHeader className="px-0">
          <SheetTitle className="font-display text-xl">Reading settings</SheetTitle>
        </SheetHeader>
        <div className="mx-auto w-full max-w-lg pb-8">
          <ReadingControls />
        </div>
      </SheetContent>
    </Sheet>
  );
}
