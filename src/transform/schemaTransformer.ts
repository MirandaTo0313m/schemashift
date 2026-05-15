import { JSONSchema7 } from "json-schema";

export interface TransformRule {
  path: string;
  type: "rename" | "coerce" | "default" | "drop";
  from?: string;
  to?: string;
  value?: unknown;
}

export interface TransformResult {
  data: Record<string, unknown>;
  applied: string[];
  skipped: string[];
}

export function applyTransformRules(
  data: Record<string, unknown>,
  rules: TransformRule[]
): TransformResult {
  const result = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
  const applied: string[] = [];
  const skipped: string[] = [];

  for (const rule of rules) {
    const keys = rule.path.split(".");
    const lastKey = keys[keys.length - 1];
    const parent = resolveParent(result, keys.slice(0, -1));

    if (!parent) {
      skipped.push(`${rule.type}:${rule.path}`);
      continue;
    }

    switch (rule.type) {
      case "rename":
        if (rule.to && lastKey in parent) {
          parent[rule.to] = parent[lastKey];
          delete parent[lastKey];
          applied.push(`rename:${rule.path}->${rule.to}`);
        } else {
          skipped.push(`rename:${rule.path}`);
        }
        break;

      case "coerce":
        if (lastKey in parent) {
          parent[lastKey] = coerceValue(parent[lastKey], rule.to ?? "string");
          applied.push(`coerce:${rule.path}`);
        } else {
          skipped.push(`coerce:${rule.path}`);
        }
        break;

      case "default":
        if (!(lastKey in parent) || parent[lastKey] === undefined) {
          parent[lastKey] = rule.value;
          applied.push(`default:${rule.path}`);
        } else {
          skipped.push(`default:${rule.path}`);
        }
        break;

      case "drop":
        if (lastKey in parent) {
          delete parent[lastKey];
          applied.push(`drop:${rule.path}`);
        } else {
          skipped.push(`drop:${rule.path}`);
        }
        break;
    }
  }

  return { data: result, applied, skipped };
}

function resolveParent(
  obj: Record<string, unknown>,
  keys: string[]
): Record<string, unknown> | null {
  let current: unknown = obj;
  for (const key of keys) {
    if (typeof current !== "object" || current === null || !(key in (current as Record<string, unknown>))) {
      return null;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current as Record<string, unknown>;
}

function coerceValue(value: unknown, targetType: string): unknown {
  switch (targetType) {
    case "string": return String(value);
    case "number": return Number(value);
    case "boolean": return Boolean(value);
    case "integer": return Math.trunc(Number(value));
    default: return value;
  }
}
