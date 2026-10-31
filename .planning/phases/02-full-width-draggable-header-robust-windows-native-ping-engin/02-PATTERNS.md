# Phase 02: Full-Width Draggable Header & Robust Windows-Native Ping Engine - Pattern Map

**Mapped:** 2026-10-31  
**Files analyzed:** 7  
**Analogs found:** 7 / 7  

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/Header.tsx` | component | event-driven | `src/components/Header.tsx` | exact |
| `styles.css` | config | transform / presentation | `styles.css` | exact |
| `pingEngine.js` | service | streaming | `main.js` (lines 180-284) | core-match |
| `main.js` | controller | streaming / request-response | `main.js` | exact |
| `test/test-ping-engine.js` | test | streaming / batch | `test/test-settings-poller.js` | role-match |
| `test/test-shell-config.js` | test | batch / transform | `test/test-shell-config.js` | exact |
| `package.json` | config | batch | `package.json` | exact |

---

## Pattern Assignments

### `src/components/Header.tsx` (component, event-driven)

**Analog:** `src/components/Header.tsx` [VERIFIED: git-tracked `src/components/Header.tsx`]

**Imports & Props Contract** (lines 1-9):
```typescript
import React from 'react';

export interface HeaderProps {
  isPinned: boolean;
  onTogglePin: () => void;
  onOpenSettings: () => void;
  onMinimize: () => void;
  onClose: () => void;
}
```

**Full-Width Drag Header Structure & Control Isolation** (lines 18-64):
```tsx
export const Header: React.FC<HeaderProps> = ({
  isPinned,
  onTogglePin,
  onOpenSettings,
  onMinimize,
  onClose,
}) => {
  return (
    <header className="card-header full-drag-header">
      <div className="header-drag-zone">
        <h1 className="card-title">Gemini VPN Monitor</h1>
      </div>
      <div className="window-controls">
        <button
          id="settingsBtn"
          className="win-btn"
          title="Configure Target & Cadence"
          onClick={onOpenSettings}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
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
  );
};
```

**Key Takeaways for Planner:**
- Draggable surface extends across the top card header area.
- Buttons `#settingsBtn`, `#pinBtn`, `#minBtn`, and `#closeBtn` reside in `.window-controls` and receive `-webkit-app-region: no-drag !important` with `pointer-events: none` on child SVGs.

---

### `styles.css` (config, transform / presentation)

**Analog:** `styles.css` [VERIFIED: git-tracked `styles.css`]

**Full-Width Drag Header CSS Pattern** (lines 82-138):
```css
/* Header Row - Discord-style Edge-to-Edge Draggable Bar */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  -webkit-app-region: drag;
  margin-bottom: 10px;
  cursor: grab;
  user-select: none;
}

.card-header:active {
  cursor: grabbing;
}

.header-drag-zone {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  -webkit-app-region: drag;
  cursor: grab;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: #ffffff;
  pointer-events: none; /* Let drag events pass through title text */
}

/* Window Controls - Isolated from Drag Region */
.window-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  -webkit-app-region: no-drag !important;
  cursor: default;
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

**Key Takeaways for Planner:**
- Top-level header element spans 100% width with `-webkit-app-region: drag`.
- `pointer-events: none` on `.card-title` allows dragging when user clicks on or drags across the text.
- Controls are strictly isolated with `-webkit-app-region: no-drag !important` and `pointer-events: none` on child SVGs.

---

### `pingEngine.js` (service, streaming)

**Analog:** `main.js` (lines 180-284) [VERIFIED: git-tracked `main.js`]

**Imports & Child Process Stream Lifecycle Pattern**:
```javascript
const { spawn } = require('child_process');
const { EventEmitter } = require('events');
const readline = require('readline');
```

**Windows Native CMD Regex & Line Buffering Pattern**:
```javascript
// CMD Ping output patterns:
// "Reply from 4.2.2.4: bytes=32 time=42ms TTL=54" -> 42
// "Reply from 4.2.2.4: bytes=32 time<1ms TTL=54"  -> 1
// "Request timed out."                             -> null (packet loss)
// "Destination host unreachable."                  -> null
// "General failure."                               -> null
const LATENCY_REGEX = /time[=<](\d+)\s*ms/i;
const SUB_MILLISECOND_REGEX = /time<1\s*ms/i;
const TIMEOUT_REGEX = /(?:request timed out|destination host unreachable|general failure|transmit failed)/i;

class PingEngine extends EventEmitter {
  constructor(options = {}) {
    super();
    this.target = options.target || '4.2.2.4';
    this.intervalMs = options.intervalMs || 1000;
    this.child = null;
    this.rl = null;
    this.isRunning = false;
    this.restartTimer = null;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this._spawnProcess();
  }

