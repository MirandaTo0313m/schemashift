import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { run } from './cli';

const OLD_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' }
  },
  required: ['id', 'name']
};

const NEW_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    email: { type: 'string' }
  },
  required: ['id', 'name', 'email']
};

function writeTempFile(content: object): string {
  const tmpFile = path.join(os.tmpdir(), `schema-${Date.now()}-${Math.random()}.json`);
  fs.writeFileSync(tmpFile, JSON.stringify(content), 'utf-8');
  return tmpFile;
}

describe('CLI', () => {
  let oldFile: string;
  let newFile: string;
  let outputFile: string;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    oldFile = writeTempFile(OLD_SCHEMA);
    newFile = writeTempFile(NEW_SCHEMA);
    outputFile = path.join(os.tmpdir(), `migration-${Date.now()}.md`);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    [oldFile, newFile, outputFile].forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
    consoleSpy.mockRestore();
  });

  it('prints markdown migration to stdout by default', () => {
    run(['node', 'schemashift', '--old', oldFile, '--new', newFile, '--from', 'v1', '--to', 'v2']);
    expect(consoleSpy).toHaveBeenCalled();
    const output = consoleSpy.mock.calls[0][0] as string;
    expect(output).toContain('v1');
    expect(output).toContain('v2');
  });

  it('writes json migration to output file', () => {
    run(['node', 'schemashift', '--old', oldFile, '--new', newFile, '--from', 'v1', '--to', 'v2', '--format', 'json', '--output', outputFile]);
    expect(fs.existsSync(outputFile)).toBe(true);
    const content = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
    expect(content).toHaveProperty('fromVersion', 'v1');
    expect(content).toHaveProperty('toVersion', 'v2');
    expect(Array.isArray(content.steps)).toBe(true);
  });

  it('exits on missing required arguments', () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => run(['node', 'schemashift', '--old', oldFile])).toThrow('exit');
    exitSpy.mockRestore();
    errSpy.mockRestore();
  });
});
