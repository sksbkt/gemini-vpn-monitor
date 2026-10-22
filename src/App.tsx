import React, { useState } from 'react';

export const App: React.FC = () => {
  const [isPinned, setIsPinned] = useState(false);

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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="17" x2="12" y2="22" />
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
            </svg>
          </button>
          <button id="minBtn" className="win-btn" title="Minimize" onClick={handleMinimize}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button id="closeBtn" className="win-btn close-btn" title="Close" onClick={handleClose}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {/* Initial Status Placeholder for Phase 1 verification */}
      <div className="status-container">
        <div className="status-pill unrestricted">
          <span className="status-dot" />
          <span className="status-text">INITIALIZING VITE REACT ENGINE...</span>
        </div>
      </div>
    </div>
  );
};

export default App;
