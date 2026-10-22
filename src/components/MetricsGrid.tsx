import React from 'react';

export interface MetricsGridProps {
  status: 'UNRESTRICTED' | 'RESTRICTED' | 'OFFLINE';
  ping: number | null;
  avgPing: number | null;
  lossPct: number;
  server: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  status,
  ping,
  avgPing,
  lossPct,
  server,
}) => {
  return (
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
          {server || '4.2.2.4'}
        </span>
      </div>
    </div>
  );
};

export default MetricsGrid;
