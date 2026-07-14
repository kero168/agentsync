import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

// This exercises the actual built binary (dist/cli.js), including the
// shebang, commander wiring, and process exit codes — not just the
// library functions it's built on. It requires `npm run build` to have
// been run first, which is part of this project's documented test
// pipeline (npm install && npm run build && npm test).
const here = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(here, '../../dist/cli.js');
const hasBuiltCli = existsSync(cliPath);

function run(args: string[], cwd: string): { status: number; stdout: string; stderr: string } {
  try {
    const stdout = execFileSync(process.execPath, [cliPath, ...args], { cwd, encoding: 'utf8' });
    return { status: 0, stdout, stderr: '' };
  } catch (err) {
    const e = err as { status?: number; stdout?: string; stderr?: string };
    return { status: e.status ?? 1, stdout: e.stdout ?? '', stderr: e.stderr ?? '' };
  }
}

describe.skipIf(!hasBuiltCli)('agentsync CLI binary (dist/cli.js)', () => {
  let dir: string;

  beforeAll(() => {
    if (!hasBuiltCli) {
      // eslint-disable-next-line no-console
      console.warn('Skipping CLI binary tests: dist/cli.js not found. Run "npm run build" first.');
    }
  });

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'agentsync-bin-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('prints its version', () => {
    const result = run(['--version'], dir);
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('prints help with all four subcommands', () => {
    const result = run(['--help'], dir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('init');
    expect(result.stdout).toContain('build');
    expect(result.stdout).toContain('check');
    expect(result.stdout).toContain('diff');
  });

  it('runs the full init -> build -> check -> diff flow end to end', () => {
    expect(run(['init', '--name', 'bin-demo'], dir).status).toBe(0);
    expect(existsSync(path.join(dir, 'agentsync.config.yaml'))).toBe(true);

    const buildResult = run(['build'], dir);
    expect(buildResult.status).toBe(0);
    expect(existsSync(path.join(dir, 'CLAUDE.md'))).toBe(true);
    expect(existsSync(path.join(dir, 'AGENTS.md'))).toBe(true);
    expect(existsSync(path.join(dir, 'GEMINI.md'))).toBe(true);
    expect(existsSync(path.join(dir, '.cursor/rules/agentsync.mdc'))).toBe(true);

    expect(run(['check'], dir).status).toBe(0);
    expect(run(['diff'], dir).status).toBe(0);

    const claude = readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
    expect(claude).toContain('# bin-demo');

    // Drift: edit the generated file directly (as if a human "fixed" it).
    appendFileSync(path.join(dir, 'CLAUDE.md'), '\nrogue manual edit\n');

    const checkAfterDrift = run(['check'], dir);
    expect(checkAfterDrift.status).toBe(1);

    const diffAfterDrift = run(['diff'], dir);
    expect(diffAfterDrift.status).toBe(1);
    expect(diffAfterDrift.stdout).toContain('CLAUDE.md');
  });

  it('exits 1 with a clear message when config is missing', () => {
    const result = run(['build'], dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('agentsync init');
  });
});
