import { lintSchema, formatLintResult, LintRule } from "./schemaLinter";
import { JSONSchema7 } from "json-schema";

describe("lintSchema", () => {
  it("passes a well-formed schema", () => {
    const schema: JSONSchema7 = {
      description: "A user object",
      type: "object",
      properties: { name: { type: "string" } },
    };
    const result = lintSchema(schema);
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("flags missing description", () => {
    const schema: JSONSchema7 = { type: "object", properties: { id: { type: "number" } } };
    const result = lintSchema(schema);
    expect(result.passed).toBe(false);
    const ids = result.violations.map((v) => v.ruleId);
    expect(ids).toContain("require-description");
  });

  it("flags object with no properties", () => {
    const schema: JSONSchema7 = { description: "empty object", type: "object" };
    const result = lintSchema(schema);
    const ids = result.violations.map((v) => v.ruleId);
    expect(ids).toContain("no-empty-properties");
  });

  it("flags array without items", () => {
    const schema: JSONSchema7 = { description: "a list", type: "array" };
    const result = lintSchema(schema);
    const ids = result.violations.map((v) => v.ruleId);
    expect(ids).toContain("array-items-defined");
  });

  it("flags additionalProperties: true", () => {
    const schema: JSONSchema7 = {
      description: "open object",
      type: "object",
      properties: { key: { type: "string" } },
      additionalProperties: true,
    };
    const result = lintSchema(schema);
    const ids = result.violations.map((v) => v.ruleId);
    expect(ids).toContain("no-additional-properties-wildcard");
  });

  it("applies custom rules", () => {
    const customRule: LintRule = {
      id: "require-title",
      description: "Schema must have a title",
      check: (s) =>
        s.title ? [] : [{ ruleId: "require-title", message: "Missing title", path: "#" }],
    };
    const schema: JSONSchema7 = { description: "no title", type: "object", properties: { x: { type: "string" } } };
    const result = lintSchema(schema, [customRule]);
    const ids = result.violations.map((v) => v.ruleId);
    expect(ids).toContain("require-title");
  });
});

describe("formatLintResult", () => {
  it("returns success message when passed", () => {
    const schema: JSONSchema7 = {
      description: "valid",
      type: "object",
      properties: { a: { type: "string" } },
    };
    const result = lintSchema(schema);
    expect(formatLintResult(result)).toContain("✅");
  });

  it("returns failure details when violations exist", () => {
    const schema: JSONSchema7 = { type: "array" };
    const result = lintSchema(schema);
    const output = formatLintResult(result);
    expect(output).toContain("❌");
    expect(output).toContain("require-description");
  });
});
