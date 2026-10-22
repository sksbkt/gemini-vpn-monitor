const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');
const Module = require('module');

// Isolated temp directory for test configuration
const testUserDataDir = path.join(os.tmpdir(), 'gemini-vpn-test-' + Date.now());
if (!fs.existsSync(testUserDataDir)) {
  fs.mkdirSync(testUserDataDir, { recursive: true });
}

// Mock electron app / ipcMain
const originalRequire = Module.prototype.require;
Module.prototype.require = function (request) {
  if (request === 'electron') {
    return {
      app: {
        disableHardwareAcceleration: () => {},
        getPath: (name) => {
          if (name === 'userData') return testUserDataDir;
          return testUserDataDir;
        },
        quit: () => {},
        whenReady: () => Promise.resolve(),
        on: () => {}
      },
      BrowserWindow: class {
        static getAllWindows() { return []; }
      },
      ipcMain: {
        on: () => {},
        handle: () => {}
      }
    };
  }
  return originalRequire.apply(this, arguments);
};

const main = require('../main.js');

try {
  console.log('--- Running Settings & Poller Unit Tests ---');

  // Test 1: Defaults when no config exists
  const initial = main.loadSettings();
  assert.strictEqual(initial.pingTarget, '4.2.2.4', 'Initial ping target must be 4.2.2.4');
  assert.strictEqual(initial.pingIntervalMs, 1000, 'Initial ping interval must be 1000ms');
  assert.strictEqual(initial.pingTimeoutMs, 800, 'Initial ping timeout must be 800ms');
  assert.strictEqual(initial.isPinned, false, 'Initial isPinned must be false');
  console.log('✓ Test 1: Default settings loaded correctly');

  // Test 2: Valid settings update & file persistence
  const saveRes = main.saveSettings({
    pingTarget: '1.1.1.1',
    pingIntervalMs: 1500,
    pingTimeoutMs: 1200,
    isPinned: true
  });
  assert.strictEqual(saveRes.success, true, 'saveSettings should return success');
  assert.strictEqual(saveRes.settings.pingTarget, '1.1.1.1');
  assert.strictEqual(saveRes.settings.pingIntervalMs, 1500);
  assert.strictEqual(saveRes.settings.pingTimeoutMs, 1200);
  assert.strictEqual(saveRes.settings.isPinned, true);

  const configPath = main.getConfigPath();
  assert.strictEqual(fs.existsSync(configPath), true, 'Config file should exist on disk');
  const written = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  assert.strictEqual(written.pingTarget, '1.1.1.1');
  assert.strictEqual(written.pingIntervalMs, 1500);
  console.log('✓ Test 2: Valid settings saved and persisted to disk');

  // Test 3: Shell injection prevention
  const dangerousInputs = [
    '4.2.2.4; whoami',
    '8.8.8.8 & calc.exe',
    '1.1.1.1 | dir',
    '$(whoami)',
    '`whoami`',
    '4.2.2.4 && ping 8.8.8.8',
    '1.1.1.1\nwhoami',
    '1.1.1.1 8.8.8.8',
    ''
  ];

  for (const malicious of dangerousInputs) {
    const res = main.saveSettings({ pingTarget: malicious });
    assert.strictEqual(res.success, false, `Must reject injection attempt: "${malicious}"`);
    assert.strictEqual(main.getCurrentSettings().pingTarget, '1.1.1.1', 'Target must remain unchanged on rejection');
  }
  console.log('✓ Test 3: Shell injection attempts strictly rejected');

  // Test 4: Boundary clamping for intervals and timeouts
  main.saveSettings({ pingIntervalMs: 100, pingTimeoutMs: 50 });
  const clampedLow = main.getCurrentSettings();
  assert.strictEqual(clampedLow.pingIntervalMs, 500, 'Interval must be clamped to minimum 500ms');
  assert.strictEqual(clampedLow.pingTimeoutMs, 300, 'Timeout must be clamped to minimum 300ms');

  main.saveSettings({ pingIntervalMs: 99999, pingTimeoutMs: 99999 });
  const clampedHigh = main.getCurrentSettings();
  assert.strictEqual(clampedHigh.pingIntervalMs, 5000, 'Interval must be clamped to maximum 5000ms');
  assert.strictEqual(clampedHigh.pingTimeoutMs, 3000, 'Timeout must be clamped to maximum 3000ms');
  console.log('✓ Test 4: Interval and timeout clamped within safe boundaries');

  console.log('ALL TESTS PASSED SUCCESSFULLY (exit code 0)');
} finally {
  // Cleanup
  try {
    fs.rmSync(testUserDataDir, { recursive: true, force: true });
  } catch (e) {}
}