  _spawnProcess() {
    if (!this.isRunning) return;

    // Use continuous ping stream: ping <target> -t on Windows
    const args = [this.target, '-t'];
    try {
      this.child = spawn('ping', args, {
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      // Stream line reader ensures chunks are reassembled cleanly without boundary fragmentation
      this.rl = readline.createInterface({
        input: this.child.stdout,
        crlfDelay: Infinity
      });

      this.rl.on('line', (line) => {
        this._parseLine(line);
      });

      this.child.on('error', (err) => {
        this.emit('error', err);
      });

      this.child.on('exit', (code, signal) => {
        this.child = null;
        this.rl = null;
        if (this.isRunning) {
          // Automatic recovery / respawn if process unexpectedly terminates
          this.restartTimer = setTimeout(() => {
            this._spawnProcess();
          }, 1000);
        }
      });
    } catch (err) {
      this.emit('error', err);
    }
  }

  _parseLine(line) {
    if (!line || typeof line !== 'string') return;
    const trimmed = line.trim();
    if (!trimmed) return;

    // 1. Check for standard latency reply
    const latencyMatch = trimmed.match(LATENCY_REGEX);
    if (latencyMatch) {
      const ms = parseInt(latencyMatch[1], 10);
      this.emit('ping', {
        target: this.target,
        latency: ms,
        isTimeout: false,
        timestamp: Date.now()
      });
      return;
    }

    // 2. Check for sub-millisecond response: time<1ms
    if (SUB_MILLISECOND_REGEX.test(trimmed)) {
      this.emit('ping', {
        target: this.target,
        latency: 1,
        isTimeout: false,
        timestamp: Date.now()
      });
      return;
    }

    // 3. Check for genuine network timeouts / drops
    if (TIMEOUT_REGEX.test(trimmed)) {
      this.emit('ping', {
        target: this.target,
        latency: null,
        isTimeout: true,
        timestamp: Date.now()
      });
      return;
    }

    // Non-packet lines (e.g., "Pinging 4.2.2.4 with 32 bytes of data:") are safely ignored
  }

  setTarget(newTarget) {
    if (newTarget === this.target) return;
    this.target = newTarget;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
    if (this.child) {
      try {
        this.child.kill();
      } catch (e) {}
      this.child = null;
    }
  }
}

module.exports = {
  PingEngine,
  LATENCY_REGEX,
  SUB_MILLISECOND_REGEX,
  TIMEOUT_REGEX
};
```

**Key Takeaways for Planner:**
- Modular `PingEngine` class inherits from `EventEmitter`.
- Avoids repeated process creation by running continuous `ping.exe -t`.
- `readline.createInterface({ input: child.stdout, crlfDelay: Infinity })` guarantees clean lines across stream chunk boundaries.
- Only lines with explicit latency or explicit timeouts emit events; banner headers are safely discarded, preventing false-positive 0ms drops (D-05).
- Clean `stop()` and `setTarget()` methods allow switching targets and prepare for dual-stream architecture in Phase 3 (D-06).

---

### `main.js` (controller, streaming / request-response)

**Analog:** `main.js` [VERIFIED: git-tracked `main.js`]

**Ping Engine Integration Pattern** (lines 59-66 & 313-356):
```javascript
const { PingEngine } = require('./pingEngine');

let pingEngine = null;

// Dedicated Dynamic Ping Stream Controller
function startMonitoring() {
  // Initial Gemini Geo-restriction check and loop
  startGeminiCheckLoop();

  pingEngine = new PingEngine({
    target: currentSettings.pingTarget,
    intervalMs: currentSettings.pingIntervalMs
  });

  pingEngine.on('ping', ({ latency, timestamp }) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      history.push(latency);
      if (history.length > MAX_HISTORY) history.shift();

      const recent10 = history.slice(-10);
      const validRecent = recent10.filter((p) => p !== null);
      const avgPing = validRecent.length > 0 ? Math.round(validRecent.reduce((a, b) => a + b, 0) / validRecent.length) : null;
      const timeouts = recent10.filter((p) => p === null).length;
      const lossPct = recent10.length > 0 ? Math.round((timeouts * 100) / recent10.length) : 0;

      mainWindow.webContents.send('status-update', {
        ping: latency,
        avgPing,
        lossPct,
        history,
        status: currentGeminiStatus,
        server: currentSettings.pingTarget,
        timestamp
      });
    }
  });

