import { writable, derived } from 'svelte/store';
import { diatonicChords } from '$lib/theory/chords.js';
import type { ModeName } from '$lib/theory/modes.js';
import type { Lenses } from '$lib/theory/relationships.js';
import type { Quality } from '$lib/theory/modes.js';
import type { ChordVariation } from '$lib/theory/extensions.js';

export interface ChordRef {
	pc: number;
	quality: Quality;
	variation?: ChordVariation;  // optional decoration: maj7, sus4, add9, etc.
}

export interface ProgressionChord extends ChordRef {
	id: number;
}

export const tonicPc   = writable<number>(0);
export const modeName  = writable<ModeName>('ionian');
export const lenses    = writable<Lenses>({
	diatonic:          true,
	dominant:          true,
	tritoneSub:        false,
	modalInterchange:  false,
	chromaticMediant:  false,
	secondaryDominant: false,
	modalCadence:      false,
});

export const selectedChord = writable<ChordRef | null>(null);
export const hoveredChord  = writable<ChordRef | null>(null);
export const progression   = writable<ProgressionChord[]>([]);
export const pulseId       = writable<number>(0);

// Modulation explorer target (null = no preview key active)
export interface ModulationTarget {
	tonicPc: number;
	modeName: ModeName;
}
export const modulationTarget = writable<ModulationTarget | null>(null);

// Toggle: show voice-leading info on hover/select in ChordInfo
export const showVoiceLeading = writable<boolean>(false);

// Persisted boolean toggle backed by localStorage (safe on SSR — reads lazily on client).
function persistedBool(key: string, initial: boolean) {
	const store = writable<boolean>(initial);
	if (typeof localStorage !== 'undefined') {
		const saved = localStorage.getItem(key);
		if (saved !== null) store.set(saved === '1');
	}
	const persist = (v: boolean) => {
		if (typeof localStorage !== 'undefined') localStorage.setItem(key, v ? '1' : '0');
		return v;
	};
	return {
		subscribe: store.subscribe,
		set: (v: boolean) => store.set(persist(v)),
		update: (fn: (v: boolean) => boolean) => store.update(v => persist(fn(v))),
	};
}

// Toggle: show a guitar chord diagram for the focused chord in ChordInfo
export const showGuitar = persistedBool('hm-show-guitar', true);

// Highlighted modulation path in CircleGraph (set when user clicks a multi-step path)
export interface PathChord { pc: number; quality: Quality; label: string; }
export const selectedModulationPath = writable<PathChord[] | null>(null);

export const diatonicSet = derived(
	[tonicPc, modeName],
	([$tonicPc, $modeName]) => diatonicChords($tonicPc, $modeName),
);

export const targetDiatonicSet = derived(
	modulationTarget,
	($target) => $target ? diatonicChords($target.tonicPc, $target.modeName) : null,
);

function createThemeStore() {
	const store = writable<'dark' | 'light'>('light');
	return {
		subscribe: store.subscribe,
		init() {
			if (typeof localStorage === 'undefined') return;
			const saved = localStorage.getItem('hm-theme') as 'dark' | 'light' | null;
			if (saved) store.set(saved);
		},
		toggle() {
			store.update(t => {
				const next = t === 'dark' ? 'light' : 'dark';
				if (typeof localStorage !== 'undefined') localStorage.setItem('hm-theme', next);
				if (typeof document !== 'undefined') document.documentElement.dataset.theme = next;
				return next;
			});
		},
	};
}
export const theme = createThemeStore();
