import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import * as dotenv from 'dotenv';
dotenv.config();
const MCP_SERVER_PORT = process.env.MCP_SERVER_PORT || 3000;

export default defineConfig({
	server: {
		port: Number(MCP_SERVER_PORT),
	},
	build: {
		lib: {
			entry: 'src/sse.ts',
			formats: ['es'],
			fileName: () => 'index.mjs',
		},
		rollupOptions: {
			external: ['@modelcontextprotocol/sdk', 'dotenv'],
		},
	},
	plugins: [
		...VitePluginNode({
			adapter: 'express',
			appPath: 'src/sse.ts',
		}),
	],
});
