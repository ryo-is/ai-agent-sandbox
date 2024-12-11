import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { EventSource } from 'eventsource';
import { ChatController } from './controllers/chatController';

// @ts-ignore
global.EventSource = EventSource;

let mcpClient: Client;

async function initialize() {
	// リクエストが来るたびにここを通ってしまうので、すでにmcpClientが初期化されているのであればスキップする
	if (mcpClient) {
		return;
	}

	// MCPクライアントの初期化
	mcpClient = new Client(
		{
			name: 'ai-agent-platform-backend',
			version: '1.0.0',
		},
		{
			capabilities: {},
		},
	);

	// SSE transportの設定
	const transport = new SSEClientTransport(
		new URL('http://localhost:3334/events'),
	);

	try {
		await mcpClient.connect(transport);
		console.log('MCPサーバーに接続しました');
	} catch (error) {
		console.error('MCPサーバーへの接続に失敗しました:', error);
		throw error;
	}
}

await initialize();

const app = express();
app.use(bodyParser.json({ limit: '70mb' }));
app.use(cors());

app.get('/', (req, res) => {
	res.send('change me to see updates, express!');
});

app.post('/chat', async (req, res) => {
	const controller = new ChatController(mcpClient);
	const result = await controller.chat(req.body.message ?? '');
	res.json(result);
});

if (import.meta.env.PROD) {
	app.listen(3000);
	console.log('listening on http://localhost:3000/');
}

export const viteNodeApp = app;
