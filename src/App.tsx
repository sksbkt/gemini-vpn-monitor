import React, { useState, useEffect } from 'react';
import PingOscilloscope, { PingRecord } from './components/PingOscilloscope';
import { StatusUpdateData } from './vite-env';

export const App: React.FC = () => {
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [status, setStatus] = useState<'UNRESTRICTED' | 'RESTRICTED' | 'OFFLINE'>('UNRESTRICTED');
  const [ping, setPing] = useState<number | null>(null);
  const [avgPing, setAvgPing] = useState<number | null>(null);
  const [lossPct, setLossPct] = useState<number>(0);
  const [server, setServer] = useState<string>('4.2.2.4');
  const [latestPing, setLatestPing] = useState<PingRecord | undefined>(undefined);

  useEffect(() => {
    if (window.api?.onUpdate) {
      window.api.onUpdate((data: StatusUpdateData) => {
        setStatus(data.status);
        setPing(data.ping);
        setAvgPing(data.avgPing);
        setLossPct(data.lossPct);
        if (data.server) {
          setServer(data.server);
        }

        const ts = (data.timestamp || Date.now()) / 1000;
        setLatestPing({
          time: ts,
          ping: data.ping,
          isTimeout: data.ping === null,
        });
      });
    }
  }, []);

  const handleClose = () => {
    if (window.api?.close) window.api.close();
  };

  const handleMinimize = () => {
    if (window.api?.minimize) window.api.minimize();
  };

  const handleTogglePin = async () => {
    if (window.api?.togglePin) {
      const pinned = await window.api.togglePin();
      setIsPinned(pinned);
    }
  };

  const getStatusText = () => {
    if (status === 'UNRESTRICTED') return `UNRESTRICTED (${server} Active)`;
    if (status === 'RESTRICTED') return 'RESTRICTED (VPN Required)';
    return 'DISCONNECTED / OFFLINE';
  };

  return (
    <div className="widget-card" id="widgetCard">
      {/* Upper Drag Handle */}
      <div className="upper-drag-handle" title="Drag to move widget" />

      {/* Header */}
      <header className="card-header">
        <h1 className="card-title">Gemini VPN Monitor</h1>
        <div className="window-controls">
          <button
            id="pinBtn"
            className={`win-btn ${isPinned ? 'pinned' : ''}`}
            title="Pin Always on Top"
            onClick={handleTogglePin}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="17" x2="12" y2="22" />
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
            </svg>
          </button>
          <button id="minBtn" className="win-btn" title="Minimize" onClick={handleMinimize}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button id="closeBtn" className="win-btn close-btn" title="Close" onClick={handleClose}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {/* Centered Status Pill */}
      <div className="status-container">
        <div className={`status-pill ${status.toLowerCase()}`} id="statusPill">
          <span className="status-dot" id="statusDot" />
          <span className="status-text" id="statusText">
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* 60 FPS Oscilloscope Stream */}
      <PingOscilloscope
        latestPing={latestPing}
        width={316}
        height={96}
        windowSec={14}
        playbackDelaySec={2.0}
        serverTarget={server}
      />

      {/* 4-Card Metrics Grid (2x2) */}
      <div className="metrics-grid">
        <div className={`metric-card active ${status.toLowerCase()}`} id="cardPing">
          <span className="metric-label">Current Ping:</span>
          <span className="metric-val" id="valPing">
            {ping === null ? 'TIMEOUT' : `${ping} ms`}
          </span>
        </div>
        <div className="metric-card" id="cardAvg">
          <span className="metric-label">10-Avg:</span>
          <span className="metric-val" id="valAvg">
            {avgPing !== null ? `${avgPing} ms` : '-- ms'}
          </span>
        </div>
        <div className="metric-card" id="cardLoss">
          <span className="metric-label">Packet Loss:</span>
          <span className="metric-val" id="valLoss">
            {lossPct}%
          </span>
        </div>
        <div className="metric-card" id="cardServer">
          <span className="metric-label">Server:</span>
          <span className="metric-val" id="valServer">
            {server}
          </span>
        </div>
      </div>
    </div>
  );
};

export default App;
