/**
 * Minimal, dependency-free line-based diff used by `agentsync diff`.
 * Not meant to compete with real diff algorithms on huge files — rule
 * fragments and generated agent instruction files are small text
 * documents, so a straightforward O(n*m) LCS is plenty fast and keeps
 * the dependency list minimal.
 */

export type DiffOp =
  | { type: 'context'; line: string }
  | { type: 'remove'; line: string }
  | { type: 'add'; line: string };

export function diffLines(actual: string, expected: string): DiffOp[] {
  const a = actual.length > 0 ? actual.split('\n') : [];
  const b = expected.length > 0 ? expected.split('\n') : [];
  const n = a.length;
  const m = b.length;

  // dp[i][j] = length of the LCS of a[i..] and b[j..]
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: 'context', line: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: 'remove', line: a[i] });
      i++;
    } else {
      ops.push({ type: 'add', line: b[j] });
      j++;
    }
  }
  while (i < n) {
    ops.push({ type: 'remove', line: a[i] });
    i++;
  }
  while (j < m) {
    ops.push({ type: 'add', line: b[j] });
    j++;
  }
  return ops;
}

export interface UnifiedDiffLabels {
  actualLabel: string;
  expectedLabel: string;
}

/** Renders diffLines() output as a simple, readable unified-style diff. */
export function formatDiff(ops: DiffOp[], labels: UnifiedDiffLabels): string {
  const header = `--- ${labels.actualLabel} (current)\n+++ ${labels.expectedLabel} (expected)`;
  const body = ops
    .map((op) => {
      if (op.type === 'context') return `  ${op.line}`;
      if (op.type === 'remove') return `- ${op.line}`;
      return `+ ${op.line}`;
    })
    .join('\n');
  return `${header}\n${body}`;
}

export function hasChanges(ops: DiffOp[]): boolean {
  return ops.some((op) => op.type !== 'context');
}
