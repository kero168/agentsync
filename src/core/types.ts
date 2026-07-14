/**
 * Shared type definitions for agentsync's configuration, rule fragments,
 * and target resolution. Kept dependency-free so both the CLI and the
 * library entry point can share them.
 */

/** A single target's configuration block inside agentsync.config.yaml. */
export interface TargetConfig {
  /** Whether this target should be generated. Defaults to true. */
  enabled: boolean;
  /** Output path, relative to the config file's directory. */
  output?: string;
  /** Any adapter-specific extra options, passed through untouched. */
  [key: string]: unknown;
}

/** Parsed, validated agentsync.config.yaml. */
export interface AgentSyncConfig {
  version: 1;
  project: {
    name: string;
    description?: string;
  };
  sources: {
    /** Directory (relative to config file) containing rule fragments. */
    rulesDir: string;
  };
  /** Map of target id -> target config, e.g. "claude", "agents", "cursor", "gemini". */
  targets: Record<string, TargetConfig>;
  /**
   * Optional explicit ordering of rule fragment filenames. Any rule files
   * not listed are appended afterwards in alphabetical order.
   */
  rulesOrder?: string[];
}

/** A parsed rule fragment loaded from the rules/ directory. */
export interface RuleFragment {
  /** Filename relative to the rules directory, e.g. "10-coding-style.md". */
  filename: string;
  /** Section title, derived from a leading "# Heading" or the filename. */
  title: string;
  /** Markdown body, with any leading "# Heading" line stripped. */
  body: string;
}

/** Context handed to every target adapter's render() function. */
export interface AdapterContext {
  config: AgentSyncConfig;
  rules: RuleFragment[];
}

/** A pluggable target format (Claude, AGENTS.md, Cursor, Gemini, ...). */
export interface TargetAdapter {
  /** Stable identifier, also used as the config key under `targets:`. */
  id: string;
  /** Human readable label used in CLI output. */
  label: string;
  /** Default output path used when a target config omits `output`. */
  defaultOutput: string;
  /** Render the full file contents for this target. */
  render(ctx: AdapterContext): string;
}

/** A target resolved from config + registered adapters, ready to render. */
export interface ResolvedTarget {
  id: string;
  adapter: TargetAdapter;
  outputPath: string;
}
