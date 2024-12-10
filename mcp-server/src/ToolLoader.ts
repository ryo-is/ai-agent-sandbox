import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ToolHandler } from './types.js';

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
   * ツールディレクトリをスキャンしてツールをロードする
   */
  public async loadTools(): Promise<void> {
    const currentDir = dirname(fileURLToPath(import.meta.url));
    const toolsDir = join(currentDir, 'tools');
    const files = await readdir(toolsDir);

    for (const file of files) {
      // .tsまたは.jsファイルのみを対象とする
      if (file.endsWith('.js') || file.endsWith('.ts')) {
        try {
          const module = await import(join('file://', toolsDir, file));
          if (
            module.default &&
            typeof module.default === 'object' &&
            'definition' in module.default
          ) {
            this.registerTool(module.default as ToolHandler);
          }
        } catch (error) {
          console.error(`Failed to load tool from ${file}:`, error);
        }
      }
    }
  }
}
