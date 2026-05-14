import { diffSchemas, SchemaChange } from './schemaDiff';
import { JSONSchema7 } from 'json-schema';

describe('diffSchemas', () => {
  it('returns empty array for identical schemas', () => {
    const schema: JSONSchema7 = { type: 'object', properties: { name: { type: 'string' } } };
    expect(diffSchemas(schema, schema)).toEqual([]);
  });

  it('detects type change', () => {
    const before: JSONSchema7 = { type: 'string' };
    const after: JSONSchema7 = { type: 'number' };
    const changes = diffSchemas(before, after);
    expect(changes).toContainEqual<SchemaChange>({
      path: '#',
      changeType: 'type_changed',
      before: 'string',
      after: 'number',
    });
  });

  it('detects added property', () => {
    const before: JSONSchema7 = { type: 'object', properties: {} };
    const after: JSONSchema7 = { type: 'object', properties: { age: { type: 'integer' } } };
    const changes = diffSchemas(before, after);
    expect(changes).toContainEqual<SchemaChange>({
      path: '#/properties/age',
      changeType: 'property_added',
      before: undefined,
      after: { type: 'integer' },
    });
  });

  it('detects removed property', () => {
    const before: JSONSchema7 = { type: 'object', properties: { legacy: { type: 'string' } } };
    const after: JSONSchema7 = { type: 'object', properties: {} };
    const changes = diffSchemas(before, after);
    expect(changes[0].changeType).toBe('property_removed');
    expect(changes[0].path).toBe('#/properties/legacy');
  });

  it('detects required field added', () => {
    const before: JSONSchema7 = { type: 'object', required: [] };
    const after: JSONSchema7 = { type: 'object', required: ['id'] };
    const changes = diffSchemas(before, after);
    expect(changes).toContainEqual<SchemaChange>({
      path: '#/required/id',
      changeType: 'required_added',
      before: false,
      after: true,
    });
  });

  it('detects required field removed', () => {
    const before: JSONSchema7 = { type: 'object', required: ['id'] };
    const after: JSONSchema7 = { type: 'object', required: [] };
    const changes = diffSchemas(before, after);
    expect(changes).toContainEqual<SchemaChange>({
      path: '#/required/id',
      changeType: 'required_removed',
      before: true,
      after: false,
    });
  });

  it('detects nested property type change', () => {
    const before: JSONSchema7 = { type: 'object', properties: { user: { type: 'object', properties: { id: { type: 'string' } } } } };
    const after: JSONSchema7 = { type: 'object', properties: { user: { type: 'object', properties: { id: { type: 'integer' } } } } };
    const changes = diffSchemas(before, after);
    expect(changes).toContainEqual<SchemaChange>({
      path: '#/properties/user/properties/id',
      changeType: 'type_changed',
      before: 'string',
      after: 'integer',
    });
  });
});
