import { buildReport, formatReport, Report } from './reportGenerator';
import { SchemaDiff } from '../diff/schemaDiff';
import { Migration } from '../migrate/migrationGenerator';

const sampleDiff: SchemaDiff[] = [
  { op: 'remove', path: '/properties/age', before: { type: 'integer' }, after: undefined },
  { op: 'add', path: '/properties/email', before: undefined, after: { type: 'string' } },
];

const sampleMigration: Migration = {
  steps: [
    { description: 'Remove field age', path: '/properties/age', type: 'remove', breaking: true },
    { description: 'Add field email', path: '/properties/email', type: 'add', breaking: false },
  ],
};

describe('buildReport', () => {
  it('should build a report with correct metadata', () => {
    const report = buildReport(sampleDiff, sampleMigration, 'v1', 'v2');
    expect(report.fromVersion).toBe('v1');
    expect(report.toVersion).toBe('v2');
    expect(report.totalChanges).toBe(2);
    expect(report.breakingChanges).toBe(1);
    expect(report.nonBreakingChanges).toBe(1);
    expect(report.generatedAt).toBeTruthy();
  });

  it('should include diff and migration in report', () => {
    const report = buildReport(sampleDiff, sampleMigration, 'v1', 'v2');
    expect(report.diff).toEqual(sampleDiff);
    expect(report.migration).toEqual(sampleMigration);
  });
});

describe('formatReport', () => {
  let report: Report;

  beforeEach(() => {
    report = buildReport(sampleDiff, sampleMigration, 'v1', 'v2');
  });

  it('should format as summary', () => {
    const output = formatReport(report, 'summary');
    expect(output).toContain('SchemaShift Report');
    expect(output).toContain('Total          : 2');
    expect(output).toContain('Breaking       : 1');
    expect(output).toContain('Non-breaking   : 1');
  });

  it('should format as json', () => {
    const output = formatReport(report, 'json');
    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty('steps');
  });

  it('should format as markdown', () => {
    const output = formatReport(report, 'markdown');
    expect(output).toContain('#');
  });

  it('should throw on unknown format', () => {
    expect(() => formatReport(report, 'xml' as any)).toThrow('Unknown report format: xml');
  });
});
