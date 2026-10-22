import React from 'react';

export interface StatusPillProps {
  status: 'UNRESTRICTED' | 'RESTRICTED' | 'OFFLINE';
  serverTarget?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  serverTarget = '4.2.2.4',
}) => {
  const getStatusText = () => {
    if (status === 'UNRESTRICTED') return `UNRESTRICTED (${serverTarget} Active)`;
    if (status === 'RESTRICTED') return 'RESTRICTED (VPN Required)';
    return 'DISCONNECTED / OFFLINE';
  };

  return (
    <div className="status-container">
      <div className={`status-pill ${status.toLowerCase()}`} id="statusPill">
        <span className="status-dot" id="statusDot" />
        <span className="status-text" id="statusText">
          {getStatusText()}
        </span>
      </div>
    </div>
  );
};

export default StatusPill;
