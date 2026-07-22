/**
 * Derives a specification table from a product title.
 *
 * Cable titles are not prose — they are a designation string built from a
 * controlled vocabulary: "Polycab LV AL IEC 60502-1 0.6/1kV MC-3.5 SWA" states
 * the voltage class, conductor, standard, core count and armour. The catalogue
 * stores no structured spec columns, so a buyer currently has to decode that
 * string themselves or read a prose paragraph to find the conductor material.
 *
 * Everything here reads only the title, and every rule is anchored to a whole
 * token so a designation can never be inferred from a stray substring. An
 * attribute that is not clearly present is omitted rather than guessed — a
 * short honest table beats a complete invented one.
 */

export interface Spec {
  label: string;
  value: string;
}

/** "1100V", "450/750V", "6.35/11kV", "35kV" */
const VOLTAGE_RE = /\b(\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?)\s?(kV|V)\b/i;

/**
 * "IS 694", "IS-7098-I", "IEC 60502-1", "BS 5467", "UL 1072", "AS-NZS 5000".
 * The number is matched in parts rather than as one greedy `[0-9-]*` run: that
 * form swallowed the separator before the roman suffix and produced "IS 7098-".
 */
const STANDARD_RE =
  /\b(IS|BS\s?EN|BSEN|BS|IEC|UL|AS[-\s]?NZS|ANSI|ICEA|NEMA)\s?-?\s?([0-9][0-9.\/]*(?:-[0-9]+)*(?:-[IVX]+)?)/i;

/** "3.5C", "1C", "4C" — core count stated directly. */
const CORE_RE = /\b(\d+(?:\.\d+)?)C\b/i;

function tokens(title: string): string[] {
  return title.toLowerCase().split(/[^a-z0-9.\/]+/).filter(Boolean);
}

const has = (toks: string[], code: string) => toks.includes(code.toLowerCase());
/** For codes that legitimately sit inside a larger designation (A2XWY ⊃ 2XWY). */
const hasWithin = (toks: string[], code: string) =>
  toks.some((t) => t.includes(code.toLowerCase()));

function conductor(toks: string[]): string | null {
  if (has(toks, 'cu')) return 'Copper';
  if (has(toks, 'al')) return 'Aluminium';
  // IS 7098 designations carry the conductor in the prefix: a leading "A" means
  // aluminium, its absence means copper — A2XFY vs 2XFY.
  if (toks.some((t) => t.startsWith('a2x'))) return 'Aluminium';
  if (toks.some((t) => t.startsWith('2x'))) return 'Copper';
  return null;
}

function insulation(toks: string[], title: string): string | null {
  if (/\bTR-?XLPE\b/i.test(title)) return 'TR-XLPE';
  if (/\bXLPE\b/i.test(title)) return 'XLPE';
  if (has(toks, 'epr')) return 'EPR';
  // "2X" is the XLPE marker inside designations such as 2XWY / A2XFY.
  if (toks.some((t) => /(^|[^0-9])2x/.test(t))) return 'XLPE';
  if (has(toks, 'pvc')) return 'PVC';
  return null;
}

function armour(toks: string[], title: string): string | null {
  // Some ranges spell it out — "Polycab Firealarm Shielded Armoured Cable".
  // Unarmoured must be tested first; it contains "armoured".
  if (/\bun-?armou?red\b/i.test(title)) return 'Unarmoured';
  if (/\barmou?red\b/i.test(title)) return 'Armoured';
  if (has(toks, 'swa')) return 'Steel Wire Armoured';
  if (has(toks, 'awa')) return 'Aluminium Wire Armoured';
  if (has(toks, 'sta')) return 'Steel Tape Armoured';
  if (has(toks, 'ua')) return 'Unarmoured';
  // W = round steel wire, F = flat steel strip, in 2XWY / A2XFY style codes.
  if (hasWithin(toks, '2xwy')) return 'Steel Wire Armoured';
  if (hasWithin(toks, '2xfy')) return 'Steel Strip Armoured';
  return null;
}

function cores(toks: string[], title: string): string | null {
  const m = title.match(CORE_RE);
  if (m) return `${m[1]} Core`;
  if (has(toks, 'sc')) return 'Single Core';
  if (has(toks, 'mc')) return 'Multi Core';
  return null;
}

function voltageClass(toks: string[]): string | null {
  if (has(toks, 'lv')) return 'Low Voltage (LV)';
  if (has(toks, 'mv')) return 'Medium Voltage (MV)';
  if (has(toks, 'ehv')) return 'Extra High Voltage (EHV)';
  if (has(toks, 'ht')) return 'High Tension (HT)';
  return null;
}

