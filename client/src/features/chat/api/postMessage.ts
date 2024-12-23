export const postMessage = async (message: string) => {
	const response = await fetch('http://localhost:4001/chat', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ message }),
	});

	if (!response.ok) {
		throw new Error('エラーが発生しました');
	}

	return { response };
};
