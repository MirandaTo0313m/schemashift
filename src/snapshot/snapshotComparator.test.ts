import { captureSnapshot, clearSnapshots } from './schemaSnapshot';
import { compareSnapshots, formatComparison } from './snapshotComparator';
import { JSONSchema7 } from 'json-schema';

beforeEach(() => {
  clearSnapshots();
});

const schemaV1: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
  },
  required: ['id'],
};

const schemaV2: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
  },
  required: ['id', 'email'],
};

describe('compareSnapshots', () => {
  it('detects no changes between identical schemas', () => {
    const s1 = captureSnapshot('v1', schemaV1);
    const s2 = captureSnapshot('v2', schemaV1);
    const result = compareSnapshots(s1, s2);
    expect(result.hasChanges).toBe(false);
    expect(result.breakingChanges).toBe(0);
    expect(result.nonBreakingChanges).toBe(0);
  });

  it('detects changes between different schemas', () => {
    const s1 = captureSnapshot('v1', schemaV1);
    const s2 = captureSnapshot('v2', schemaV2);
    const result = compareSnapshots(s1, s2);
    expect(result.hasChanges).toBe(true);
    expect(result.from).toBe('v1');
    expect(result.to).toBe('v2');
  });

  it('counts breaking changes separately', () => {
    const s1 = captureSnapshot('v1', schemaV1);
    const s2 = captureSnapshot('v2', schemaV2);
    const result = compareSnapshots(s1, s2);
    expect(result.breakingChanges + result.nonBreakingChanges).toBe(
      result.diff.changes.length
    );
  });
});

describe('formatComparison', () => {
  it('returns a no-change message when schemas are identical', () => {
    const s1 = captureSnapshot('v1', schemaV1);
    const s2 = captureSnapshot('v2', schemaV1);
    const comparison = compareSnapshots(s1, s2);
    const output = formatComparison(comparison);
    expect(output).toContain('No changes detected');
  });

  it('includes version header in output', () => {
    const s1 = captureSnapshot('v1', schemaV1);
    const s2 = captureSnapshot('v2', schemaV2);
    const comparison = compareSnapshots(s1, s2);
    const output = formatComparison(comparison);
    expect(output).toContain('v1 → v2');
  });
});
