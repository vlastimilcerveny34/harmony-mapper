<script lang="ts">
	import { lenses } from '$lib/stores/session.js';

	const LENS_DEFS = [
		{ key: 'diatonic',          label: 'Diatonic',       color: '#7aa9c9', desc: 'Functional moves within the key', full: 'Functional moves within the key (mode-aware)' },
		{ key: 'dominant',          label: 'Dominant',       color: '#d4a574', desc: 'V7 → I (and V → i)', full: 'V7 → I (and V → i)' },
		{ key: 'secondaryDominant', label: 'Secondary dom.', color: '#e8956d', desc: 'V7/x → a diatonic chord', full: 'V7/ii, V7/iii, V7/IV… → diatonic chord' },
		{ key: 'tritoneSub',        label: 'Tritone sub',    color: '#d97a8e', desc: 'Dom7 ↔ dom7 a tritone away', full: 'Dom7 ↔ dom7 a tritone away' },
		{ key: 'modalInterchange',  label: 'Modal interch.', color: '#8eaf6e', desc: 'Borrowed from parallel mode', full: 'Borrowed from parallel mode' },
		{ key: 'chromaticMediant',  label: 'Chrom. mediant', color: '#b888c4', desc: 'Same-quality chords ±M3/±m3', full: 'Same-quality chords ±M3/±m3' },
		{ key: 'modalCadence',      label: 'Modal cadence',  color: '#c4a04a', desc: 'Cadence that defines the mode', full: 'Defining cadence of current mode (e.g. ♭VII→I in Mixolydian)' },
	] as const;

	let open = $state(false);
	let root: HTMLDivElement;

	const active = $derived(LENS_DEFS.filter(d => $lenses[d.key]));

	function onWindowClick(e: MouseEvent) {
		if (open && root && !root.contains(e.target as Node)) open = false;
	}
	function onWindowKey(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
	}
	function toggle(key: string) {
		lenses.update(s => ({ ...s, [key]: !s[key as keyof typeof s] }));
	}
</script>

<svelte:window onclickcapture={onWindowClick} onkeydown={onWindowKey} />

<div class="lens-control" bind:this={root}>
	<span class="control-label">Lenses</span>
	<button
		class="lens-trigger"
		class:open
		aria-haspopup="listbox"
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		{#if active.length === 0}
			<span class="trigger-empty">None</span>
		{:else}
			<span class="trigger-dots">
				{#each active as d}
					<span class="dot" style:--c={d.color}></span>
				{/each}
			</span>
			<span class="trigger-count">{active.length}</span>
		{/if}
		<span class="caret" class:open>▾</span>
	</button>

	{#if open}
		<div class="lens-panel" role="listbox" aria-label="Harmonic lenses">
			{#each LENS_DEFS as def}
				{@const on = $lenses[def.key]}
				<button
					class="lens-row"
					class:on
					style:--c={def.color}
					role="option"
					aria-selected={on}
					title={def.full}
					onclick={() => toggle(def.key)}
				>
					<span class="dot" class:on></span>
					<span class="name">{def.label}</span>
					<span class="desc">{def.desc}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.lens-control { position: relative; display: flex; align-items: center; gap: 8px; }
	.control-label {
		color: var(--text-3); letter-spacing: 0.1em;
		text-transform: uppercase; font-size: 0.7rem;
	}
	.lens-trigger {
		display: inline-flex; align-items: center; gap: 8px;
		min-width: 64px; padding: 6px 10px;
		background: var(--surface-4); color: var(--text-1);
		border: 1px solid var(--border-3); border-radius: 4px;
		font-family: inherit; font-size: 0.85rem;
	}
	.lens-trigger:hover, .lens-trigger.open { border-color: var(--accent); }
	.trigger-empty { color: var(--text-3); }
	.trigger-dots { display: inline-flex; align-items: center; gap: 3px; }
	.trigger-count { color: var(--text-3); font-size: 0.78rem; }
	.caret { color: var(--text-3); font-size: 0.7rem; margin-left: auto; transition: transform 0.15s; }
	.caret.open { transform: rotate(180deg); }

	.lens-panel {
		position: absolute; top: calc(100% + 6px); right: 0; z-index: 30;
		display: flex; flex-direction: column; gap: 2px;
		width: 340px; padding: 6px;
		background: var(--surface-4); border: 1px solid var(--border-3);
		border-radius: 4px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
	}
	.lens-row {
		display: grid; grid-template-columns: 12px 108px 1fr;
		align-items: center; gap: 8px;
		width: 100%; text-align: left;
		background: transparent; border: 1px solid transparent; border-radius: 5px;
		padding: 5px 8px;
		font-family: 'Outfit', sans-serif;
		transition: background 0.15s, border-color 0.15s;
	}
	.lens-row:hover { background: color-mix(in srgb, var(--c) 9%, transparent); }
	.lens-row.on {
		background: color-mix(in srgb, var(--c) 14%, transparent);
		border-color: color-mix(in srgb, var(--c) 45%, transparent);
	}
	.dot {
		width: 9px; height: 9px; border-radius: 50%;
		background: var(--c); opacity: 0.35; transition: opacity 0.15s;
	}
	.dot.on, .trigger-dots .dot { opacity: 1; }
	.name {
		font-size: 0.8rem; color: var(--text-3);
		white-space: nowrap; transition: color 0.15s;
	}
	.lens-row:hover .name, .lens-row.on .name { color: var(--text-1); }
	.desc {
		font-family: 'Crimson Pro', serif; font-style: italic;
		font-size: 0.78rem; color: var(--text-4);
		white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
	}
</style>
