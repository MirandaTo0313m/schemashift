import { generateMigration } from './migrationGenerator';
import { SchemaDiff } from '../diff/schemaDiff';

const baseDiff: SchemaDiff = {
  changes: [],
  addedCount: 0,
  removedCount: 0,
  modifiedCount: 0,
};

describe('generateMigration', () => {
  it('returns a migration with correct versions', () => {
    const migration = generateMigration(baseDiff, 'v1', 'v2');
    expect(migration.fromVersion).toBe('v1');
    expect(migration.toVersion).toBe('v2');
  });

  it('marks no breaking changes when diff is empty', () => {
    const migration = generateMigration(baseDiff, 'v1', 'v2');
    expect(migration.hasBreakingChanges).toBe(false);
    expect(migration.steps).toHaveLength(0);
  });

  it('generates an add step for added changes', () => {
    const diff: SchemaDiff = {
      ...baseDiff,
      changes: [{ type: 'added', path: 'properties.email', value: { type: 'string' } }],
      addedCount: 1,
    };
    const migration = generateMigration(diff, 'v1', 'v2');
    expect(migration.steps[0].type).toBe('add');
    expect(migration.steps[0].breaking).toBe(false);
  });

  it('marks remove steps as breaking', () => {
    const diff: SchemaDiff = {
      ...baseDiff,
      changes: [{ type: 'removed', path: 'properties.name', value: { type: 'string' } }],
      removedCount: 1,
    };
    const migration = generateMigration(diff, 'v1', 'v2');
    expect(migration.steps[0].type).toBe('remove');
    expect(migration.steps[0].breaking).toBe(true);
    expect(migration.hasBreakingChanges).toBe(true);
  });

  it('marks type modification as breaking', () => {
    const diff: SchemaDiff = {
      ...baseDiff,
      changes: [{ type: 'modified', path: 'properties.age.type', oldValue: 'string', newValue: 'integer' }],
      modifiedCount: 1,
    };
    const migration = generateMigration(diff, 'v1', 'v2');
    expect(migration.steps[0].breaking).toBe(true);
  });

  it('includes a generatedAt timestamp', () => {
    const migration = generateMigration(baseDiff, 'v1', 'v2');
    expect(new Date(migration.generatedAt).toString()).not.toBe('Invalid Date');
  });
});
