const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const https = require('https');
const { execFile } = require('child_process');

// Disable hardware acceleration to prevent transparent window GPU crash on Windows
app.disableHardwareAcceleration();

let mainWindow;
const PING_TARGET = '4.2.2.4';
const MAX_HISTORY = 18;

let history = [];
let cycleCount = 0;
let isPinned = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 360,
    height: 345,
    show: false,
    frame: false,
    transparent: true,
    hasShadow: true,
    resizable: false,
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

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
  return isPinned;
});

// Ping 4.2.2.4
function runPing() {
  return new Promise((resolve) => {
    execFile('ping', [PING_TARGET, '-n', '1', '-w', '800'], { windowsHide: true }, (err, stdout) => {
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

// Dedicated 1-Second Ping Loop (Exact cadence like "ping 4.2.2.4 -t")
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
      const pingVal = await runPing();

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
        server: PING_TARGET,
        timestamp: Date.now()
      });
    }

    // Windows "ping -t" waits exactly (1000ms - pingTime) before next echo request
    const elapsed = Date.now() - startTime;
    const waitTime = Math.max(100, 1000 - elapsed);
    await new Promise((r) => setTimeout(r, waitTime));
  }
}

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
