/**
 * Format a year range for display: "1940 – 2010" / "1985 –"
 */
export function formatLifespan(birthYear?: number, deathYear?: number): string {
  if (!birthYear) return '';
  const end = deathYear ? String(deathYear) : '';
  return `${birthYear} – ${end}`;
}

/**
 * Generate a short unique id (not cryptographically secure — use for UI keys only).
 */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Truncate a string to maxLen characters, appending "…" if truncated.
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

/**
 * Capitalize first letter of each word.
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Safely get an environment variable; throw at runtime if missing.
 */
export function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}
