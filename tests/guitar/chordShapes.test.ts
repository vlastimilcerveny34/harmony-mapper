import { describe, it, expect } from 'vitest';
import { guitarPositions } from '../../src/lib/guitar/chordShapes.js';

describe('guitarPositions', () => {
	it('returns shapes for a basic major triad (C, pc=0)', () => {
		const pos = guitarPositions(0, 'M');
		expect(pos.length).toBeGreaterThan(0);
		expect(pos[0].frets).toHaveLength(6);
		expect(pos[0].baseFret).toBeGreaterThanOrEqual(1);
	});

	it('maps minor quality (Am, pc=9)', () => {
		expect(guitarPositions(9, 'm').length).toBeGreaterThan(0);
	});

	it('maps dominant 7 (G7, pc=7)', () => {
		expect(guitarPositions(7, '7').length).toBeGreaterThan(0);
	});

	it('uses the sharp db key for pc=1 and pc=6 (Csharp / Fsharp)', () => {
		expect(guitarPositions(1, 'm', 'm7').length).toBeGreaterThan(0); // C#m7
		expect(guitarPositions(6, 'M').length).toBeGreaterThan(0);        // F#
	});

	it('resolves every variation the app exposes', () => {
		const variations = [
			'maj7', 'm7', '6', 'm6', 'maj9', 'm9', '9', 'add9', 'madd9',
			'sus2', 'sus4', '7sus4',
		] as const;
		for (const v of variations) {
			// C-rooted (pc=0) is present for all of these suffixes in the db
			expect(guitarPositions(0, 'M', v).length, `variation ${v}`).toBeGreaterThan(0);
		}
	});

	it('frets/fingers arrays are well-formed', () => {
		const p = guitarPositions(0, 'M')[0];
		expect(p.fingers).toHaveLength(6);
		for (const f of p.frets) expect(f).toBeGreaterThanOrEqual(-1);
	});
});
