export {
  registerVersion,
  getVersion,
  listVersions,
  hasVersion,
  clearRegistry,
  getLatestVersion,
} from './versionRegistry';
export type { VersionEntry, VersionRegistry } from './versionRegistry';

export {
  compareVersions,
  compareAdjacentVersions,
} from './versionComparator';
export type { VersionComparison } from './versionComparator';
