/**
 * Verification script for Daily Evaluation Report setup
 * Run this after npm install to verify all dependencies are installed
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying Daily Evaluation Report setup...\n');

// Check required directories
const requiredDirs = [
  'server/reports',
  'tests/unit',
  'tests/property',
  '../.kiro/reports',
  '../.kiro/specs/daily-evaluation-report'
];

console.log('📁 Checking directories...');
let dirChecksPassed = 0;
requiredDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${dir}`);
    dirChecksPassed++;
  } else {
    console.log(`  ❌ ${dir} - MISSING`);
  }
});

// Check required files
const requiredFiles = [
  'server/reports/types.js',
  'server/reports/README.md',
  'tests/setup.js',
  'jest.config.js',
  '../.kiro/specs/daily-evaluation-report/config.json',
  'REPORT_SETUP.md'
];

console.log('\n📄 Checking files...');
let fileChecksPassed = 0;
requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${file}`);
    fileChecksPassed++;
  } else {
    console.log(`  ❌ ${file} - MISSING`);
  }
});

// Check npm packages
const requiredPackages = [
  'puppeteer',
  'csv-writer',
  'nodemailer',
  'node-cron',
  'jest',
  'fast-check'
];

console.log('\n📦 Checking npm packages...');
let packageChecksPassed = 0;
requiredPackages.forEach(pkg => {
  try {
    const pkgPath = path.join(__dirname, 'node_modules', pkg);
    if (fs.existsSync(pkgPath)) {
      console.log(`  ✅ ${pkg}`);
      packageChecksPassed++;
    } else {
      console.log(`  ❌ ${pkg} - NOT INSTALLED`);
    }
  } catch (error) {
    console.log(`  ❌ ${pkg} - ERROR: ${error.message}`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Setup Verification Summary:');
console.log(`  Directories: ${dirChecksPassed}/${requiredDirs.length}`);
console.log(`  Files: ${fileChecksPassed}/${requiredFiles.length}`);
console.log(`  Packages: ${packageChecksPassed}/${requiredPackages.length}`);

const allPassed = 
  dirChecksPassed === requiredDirs.length &&
  fileChecksPassed === requiredFiles.length &&
  packageChecksPassed === requiredPackages.length;

if (allPassed) {
  console.log('\n✅ All checks passed! Setup is complete.');
  console.log('\n📝 Next steps:');
  console.log('  1. Review REPORT_SETUP.md for details');
  console.log('  2. Run "npm test" to verify test configuration');
  console.log('  3. Proceed with Task 2: Implement report storage service');
} else {
  console.log('\n⚠️  Some checks failed. Please review the output above.');
  if (packageChecksPassed < requiredPackages.length) {
    console.log('\n💡 To install missing packages, run: npm install');
  }
}

console.log('='.repeat(50));
