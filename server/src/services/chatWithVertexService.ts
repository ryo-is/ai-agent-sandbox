import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
	HarmCategory,
	HarmBlockThreshold,
	VertexAI,
	type FunctionDeclaration,
	type FunctionDeclarationSchema,
	type Content,
	type FunctionResponsePart,
	type GenerateContentResponse,
	type Part,
	FinishReason,
} from '@google-cloud/vertexai';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

export class ChatWithVertexService {
	private _mcpClient: Client;
	private _vertexAi: VertexAI;

	constructor(mcpClient: Client) {
		this._mcpClient = mcpClient;

		const project = import.meta.env.VITE_PROJECT_NAME;
		this._vertexAi = new VertexAI({ project, location: 'us-central1' });
	}

	async #conectionMcpServer() {
		// SSE transportの設定
		const transport = new SSEClientTransport(
			new URL('http://localhost:3334/events'),
		);

		try {
			await this._mcpClient.connect(transport);
			console.log('MCPサーバーに接続しました');
		} catch (error) {
			console.error('MCPサーバーへの接続に失敗しました:', error);
			throw error;
		}
	}

	#closeConnectionWithMcpServer() {
		this._mcpClient.close();
		console.log('MCPサーバーから切断しました');
	}

	#createFunctionDeclaration(
		tools: Awaited<ReturnType<Client['listTools']>>['tools'],
	): FunctionDeclaration[] {
		const functionDeclarations: FunctionDeclaration[] = [];

		for (const tool of tools) {
			functionDeclarations.push({
				name: tool.name,
				description: tool.description,
				parameters: tool.inputSchema as unknown as FunctionDeclarationSchema,
			});
		}

		return functionDeclarations;
	}

	#judgeFunctionCall(parts: Part[]) {
		return parts.some((part) => part?.functionCall);
	}

	#mergeTextParts(
		response: Required<Pick<GenerateContentResponse, 'candidates'>>,
	) {
		let mergeText = '';
		if (response.candidates[0].content.parts.length >= 2) {
			for (const part of response.candidates[0].content.parts) {
				if ('text' in part) {
					mergeText += part.text;
				}
			}
			response.candidates[0].content.parts = [{ text: mergeText }];
		}
		return response;
	}

	#pickOnlyFunctionCall(
		response: Required<Pick<GenerateContentResponse, 'candidates'>>,
	): GenerateContentResponse {
		const pickFunctionCallPart = response.candidates[0].content.parts.filter(
			(part) => part.functionCall,
		);
		response.candidates[0].content.parts = pickFunctionCallPart;
		return response;
	}

	async generateResponse(message: string): Promise<GenerateContentResponse> {
		try {
			await this.#conectionMcpServer();
			const tools = await this._mcpClient.listTools();
			const functionDeclarations = this.#createFunctionDeclaration(tools.tools);
			console.log(
				'===================== functionDeclarations =====================',
			);
			console.log(JSON.stringify(functionDeclarations));

			const model = this._vertexAi.preview.getGenerativeModel({
				model: 'gemini-2.0-flash-exp',
				systemInstruction:
					'都道府県名や地名、都市名が入力された場合にその文字をローマ字もしくは英語に変換してください。',
				generationConfig: {
					maxOutputTokens: 8192,
					temperature: 1,
					topP: 0.95,
				},
				safetySettings: [
					{
						category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
						threshold: HarmBlockThreshold.BLOCK_NONE,
					},
					{
						category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
						threshold: HarmBlockThreshold.BLOCK_NONE,
					},
					{
						category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
						threshold: HarmBlockThreshold.BLOCK_NONE,
					},
					{
						category: HarmCategory.HARM_CATEGORY_HARASSMENT,
						threshold: HarmBlockThreshold.BLOCK_NONE,
					},
				],
			});
			const history: Content[] = [];

			const chat = model.startChat({
				tools: [{ functionDeclarations }],
				history,
			});

			let sendMessage: string | Array<string | Part> = message;

			while (true) {
				const responseFromAi = await chat.sendMessage(sendMessage);
				let response = responseFromAi.response;
				console.log('===================== response =====================');
				console.log(JSON.stringify(response));
				if (!response.candidates) {
					throw new Error('vertex ai call error');
				}

				if (!this.#judgeFunctionCall(response.candidates[0].content.parts)) {
					return this.#mergeTextParts(
						response as Required<Pick<GenerateContentResponse, 'candidates'>>,
					);
				}

				response = this.#pickOnlyFunctionCall(
					response as Required<Pick<GenerateContentResponse, 'candidates'>>,
				);
				if (!response.candidates) {
					throw new Error('function call response error');
				}

				sendMessage = [];
				for (const p of response.candidates[0].content.parts) {
					if (!p.functionCall) {
						if (response.candidates[0].finishReason) {
							switch (response.candidates[0].finishReason) {
								case FinishReason.STOP:
									console.log('STOP');
									return response;
								// TODO; 他エラーケースについて要確認
								case FinishReason.FINISH_REASON_UNSPECIFIED:
									break;
								case FinishReason.MAX_TOKENS:
									break;
								case FinishReason.PROHIBITED_CONTENT:
									break;
								default:
									break;
							}
							continue;
						}
						continue;
					}

					const { name, args } = p.functionCall;
					const result = await this._mcpClient.callTool({
						name,
						arguments: args as { [key: string]: unknown },
					});
					console.log('===================== result =====================');
					console.log(JSON.stringify(result));

					if (!result || !Array.isArray(result.content)) {
						throw new Error('Invalid result format');
					}

					const functionResponsePart: FunctionResponsePart = {
						functionResponse: {
							name,
							response: result.content[0],
						},
					};

					sendMessage.push(functionResponsePart);
					console.log(
						'===================== sendMessage =====================',
					);
					console.log(JSON.stringify(sendMessage));
				}
			}
		} catch (error) {
			console.error('Error generating response with VertexAI:', error);
			throw error;
		} finally {
			this.#closeConnectionWithMcpServer();
		}
	}
}
