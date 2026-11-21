import { glob } from 'glob';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const deployDir = resolve(__dirname, 'deploy');

const files = await glob('**/*.js', { cwd: deployDir, absolute: true, nodir: true, ignore: ['**/node_modules/**', '**/dist/**', '**/generated/**'] });

let errors = [];
let checked = 0;

for (const file of files) {
  if (!existsSync(file)) continue;
  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const importMatch = line.match(/^import\s+.*\s+from\s+['"](\..*?)['"]/);
    const exportMatch = line.match(/^export\s+.*\s+from\s+['"](\..*?)['"]/);
    const dynamicImportMatch = line.match(/import\(['"](\..*?)['"]\)/);
    
    const match = importMatch || exportMatch || dynamicImportMatch;
    if (match) {
      const importPath = match[1];
      if (importPath.startsWith('.')) {
        const resolved = resolve(dirname(file), importPath);
        let exists = false;
        for (const ext of ['', '.js', '/index.js']) {
          if (existsSync(resolved + ext)) {
            exists = true;
            break;
          }
        }
        if (!exists) {
          errors.push({ file: file.replace(deployDir + '/', ''), line: i + 1, import: importPath, resolved });
        }
        checked++;
      }
    }
  }
}

console.log('Checked imports:', checked);
if (errors.length > 0) {
  console.log('ERRORS:');
  errors.forEach(e => console.log(' ', e.file, ':', e.line, '->', e.import, '(', e.resolved, ')'));
  process.exit(1);
} else {
  console.log('✓ All', checked, 'relative imports resolve to existing files');
}