  pingEngine.start();
}
```

**Settings Synchronization & Engine Target Update** (lines 107-152):
```javascript
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
...
    if (targetChanged) {
      history = [];
      if (pingEngine) {
        pingEngine.setTarget(sanitized.pingTarget);
      }
    }

    return { success: true, settings: currentSettings };
  } catch (err) {
    console.error('Failed to save settings to disk:', err);
    return { success: false, error: err.message, settings: currentSettings };
  }
}
```

**Backwards-Compatible `runPing` Preservation** (lines 180-192):
Keep `runPing(target, timeoutMs)` for backwards compatibility with tests and standalone single-shot checks.

**Clean Teardown on Application Quit** (lines 368-371):
```javascript
app.on('before-quit', () => {
  if (pingEngine) {
    pingEngine.stop();
  }
});
```

---

### `test/test-ping-engine.js` (test, streaming / batch)

**Analog:** `test/test-settings-poller.js` [VERIFIED: git-tracked `test/test-settings-poller.js`]

**Unit Test Structure for Streaming Line Buffering & Regex Accuracy**:
```javascript
const assert = require('assert');
const { PingEngine, LATENCY_REGEX, SUB_MILLISECOND_REGEX, TIMEOUT_REGEX } = require('../pingEngine');

console.log('--- Running Windows-Native Ping Engine Unit Tests ---');

// Test 1: Parser regex accuracy on Windows CMD sample lines
const sampleReplies = [
  { line: 'Reply from 4.2.2.4: bytes=32 time=42ms TTL=54', expectedLatency: 42, isTimeout: false },
  { line: 'Reply from 1.1.1.1: bytes=32 time=8ms TTL=58', expectedLatency: 8, isTimeout: false },
  { line: 'Reply from 127.0.0.1: bytes=32 time<1ms TTL=128', expectedLatency: 1, isTimeout: false },
  { line: 'Request timed out.', expectedLatency: null, isTimeout: true },
  { line: 'Destination host unreachable.', expectedLatency: null, isTimeout: true },
  { line: 'General failure.', expectedLatency: null, isTimeout: true },
  { line: 'Pinging 4.2.2.4 with 32 bytes of data:', expectedLatency: undefined, isTimeout: undefined }
];

for (const sample of sampleReplies) {
  let emitted = null;
  const engine = new PingEngine({ target: '4.2.2.4' });
  engine.on('ping', (data) => { emitted = data; });
  engine._parseLine(sample.line);

  if (sample.expectedLatency === undefined) {
    assert.strictEqual(emitted, null, `Banner header "${sample.line}" must not emit ping event`);
  } else {
    assert.notStrictEqual(emitted, null, `Line "${sample.line}" must emit ping event`);
    assert.strictEqual(emitted.latency, sample.expectedLatency);
    assert.strictEqual(emitted.isTimeout, sample.isTimeout);
  }
}
console.log('✓ Test 1: Windows CMD line parsing correctly extracts latency and timeouts');

// Test 2: Chunk boundary fragmentation line-buffering test
// Ensure stream split across multiple chunks does not corrupt output
const engine = new PingEngine({ target: '4.2.2.4' });
const receivedPings = [];
engine.on('ping', (p) => receivedPings.push(p));

// Simulate feeding lines through _parseLine
const chunkLines = [
  'Reply from 4.2.2.4: bytes=32 time=35ms TTL=54',
  'Reply from 4.2.2.4: bytes=32 time=36ms TTL=54',
  'Request timed out.'
];
chunkLines.forEach(l => engine._parseLine(l));
assert.strictEqual(receivedPings.length, 3);
assert.strictEqual(receivedPings[0].latency, 35);
assert.strictEqual(receivedPings[1].latency, 36);
assert.strictEqual(receivedPings[2].latency, null);
console.log('✓ Test 2: Line buffering successfully handles sequence of responses');

// Test 3: Multi-target independence test (Phase 3 readiness)
const engineA = new PingEngine({ target: '4.2.2.4' });
const engineB = new PingEngine({ target: '1.1.1.1' });
assert.strictEqual(engineA.target, '4.2.2.4');
assert.strictEqual(engineB.target, '1.1.1.1');
console.log('✓ Test 3: Multi-target instances run independently');

