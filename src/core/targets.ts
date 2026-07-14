import { TargetError } from './errors.js';
import { getAdapter } from '../adapters/index.js';
import type { AgentSyncConfig, ResolvedTarget } from './types.js';

/**
 * Resolves the list of targets to operate on for build/check/diff.
 * `only`, if given, restricts to those target ids (order preserved);
 * otherwise every target defined in config is considered, skipping
 * any with `enabled: false`.
 */
export function resolveTargets(config: AgentSyncConfig, only?: string[]): ResolvedTarget[] {
  const ids = only && only.length > 0 ? only : Object.keys(config.targets);
  const result: ResolvedTarget[] = [];

  for (const id of ids) {
    const targetConfig = config.targets[id];
    if (!targetConfig) {
      const known = Object.keys(config.targets).join(', ') || '(none configured)';
      throw new TargetError(`Unknown target "${id}" — not defined in agentsync.config.yaml. Known targets: ${known}`);
    }
    if (only === undefined && targetConfig.enabled === false) {
      continue;
    }
    const adapter = getAdapter(id);
    if (!adapter) {
      throw new TargetError(`No adapter registered for target "${id}".`);
    }
    result.push({
      id,
      adapter,
      outputPath: targetConfig.output ?? adapter.defaultOutput,
    });
  }

  return result;
}
