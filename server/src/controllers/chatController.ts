import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { ChatService } from '../services/chatService';
import { ChatWithVertexService } from '../services/chatWithVertexService';
import { Readable } from 'node:stream';

export class ChatController {
	private _chatService: ChatService;
	private _chatWithVertexService: ChatWithVertexService;

	constructor(mcpClient: Client) {
		this._chatService = new ChatService(mcpClient);
		this._chatWithVertexService = new ChatWithVertexService(mcpClient);
	}

	async chat(message: string) {
		// AIの応答を生成
		const { content: systemResponse, functionCalls } =
			await this._chatService.generateResponse(message);

		return { systemResponse, functionCalls };
	}

	async chatWithVertexAi(message: string) {
		const result = await this._chatWithVertexService.generateResponse(message);

		return new Readable({
			objectMode: true,
			read() {
				for (const [key, value] of Object.entries(result)) {
					this.push({ [key]: value });
				}
				this.push(null);
			},
		});
	}
}
