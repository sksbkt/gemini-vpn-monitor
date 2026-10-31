---
phase: 02-full-width-draggable-header-robust-windows-native-ping-engin
plan: 02
subsystem: network-telemetry
tags:
  - icmp-stream
  - ping-engine
  - readline-buffering
  - windows-native
  - event-emitter
status: complete
requires:
  - "02-01"
provides:
  - "modular continuous ping streaming service via PingEngine"
  - "line-buffered Windows CMD ICMP parser handling standard latency, sub-1ms, timeouts, and headers"
  - "dynamic target switching and clean process lifecycle teardown"
affects:
  - "main.js"
  - "pingEngine.js"
  - "test/test-ping-engine.js"
  - "package.json"
tech-stack:
  added: []
  patterns:
    - "Continuous child process streaming with readline crlfDelay: Infinity"
    - "EventEmitter-driven real-time network telemetry"
    - "Windows CMD ICMP regex parsing with sub-millisecond handling"
key-files:
  created:
    - pingEngine.js
    - test/test-ping-engine.js
  modified:
    - package.json
    - main.js
decisions:
  - "Spanned continuous child_process.spawn('ping', [target, '-t']) with readline crlfDelay: Infinity to eliminate per-tick process spawn churn and stream chunk boundary corruption"
  - "Used LATENCY_REGEX, SUB_MILLISECOND_REGEX, and TIMEOUT_REGEX to safely extract exact latency (including time<1ms as 1ms) and timeout states while cleanly ignoring banner headers and summary statistics without false-positive 0ms drops"
  - "Integrated pingEngine.setTarget() in saveSettings() and added pingEngine.stop() in app.on('before-quit') for clean zombie-free lifecycle management"
actuals:
  tokens: 2850
  tasks: 2
  commits: 2
  plan_head_before: f9fb527e91b6ca75e7c649d4101ab119f5ccccf8
  plan_head_after: 6f5fe1cced9b8cab55e56ccf236ae4587c4259b4
---

# Phase 02 Plan 02: Robust Windows-Native Ping Engine Summary

Continuous Windows-native ICMP streaming engine using `ping.exe -t`, CRLF line buffering via `readline`, regex decoding for CMD output, and event-driven integration into Electron main process.

## Work Completed

### Task 1: Implement modular PingEngine stream service with line buffering, CMD regex decoding, and automated test suite
- Created [`pingEngine.js`](file:///E:/Electron/gemini-vpn-monitor/pingEngine.js) implementing `PingEngine` extending `EventEmitter`.
- Configured continuous stream spawn (`ping target -t` on win32) with `windowsHide: true`.
- Wrapped `child.stdout` in `readline.createInterface({ input: child.stdout, crlfDelay: Infinity })` to guarantee chunks are reassembled along CRLF boundaries without fragmentation.
- Implemented `_parseLine` with `LATENCY_REGEX` (`/time[=<](\d+)\s*ms/i`), `SUB_MILLISECOND_REGEX` (`/time<1\s*ms/i`), and `TIMEOUT_REGEX` (`/(?:request timed out|destination host unreachable|general failure|transmit failed)/i`).
- Discarded non-packet banner lines and summaries to prevent false-positive `0ms` drops.
- Added `setTarget(newTarget)` and `stop()` methods with auto-recovery on unexpected exit.
- Created [`test/test-ping-engine.js`](file:///E:/Electron/gemini-vpn-monitor/test/test-ping-engine.js) covering CMD reply parsing, sub-1ms handling, timeouts, multi-chunk feeding, multi-target isolation, and input validation.
- Updated [`package.json`](file:///E:/Electron/gemini-vpn-monitor/package.json) test runner script to include `test-ping-engine.js`.
- **Commit:** `a4d08a1`

### Task 2: Integrate PingEngine continuous stream into main.js controller, settings sync, and teardown lifecycle
- Refactored [`main.js`](file:///E:/Electron/gemini-vpn-monitor/main.js) to import and instantiate `PingEngine`.
- Hooked `pingEngine.on('ping', ...)` in `startMonitoring()` to push latency to history, compute `avgPing` and `lossPct`, and broadcast `status-update` to renderer over IPC.
- Updated `saveSettings()` to call `pingEngine.setTarget(sanitized.pingTarget)` and reset history buffer when target changes.
- Added `app.on('before-quit')` hook to call `pingEngine.stop()` to eliminate zombie processes.
- Retained `runPing()` for backwards compatibility with tests and standalone invocations.
- **Commit:** `6f5fe1c`

## Verification Results

- `node test/test-ping-engine.js` passed (5 unit tests verifying regex accuracy, sub-1ms handling, timeouts, multi-chunk feeds, and target isolation).
- `npm test` passed (all 3 test suites: `test-ipc-contract.js`, `test-shell-config.js`, `test-ping-engine.js`).
- `npm run build` completed cleanly (`tsc && vite build` bundled frontend with zero errors).

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None. All methods and streams are fully implemented and connected.

## Threat Surface Scan

No new unmitigated threat surfaces introduced. `sanitizeTarget` regex validation prevents argument injection, `windowsHide: true` prevents console window popping, and explicit `stop()` / `before-quit` hooks prevent orphaned processes.

## Self-Check: PASSED

- [x] pingEngine.js exists
- [x] test/test-ping-engine.js exists
- [x] package.json updated
- [x] main.js updated
- [x] Commit a4d08a1 exists
- [x] Commit 6f5fe1c exists
- [x] All 3 test suites passing in npm test
