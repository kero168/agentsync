export function configTemplate(projectName: string): string {
  return `# agentsync configuration
# Docs: https://github.com/kero168/agentsync#configuration
version: 1

project:
  name: ${projectName}
  description: "Coding guidelines shared by every AI assistant on this project."

sources:
  # Directory containing Markdown rule fragments, relative to this file.
  rulesDir: rules

# Explicit ordering of rule fragment filenames (optional). Files not
# listed here are appended afterwards in alphabetical order.
rulesOrder:
  - 00-overview.md
  - 10-coding-style.md
  - 20-testing.md

targets:
  claude:
    enabled: true
    output: CLAUDE.md
  agents:
    enabled: true
    output: AGENTS.md
  cursor:
    enabled: true
    output: .cursor/rules/agentsync.mdc
  gemini:
    enabled: true
    output: GEMINI.md
`;
}

export const overviewTemplate = `# Project Overview

Describe what this project does, its stack, and how the pieces fit together.
This section is included in every generated agent config file, so keep it
short and high-signal.
`;

export const codingStyleTemplate = `# Coding Style

- Follow the existing formatting and linting configuration; do not hand-roll style.
- Prefer small, focused functions and modules over large ones.
- Write comments that explain *why*, not *what*.
`;

export const testingTemplate = `# Testing

- Add or update tests for every behavior change.
- Run the full test suite before proposing a change is complete.
- Prefer fast, deterministic unit tests; keep integration tests focused on real seams.
`;
