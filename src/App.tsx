import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StatusPill from './components/StatusPill';
import PingOscilloscope, { PingRecord } from './components/PingOscilloscope';
import MetricsGrid from './components/MetricsGrid';
import SettingsModal from './components/SettingsModal';
import { StatusUpdateData } from './vite-env';

export const App: React.FC = () => {
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [status, setStatus] = useState<'UNRESTRICTED' | 'RESTRICTED' | 'OFFLINE'>('UNRESTRICTED');
  const [ping, setPing] = useState<number | null>(null);
  const [avgPing, setAvgPing] = useState<number | null>(null);
  const [lossPct, setLossPct] = useState<number>(0);
  const [server, setServer] = useState<string>('4.2.2.4');
  const [latestPing, setLatestPing] = useState<PingRecord | undefined>(undefined);

  useEffect(() => {
    // Initial fetch of persisted settings for pin state sync per D-07
    if (window.api?.getSettings) {
      window.api.getSettings().then((settings) => {
        if (settings && typeof settings.isPinned === 'boolean') {
          setIsPinned(settings.isPinned);
        }
        if (settings && settings.pingTarget) {
          setServer(settings.pingTarget);
        }
      }).catch((err) => {
        console.error('Failed to fetch initial settings:', err);
      });
    }
  }, []);

  useEffect(() => {
    if (window.api?.onUpdate) {
      const unsubscribe = window.api.onUpdate((data: StatusUpdateData) => {
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

      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
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

  return (
    <div className="widget-card" id="widgetCard">
      {/* Upper Drag Handle & Header Controls */}
      <Header
        isPinned={isPinned}
        onTogglePin={handleTogglePin}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onMinimize={handleMinimize}
        onClose={handleClose}
      />

      {/* Centered Status Pill */}
      <StatusPill status={status} serverTarget={server} />

      {/* 60 FPS Oscilloscope Canvas Stream */}
      <PingOscilloscope
        latestPing={latestPing}
        width={300}
        height={96}
        windowSec={14}
        playbackDelaySec={2.0}
        serverTarget={server}
      />

      {/* 2x2 Metrics Grid */}
      <MetricsGrid
        status={status}
        ping={ping}
        avgPing={avgPing}
        lossPct={lossPct}
        server={server}
      />

      {/* Glassmorphic Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTarget={server}
        onSaveSuccess={(newTarget) => setServer(newTarget)}
      />
    </div>
  );
};

export default App;
