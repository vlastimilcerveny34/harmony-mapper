<script lang="ts">
	import type { GuitarPosition } from '$lib/guitar/chordShapes.js';

	let { position, showFingers = true }: { position: GuitarPosition; showFingers?: boolean } = $props();

	const N_STRINGS = 6;

	// How many fret rows to draw (at least 4, grow if a shape reaches higher).
	const nFrets = $derived(Math.max(4, ...position.frets.filter(f => f > 0)));

	// Geometry (SVG user units).
	const padX = 16;       // left/right padding (room for baseFret label)
	const padTop = 20;     // room for x/o markers above the nut
	const padBottom = 6;
	const stringGap = 16;
	const fretGap = 20;

	const gridW = $derived((N_STRINGS - 1) * stringGap);
	const gridH = $derived(nFrets * fretGap);
	const width = $derived(gridW + padX * 2);
	const height = $derived(gridH + padTop + padBottom);

	const isOpenShape = $derived(position.baseFret === 1);

	const stringX = (i: number) => padX + i * stringGap;
	const fretY = (f: number) => padTop + f * fretGap;          // line index 0..nFrets
	const dotY = (rel: number) => padTop + (rel - 0.5) * fretGap; // centre of relative fret

	// Barre segments: span the strings that share each barred fret value.
	const barres = $derived(position.barres.map(bf => {
		const idxs = position.frets.map((f, i) => (f === bf ? i : -1)).filter(i => i >= 0);
		return { fret: bf, from: Math.min(...idxs), to: Math.max(...idxs) };
	}).filter(b => b.from !== b.to || b.from >= 0));

	const isBarred = (rel: number) => position.barres.includes(rel);
</script>

<svg
	viewBox="0 0 {width} {height}"
	width={width}
	height={height}
	class="diagram"
	role="img"
	aria-label="Guitar chord diagram"
>
	<!-- open / muted markers -->
	{#each position.frets as f, i}
		{#if f === 0}
			<circle cx={stringX(i)} cy={padTop - 9} r="3.5" class="mark-open" />
		{:else if f === -1}
			<g class="mark-mute">
				<line x1={stringX(i) - 3.5} y1={padTop - 12.5} x2={stringX(i) + 3.5} y2={padTop - 5.5} />
				<line x1={stringX(i) - 3.5} y1={padTop - 5.5} x2={stringX(i) + 3.5} y2={padTop - 12.5} />
			</g>
		{/if}
	{/each}

	<!-- fret lines -->
	{#each Array(nFrets + 1) as _, f}
		<line
			x1={padX} y1={fretY(f)} x2={padX + gridW} y2={fretY(f)}
			class="grid {f === 0 && isOpenShape ? 'nut' : ''}"
		/>
	{/each}

	<!-- string lines -->
	{#each Array(N_STRINGS) as _, i}
		<line x1={stringX(i)} y1={fretY(0)} x2={stringX(i)} y2={fretY(nFrets)} class="grid" />
	{/each}

	<!-- baseFret label for barre/position shapes -->
	{#if !isOpenShape}
		<text x={padX - 6} y={dotY(1)} class="basefret" text-anchor="end" dominant-baseline="middle">
			{position.baseFret}
		</text>
	{/if}

	<!-- barres -->
	{#each barres as b}
		<rect
			x={stringX(b.from) - 6} y={dotY(b.fret) - 6}
			width={stringX(b.to) - stringX(b.from) + 12} height="12"
			rx="6" class="barre"
		/>
	{/each}

	<!-- finger dots -->
	{#each position.frets as f, i}
		{#if f > 0 && !isBarred(f)}
			<circle cx={stringX(i)} cy={dotY(f)} r="6" class="dot" />
			{#if showFingers && position.fingers[i] > 0}
				<text x={stringX(i)} y={dotY(f)} class="finger" text-anchor="middle" dominant-baseline="central">
					{position.fingers[i]}
				</text>
			{/if}
		{/if}
	{/each}
</svg>

<style>
	.diagram { display: block; }
	.grid { stroke: var(--border-3); stroke-width: 1; }
	.nut { stroke: var(--text-2); stroke-width: 3; }
	.dot { fill: var(--accent); }
	.barre { fill: var(--accent); }
	.finger { fill: var(--surface-2); font-family: 'Outfit', sans-serif; font-size: 8px; font-weight: 600; }
	.basefret { fill: var(--text-3); font-family: 'JetBrains Mono', monospace; font-size: 9px; }
	.mark-open { fill: none; stroke: var(--text-3); stroke-width: 1.5; }
	.mark-mute line { stroke: var(--text-4); stroke-width: 1.5; }
</style>
