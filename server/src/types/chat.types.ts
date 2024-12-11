export interface MCPError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface MCPMessage {
  type: 'request' | 'response' | 'error';
  data: {
    content?: string;
    metadata?: Record<string, unknown>;
    context?: {
      sessionId: string;
      contextData: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    };
    error?: MCPError;
  };
  timestamp: string;
  version: string;
}

export interface FunctionCall {
  name: string;
  description?: string;
  parameters: Record<string, unknown>;
  result?: unknown;
  error?: MCPError;
  timestamp: string;
}

export interface FunctionExecutionResult {
  parameters: Record<string, unknown>;
  result: unknown;
}

export interface ChatMessage {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  timestamp: string;
  mcpMessage: MCPMessage;
  functionCalls: FunctionCall[];
}
