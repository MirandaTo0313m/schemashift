import { JSONSchema7 } from 'json-schema';

export interface MergeOptions {
  strategy?: 'union' | 'intersection';
  preferSource?: boolean;
}

export interface MergeResult {
  schema: JSONSchema7;
  conflicts: MergeConflict[];
}

export interface MergeConflict {
  path: string;
  sourceValue: unknown;
  targetValue: unknown;
  resolved: unknown;
}

export function mergeSchemas(
  source: JSONSchema7,
  target: JSONSchema7,
  options: MergeOptions = {}
): MergeResult {
  const { strategy = 'union', preferSource = false } = options;
  const conflicts: MergeConflict[] = [];
  const schema = mergeObjects(source, target, '', strategy, preferSource, conflicts);
  return { schema, conflicts };
}

function mergeObjects(
  source: Record<string, unknown>,
  target: Record<string, unknown>,
  path: string,
  strategy: 'union' | 'intersection',
  preferSource: boolean,
  conflicts: MergeConflict[]
): JSONSchema7 {
  const sourceKeys = new Set(Object.keys(source));
  const targetKeys = new Set(Object.keys(target));

  const allKeys =
    strategy === 'union'
      ? new Set([...sourceKeys, ...targetKeys])
      : new Set([...sourceKeys].filter((k) => targetKeys.has(k)));

  const result: Record<string, unknown> = {};

  for (const key of allKeys) {
    const fieldPath = path ? `${path}.${key}` : key;
    const inSource = sourceKeys.has(key);
    const inTarget = targetKeys.has(key);

    if (inSource && !inTarget) {
      result[key] = source[key];
    } else if (!inSource && inTarget) {
      result[key] = target[key];
    } else {
      const sv = source[key];
      const tv = target[key];

      if (isPlainObject(sv) && isPlainObject(tv)) {
        result[key] = mergeObjects(
          sv as Record<string, unknown>,
          tv as Record<string, unknown>,
          fieldPath,
          strategy,
          preferSource,
          conflicts
        );
      } else if (JSON.stringify(sv) !== JSON.stringify(tv)) {
        const resolved = preferSource ? sv : tv;
        conflicts.push({ path: fieldPath, sourceValue: sv, targetValue: tv, resolved });
        result[key] = resolved;
      } else {
        result[key] = sv;
      }
    }
  }

  return result as JSONSchema7;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
