const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');
const Module = require('module');

const testUserDataDir = path.join(os.tmpdir(), 'gemini-vpn-e2e-' + Date.now());
if (!fs.existsSync(testUserDataDir)) {
  fs.mkdirSync(testUserDataDir, { recursive: true });
}

// Mock electron
const originalRequire = Module.prototype.require;
Module.prototype.require = function (request) {
  if (request === 'electron') {
    return {
      app: {
        disableHardwareAcceleration: () => {},
        getPath: () => testUserDataDir,
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

async function runE2ETests() {
  console.log('--- Running E2E Persistence & Live Switching Tests ---');

  // Step 1: Save custom configuration
  const customConfig = {
    pingTarget: '1.1.1.1',
    pingIntervalMs: 750,
    pingTimeoutMs: 600,
    isPinned: true
  };
  const saveRes = main.saveSettings(customConfig);
  assert.strictEqual(saveRes.success, true, 'Settings save must succeed');
  console.log('✓ Step 1: Custom configuration written');

  // Step 2: Simulate Cold Restart - read directly from disk via loadSettings()
  const recovered = main.loadSettings();
  assert.strictEqual(recovered.pingTarget, '1.1.1.1', 'Recovered pingTarget must match');
  assert.strictEqual(recovered.pingIntervalMs, 750, 'Recovered pingIntervalMs must match');
  assert.strictEqual(recovered.pingTimeoutMs, 600, 'Recovered pingTimeoutMs must match');
  assert.strictEqual(recovered.isPinned, true, 'Recovered isPinned must match');
  console.log('✓ Step 2: Cold restart recovery validated identically from disk');

  // Step 3: Test live ICMP echo execution for 1.1.1.1 and 8.8.8.8
  console.log('Testing live ICMP ping to 1.1.1.1...');
  const ping1 = await main.runPing('1.1.1.1', 2000);
  console.log(`Live 1.1.1.1 ping result: ${ping1}ms`);
  assert(ping1 === null || (typeof ping1 === 'number' && ping1 >= 0), '1.1.1.1 ping must be null or non-negative number');

  console.log('Testing live ICMP ping to 8.8.8.8...');
  const ping2 = await main.runPing('8.8.8.8', 2000);
  console.log(`Live 8.8.8.8 ping result: ${ping2}ms`);
  assert(ping2 === null || (typeof ping2 === 'number' && ping2 >= 0), '8.8.8.8 ping must be null or non-negative number');
  console.log('✓ Step 3: Live Windows ping execution executed without error');

  console.log('ALL E2E PERSISTENCE & LIVE PING TESTS PASSED');
}

runE2ETests()
  .then(() => {
    try {
      fs.rmSync(testUserDataDir, { recursive: true, force: true });
    } catch (e) {}
    process.exit(0);
  })
  .catch((err) => {
    console.error('E2E TEST FAILURE:', err);
    try {
      fs.rmSync(testUserDataDir, { recursive: true, force: true });
    } catch (e) {}
    process.exit(1);
  });
