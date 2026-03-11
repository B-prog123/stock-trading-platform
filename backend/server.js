import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting backend via tsx wrapper...');

const child = spawn('npx', ['tsx', 'server.ts'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
});

child.on('error', (err) => {
    console.error('❌ Failed to start process:', err);
});

child.on('exit', (code) => {
    if (code !== 0) {
        console.error(`🏁 Backend process exited with code ${code}`);
    }
    process.exit(code || 0);
});
