import { useState, useRef, useCallback } from 'react';
import { config } from '../config/config';
import { withRetry } from '../utils/resilience';

import { processSSEBuffer } from './sseUtils';

export interface StreamEvent {
    type: 'status' | 'text_structure' | 'image' | 'audio' | 'done' | 'error' | 'image_error';
    message?: string;
    paragraphs?: string[];
    options?: string[];
    index?: number; // Paragraph Index
    pIndex?: number; // Paragraph Index (for audio)
    sIndex?: number; // Sentence Index (for audio)
    text?: string; // Text content (for audio key)
    data?: string; // Base64 or Text
    error?: string;
}

export const useGameStream = (
    userToken: string,
    authToken: string | null,
    pollinationsToken: string,
    openaiKey: string | null
) => {
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamError, setStreamError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    // We expose a direct callback to handle events as they come, 
    // rather than just buffering, to allow "Event Drive" UI
    const onEventRef = useRef<((event: StreamEvent) => void) | null>(null);

    const startStream = useCallback(async (
        prompt: string,
        history: any[],
        voice: string,
        genre: string,
        lang: string,
        onEvent: (event: StreamEvent) => void,
        saveId?: string
    ) => {
        // Abort previous stream if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsStreaming(true);
        setStreamError(null);
        onEventRef.current = onEvent;

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-google-api-key': userToken,
                'x-pollinations-token': pollinationsToken,
                'x-openai-api-key': openaiKey || ''
            };

            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await withRetry(async () => {
                const res = await fetch(`${config.apiUrl}/game/stream`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ prompt, history, voice, genre, lang, saveId }),
                    signal: abortControllerRef.current?.signal
                });
                if (!res.ok) {
                    const errorMsg = `Stream connection failed: ${res.status}`;
                    // Special handling for auth errors
                    if (res.status === 401 || res.status === 403) {
                        throw new Error("AUTH_ERROR");
                    }
                    throw new Error(errorMsg);
                }
                return res;
            }, { retries: 3, baseDelay: 1000, name: 'Stream Connection' });

            if (!response.body) {
                throw new Error("Stream body is missing");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                buffer = processSSEBuffer(buffer, (event) => {
                    if (onEventRef.current) onEventRef.current(event);
                });
            }

        } catch (e: any) {
            if (e.name === 'AbortError') {
                console.log("Stream aborted");
                return;
            }
            console.error("Stream Fatal Error:", e);
            const errorMsg = e.message === "AUTH_ERROR" 
                ? "Your session has expired. Please log in again."
                : e.message;
            
            setStreamError(errorMsg);
            if (onEventRef.current) onEventRef.current({ type: 'error', error: errorMsg });
        } finally {
            setIsStreaming(false);
            abortControllerRef.current = null;
        }

    }, [userToken, authToken, pollinationsToken, openaiKey]);

    return {
        startStream,
        isStreaming,
        streamError
    };
};
