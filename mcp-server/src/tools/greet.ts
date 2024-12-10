import type { ToolHandler } from '../types.js';

export const greetTool: ToolHandler = {
  definition: {
    name: 'greet',
    description: 'Greets a person',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the person to greet',
        },
      },
      required: ['name'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const name = args.name as string;
    return {
      content: [
        {
          type: 'text',
          text: `Hello, ${name}!`,
        },
      ],
    };
  },
};

export default greetTool;
