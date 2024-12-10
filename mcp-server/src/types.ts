import type {
  CallToolResult,
  ListToolsResult,
} from '@modelcontextprotocol/sdk/types.js';

export interface ToolHandler {
  definition: ListToolsResult['tools'][number];
  execute: (args: Record<string, unknown>) => Promise<CallToolResult>;
}
