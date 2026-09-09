import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, '.next_build');
const outDir = path.join(rootDir, 'out');

// 1. Remove out directory if it exists
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}

// 2. Ensure source directory exists
if (!fs.existsSync(srcDir)) {
  console.error(`Source build directory does not exist: ${srcDir}`);
  process.exit(1);
}

// 3. Recursively copy .next_build to out
fs.cpSync(srcDir, outDir, { recursive: true });
console.log('Successfully copied build output from .next_build to out');
