import { describe, it, expect } from "vitest";
import {
  validateData,
  validateAgainstBothVersions,
  isSchemaCompatible,
} from "./schemaValidator";

const schemaV1 = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "integer" },
  },
  required: ["name"],
};

const schemaV2 = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "integer" },
    email: { type: "string", format: "email" },
  },
  required: ["name", "email"],
};

describe("validateData", () => {
  it("returns valid for conforming data", () => {
    const result = validateData(schemaV1, { name: "Alice", age: 30 });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns errors for missing required field", () => {
    const result = validateData(schemaV1, { age: 30 });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("returns error path and message", () => {
    const result = validateData(schemaV1, { age: 30 });
    expect(result.errors[0]).toHaveProperty("path");
    expect(result.errors[0]).toHaveProperty("message");
  });
});

describe("validateAgainstBothVersions", () => {
  it("returns results for both schemas", () => {
    const data = { name: "Bob", email: "bob@example.com" };
    const { oldResult, newResult } = validateAgainstBothVersions(
      schemaV1,
      schemaV2,
      data
    );
    expect(oldResult.valid).toBe(true);
    expect(newResult.valid).toBe(true);
  });

  it("detects data valid in v1 but invalid in v2", () => {
    const data = { name: "Bob" };
    const { oldResult, newResult } = validateAgainstBothVersions(
      schemaV1,
      schemaV2,
      data
    );
    expect(oldResult.valid).toBe(true);
    expect(newResult.valid).toBe(false);
  });
});

describe("isSchemaCompatible", () => {
  it("returns false when data valid in v1 fails v2", () => {
    const samples = [{ name: "Alice" }];
    expect(isSchemaCompatible(schemaV1, schemaV2, samples)).toBe(false);
  });

  it("returns true when all samples behave consistently", () => {
    const samples = [{ name: "Alice", email: "alice@example.com" }];
    expect(isSchemaCompatible(schemaV1, schemaV2, samples)).toBe(true);
  });
});
