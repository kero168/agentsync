import { describe, expect, it } from 'vitest';
import { resolveTargets, TargetError, validateConfig } from '../../src/index.js';

describe('resolveTargets', () => {
  it('resolves all enabled targets by default, skipping disabled ones', () => {
    const config = validateConfig({
      version: 1,
      project: { name: 'demo' },
      targets: { claude: {}, agents: { enabled: false }, cursor: {} },
    });
    const targets = resolveTargets(config);
    expect(targets.map((t) => t.id)).toEqual(['claude', 'cursor']);
  });

  it('uses each adapter default output when none is configured', () => {
    const config = validateConfig({ version: 1, project: { name: 'demo' }, targets: { claude: {} } });
    const targets = resolveTargets(config);
    expect(targets[0].outputPath).toBe('CLAUDE.md');
  });

  it('uses a configured output override', () => {
    const config = validateConfig({
      version: 1,
      project: { name: 'demo' },
      targets: { claude: { output: 'docs/CLAUDE.md' } },
    });
    const targets = resolveTargets(config);
    expect(targets[0].outputPath).toBe('docs/CLAUDE.md');
  });

  it('honors an explicit "only" list and ignores enabled:false for it', () => {
    const config = validateConfig({
      version: 1,
      project: { name: 'demo' },
      targets: { claude: { enabled: false }, cursor: {} },
    });
    const targets = resolveTargets(config, ['claude']);
    expect(targets.map((t) => t.id)).toEqual(['claude']);
  });

  it('throws TargetError for an id not present in config.targets', () => {
    const config = validateConfig({ version: 1, project: { name: 'demo' }, targets: { claude: {} } });
    expect(() => resolveTargets(config, ['nope'])).toThrow(TargetError);
  });

  it('throws TargetError when a configured target has no registered adapter', () => {
    const config = validateConfig({ version: 1, project: { name: 'demo' }, targets: { totallyMadeUp: {} } });
    expect(() => resolveTargets(config, ['totallyMadeUp'])).toThrow(/No adapter registered/);
  });
});
