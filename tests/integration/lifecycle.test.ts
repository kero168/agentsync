import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createLogger,
  evaluateCheck,
  MemoryStream,
  runBuild,
  runCheck,
  runDiff,
  runInit,
} from '../../src/index.js';

describe('init -> build -> check -> diff lifecycle', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'agentsync-lifecycle-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  function logger() {
    return createLogger(new MemoryStream(), new MemoryStream());
  }

  it('produces all four target files with consistent content', () => {
    expect(runInit({ cwd: dir, name: 'lifecycle-app' }, logger())).toBe(0);
    expect(runBuild({ cwd: dir }, logger())).toBe(0);

    const claude = readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
    const agents = readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
    const gemini = readFileSync(path.join(dir, 'GEMINI.md'), 'utf8');
    const cursor = readFileSync(path.join(dir, '.cursor/rules/agentsync.mdc'), 'utf8');

    for (const content of [claude, agents, gemini]) {
      expect(content).toContain('# lifecycle-app');
      expect(content).toContain('## Project Overview');
      expect(content).toContain('## Coding Style');
      expect(content).toContain('## Testing');
    }
    expect(cursor.startsWith('---\n')).toBe(true);
    expect(cursor).toContain('# lifecycle-app');
  });

  it('check passes right after build, and fails after the config drifts', () => {
    runInit({ cwd: dir, name: 'demo' }, logger());
    runBuild({ cwd: dir }, logger());

    expect(runCheck({ cwd: dir }, logger())).toBe(0);
    const okResult = evaluateCheck({ cwd: dir });
    expect(okResult.inSync).toBe(true);
    expect(okResult.outcomes).toHaveLength(4);

    // Simulate editing a rule fragment without regenerating.
    writeFileSync(path.join(dir, 'rules', '10-coding-style.md'), '# Coding Style\n\nNew rule: no tabs.\n', 'utf8');

    expect(runCheck({ cwd: dir }, logger())).toBe(1);
    const staleResult = evaluateCheck({ cwd: dir });
    expect(staleResult.inSync).toBe(false);
    expect(staleResult.outcomes.every((o) => o.status === 'out-of-sync')).toBe(true);
  });

  it('diff reports missing files as differences and exits 1', () => {
    runInit({ cwd: dir, name: 'demo' }, logger());
    const out = new MemoryStream();
    const code = runDiff({ cwd: dir }, createLogger(out, new MemoryStream()));
    expect(code).toBe(1);
    expect(out.toString()).toContain('CLAUDE.md');
    expect(out.toString()).toContain('+ # demo');
  });

  it('diff is clean after a fresh build, then shows +/- after a drift', () => {
    runInit({ cwd: dir, name: 'demo' }, logger());
    runBuild({ cwd: dir }, logger());

    expect(runDiff({ cwd: dir }, logger())).toBe(0);

    writeFileSync(path.join(dir, 'rules', '00-overview.md'), '# Project Overview\n\nUpdated overview text.\n', 'utf8');

    const out = new MemoryStream();
    const code = runDiff({ cwd: dir }, createLogger(out, new MemoryStream()));
    expect(code).toBe(1);
    expect(out.toString()).toContain('- This section is included in every generated agent config file, so keep it');
    expect(out.toString()).toContain('+ Updated overview text.');
  });

  it('re-running build after a drift restores check to passing', () => {
    runInit({ cwd: dir, name: 'demo' }, logger());
    runBuild({ cwd: dir }, logger());
    writeFileSync(path.join(dir, 'rules', '00-overview.md'), '# Project Overview\n\nUpdated overview text.\n', 'utf8');
    expect(runCheck({ cwd: dir }, logger())).toBe(1);

    expect(runBuild({ cwd: dir }, logger())).toBe(0);
    expect(runCheck({ cwd: dir }, logger())).toBe(0);
  });

  it('--only restricts build and check to the requested targets', () => {
    runInit({ cwd: dir, name: 'demo' }, logger());
    expect(runBuild({ cwd: dir, only: ['claude'] }, logger())).toBe(0);

    expect(existsSync(path.join(dir, 'CLAUDE.md'))).toBe(true);
    expect(existsSync(path.join(dir, 'AGENTS.md'))).toBe(false);

    expect(runCheck({ cwd: dir, only: ['claude'] }, logger())).toBe(0);
  });

  it('build fails clearly when there is no config file yet', () => {
    const err = new MemoryStream();
    const code = runBuild({ cwd: dir }, createLogger(new MemoryStream(), err));
    expect(code).toBe(1);
    expect(err.toString()).toContain('agentsync init');
  });

  it('build fails clearly when --only names an unknown target', () => {
    runInit({ cwd: dir, name: 'demo' }, logger());
    const err = new MemoryStream();
    const code = runBuild({ cwd: dir, only: ['not-a-real-target'] }, createLogger(new MemoryStream(), err));
    expect(code).toBe(1);
    expect(err.toString()).toContain('Unknown target');
  });

  it('honors a custom rulesDir and rulesOrder from config', () => {
    writeFileSync(
      path.join(dir, 'agentsync.config.yaml'),
      [
        'version: 1',
        'project:',
        '  name: custom-dirs',
        'sources:',
        '  rulesDir: guidelines',
        'rulesOrder:',
        '  - 20-last.md',
        '  - 00-first.md',
        'targets:',
        '  claude: {}',
        '',
      ].join('\n'),
      'utf8',
    );
    const guidelinesDir = path.join(dir, 'guidelines');
    mkdirSync(guidelinesDir, { recursive: true });
    writeFileSync(path.join(guidelinesDir, '00-first.md'), '# First\n\nFirst body.', 'utf8');
    writeFileSync(path.join(guidelinesDir, '20-last.md'), '# Last\n\nLast body.', 'utf8');

    expect(runBuild({ cwd: dir }, logger())).toBe(0);
    const content = readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
    const lastIdx = content.indexOf('## Last');
    const firstIdx = content.indexOf('## First');
    expect(lastIdx).toBeGreaterThan(-1);
    expect(firstIdx).toBeGreaterThan(lastIdx);
  });
});
