export const postMessage = async (message: string) => {
	const response = await fetch('http://localhost:4000/chat', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ message }),
	});
	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error?.message || 'エラーが発生しました');
	}

	return data;
};
