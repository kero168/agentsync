import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ConfigError, loadConfig, validateConfig } from '../../src/index.js';

describe('validateConfig', () => {
  it('accepts a minimal valid config and fills in defaults', () => {
    const config = validateConfig({
      version: 1,
      project: { name: 'demo' },
      targets: { claude: {} },
    });
    expect(config.project.name).toBe('demo');
    expect(config.sources.rulesDir).toBe('rules');
    expect(config.targets.claude.enabled).toBe(true);
    expect(config.targets.claude.output).toBeUndefined();
  });

  it('preserves description and custom rulesDir', () => {
    const config = validateConfig({
      version: 1,
      project: { name: 'demo', description: 'A demo project.' },
      sources: { rulesDir: 'agent-rules' },
      targets: { claude: { output: 'DOCS/CLAUDE.md' } },
    });
    expect(config.project.description).toBe('A demo project.');
    expect(config.sources.rulesDir).toBe('agent-rules');
    expect(config.targets.claude.output).toBe('DOCS/CLAUDE.md');
  });

  it('respects enabled: false', () => {
    const config = validateConfig({
      version: 1,
      project: { name: 'demo' },
      targets: { claude: { enabled: false } },
    });
    expect(config.targets.claude.enabled).toBe(false);
  });

  it('parses rulesOrder', () => {
    const config = validateConfig({
      version: 1,
      project: { name: 'demo' },
      targets: { claude: {} },
      rulesOrder: ['00-a.md', '10-b.md'],
    });
    expect(config.rulesOrder).toEqual(['00-a.md', '10-b.md']);
  });

  it('rejects a non-object document', () => {
    expect(() => validateConfig('nope')).toThrow(ConfigError);
    expect(() => validateConfig(null)).toThrow(ConfigError);
    expect(() => validateConfig([1, 2])).toThrow(ConfigError);
  });

  it('rejects an unsupported version', () => {
    expect(() => validateConfig({ version: 2, project: { name: 'x' }, targets: {} })).toThrow(/version/);
  });

  it('rejects a missing project.name', () => {
    expect(() => validateConfig({ version: 1, project: {}, targets: {} })).toThrow(/project.name/);
    expect(() => validateConfig({ version: 1, project: { name: '  ' }, targets: {} })).toThrow(/project.name/);
  });

  it('requires targets to be a mapping', () => {
    expect(() => validateConfig({ version: 1, project: { name: 'demo' } })).toThrow(/targets/);
    expect(() => validateConfig({ version: 1, project: { name: 'demo' }, targets: [] })).toThrow(/targets/);
  });

  it('rejects a non-object target entry', () => {
    expect(() => validateConfig({ version: 1, project: { name: 'demo' }, targets: { claude: 'nope' } })).toThrow(
      /targets.claude/,
    );
  });

  it('rejects a non-array rulesOrder', () => {
    expect(() =>
      validateConfig({ version: 1, project: { name: 'demo' }, targets: { claude: {} }, rulesOrder: 'nope' }),
    ).toThrow(/rulesOrder/);
  });
});

describe('loadConfig', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'agentsync-config-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('throws a helpful ConfigError when the file is missing', () => {
    expect(() => loadConfig(dir)).toThrow(/Run "agentsync init"/);
  });

  it('throws a ConfigError on invalid YAML', () => {
    writeFileSync(path.join(dir, 'agentsync.config.yaml'), 'version: 1\n  bad indent: [', 'utf8');
    expect(() => loadConfig(dir)).toThrow(ConfigError);
  });

  it('loads and validates a real file', () => {
    writeFileSync(
      path.join(dir, 'agentsync.config.yaml'),
      'version: 1\nproject:\n  name: demo\ntargets:\n  claude: {}\n',
      'utf8',
    );
    const { config, configDir } = loadConfig(dir);
    expect(config.project.name).toBe('demo');
    expect(configDir).toBe(dir);
  });

  it('honors a custom config path', () => {
    writeFileSync(
      path.join(dir, 'custom.yaml'),
      'version: 1\nproject:\n  name: custom\ntargets:\n  claude: {}\n',
      'utf8',
    );
    const { config } = loadConfig(dir, 'custom.yaml');
    expect(config.project.name).toBe('custom');
  });
});
