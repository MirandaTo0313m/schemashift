import { SchemaDiff, DiffChange } from '../diff/schemaDiff';

export type MigrationStep = {
  type: 'add' | 'remove' | 'modify' | 'rename';
  path: string;
  description: string;
  breaking: boolean;
  before?: unknown;
  after?: unknown;
};

export type Migration = {
  fromVersion: string;
  toVersion: string;
  steps: MigrationStep[];
  hasBreakingChanges: boolean;
  generatedAt: string;
};

function changeToStep(change: DiffChange): MigrationStep {
  switch (change.type) {
    case 'added':
      return {
        type: 'add',
        path: change.path,
        description: `Add property '${change.path}'`,
        breaking: false,
        after: change.value,
      };
    case 'removed':
      return {
        type: 'remove',
        path: change.path,
        description: `Remove property '${change.path}'`,
        breaking: true,
        before: change.value,
      };
    case 'modified':
      return {
        type: 'modify',
        path: change.path,
        description: `Modify property '${change.path}' from ${JSON.stringify(change.oldValue)} to ${JSON.stringify(change.newValue)}`,
        breaking: isBreakingModification(change),
        before: change.oldValue,
        after: change.newValue,
      };
    default:
      throw new Error(`Unknown change type: ${(change as DiffChange).type}`);
  }
}

function isBreakingModification(change: DiffChange & { type: 'modified' }): boolean {
  const breakingPatterns = ['type', 'required', 'minimum', 'maximum', 'minLength', 'maxLength', 'enum'];
  return breakingPatterns.some((pattern) => change.path.endsWith(pattern));
}

export function generateMigration(
  diff: SchemaDiff,
  fromVersion: string,
  toVersion: string
): Migration {
  const steps = diff.changes.map(changeToStep);
  return {
    fromVersion,
    toVersion,
    steps,
    hasBreakingChanges: steps.some((s) => s.breaking),
    generatedAt: new Date().toISOString(),
  };
}
