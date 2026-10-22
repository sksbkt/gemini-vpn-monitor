const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execFile } = require('child_process');

const DEFAULT_SETTINGS = {
  pingTarget: '4.2.2.4',
  pingIntervalMs: 1000,
  pingTimeoutMs: 800,
  isPinned: false
};

function getConfigPath() {
  return path.join(app.getPath('userData'), 'gemini-vpn-config.json');
}

function sanitizeTarget(target) {
  if (typeof target !== 'string') return null;
  const trimmed = target.trim();
  if (!trimmed || trimmed.length > 255) return null;
  if (/^[a-zA-Z0-9.-]+$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

function loadSettings() {
  try {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf8');
      const parsed = JSON.parse(raw);
      const pingTarget = sanitizeTarget(parsed.pingTarget) || DEFAULT_SETTINGS.pingTarget;
      const pingIntervalMs = (typeof parsed.pingIntervalMs === 'number')
        ? Math.max(500, Math.min(5000, Math.round(parsed.pingIntervalMs)))
        : DEFAULT_SETTINGS.pingIntervalMs;
      const pingTimeoutMs = (typeof parsed.pingTimeoutMs === 'number')
        ? Math.max(300, Math.min(3000, Math.round(parsed.pingTimeoutMs)))
        : DEFAULT_SETTINGS.pingTimeoutMs;
      const isPinned = Boolean(parsed.isPinned);
      return { pingTarget, pingIntervalMs, pingTimeoutMs, isPinned };
    }
  } catch (err) {
    console.error('Failed to load settings from disk, using defaults:', err);
  }
  return { ...DEFAULT_SETTINGS };
}

let currentSettings = loadSettings();
let mainWindow;
const MAX_HISTORY = 18;

let history = [];
let cycleCount = 0;
let isPinned = currentSettings.isPinned;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 360,
    height: 345,
    show: false,
    frame: false,
    thickFrame: false,
    transparent: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    title: '',
    resizable: false,
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.removeMenu();

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

function saveSettings(newSettings) {
  try {
    const sanitized = { ...currentSettings };
    let targetChanged = false;

    if (newSettings && typeof newSettings.pingTarget === 'string') {
      const valid = sanitizeTarget(newSettings.pingTarget);
      if (!valid) {
        return { success: false, error: 'Invalid host or IP address format', settings: currentSettings };
      }
      if (valid !== currentSettings.pingTarget) {
        sanitized.pingTarget = valid;
        targetChanged = true;
      }
    }

    if (newSettings && typeof newSettings.pingIntervalMs === 'number') {
      sanitized.pingIntervalMs = Math.max(500, Math.min(5000, Math.round(newSettings.pingIntervalMs)));
    }

    if (newSettings && typeof newSettings.pingTimeoutMs === 'number') {
      sanitized.pingTimeoutMs = Math.max(300, Math.min(3000, Math.round(newSettings.pingTimeoutMs)));
    }

    if (newSettings && typeof newSettings.isPinned === 'boolean') {
      sanitized.isPinned = newSettings.isPinned;
      isPinned = sanitized.isPinned;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setAlwaysOnTop(isPinned);
      }
    }

    const configPath = getConfigPath();
    fs.writeFileSync(configPath, JSON.stringify(sanitized, null, 2), 'utf8');
    currentSettings = sanitized;

    if (targetChanged) {
      history = [];
    }

    return { success: true, settings: currentSettings };
  } catch (err) {
    console.error('Failed to save settings to disk:', err);
    return { success: false, error: err.message, settings: currentSettings };
  }
}

// IPC Handlers
ipcMain.on('window:close', () => {
  app.quit();
});

ipcMain.on('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window:toggle-pin', () => {
  if (!mainWindow) return false;
  isPinned = !isPinned;
  mainWindow.setAlwaysOnTop(isPinned);
  saveSettings({ isPinned });
  return isPinned;
});

ipcMain.handle('settings:get', () => {
  return currentSettings;
});

