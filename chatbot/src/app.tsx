import type { JSX } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import * as styles from './app.css.ts';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import HTMLReactParser from 'html-react-parser';
import botIcon from './images/bot-icon.png';
import { v4 as uuidv4 } from 'uuid';

const url = `${import.meta.env.VITE_AI_API_ENDPOINT}/chat`;
const headers = {
	'Content-Type': 'application/json',
	Accept: 'application/json',
};

export type Content = {
	parts: {
		text: string;
	}[];
	role: string;
};

export type ParsedHTMLContent = {
	parts: {
		html: string | JSX.Element | JSX.Element[];
	}[];
	role: string;
};

const convertMessageToHtml = (markdown: string) => {
	const html = marked.parse(markdown, { async: false }) as string;
	const sanitizedHtml = DOMPurify.sanitize(html);
	return HTMLReactParser(sanitizedHtml);
};

export function App() {
	const [message, setMessage] = useState('');
	const [answer, setAnswer] = useState('');
	const [chatHistories, setChatHistories] = useState<Content[]>([]);
	const [chatHistoriesHTML, setChatHistoriesHTML] = useState<
		ParsedHTMLContent[]
	>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [sessionId, setSessionId] = useState('');
	const chatBodyRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		setSessionId(uuidv4());
	}, []);

	// biome-ignore lint: Both dependencies are needed to ensure proper scrolling
	useEffect(() => {
		if (chatBodyRef.current) {
			chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
		}
	}, [chatHistories, answer]);

	const adjustTextareaHeight = () => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = 'auto';
			textarea.style.height = `${textarea.scrollHeight}px`;
		}
	};

	const decoderFromApiResponse = async (
		reader: ReadableStreamDefaultReader<Uint8Array>,
	): Promise<string> => {
		const decoder = new TextDecoder('utf-8');
		let tmp = '';
		while (true) {
			const { value, done } = await reader.read();
			if (done) {
				setAnswer('');
				break;
			}

			if (value) {
				const chunk = decoder.decode(value, { stream: true });
				const content = JSON.parse(chunk) as unknown as Content;
				if ('parts' in content) {
					tmp += content.parts[0].text;
					setAnswer((prev) => prev + content.parts[0].text);
				}
			}
		}
		return tmp;
	};

	const requestApiOfVertexApi = async (): Promise<void> => {
		if (!message) {
			return;
		}
		try {
			setChatHistories((prev) => [
				...prev,
				{
					role: 'user',
					parts: [
						{
							text: message,
						},
					],
				},
			]);
			setChatHistoriesHTML((prev) => [
				...prev,
				{
					role: 'user',
					parts: [
						{
							html: convertMessageToHtml(message),
						},
					],
				},
			]);
			const response = await fetch(url, {
				method: 'POST',
				headers: headers,
				body: JSON.stringify({
					message,
					history: chatHistories,
					sessionId,
				}),
			});

			if (!response?.body) {
				throw new Error('レスポンスデータの取得に失敗しました');
			}
			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message);
			}

			const reader = response.body.getReader();
			const tmp = await decoderFromApiResponse(reader);
			createHistory(tmp);
		} catch (error) {
			if (error instanceof Error) {
				createHistory(error.message);
			} else {
				createHistory('エラー');
			}
			throw new Error('失敗しました');
		}
	};

	const createHistory = (text: string) => {
		setChatHistories((prev) => [...prev, { role: 'model', parts: [{ text }] }]);
		setChatHistoriesHTML((prev) => [
			...prev,
			{
				role: 'model',
				parts: [{ html: convertMessageToHtml(text) }],
			},
		]);
	};

	const changeInputValue = (
		event: JSX.TargetedEvent<HTMLTextAreaElement, Event>,
	) => {
		setMessage(event.currentTarget.value);
		adjustTextareaHeight();
	};

	const handleKeyPress = (event: KeyboardEvent) => {
		if (
			(event.key === 'Enter' && event.metaKey) ||
			(event.key === 'Enter' && event.ctrlKey)
		) {
			event.preventDefault();
			requestApiOfVertexApi();
			setMessage('');
			if (textareaRef.current) {
				textareaRef.current.style.height = 'auto';
			}
		}
	};

	const toggleChat = () => {
		setIsOpen((prev) => !prev);
	};

	return (
		<div className={styles.container} data-isOpen={isOpen}>
			<div className={styles.chatToggleButtonWrapper}>
				<button
					type="button"
					onClick={toggleChat}
					className={styles.chatToggleButton}
					aria-label={isOpen ? 'チャットを閉じる' : 'チャットを開く'}
				>
					<img src={botIcon} alt="" className={styles.chatToggleIcon} />
				</button>
			</div>
			<div className={styles.chat}>
				<div className={styles.chatInner}>
					<div className={styles.chatHead}>
						<h2 className={styles.chatTitle}>Sprobot for DataStudio</h2>
						<button
							type="button"
							aria-label="チャットを閉じる"
							onClick={toggleChat}
							className={styles.chatCloseButton}
						>
							<svg
								width="18"
								height="18"
								viewBox="0 0 18 18"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<title>閉じる</title>
								<path
									d="M16 0H2C0.9 0 0 0.9 0 2V16C0 17.1 0.9 18 2 18H16C17.1 18 18 17.1 18 16V2C18 0.9 17.1 0 16 0ZM14 10H4V8H14V10Z"
									fill="white"
								/>
							</svg>
						</button>
					</div>
					<div className={styles.chatBody} ref={chatBodyRef}>
						{chatHistoriesHTML.map((history, i) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								key={i}
								className={styles.chatContent}
								data-chatRole={history.role}
							>
								<div className={styles.balloon} data-chatRole={history.role}>
									{history.parts.map((part, pi) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
										<div key={`histories-${pi}`}>{part.html}</div>
									))}
								</div>
							</div>
						))}
						<div className={styles.chatContent} data-chatRole={'model'}>
							{answer && (
								<div className={styles.balloon} data-chatRole={'model'}>
									{answer}
								</div>
							)}
						</div>
					</div>
					<div className={styles.chatFoot}>
						<textarea
							ref={textareaRef}
							name="messageInput"
							value={message}
							placeholder="質問を入力してください"
							onInput={changeInputValue}
							onKeyDown={handleKeyPress}
							className={styles.chatInput}
							rows={1}
						/>
						<button
							type="button"
							onClick={async () => {
								await requestApiOfVertexApi();
								setMessage('');
								if (textareaRef.current) {
									textareaRef.current.style.height = 'auto';
								}
							}}
							className={styles.sendButton}
						>
							<svg
								width="22"
								height="19"
								viewBox="0 0 22 19"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<title>送信（ctrl + enter / command + enter）</title>
								<path
									d="M0 18.36L21.42 9.18L0 0V7.14L15.3 9.18L0 11.22V18.36Z"
									fill="currentColor"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
