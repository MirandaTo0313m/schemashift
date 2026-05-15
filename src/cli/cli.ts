#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { diffSchemas } from '../diff';
import { generateMigration } from '../migrate/migrationGenerator';
import { formatMigrationMarkdown, formatMigrationJson } from '../migrate/migrationFormatter';

type OutputFormat = 'json' | 'markdown';

interface CliOptions {
  oldSchema: string;
  newSchema: string;
  output?: string;
  format: OutputFormat;
  fromVersion: string;
  toVersion: string;
}

function parseArgs(argv: string[]): CliOptions {
  const args = argv.slice(2);
  const opts: Partial<CliOptions> = { format: 'markdown' };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--old': opts.oldSchema = args[++i]; break;
      case '--new': opts.newSchema = args[++i]; break;
      case '--output': opts.output = args[++i]; break;
      case '--format': opts.format = args[++i] as OutputFormat; break;
      case '--from': opts.fromVersion = args[++i]; break;
      case '--to': opts.toVersion = args[++i]; break;
      default:
        console.error(`Unknown argument: ${args[i]}`);
        process.exit(1);
    }
  }

  if (!opts.oldSchema || !opts.newSchema || !opts.fromVersion || !opts.toVersion) {
    console.error('Usage: schemashift --old <file> --new <file> --from <version> --to <version> [--format json|markdown] [--output <file>]');
    process.exit(1);
  }

  return opts as CliOptions;
}

function loadSchema(filePath: string): object {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(resolved, 'utf-8'));
}

export function run(argv: string[] = process.argv): void {
  const opts = parseArgs(argv);
  const oldSchema = loadSchema(opts.oldSchema);
  const newSchema = loadSchema(opts.newSchema);

  const changes = diffSchemas(oldSchema, newSchema);
  const migration = generateMigration(opts.fromVersion, opts.toVersion, changes);

  const result = opts.format === 'json'
    ? formatMigrationJson(migration)
    : formatMigrationMarkdown(migration);

  if (opts.output) {
    fs.writeFileSync(path.resolve(opts.output), result, 'utf-8');
    console.log(`Migration written to ${opts.output}`);
  } else {
    console.log(result);
  }
}

run();
