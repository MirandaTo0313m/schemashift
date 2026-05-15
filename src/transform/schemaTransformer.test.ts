import { applyTransformRules, TransformRule } from "./schemaTransformer";

describe("applyTransformRules", () => {
  const baseData = { name: "Alice", age: "30", meta: { role: "admin" } };

  it("renames a top-level field", () => {
    const rules: TransformRule[] = [{ path: "name", type: "rename", to: "fullName" }];
    const { data, applied } = applyTransformRules(baseData, rules);
    expect(data).toHaveProperty("fullName", "Alice");
    expect(data).not.toHaveProperty("name");
    expect(applied).toContain("rename:name->fullName");
  });

  it("coerces a string field to number", () => {
    const rules: TransformRule[] = [{ path: "age", type: "coerce", to: "number" }];
    const { data, applied } = applyTransformRules(baseData, rules);
    expect(data.age).toBe(30);
    expect(typeof data.age).toBe("number");
    expect(applied).toContain("coerce:age");
  });

  it("applies a default value to a missing field", () => {
    const rules: TransformRule[] = [{ path: "status", type: "default", value: "active" }];
    const { data, applied } = applyTransformRules(baseData, rules);
    expect(data.status).toBe("active");
    expect(applied).toContain("default:status");
  });

  it("does not overwrite existing field with default", () => {
    const rules: TransformRule[] = [{ path: "name", type: "default", value: "Bob" }];
    const { data, skipped } = applyTransformRules(baseData, rules);
    expect(data.name).toBe("Alice");
    expect(skipped).toContain("default:name");
  });

  it("drops a field", () => {
    const rules: TransformRule[] = [{ path: "age", type: "drop" }];
    const { data, applied } = applyTransformRules(baseData, rules);
    expect(data).not.toHaveProperty("age");
    expect(applied).toContain("drop:age");
  });

  it("handles nested field rename", () => {
    const rules: TransformRule[] = [{ path: "meta.role", type: "rename", to: "userRole" }];
    const { data, applied } = applyTransformRules(baseData, rules);
    expect((data.meta as Record<string, unknown>).userRole).toBe("admin");
    expect((data.meta as Record<string, unknown>)).not.toHaveProperty("role");
    expect(applied).toContain("rename:meta.role->userRole");
  });

  it("skips rule when path does not exist", () => {
    const rules: TransformRule[] = [{ path: "nonexistent", type: "drop" }];
    const { skipped } = applyTransformRules(baseData, rules);
    expect(skipped).toContain("drop:nonexistent");
  });

  it("does not mutate original data", () => {
    const original = { value: 42 };
    const rules: TransformRule[] = [{ path: "value", type: "drop" }];
    applyTransformRules(original, rules);
    expect(original.value).toBe(42);
  });
});
