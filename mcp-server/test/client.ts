import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import EventSource from 'eventsource';

// @ts-ignore
global.EventSource = EventSource;

function createTransport(
	type: string,
): SSEClientTransport | StdioClientTransport {
	switch (type) {
		case 'sse':
			return new SSEClientTransport(new URL('http://localhost:3000/events'));
		case 'stdio':
			return new StdioClientTransport({
				command: 'npx',
				args: ['tsx', 'src/stdio.ts'],
			});
		default:
			throw new Error(`未知のtransport type: ${type}`);
	}
}

async function main() {
	const type = process.argv[2];
	if (!type || !['sse', 'stdio'].includes(type)) {
		console.error('Usage: tsx client.ts [sse|stdio]');
		process.exit(1);
	}

	const transport = createTransport(type);
	const client = new Client(
		{
			name: 'mcp-test-client',
			version: '1.0.0',
		},
		{
			capabilities: {},
		},
	);

	try {
		await client.connect(transport);
		console.log('サーバーに接続しました');

		console.log('\n=== プロンプト一覧の取得 ===');
		const prompts = await client.listPrompts();
		console.log('利用可能なプロンプト:', prompts);

		console.log('\n=== プロンプトの取得 ===');
		const prompt = await client.getPrompt({ name: 'Default Prompt' });
		console.log('プロンプトの内容:', prompt);

		console.log('\n=== リソース一覧の取得 ===');
		const resources = await client.listResources();
		console.log('利用可能なリソース:', resources);

		console.log('\n=== リソースの読み取り ===');
		const resource = await client.readResource({ uri: 'file:///example.txt' });
		console.log('リソースの内容:', resource);

		console.log('\n=== ツール一覧の取得 ===');
		const tools = await client.listTools();
		console.log('利用可能なツール:', tools);

		console.log('\n=== ツールの実行 ===');
		const result = await client.callTool({
			name: 'greet',
			arguments: { name: 'MCP Tester' },
		});
		console.log('ツールの実行結果:', result);

		client.close();
	} catch (error) {
		console.error('エラーが発生しました:', error);
	}
}

main();
