# Gemini VPN Monitor

## What This Is

A high-performance desktop glassmorphic HUD widget built with Electron, React 18, and TypeScript. It continuously monitors network latency and Google Gemini API geo-restriction availability, rendering live real-time metrics with zero latency overhead.

## Core Value

Zero-latency, 60 FPS real-time desktop network latency and geo-restriction monitoring with a distraction-free, frameless glassmorphic HUD.

## Current Milestone

**Milestone: Frameless Shell & Zero-Delay uPlot Telemetry Engine**

Transitioning the repository to the `open-gsd/gsd-core` specification framework and executing two immediate architectural priorities:
1. **Phase 1: Window Shell Refactor** — Frameless translucent window shell (`frame: false`, `transparent: true`) with custom React drag region and controls.
2. **Phase 2: Zero-Delay uPlot Engine** — uPlot-driven 60 FPS streaming oscilloscope with 60-second FIFO queue, zero React render lag, cyber-green gradient waves, and crimson red 0ms timeout plunges.

## Requirements

### Validated
- [x] Persistent JSON settings store (`userData/gemini-vpn-config.json`)
- [x] Two-way secure IPC communication bridge with shell input sanitization
- [x] Dynamic background ICMP ping poller and Gemini API health query loop
- [x] Glassmorphic settings modal with DNS presets and interval adjustments

### Active
- [ ] **SHELL-01**: Frameless Electron `BrowserWindow` (`frame: false`, `transparent: true`) without native OS decorations
- [ ] **SHELL-02**: Custom draggable React top bar header with `-webkit-app-region: drag`
- [ ] **SHELL-03**: Interactive window controls (close, minimize, pin, settings) marked with `-webkit-app-region: no-drag`
- [ ] **GRAPH-01**: In-memory 60-second rolling FIFO telemetry buffer managed via React `useRef` to eliminate state re-render lag
- [ ] **GRAPH-02**: Real-time zero-delay streaming network graph powered by `uPlot`
- [ ] **GRAPH-03**: uPlot custom series hooks (`hooks.drawSeries`) rendering cyber-green gradient strokes and crimson red 0ms timeout plunges

### Out of Scope
- Full browser web build (Electron native APIs required for ICMP ping and frameless transparency)
- Ant Design / Heavy component charting libraries (incompatible with 60 FPS zero-overhead requirement)

## Context

- Target OS: Windows 10 / 11
- Runtimes: Node.js v26.5.0, Electron 28.3.3, React 18.3.1, TypeScript 5.9.3, Vite 5.4.21
- Specification Framework: `open-gsd/gsd-core` (v1.19.0)

