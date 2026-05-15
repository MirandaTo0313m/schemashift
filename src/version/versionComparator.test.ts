import { compareVersions, compareAdjacentVersions } from './versionComparator';
import { registerVersion, clearRegistry } from './versionRegistry';
import { JSONSchema7 } from 'json-schema';

const schemaV1: JSONSchema7 = {
  type: 'object',
  properties: { id: { type: 'string' } },
  required: ['id'],
};

const schemaV2: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
  },
  required: ['id', 'name'],
};

const schemaV3: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
  },
  required: ['id', 'name', 'email'],
};

beforeEach(() => {
  clearRegistry();
  registerVersion('1.0.0', schemaV1, 'Initial');
  registerVersion('2.0.0', schemaV2, 'Added name');
  registerVersion('3.0.0', schemaV3, 'Added email');
});

describe('compareVersions', () => {
  it('returns a comparison with diff, migration, and report', () => {
    const result = compareVersions('1.0.0', '2.0.0');
    expect(result.fromVersion).toBe('1.0.0');
    expect(result.toVersion).toBe('2.0.0');
    expect(result.diff).toBeDefined();
    expect(result.migration).toBeDefined();
    expect(result.report).toBeDefined();
  });

  it('throws if fromVersion not found', () => {
    expect(() => compareVersions('0.0.1', '2.0.0')).toThrow(
      "Version '0.0.1' not found"
    );
  });

  it('throws if toVersion not found', () => {
    expect(() => compareVersions('1.0.0', '9.9.9')).toThrow(
      "Version '9.9.9' not found"
    );
  });
});

describe('compareAdjacentVersions', () => {
  it('compares each consecutive pair of versions', () => {
    const results = compareAdjacentVersions(['1.0.0', '2.0.0', '3.0.0']);
    expect(results).toHaveLength(2);
    expect(results[0].fromVersion).toBe('1.0.0');
    expect(results[0].toVersion).toBe('2.0.0');
    expect(results[1].fromVersion).toBe('2.0.0');
    expect(results[1].toVersion).toBe('3.0.0');
  });

  it('returns empty array for single version', () => {
    expect(compareAdjacentVersions(['1.0.0'])).toHaveLength(0);
  });
});
