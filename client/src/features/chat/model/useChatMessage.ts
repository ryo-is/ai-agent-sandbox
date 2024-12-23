import { atom, useAtom } from 'jotai';
import type { ChatMessage } from '../../../entities/chat/model/messages';
import { postMessage } from '../api/postMessage';
import { useCallback } from 'react';

type Content = {
	parts: {
		text: string;
	}[];
	role: string;
};

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
				const { response } = await postMessage(message);
				console.log({ response });

				if (!response?.body) {
					throw new Error('レスポンスデータの取得に失敗しました');
				}

				const reader = response.body.getReader();
				const decoder = new TextDecoder('utf-8');
				let content = '';
				while (true) {
					const { value, done } = await reader.read();
					if (done) {
						break;
					}

					if (value) {
						const chunk = decoder.decode(value, { stream: true });
						const parsedContent = JSON.parse(chunk) as unknown as Content;
						if ('parts' in parsedContent) {
							content += parsedContent.parts[0].text;
						}
					}
				}

				// システムメッセージを追加
				const systemMessage: ChatMessage = {
					id: `assistant-${timestamp}`,
					role: 'assistant',
					content: content,
					timestamp: timestamp,
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
