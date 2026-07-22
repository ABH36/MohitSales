/**
 * Plain-English → cable-industry-code expansion for search and page filters.
 *
 * Product titles are written in trade shorthand: "Polycab LV AL IEC 60502-1
 * 0.6/1kV MC-3.5 SWA". A buyer searching "armoured aluminium" matches none of
 * it, so every listing looks empty for the most natural query on the site.
 *
 * Expansion is strictly additive — a term still matches its own literal text,
 * so adding a mapping can only surface more products, never hide one. Codes are
 * matched as whole words to keep "AL" from hitting every "ALUMINIUM" substring.
 *
 * Only well-established constructional codes are listed. If a mapping here is
 * wrong for how Mohit Sales' catalogue is written, correcting this one table
 * fixes both the header search and every category filter at once.
 */
export const PRODUCT_SYNONYMS: Record<string, string[]> = {
  // Armour: steel/aluminium wire or strip. W = round wire, F = flat strip.
  armoured: ['SWA', 'AWA', 'STA', '2XWY', '2XFY', 'A2XWY', 'A2XFY'],
  armored: ['SWA', 'AWA', 'STA', '2XWY', '2XFY', 'A2XWY', 'A2XFY'],
  armour: ['SWA', 'AWA', 'STA'],
  armor: ['SWA', 'AWA', 'STA'],
  unarmoured: ['UA'],
  unarmored: ['UA'],

  // Conductor material.
  copper: ['Cu'],
  aluminium: ['AL', 'A2X'],
  aluminum: ['AL', 'A2X'],

  // Insulation.
  xlpe: ['2X'],
  pvc: ['PVC'],

  // Voltage grades, as spoken rather than as printed.
  lt: ['LV'],
  ht: ['MV'],
  'low-tension': ['LV'],
  'high-tension': ['MV'],
};

/**
 * Terms whose plain substring match would otherwise catch their own opposite:
 * "armoured" is literally contained in "unarmoured", so a search for armoured
 * cable returned the unarmoured ranges too. The opposite is removed from the
 * text before the literal test, so only a genuine occurrence counts.
 *
 * Not handled by requiring a word boundary, because the term must still match
 * mid-word for as-you-type filtering ("armou" → armoured) and inside compound
 * codes ("xlpe" → TRXLPE).
 */
const TERM_ANTONYMS: Record<string, RegExp> = {
  armoured: /\bun-?armou?red\b/gi,
  armored: /\bun-?armou?red\b/gi,
  armour: /\bun-?armou?r\w*/gi,
  armor: /\bun-?armou?r\w*/gi,
};

/**
 * Expands one search term into itself plus any code it implies.
 * Unknown terms come back unchanged, so callers can map blindly.
 */
export function expandTerm(term: string): string[] {
  const key = term.trim().toLowerCase();
  if (!key) return [];
  const extra = PRODUCT_SYNONYMS[key];
  return extra ? [key, ...extra.map((c) => c.toLowerCase())] : [key];
}

/**
 * True when `haystack` contains the term or any of its expansions.
 *
 * The literal term keeps substring behaviour so partial typing ("armou") still
 * narrows as you type. Codes are matched at two strictnesses, because the two
 * kinds behave differently in real titles:
 *
 *  - Codes containing a digit ("2X", "A2XWY") are routinely embedded in a
 *    larger code — XLPE armoured aluminium reads "1C-A2XY" — and are specific
 *    enough that matching inside a token is safe.
 *  - Pure-letter codes ("AL", "Cu", "UA") must be a token of their own, or
 *    "aluminium" would match every "met-AL" and "norm-AL" in the catalogue.
 */
export function matchesTerm(haystack: string, term: string): boolean {
  const lower = haystack.toLowerCase();
  const key = term.trim().toLowerCase();
  if (!key) return true;

  const codes = PRODUCT_SYNONYMS[key];
  const tokens = lower.split(/[^a-z0-9.\/]+/).filter(Boolean);

  // Blank out the term's opposite first, so "armoured" cannot match by way of
  // the "armoured" sitting inside "unarmoured".
  const antonym = TERM_ANTONYMS[key];
  const searchable = antonym ? lower.replace(antonym, ' ') : lower;

  // A two-letter trade abbreviation matched as a substring is almost always
  // noise — "lt" hits "healthcare", "ht" hits "lighting" — so those must land
  // on a token. Everything else keeps substring matching for as-you-type use.
  const literalHit = codes && key.length <= 2 ? tokens.includes(key) : searchable.includes(key);
  if (literalHit) return true;
  if (!codes) return false;

  return codes.some((raw) => {
    const code = raw.toLowerCase();
    return /\d/.test(code)
      ? tokens.some((tok) => tok.includes(code))
      : tokens.some((tok) => tok === code);
  });
}
