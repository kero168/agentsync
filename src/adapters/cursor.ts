import { renderMarkdownBody, yamlQuotedString } from './shared.js';
import type { AdapterContext, TargetAdapter } from '../core/types.js';

/** Cursor project rules, written as a single always-on .mdc rule file. */
export const cursorAdapter: TargetAdapter = {
  id: 'cursor',
  label: 'Cursor',
  defaultOutput: '.cursor/rules/agentsync.mdc',
  render(ctx: AdapterContext): string {
    const description = ctx.config.project.description ?? `${ctx.config.project.name} project rules`;
    const frontmatter = [
      '---',
      `description: ${yamlQuotedString(description)}`,
      'globs: "**/*"',
      'alwaysApply: true',
      '---',
      '',
    ].join('\n');
    return frontmatter + renderMarkdownBody(ctx, 'Cursor (.cursor/rules)');
  },
};
