import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const outDir = path.join(rootDir, 'out');
const distDir = path.join(rootDir, 'dist');

// If Next.js exported to out, also mirror to dist for static hosts
if (fs.existsSync(outDir)) {
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.cpSync(outDir, distDir, { recursive: true });
  console.log('Successfully copied build output from out to dist');
} else {
  console.log('Build directory ready');
}

