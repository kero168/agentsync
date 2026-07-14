import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { toErrorMessage } from '../core/errors.js';
import type { Logger } from '../utils/logger.js';
import { prepareRun, type CommonOptions } from './shared.js';

export interface CheckOutcome {
  id: string;
  outputPath: string;
  status: 'in-sync' | 'missing' | 'out-of-sync';
}

export interface CheckResult {
  outcomes: CheckOutcome[];
  inSync: boolean;
}

/** Renders every target in memory and compares it against what's on disk. */
export function evaluateCheck(options: CommonOptions): CheckResult {
  const { config, configDir, rules, targets } = prepareRun(options);
  const outcomes: CheckOutcome[] = [];

  for (const target of targets) {
    const expected = target.adapter.render({ config, rules });
    const outputAbs = path.resolve(configDir, target.outputPath);
    if (!existsSync(outputAbs)) {
      outcomes.push({ id: target.id, outputPath: target.outputPath, status: 'missing' });
      continue;
    }
    const actual = readFileSync(outputAbs, 'utf8');
    outcomes.push({
      id: target.id,
      outputPath: target.outputPath,
      status: actual === expected ? 'in-sync' : 'out-of-sync',
    });
  }

  return { outcomes, inSync: outcomes.every((o) => o.status === 'in-sync') };
}

export function runCheck(options: CommonOptions, logger: Logger): number {
  try {
    const { outcomes, inSync } = evaluateCheck(options);

    if (outcomes.length === 0) {
      logger.warn('No enabled targets to check.');
      return 0;
    }

    for (const outcome of outcomes) {
      if (outcome.status === 'in-sync') {
        logger.success(`${outcome.outputPath} — in sync`);
      } else if (outcome.status === 'missing') {
        logger.error(`${outcome.outputPath} — missing (run "agentsync build")`);
      } else {
        logger.error(`${outcome.outputPath} — out of sync (run "agentsync build" or "agentsync diff")`);
      }
    }

    logger.info('');
    if (!inSync) {
      logger.error('agentsync check failed: one or more generated files are out of date.');
      return 1;
    }
    logger.success('All targets are in sync.');
    return 0;
  } catch (err) {
    logger.error(toErrorMessage(err));
    return 1;
  }
}
