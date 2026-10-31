---
status: testing
phase: 01-window-shell-refactor
source: [01-VERIFICATION.md]
started: 2026-10-31T21:36:30Z
updated: 2026-10-31T21:36:30Z
---

## Current Test

number: 1
name: Native OS Titlebar Removal & Alpha Transparency
expected: |
  Window initializes with zero native OS chrome, caption bar, or borders; transparent glassmorphic background renders cleanly without black-box DWM compositing artifacts.
awaiting: user response

## Tests

### 1. Native OS Titlebar Removal & Alpha Transparency
expected: Window initializes with zero native OS chrome, caption bar, or borders; transparent glassmorphic background renders cleanly without black-box DWM compositing artifacts.
result: [pending]

### 2. Desktop Dragging Ergonomics
expected: Application window smoothly moves across desktop screen coordinates following the cursor when clicking and dragging the upper pill handle or header title.
result: [pending]

### 3. Window Controls Ergonomics & State Persistence
expected: Pin, Settings, Minimize, and Close buttons immediately react to clicks (scale animation, pin toggling always-on-top, minimize hides to taskbar, close exits) without dragging the window, and pin state persists across app restarts.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