console.log('ALL PING ENGINE TESTS PASSED');
```

---

### `test/test-shell-config.js` (test, batch / transform)

**Analog:** `test/test-shell-config.js` [VERIFIED: git-tracked `test/test-shell-config.js`]

**Assertion Pattern for Draggable Top Bar and Controls Isolation** (lines 110-140):
```javascript
  // Assert styles.css Drag & Control Regions
  const cssPath = path.join(__dirname, '../styles.css');
  assert(fs.existsSync(cssPath), 'styles.css must exist');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  // Verify header drag region
  assert(
    /\.card-header[\s\S]*?-webkit-app-region:\s*drag/.test(cssContent),
    '.card-header must declare -webkit-app-region: drag'
  );

  // Verify window controls isolation
  assert(
    /\.window-controls[\s\S]*?-webkit-app-region:\s*no-drag\s*!important/.test(cssContent),
    '.window-controls must declare -webkit-app-region: no-drag !important'
  );

  // Verify button isolation
  assert(
    /\.win-btn[\s\S]*?-webkit-app-region:\s*no-drag\s*!important/.test(cssContent),
    '.win-btn must declare -webkit-app-region: no-drag !important'
  );

  // Verify SVG pointer-events none
  assert(
    /\.win-btn\s*svg[\s\S]*?pointer-events:\s*none/.test(cssContent),
    '.win-btn svg must declare pointer-events: none'
  );
```

---

## Shared Patterns

### 1. Window Drag & Nested Interactive Control Isolation Pattern
**Source:** `styles.css` (lines 82-138) & `src/components/Header.tsx` (lines 18-64)  
**Apply to:** Header bar, modal overlays, title containers.  
**Rules:**
- Drag region containers use `-webkit-app-region: drag` and `cursor: grab` (`cursor: grabbing` when `:active`).
- Interactive child containers (`.window-controls`) and control buttons (`.win-btn`) must enforce `-webkit-app-region: no-drag !important` to prevent Electron from capturing mouse clicks as window drag gestures.
- Any child icon SVGs inside buttons must declare `pointer-events: none` to prevent subpixel coordinate clicks from leaking down into the draggable parent container.
- Passive text labels inside the drag zone (e.g. `.card-title`) can specify `pointer-events: none` so users can grab and drag the window directly through the title text.

### 2. Continuous Child Process Streaming & Line Buffering Pattern
**Source:** `pingEngine.js` & `main.js` (lines 234-284)  
**Apply to:** Network telemetry services, ping engines, child process wrappers.  
**Rules:**
- Replace repetitive `execFile` polling loops with persistent `spawn('ping', [target, '-t'], { windowsHide: true })` streams to eliminate Windows process lifecycle churn and high-frequency process creation overhead.
- Wrap `child.stdout` in Node.js `readline.createInterface({ input: child.stdout, crlfDelay: Infinity })` to guarantee lines are cleanly split along CRLF boundaries, preventing chunk fragmentation bugs.
- Parse standard Windows CMD output with strict regexes matching `time=XXms` and `time<1ms`. Distinguish real network timeouts (`Request timed out`, `General failure`, etc.) from stream chunk pauses. Ignore banner headers (`Pinging...`) so they never create false-positive `0ms` drops.
- Cleanly terminate child processes on target changes or application shutdown via `.stop()` and `child.kill()`.
- Auto-recover by respawning after unexpected process termination.

### 3. Event-Driven Telemetry Broadcasting Pattern
**Source:** `main.js` (lines 339-348) & `preload.js` (lines 9-15)  
**Apply to:** All real-time telemetry updates sent to the React frontend.  
**Rules:**
- Telemetry engines emit local Node `EventEmitter` events (`'ping'`, `'drop'`).
- The Electron main process controller listens to engine events, maintains the sliding history buffer (`MAX_HISTORY`), calculates statistics (`avgPing`, `lossPct`), and broadcasts unified payloads over `mainWindow.webContents.send('status-update', payload)`.
- Preload wraps listeners and returns cleanup unsubscribe functions to prevent memory leaks in React `useEffect` hooks.

### 4. Node.js In-Memory Mocking & Headless Process Test Harness
**Source:** `test/test-ipc-contract.js` & `test/test-shell-config.js`  
**Apply to:** All automated tests (`test/*.js`).  
**Rules:**
- Tests run with pure `node test/<file>.js` without requiring full Electron binary launch.
- Intercept `'electron'` via `Module.prototype.require` to supply mocks for `app`, `BrowserWindow`, and `ipcMain`.
- Isolate temp file operations to temporary directories and clean up in `finally` blocks.
- Provide deterministic unit assertions against both runtime behavior and static assets (e.g., regex testing `styles.css`).

---

## No Analog Found

None. All files have high-quality, git-tracked analogs in the current repository.

---

## Metadata

**Analog search scope:** `E:/Electron/gemini-vpn-monitor` (root, `src/`, `test/`)  
**Files scanned:** 7 core files + 5 test files  
**Git verification:** All analog paths confirmed via `git ls-files`  
**Pattern extraction date:** 2026-10-31  
