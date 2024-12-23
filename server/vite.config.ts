import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

export default defineConfig({
	server: {
		port: 4001,
		open: true,
	},
	plugins: [
		...VitePluginNode({
			adapter: 'express',
			appPath: 'src/index.ts',
		}),
	],
});
