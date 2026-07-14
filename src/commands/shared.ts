import path from 'node:path';
import { loadConfig } from '../core/config.js';
import { loadRules } from '../core/rules.js';
import { resolveTargets } from '../core/targets.js';
import type { ResolvedTarget } from '../core/types.js';
import type { RuleFragment, AgentSyncConfig } from '../core/types.js';

export interface CommonOptions {
  cwd: string;
  configPath?: string;
  only?: string[];
}

export interface PreparedRun {
  config: AgentSyncConfig;
  configDir: string;
  configFile: string;
  rules: RuleFragment[];
  targets: ResolvedTarget[];
}

/** Loads config + rules and resolves the target list shared by build/check/diff. */
export function prepareRun(options: CommonOptions): PreparedRun {
  const { config, configDir, configFile } = loadConfig(options.cwd, options.configPath);
  const rulesDirAbs = path.resolve(configDir, config.sources.rulesDir);
  const rules = loadRules(rulesDirAbs, config.rulesOrder);
  const targets = resolveTargets(config, options.only);
  return { config, configDir, configFile, rules, targets };
}
