import {
  registerVersion,
  getVersion,
  listVersions,
  hasVersion,
  clearRegistry,
  getLatestVersion,
} from './versionRegistry';
import { JSONSchema7 } from 'json-schema';

const schemaV1: JSONSchema7 = {
  type: 'object',
  properties: { id: { type: 'string' } },
  required: ['id'],
};

const schemaV2: JSONSchema7 = {
  type: 'object',
  properties: { id: { type: 'string' }, name: { type: 'string' } },
  required: ['id', 'name'],
};

beforeEach(() => clearRegistry());

describe('registerVersion', () => {
  it('registers a new version successfully', () => {
    const entry = registerVersion('1.0.0', schemaV1, 'Initial version');
    expect(entry.version).toBe('1.0.0');
    expect(entry.schema).toEqual(schemaV1);
    expect(entry.description).toBe('Initial version');
  });

  it('throws if version already registered', () => {
    registerVersion('1.0.0', schemaV1);
    expect(() => registerVersion('1.0.0', schemaV2)).toThrow(
      "Version '1.0.0' is already registered."
    );
  });
});

describe('getVersion', () => {
  it('returns registered version', () => {
    registerVersion('1.0.0', schemaV1);
    expect(getVersion('1.0.0')?.version).toBe('1.0.0');
  });

  it('returns undefined for unknown version', () => {
    expect(getVersion('99.0.0')).toBeUndefined();
  });
});

describe('listVersions', () => {
  it('returns sorted list of versions', () => {
    registerVersion('2.0.0', schemaV2);
    registerVersion('1.0.0', schemaV1);
    expect(listVersions()).toEqual(['1.0.0', '2.0.0']);
  });
});

describe('hasVersion', () => {
  it('returns true for registered version', () => {
    registerVersion('1.0.0', schemaV1);
    expect(hasVersion('1.0.0')).toBe(true);
  });

  it('returns false for unregistered version', () => {
    expect(hasVersion('3.0.0')).toBe(false);
  });
});

describe('getLatestVersion', () => {
  it('returns the latest registered version', () => {
    registerVersion('1.0.0', schemaV1);
    registerVersion('2.0.0', schemaV2);
    expect(getLatestVersion()?.version).toBe('2.0.0');
  });

  it('returns undefined when no versions registered', () => {
    expect(getLatestVersion()).toBeUndefined();
  });
});
