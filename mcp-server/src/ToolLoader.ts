import type { ToolHandler } from './types.js';
import { weatherTool } from './tools/weather.js';

export class ToolLoader {
	private tools: Map<string, ToolHandler>;

	constructor() {
		this.tools = new Map();
	}

	/**
	 * ツールを登録する
	 */
	public registerTool(tool: ToolHandler): void {
		this.tools.set(tool.definition.name, tool);
	}

	/**
	 * 全てのツールの定義を取得
	 */
	public getAllToolDefinitions() {
		return Array.from(this.tools.values()).map((tool) => tool.definition);
	}

	/**
	 * ツールを名前で取得
	 */
	public getTool(name: string): ToolHandler | undefined {
		return this.tools.get(name);
	}

	/**
	 * ツールをロードする
	 */
	public async loadTools(): Promise<void> {
		this.registerTool(weatherTool);
	}
}
