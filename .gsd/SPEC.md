# SPEC.md — Project Specification

> **Status**: `FINALIZED`
>
> ⚠️ **Planning Lock**: Unlocked. Requirements are finalized for execution planning.

## Vision

Modernize the Gemini VPN Monitor desktop application by introducing a high-performance Vite + React + TypeScript build pipeline. This allows integrating the existing commercial-grade `PingOscilloscope.tsx` (uPlot HTML5 Canvas engine) into the active application while strictly maintaining the glassmorphic HUD styling, instant startup, low CPU/RAM usage, and real-time telemetry streaming.

## Goals

1. **Toolchain & Pipeline Setup**: Integrate Vite with TypeScript and React into the existing Electron architecture, ensuring fast HMR during development and optimized static bundling for production.
2. **Component & Telemetry Integration**: Wire the existing `PingOscilloscope.tsx` component into the live application, feeding real-time ICMP ping ticks and timeout drops directly from Electron's IPC bridge into the uPlot rolling canvas buffer.
3. **Glassmorphic HUD Parity**: Rebuild the UI shell (drag handles, window control buttons, glowing status pill, 2x2 metric cards) as modular React components matching the exact visual style, colors, and animations in `styles.css`.
4. **Clean Dependency Management**: Formalize all dependencies in `package.json` (React, React-DOM, uPlot, TypeScript, Vite) and clean up extraneous/orphaned artifacts.

## Non-Goals (Out of Scope)

- Rewriting the Electron main process (`main.js`) or preload script (`preload.js`) in TypeScript.
- Modifying the core ICMP ping probe (`ping 4.2.2.4`) or Gemini geo-restriction verification logic in `main.js`.
- Adding remote telemetry logging, multi-service dashboards, or cloud databases.

## Constraints

- **Window Constraints**: Window remains fixed at 360x345, frameless, transparent, non-resizable.
- **Hardware Acceleration**: Must run smoothly with hardware acceleration disabled (`app.disableHardwareAcceleration()`).
- **Zero Layout Shifts**: Canvas and HUD layout must have fixed dimensions with zero jumpiness.
- **IPC Isolation**: Must strictly operate across `contextBridge` (`window.api`) with `contextIsolation: true`.

## Success Criteria

- [ ] Vite bundles the React app into `dist/` with zero TypeScript or build errors.
- [ ] Electron launches and loads the bundled React app seamlessly in both development and production.
- [ ] `PingOscilloscope` renders live latency points smoothly with neon cyan wave and red 0ms timeout cliff drops.
- [ ] Window controls (Close, Minimize, Always-on-Top Pin) function identically to the current implementation.
- [ ] Metric cards (Current Ping, 10-Avg, Packet Loss %, Server) and Status Pill update in real-time.
- [ ] All required packages are cleanly declared in `package.json` without extraneous modules.

## Technical Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| Vite + React + TS Build | Must-have | Standard Vite configuration with relative base paths (`base: './'`) for Electron file loading |
| uPlot Canvas Integration | Must-have | Seamless ingestion of live ping ticks into `PingOscilloscope.tsx` with 60 FPS conveyor |
| Visual HUD Parity | Must-have | 1:1 match of existing glassmorphic styling, glow filters, fonts, and dark theme |
| Window Control Handlers | Must-have | Integration with `window.api.close()`, `minimize()`, `togglePin()` |
| Package Hygiene | Should-have | Explicit `dependencies` and `devDependencies` in `package.json` |

---

*Last updated: 2026-10-22*
