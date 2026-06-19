<script lang="ts">
	import { lenses } from '$lib/stores/session.js';

	const LENS_DEFS = [
		{ key: 'diatonic',          label: 'Diatonic',        color: '#7aa9c9', desc: 'Functional moves within the key (mode-aware)' },
		{ key: 'dominant',          label: 'Dominant',        color: '#d4a574', desc: 'V7 → I (and V → i)' },
		{ key: 'secondaryDominant', label: 'Secondary dom.',  color: '#e8956d', desc: 'V7/ii, V7/iii, V7/IV… → diatonic chord' },
		{ key: 'tritoneSub',        label: 'Tritone sub',     color: '#d97a8e', desc: 'Dom7 ↔ dom7 a tritone away' },
		{ key: 'modalInterchange',  label: 'Modal interch.',  color: '#8eaf6e', desc: 'Borrowed from parallel mode' },
		{ key: 'chromaticMediant',  label: 'Chrom. mediant',  color: '#b888c4', desc: 'Same-quality chords ±M3/±m3' },
		{ key: 'modalCadence',      label: 'Modal cadence',   color: '#c4a04a', desc: 'Defining cadence of current mode (e.g. ♭VII→I in Mixolydian)' },
	] as const;
</script>

<div class="lens-chips" role="group" aria-label="Harmonic lenses">
	<span class="chips-title">Lenses</span>
	{#each LENS_DEFS as def}
		{@const on = $lenses[def.key]}
		<button
			class="chip"
			class:on
			style:--c={def.color}
			title={def.desc}
			aria-pressed={on}
			onclick={() => lenses.update(s => ({ ...s, [def.key]: !s[def.key] }))}
		>
			<span class="dot"></span>{def.label}
		</button>
	{/each}
</div>

<style>
	.lens-chips {
		display: flex; flex-wrap: wrap; align-items: center;
		justify-content: center; gap: 6px;
		margin-top: 14px; max-width: 560px;
	}
	.chips-title {
		font-family: 'Crimson Pro', serif; font-size: 0.7rem;
		text-transform: uppercase; letter-spacing: 0.2em;
		color: var(--accent); margin-right: 4px;
	}
	.chip {
		display: inline-flex; align-items: center; gap: 6px;
		background: transparent; border: 1px solid var(--border-3);
		color: var(--text-3); padding: 4px 10px; border-radius: 14px;
		font-family: 'Outfit', sans-serif; font-size: 0.75rem;
		cursor: pointer; transition: background 0.15s, border-color 0.15s, color 0.15s;
	}
	.chip:hover { border-color: var(--c); color: var(--text-1); }
	.chip.on {
		border-color: var(--c); color: var(--text-1);
		background: color-mix(in srgb, var(--c) 18%, transparent);
	}
	.dot {
		width: 8px; height: 8px; border-radius: 50%;
		background: var(--c); opacity: 0.45; transition: opacity 0.15s;
	}
	.chip.on .dot { opacity: 1; }
</style>
