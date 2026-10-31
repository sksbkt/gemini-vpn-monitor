# Phase 01: Window Shell Refactor - Pattern Map

**Mapped:** 2026-10-31  
**Files analyzed:** 7  
**Analogs found:** 7 / 7  

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `main.js` | controller | request-response / event-driven | `main.js` | exact |
| `preload.js` | middleware | request-response | `preload.js` | exact |
| `src/components/Header.tsx` | component | event-driven | `src/components/Header.tsx` | exact |
| `styles.css` | config | transform | `styles.css` | exact |
| `src/App.tsx` | component | request-response / event-driven | `src/App.tsx` | exact |
| `test/test-shell-config.js` | test | batch / transform | `test/test-ipc-contract.js` | exact |
| `test/test-ipc-contract.js` | test | request-response / batch | `test/test-ipc-contract.js` | exact |

---

## Pattern Assignments

### `main.js` (controller, request-response / event-driven)

**Analog:** `main.js` [VERIFIED: git-tracked `main.js`]

**Imports & Top-Level Setup** (lines 1-9):
```javascript
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execFile } = require('child_process');

if (Menu && typeof Menu.setApplicationMenu === 'function') {
  Menu.setApplicationMenu(null);
}
```

**Hardware Acceleration Disablement (Windows DWM Anti-Glitch Pattern)** (to place before `app.whenReady()`):
```javascript
// Disable hardware acceleration to eliminate Windows DWM transparency black-box artifacts
if (process.platform === 'win32') {
  app.disableHardwareAcceleration();
}
```

**Core BrowserWindow Instantiation Pattern** (lines 62-84):
```javascript
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
  mainWindow.setMenuBarVisibility(false);

  // Sync initial pin state on launch from loaded settings
  if (isPinned) {
    mainWindow.setAlwaysOnTop(true);
  }
...
```

**Window Control IPC Handlers** (lines 144-160):
```javascript
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
```

---

### `preload.js` (middleware, request-response)

**Analog:** `preload.js` [VERIFIED: git-tracked `preload.js`]

**Context Bridge Exposure Pattern** (lines 1-16):
```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  close: () => ipcRenderer.send('window:close'),
  minimize: () => ipcRenderer.send('window:minimize'),
  togglePin: () => ipcRenderer.invoke('window:toggle-pin'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  onUpdate: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('status-update', subscription);
    return () => {
      ipcRenderer.removeListener('status-update', subscription);
    };
  }
});
```

---

### `src/components/Header.tsx` (component, event-driven)

**Analog:** `src/components/Header.tsx` [VERIFIED: git-tracked `src/components/Header.tsx`]

**Component Contract & Props Interface** (lines 3-9):
```typescript
export interface HeaderProps {
  isPinned: boolean;
  onTogglePin: () => void;
  onOpenSettings: () => void;
  onMinimize: () => void;
  onClose: () => void;
}
```

**Upper Drag Handle & Header JSX Pattern** (lines 18-32):
```tsx
  return (
    <>
      {/* Upper Drag Handle */}
      <div className="upper-drag-handle" title="Drag to move widget" />

      {/* Header with Title & Window Controls */}
      <header className="card-header">
        <h1 className="card-title">Gemini VPN Monitor</h1>
        <div className="window-controls">
          <button
            id="settingsBtn"
            className="win-btn"
            title="Configure Target & Cadence"
            onClick={onOpenSettings}
          >
...
```

**Interactive Controls & Button Isolation Pattern** (lines 38-60):
```tsx
          <button
            id="pinBtn"
            className={`win-btn ${isPinned ? 'pinned' : ''}`}
            title="Pin Always on Top"
            onClick={onTogglePin}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="17" x2="12" y2="22" />
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
            </svg>
          </button>
          <button id="minBtn" className="win-btn" title="Minimize" onClick={onMinimize}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button id="closeBtn" className="win-btn close-btn" title="Close" onClick={onClose}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </header>
    </>
  );
```

---

### `styles.css` (config, transform)

**Analog:** `styles.css` [VERIFIED: git-tracked `styles.css`]

**Transparent Canvas Shell Reset** (lines 9-15):
```css
html,
body,
#root {
  background: transparent !important;
  background-color: transparent !important;
}
```

**Draggable Region Definitions** (lines 62-89):
```css
/* Upper Drag Handle */
.upper-drag-handle {
  width: 44px;
  height: 4.5px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.22);
  margin: -4px auto 10px auto;
  -webkit-app-region: drag;
  cursor: grab;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.upper-drag-handle:hover {
  background: rgba(0, 242, 254, 0.7);
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.6);
  width: 52px;
}

/* Header Row */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  -webkit-app-region: drag;
  margin-bottom: 10px;
  cursor: grab;
}
```

**Control Isolation & SVG Pointer Pass-Through Pattern** (lines 98-128):
```css
.window-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  -webkit-app-region: no-drag !important;
}

.win-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px;
  -webkit-app-region: no-drag !important;
  transition: color 0.15s ease, transform 0.15s ease;
}

.win-btn svg {
  pointer-events: none;
}

.win-btn:hover {
  color: #ffffff;
  transform: scale(1.08);
}

.win-btn:active {
  transform: scale(0.95);
}

.win-btn.pinned {
  color: #00ff9d;
}

.close-btn:hover {
  color: #f87171;
}
```

---

### `src/App.tsx` (component, request-response / event-driven)

**Analog:** `src/App.tsx` [VERIFIED: git-tracked `src/App.tsx`]

**Initial Pin State Synchronization on Mount** (lines 10-25):
```typescript
  const [isPinned, setIsPinned] = useState<boolean>(false);

  useEffect(() => {
    // Initial fetch of persisted settings for pin state sync
    if (window.api?.getSettings) {
      window.api.getSettings().then((settings) => {
        if (settings && typeof settings.isPinned === 'boolean') {
          setIsPinned(settings.isPinned);
        }
      });
    }
  }, []);
```

