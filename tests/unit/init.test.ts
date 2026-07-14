import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createLogger, MemoryStream, runInit } from '../../src/index.js';

describe('runInit', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'agentsync-init-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('scaffolds a config file and three starter rule fragments', () => {
    const logger = createLogger(new MemoryStream(), new MemoryStream());
    const code = runInit({ cwd: dir, name: 'my-app' }, logger);
    expect(code).toBe(0);
    expect(existsSync(path.join(dir, 'agentsync.config.yaml'))).toBe(true);
    expect(existsSync(path.join(dir, 'rules', '00-overview.md'))).toBe(true);
    expect(existsSync(path.join(dir, 'rules', '10-coding-style.md'))).toBe(true);
    expect(existsSync(path.join(dir, 'rules', '20-testing.md'))).toBe(true);

    const configContent = readFileSync(path.join(dir, 'agentsync.config.yaml'), 'utf8');
    expect(configContent).toContain('name: my-app');
    expect(configContent).toContain('version: 1');
  });

  it('refuses to overwrite an existing config without --force', () => {
    const out = new MemoryStream();
    const err = new MemoryStream();
    const logger = createLogger(out, err);

    expect(runInit({ cwd: dir, name: 'a' }, logger)).toBe(0);
    const code = runInit({ cwd: dir, name: 'b' }, logger);
    expect(code).toBe(1);
    expect(err.toString()).toContain('already exists');

    const configContent = readFileSync(path.join(dir, 'agentsync.config.yaml'), 'utf8');
    expect(configContent).toContain('name: a');
  });

  it('overwrites when --force is passed', () => {
    const logger = createLogger(new MemoryStream(), new MemoryStream());
    runInit({ cwd: dir, name: 'a' }, logger);
    const code = runInit({ cwd: dir, name: 'b', force: true }, logger);
    expect(code).toBe(0);
    const configContent = readFileSync(path.join(dir, 'agentsync.config.yaml'), 'utf8');
    expect(configContent).toContain('name: b');
  });

  it('derives the project name from the directory when --name is omitted', () => {
    const projectDir = path.join(dir, 'cool-project');
    const logger = createLogger(new MemoryStream(), new MemoryStream());
    const code = runInit({ cwd: dir, targetDir: 'cool-project' }, logger);
    expect(code).toBe(0);
    const configContent = readFileSync(path.join(projectDir, 'agentsync.config.yaml'), 'utf8');
    expect(configContent).toContain('name: cool-project');
  });
});
