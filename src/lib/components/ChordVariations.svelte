<script lang="ts">
	import { selectedChord, hoveredChord, tonicPc, modeName, progression, type ChordRef } from '$lib/stores/session.js';
	import { variationLabel } from '$lib/theory/chords.js';
	import { VARIATIONS_FOR_QUALITY, type ChordVariation } from '$lib/theory/extensions.js';
	import { playChord } from '$lib/audio/synth.js';

	// Optional explicit chord (used for the default/pinned chord in ChordInfo).
	// Falls back to the hovered/selected chord when not provided.
	// `active` highlights the currently shown variation; `onselect` notifies the
	// parent (ChordInfo) so the guitar diagram can follow the clicked variation.
	let {
		chord = null,
		active = null,
		onselect,
	}: {
		chord?: ChordRef | null;
		active?: ChordVariation | null;
		onselect?: (v: ChordVariation) => void;
	} = $props();
	const focusChord = $derived(chord ?? $selectedChord ?? $hoveredChord);
	const groups = $derived(focusChord ? VARIATIONS_FOR_QUALITY[focusChord.quality] : []);

	// Short group labels for the narrow column next to the diagram.
	const SHORT_GROUP: Record<string, string> = {
		'Triad': 'Triad', 'Sevenths': '7th', 'Extensions': 'Ext',
		'Suspensions': 'Sus', 'Dom 7': 'Dom7',
	};

	function play(variation: ChordVariation) {
		if (!focusChord) return;
		playChord(focusChord.pc, focusChord.quality, $tonicPc, $modeName, '2n', variation);
		onselect?.(variation);
	}

	function addToProgression(variation: ChordVariation) {
		if (!focusChord) return;
		progression.update(p => [...p, {
			pc: focusChord.pc,
			quality: focusChord.quality,
			variation,
			id: Date.now() + Math.random(),
		}]);
		play(variation);
	}
</script>

{#if focusChord && groups.length > 0}
	<div class="variations">
		<div class="vh-row">
			<span class="vh-label">Variations</span>
			<span class="vh-hint">click = play · dbl = add</span>
		</div>
		{#each groups as group}
			{#if group.variations.length > 0}
				<div class="group">
					<span class="group-label">{SHORT_GROUP[group.group] ?? group.group}</span>
					<div class="chips">
						{#each group.variations as v}
							<button
								class="var-chip"
								class:active={v === active}
								onclick={() => play(v)}
								ondblclick={() => addToProgression(v)}
								title="Click to preview · double-click to add to progression"
							>{variationLabel(focusChord.pc, v)}</button>
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	</div>
{/if}

<style>
	.variations { width: 100%; }
	.vh-row { display: flex; justify-content: space-between; align-items: baseline; gap: 6px; margin-bottom: 8px; }
	.vh-label {
		font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-3);
	}
	.vh-hint { font-size: 0.62rem; color: var(--text-5); font-style: italic; font-family: 'Crimson Pro', serif; white-space: nowrap; }

	.group { display: flex; align-items: flex-start; gap: 6px; margin-bottom: 5px; }
	.group-label {
		font-size: 0.62rem; color: var(--text-4); min-width: 30px; padding-top: 4px;
		font-family: 'Outfit', sans-serif; letter-spacing: 0.04em; flex-shrink: 0;
	}
	.chips { display: flex; gap: 4px; flex-wrap: wrap; }
	.var-chip {
		background: var(--surface-4); border: 1px solid var(--border-3); color: var(--text-1);
		padding: 3px 7px; border-radius: 3px; font-size: 0.75rem;
		font-family: 'Outfit', sans-serif; cursor: pointer;
		transition: background 0.12s, border-color 0.12s, color 0.12s;
	}
	.var-chip:hover { background: var(--surface-5); border-color: var(--accent); color: var(--text-0); }
	.var-chip.active {
		border-color: var(--accent); color: var(--accent);
		background: color-mix(in srgb, var(--accent) 16%, transparent);
	}
</style>
