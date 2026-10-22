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

export interface ElectronAPI {
  close: () => void;
  minimize: () => void;
  togglePin: () => Promise<boolean>;
  onUpdate: (callback: (data: StatusUpdateData) => void) => void;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
