/**
 * Script to interactively manage the version number on each build
 * Run with: node scripts/increment-version.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

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
const currentVersion = `${major}.${minor}`;
const suggestedVersion = `${major}.${minor + 1}`;

function writeVersion(version) {
  const newContent = `// Auto-generated version file - do not edit manually
// This file is updated automatically during the build process
export const VERSION = '${version}';
`;
  fs.writeFileSync(versionFile, newContent, 'utf8');
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log(`║  Current Version:  ${currentVersion.padEnd(20)}║`);
  console.log('╚════════════════════════════════════════╝');
  console.log('');

  const answer = await prompt(
    `[Y] Increment to ${suggestedVersion} / [N] Keep ${currentVersion} / [C] Custom: `
  );

  const choice = answer.toLowerCase();

  if (choice === 'n' || choice === 'no') {
    console.log(`Version unchanged: ${currentVersion}`);
    process.exit(0);
  }

  if (choice === 'c' || choice === 'custom') {
    const customVersion = await prompt('Enter custom version (e.g., 2.0): ');

    // Validate version format
    if (!/^\d+\.\d+$/.test(customVersion)) {
      console.error('Invalid version format. Expected format: X.Y (e.g., 2.0)');
      process.exit(1);
    }

    writeVersion(customVersion);
    console.log(`Version set to: ${customVersion}`);
    process.exit(0);
  }

  // Default: Yes - increment to suggested version
  writeVersion(suggestedVersion);
  console.log(`Version incremented: ${currentVersion} -> ${suggestedVersion}`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
