import { toast } from "sonner";
import { isNative } from "./native";

export async function shareText(text: string, title = "Noor") {
  try {
    if (isNative()) {
      const { Share } = await import("@capacitor/share");
      await Share.share({ title, text, dialogTitle: "Share" });
      return;
    }
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title, text });
      return;
    }
  } catch {
    /* user cancelled or unsupported: fall back to copy */
    return;
  }
  await copyText(text);
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied");
  } catch {
    toast.error("Couldn't copy");
  }
}
