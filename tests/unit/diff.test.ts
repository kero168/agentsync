import { describe, expect, it } from 'vitest';
import { diffLines, formatDiff, hasChanges } from '../../src/index.js';

describe('diffLines', () => {
  it('reports no changes for identical text', () => {
    const ops = diffLines('a\nb\nc', 'a\nb\nc');
    expect(hasChanges(ops)).toBe(false);
    expect(ops.every((op) => op.type === 'context')).toBe(true);
  });

  it('detects an added line', () => {
    const ops = diffLines('a\nb', 'a\nb\nc');
    expect(hasChanges(ops)).toBe(true);
    expect(ops.filter((op) => op.type === 'add').map((op) => op.line)).toEqual(['c']);
  });

  it('detects a removed line', () => {
    const ops = diffLines('a\nb\nc', 'a\nc');
    expect(ops.filter((op) => op.type === 'remove').map((op) => op.line)).toEqual(['b']);
  });

  it('detects a changed line as remove+add', () => {
    const ops = diffLines('hello world', 'hello there');
    expect(ops.some((op) => op.type === 'remove' && op.line === 'hello world')).toBe(true);
    expect(ops.some((op) => op.type === 'add' && op.line === 'hello there')).toBe(true);
  });

  it('treats empty strings as zero lines, not one blank line', () => {
    const ops = diffLines('', '');
    expect(ops).toEqual([]);
  });
});

describe('formatDiff', () => {
  it('renders a unified-style header and +/- markers', () => {
    const ops = diffLines('one\ntwo', 'one\nthree');
    const text = formatDiff(ops, { actualLabel: 'CLAUDE.md', expectedLabel: 'CLAUDE.md' });
    expect(text).toContain('--- CLAUDE.md (current)');
    expect(text).toContain('+++ CLAUDE.md (expected)');
    expect(text).toContain('- two');
    expect(text).toContain('+ three');
    expect(text).toContain('  one');
  });
});
