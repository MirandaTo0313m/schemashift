import { JSONSchema7 } from 'json-schema';
import { SchemaDiff, SchemaChange } from '../diff/schemaDiff';

export interface PatchResult {
  patched: JSONSchema7;
  applied: SchemaChange[];
  skipped: SchemaChange[];
}

/**
 * Applies a set of schema changes (from a diff) to a base schema,
 * producing a patched schema that reflects the target version.
 */
export function applyPatch(
  base: JSONSchema7,
  diff: SchemaDiff,
  options: { skipBreaking?: boolean } = {}
): PatchResult {
  const patched: JSONSchema7 = JSON.parse(JSON.stringify(base));
  const applied: SchemaChange[] = [];
  const skipped: SchemaChange[] = [];

  for (const change of diff.changes) {
    if (options.skipBreaking && change.breaking) {
      skipped.push(change);
      continue;
    }

    try {
      applyChange(patched, change);
      applied.push(change);
    } catch {
      skipped.push(change);
    }
  }

  return { patched, applied, skipped };
}

function applyChange(schema: JSONSchema7, change: SchemaChange): void {
  const parts = change.path.replace(/^#\//, '').split('/');
  const key = parts[parts.length - 1];
  const parent = resolveParentObject(schema, parts.slice(0, -1));

  switch (change.type) {
    case 'added':
      if (parent && key) {
        (parent as Record<string, unknown>)[key] = change.value;
      }
      break;

    case 'removed':
      if (parent && key) {
        delete (parent as Record<string, unknown>)[key];
      }
      break;

    case 'modified':
      if (parent && key) {
        (parent as Record<string, unknown>)[key] = change.value;
      }
      break;

    default:
      throw new Error(`Unknown change type: ${(change as SchemaChange).type}`);
  }
}

function resolveParentObject(
  schema: JSONSchema7,
  parts: string[]
): Record<string, unknown> | null {
  let current: unknown = schema;
  for (const part of parts) {
    if (current === null || typeof current !== 'object') return null;
    current = (current as Record<string, unknown>)[part];
  }
  return current as Record<string, unknown>;
}
