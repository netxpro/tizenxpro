export function getApiUrl() {
  return localStorage.getItem("apiUrl") || import.meta.env.VITE_API_BASE;
}