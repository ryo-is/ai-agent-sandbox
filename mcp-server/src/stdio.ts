import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { MCPServer } from './MCPServer.js';

const mcpServer = new MCPServer();
const transport = new StdioServerTransport();
await mcpServer.connect(transport);
