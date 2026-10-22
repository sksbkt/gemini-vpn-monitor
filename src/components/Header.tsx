import React from 'react';

export interface HeaderProps {
  isPinned: boolean;
  onTogglePin: () => void;
  onMinimize: () => void;
  onClose: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isPinned,
  onTogglePin,
  onMinimize,
  onClose,
}) => {
  return (
    <>
      {/* Upper Drag Handle */}
      <div className="upper-drag-handle" title="Drag to move widget" />

      {/* Header with Title & Window Controls */}
      <header className="card-header">
        <h1 className="card-title">Gemini VPN Monitor</h1>
        <div className="window-controls">
          <button
            id="pinBtn"
            className={`win-btn ${isPinned ? 'pinned' : ''}`}
            title="Pin Always on Top"
            onClick={onTogglePin}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="17" x2="12" y2="22" />
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
            </svg>
          </button>
          <button id="minBtn" className="win-btn" title="Minimize" onClick={onMinimize}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button id="closeBtn" className="win-btn close-btn" title="Close" onClick={onClose}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </header>
    </>
  );
};

export default Header;
