# Debug Session: Rogue Window Handler & Flashing on Alt+Tab

## Symptom
A native window handler (titlebar/menu bar tab) appeared at the top of the window and flashed intermittently whenever `Alt+Tab` was pressed or during window switching.

**When:** Pressing `Alt+Tab` or switching application focus on Windows.
**Expected:** The widget must remain a pure frameless, transparent floating HUD with no native window handler, titlebar, or menu bar flashing or appearing during focus switches or `Alt+Tab`.
**Actual:** Pressing `Alt+Tab` caused a native window handler/menu bar strip to pop open at the top of the transparent card and flash/disappear when `Alt` was released or focus changed.

## Resolution

**Root Cause:**
1. `autoHideMenuBar: true` in `BrowserWindow` options actively registers a Windows shortcut hook on the `Alt` key. In Electron, `autoHideMenuBar` specifically instructs the window manager to unhide/render the application menu bar whenever the `Alt` key is pressed. Because `Alt+Tab` always begins with pressing the `Alt` key, Electron was immediately mounting and painting the menu bar/handler, then unmounting it when `Alt` was released, causing an intrusive flashing window handler.
2. `titleBarStyle: 'hidden'` on Windows specifically activates Chromium's "Window Controls Overlay" (WCO). On frameless transparent windows, this overlay creates an extraneous native window caption/controls hook.
3. `Menu.setApplicationMenu(null)` was not invoked globally, leaving Chromium's default application menu (File, Edit, View, Window, Help) active in memory.

**Fix:**
1. Removed `autoHideMenuBar: true` and `titleBarStyle: 'hidden'` from `BrowserWindow` configuration in [main.js](file:///e:/Electron/gemini-vpn-monitor/main.js).
2. Called `Menu.setApplicationMenu(null)` globally before window creation, completely removing default application menus and accelerators from Electron.
3. Called `mainWindow.setMenuBarVisibility(false)` on window creation to guarantee menu bars are permanently suppressed.
4. Added `outline: none;` to universal `*` selector in [styles.css](file:///e:/Electron/gemini-vpn-monitor/styles.css) to eliminate any focus outline artifacts.
5. Updated unit test mocks in `test/test-settings-poller.js`, `test/test-e2e-persistence.js`, and `test/test-ipc-contract.js` to mock `Menu.setApplicationMenu`.
6. Rebuilt production assets with `npm run build`.

**Verified:**
- `npm run build` completed with 0 errors.
- All unit and integration test suites passed:
  - `test-settings-poller.js` passed.
  - `test-e2e-persistence.js` passed.
  - `test-ipc-contract.js` passed.
- Electron process launch smoke test passed (`ELECTRON_LAUNCH_SMOKE_TEST_PASS`).

**Status:** FIXED
