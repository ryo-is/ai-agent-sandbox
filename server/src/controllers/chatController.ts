import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { ChatService } from '../services/chatService';
import { Readable } from 'node:stream';

export class ChatController {
	private _chatService: ChatService;

	constructor(mcpClient: Client) {
		this._chatService = new ChatService(mcpClient);
	}

	async chat(message: string) {
		const result = await this._chatService.generateResponse(message);

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
