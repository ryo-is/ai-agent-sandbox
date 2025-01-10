import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

export default defineConfig({
	server: {
		port: 4001,
	},
	build: {
		outDir: 'dist',
		lib: {
			entry: 'src/index.ts',
			formats: ['es'],
			fileName: () => 'index.js',
		},
		target: 'node20',
	},
	plugins: [
		...VitePluginNode({
			adapter: 'express',
			appPath: 'src/index.ts',
		}),
	],
});
