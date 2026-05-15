import { SchemaSnapshot } from './schemaSnapshot';
import { diffSchemas } from '../diff';
import { SchemaDiff } from '../diff';

export interface SnapshotComparison {
  from: string;
  to: string;
  diff: SchemaDiff;
  hasChanges: boolean;
  breakingChanges: number;
  nonBreakingChanges: number;
}

export function compareSnapshots(
  from: SchemaSnapshot,
  to: SchemaSnapshot
): SnapshotComparison {
  const diff = diffSchemas(from.schema, to.schema);
  const breaking = diff.changes.filter((c) => c.breaking).length;
  const nonBreaking = diff.changes.filter((c) => !c.breaking).length;

  return {
    from: from.version,
    to: to.version,
    diff,
    hasChanges: diff.changes.length > 0,
    breakingChanges: breaking,
    nonBreakingChanges: nonBreaking,
  };
}

export function formatComparison(comparison: SnapshotComparison): string {
  const lines: string[] = [
    `## Snapshot Comparison: ${comparison.from} → ${comparison.to}`,
    `- Breaking changes: ${comparison.breakingChanges}`,
    `- Non-breaking changes: ${comparison.nonBreakingChanges}`,
    '',
  ];

  if (!comparison.hasChanges) {
    lines.push('No changes detected between snapshots.');
    return lines.join('\n');
  }

  for (const change of comparison.diff.changes) {
    const tag = change.breaking ? '[BREAKING]' : '[safe]';
    lines.push(`- ${tag} ${change.type} at \`${change.path}\``);
    if (change.description) {
      lines.push(`  ${change.description}`);
    }
  }

  return lines.join('\n');
}
