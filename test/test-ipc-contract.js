const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');
const Module = require('module');

const testUserDataDir = path.join(os.tmpdir(), 'gemini-vpn-ipc-' + Date.now());
if (!fs.existsSync(testUserDataDir)) {
  fs.mkdirSync(testUserDataDir, { recursive: true });
}

// Registry for IPC handlers to test invocation
const ipcHandlers = new Map();
const ipcListeners = new Map();

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
        on: (channel, handler) => {
          ipcListeners.set(channel, handler);
        },
        handle: (channel, handler) => {
          ipcHandlers.set(channel, handler);
        }
      },
      Menu: {
        setApplicationMenu: () => {}
      }
    };
  }
  return originalRequire.apply(this, arguments);
};

const main = require('../main.js');

try {
  console.log('--- Running IPC Bridge Contract Tests ---');

  // Test 1: Handlers and listeners registered
  assert(ipcHandlers.has('settings:get'), 'settings:get handler must be registered');
  assert(ipcHandlers.has('settings:save'), 'settings:save handler must be registered');
  assert(ipcHandlers.has('window:toggle-pin'), 'window:toggle-pin handler must be registered');
  assert(ipcListeners.has('window:close'), 'window:close listener must be registered');
  assert(ipcListeners.has('window:minimize'), 'window:minimize listener must be registered');
  console.log('✓ Test 1: All required IPC channels registered with ipcMain');

  // Test 2: Invoke settings:get
  const getHandler = ipcHandlers.get('settings:get');
  const current = getHandler();
  assert(current && typeof current === 'object', 'settings:get must return an object');
  assert(typeof current.pingTarget === 'string');
  assert(typeof current.pingIntervalMs === 'number');
  assert(typeof current.pingTimeoutMs === 'number');
  console.log(`✓ Test 2: settings:get returned valid schema: target=${current.pingTarget}`);

  // Test 3: Invoke settings:save with valid new values
  const saveHandler = ipcHandlers.get('settings:save');
  const saveRes = saveHandler({}, { pingTarget: '9.9.9.9', pingIntervalMs: 2000, pingTimeoutMs: 1500 });
  assert.strictEqual(saveRes.success, true);
  assert.strictEqual(saveRes.settings.pingTarget, '9.9.9.9');
  assert.strictEqual(saveRes.settings.pingIntervalMs, 2000);
  assert.strictEqual(saveRes.settings.pingTimeoutMs, 1500);

  // Re-read with settings:get
  const updated = getHandler();
  assert.strictEqual(updated.pingTarget, '9.9.9.9');
  console.log('✓ Test 3: settings:save updated configuration in memory and roundtrips via settings:get');

  // Test 4: Rejection of shell injection via settings:save
  const rejectRes = saveHandler({}, { pingTarget: '9.9.9.9; ls -la' });
  assert.strictEqual(rejectRes.success, false);
  assert.strictEqual(getHandler().pingTarget, '9.9.9.9', 'Target must remain unchanged on rejection');
  console.log('✓ Test 4: Shell injection strictly rejected through IPC channel');

  console.log('ALL IPC CONTRACT TESTS PASSED');
} finally {
  try {
    fs.rmSync(testUserDataDir, { recursive: true, force: true });
  } catch (e) {}
}
