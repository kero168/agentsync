import { renderMarkdownBody } from './shared.js';
import type { AdapterContext, TargetAdapter } from '../core/types.js';

/** The open, tool-agnostic AGENTS.md standard (https://agents.md). */
export const agentsAdapter: TargetAdapter = {
  id: 'agents',
  label: 'AGENTS.md standard',
  defaultOutput: 'AGENTS.md',
  render(ctx: AdapterContext): string {
    return renderMarkdownBody(ctx, 'the AGENTS.md standard');
  },
};
