import { Migration, MigrationStep } from './migrationGenerator';

function stepToMarkdown(step: MigrationStep, index: number): string {
  const breakingBadge = step.breaking ? ' ⚠️ **BREAKING**' : '';
  const lines = [
    `### Step ${index + 1}: ${step.description}${breakingBadge}`,
    `- **Type:** \`${step.type}\``,
    `- **Path:** \`${step.path}\``,
  ];
  if (step.before !== undefined) {
    lines.push(`- **Before:** \`${JSON.stringify(step.before)}\``);
  }
  if (step.after !== undefined) {
    lines.push(`- **After:** \`${JSON.stringify(step.after)}\``);
  }
  return lines.join('\n');
}

export function formatMigrationMarkdown(migration: Migration): string {
  const breakingWarning = migration.hasBreakingChanges
    ? '\n> ⚠️ This migration contains **breaking changes**.\n'
    : '';

  const stepsSection =
    migration.steps.length > 0
      ? migration.steps.map(stepToMarkdown).join('\n\n')
      : '_No changes detected._';

  return [
    `## Migration: ${migration.fromVersion} → ${migration.toVersion}`,
    `_Generated at: ${migration.generatedAt}_`,
    breakingWarning,
    `**Total steps:** ${migration.steps.length}`,
    '',
    '## Steps',
    '',
    stepsSection,
  ]
    .join('\n')
    .trim();
}

export function formatMigrationJson(migration: Migration): string {
  return JSON.stringify(migration, null, 2);
}
