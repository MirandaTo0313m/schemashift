import { applyPatch } from './schemaPatcher';
import { SchemaDiff } from '../diff/schemaDiff';
import { JSONSchema7 } from 'json-schema';

const baseSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'integer' },
  },
  required: ['name'],
};

const makeDiff = (changes: SchemaDiff['changes']): SchemaDiff => ({
  changes,
  breaking: changes.some((c) => c.breaking),
});

describe('applyPatch', () => {
  it('applies an added property change', () => {
    const diff = makeDiff([
      { path: '#/properties/email', type: 'added', value: { type: 'string' }, breaking: false },
    ]);
    const { patched, applied, skipped } = applyPatch(baseSchema, diff);
    expect((patched.properties as Record<string, unknown>).email).toEqual({ type: 'string' });
    expect(applied).toHaveLength(1);
    expect(skipped).toHaveLength(0);
  });

  it('applies a removed property change', () => {
    const diff = makeDiff([
      { path: '#/properties/age', type: 'removed', value: undefined, breaking: true },
    ]);
    const { patched, applied } = applyPatch(baseSchema, diff);
    expect((patched.properties as Record<string, unknown>).age).toBeUndefined();
    expect(applied).toHaveLength(1);
  });

  it('applies a modified property change', () => {
    const diff = makeDiff([
      { path: '#/properties/name', type: 'modified', value: { type: 'string', minLength: 1 }, breaking: false },
    ]);
    const { patched } = applyPatch(baseSchema, diff);
    expect((patched.properties as Record<string, unknown>).name).toEqual({ type: 'string', minLength: 1 });
  });

  it('skips breaking changes when skipBreaking is true', () => {
    const diff = makeDiff([
      { path: '#/properties/age', type: 'removed', value: undefined, breaking: true },
    ]);
    const { patched, applied, skipped } = applyPatch(baseSchema, diff, { skipBreaking: true });
    expect((patched.properties as Record<string, unknown>).age).toEqual({ type: 'integer' });
    expect(applied).toHaveLength(0);
    expect(skipped).toHaveLength(1);
  });

  it('does not mutate the original schema', () => {
    const original = JSON.parse(JSON.stringify(baseSchema));
    const diff = makeDiff([
      { path: '#/properties/email', type: 'added', value: { type: 'string' }, breaking: false },
    ]);
    applyPatch(baseSchema, diff);
    expect(baseSchema).toEqual(original);
  });

  it('returns empty applied and skipped for empty diff', () => {
    const diff = makeDiff([]);
    const { patched, applied, skipped } = applyPatch(baseSchema, diff);
    expect(patched).toEqual(baseSchema);
    expect(applied).toHaveLength(0);
    expect(skipped).toHaveLength(0);
  });
});
