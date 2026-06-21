<script lang="ts">
	import { tonicPc, modeName, progression, selectedModulationPath } from '$lib/stores/session.js';
	import { PRESETS, applyPreset, type PresetCategory } from '$lib/theory/presets.js';
	import { canonicalChordLabel } from '$lib/theory/chords.js';
	import { playChord } from '$lib/audio/synth.js';
	import Dropdown from '$lib/components/Dropdown.svelte';

	const CATEGORY_LABELS: Record<PresetCategory, string> = {
		pop:        'Pop / Rock / J-pop',
		cadence:    'Cadences',
		cycle:      'Cycles',
		reharm:     'Reharmonization',
		modulation: 'Modulation',
	};

	const CATEGORY_ORDER: PresetCategory[] = ['pop', 'cadence', 'cycle', 'reharm', 'modulation'];

	let selectedId = $state<string>(PRESETS.find(p => p.category === 'pop')?.id ?? PRESETS[0].id);

	const preset = $derived(PRESETS.find(p => p.id === selectedId)!);

	const presetGroups = CATEGORY_ORDER
		.map(cat => ({
			label: CATEGORY_LABELS[cat],
			options: PRESETS.filter(p => p.category === cat).map(p => ({ value: p.id, label: p.name })),
		}))
		.filter(g => g.options.length > 0);

	const appliedSteps = $derived.by(() => {
		const steps = applyPreset(preset, $tonicPc);
		return steps.map(s => ({
			pc: s.pc,
			quality: s.quality,
			label: canonicalChordLabel(s.pc, s.quality),
			roman: s.roman,
		}));
	});

	function loadPreset() {
		const steps = appliedSteps;
		progression.set(steps.map(s => ({
			pc: s.pc, quality: s.quality,
			id: Date.now() + Math.random(),
		})));
		selectedModulationPath.set(steps.map(s => ({
			pc: s.pc, quality: s.quality, label: s.label,
		})));
	}
</script>

<div class="panel">
	<h3 class="panel-title">Preset Library</h3>

	<div class="preset-select">
		<Dropdown bind:value={selectedId} groups={presetGroups} width={300} ariaLabel="Preset" />
	</div>

	<div class="path-card" role="button" tabindex="0"
		onclick={loadPreset}
		onkeydown={(e) => e.key === 'Enter' && loadPreset()}
		title="Click to load into progression builder and highlight in graph"
	>
		<div class="preset-desc">{preset.description}</div>
		<div class="example">
			{#each appliedSteps as step, i}
				<button
					class="chord-chip"
					onclick={(e) => { e.stopPropagation(); playChord(step.pc, step.quality, $tonicPc, $modeName); }}
				>{step.label}</button>
				{#if i < appliedSteps.length - 1}
					<span class="example-arr">→</span>
				{/if}
			{/each}
		</div>
		{#if preset.hint}
			<p class="hint">{preset.hint}</p>
		{/if}
	</div>
</div>

<style>
	.panel {
		background: linear-gradient(180deg, var(--surface-3) 0%, var(--surface-2) 100%);
		border: 1px solid var(--border-1); border-radius: 6px; padding: 16px 18px;
	}
	.panel-title {
		font-family: 'Crimson Pro', serif; font-size: 0.7rem;
		text-transform: uppercase; letter-spacing: 0.2em;
		color: var(--accent); margin: 0 0 10px; font-weight: 500;
	}

	.preset-select { margin-bottom: 10px; }
	.preset-select :global(.dd) { display: block; width: 100%; }

	.path-card {
		background: var(--surface-1); border: 1px solid var(--border-2); border-radius: 4px;
		padding: 10px 12px; cursor: pointer;
	}
	.path-card:hover { background: var(--surface-hover); border-color: var(--border-3); }

	.preset-desc {
		font-family: 'Crimson Pro', serif; font-style: italic;
		font-size: 0.8rem; color: var(--text-3); margin-bottom: 8px;
	}
	.example { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
	.chord-chip {
		background: var(--surface-4); border: 1px solid var(--border-3); color: var(--text-1);
		padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 0.8rem;
		font-family: 'Outfit', sans-serif;
	}
	.chord-chip:hover { background: var(--surface-5); }
	.example-arr { color: var(--text-5); }
	.hint {
		font-size: 0.75rem; color: var(--text-4); font-style: italic;
		font-family: 'Crimson Pro', serif; margin: 8px 0 0; line-height: 1.4;
	}
</style>
