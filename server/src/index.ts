import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { EventSource } from 'eventsource';
import { ChatController } from './controllers/chatController';

// @ts-ignore
global.EventSource = EventSource;

// MCPクライアントの初期化
const mcpClient = new Client(
	{
		name: 'ai-agent-platform-backend',
		version: '1.0.0',
	},
	{
		capabilities: {},
	},
);

const app = express();
app.use(bodyParser.json({ limit: '70mb' }));
app.use(cors());

app.get('/', (req, res) => {
	res.send('change me to see updates, express!');
});

app.post('/chat', async (req, res) => {
	const controller = new ChatController(mcpClient);
	try {
		const result = await controller.chatWithVertexAi(req.body.message ?? '');

		for await (const chunk of result) {
			res.write(
				chunk.candidates ? JSON.stringify(chunk.candidates[0].content) : '',
			);
		}
		res.end();
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.stack);
			res.status(400).json({
				status: 'error',
				message: error.message,
			});
			return;
		}
		res.status(500).json({
			status: 'error',
			message: 'Unexpected Error',
		});
	}
});

if (import.meta.env.PROD) {
	console.log('Attempting to start server...');
	app.listen(3000, async () => {
		console.log(`Server is running on port ${3000}`);
	});
}

export const viteNodeApp = app;
