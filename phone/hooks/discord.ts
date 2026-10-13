// Discord's per-message limit.
export const MESSAGE_LIMIT = 2000

// The value of `KEY=value` or `export KEY=value` in a dotenv file; the last
// uncommented assignment wins, as when the file is sourced.
export function envValue(text: string, key: string): string | undefined {
  let value: string | undefined
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m && m[1] === key) value = m[2].trim().replace(/^(['"])(.*)\1$/, '$2')
  }
  return value || undefined
}

// Splits a message into pieces Discord accepts, preferring line breaks.
export function chunk(message: string, limit = MESSAGE_LIMIT): string[] {
  const pieces: string[] = []
  let rest = message
  while (rest.length > limit) {
    const cut = rest.lastIndexOf('\n', limit)
    const at = cut > 0 ? cut : limit
    pieces.push(rest.slice(0, at))
    rest = rest.slice(at).replace(/^\n/, '')
  }
  if (rest.trim()) pieces.push(rest)
  return pieces
}
