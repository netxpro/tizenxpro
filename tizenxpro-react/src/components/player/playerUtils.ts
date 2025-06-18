import { getApiUrl } from "@/components/get"; 
import type { UserSettings } from "@/types/userSettings";

export function formatTime(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

  
export function proxify(settings: UserSettings, url: string) {
  const API_BASE = getApiUrl();
  const platform = settings.platform;

  // Proxy-URL?
  if (url.startsWith(API_BASE) && url.includes("/proxy?url=")) return `${encodeURIComponent(url)}`;
  if (url.startsWith("/api/") && url.includes("/proxy?url=")) return `${encodeURIComponent(url)}`;

  if (url.startsWith("%3A") || url.startsWith("%2F") || url.includes("%3A")) {
    return `${API_BASE}/${platform}/proxy?url=${url}`;
  }

  // Original-URL
  return `${API_BASE}/${platform}/proxy?url=${encodeURIComponent(url)}`;
}