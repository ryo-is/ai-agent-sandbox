import { useState } from 'react';
import { useChatMessage } from '../../../features/chat/model/useChatMessage';
import * as styles from './Chat.css';

export const Chat = () => {
	const { messages, submitMessage } = useChatMessage();

	const [message, setMessage] = useState('');

	const handleOnChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setMessage(e.currentTarget.value);
	};

	const handleSubmitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		await submitMessage(message);
		setMessage('');
	};

	return (
		<div className={styles.chatWrapper}>
			<div className={styles.chatBody}>
				{messages.map((message) => (
					<div
						key={message.id}
						data-chatrole={message.role}
						className={styles.chatContent}
					>
						<div className={styles.balloon} data-chatrole={message.role}>
							{message.content}
						</div>
					</div>
				))}
			</div>
			<form className={styles.chatFoot} onSubmit={handleSubmitMessage}>
				<input
					type="text"
					value={message}
					placeholder="質問を入力してください"
					onChange={handleOnChangeInput}
					className={styles.chatInput}
				/>
				<button type="submit" className={styles.sendButton}>
					<svg
						width="22"
						height="19"
						viewBox="0 0 22 19"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<title>送信</title>
						<path
							d="M0 18.36L21.42 9.18L0 0V7.14L15.3 9.18L0 11.22V18.36Z"
							fill="#ffffff"
						/>
					</svg>
				</button>
			</form>
		</div>
	);
};
