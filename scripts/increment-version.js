/**
 * Script to auto-increment the minor version number on each build
 * Run with: node scripts/increment-version.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionFile = path.join(__dirname, '..', 'src', 'version.ts');

// Read current version
const content = fs.readFileSync(versionFile, 'utf8');
const match = content.match(/VERSION = '(\d+)\.(\d+)'/);

if (!match) {
  console.error('Could not parse version from version.ts');
  process.exit(1);
}

const major = parseInt(match[1], 10);
const minor = parseInt(match[2], 10);
const newMinor = minor + 1;
const newVersion = `${major}.${newMinor}`;

// Write new version
const newContent = `// Auto-generated version file - do not edit manually
// This file is updated automatically during the build process
export const VERSION = '${newVersion}';
`;

fs.writeFileSync(versionFile, newContent, 'utf8');

console.log(`Version incremented: ${major}.${minor} -> ${newVersion}`);
