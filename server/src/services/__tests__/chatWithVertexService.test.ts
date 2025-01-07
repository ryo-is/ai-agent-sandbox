import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatWithVertexService } from '../chatWithVertexService';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
	FinishReason,
	type GenerativeModelPreview,
} from '@google-cloud/vertexai';

// MCPクライアントのモック
vi.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
	Client: vi.fn().mockImplementation(() => ({
		connect: vi.fn(),
		close: vi.fn(),
		listTools: vi.fn().mockResolvedValue({
			tools: [
				{
					name: 'test_tool',
					description: 'テスト用ツール',
					inputSchema: {
						type: 'object',
						properties: {
							test: { type: 'string' },
						},
					},
				},
			],
		}),
		callTool: vi.fn().mockResolvedValue({
			content: [{ text: 'ツールの実行結果' }],
		}),
	})),
}));

// VertexAIのモック
const mockGetGenerativeModel = vi.fn();
vi.mock('@google-cloud/vertexai', () => ({
	VertexAI: vi.fn().mockImplementation(() => ({
		preview: {
			getGenerativeModel: mockGetGenerativeModel,
		},
	})),
	HarmCategory: {
		HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
		HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
		HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
		HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
	},
	HarmBlockThreshold: {
		BLOCK_NONE: 'BLOCK_NONE',
	},
	FinishReason: {
		STOP: 'STOP',
		FINISH_REASON_UNSPECIFIED: 'FINISH_REASON_UNSPECIFIED',
		MAX_TOKENS: 'MAX_TOKENS',
		PROHIBITED_CONTENT: 'PROHIBITED_CONTENT',
	},
	FunctionCallingMode: {
		ANY: 'ANY',
	},
}));

describe('ChatWithVertexService', () => {
	let service: ChatWithVertexService;
	let mcpClient: Client;

	beforeEach(() => {
		vi.clearAllMocks();
		mcpClient = new Client(
			{
				name: 'test-client',
				version: '1.0.0',
			},
			{
				capabilities: {
					resources: {},
					tools: {},
				},
			},
		);
		service = new ChatWithVertexService(mcpClient);
	});

	describe('generateResponse', () => {
		it('should handle normal text response correctly', async () => {
			const mockResponse = {
				response: {
					candidates: [
						{
							content: {
								parts: [{ text: 'こんにちは' }],
							},
							finishReason: FinishReason.STOP,
						},
					],
				},
			};

			const mockChat = {
				sendMessage: vi.fn().mockResolvedValue(mockResponse),
			};

			const mockModel = {
				startChat: vi.fn().mockReturnValue(mockChat),
			} as unknown as GenerativeModelPreview;

			mockGetGenerativeModel.mockReturnValue(mockModel);

			const result = await service.generateResponse('こんにちは');

			expect(result.candidates?.[0].content.parts[0]).toEqual({
				text: 'こんにちは',
			});
			expect(mcpClient.connect).toHaveBeenCalled();
			expect(mcpClient.close).toHaveBeenCalled();
		});

		it('should handle function call response correctly', async () => {
			const mockFunctionCallResponse = {
				response: {
					candidates: [
						{
							content: {
								parts: [
									{
										functionCall: {
											name: 'test_tool',
											args: { test: 'テスト' },
										},
									},
								],
							},
						},
					],
				},
			};

			const mockTextResponse = {
				response: {
					candidates: [
						{
							content: {
								parts: [{ text: '最終応答' }],
							},
							finishReason: FinishReason.STOP,
						},
					],
				},
			};

			const mockChat = {
				sendMessage: vi
					.fn()
					.mockResolvedValueOnce(mockFunctionCallResponse)
					.mockResolvedValueOnce(mockTextResponse),
			};

			const mockModel = {
				startChat: vi.fn().mockReturnValue(mockChat),
			} as unknown as GenerativeModelPreview;

			mockGetGenerativeModel.mockReturnValue(mockModel);

			const result = await service.generateResponse('関数呼び出しテスト');

			expect(mcpClient.callTool).toHaveBeenCalledWith({
				name: 'test_tool',
				arguments: { test: 'テスト' },
			});
			expect(result.candidates?.[0].content.parts[0]).toEqual({
				text: '最終応答',
			});
		});

		it('should throw error appropriately', async () => {
			const mockError = new Error('テストエラー');
			vi.spyOn(mcpClient, 'connect').mockRejectedValue(mockError);

			await expect(service.generateResponse('テスト')).rejects.toThrow(
				'テストエラー',
			);
			expect(mcpClient.close).toHaveBeenCalled();
		});
	});
});
