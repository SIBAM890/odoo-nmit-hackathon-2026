/**
 * Safely parse an ISO timestamp returned by PostgreSQL/FastAPI.
 * PostgreSQL returns timestamps like "2026-08-15T08:30:00+00:00" or
 * "2026-08-15T08:30:00" (naive UTC). Appending 'Z' to an already-offset
 * string produces an invalid date. This helper handles both cases.
 */
export function parseTimestamp(s) {
  if (!s) return null
  // If already has timezone (Z, +HH:MM, -HH:MM) use as-is; else treat as UTC
  const str = /[Zz]$|[+-]\d{2}:\d{2}$/.test(s) ? s : s + 'Z'
  const d = new Date(str)
  return isNaN(d.getTime()) ? null : d
}
