import { diffSchemas } from '../diff';
import { generateMigration } from '../migrate';
import { buildReport } from '../report';
import { getVersion } from './versionRegistry';
import { SchemaDiff } from '../diff/schemaDiff';
import { Migration } from '../migrate/migrationGenerator';
import { SchemaReport } from '../report/reportGenerator';

export interface VersionComparison {
  fromVersion: string;
  toVersion: string;
  diff: SchemaDiff;
  migration: Migration;
  report: SchemaReport;
}

export function compareVersions(
  fromVersion: string,
  toVersion: string
): VersionComparison {
  const from = getVersion(fromVersion);
  const to = getVersion(toVersion);

  if (!from) {
    throw new Error(`Version '${fromVersion}' not found in registry.`);
  }
  if (!to) {
    throw new Error(`Version '${toVersion}' not found in registry.`);
  }

  const diff = diffSchemas(from.schema, to.schema);
  const migration = generateMigration(diff);
  const report = buildReport(diff, migration);

  return {
    fromVersion,
    toVersion,
    diff,
    migration,
    report,
  };
}

export function compareAdjacentVersions(
  versions: string[]
): VersionComparison[] {
  const comparisons: VersionComparison[] = [];
  for (let i = 0; i < versions.length - 1; i++) {
    comparisons.push(compareVersions(versions[i], versions[i + 1]));
  }
  return comparisons;
}
