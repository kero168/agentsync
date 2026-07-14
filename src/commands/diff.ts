import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { diffLines, formatDiff, hasChanges } from '../core/diff.js';
import { toErrorMessage } from '../core/errors.js';
import type { Logger } from '../utils/logger.js';
import { prepareRun, type CommonOptions } from './shared.js';

export function runDiff(options: CommonOptions, logger: Logger): number {
  try {
    const { config, configDir, rules, targets } = prepareRun(options);

    if (targets.length === 0) {
      logger.warn('No enabled targets to diff.');
      return 0;
    }

    let anyDiff = false;

    for (const target of targets) {
      const expected = target.adapter.render({ config, rules });
      const outputAbs = path.resolve(configDir, target.outputPath);
      const actual = existsSync(outputAbs) ? readFileSync(outputAbs, 'utf8') : '';

      const ops = diffLines(actual, expected);
      if (!hasChanges(ops)) {
        logger.success(`${target.outputPath} — in sync`);
        continue;
      }

      anyDiff = true;
      logger.warn(`${target.outputPath} — ${existsSync(outputAbs) ? 'out of sync' : 'missing'}`);
      logger.info(formatDiff(ops, { actualLabel: target.outputPath, expectedLabel: target.outputPath }));
      logger.info('');
    }

    if (anyDiff) {
      logger.error('agentsync diff found differences. Run "agentsync build" to apply them.');
      return 1;
    }
    logger.success('All targets are in sync.');
    return 0;
  } catch (err) {
    logger.error(toErrorMessage(err));
    return 1;
  }
}
