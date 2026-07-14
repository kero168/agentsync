import { agentsAdapter } from './agents.js';
import { claudeAdapter } from './claude.js';
import { cursorAdapter } from './cursor.js';
import { geminiAdapter } from './gemini.js';
import type { TargetAdapter } from '../core/types.js';

/**
 * Every target format agentsync ships out of the box. To add a new
 * target format, implement TargetAdapter (see ./types.ts) and register
 * it here — see ARCHITECTURE.md for the full walkthrough.
 */
export const builtinAdapters: TargetAdapter[] = [claudeAdapter, agentsAdapter, cursorAdapter, geminiAdapter];

const registry = new Map<string, TargetAdapter>(builtinAdapters.map((adapter) => [adapter.id, adapter]));

export function getAdapter(id: string): TargetAdapter | undefined {
  return registry.get(id);
}

export function listAdapterIds(): string[] {
  return builtinAdapters.map((adapter) => adapter.id);
}

export { claudeAdapter, agentsAdapter, cursorAdapter, geminiAdapter };
export type { TargetAdapter } from '../core/types.js';
