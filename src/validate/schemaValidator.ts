import Ajv, { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
}

function compileSchema(schema: object): ValidateFunction {
  try {
    return ajv.compile(schema);
  } catch (err: any) {
    throw new Error(`Failed to compile schema: ${err.message}`);
  }
}

export function validateData(schema: object, data: unknown): ValidationResult {
  const validate = compileSchema(schema);
  const valid = validate(data) as boolean;

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors: ValidationError[] = (validate.errors ?? []).map((err) => ({
    path: err.instancePath || "/",
    message: err.message ?? "Unknown validation error",
  }));

  return { valid: false, errors };
}

export function validateAgainstBothVersions(
  oldSchema: object,
  newSchema: object,
  data: unknown
): { oldResult: ValidationResult; newResult: ValidationResult } {
  return {
    oldResult: validateData(oldSchema, data),
    newResult: validateData(newSchema, data),
  };
}

export function isSchemaCompatible(
  oldSchema: object,
  newSchema: object,
  sampleData: unknown[]
): boolean {
  return sampleData.every((item) => {
    const { oldResult, newResult } = validateAgainstBothVersions(
      oldSchema,
      newSchema,
      item
    );
    return oldResult.valid === newResult.valid;
  });
}
