/// <reference types="vite/client" />

export interface StatusUpdateData {
  ping: number | null;
  avgPing: number | null;
  lossPct: number;
  history: (number | null)[];
  status: 'UNRESTRICTED' | 'RESTRICTED' | 'OFFLINE';
  server: string;
  timestamp: number;
}

export interface AppSettings {
  pingTarget: string;
  pingIntervalMs: number;
  pingTimeoutMs: number;
  isPinned: boolean;
}

export interface SaveSettingsResponse {
  success: boolean;
  settings: AppSettings;
  error?: string;
}

export interface ElectronAPI {
  close: () => void;
  minimize: () => void;
  togglePin: () => Promise<boolean>;
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<SaveSettingsResponse>;
  onUpdate: (callback: (data: StatusUpdateData) => void) => (() => void) | void;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
