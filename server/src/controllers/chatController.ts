import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { ChatService } from '../services/chatService';
import { ChatWithVertexService } from '../services/chatWithVertexService';

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
		const { content: systemResponse } =
			await this._chatWithVertexService.generateResponse(message);
		return { systemResponse };
	}
}
