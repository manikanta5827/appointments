#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  // Reset Prisma DB non-interactively
  execSync('npx prisma migrate reset --force', {
    cwd: join(__dirname, '..'),
    stdio: 'inherit',
    env: { ...process.env }
  });

  // Run Jest test suite
  execSync('npx jest --runInBand --detectOpenHandles --verbose', {
    cwd: join(__dirname, '..'),
    stdio: 'inherit',
    env: { ...process.env }
  });
  process.exit(0);
} catch (error) {
  process.exit(typeof error.status === 'number' ? error.status : 1);
}


