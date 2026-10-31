# Phase 2: Full-Width Draggable Header & Robust Windows-Native Ping Engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-31  
**Phase:** 02-Full-Width Draggable Header & Robust Windows-Native Ping Engine  
**Areas discussed:** Header Drag Ergonomics, Windows Ping Engine Architecture, Roadmap Alignment  

---

## Header Drag Ergonomics & Discord-Style Dragging

| Option | Description | Selected |
|--------|-------------|----------|
| Full-Width Header Drag | Expand `-webkit-app-region: drag` edge-to-edge across the entire header bar | ✓ |
| Localized Handle | Keep drag restricted to upper center pill | |

**User's choice:** Full-width edge-to-edge draggable header container (Discord-style) with strict `-webkit-app-region: no-drag !important` and `pointer-events: none` on inner SVGs.  
**Notes:** Users should be able to grab anywhere along the top border to drag, without any risk of button clicks misfiring as drags.

---

## Windows-Native ICMP Engine Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Persistent `ping.exe -t` Stream | Spawn persistent child process stream with line-buffering and CP437/UTF-8 decoding | ✓ |
| Periodic `execFile` Timer | Spawn `ping -n 1` on an interval timer | |

**User's choice:** Persistent `ping.exe` child process stream with line buffering and encoding alignment.  
**Notes:** Eliminates process creation churn, fixes stream fragmentation causing false-positive 0ms timeout drops, matches CMD output accuracy, and modularizes the service for Phase 3 dual-stream telemetry.

---

## Roadmap Alignment & Phase Structuring

| Option | Description | Selected |
|--------|-------------|----------|
| Separate Phase 2 & Phase 3 | Phase 2 covers Header Polish & Robust Ping Engine; Phase 3 covers Zero-Delay Dual-Stream uPlot Engine | ✓ |
| Single Combined Phase | Bundle everything into a single large Phase 2 | |

**User's choice:** Separate into Phase 2 (Header Polish & Robust Ping Engine) and Phase 3 (Zero-Delay Dual-Stream uPlot Engine).

---

## the agent's Discretion

- Choice of line-buffering pattern (standard readline transform / stream chunk buffer).
- Process restart / recovery logic on abnormal process exit.

## Deferred Ideas

- **Phase 3:** Zero-Delay Dual-Stream uPlot Engine with 60-second FIFO `useRef` buffer, cyber-green waveforms, and crimson red 0ms timeout plunges.
