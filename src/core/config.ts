import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { ConfigError } from './errors.js';
import type { AgentSyncConfig, TargetConfig } from './types.js';

export const DEFAULT_CONFIG_FILENAME = 'agentsync.config.yaml';

export interface LoadedConfig {
  config: AgentSyncConfig;
  /** Absolute path to the directory containing the config file. */
  configDir: string;
  /** Absolute path to the config file itself. */
  configFile: string;
}

export function resolveConfigPath(cwd: string, configPath?: string): string {
  return configPath ? path.resolve(cwd, configPath) : path.resolve(cwd, DEFAULT_CONFIG_FILENAME);
}

/**
 * Loads and validates agentsync.config.yaml from disk.
 * Throws ConfigError with a human-readable message on any problem.
 */
export function loadConfig(cwd: string, configPath?: string): LoadedConfig {
  const configFile = resolveConfigPath(cwd, configPath);
  if (!existsSync(configFile)) {
    throw new ConfigError(
      `Config file not found: ${configFile}\nRun "agentsync init" to create one.`,
    );
  }

  const raw = readFileSync(configFile, 'utf8');
  let parsed: unknown;
  try {
    parsed = parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new ConfigError(`Failed to parse YAML in ${configFile}: ${message}`);
  }

  const config = validateConfig(parsed, configFile);
  return { config, configDir: path.dirname(configFile), configFile };
}

/** Validates a parsed YAML document and fills in defaults. Exported for unit testing. */
export function validateConfig(parsed: unknown, sourceLabel = '<config>'): AgentSyncConfig {
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new ConfigError(`Invalid config in ${sourceLabel}: expected a YAML mapping at the top level.`);
  }
  const obj = parsed as Record<string, unknown>;

  if (obj.version !== 1) {
    throw new ConfigError(
      `Invalid config in ${sourceLabel}: "version" must be 1 (got ${JSON.stringify(obj.version)}).`,
    );
  }

  const project = obj.project;
  if (
    project === null ||
    typeof project !== 'object' ||
    Array.isArray(project) ||
    typeof (project as Record<string, unknown>).name !== 'string' ||
    ((project as Record<string, unknown>).name as string).trim() === ''
  ) {
    throw new ConfigError(`Invalid config in ${sourceLabel}: "project.name" is required and must be a non-empty string.`);
  }
  const projectObj = project as Record<string, unknown>;
  const description = typeof projectObj.description === 'string' ? projectObj.description : undefined;

  const sourcesRaw = obj.sources;
  if (sourcesRaw !== undefined && (sourcesRaw === null || typeof sourcesRaw !== 'object' || Array.isArray(sourcesRaw))) {
    throw new ConfigError(`Invalid config in ${sourceLabel}: "sources" must be a mapping.`);
  }
  const sourcesObj = (sourcesRaw as Record<string, unknown> | undefined) ?? {};
  const rulesDir = typeof sourcesObj.rulesDir === 'string' && sourcesObj.rulesDir.trim() !== '' ? sourcesObj.rulesDir : 'rules';

  const targetsRaw = obj.targets;
  if (targetsRaw === undefined || targetsRaw === null || typeof targetsRaw !== 'object' || Array.isArray(targetsRaw)) {
    throw new ConfigError(`Invalid config in ${sourceLabel}: "targets" is required and must be a mapping of target id -> options.`);
  }
  const targets: Record<string, TargetConfig> = {};
  for (const [id, value] of Object.entries(targetsRaw as Record<string, unknown>)) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      throw new ConfigError(`Invalid config in ${sourceLabel}: "targets.${id}" must be a mapping.`);
    }
    const v = value as Record<string, unknown>;
    if (v.output !== undefined && typeof v.output !== 'string') {
      throw new ConfigError(`Invalid config in ${sourceLabel}: "targets.${id}.output" must be a string.`);
    }
    targets[id] = {
      ...v,
      enabled: v.enabled !== false,
      output: typeof v.output === 'string' ? v.output : undefined,
    };
  }

  let rulesOrder: string[] | undefined;
  if (obj.rulesOrder !== undefined) {
    if (!Array.isArray(obj.rulesOrder) || obj.rulesOrder.some((x) => typeof x !== 'string')) {
      throw new ConfigError(`Invalid config in ${sourceLabel}: "rulesOrder" must be an array of filenames.`);
    }
    rulesOrder = obj.rulesOrder as string[];
  }

  return {
    version: 1,
    project: { name: (projectObj.name as string).trim(), description },
    sources: { rulesDir },
    targets,
    rulesOrder,
  };
}
