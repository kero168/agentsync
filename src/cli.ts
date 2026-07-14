#!/usr/bin/env node
import { Command } from 'commander';
import { runBuild } from './commands/build.js';
import { runCheck } from './commands/check.js';
import { runDiff } from './commands/diff.js';
import { runInit } from './commands/init.js';
import { createLogger } from './utils/logger.js';
import { VERSION } from './version.js';

function parseOnly(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  const ids = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.length > 0 ? ids : undefined;
}

export function buildProgram(): Command {
  const program = new Command();
  const logger = createLogger();

  program
    .name('agentsync')
    .description(
      'Single source of truth for AI coding assistant instructions.\n' +
        'Generate and keep CLAUDE.md, AGENTS.md, Cursor rules, and GEMINI.md in sync\n' +
        'from agentsync.config.yaml and Markdown fragments in rules/.',
    )
    .version(VERSION, '-v, --version', 'print the agentsync version');

  program
    .command('init')
    .description('scaffold a new agentsync.config.yaml and starter rules/ directory')
    .argument('[directory]', 'directory to initialize', '.')
    .option('-f, --force', 'overwrite existing files', false)
    .option('-n, --name <name>', 'project name to write into the config')
    .action((directory: string, opts: { force?: boolean; name?: string }) => {
      const code = runInit({ cwd: process.cwd(), targetDir: directory, force: opts.force, name: opts.name }, logger);
      process.exitCode = code;
    });

  program
    .command('build')
    .description('generate every enabled target file from agentsync.config.yaml and rules/')
    .option('-c, --config <path>', 'path to agentsync.config.yaml')
    .option('--only <targets>', 'comma-separated list of target ids to build, e.g. "claude,cursor"')
    .action((opts: { config?: string; only?: string }) => {
      const code = runBuild({ cwd: process.cwd(), configPath: opts.config, only: parseOnly(opts.only) }, logger);
      process.exitCode = code;
    });

  program
    .command('check')
    .description('verify generated files are in sync with source; exits 1 if not (CI-friendly)')
    .option('-c, --config <path>', 'path to agentsync.config.yaml')
    .option('--only <targets>', 'comma-separated list of target ids to check')
    .action((opts: { config?: string; only?: string }) => {
      const code = runCheck({ cwd: process.cwd(), configPath: opts.config, only: parseOnly(opts.only) }, logger);
      process.exitCode = code;
    });

  program
    .command('diff')
    .description('show what would change if you ran "agentsync build"')
    .option('-c, --config <path>', 'path to agentsync.config.yaml')
    .option('--only <targets>', 'comma-separated list of target ids to diff')
    .action((opts: { config?: string; only?: string }) => {
      const code = runDiff({ cwd: process.cwd(), configPath: opts.config, only: parseOnly(opts.only) }, logger);
      process.exitCode = code;
    });

  return program;
}

export async function main(argv: string[] = process.argv): Promise<void> {
  const program = buildProgram();
  await program.parseAsync(argv);
}

const isMainModule = (() => {
  try {
    return import.meta.url === `file://${process.argv[1]}`;
  } catch {
    return false;
  }
})();

if (isMainModule) {
  main().catch((err) => {
    process.stderr.write(`${err instanceof Error ? err.stack ?? err.message : String(err)}\n`);
    process.exitCode = 1;
  });
}
