# SPEC.md — Project Specification

> **Status**: `FINALIZED`
>
> ⚠️ **Planning Lock**: Unlocked. Requirements are finalized for execution planning.

## Vision

Elevate the Gemini VPN Monitor desktop widget with a persistent, dynamic settings subsystem and glassmorphic configuration interface. Users can seamlessly customize the target host/IP for latency monitoring, tune probing intervals and timeout thresholds, select from popular DNS presets, and persist their preferences across application restarts without downtime or reload.

## Goals

1. **Persistent Configuration Store**: Store user settings (`pingTarget`, `pingIntervalMs`, `pingTimeoutMs`, `isPinned`) locally on disk (`userData/config.json`) with safe defaults (`4.2.2.4`, `1000ms`, `800ms`).
2. **Dynamic Poller Reconfiguration**: Enable `main.js` to dynamically apply new ping targets and interval parameters on-the-fly without restarting the application loop.
3. **Glassmorphic Settings Modal**: Provide a sleek, translucent settings modal with smooth fade/slide transitions, input validation (IPv4 / hostname validation), quick preset selector buttons (`4.2.2.4`, `1.1.1.1`, `8.8.8.8`, `9.9.9.9`), and a reset-to-defaults action.
4. **IPC Protocol**: Implement secure two-way IPC handlers (`settings:get`, `settings:save`) exposed via `preload.js` with complete TypeScript typings.

## Non-Goals (Out of Scope)

- Modifying the Gemini API geo-restriction check endpoint or algorithm.
- Multi-target simultaneous parallel probing (covered in a future multi-AI milestone).
- Cloud sync of settings across machines.

## Constraints

- **Fixed Form Factor**: Modal must fit cleanly inside the 360x345 frameless widget without spilling outside window boundaries or causing scrollbar overflow.
- **IPC Isolation**: Renderer communicates strictly across `contextBridge` (`window.api.getSettings()`, `window.api.saveSettings()`).
- **Input Validation**: Must validate that target host contains no malicious shell injection characters (as it is passed to `execFile('ping')`).
- **Smooth 60 FPS**: Opening/closing settings modal must not interrupt the continuous background 60 FPS oscilloscope conveyor loop.

## Success Criteria

- [ ] Settings modal opens and closes smoothly via a gear icon in `Header.tsx`.
- [ ] User can change target to `1.1.1.1` or `8.8.8.8` or custom IP and see live latency and `Server:` metric card update immediately.
- [ ] Ping interval slider (500ms - 3000ms) updates probe cadence in real-time.
- [ ] Settings persist across full application quit and restart.
- [ ] Input validation blocks invalid IPs/hostnames and shell escape characters.
- [ ] Reset to Defaults button restores standard values (`4.2.2.4`, `1000ms`, `800ms`).

## Technical Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| Dynamic Config Store | Must-have | JSON file in `app.getPath('userData')/config.json` with fallback defaults |
| IPC Channels (`settings:get`, `settings:save`) | Must-have | Two-way IPC handlers with TypeScript typings in `vite-env.d.ts` |
| Shell Injection Sanitization | Must-have | Regex validation `^[a-zA-Z0-9.-]+$` before passing to `execFile` |
| Glassmorphic Modal UI | Must-have | Translucent backdrop blur matching `#121826` theme |
| Quick DNS Preset Buttons | Should-have | One-click selection for `4.2.2.4`, `1.1.1.1`, `8.8.8.8`, `9.9.9.9` |

---

*Last updated: 2026-10-22*
