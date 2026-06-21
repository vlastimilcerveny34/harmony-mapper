import type { Handle } from '@sveltejs/kit';

// Static security headers applied to every response. (CSP is configured
// separately via kit.csp in svelte.config.js so SvelteKit can nonce/hash its
// own inline scripts.) HSTS is added by Vercel at the edge in production.
export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set(
		'Permissions-Policy',
		'camera=(), microphone=(), geolocation=(), browsing-topics=()'
	);
	return response;
};
