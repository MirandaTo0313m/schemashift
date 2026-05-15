import { JSONSchema7 } from 'json-schema';

export interface VersionEntry {
  version: string;
  schema: JSONSchema7;
  registeredAt: Date;
  description?: string;
}

export interface VersionRegistry {
  entries: Record<string, VersionEntry>;
}

const registry: VersionRegistry = { entries: {} };

export function registerVersion(
  version: string,
  schema: JSONSchema7,
  description?: string
): VersionEntry {
  if (registry.entries[version]) {
    throw new Error(`Version '${version}' is already registered.`);
  }
  const entry: VersionEntry = {
    version,
    schema,
    registeredAt: new Date(),
    description,
  };
  registry.entries[version] = entry;
  return entry;
}

export function getVersion(version: string): VersionEntry | undefined {
  return registry.entries[version];
}

export function listVersions(): string[] {
  return Object.keys(registry.entries).sort();
}

export function hasVersion(version: string): boolean {
  return version in registry.entries;
}

export function clearRegistry(): void {
  for (const key of Object.keys(registry.entries)) {
    delete registry.entries[key];
  }
}

export function getLatestVersion(): VersionEntry | undefined {
  const versions = listVersions();
  if (versions.length === 0) return undefined;
  return registry.entries[versions[versions.length - 1]];
}
