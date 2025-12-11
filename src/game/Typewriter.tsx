import React, { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
    text: string;
    duration?: number; // Total duration in ms
    isActive: boolean; // Only animate if active
    onComplete?: () => void;
}

const Typewriter: React.FC<TypewriterProps> = ({ text, duration = 3000, isActive, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const completedRef = useRef(false);

    useEffect(() => {
        if (!isActive) {
            setDisplayedText(text);
            if (!completedRef.current) {
                completedRef.current = true;
                onComplete && onComplete();
            }
            return;
        }

        const totalChars = text.length;
        const previousChars = displayedText.length;

        // If this is a completely new text (not an extension of current), reset
        // Use startsWith checking, but be careful of empty string
        const isExtension = previousChars > 0 && text.startsWith(displayedText);

        if (!isExtension) {
            // Reset logic
            if (previousChars > 0 && text !== displayedText) {
                setDisplayedText('');
                // Note: We'll continue in next render or immediately set?
                // Ideally we want to just reset start.
            }
        }

        // If we have already finished this exact text, do nothing
        if (displayedText === text) {
            if (!completedRef.current) {
                completedRef.current = true;
                onComplete && onComplete();
            }
            return;
        }

        completedRef.current = false;

        // Calculate characters needed to type
        const charsToTypeCount = totalChars - (isExtension ? previousChars : 0);
        if (charsToTypeCount <= 0) return;

        // Duration is for the *new* part effectively? 
        // We need to decide how 'duration' prop is treated.
        // Assuming the parent passes the duration for the "current operation".
        // If it's extension, duration is for the extension.

        const intervalTime = Math.max(10, duration / charsToTypeCount);
        const adjustedInterval = intervalTime * 0.95;

        // Start from correct index
        let charIndex = isExtension ? previousChars : 0;

        // Clear any existing interval in this scope? (useEffect cleanup handles it)

        const timer = setInterval(() => {
            charIndex++;
            setDisplayedText(text.slice(0, charIndex));

            if (charIndex >= totalChars) {
                clearInterval(timer);
                completedRef.current = true;
                onComplete && onComplete();
            }
        }, adjustedInterval);

        return () => clearInterval(timer);
    }, [text, duration, isActive, onComplete]);

    return (
        <span>{displayedText}</span>
    );
};

export default Typewriter;
