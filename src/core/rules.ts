import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { RulesError } from './errors.js';
import type { RuleFragment } from './types.js';

/**
 * Loads every Markdown fragment in `rulesDirAbs`, in the order given by
 * `explicitOrder` (filenames not listed there are appended afterwards,
 * sorted alphabetically). Each fragment's leading "# Heading" (if present)
 * becomes its title and is stripped from the body.
 */
export function loadRules(rulesDirAbs: string, explicitOrder?: string[]): RuleFragment[] {
  if (!existsSync(rulesDirAbs) || !statSync(rulesDirAbs).isDirectory()) {
    throw new RulesError(
      `Rules directory not found: ${rulesDirAbs}\nRun "agentsync init" or create it and add *.md fragments.`,
    );
  }

  const allFiles = readdirSync(rulesDirAbs)
    .filter((f) => f.toLowerCase().endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));

  if (allFiles.length === 0) {
    throw new RulesError(`No Markdown rule fragments found in ${rulesDirAbs} (expected files matching *.md).`);
  }

  const orderedFilenames: string[] = [];
  if (explicitOrder && explicitOrder.length > 0) {
    const remaining = new Set(allFiles);
    for (const name of explicitOrder) {
      if (!remaining.has(name)) {
        throw new RulesError(`rulesOrder references "${name}", which does not exist in ${rulesDirAbs}.`);
      }
      orderedFilenames.push(name);
      remaining.delete(name);
    }
    orderedFilenames.push(...Array.from(remaining).sort((a, b) => a.localeCompare(b)));
  } else {
    orderedFilenames.push(...allFiles);
  }

  return orderedFilenames.map((filename) => {
    const raw = readFileSync(path.join(rulesDirAbs, filename), 'utf8');
    return parseRuleFragment(filename, raw);
  });
}

/** Parses one rule fragment's raw text into a title + body. Pure, no I/O. */
export function parseRuleFragment(filename: string, raw: string): RuleFragment {
  const normalized = raw.replace(/\r\n/g, '\n').trim();
  const newlineIndex = normalized.indexOf('\n');
  const firstLine = newlineIndex === -1 ? normalized : normalized.slice(0, newlineIndex);
  const headingMatch = /^#[ \t]+(.+)/.exec(firstLine);
  if (headingMatch) {
    const title = headingMatch[1].trim();
    const body = newlineIndex === -1 ? '' : normalized.slice(newlineIndex + 1).trim();
    return { filename, title, body };
  }
  return { filename, title: titleFromFilename(filename), body: normalized };
}

function titleFromFilename(filename: string): string {
  const base = filename.replace(/\.md$/i, '').replace(/^\d+[-_.]?/, '');
  const words = base.split(/[-_]+/).filter(Boolean);
  if (words.length === 0) return filename;
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
