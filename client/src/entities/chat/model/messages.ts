type MCPError = {
	message: string;
	code: string;
	details?: Record<string, unknown>;
};

type MCPContext = {
	sessionId: string;
	contextData: Record<string, unknown>;
	metadata?: Record<string, unknown>;
};

type MCPMessage = {
	type: 'request' | 'response' | 'error';
	data: {
		content?: string;
		metadata?: Record<string, unknown>;
		context?: MCPContext;
		error?: MCPError;
	};
	timestamp: string;
	version: string;
};

type FunctionParameter = {
	name: string;
	type: string;
	description?: string;
	required: boolean;
};

type FunctionCall = {
	name: string;
	description?: string;
	parameters: Record<string, unknown>;
	parameterSchema?: FunctionParameter[];
	result?: string | number | boolean | Record<string, unknown>;
	error?: MCPError;
	timestamp: string;
};

export type ChatMessage = {
	id: string;
	role: 'user' | 'assistant' | 'system' | 'error';
	content: string;
	timestamp: string;
	mcpMessage?: MCPMessage;
	functionCalls?: FunctionCall[];
	error?: MCPError;
};
