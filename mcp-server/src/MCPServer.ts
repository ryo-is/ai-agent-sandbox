import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import type {
  CallToolRequest,
  GetPromptRequest,
  ReadResourceRequest,
} from '@modelcontextprotocol/sdk/types.js';
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ToolLoader } from './ToolLoader.js';

export class MCPServer {
  private server: Server;
  private toolLoader: ToolLoader;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          prompts: {},
          resources: {},
          tools: {},
        },
      },
    );
    this.toolLoader = new ToolLoader();
  }

  public async initialize(): Promise<void> {
    await this.toolLoader.loadTools();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // プロンプト一覧を取得するハンドラ
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: 'Default Prompt',
            description: 'Default system prompt for the model',
          },
        ],
      };
    });

    // プロンプトを取得するハンドラ
    this.server.setRequestHandler(
      GetPromptRequestSchema,
      async (request: GetPromptRequest) => {
        const promptName = request.params.name;
        if (promptName === 'Default Prompt') {
          return {
            description: 'Default system prompt for the model',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: 'You are a very competent assistant for a variety of tasks.',
                },
              },
            ],
          };
        }
        throw new Error('Prompt not found');
      },
    );

    // リソース一覧を取得するハンドラ
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'file:///example.txt',
            name: 'Example Resource',
          },
        ],
      };
    });

    // リソースを読み取るハンドラ
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request: ReadResourceRequest) => {
        const uri = request.params?.uri;
        if (uri === 'file:///example.txt') {
          return {
            contents: [
              {
                uri: 'file:///example.txt',
                mimeType: 'text/plain',
                text: 'This is the content of the example resource.',
              },
            ],
          };
        }
        throw new Error('Resource not found');
      },
    );

    // ツール一覧を取得するハンドラ
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.toolLoader.getAllToolDefinitions(),
      };
    });

    // ツールを実行するハンドラ
    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: CallToolRequest) => {
        const tool = this.toolLoader.getTool(request.params.name);
        if (!tool) {
          throw new Error('Tool not found');
        }

        return tool.execute(
          request.params.arguments as Record<string, unknown>,
        );
      },
    );
  }

  public getServer(): Server {
    return this.server;
  }

  public async connect(transport: Transport): Promise<void> {
    await this.initialize();
    return this.server.connect(transport);
  }

  public close(): Promise<void> {
    return this.server.close();
  }
}
