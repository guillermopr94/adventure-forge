import React, { useState, useEffect, useRef } from 'react';
import './GameImage.css';

interface GameImageProps {
  src: string | null;
  alt: string;
  timeoutMs?: number;
  onRetry?: () => void;
}

export const GameImage: React.FC<GameImageProps> = ({
  src,
  alt,
  timeoutMs = 15000,
  onRetry
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Reset states when src changes
    if (src) {
      setIsLoading(true);
      setHasError(false);
      setIsVisible(false);

      // Start timeout timer
      timeoutRef.current = setTimeout(() => {
        if (isLoading) {
          setHasError(true);
          setIsLoading(false);
        }
      }, timeoutMs);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else {
      // No src provided
      setIsLoading(false);
      setHasError(false);
      setIsVisible(false);
    }
  }, [src, timeoutMs]);

  const handleImageLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
    setHasError(false);
    // Trigger cross-fade transition
    setTimeout(() => setIsVisible(true), 50);
  };

  const handleImageError = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
    setHasError(true);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setIsVisible(false);
    
    if (onRetry) {
      onRetry();
    } else if (src) {
      // Force reload by creating a new img element
      const img = new Image();
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      img.src = src;
      imgRef.current = img;

      // Start new timeout
      timeoutRef.current = setTimeout(() => {
        if (isLoading) {
          setHasError(true);
          setIsLoading(false);
        }
      }, timeoutMs);
    }
  };

  if (!src) {
    return null;
  }

  return (
    <div className="game-image-container">
      {isLoading && !hasError && (
        <div className="game-image-loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">Visualizing scene...</p>
        </div>
      )}

      {hasError && (
        <div className="game-image-error">
          <p className="error-text">Failed to load image</p>
          <button 
            className="retry-button"
            onClick={handleRetry}
            aria-label="Retry loading image"
          >
            Retry
          </button>
        </div>
      )}

      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`game-image ${isVisible ? 'visible' : ''}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ display: isLoading || hasError ? 'none' : 'block' }}
      />
    </div>
  );
};
