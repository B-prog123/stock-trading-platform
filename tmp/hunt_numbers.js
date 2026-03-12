const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (!dirPath.includes('node_modules') && !dirPath.includes('.git')) {
        walkDir(dirPath, callback);
      }
    } else {
      callback(path.join(dir, f));
    }
  });
};

const searchDir = '.';
console.log('--- Hunting for suspicious numbers (2900-3000) ---');

walkDir(searchDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.js') || filePath.endsWith('.json')) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        // Look for 2900-3000 or similar patterns
        if (/29[0-9]{2}/.test(line) || /29[0-9]{2}/.test(line.replace(',', ''))) {
          console.log(`Match in ${filePath}:${i + 1}: ${line.trim()}`);
        }
      });
    } catch(e) {}
  }
});
