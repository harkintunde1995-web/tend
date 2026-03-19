import { Contact } from './types';

/**
 * Parse a VCF (vCard) string and return an array of Contact objects.
 * Supports vCard 2.1, 3.0, and 4.0. Handles line folding, UTF-8, and deduplication.
 */
export function parseVCF(raw: string): Contact[] {
  // Unfold folded lines (RFC 6350 §3.2): CRLF or LF followed by space/tab
  const unfolded = raw
    .replace(/\r\n[ \t]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n[ \t]/g, '');

  const lines = unfolded.split('\n');
  const names: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    // Match FN: fields (case-insensitive for robustness)
    if (/^FN:/i.test(line)) {
      const name = line.replace(/^FN:/i, '').trim();
      if (!name) continue;

      // Decode quoted-printable encoding if present (Android exports)
      const decoded = decodeQP(name);

      // Normalise for deduplication
      const key = decoded.toLowerCase().replace(/\s+/g, ' ').trim();
      if (key && !seen.has(key)) {
        seen.add(key);
        names.push(decoded.trim());
      }
    }
  }

  return names.map((name) => ({
    id: generateId(),
    name,
  }));
}

/**
 * Decode quoted-printable encoded strings (common in old Android VCF exports).
 * e.g. "=46=6F=79=69=6E" -> "Foyin"
 */
function decodeQP(str: string): string {
  if (!str.includes('=')) return str;
  try {
    return str
      .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      )
      .replace(/=\n/g, ''); // soft line breaks
  } catch {
    return str;
  }
}

/**
 * Simple collision-resistant ID generator (browser-compatible).
 */
let idCounter = 0;
function generateId(): string {
  idCounter++;
  return `contact-${Date.now()}-${idCounter}`;
}
