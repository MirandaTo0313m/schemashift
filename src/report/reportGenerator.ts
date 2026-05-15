import { SchemaDiff } from '../diff/schemaDiff';
import { Migration } from '../migrate/migrationGenerator';
import { formatMigrationMarkdown, formatMigrationJson } from '../migrate/migrationFormatter';

export type ReportFormat = 'markdown' | 'json' | 'summary';

export interface Report {
  generatedAt: string;
  fromVersion: string;
  toVersion: string;
  totalChanges: number;
  breakingChanges: number;
  nonBreakingChanges: number;
  diff: SchemaDiff[];
  migration: Migration;
}

export function buildReport(
  diff: SchemaDiff[],
  migration: Migration,
  fromVersion: string,
  toVersion: string
): Report {
  const breakingChanges = migration.steps.filter((s) => s.breaking).length;
  return {
    generatedAt: new Date().toISOString(),
    fromVersion,
    toVersion,
    totalChanges: diff.length,
    breakingChanges,
    nonBreakingChanges: migration.steps.length - breakingChanges,
    diff,
    migration,
  };
}

export function formatReport(report: Report, format: ReportFormat): string {
  switch (format) {
    case 'json':
      return formatMigrationJson(report.migration);
    case 'markdown':
      return formatMigrationMarkdown(report.migration);
    case 'summary':
      return formatSummary(report);
    default:
      throw new Error(`Unknown report format: ${format}`);
  }
}

function formatSummary(report: Report): string {
  const lines: string[] = [
    `SchemaShift Report`,
    `==================`,
    `Generated: ${report.generatedAt}`,
    `From: ${report.fromVersion}  →  To: ${report.toVersion}`,
    ``,
    `Changes:`,
    `  Total          : ${report.totalChanges}`,
    `  Breaking       : ${report.breakingChanges}`,
    `  Non-breaking   : ${report.nonBreakingChanges}`,
  ];
  return lines.join('\n');
}
