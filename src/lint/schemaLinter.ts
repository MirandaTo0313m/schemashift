import { JSONSchema7 } from "json-schema";

export interface LintRule {
  id: string;
  description: string;
  check: (schema: JSONSchema7) => LintViolation[];
}

export interface LintViolation {
  ruleId: string;
  message: string;
  path: string;
}

export interface LintResult {
  schema: JSONSchema7;
  violations: LintViolation[];
  passed: boolean;
}

const builtinRules: LintRule[] = [
  {
    id: "require-description",
    description: "All schemas should have a description",
    check: (schema) => {
      if (!schema.description) {
        return [{ ruleId: "require-description", message: "Schema is missing a description", path: "#" }];
      }
      return [];
    },
  },
  {
    id: "no-empty-properties",
    description: "Object schemas should define at least one property",
    check: (schema) => {
      if (schema.type === "object" && (!schema.properties || Object.keys(schema.properties).length === 0)) {
        return [{ ruleId: "no-empty-properties", message: "Object schema has no properties defined", path: "#" }];
      }
      return [];
    },
  },
  {
    id: "array-items-defined",
    description: "Array schemas should define an items type",
    check: (schema) => {
      if (schema.type === "array" && !schema.items) {
        return [{ ruleId: "array-items-defined", message: "Array schema is missing an items definition", path: "#" }];
      }
      return [];
    },
  },
  {
    id: "no-additional-properties-wildcard",
    description: "Avoid using additionalProperties: true without constraints",
    check: (schema) => {
      if (schema.type === "object" && schema.additionalProperties === true) {
        return [{ ruleId: "no-additional-properties-wildcard", message: "additionalProperties is set to true, consider restricting it", path: "#" }];
      }
      return [];
    },
  },
];

export function lintSchema(schema: JSONSchema7, customRules: LintRule[] = []): LintResult {
  const rules = [...builtinRules, ...customRules];
  const violations: LintViolation[] = [];

  for (const rule of rules) {
    const ruleViolations = rule.check(schema);
    violations.push(...ruleViolations);
  }

  return {
    schema,
    violations,
    passed: violations.length === 0,
  };
}

export function formatLintResult(result: LintResult): string {
  if (result.passed) {
    return "✅ Schema passed all lint checks.";
  }
  const lines = [`❌ Schema failed ${result.violations.length} lint check(s):`];
  for (const v of result.violations) {
    lines.push(`  [${v.ruleId}] ${v.message} (at ${v.path})`);
  }
  return lines.join("\n");
}
