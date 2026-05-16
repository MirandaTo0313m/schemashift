import { mergeSchemas } from './schemaMerger';
import { JSONSchema7 } from 'json-schema';

describe('mergeSchemas', () => {
  const schemaA: JSONSchema7 = {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
    },
    required: ['id'],
  };

  const schemaB: JSONSchema7 = {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      email: { type: 'string', format: 'email' },
    },
    required: ['id', 'email'],
  };

  it('merges two schemas using union strategy by default', () => {
    const { schema, conflicts } = mergeSchemas(schemaA, schemaB);
    expect(schema.properties).toHaveProperty('name');
    expect(schema.properties).toHaveProperty('email');
    expect(schema.properties).toHaveProperty('id');
    expect(conflicts.length).toBeGreaterThan(0);
  });

  it('merges two schemas using intersection strategy', () => {
    const { schema } = mergeSchemas(schemaA, schemaB, { strategy: 'intersection' });
    expect(schema.properties).toHaveProperty('id');
    expect(schema.properties).not.toHaveProperty('name');
    expect(schema.properties).not.toHaveProperty('email');
  });

  it('records a conflict when required arrays differ', () => {
    const { conflicts } = mergeSchemas(schemaA, schemaB);
    const requiredConflict = conflicts.find((c) => c.path === 'required');
    expect(requiredConflict).toBeDefined();
    expect(requiredConflict?.sourceValue).toEqual(['id']);
    expect(requiredConflict?.targetValue).toEqual(['id', 'email']);
  });

  it('prefers source value when preferSource is true', () => {
    const { schema, conflicts } = mergeSchemas(schemaA, schemaB, { preferSource: true });
    const requiredConflict = conflicts.find((c) => c.path === 'required');
    expect(requiredConflict?.resolved).toEqual(['id']);
    expect(schema.required).toEqual(['id']);
  });

  it('prefers target value by default on conflict', () => {
    const { schema } = mergeSchemas(schemaA, schemaB);
    expect(schema.required).toEqual(['id', 'email']);
  });

  it('returns no conflicts when schemas are identical', () => {
    const { conflicts } = mergeSchemas(schemaA, schemaA);
    expect(conflicts).toHaveLength(0);
  });

  it('handles empty source schema', () => {
    const { schema } = mergeSchemas({}, schemaB);
    expect(schema).toMatchObject(schemaB);
  });

  it('handles empty target schema', () => {
    const { schema } = mergeSchemas(schemaA, {});
    expect(schema).toMatchObject(schemaA);
  });
});