**Window Action Handlers** (lines 46-59):
```typescript
  const handleClose = () => {
    if (window.api?.close) window.api.close();
  };

  const handleMinimize = () => {
    if (window.api?.minimize) window.api.minimize();
  };

  const handleTogglePin = async () => {
    if (window.api?.togglePin) {
      const pinned = await window.api.togglePin();
      setIsPinned(pinned);
    }
  };
```

---

### `test/test-ipc-contract.js` (test, request-response / batch)

**Analog:** `test/test-ipc-contract.js` [VERIFIED: git-tracked `test/test-ipc-contract.js`]

**Electron Mocking Harness Pattern** (lines 12-44):
```javascript
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
```

**Contract Assertion Pattern (Extending for Close and Minimize)** (lines 51-56):
```javascript
  // Assert window control channels are registered
  assert(ipcListeners.has('window:close'), 'window:close listener must be registered');
  assert(ipcListeners.has('window:minimize'), 'window:minimize listener must be registered');
  assert(ipcHandlers.has('window:toggle-pin'), 'window:toggle-pin handler must be registered');
```

---

### `test/test-shell-config.js` (test, batch / transform)

**Analog:** `test/test-ipc-contract.js` [VERIFIED: git-tracked `test/test-ipc-contract.js`]

**Mocking Pattern Capturing BrowserWindow Options**:
```javascript
let capturedWindowOptions = null;
let hwAccelDisabled = false;

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
        setAlwaysOnTop() {}
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
```

**Static CSS Rule Validation Pattern**:
```javascript
const cssContent = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');

// Assert draggable region definitions
assert(
  /\.upper-drag-handle[\s\S]*?-webkit-app-region:\s*drag/.test(cssContent),
  '.upper-drag-handle must declare -webkit-app-region: drag'
);
assert(
  /\.card-header[\s\S]*?-webkit-app-region:\s*drag/.test(cssContent),
  '.card-header must declare -webkit-app-region: drag'
);

// Assert control isolation
assert(
  /\.window-controls[\s\S]*?-webkit-app-region:\s*no-drag/.test(cssContent),
  '.window-controls must declare -webkit-app-region: no-drag'
);
assert(
  /\.win-btn\s*svg[\s\S]*?pointer-events:\s*none/.test(cssContent),
  '.win-btn svg must declare pointer-events: none'
);
```

---

## Shared Patterns

### 1. IPC Context Bridge Boundary Pattern
**Source:** `preload.js` (lines 1-16) and `main.js` (lines 144-160)  
**Apply to:** All renderer-to-main communications (`window:close`, `window:minimize`, `window:toggle-pin`).  
**Rules:**
- Renderer never accesses `ipcRenderer` or Node built-ins directly.
- `contextIsolation: true` and `nodeIntegration: false` enforced in `webPreferences`.
- Preload exposes explicit methods with narrow payloads on `window.api`.
- Fire-and-forget actions use `ipcRenderer.send('window:...')` and `ipcMain.on('window:...')`.
- Value-returning queries or toggles use `ipcRenderer.invoke(...)` and `ipcMain.handle(...)`.

### 2. Windows DWM Frameless Alpha Transparency Safety Pattern
**Source:** `main.js` (lines 63-80) and `styles.css` (lines 9-15)  
**Apply to:** `main.js`, `styles.css`  
**Rules:**
- On Windows (`process.platform === 'win32'`), call `app.disableHardwareAcceleration()` before `app.whenReady()` to avoid DWM black rectangular compositing bugs.
- Constructor must include `frame: false`, `thickFrame: false`, `transparent: true`, `hasShadow: false`, `backgroundColor: '#00000000'`, `resizable: false`, and `maximizable: false`.
- DOM roots (`html`, `body`, `#root`) must specify `background: transparent !important`.
- Drop shadows must be rendered purely via CSS (`box-shadow` on `.widget-card`), never using native OS window shadows.

### 3. Drag Region & Nested Interactive Isolation Pattern
**Source:** `styles.css` (lines 62-128) and `src/components/Header.tsx` (lines 20-62)  
**Apply to:** Header bar, modal overlays, interactive controls.  
**Rules:**
- Repositioning handle containers have `-webkit-app-region: drag` and `cursor: grab`.
- Interactive child containers (`.window-controls`) and buttons (`.win-btn`) have `-webkit-app-region: no-drag !important` and `cursor: pointer`.
- Button child SVGs must enforce `pointer-events: none` to prevent subpixel coordinate clicks from falling through to the underlying drag region.

### 4. Electron Main Process In-Memory Test Mocking Pattern
**Source:** `test/test-ipc-contract.js` (lines 12-46)  
**Apply to:** `test/test-ipc-contract.js`, `test/test-shell-config.js`  
**Rules:**
- Override `Module.prototype.require` to intercept the `'electron'` module request before importing `main.js`.
- Provide mock implementations for `app`, `BrowserWindow`, `ipcMain`, and `Menu`.
- Capture constructor options, listener registrations, and method invocations into Maps or variables for deterministic assertions.
- Use isolated temporary directories for `userData` and clean them up in a `finally` block.

---

## No Analog Found

None. All files have high-quality, git-tracked analogs in the current repository.

---

## Metadata

**Analog search scope:** `E:/Electron/gemini-vpn-monitor` (root, `src/`, `test/`)  
**Files scanned:** 6 primary files + 4 test files  
**Git verification:** All analog paths confirmed via `git ls-files`  
**Pattern extraction date:** 2026-10-31  

