<script lang="ts">
	import { selectedChord, hoveredChord, diatonicSet, showVoiceLeading, showGuitar, lenses, type ChordRef } from '$lib/stores/session.js';
	import { canonicalChordLabel, isDiatonic, getRoman, chordPitches, variationLabel } from '$lib/theory/chords.js';
	import type { ChordVariation } from '$lib/theory/extensions.js';
	import { tonicPc, modeName } from '$lib/stores/session.js'; // needed for chordPitches (audio)
	import { voiceLeading } from '$lib/theory/voiceLeading.js';
	import { MODES, type ModeName } from '$lib/theory/modes.js';
	import { outgoingRelationships, type Relationship } from '$lib/theory/relationships.js';
	import { guitarPositions } from '$lib/guitar/chordShapes.js';
	import ChordVariations from './ChordVariations.svelte';
	import ChordDiagram from './ChordDiagram.svelte';

	const MAJOR_MODES = ['ionian', 'lydian', 'mixolydian'];

	function modalInterchangeHeader(home: ModeName): string {
		const parallel = MODES[home].parallel;
		const parallelLbl = MODES[parallel].label;
		const homeIsMajor = MAJOR_MODES.includes(home);
		const parallelIsMajor = MAJOR_MODES.includes(parallel);
		if (homeIsMajor && !parallelIsMajor) return `Borrowed from parallel minor (${parallelLbl})`;
		if (!homeIsMajor && parallelIsMajor) return `Borrowed from parallel major (${parallelLbl})`;
		return `Borrowed from ${parallelLbl}`;
	}

	const QUALITY_COLOR: Record<string, string> = {
		M: '#e08f9a', m: '#7aa9c9', d: '#b888c4', '7': '#d4a44a',
	};
	const QUALITY_LABEL: Record<string, string> = {
		M: 'major', m: 'minor', d: 'diminished', '7': 'dominant 7',
	};
	const REL_LABELS: Record<string, { color: string; label: string }> = {
		dominant:          { color: '#d4a574', label: 'Dominant resolution' },
		tritoneSub:        { color: '#d97a8e', label: 'Tritone substitution (♭II7)' },
		diatonic:          { color: '#7aa9c9', label: 'Diatonic motion' },
		modalInterchange:  { color: '#8eaf6e', label: 'Modal interchange' }, // overridden dynamically
		chromaticMediant:  { color: '#b888c4', label: 'Chromatic mediants' },
		secondaryDominant: { color: '#e8956d', label: 'Secondary dominants' },
		modalCadence:      { color: '#c4a04a', label: 'Modal cadence' },
	};

	function sectionLabel(type: string): string {
		if (type === 'modalInterchange') return modalInterchangeHeader($modeName);
		return REL_LABELS[type]?.label ?? type;
	}

	// Panel is always present. Three states:
	//  - pinned:  a chord was clicked (selectedChord) → full detail, stays put
	//  - preview: a chord is hovered but none pinned → light info only (no flicker)
	//  - default: nothing hovered/selected → show the key's tonic chord, full detail
	const isPinned  = $derived(!!$selectedChord);
	const isPreview = $derived(!$selectedChord && !!$hoveredChord);
	const isFull    = $derived(!isPreview); // full = pinned or default
	const defaultChord: ChordRef = $derived({ pc: $diatonicSet[0].pc, quality: $diatonicSet[0].quality });
	const displayChord: ChordRef = $derived($selectedChord ?? $hoveredChord ?? defaultChord);

	const label = $derived(canonicalChordLabel(displayChord.pc, displayChord.quality));
	const roman = $derived(getRoman(displayChord.pc, displayChord.quality, $diatonicSet));
	const inKey = $derived(isDiatonic(displayChord.pc, displayChord.quality, $diatonicSet));
	const notes = $derived(
		chordPitches(displayChord.pc, displayChord.quality, $tonicPc, $modeName, 4)
			.map(n => n.replace(/\d/, '')).join(' · ')
	);

	// Relationships are computed for the displayed chord (works for the default tonic too).
	const arrows = $derived(
		isFull ? outgoingRelationships(displayChord, $tonicPc, $modeName, $lenses) : []
	);

	// Which variation the diagram currently shows. null → fall back to the chord's
	// own variation, else its base quality. Clicking a variation chip updates this.
	let activeVariation = $state<ChordVariation | null>(null);
	const effectiveVariation = $derived(
		activeVariation ?? displayChord.variation ?? (displayChord.quality as ChordVariation)
	);
	const shapeLabel = $derived(variationLabel(displayChord.pc, effectiveVariation));

	const positions = $derived(
		$showGuitar && isFull
			? guitarPositions(displayChord.pc, displayChord.quality, effectiveVariation)
			: []
	);

	// Reset voicing + variation whenever the displayed chord changes.
	let posIdx = $state(0);
	$effect(() => {
		void `${displayChord.pc}:${displayChord.quality}:${displayChord.variation}`;
		posIdx = 0;
		activeVariation = null;
	});
	const safeIdx = $derived(positions.length ? Math.min(posIdx, positions.length - 1) : 0);

	const grouped = $derived(() => {
		const m: Record<string, Relationship[]> = {};
		arrows.forEach(a => {
			if (!m[a.type]) m[a.type] = [];
			m[a.type].push(a);
		});
		return m;
	});
