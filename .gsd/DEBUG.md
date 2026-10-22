# Debug Session: Dark Square Background Behind App

## Symptom
A dark square-like background appeared behind the rounded glassmorphic widget card (filling the 360x345 window bounds around the card and rounded corners).

**When:** App was launched on Windows.
**Expected:** The region outside the rounded `.widget-card` (the 10px padding and corners) must be completely transparent to the desktop, showing only the floating HUD.
**Actual:** A dark rectangular / square background was visible behind the app.

## Resolution

**Root Cause:**
1. `app.disableHardwareAcceleration()` was invoked at the top of `main.js`. On Windows, Chromium requires GPU hardware acceleration to composite per-pixel alpha transparency via DirectComposition; falling back to software CPU rendering causes Windows DWM to paint a solid black or dark box over transparent areas.
2. `hasShadow: true` on Windows transparent frameless windows causes Windows DWM to paint a native rectangular drop shadow along the 360x345 bounding box.
3. `BrowserWindow` was missing `backgroundColor: '#00000000'`, preventing explicit clearing of the background buffer to 0 alpha.
4. `html` and `#root` elements did not explicitly enforce `background: transparent !important`.

**Fix:**
1. Removed `app.disableHardwareAcceleration()` from `main.js`.
2. Changed `hasShadow: true` to `hasShadow: false` and added `backgroundColor: '#00000000'` in `main.js`.
3. Added explicit transparency and sizing rules for `html`, `body`, and `#root` in `styles.css`.
4. Rebuilt the production bundle (`npm run build`).

**Verified:**
- `npm run build` succeeded with zero errors.
- All unit and integration test suites passed (`test-settings-poller.js`, `test-e2e-persistence.js`, `test-ipc-contract.js`).
- Electron process launch smoke test passed.

**Status:** FIXED
