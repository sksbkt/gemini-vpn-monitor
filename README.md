# 🌐 Gemini VPN & Latency Monitor

<p align="center">
  <img src="https://img.shields.io/badge/Electron-28.3.3-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.4.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.1.6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Platform-Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white" alt="Windows" />
</p>

A lightweight, real-time desktop glassmorphic HUD widget that continuously tracks **ICMP ping latency** and verifies **Google Gemini geo-restriction bypass status** when connected to VPNs or proxies.

---

## ✨ Features

- **🛡️ Real-Time Gemini Restriction Detection:** Live edge geolocation inspection against Google Gemini service (`gemini.google.com`), detecting whether your connection is in an unrestricted country or blocked (Iran, Russia, China, etc.) with zero false positives.
- **📈 60 FPS Canvas Latency Oscilloscope:** Smooth scrolling latency waveform drawn via HTML5 Canvas with glowing neon aesthetics, automatic dynamic Y-axis scaling, interactive hover inspection, and 0ms timeout drop indicators.
- **📊 2x2 Real-Time Telemetry Grid:**
  - **Current Ping:** Live round-trip time in milliseconds.
  - **10-Avg:** Smooth moving average over the last 10 samples.
  - **Packet Loss %:** Rolling loss percentage calculation.
  - **Target Server:** Active monitored host/IP.
- **🪟 Transparent Glassmorphic HUD:** Sleek 360x345 floating widget featuring acrylic blur, drag handle, always-on-top pin toggle, minimize, and close controls.
- **⚙️ Dynamic Configuration Modal:**
  - One-click presets (`4.2.2.4`, `1.1.1.1`, `8.8.8.8`, `9.9.9.9`) and custom IP/domain input with strict sanitization.
  - Dynamic polling interval slider (500ms – 5000ms).
  - Dynamic timeout slider (300ms – 3000ms).
  - Atomic persistence to disk (`gemini-vpn-config.json`).
- **🚀 Native Windows Integration:** Optimized frameless window handling with `thickFrame: false` and suppressed menu bar hooks to eliminate `Alt+Tab` flickering and rogue OS titlebar handles.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Operating System                                │
│       [ICMP: ping {target} -n 1]         [HTTPS: gemini.google.com]         │
└──────────────────────────────▲──────────────────────────▲───────────────────┘
                               │                          │
                               ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Electron Main Process (main.js)                         │
│  - Frameless Transparent Window Management (360x345, pin/minimize/close)    │
│  - Dynamic ICMP Ping Poller (child_process.execFile)                        │
│  - Gemini Geo-Restriction Detector (WIZ_global_data country inspection)     │
│  - Persistent Settings Store (userData/gemini-vpn-config.json)              │
│  - IPC Channel Hub (settings:get, settings:save, window controls)           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (IPC: status-update)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Preload Context Bridge (preload.js)                      │
│  - Secure contextIsolation bridge exposing type-safe window.electronAPI     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│             Vite + React 18 + TypeScript Renderer (src/main.tsx)            │
│  - App Root Container (src/App.tsx)                                         │
│    ├── Header & Drag Handle (src/components/Header.tsx)                     │
│    ├── Centered Status Pill (src/components/StatusPill.tsx)                 │
│    ├── 60 FPS Canvas Oscilloscope (src/components/PingOscilloscope.tsx)     │
│    ├── 2x2 Metrics Grid (src/components/MetricsGrid.tsx)                    │
│    └── Settings Modal & Presets (src/components/SettingsModal.tsx)          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- Windows 10 or 11 (for native ICMP `ping` parsing and transparent window composition)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sksbkt/gemini-vpn-monitor.git
   cd gemini-vpn-monitor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run in development mode:**
   ```bash
   npm run dev
   ```
   In a second terminal, launch Electron:
   ```bash
   npm start
   ```

4. **Build production bundle and launch:**
   ```bash
   npm run build
   npm start
   ```

---

## 🧪 Testing

The project includes unit, integration, and end-to-end verification suites:

```bash
# Run unit tests for settings validation & safe clamping
node test/test-settings-poller.js

# Run E2E persistence and cold restart recovery tests
node test/test-e2e-persistence.js

# Run IPC context bridge contract tests
node test/test-ipc-contract.js

# Run Gemini geo-restriction detector tests (including Iranian/Russian IP simulations)
node test/test-gemini-geo-checker.js
```

---

## ⚙️ Configuration

Settings are persistently stored in JSON format at:
```
%APPDATA%\gemini-vpn-monitor\gemini-vpn-config.json
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `pingTarget` | `string` | `4.2.2.4` | Target host or IP address to measure latency against. |
| `pingIntervalMs` | `number` | `1000` | Delay between consecutive ping requests (500 – 5000ms). |
| `pingTimeoutMs` | `number` | `800` | ICMP echo request timeout threshold (300 – 3000ms). |
| `isPinned` | `boolean` | `false` | Sets widget window to always-on-top. |

---

## 📜 License

MIT License. See [LICENSE](LICENSE) for details.
