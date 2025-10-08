#!/usr/bin/env node

/**
 * Cucumber launcher with tsx support
 *
 * This script sets up the NODE_OPTIONS environment variable to load tsx,
 * preventing the common issue where child processes inherit tsx from parent
 * and try to load it in directories without tsx installed.
 *
 * Usage:
 *   In package.json:
 *   {
 *     "scripts": {
 *       "test": "cucumber-tsx",
 *       "test:dev": "cucumber-tsx --profile dev",
 *       "test:ci": "cucumber-tsx --profile ci"
 *     }
 *   }
 */

const { spawn } = require('child_process');
const path = require('path');

// Set NODE_OPTIONS for tsx support
const env = {
  ...process.env,
  NODE_OPTIONS: '--import tsx'
};

// Find cucumber-js binary
const cucumberBin = path.resolve(
  __dirname,
  '../../../node_modules/.bin/cucumber-js'
);

// Pass through all command line arguments
const args = process.argv.slice(2);

// Spawn cucumber-js with tsx support
const cucumber = spawn(cucumberBin, args, {
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

// Exit with cucumber's exit code
cucumber.on('exit', (code) => {
  process.exit(code || 0);
});

cucumber.on('error', (err) => {
  console.error('Failed to start cucumber:', err);
  process.exit(1);
});
