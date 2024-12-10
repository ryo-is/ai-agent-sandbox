import { createServer } from 'node:http';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { config } from 'dotenv';
import { MCPServer } from './MCPServer.js';

// .envファイルを読み込む
config();

const mcpServer = new MCPServer();
const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;
const connections = new Map<string, SSEServerTransport>();

createServer(async (req, res) => {
  const url = new URL(req.url ?? '', `http://localhost:${port}`);

  if (url?.pathname === '/events') {
    switch (req.method) {
      case 'GET': {
        const transport = new SSEServerTransport(url.pathname, res);
        await mcpServer.connect(transport);
        connections.set(transport.sessionId, transport);

        res.on('close', async () => {
          connections.delete(transport.sessionId);
          await transport.close();
          await mcpServer.close();
        });
        return;
      }
      case 'POST': {
        const sessionId = url?.searchParams.get('sessionId');
        const transport = connections.get(sessionId ?? '');
        if (transport) {
          await transport.handlePostMessage(req, res);
          return;
        }
      }
    }
  }

  res.writeHead(403);
  res.end();
}).listen(port);
