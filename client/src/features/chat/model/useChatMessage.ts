import { atom, useAtom } from 'jotai';
import type { ChatMessage } from '../../../entities/chat/model/messages';
import { postMessage } from '../api/postMessage';
import { useCallback } from 'react';

const messagesAtom = atom<ChatMessage[]>([]);

export const useChatMessage = () => {
	const [messages, setMessages] = useAtom(messagesAtom);

	const submitMessage = useCallback(
		async (message: string) => {
			// ユーザーメッセージを追加
			const timestamp = new Date().toISOString();
			const userMessage: ChatMessage = {
				id: `user-${timestamp}`,
				role: 'user',
				content: message,
				timestamp,
			};
			setMessages((prev) => [...prev, userMessage]);

			try {
				const data = await postMessage(message);

				// システムメッセージを追加
				const systemMessage: ChatMessage = {
					id: `assistant-${data.timestamp}`,
					role: 'assistant',
					content: data.message,
					timestamp: data.timestamp,
					mcpMessage: data.mcpMessage,
					functionCalls: data.functionCalls,
				};
				setMessages((prev) => [...prev, systemMessage]);
			} catch (error) {
				console.error('Error:', error);
				// エラーメッセージを追加
				const errorTimestamp = new Date().toISOString();
				const errorMessage: ChatMessage = {
					id: `error-${errorTimestamp}`,
					role: 'error',
					content:
						error instanceof Error ? error.message : 'エラーが発生しました',
					timestamp: errorTimestamp,
					error: {
						message:
							error instanceof Error ? error.message : 'エラーが発生しました',
						code: 'CHAT_ERROR',
					},
				};
				setMessages((prev) => [...prev, errorMessage]);
			}
		},
		[setMessages],
	);

	return { messages, submitMessage };
};
