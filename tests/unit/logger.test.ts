import { describe, expect, it } from 'vitest';
import { createLogger, MemoryStream } from '../../src/index.js';

describe('createLogger', () => {
  it('writes info/success/warn to the out stream and error to the err stream', () => {
    const out = new MemoryStream();
    const err = new MemoryStream();
    const logger = createLogger(out, err);

    logger.info('hello');
    logger.success('built CLAUDE.md');
    logger.warn('nothing to do');
    logger.error('boom');

    expect(out.toString()).toContain('hello');
    expect(out.toString()).toContain('[ok]');
    expect(out.toString()).toContain('built CLAUDE.md');
    expect(out.toString()).toContain('[warn]');
    expect(err.toString()).toContain('[fail]');
    expect(err.toString()).toContain('boom');
    expect(err.toString()).not.toContain('boom\nhello');
  });
});
