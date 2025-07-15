import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	server: {
		fs: {
		  allow: [
			// Allow the project root (automatically allowed by Vite)
			path.resolve(__dirname)
		  ],
		},
	},
	resolve: {
		alias: {
		  os: "os-browserify",
		},
	  },
	plugins: [sveltekit()]
});
