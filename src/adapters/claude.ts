import { renderMarkdownBody } from './shared.js';
import type { AdapterContext, TargetAdapter } from '../core/types.js';

/** Claude Code project instructions (CLAUDE.md). */
export const claudeAdapter: TargetAdapter = {
  id: 'claude',
  label: 'Claude Code',
  defaultOutput: 'CLAUDE.md',
  render(ctx: AdapterContext): string {
    return renderMarkdownBody(ctx, 'Claude Code (CLAUDE.md)');
  },
};
