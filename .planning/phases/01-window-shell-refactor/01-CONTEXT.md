# Phase 1: Window Shell Refactor - Context

**Gathered:** 2026-10-31  
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 establishes a completely frameless, transparent Electron desktop shell (`frame: false`, `transparent: true`) without native OS chrome, caption bar, or title handler. It provides custom desktop window ergonomics via a draggable React header (`-webkit-app-region: drag`) with isolated interactive controls (`-webkit-app-region: no-drag`).
</domain>

<decisions>
## Implementation Decisions

### Electron Window Configuration
- **D-01:** `BrowserWindow` instantiation in `main.js` must strictly set `frame: false`, `transparent: true`, `backgroundColor: '#00000000'`, `hasShadow: false`, `resizable: false`, and `thickFrame: false` to eliminate native Windows OS chrome and border artifacts.
- **D-02:** Remove menu bar completely with `Menu.setApplicationMenu(null)` and `mainWindow.setMenuBarVisibility(false)`.
- **D-03:** Maintain Windows hardware acceleration disablement (`app.disableHardwareAcceleration()`) if required to avoid transparent window black-box glitching on Windows DWM.

### React Drag Region & Header Ergonomics
- **D-04:** Draggable header handle in `src/components/Header.tsx` and `styles.css` utilizing `-webkit-app-region: drag` across the upper pill and title header row.
- **D-05:** Explicit `-webkit-app-region: no-drag` on `.window-controls` and every interactive child element (`button`, `input`, settings icon, pin icon, minimize, close).
- **D-06:** Provide visual hover and active states for interactive buttons while preserving instant click responsiveness (preventing drag events from intercepting button clicks).

### IPC & Window Controls
- **D-07:** Connect close (`window:close`), minimize (`window:minimize`), and always-on-top pin (`window:toggle-pin`) through the secure `preload.js` context bridge.
</decisions>

<specifics>
## Specific Ideas

- Custom drag ergonomics matching modern desktop widgets (e.g., translucent HUDs).
- Smooth cursor transitions (`cursor: grab` on draggable areas, `cursor: pointer` on buttons).
- Zero-gap integration with the glassmorphic container (`.widget-card`).
</specifics>

<canonical_refs>
## Canonical References

- [main.js](file:///e:/Electron/gemini-vpn-monitor/main.js): Window creation and IPC handlers
- [preload.js](file:///e:/Electron/gemini-vpn-monitor/preload.js): Context bridge window API
- [src/components/Header.tsx](file:///e:/Electron/gemini-vpn-monitor/src/components/Header.tsx): Header component
- [styles.css](file:///e:/Electron/gemini-vpn-monitor/styles.css): Glassmorphic styling and drag region CSS
- [.planning/REQUIREMENTS.md](file:///e:/Electron/gemini-vpn-monitor/.planning/REQUIREMENTS.md): Requirements SHELL-01, SHELL-02, SHELL-03
</canonical_refs>

