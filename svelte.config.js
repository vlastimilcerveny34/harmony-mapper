import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		// Content-Security-Policy. SvelteKit auto-adds nonces/hashes to its own
		// inline scripts (incl. the theme-init script in app.html), so script-src
		// stays strict. style-src needs 'unsafe-inline' for Svelte's runtime
		// `style:` attribute bindings (dynamic lens/diagram colors).
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				// The sha256 covers the inline theme-init script in app.html (not
				// nonced by SvelteKit because it lives in the static template).
				// If that script's text changes, update this hash.
				'script-src': [
					'self',
					'https://va.vercel-scripts.com',
					'sha256-lVaTVUBOZScwAdUlvQp6VP/4nyohQUR7OeUQgnPRNu0='
				],
				// Tone.js spawns its timing Web Worker from a blob: URL.
				'worker-src': ['self', 'blob:'],
				'style-src': ['self', 'unsafe-inline'],
				// data: — Vite inlines small self-hosted font subsets as data: URIs.
				'font-src': ['self', 'data:'],
				'img-src': ['self', 'data:'],
				'connect-src': ['self', 'https://tonejs.github.io', 'https://*.vercel-insights.com'],
				'media-src': ['self', 'https://tonejs.github.io'],
				'object-src': ['none'],
				'base-uri': ['self'],
				'frame-ancestors': ['none']
			}
		}
	}
};

export default config;
