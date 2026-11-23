import { Capacitor } from "@capacitor/core";

export const isNative = () => Capacitor.isNativePlatform();

let backBound = false;

/** Android hardware back button: go back in history, exit on the home screen. */
export async function bindBackButton() {
  if (!isNative() || backBound) return;
  backBound = true;
  const { App } = await import("@capacitor/app");
  await App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack && window.location.pathname !== "/") window.history.back();
    else void App.exitApp();
  });
}

export async function syncStatusBar(dark: boolean) {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light });
    await StatusBar.setBackgroundColor({ color: dark ? "#0f1a17" : "#f8f4ec" });
  } catch {
    /* status bar plugin unavailable */
  }
}
