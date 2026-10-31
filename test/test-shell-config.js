const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');
const Module = require('module');

const testUserDataDir = path.join(os.tmpdir(), 'gemini-vpn-shell-' + Date.now());
if (!fs.existsSync(testUserDataDir)) {
  fs.mkdirSync(testUserDataDir, { recursive: true });
}

let capturedWindowOptions = null;
let hwAccelDisabled = false;
const setAlwaysOnTopCalls = [];

const originalRequire = Module.prototype.require;
Module.prototype.require = function (request) {
  if (request === 'electron') {
    return {
      app: {
        disableHardwareAcceleration: () => {
          hwAccelDisabled = true;
        },
        getPath: () => testUserDataDir,
        quit: () => {},
        whenReady: () => Promise.resolve(),
        on: () => {}
      },
      BrowserWindow: class MockBrowserWindow {
        constructor(options) {
          capturedWindowOptions = options;
        }
        removeMenu() {}
        setMenuBarVisibility() {}
        setAlwaysOnTop(val) {
          setAlwaysOnTopCalls.push(val);
        }
        loadURL() {}
        loadFile() {}
        once() {}
        show() {}
        static getAllWindows() { return []; }
      },
      ipcMain: {
        on: () => {},
        handle: () => {}
      },
      Menu: {
        setApplicationMenu: () => {}
      }
    };
  }
  return originalRequire.apply(this, arguments);
};

try {
  console.log('--- Running Shell Configuration & DWM Glitch Guard Tests ---');

  const main = require('../main.js');

  // Assert DWM Anti-Glitch Guard (D-03)
  if (process.platform === 'win32') {
    assert.strictEqual(
      hwAccelDisabled,
      true,
      'app.disableHardwareAcceleration() must be called on win32 before app.whenReady'
    );
    console.log('✓ Test 1: Hardware acceleration disabled for win32 platform');
  } else {
    console.log('ℹ Test 1: Skipped win32 hardware acceleration assertion on non-win32 platform');
  }

  // Invoke createWindow to capture constructor arguments
  assert.strictEqual(
    typeof main.createWindow,
    'function',
    'main.js must export createWindow() for automated shell verification'
  );
  main.createWindow();

  assert(capturedWindowOptions, 'BrowserWindow constructor must be invoked with options');

  // Assert D-01 BrowserWindow constructor flags
  assert.strictEqual(capturedWindowOptions.frame, false, 'frame must be false');
  assert.strictEqual(capturedWindowOptions.thickFrame, false, 'thickFrame must be false');
  assert.strictEqual(capturedWindowOptions.transparent, true, 'transparent must be true');
  assert.strictEqual(capturedWindowOptions.hasShadow, false, 'hasShadow must be false');
  assert.strictEqual(
    capturedWindowOptions.backgroundColor,
    '#00000000',
    "backgroundColor must be '#00000000'"
  );
  assert.strictEqual(capturedWindowOptions.resizable, false, 'resizable must be false');
  assert.strictEqual(capturedWindowOptions.maximizable, false, 'maximizable must be false');

  // Assert T-01-01 Security webPreferences
  assert(capturedWindowOptions.webPreferences, 'webPreferences must be defined');
  assert.strictEqual(
    capturedWindowOptions.webPreferences.contextIsolation,
    true,
    'contextIsolation must be true'
  );
  assert.strictEqual(
    capturedWindowOptions.webPreferences.nodeIntegration,
    false,
    'nodeIntegration must be false'
  );
  console.log('✓ Test 2: BrowserWindow options strictly adhere to D-01 and security constraints');

  // Assert styles.css Drag & Control Regions
  const cssPath = path.join(__dirname, '../styles.css');
  assert(fs.existsSync(cssPath), 'styles.css must exist');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  assert(
    /\.upper-drag-handle[\s\S]*?-webkit-app-region:\s*drag/.test(cssContent),
    '.upper-drag-handle must declare -webkit-app-region: drag'
  );
  assert(
    /\.card-header[\s\S]*?-webkit-app-region:\s*drag/.test(cssContent),
    '.card-header must declare -webkit-app-region: drag'
  );
  assert(
    /\.card-header[\s\S]*?width:\s*100%/.test(cssContent),
    '.card-header must declare width: 100%'
  );
  assert(
    /\.card-header[\s\S]*?cursor:\s*grab/.test(cssContent),
    '.card-header must declare cursor: grab'
  );
  assert(
    /\.header-drag-zone[\s\S]*?-webkit-app-region:\s*drag/.test(cssContent),
    '.header-drag-zone must declare -webkit-app-region: drag'
  );
  assert(
    /\.card-title[\s\S]*?pointer-events:\s*none/.test(cssContent),
    '.card-title must declare pointer-events: none'
  );
  assert(
    /\.window-controls[\s\S]*?-webkit-app-region:\s*no-drag\s*!important/.test(cssContent),
    '.window-controls must declare -webkit-app-region: no-drag !important'
  );

  assert(
    /\.win-btn[\s\S]*?-webkit-app-region:\s*no-drag\s*!important/.test(cssContent),
    '.win-btn must declare -webkit-app-region: no-drag !important'
  );

  assert(
    /\.win-btn\s*svg[\s\S]*?pointer-events:\s*none/.test(cssContent),
    '.win-btn svg must declare pointer-events: none'
  );

  console.log('✓ Test 3: styles.css contains valid draggable and non-draggable region declarations');

  console.log('ALL SHELL CONFIGURATION TESTS PASSED');
} finally {
  try {
    fs.rmSync(testUserDataDir, { recursive: true, force: true });
  } catch (e) {}
}
