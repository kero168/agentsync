import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadRules, parseRuleFragment, RulesError } from '../../src/index.js';

describe('parseRuleFragment', () => {
  it('extracts the title from a leading heading and strips it from the body', () => {
    const fragment = parseRuleFragment('10-style.md', '# Coding Style\n\nUse two spaces.\n');
    expect(fragment.title).toBe('Coding Style');
    expect(fragment.body).toBe('Use two spaces.');
  });

  it('falls back to a title derived from the filename when there is no heading', () => {
    const fragment = parseRuleFragment('20-api-conventions.md', 'Use REST, not RPC.');
    expect(fragment.title).toBe('Api Conventions');
    expect(fragment.body).toBe('Use REST, not RPC.');
  });

  it('normalizes CRLF line endings', () => {
    const fragment = parseRuleFragment('00-a.md', '# Title\r\n\r\nBody line.\r\n');
    expect(fragment.title).toBe('Title');
    expect(fragment.body).toBe('Body line.');
  });
});

describe('loadRules', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'agentsync-rules-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('throws when the directory does not exist', () => {
    expect(() => loadRules(path.join(dir, 'missing'))).toThrow(RulesError);
  });

  it('throws when the directory has no Markdown files', () => {
    writeFileSync(path.join(dir, 'notes.txt'), 'hello', 'utf8');
    expect(() => loadRules(dir)).toThrow(/No Markdown rule fragments/);
  });

  it('loads files in alphabetical order by default', () => {
    writeFileSync(path.join(dir, '20-b.md'), '# B', 'utf8');
    writeFileSync(path.join(dir, '10-a.md'), '# A', 'utf8');
    const rules = loadRules(dir);
    expect(rules.map((r) => r.filename)).toEqual(['10-a.md', '20-b.md']);
  });

  it('honors an explicit order and appends the rest alphabetically', () => {
    writeFileSync(path.join(dir, '10-a.md'), '# A', 'utf8');
    writeFileSync(path.join(dir, '20-b.md'), '# B', 'utf8');
    writeFileSync(path.join(dir, '05-z.md'), '# Z', 'utf8');
    const rules = loadRules(dir, ['20-b.md']);
    expect(rules.map((r) => r.filename)).toEqual(['20-b.md', '05-z.md', '10-a.md']);
  });

  it('throws when rulesOrder references a missing file', () => {
    writeFileSync(path.join(dir, '10-a.md'), '# A', 'utf8');
    expect(() => loadRules(dir, ['does-not-exist.md'])).toThrow(RulesError);
  });
});
