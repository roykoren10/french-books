import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Authentication is inherited from the caller; no credentials enter the source or build.
const run = (command, args, cwd = process.cwd()) => execFileSync(command, args, { cwd, stdio: 'inherit' });
run('npm', ['run', 'build']);
run('npm', ['test']);
const path = mkdtempSync(join(tmpdir(), 'french-books-pages-'));
try {
  cpSync('dist', path, { recursive: true });
  run('git', ['init', '-b', 'gh-pages'], path);
  run('git', ['add', '.'], path);
  run('git', ['commit', '-m', 'Publish Petites histoires'], path);
  run('git', ['remote', 'add', 'origin', 'https://github.com/roykoren10/french-books.git'], path);
  run('git', ['push', '--force', 'origin', 'gh-pages'], path);
} finally {
  rmSync(path, { recursive: true, force: true });
}