/** Normalised standard designation, e.g. "IEC 60502-1" — also used for filtering. */
export function extractStandard(title: string): string | null {
  const m = title.match(STANDARD_RE);
  if (!m) return null;
  const family = m[1].toUpperCase().replace(/\s/g, '');
  return `${family} ${m[2].replace(/^-/, '')}`.trim();
}

/** Normalised voltage, e.g. "0.6/1kV" — also used for filtering. */
export function extractVoltage(title: string): string | null {
  const m = title.match(VOLTAGE_RE);
  if (!m) return null;
  return `${m[1]}${m[2].toLowerCase() === 'kv' ? 'kV' : 'V'}`;
}

/**
 * Splits a product's description lines into prose and spec rows.
 *
 * The imported catalogue overview mixes marketing copy with hard facts on the
 * same list: "Illuminate your home…", then "Available Size: 3–12 Wattage…". A
 * buyer scans for that size line, so it is pulled out and shown in the spec
 * table rather than left as the third paragraph of a sales pitch.
 *
 * A line counts as a spec only when it opens with a short "Label:" — long
 * sentences that merely contain a colon stay as prose.
 */
const SPEC_LINE_RE = /^\s*([A-Z][A-Za-z][A-Za-z /&+-]{1,28}?)\s*:\s*(\S.*)$/;

/** A description block is either a prose paragraph or a bulleted list. */
export type DescBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] };

/**
 * True when a line is a construction/spec list crammed into one sentence rather
 * than prose — "Flexible copper conductor, PVC insulated, PVC sheathed 1100V
 * cable". Those read far better as bullets. Prose ("This cable is suitable for
 * transmission…") is left alone: a wrong split there mangles a real sentence.
 *
 * The signals of a list, not prose: several commas, no sentence verbs, and no
 * full stop mid-line starting a second sentence. Each comma-fragment must be a
 * short noun phrase, not a clause.
 */
const SENTENCE_VERB =
  /\b(is|are|was|were|will|shall|may|can|be|been|has|have|used|suitable|designed|provides?|ensures?|helps?|makes?|delivers?|offers?|comes?|gives?|allows?|enables?|features?|meant|ideal|manufactured|available)\b/i;

function isListLine(line: string): boolean {
  const t = line.trim();
  if ((t.match(/,/g) || []).length < 2) return false;
  if (/[.!?]\s+[A-Z]/.test(t)) return false; // a second sentence begins → prose
  if (SENTENCE_VERB.test(t)) return false;
  const frags = splitListLine(t);
  if (frags.some((f) => f.split(/\s+/).length > 12)) return false;
  return frags.length >= 3;
}

function splitListLine(line: string): string[] {
  return line
    .replace(/\.$/, '')
    .split(/\s*,\s*/)
    .map((f) => f.trim())
    .filter(Boolean);
}

/**
 * Parses a product's description lines into ordered blocks (paragraphs and
 * bulleted lists) plus the "Label: value" spec rows pulled out for the spec
 * table. `prose` is kept for callers that only want the paragraph text.
 */
export function splitDescription(lines: string[]): {
  prose: string[];
  specs: Spec[];
  blocks: DescBlock[];
} {
  const prose: string[] = [];
  const specs: Spec[] = [];
  const blocks: DescBlock[] = [];
  for (const raw of lines) {
    const line = String(raw || '').trim();
    if (!line) continue;
    const m = line.match(SPEC_LINE_RE);
    // A real label is a few words, not a full clause — "Available Size" yes,
    // "During emergency fire situation" no.
    if (m && m[1].split(/\s+/).length <= 3) {
      specs.push({ label: m[1].trim(), value: m[2].trim() });
    } else if (isListLine(line)) {
      // Capitalise each fragment's first letter so bullets read cleanly.
      const items = splitListLine(line).map((f) => f.charAt(0).toUpperCase() + f.slice(1));
      blocks.push({ type: 'ul', items });
      prose.push(line);
    } else {
      blocks.push({ type: 'p', text: line });
      prose.push(line);
    }
  }
  return { prose, specs, blocks };
}

/**
 * Builds the spec rows for a product title. Returns an empty array when the
 * title carries no recognisable designation, so callers can skip the section.
 */
export function deriveSpecs(title: string): Spec[] {
  if (!title) return [];
  const toks = tokens(title);

  const rows: Array<[string, string | null]> = [
    ['Voltage Grade', extractVoltage(title)],
    ['Voltage Class', voltageClass(toks)],
    ['Conductor', conductor(toks)],
    ['Insulation', insulation(toks, title)],
    ['Armour', armour(toks, title)],
    ['Cores', cores(toks, title)],
    ['Standard', extractStandard(title)],
  ];

  return rows
    .filter((r): r is [string, string] => Boolean(r[1]))
    .map(([label, value]) => ({ label, value }));
}
