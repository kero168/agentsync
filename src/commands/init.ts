import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { DEFAULT_CONFIG_FILENAME } from '../core/config.js';
import { toErrorMessage } from '../core/errors.js';
import type { Logger } from '../utils/logger.js';
import { codingStyleTemplate, configTemplate, overviewTemplate, testingTemplate } from './init-templates.js';

export interface InitOptions {
  cwd: string;
  targetDir?: string;
  force?: boolean;
  name?: string;
}

/** Scaffolds a new agentsync project: config file + starter rule fragments. */
export function runInit(options: InitOptions, logger: Logger): number {
  try {
    const root = path.resolve(options.cwd, options.targetDir ?? '.');
    const configFile = path.join(root, DEFAULT_CONFIG_FILENAME);
    const rulesDir = path.join(root, 'rules');

    if (existsSync(configFile) && !options.force) {
      logger.error(`${configFile} already exists. Re-run with --force to overwrite.`);
      return 1;
    }

    const projectName = options.name?.trim() || path.basename(root) || 'my-project';

    mkdirSync(rulesDir, { recursive: true });
    writeFileSync(configFile, configTemplate(projectName), 'utf8');
    writeIfAllowed(path.join(rulesDir, '00-overview.md'), overviewTemplate, options.force);
    writeIfAllowed(path.join(rulesDir, '10-coding-style.md'), codingStyleTemplate, options.force);
    writeIfAllowed(path.join(rulesDir, '20-testing.md'), testingTemplate, options.force);

    logger.success(`Initialized agentsync project in ${root}`);
    logger.info('');
    logger.info('Next steps:');
    logger.info('  1. Edit rules/*.md and agentsync.config.yaml to describe your project.');
    logger.info('  2. Run "agentsync build" to generate CLAUDE.md, AGENTS.md, .cursor/rules/agentsync.mdc, GEMINI.md.');
    logger.info('  3. Run "agentsync check" in CI to make sure they never drift from source.');
    return 0;
  } catch (err) {
    logger.error(toErrorMessage(err));
    return 1;
  }
}

function writeIfAllowed(file: string, content: string, force?: boolean): void {
  if (existsSync(file) && !force) return;
  writeFileSync(file, content, 'utf8');
}
