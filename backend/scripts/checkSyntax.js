const { readdirSync, statSync } = require('fs');
const { join } = require('path');
const { spawnSync } = require('child_process');

const root = join(__dirname, '..');
const ignored = new Set(['node_modules', 'coverage']);
const files = [];
const visit = (directory) => {
  for (const entry of readdirSync(directory)) {
    if (ignored.has(entry)) continue;
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) visit(path);
    else if (path.endsWith('.js')) files.push(path);
  }
};
visit(root);
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(`Checked ${files.length} backend JavaScript files.`);
