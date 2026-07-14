import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { toErrorMessage } from '../core/errors.js';
import type { Logger } from '../utils/logger.js';
import { prepareRun, type CommonOptions } from './shared.js';

export function runBuild(options: CommonOptions, logger: Logger): number {
  try {
    const { config, configDir, rules, targets } = prepareRun(options);

    if (targets.length === 0) {
      logger.warn('No enabled targets to build. Check the "targets" section of your config.');
      return 0;
    }

    for (const target of targets) {
      const content = target.adapter.render({ config, rules });
      const outputAbs = path.resolve(configDir, target.outputPath);
      mkdirSync(path.dirname(outputAbs), { recursive: true });
      writeFileSync(outputAbs, content, 'utf8');
      logger.success(`${target.outputPath}  (${target.adapter.label})`);
    }

    logger.info('');
    logger.info(`Built ${targets.length} target${targets.length === 1 ? '' : 's'}.`);
    return 0;
  } catch (err) {
    logger.error(toErrorMessage(err));
    return 1;
  }
}