ipcMain.handle('settings:save', (_event, newSettings) => {
  return saveSettings(newSettings);
});

// Ping target host/IP
function runPing(target = currentSettings.pingTarget, timeoutMs = currentSettings.pingTimeoutMs) {
  return new Promise((resolve) => {
    const validTarget = sanitizeTarget(target) || DEFAULT_SETTINGS.pingTarget;
    const safeTimeout = Math.max(300, Math.min(3000, Number(timeoutMs) || 800));
    execFile('ping', [validTarget, '-n', '1', '-w', String(safeTimeout)], { windowsHide: true }, (err, stdout) => {
      if (err || !stdout) return resolve(null);
      const match = stdout.match(/time[=<](\d+)ms/i);
      if (match) return resolve(parseInt(match[1], 10));
      if (/time<1\s*ms/i.test(stdout)) return resolve(1);
      return resolve(null);
    });
  });
}

// Check Gemini Geo-restriction
function checkGemini() {
  return new Promise((resolve) => {
    const req = https.get(
      'https://generativelanguage.googleapis.com/v1beta/models?key=vpn_check_ping',
      { timeout: 3500 },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          if (body.includes('User location is not supported') || body.includes('API usage not available in your region')) {
            resolve('RESTRICTED');
          } else if (body.includes('API_KEY_INVALID') || body.includes('API key not valid') || res.statusCode === 200) {
            resolve('UNRESTRICTED');
          } else {
            resolve('RESTRICTED');
          }
        });
      }
    );

    req.on('error', () => resolve('OFFLINE'));
    req.on('timeout', () => { req.destroy(); resolve('OFFLINE'); });
  });
}

let currentGeminiStatus = 'UNRESTRICTED';

// Background Loop for Periodic Gemini Geo-restriction check (every 6 seconds)
async function startGeminiCheckLoop() {
  while (true) {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        currentGeminiStatus = await checkGemini();
      } catch (e) {
        currentGeminiStatus = 'OFFLINE';
      }
    }
    await new Promise((r) => setTimeout(r, 6000));
  }
}

// Dedicated Dynamic Ping Loop (Exact cadence tuned by user settings)
async function startMonitoring() {
  // Initial check
  try {
    currentGeminiStatus = await checkGemini();
  } catch (e) {
    currentGeminiStatus = 'OFFLINE';
  }
  startGeminiCheckLoop();

  while (true) {
    const startTime = Date.now();

    if (mainWindow && !mainWindow.isDestroyed()) {
      cycleCount++;
      const pingVal = await runPing(currentSettings.pingTarget, currentSettings.pingTimeoutMs);

      history.push(pingVal);
      if (history.length > MAX_HISTORY) history.shift();

      const recent10 = history.slice(-10);
      const validRecent = recent10.filter((p) => p !== null);
      const avgPing = validRecent.length > 0 ? Math.round(validRecent.reduce((a, b) => a + b, 0) / validRecent.length) : null;
      const timeouts = recent10.filter((p) => p === null).length;
      const lossPct = recent10.length > 0 ? Math.round((timeouts * 100) / recent10.length) : 0;

      mainWindow.webContents.send('status-update', {
        ping: pingVal,
        avgPing,
        lossPct,
        history,
        status: currentGeminiStatus,
        server: currentSettings.pingTarget,
        timestamp: Date.now()
      });
    }

    // Windows "ping -t" waits dynamic interval minus elapsed ping time
    const interval = currentSettings.pingIntervalMs || 1000;
    const elapsed = Date.now() - startTime;
    const waitTime = Math.max(50, interval - elapsed);
    await new Promise((r) => setTimeout(r, waitTime));
  }
}

if (require.main === module) {
  app.whenReady().then(() => {
    createWindow();
    startMonitoring();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFAULT_SETTINGS,
    sanitizeTarget,
    loadSettings,
    saveSettings,
    getConfigPath,
    runPing,
    getCurrentSettings: () => currentSettings
  };
}
