import React, { useState, useEffect } from 'react';
import { AppSettings } from '../vite-env';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTarget: string;
  onSaveSuccess: (newTarget: string) => void;
}

const PRESETS = [
  { label: 'Level3', ip: '4.2.2.4' },
  { label: 'Cloudflare', ip: '1.1.1.1' },
  { label: 'Google', ip: '8.8.8.8' },
  { label: 'Quad9', ip: '9.9.9.9' },
];

const TARGET_REGEX = /^[a-zA-Z0-9.-]+$/;

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTarget,
  onSaveSuccess,
}) => {
  const [target, setTarget] = useState<string>(currentTarget);
  const [intervalMs, setIntervalMs] = useState<number>(1000);
  const [timeoutMs, setTimeoutMs] = useState<number>(800);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load current settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      if (window.api?.getSettings) {
        window.api.getSettings().then((settings: AppSettings) => {
          if (settings) {
            setTarget(settings.pingTarget || currentTarget || '4.2.2.4');
            setIntervalMs(settings.pingIntervalMs || 1000);
            setTimeoutMs(settings.pingTimeoutMs || 800);
          }
        }).catch(() => {
          setTarget(currentTarget || '4.2.2.4');
        });
      } else {
        setTarget(currentTarget || '4.2.2.4');
      }
    }
  }, [isOpen, currentTarget]);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTargetChange = (val: string) => {
    setTarget(val);
    const trimmed = val.trim();
    if (!trimmed) {
      setErrorMsg('Target cannot be empty');
    } else if (!TARGET_REGEX.test(trimmed)) {
      setErrorMsg('Invalid host or IP (only a-z, 0-9, ., - allowed)');
    } else {
      setErrorMsg(null);
    }
  };

  const handlePresetClick = (ip: string) => {
    setTarget(ip);
    setErrorMsg(null);
  };

  const handleResetDefaults = () => {
    setTarget('4.2.2.4');
    setIntervalMs(1000);
    setTimeoutMs(800);
    setErrorMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = target.trim();

    if (!trimmed || !TARGET_REGEX.test(trimmed)) {
      setErrorMsg('Please enter a valid IP address or domain');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      if (window.api?.saveSettings) {
        const res = await window.api.saveSettings({
          pingTarget: trimmed,
          pingIntervalMs: intervalMs,
          pingTimeoutMs: timeoutMs,
        });

        if (res && res.success) {
          onSaveSuccess(res.settings.pingTarget);
          onClose();
        } else {
          setErrorMsg(res?.error || 'Failed to save settings');
        }
      } else {
        onSaveSuccess(trimmed);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="settings-overlay">
      <div className="settings-container">
        {/* Modal Header */}
        <div className="settings-header">
          <div className="settings-title-group">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="settings-header-icon">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <h2 className="settings-title">Probe Settings</h2>
          </div>
          <button className="settings-close-btn" onClick={onClose} title="Close Settings (Esc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="settings-form">
          {/* Target Host / IP */}
          <div className="form-group">
            <label className="form-label" htmlFor="pingTargetInput">Target Host or IP</label>
            <input
              id="pingTargetInput"
              type="text"
              className={`settings-input ${errorMsg ? 'error' : ''}`}
              placeholder="e.g. 4.2.2.4 or 1.1.1.1"
              value={target}
              onChange={(e) => handleTargetChange(e.target.value)}
              autoComplete="off"
              spellCheck="false"
            />
            {errorMsg && <div className="settings-error-msg">{errorMsg}</div>}
          </div>

          {/* Quick DNS Presets */}
          <div className="form-group">
            <div className="form-label">DNS Quick Presets</div>
            <div className="preset-grid">
              {PRESETS.map((p) => {
                const isActive = target.trim() === p.ip;
                return (
                  <button
                    key={p.ip}
                    type="button"
                    className={`preset-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handlePresetClick(p.ip)}
                    title={`Set target to ${p.ip}`}
                  >
                    <span className="preset-label">{p.label}</span>
                    <span className="preset-ip">{p.ip}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ping Interval Slider */}
          <div className="form-group">
            <div className="slider-header">
              <label className="form-label" htmlFor="intervalSlider">Probe Cadence</label>
              <span className="slider-value">{(intervalMs / 1000).toFixed(2)}s ({intervalMs}ms)</span>
            </div>
            <input
              id="intervalSlider"
              type="range"
              min="500"
              max="3000"
              step="250"
              className="settings-slider"
              value={intervalMs}
              onChange={(e) => setIntervalMs(Number(e.target.value))}
            />
          </div>

          {/* Action Buttons */}
          <div className="settings-actions">
            <button
              type="button"
              className="reset-btn"
              onClick={handleResetDefaults}
              title="Reset target and intervals to defaults"
            >
              Reset
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={isSaving || Boolean(errorMsg)}
            >
              {isSaving ? 'Saving...' : 'Apply Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
