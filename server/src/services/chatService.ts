import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam } from '@anthropic-ai/sdk/resources/index';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type { FunctionCall } from '../types/chat.types.js';

export class ChatService {
	private anthropic: Anthropic;
	private _mcpClient: Client;

	constructor(mcpClient: Client) {
		const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
		if (!apiKey) {
			throw new Error('ANTHROPIC_API_KEY is not set');
		}
		this.anthropic = new Anthropic({
			apiKey: apiKey,
		});

		this._mcpClient = mcpClient;
	}

	async generateResponse(
		message: string,
	): Promise<{ content: string; functionCalls: FunctionCall[] }> {
		try {
			// MCPサーバーからプロンプトとツールを取得
			const mcpPrompt = await this._mcpClient.getPrompt({
				name: 'Default Prompt',
			});
			const tools = await this._mcpClient.listTools();

			const messages: MessageParam[] = [
				{
					role: 'user',
					content: message,
				},
			];

			const functionCalls: FunctionCall[] = [];
			let finalContent = '';

			while (true) {
				const response = await this.anthropic.messages.create({
					model: 'claude-3-5-sonnet-20241022',
					max_tokens: 8192,
					system: [
						{
							type: 'text',
							text: mcpPrompt.messages[0].content.text as string,
						},
					],
					messages,
					tools: tools.tools.map((tool) => ({
						name: tool.name,
						description: tool.description,
						input_schema: tool.inputSchema,
					})),
				});

				console.log(JSON.stringify(response, null, 2));
				// レスポンスをメッセージに追加
				messages.push({
					role: response.role,
					content: response.content,
				});

				// stop_reasonに基づく処理
				switch (response.stop_reason) {
					case 'end_turn': {
						// 通常の応答完了
						for (const content of response.content) {
							if (content.type === 'text') {
								finalContent = content.text;
							}
						}
						return { content: finalContent, functionCalls };
					}

					case 'max_tokens': {
						// トークン制限に達した場合
						console.warn('最大トークン数に達しました');
						for (const content of response.content) {
							if (content.type === 'text') {
								finalContent += content.text;
							}
						}
						return {
							content: `${finalContent}\n[注意: 応答が最大トークン数に達したため途中で切れている可能性があります]`,
							functionCalls,
						};
					}

					case 'tool_use': {
						// ツール使用の要求
						for (const content of response.content) {
							switch (content.type) {
								case 'text':
									finalContent += content.text;
									break;
								case 'tool_use': {
									const tool = tools.tools.find((t) => t.name === content.name);

									if (!tool) {
										throw new Error(`Tool ${content.name} not found`);
									}

									try {
										const result = await this._mcpClient.callTool({
											name: tool.name,
											arguments: content.input as Record<string, unknown>,
										});

										functionCalls.push({
											name: tool.name,
											description: tool.description,
											parameters: content.input as Record<string, unknown>,
											result,
											timestamp: new Date().toISOString(),
										});

										messages.push({
											role: 'user',
											content: [
												{
													type: 'tool_result',
													tool_use_id: content.id,
													// biome-ignore lint/suspicious/noExplicitAny: <explanation>
													content: result.content as any,
												},
											],
										});
										console.log('Tool result:', JSON.stringify(result));
									} catch (error) {
										const err = error as Error;
										functionCalls.push({
											name: tool.name,
											description: tool.description,
											parameters: content.input as Record<string, unknown>,
											error: {
												message: err.message,
												code: 'TOOL_EXECUTION_ERROR',
											},
											timestamp: new Date().toISOString(),
										});

										messages.push({
											role: 'user',
											content: [
												{
													type: 'tool_result',
													tool_use_id: content.id,
													content: err.message,
													is_error: true,
												},
											],
										});
									}
									break;
								}
							}
						}
						break; // whileループを継続
					}

					case 'stop_sequence': {
						// 停止シーケンスに到達
						console.log('停止シーケンスに到達しました');
						for (const content of response.content) {
							if (content.type === 'text') {
								finalContent += content.text;
							}
						}
						return { content: finalContent, functionCalls };
					}

					default: {
						// 未知のstop_reason
						console.warn(`未知のstop_reason: ${response.stop_reason}`);
						for (const content of response.content) {
							if (content.type === 'text') {
								finalContent += content.text;
							}
						}
						return { content: finalContent, functionCalls };
					}
				}
			}
		} catch (error) {
			console.error('Error generating response with Claude:', error);
			throw error;
		}
	}
}
