
import { useState, useRef } from 'react';
import { generateKokoroAudio } from '../utils/kokoroTTS';
import { GoogleGenAI } from "@google/genai";
import { splitFirstSentence } from '../utils/textSplitter';

export const useSmartAudio = (
    userToken: string,
    language: string,
    genreKey: string,
    setDuration: (ms: number) => void,
    onSequenceEnd: () => void
) => {
    const [audioData, setAudioData] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    const pendingAudioRef = useRef<Promise<string | null> | null>(null);
    const hasNextChunkRef = useRef(false);
    const genAIClientRef = useRef<any>(null);

    const getClient = () => {
        if (!genAIClientRef.current && userToken) {
            genAIClientRef.current = new GoogleGenAI({ apiKey: userToken });
        }
        return genAIClientRef.current;
    };

    const calculateDuration = (base64Data: string) => {
        // Approx duration for 24kHz 16-bit mono
        const byteLength = (base64Data.length * 3) / 4;
        return (byteLength / 48000) * 1000; // in ms
    };

    const generateChunk = async (text: string): Promise<string | null> => {
        if (!text.trim()) return null;

        try {
            // 1. Try Kokoro
            const kokoroAudio = await generateKokoroAudio(text, language, genreKey);
            if (kokoroAudio) return kokoroAudio;

            // 2. Fallback Gemini
            console.log("Kokoro failed, using Gemini fallback...");
            const client = getClient();
            if (!client) return null;

            const response = await client.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: text }] }],
                config: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });

            return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;

        } catch (e) {
            console.error("Audio generation failed", e);
            return null;
        }
    };

    const playText = async (text: string) => {
        setIsLoading(true);
        setAudioData(undefined);
        hasNextChunkRef.current = false;
        pendingAudioRef.current = null;

        const [part1, part2] = splitFirstSentence(text);

        console.log("Splitting text:", { part1: part1.substring(0, 20) + "...", part2Length: part2.length });

        // Generate Part 1
        const audio1 = await generateChunk(part1);

        if (audio1) {
            // Start playing Part 1
            setAudioData(audio1);
            setIsLoading(false);

            const duration1 = calculateDuration(audio1);

            // If we have a second part, start generating it immediately
            if (part2.trim().length > 0) {
                hasNextChunkRef.current = true;

                // Estimate total duration
                // We assume uniform speed roughly. 
                // Total Duration ~= Duration1 * (TotalLength / Part1Length)
                const totalLength = text.length;
                const part1Length = part1.length;
                const estimatedTotal = duration1 * (totalLength / part1Length);

                // Add buffer
                setDuration(estimatedTotal + 1000);

                // Start fetching Part 2
                pendingAudioRef.current = generateChunk(part2);
            } else {
                setDuration(duration1 + 1000);
            }

        } else {
            // Failed to generate audio for part 1 (or at all)
            setIsLoading(false);
            onSequenceEnd();
        }
    };

    const onAudioComplete = async () => {
        if (hasNextChunkRef.current && pendingAudioRef.current) {
            // We are expecting a second chunk
            hasNextChunkRef.current = false; // Only one extra chunk supported for now

            // While we await, the user might experience silence if generation is slow.
            // Ideally we could show a mini-loader, but for now we just wait.
            try {
                const audio2 = await pendingAudioRef.current;
                pendingAudioRef.current = null;

                if (audio2) {
                    setAudioData(audio2);
                } else {
                    onSequenceEnd();
                }
            } catch (e) {
                onSequenceEnd();
            }
        } else {
            // No more chunks
            onSequenceEnd();
        }
    };

    return {
        audioData,
        isLoading,
        playText,
        onAudioComplete
    };
};
