/**
 * Library entry point. Everything the CLI uses is exported here so
 * agentsync can also be driven programmatically or tested directly,
 * without spawning a child process.
 */
export { loadConfig, resolveConfigPath, validateConfig, DEFAULT_CONFIG_FILENAME } from './core/config.js';
export { loadRules, parseRuleFragment } from './core/rules.js';
export { resolveTargets } from './core/targets.js';
export { diffLines, formatDiff, hasChanges } from './core/diff.js';
export { ConfigError, RulesError, TargetError, toErrorMessage } from './core/errors.js';
export type {
  AgentSyncConfig,
  TargetConfig,
  RuleFragment,
  AdapterContext,
  TargetAdapter,
  ResolvedTarget,
} from './core/types.js';

export { builtinAdapters, getAdapter, listAdapterIds, claudeAdapter, agentsAdapter, cursorAdapter, geminiAdapter } from './adapters/index.js';

export { runInit } from './commands/init.js';
export { runBuild } from './commands/build.js';
export { runCheck, evaluateCheck } from './commands/check.js';
export type { CheckOutcome, CheckResult } from './commands/check.js';
export { runDiff } from './commands/diff.js';
export type { CommonOptions } from './commands/shared.js';

export { createLogger, MemoryStream } from './utils/logger.js';
export type { Logger } from './utils/logger.js';

export { VERSION } from './version.js';
