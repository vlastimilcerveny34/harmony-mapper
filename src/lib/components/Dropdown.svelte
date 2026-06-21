<script lang="ts">
	// Reusable single-select dropdown styled to match the Lenses menu, so every
	// dropdown in the app looks and behaves identically (incl. mobile). Replaces
	// native <select> while keeping keyboard + ARIA parity.
	interface Opt { value: unknown; label: string; }
	interface Group { label?: string; options: Opt[]; }

	let {
		value = $bindable(),
		options,
		groups,
		ariaLabel,
		placeholder = 'Select…',
		align = 'left',
		width = 220,
		onchange,
	}: {
		value?: unknown;
		options?: Opt[];
		groups?: Group[];
		ariaLabel?: string;
		placeholder?: string;
		align?: 'left' | 'right';
		width?: number;
		onchange?: (v: unknown) => void;
	} = $props();

	let open = $state(false);
	let activeIndex = $state(0);
	let root: HTMLDivElement;
	let panel = $state<HTMLDivElement>();
	let triggerBtn = $state<HTMLButtonElement>();
	let typeBuffer = '';
	let typeTimer: ReturnType<typeof setTimeout> | undefined;

	const flat = $derived(groups ? groups.flatMap(g => g.options) : (options ?? []));
	const selectedLabel = $derived(flat.find(o => o.value === value)?.label ?? placeholder);

	function openMenu() {
		const sel = flat.findIndex(o => o.value === value);
		activeIndex = sel >= 0 ? sel : 0;
		open = true;
		queueMicrotask(() => { panel?.focus(); scrollActiveIntoView(); });
	}
	function closeMenu(focusTrigger = false) {
		open = false;
		if (focusTrigger) triggerBtn?.focus();
	}
	function select(opt: Opt) {
		value = opt.value;
		onchange?.(opt.value);
		closeMenu(true);
	}
	function scrollActiveIntoView() {
		panel?.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`)
			?.scrollIntoView({ block: 'nearest' });
	}
	function move(delta: number) {
		if (flat.length === 0) return;
		activeIndex = Math.max(0, Math.min(flat.length - 1, activeIndex + delta));
		scrollActiveIntoView();
	}
	function onPanelKey(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowDown': e.preventDefault(); move(1); break;
			case 'ArrowUp':   e.preventDefault(); move(-1); break;
			case 'Home':      e.preventDefault(); activeIndex = 0; scrollActiveIntoView(); break;
			case 'End':       e.preventDefault(); activeIndex = flat.length - 1; scrollActiveIntoView(); break;
			case 'Enter':
			case ' ':         e.preventDefault(); if (flat[activeIndex]) select(flat[activeIndex]); break;
			case 'Escape':    e.preventDefault(); closeMenu(true); break;
			case 'Tab':       closeMenu(); break;
			default:
				if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) typeAhead(e.key);
		}
	}
	function onTriggerKey(e: KeyboardEvent) {
		if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
			e.preventDefault(); openMenu();
		}
	}
	function typeAhead(ch: string) {
		clearTimeout(typeTimer);
		typeBuffer += ch.toLowerCase();
		typeTimer = setTimeout(() => (typeBuffer = ''), 600);
		const i = flat.findIndex(o => o.label.toLowerCase().startsWith(typeBuffer));
		if (i >= 0) { activeIndex = i; scrollActiveIntoView(); }
	}
	function onWindowClick(e: MouseEvent) {
		if (open && root && !root.contains(e.target as Node)) open = false;
	}

	// flat index → render: track a running counter while rendering groups
	function idxOf(opt: Opt): number {
		return flat.indexOf(opt);
	}
</script>

<svelte:window onclickcapture={onWindowClick} />

<div class="dd" bind:this={root} style:--dd-w="{width}px">
	<button
		class="dd-trigger"
		class:open
		bind:this={triggerBtn}
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-label={ariaLabel}
		onclick={() => (open ? closeMenu() : openMenu())}
		onkeydown={onTriggerKey}
	>
		<span class="dd-value">{selectedLabel}</span>
		<span class="dd-caret" class:open>▾</span>
	</button>

	{#if open}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class="dd-panel"
			class:align-right={align === 'right'}
			bind:this={panel}
			role="listbox"
			aria-label={ariaLabel}
			tabindex="-1"
			aria-activedescendant="dd-opt-{activeIndex}"
			onkeydown={onPanelKey}
		>
			{#if groups}
				{#each groups as g}
					{#if g.label}<div class="dd-group-label">{g.label}</div>{/if}
					{#each g.options as opt}
						{@const i = idxOf(opt)}
						<button
							class="dd-option"
							class:selected={opt.value === value}
							class:active={i === activeIndex}
							id="dd-opt-{i}"
							data-idx={i}
							role="option"
							aria-selected={opt.value === value}
							onclick={() => select(opt)}
							onmousemove={() => (activeIndex = i)}
						>{opt.label}</button>
					{/each}
				{/each}
			{:else}
				{#each flat as opt, i}
					<button
						class="dd-option"
						class:selected={opt.value === value}
						class:active={i === activeIndex}
						id="dd-opt-{i}"
						data-idx={i}
						role="option"
						aria-selected={opt.value === value}
						onclick={() => select(opt)}
						onmousemove={() => (activeIndex = i)}
					>{opt.label}</button>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	.dd { position: relative; display: inline-block; }
	.dd-trigger {
		display: inline-flex; align-items: center; gap: 8px;
		width: 100%; min-width: 64px; padding: 6px 10px;
		background: var(--surface-4); color: var(--text-1);
		border: 1px solid var(--border-3); border-radius: 4px;
		font-family: inherit; font-size: 0.85rem; text-align: left;
	}
	.dd-trigger:hover, .dd-trigger.open { border-color: var(--accent); }
	.dd-value { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.dd-caret { color: var(--text-3); font-size: 0.7rem; transition: transform 0.15s; }
	.dd-caret.open { transform: rotate(180deg); }

	.dd-panel {
		position: absolute; top: calc(100% + 6px); left: 0; z-index: 40;
		display: flex; flex-direction: column; gap: 2px;
		width: var(--dd-w); max-width: calc(100vw - 24px);
		max-height: 60vh; overflow-y: auto;
		padding: 6px;
		background: var(--surface-4); border: 1px solid var(--border-3);
		border-radius: 4px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
		outline: none;
	}
	.dd-panel.align-right { left: auto; right: 0; }

	.dd-group-label {
		font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.12em;
		color: var(--text-3); padding: 6px 8px 2px;
	}
	.dd-option {
		display: block; width: 100%; text-align: left;
		background: transparent; border: 1px solid transparent; border-radius: 5px;
		padding: 5px 8px; font-family: inherit; font-size: 0.85rem;
		color: var(--text-2); white-space: nowrap;
	}
	.dd-option.active { background: color-mix(in srgb, var(--accent) 12%, transparent); }
	.dd-option.selected {
		color: var(--text-1);
		border-color: color-mix(in srgb, var(--accent) 45%, transparent);
	}
	.dd-option.selected::after { content: ' ✓'; color: var(--accent); }

	/* Mobile: always anchor left and fit the viewport so the menu can't fall
	   off-screen (native selects open a system picker; ours must stay on-page). */
	@media (max-width: 760px) {
		.dd { display: block; }
		.dd-panel, .dd-panel.align-right {
			left: 0; right: auto; width: min(var(--dd-w), calc(100vw - 24px));
		}
	}
</style>
