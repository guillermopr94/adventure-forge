import React from 'react';
import './StreamErrorState.css';

interface StreamErrorStateProps {
  errorMessage?: string;
  onRetry: () => void;
  onBack: () => void;
}

const StreamErrorState: React.FC<StreamErrorStateProps> = ({
  errorMessage = 'The connection to the adventure realm has been disrupted.',
  onRetry,
  onBack
}) => {
  return (
    <div className="stream-error-container">
      <div className="stream-error-panel">
        <div className="stream-error-icon">⚠️</div>
        <h2 className="stream-error-title">Connection Lost</h2>
        <p className="stream-error-message">{errorMessage}</p>
        <div className="stream-error-actions">
          <button 
            className="stream-error-button retry-button" 
            onClick={onRetry}
            aria-label="Retry connection"
          >
            ↻ Retry
          </button>
          <button 
            className="stream-error-button back-button" 
            onClick={onBack}
            aria-label="Return to main menu"
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreamErrorState;
