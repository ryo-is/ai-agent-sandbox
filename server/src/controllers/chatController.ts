import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { ChatService } from '../services/chatService';

export class ChatController {
	private _chatService: ChatService;

	constructor(mcpClient: Client) {
		console.log('ChatController', mcpClient);
		this._chatService = new ChatService(mcpClient);
	}

	async chat(message: string) {
		// AIの応答を生成
		const { content: systemResponse, functionCalls } =
			await this._chatService.generateResponse(message);

		return { systemResponse, functionCalls };
	}
}
