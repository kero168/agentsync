import { renderMarkdownBody } from './shared.js';
import type { AdapterContext, TargetAdapter } from '../core/types.js';

/** Gemini CLI project context (GEMINI.md). */
export const geminiAdapter: TargetAdapter = {
  id: 'gemini',
  label: 'Gemini CLI',
  defaultOutput: 'GEMINI.md',
  render(ctx: AdapterContext): string {
    return renderMarkdownBody(ctx, 'Gemini CLI (GEMINI.md)');
  },
};
