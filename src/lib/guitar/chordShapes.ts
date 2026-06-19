// Guitar chord shapes sourced from @tombatossals/chords-db (MIT).
// We only read positions for the qualities/variations the app can produce.
// Diagram rendering lives in ChordDiagram.svelte — this module is data only.

import guitarDb from '@tombatossals/chords-db/lib/guitar.json';
import type { Quality } from '$lib/theory/modes.js';
import type { ChordVariation } from '$lib/theory/extensions.js';

export interface GuitarPosition {
	// One entry per string, low-E first → high-E last.
	// -1 = muted, 0 = open, n = fret RELATIVE to baseFret (1 = baseFret).
	frets: number[];
	fingers: number[];   // 0 = none/open, 1–4 = fingers
	baseFret: number;    // fret the diagram window starts on (1 = nut)
	barres: number[];    // relative fret values that are barred
	capo?: boolean;
	midi: number[];
}

export const GUITAR_TUNING = guitarDb.tunings.standard; // ["E2","A2","D3","G3","B3","E4"]

// pitch class → property key used inside guitarDb.chords (note "Csharp"/"Fsharp")
const PC_TO_DB_KEY = [
	'C', 'Csharp', 'D', 'Eb', 'E', 'F', 'Fsharp', 'G', 'Ab', 'A', 'Bb', 'B',
] as const;

// Base triad/seventh quality → chords-db suffix
const QUALITY_SUFFIX: Record<Quality, string> = {
	M: 'major', m: 'minor', d: 'dim', '7': '7',
};

// Variations the app exposes → chords-db suffix. All confirmed present in guitar.json.
const VARIATION_SUFFIX: Record<ChordVariation, string> = {
	M: 'major', m: 'minor', d: 'dim', '7': '7',
	maj7: 'maj7', m7: 'm7', '6': '6', m6: 'm6',
	maj9: 'maj9', m9: 'm9', '9': '9', add9: 'add9', madd9: 'madd9',
	sus2: 'sus2', sus4: 'sus4', '7sus4': '7sus4',
};

interface DbChordEntry {
	key: string;
	suffix: string;
	positions: GuitarPosition[];
}
const CHORDS = guitarDb.chords as unknown as Record<string, DbChordEntry[]>;

/**
 * Look up playable guitar shapes for a chord.
 * Returns an empty array when the database has no entry (caller should hide the diagram).
 */
export function guitarPositions(
	pc: number,
	quality: Quality,
	variation?: ChordVariation,
): GuitarPosition[] {
	const key = PC_TO_DB_KEY[pc];
	const suffix = variation ? VARIATION_SUFFIX[variation] : QUALITY_SUFFIX[quality];
	if (!key || !suffix) return [];
	const entry = CHORDS[key]?.find(c => c.suffix === suffix);
	return entry?.positions ?? [];
}
