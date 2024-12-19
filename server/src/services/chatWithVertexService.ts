import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
	HarmCategory,
	HarmBlockThreshold,
	VertexAI,
	type FunctionDeclaration,
	type FunctionDeclarationSchema,
	type Content,
	type FunctionResponsePart,
} from '@google-cloud/vertexai';

export class ChatWithVertexService {
	private _mcpClient: Client;
	private _vertexAi: VertexAI;

	constructor(mcpClient: Client) {
		this._mcpClient = mcpClient;

		const project = import.meta.env.VITE_PROJECT_NAME;
		this._vertexAi = new VertexAI({ project, location: 'us-central1' });
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

	async generateResponse(message: string): Promise<{ content: string }> {
		try {
			const tools = await this._mcpClient.listTools();
			const functionDeclarations = this.#createFunctionDeclaration(tools.tools);
			console.log(
				'===================== functionDeclarations =====================',
			);
			console.log(JSON.stringify(functionDeclarations));

			const model = this._vertexAi.preview.getGenerativeModel({
				model: 'gemini-1.5-flash-002',
				systemInstruction: '',
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
			let chunk = await chat.sendMessageStream(message);
			console.log('===================== chunk =====================');
			console.log(JSON.stringify(await chunk.response));

			for await (const content of chunk.stream) {
				if (!content.candidates) {
					throw new Error('no candidates');
				}

				const targetCondidate = content.candidates[0];

				history.push({
					role: targetCondidate.content.role,
					parts: targetCondidate.content.parts,
				});

				for (const part of targetCondidate.content.parts) {
					console.log('===================== part =====================');
					console.log(JSON.stringify(part));

					if (!part.functionCall) {
						continue;
					}

					const functionCall = part.functionCall;
					const tool = functionDeclarations.find(
						(fd) => fd.name === functionCall.name,
					);
					if (!tool) {
						throw new Error(`Tool ${functionCall.name} not found`);
					}

					try {
						const result = await this._mcpClient.callTool({
							name: tool.name,
							arguments: functionCall.args as Record<string, unknown>,
						});
						const functionResponsePart: FunctionResponsePart = {
							functionResponse: {
								name: functionCall.name,
								response: {
									value: result.content,
								},
							},
						};
						chunk = await chat.sendMessageStream([functionResponsePart]);
						console.log(
							'===================== chunk in for loop =====================',
						);
						console.log(JSON.stringify(await chunk.response));
					} catch (error) {
						console.error('Error function calling:', error);
						throw error;
					}
				}
			}

			console.log('===================== final chunk =====================');
			console.log(JSON.stringify(await chunk.response));
			const finalResponse = await chunk.response;
			return {
				content: finalResponse.candidates
					? (finalResponse.candidates[0].content.parts[0].text ?? '')
					: '',
			};
		} catch (error) {
			console.error('Error generating response with VertexAI:', error);
			throw error;
		}
	}
}
