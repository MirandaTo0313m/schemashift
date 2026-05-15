import { JSONSchema7 } from 'json-schema';

export interface SchemaSnapshot {
  version: string;
  schema: JSONSchema7;
  capturedAt: string;
  label?: string;
}

const snapshotStore: Map<string, SchemaSnapshot> = new Map();

export function captureSnapshot(
  version: string,
  schema: JSONSchema7,
  label?: string
): SchemaSnapshot {
  const snapshot: SchemaSnapshot = {
    version,
    schema: JSON.parse(JSON.stringify(schema)),
    capturedAt: new Date().toISOString(),
    label,
  };
  snapshotStore.set(version, snapshot);
  return snapshot;
}

export function getSnapshot(version: string): SchemaSnapshot | undefined {
  return snapshotStore.get(version);
}

export function listSnapshots(): SchemaSnapshot[] {
  return Array.from(snapshotStore.values()).sort((a, b) =>
    a.capturedAt.localeCompare(b.capturedAt)
  );
}

export function deleteSnapshot(version: string): boolean {
  return snapshotStore.delete(version);
}

export function clearSnapshots(): void {
  snapshotStore.clear();
}

export function snapshotToJson(snapshot: SchemaSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

export function snapshotFromJson(raw: string): SchemaSnapshot {
  const parsed = JSON.parse(raw);
  if (!parsed.version || !parsed.schema || !parsed.capturedAt) {
    throw new Error('Invalid snapshot format: missing required fields');
  }
  return parsed as SchemaSnapshot;
}
