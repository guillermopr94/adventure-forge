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

        // Reset if text changes
        setDisplayedText('');
        completedRef.current = false;

        const totalChars = text.length;
        if (totalChars === 0) return;

        // Calculate interval based on duration
        // Ensure a minimum speed so it's not too slow for short text
        // and not too fast for long text (though duration usually bounds it).
        const intervalTime = Math.max(10, duration / totalChars);

        // Adjust for slight overhead, maybe run slightly faster to ensure it finishes within duration
        const adjustedInterval = intervalTime * 0.95;

        let charIndex = 0;
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
