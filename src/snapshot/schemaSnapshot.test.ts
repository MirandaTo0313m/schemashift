import {
  captureSnapshot,
  getSnapshot,
  listSnapshots,
  deleteSnapshot,
  clearSnapshots,
  snapshotToJson,
  snapshotFromJson,
} from './schemaSnapshot';
import { JSONSchema7 } from 'json-schema';

const schema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
  },
  required: ['id'],
};

beforeEach(() => {
  clearSnapshots();
});

describe('captureSnapshot', () => {
  it('stores a snapshot and returns it', () => {
    const snap = captureSnapshot('v1', schema, 'initial');
    expect(snap.version).toBe('v1');
    expect(snap.label).toBe('initial');
    expect(snap.schema).toEqual(schema);
    expect(snap.capturedAt).toBeDefined();
  });

  it('deep-clones the schema', () => {
    const snap = captureSnapshot('v1', schema);
    (schema as any).properties!.extra = { type: 'number' };
    expect(snap.schema.properties).not.toHaveProperty('extra');
  });
});

describe('getSnapshot', () => {
  it('returns undefined for unknown version', () => {
    expect(getSnapshot('v99')).toBeUndefined();
  });

  it('returns the stored snapshot', () => {
    captureSnapshot('v2', schema);
    expect(getSnapshot('v2')?.version).toBe('v2');
  });
});

describe('listSnapshots', () => {
  it('returns all snapshots sorted by capturedAt', () => {
    captureSnapshot('v1', schema);
    captureSnapshot('v2', schema);
    const list = listSnapshots();
    expect(list).toHaveLength(2);
  });
});

describe('deleteSnapshot', () => {
  it('removes a snapshot', () => {
    captureSnapshot('v1', schema);
    expect(deleteSnapshot('v1')).toBe(true);
    expect(getSnapshot('v1')).toBeUndefined();
  });

  it('returns false when snapshot does not exist', () => {
    expect(deleteSnapshot('vX')).toBe(false);
  });
});

describe('snapshotToJson / snapshotFromJson', () => {
  it('round-trips a snapshot', () => {
    const snap = captureSnapshot('v1', schema, 'test');
    const json = snapshotToJson(snap);
    const restored = snapshotFromJson(json);
    expect(restored).toEqual(snap);
  });

  it('throws on invalid JSON snapshot', () => {
    expect(() => snapshotFromJson('{"foo":1}')).toThrow();
  });
});
