# Debug Session: Rogue Window Handler and Dark Box Border

## Symptom
A transparent dark box appeared around the window, with a native window handler (titlebar tab) displaying the name of the app on it.

**When:** App is running on Windows 11 / 10 (especially on blur or inactive window state).
**Expected:** Pure floating translucent card with no native OS window handle, no titlebar with app name, and no rectangular outer box/border.
**Actual:** Windows drew a native window handler with the app title and a rectangular dark border around the 360x345 window.

## Resolution

**Root Cause:**
1. In Electron on Windows, frameless windows (`frame: false`) retain the Win32 `WS_THICKFRAME` window style by default (`thickFrame: true`). Windows 11 DWM detects `WS_THICKFRAME` on frameless windows and draws a native window frame/border with a top titlebar window handler displaying the window caption.
2. `<title>Gemini VPN Monitor</title>` in `index.html` set the Win32 window text, which Windows 11 grabbed to display on the rogue window handle.
3. Without `titleBarStyle: 'hidden'` and `mainWindow.removeMenu()`, Windows kept fallback caption hooks active.
4. An overly aggressive 48px black box-shadow spilled out into the transparent padding, creating a dark translucent box outline.

**Fix:**
1. Added `thickFrame: false`, `titleBarStyle: 'hidden'`, `autoHideMenuBar: true`, and `title: ''` to `BrowserWindow` options in `main.js`.
2. Called `mainWindow.removeMenu()` in `main.js`.
3. Cleared `<title></title>` in `index.html` to prevent Win32 window text assignment.
4. Softened the outer card box-shadow in `styles.css`.
5. Rebuilt production bundle (`npm run build`).

**Verified:**
- `npm run build` compiled cleanly.
- Unit and integration tests passed (`test-settings-poller.js`, `test-e2e-persistence.js`, `test-ipc-contract.js`).
- Electron process launch smoke test passed (`ELECTRON_LAUNCH_SMOKE_TEST_PASS`).

**Status:** FIXED