</script>

<div class="chord-info panel">
	<div class="header">
		<div class="name-row">
			<span class="chord-name" style:color={QUALITY_COLOR[displayChord.quality]}>{label}</span>
			{#if roman}<span class="roman">{roman}</span>{/if}
		</div>
		{#if isPinned}
			<button class="clear-btn" onclick={() => selectedChord.set(null)}>CLEAR</button>
		{:else if isPreview}
			<span class="state-tag preview">preview</span>
		{:else}
			<span class="state-tag">tonic</span>
		{/if}
	</div>

	<div class="quality-line">
		{QUALITY_LABEL[displayChord.quality]}
		{inKey ? '· diatonic' : '· non-diatonic'}
	</div>

	<div class="notes">{notes}</div>

	{#if isFull}
		<div class="detail">
			{#if $showGuitar}
				<div class="diagram-col">
					{#if positions.length}
						<div class="diagram-caption">{shapeLabel}</div>
						<ChordDiagram position={positions[safeIdx]} />
						{#if positions.length > 1}
							<div class="pos-nav">
								<button
									class="pos-btn"
									aria-label="Previous voicing"
									onclick={() => posIdx = (safeIdx - 1 + positions.length) % positions.length}
								>‹</button>
								<span class="pos-count">{safeIdx + 1} / {positions.length}</span>
								<button
									class="pos-btn"
									aria-label="Next voicing"
									onclick={() => posIdx = (safeIdx + 1) % positions.length}
								>›</button>
							</div>
						{:else}
							<div class="diagram-caption sub">{positions[safeIdx].baseFret === 1 ? 'open' : 'pos. ' + positions[safeIdx].baseFret}</div>
						{/if}
					{:else}
						<p class="no-shape">No standard guitar shape.</p>
					{/if}
				</div>
			{/if}

			<div class="variations-col">
				<ChordVariations
					chord={displayChord}
					active={effectiveVariation}
					onselect={(v) => activeVariation = v}
				/>
			</div>
		</div>

		{#if arrows.length > 0}
			<div class="outgoing-header">
				Outgoing ({arrows.length})
				<button
					class="vl-toggle"
					title="Toggle voice leading info"
					onclick={() => showVoiceLeading.update(v => !v)}
					style:color={$showVoiceLeading ? '#d4a574' : '#7a736a'}
				>VL</button>
			</div>
			<div class="outgoing-list">
				{#each Object.entries(grouped()) as [type, list]}
					<div class="rel-group">
						<div class="rel-type-label" style:color={REL_LABELS[type]?.color}>
							{sectionLabel(type)}
						</div>
						{#each list as arrow}
							{@const vl = $showVoiceLeading
								? voiceLeading(arrow.from.pc, arrow.from.quality, arrow.to.pc, arrow.to.quality)
								: null}
							<div class="rel-row">
								<span class="rel-chord">{canonicalChordLabel(arrow.to.pc, arrow.to.quality)}</span>
								<span class="rel-label">{arrow.label}</span>
								{#if vl}
									<span class="vl-info" title="Common tones · total half-step movement">
										<span class="vl-common">{vl.commonTones.length}♢</span>
										<span class="vl-dist">{vl.totalDistance}½</span>
									</span>
								{/if}
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{:else}
			<p class="no-rels">No outgoing relationships under current lenses. Try enabling more lenses.</p>
		{/if}
	{:else}
		<p class="preview-hint">Click to pin — see variations, guitar shape &amp; relationships.</p>
	{/if}
</div>

<style>
	.chord-info { min-height: 188px; }
	.state-tag {
		font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.12em;
		color: var(--text-4); border: 1px solid var(--border-3);
		padding: 3px 7px; border-radius: 3px; font-family: 'Outfit', sans-serif;
	}
	.state-tag.preview { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 45%, transparent); }
	.preview-hint {
		font-size: 0.8rem; color: var(--text-4); font-style: italic;
		font-family: 'Crimson Pro', serif; margin: 4px 0 0;
	}
	.panel {
		background: linear-gradient(180deg, var(--surface-3) 0%, var(--surface-2) 100%);
		border: 1px solid var(--border-1); border-radius: 6px; padding: 16px 18px;
	}
	.header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px; }
	.name-row { display: flex; align-items: baseline; gap: 10px; }
	.chord-name { font-family: 'Crimson Pro', serif; font-size: 2rem; font-weight: 500; line-height: 1; }
	.roman { font-family: 'Crimson Pro', serif; font-style: italic; font-size: 1.3rem; color: var(--accent); }
	.clear-btn {
		background: transparent; border: 1px solid var(--border-3); color: var(--text-3);
		padding: 3px 8px; border-radius: 3px; font-size: 0.7rem; cursor: pointer;
		font-family: 'Outfit', sans-serif;
	}
	.quality-line { font-size: 0.8rem; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
	.notes { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--text-2); margin-bottom: 12px; }

	.detail {
		display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px;
		margin-bottom: 12px;
	}
	.diagram-col {
		display: flex; flex-direction: column; align-items: center; gap: 3px;
		flex-shrink: 0;
	}
	.variations-col { flex: 1 1 160px; min-width: 150px; }
	.diagram-caption {
		font-family: 'Crimson Pro', serif; font-size: 0.95rem; font-weight: 500;
		color: var(--text-1); line-height: 1;
	}
	.diagram-caption.sub {
		font-family: 'JetBrains Mono', monospace; font-size: 0.62rem;
		font-weight: 400; color: var(--text-4); text-transform: uppercase; letter-spacing: 0.08em;
	}
	.pos-nav { display: flex; align-items: center; gap: 10px; }
	.pos-btn {
		background: transparent; border: 1px solid var(--border-3); color: var(--text-2);
		width: 22px; height: 22px; border-radius: 3px; cursor: pointer;
		font-size: 1rem; line-height: 1; padding: 0;
	}
	.pos-count { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--text-3); }
	.no-shape { font-size: 0.78rem; color: var(--text-4); font-style: italic; font-family: 'Crimson Pro', serif; }
	.outgoing-header {
		font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em;
		color: var(--text-3); margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;
	}
	.vl-toggle {
		background: transparent; border: 1px solid var(--border-3); padding: 2px 6px;
		border-radius: 3px; font-size: 0.65rem; cursor: pointer;
		font-family: 'Outfit', sans-serif; letter-spacing: 0.1em;
	}
	.vl-info { margin-left: auto; display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; }
	.vl-common { color: #8eaf6e; }
	.vl-dist { color: var(--accent); }
	.outgoing-list { max-height: 220px; overflow-y: auto; padding-right: 4px; }
	.rel-group { margin-bottom: 8px; }
	.rel-type-label { font-size: 0.7rem; letter-spacing: 0.05em; margin-bottom: 3px; }
	.rel-row { display: flex; align-items: center; gap: 8px; padding: 2px 0 2px 8px; }
	.rel-chord { font-size: 0.85rem; color: var(--text-1); font-weight: 500; min-width: 44px; }
	.rel-label { font-family: 'Crimson Pro', serif; font-style: italic; font-size: 0.78rem; color: var(--text-3); }
	.no-rels { font-size: 0.8rem; color: var(--text-4); font-style: italic; font-family: 'Crimson Pro', serif; margin-top: 8px; }
</style>
