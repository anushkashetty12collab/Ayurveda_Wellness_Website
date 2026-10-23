/**
 * Dosha / diet / recommend calls:
 * - Dev (recommended): leave REACT_APP_API_URL unset and add "proxy" in package.json
 *   → use relative paths like `/dosha` so the dev server proxies to Flask (avoids CORS).
 * - Prod or custom host: set REACT_APP_API_URL=http://127.0.0.1:5050 (no trailing slash).
 */
export function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = (process.env.REACT_APP_API_URL || "").trim().replace(/\/$/, "");
  if (base) return `${base}${p}`;
  return p;
}