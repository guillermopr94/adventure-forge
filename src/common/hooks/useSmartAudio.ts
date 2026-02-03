
import { useState, useRef } from 'react';
import { splitFirstSentence } from '../utils/textSplitter';
import { AudioGenerator } from '../services/ai/AudioGenerator';

export const useSmartAudio = (
    userToken: string,
    language: string,
    genreKey: string,
    setDuration: (ms: number) => void,
    onSequenceEnd: () => void,
    audioGenerator: AudioGenerator | null
) => {
    const [audioData, setAudioData] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [visualText, setVisualText] = useState("");
    const [visualDuration, setVisualDuration] = useState(0);

    const pendingAudioRef = useRef<Promise<string | null> | null>(null);
    const hasNextChunkRef = useRef(false);
    // Staging refs for the prepared first chunk
    const nextStartDataRef = useRef<{
        audio: string;
        text: string;
        duration: number;
        fullText: string;
    } | null>(null);

    // To handle the full text for final state
    const fullTextRef = useRef("");
    const part2TextRef = useRef("");
    const cacheRef = useRef<Map<string, Promise<string | null>>>(new Map());

    const calculateDuration = (base64Data: string, text: string) => {
        // Check for MP3 header (ID3 or Frame Sync) - rudimentary check
        // First few bytes of base64 for ID3: "SUQz" (which decodes to ID3)
        // or frame sync
        // Or if it starts with // which is u32 or something? No, base64 for ID3 often starts with SUQz

        const isMp3 = base64Data.startsWith("SUQz") || base64Data.startsWith("//"); // Typical MP3 starts or similar

        if (isMp3) {
            // For MP3, byte-based duration is unreliable without decoding.
            // Fallback to text-based estimation: avg speaking rate ~15 chars/sec = ~66ms/char
            // Pollinations/OpenAI is relatively fast, maybe 50-60ms/char
            return text.length * 60;
        }

        // Approx duration for 24kHz 16-bit mono PCM (Kokoro)
        const byteLength = (base64Data.length * 3) / 4;
        return (byteLength / 48000) * 1000; // in ms
    };

    const generateChunk = async (text: string): Promise<string | null> => {
        if (!text.trim()) return null;
        if (!audioGenerator) {
            console.warn("Audio Generator not initialized in hook");
            return null;
        }

        try {
            return await audioGenerator.generate(text);
        } catch (e) {
            console.error("Audio generation failed via service", e);
            return null;
        }
    };

    // New Prefetch Method
    const prefetch = (text: string): Promise<string | null> | undefined => {
        let part1 = text;
        // Logic must match prepareText
        if (audioGenerator?.shouldSplitText) {
            const parts = splitFirstSentence(text);
            part1 = parts[0];
        }

        if (part1.trim()) {
            if (!cacheRef.current.has(part1)) {
                console.log("Prefetching audio for:", part1.substring(0, 20) + "...");
                const promise = generateChunk(part1);
                cacheRef.current.set(part1, promise);
                return promise;
            } else {
                return cacheRef.current.get(part1);
            }
        }
        return undefined;
    };

    // New Batch Prefetch
    const prefetchBatch = async (texts: string[]) => {
        // ... (existing implementation)
        if (!texts || texts.length === 0) return;
        if (!audioGenerator?.generateBatch) return;
        const needed = texts.filter(t => t.trim() && !cacheRef.current.has(t));
        if (needed.length === 0) return;
        console.log("Batch Prefetching:", needed.length, "items");
        const batchPromise = audioGenerator.generateBatch(needed);
        needed.forEach((text, index) => {
            const itemPromise = batchPromise.then(res => {
                if (res && res.audios && res.audios[index]) {
                    return res.audios[index];
                }
                return null;
            });
            cacheRef.current.set(text, itemPromise);
        });
    };

    // New Manual Cache Injection (for Streaming)
    const cacheAudio = (text: string, audioData: string) => {
        if (!text || !audioData) return;
        console.log("Injecting audio into cache:", text.substring(0, 20) + "...");
        cacheRef.current.set(text, Promise.resolve(audioData));
    };

    const prepareText = async (text: string) => {
        setAudioData(undefined); // Clear previous audio immediately
        setIsLoading(true);
        // Clear previous pending states
        hasNextChunkRef.current = false;
        pendingAudioRef.current = null;
        nextStartDataRef.current = null;
        part2TextRef.current = "";

        fullTextRef.current = text;

        let part1 = text;
        let part2 = "";

        // Only split if the generator requests it (e.g., Kokoro)
        if (audioGenerator?.shouldSplitText) {
            const parts = splitFirstSentence(text);
            part1 = parts[0];
            part2 = parts[1];
        }

        console.log("Audio prep:", { shouldSplit: audioGenerator?.shouldSplitText, part1: part1.substring(0, 20) + "...", part2Length: part2.length });

        // Fetch 1st chunk (Check Cache First)
        let audio1: string | null = null;
        if (cacheRef.current.has(part1)) {
            console.log("Using cached audio for:", part1.substring(0, 20) + "...");
            audio1 = await cacheRef.current.get(part1) || null;
            cacheRef.current.delete(part1); // Consume cache
        } else {
            audio1 = await generateChunk(part1);
        }

        if (audio1) {
            const duration1 = calculateDuration(audio1, part1);

            // Stash data for start()
            nextStartDataRef.current = {
                audio: audio1,
                text: part1,
                duration: duration1,
                fullText: text
            };

            // Start 2nd chunk fetch SEQUENTIALLY (after 1st is done)
            if (part2.trim().length > 0) {
                hasNextChunkRef.current = true;
                pendingAudioRef.current = generateChunk(part2);
                part2TextRef.current = part2;
            }
        }

        setIsLoading(false);
    };

    const start = () => {
        // Reset current audio state
        setAudioData(undefined);

        if (nextStartDataRef.current) {
            const { audio, text, duration } = nextStartDataRef.current;

            // Apply state updates to trigger UI and Audio
            setAudioData(audio);
            setVisualText(text);
            setVisualDuration(duration);

            // We expect Typewriter to finish in `duration`. 
            // If there's a second chunk, onAudioComplete will pick it up
        } else {
            // Fallback if preparation failed or was empty
            setVisualText(fullTextRef.current);
            setVisualDuration(1000);
            onSequenceEnd();
        }
    };

    const onAudioComplete = async () => {
        if (hasNextChunkRef.current && pendingAudioRef.current) {
            // We are expecting a second chunk
            hasNextChunkRef.current = false; // Only one extra chunk supported for now

            try {
                const audio2 = await pendingAudioRef.current;
                pendingAudioRef.current = null;

                if (audio2) {
                    setAudioData(audio2);
                    const duration2 = calculateDuration(audio2, part2TextRef.current);

                    // Update visuals for Part 2
                    // We set visualText to FULL text. Typewriter will type extension.
                    setVisualText(fullTextRef.current);
                    setVisualDuration(duration2);

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
        visualText,
        visualDuration,
        prepareText,
        prefetch,
        prefetchBatch,
        cacheAudio,
        start,
        onAudioComplete
    };
};
