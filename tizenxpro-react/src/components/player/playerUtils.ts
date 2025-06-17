export function formatTime(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function proxify(API_BASE: string, platform: string, source: string, url: string) {
  // if (source === "xhamster" || source === "hstream") {
  //   return url;
  // }
  console.log(source, url);
  return `${API_BASE}/${platform}/proxy?url=${encodeURIComponent(url)}`;
}