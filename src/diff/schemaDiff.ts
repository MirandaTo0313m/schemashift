import { JSONSchema7 } from 'json-schema';

export type ChangeType =
  | 'type_changed'
  | 'property_added'
  | 'property_removed'
  | 'required_added'
  | 'required_removed'
  | 'description_changed'
  | 'enum_changed'
  | 'format_changed';

export interface SchemaChange {
  path: string;
  changeType: ChangeType;
  before: unknown;
  after: unknown;
}

export function diffSchemas(
  before: JSONSchema7,
  after: JSONSchema7,
  basePath = '#'
): SchemaChange[] {
  const changes: SchemaChange[] = [];

  if (before.type !== after.type) {
    changes.push({ path: basePath, changeType: 'type_changed', before: before.type, after: after.type });
  }

  if (before.description !== after.description) {
    changes.push({ path: basePath, changeType: 'description_changed', before: before.description, after: after.description });
  }

  if (before.format !== after.format) {
    changes.push({ path: basePath, changeType: 'format_changed', before: before.format, after: after.format });
  }

  if (JSON.stringify(before.enum) !== JSON.stringify(after.enum)) {
    changes.push({ path: basePath, changeType: 'enum_changed', before: before.enum, after: after.enum });
  }

  const beforeProps = before.properties ?? {};
  const afterProps = after.properties ?? {};

  for (const key of Object.keys(afterProps)) {
    if (!(key in beforeProps)) {
      changes.push({ path: `${basePath}/properties/${key}`, changeType: 'property_added', before: undefined, after: afterProps[key] });
    } else {
      changes.push(...diffSchemas(beforeProps[key] as JSONSchema7, afterProps[key] as JSONSchema7, `${basePath}/properties/${key}`));
    }
  }

  for (const key of Object.keys(beforeProps)) {
    if (!(key in afterProps)) {
      changes.push({ path: `${basePath}/properties/${key}`, changeType: 'property_removed', before: beforeProps[key], after: undefined });
    }
  }

  const beforeRequired = new Set(before.required ?? []);
  const afterRequired = new Set(after.required ?? []);

  for (const field of afterRequired) {
    if (!beforeRequired.has(field)) {
      changes.push({ path: `${basePath}/required/${field}`, changeType: 'required_added', before: false, after: true });
    }
  }

  for (const field of beforeRequired) {
    if (!afterRequired.has(field)) {
      changes.push({ path: `${basePath}/required/${field}`, changeType: 'required_removed', before: true, after: false });
    }
  }

  return changes;
}
