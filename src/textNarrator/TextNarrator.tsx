import React, { useState, useRef, useEffect } from 'react';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';

interface TextNarratorProps {
    text: string;
    voice?: SpeechSynthesisVoice;
    audioData?: string; // Base64 audio data (PCM)
    isLoadingAudio?: boolean; // New prop to signal that audio is being fetched
    onComplete?: () => void;
}

const TextNarrator: React.FC<TextNarratorProps> = ({ text, voice, audioData, isLoadingAudio, onComplete }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [volume, setVolume] = useState(1);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Helper to convert base64 to ArrayBuffer
    const base64ToArrayBuffer = (base64: string) => {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    // Helper to create WAV header
    const createWavHeader = (dataLength: number, sampleRate: number = 24000, numChannels: number = 1, bitsPerSample: number = 16) => {
        const header = new ArrayBuffer(44);
        const view = new DataView(header);

        const writeString = (view: DataView, offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
        view.setUint16(32, numChannels * (bitsPerSample / 8), true);
        view.setUint16(34, bitsPerSample, true);
        writeString(view, 36, 'data');
        view.setUint32(40, dataLength, true);

        return header;
    };

    // Helper to identify WAV header
    const hasWavHeader = (buffer: ArrayBuffer) => {
        if (buffer.byteLength < 44) return false;
        const view = new DataView(buffer);
        // Check for 'RIFF' at start (0x52494646) and 'WAVE' at offset 8 (0x57415645)
        // IDs are big-endian in the file, but DataView checks endianness depending on flag.
        // Actually ASCII chars are single bytes so endianness doesn't matter for the byte sequence if reading byte by byte.
        // But reading as Uint32 requires care.
        // 'R' 'I' 'F' 'F' is 0x52 0x49 0x46 0x46
        return (
            view.getUint8(0) === 0x52 &&
            view.getUint8(1) === 0x49 &&
            view.getUint8(2) === 0x46 &&
            view.getUint8(3) === 0x46 &&
            view.getUint8(8) === 0x57 &&
            view.getUint8(9) === 0x41 &&
            view.getUint8(10) === 0x56 &&
            view.getUint8(11) === 0x45
        );
    };

    // Helper to identify MP3 header (ID3 or Frame Sync)
    const isMp3 = (buffer: ArrayBuffer) => {
        if (buffer.byteLength < 3) return false;
        const view = new DataView(buffer);
        // Check for ID3 tag (ID3)
        if (view.getUint8(0) === 0x49 && view.getUint8(1) === 0x44 && view.getUint8(2) === 0x33) {
            return true;
        }
        // Check for frame sync (approximate, usually FFFB or FFF3)
        // This is less reliable without parsing, but sufficient for common mismatch
        if (view.getUint16(0) >= 0xFFE0) {
            return true;
        }
        return false;
    };

    // Effect for Audio
    useEffect(() => {
        if (audioData) {
            // Stop any existing speech synthesis
            speechSynthesis.cancel();

            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            try {
                const audioBuffer = base64ToArrayBuffer(audioData);
                let blobParts: BlobPart[] = [];
                let mimeType = 'audio/wav';

                if (hasWavHeader(audioBuffer)) {
                    blobParts = [audioBuffer];
                } else if (isMp3(audioBuffer)) {
                    blobParts = [audioBuffer];
                    mimeType = 'audio/mpeg';
                } else {
                    // Assume raw PCM 16-bit 24kHz mono (Kokoro default?)
                    const wavHeader = createWavHeader(audioBuffer.byteLength);
                    blobParts = [wavHeader, audioBuffer];
                }

                const audioBlob = new Blob(blobParts, { type: mimeType });
                const audioUrl = URL.createObjectURL(audioBlob);

                const audio = new Audio(audioUrl);
                audio.volume = volume;
                audio.onended = () => {
                    onComplete && onComplete();
                };
                audioRef.current = audio;

                if (!isMuted) {
                    audio.play().catch(e => console.error("Error playing audio:", e));
                }
            } catch (e) {
                console.error("Error processing audio data:", e);
                // If error, trigger complete safely?
                onComplete && onComplete();
            }

        } else if (voice && !isLoadingAudio) {
            // Fallback to speech synthesis if no audioData but voice is present AND we are not waiting for audio
            speak(text, voice, volume);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.onended = null; // Cleanup
            }
            speechSynthesis.cancel();
        };
    }, [audioData, text, voice, isLoadingAudio]); // Re-run if audioData or isLoadingAudio changes

    // Update volume for active audio
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);


    const splitTextIntoChunks = (text: string, maxChunkSize: number) => {
        const words = text.split(' ');
        const chunks = [];
        let currentChunk = '';

        words.forEach(word => {
            if (currentChunk.length + word.length <= maxChunkSize) {
                currentChunk += ' ' + word;
                if (word.slice(-1) === '.') {
                    chunks.push(currentChunk.trim());
                    currentChunk = '';
                }
            } else {
                chunks.push(currentChunk.trim());
                currentChunk = word;
            }
        });

        if (currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    };

    const speak = (text: string, voice: SpeechSynthesisVoice, volume: number) => {
        if (audioData) return; // Don't speak if we have audio data

        window.utterances = [];
        speechSynthesis.cancel();
        const maxChunkSize = 120;
        const textChunks = splitTextIntoChunks(text, maxChunkSize);

        const speakChunk = (index: number) => {
            if (index < textChunks.length) {
                const utterance = new SpeechSynthesisUtterance(textChunks[index]);
                utterance.voice = voice;
                utterance.volume = volume;
                window.utterances.push(utterance);

                utterance.onend = () => {
                    speakChunk(index + 1);
                };

                speechSynthesis.speak(utterance);
            } else {
                // All chunks finished
                onComplete && onComplete();
            }
        };

        speakChunk(0);
    };

    const handleToggleMute = () => {
        if (showVolumeSlider) {
            setIsMuted(!isMuted);
            if (audioRef.current) {
                if (!isMuted) { // If we are muting
                    audioRef.current.pause();
                } else { // If we are unmuting
                    audioRef.current.play().catch(e => console.error(e));
                }
            } else {
                if (isMuted) {
                    speechSynthesis.resume();
                } else {
                    speechSynthesis.pause();
                }
            }

        } else {
            setShowVolumeSlider(true);
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            setShowVolumeSlider(false);
        }
    };

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(event.target.value);
        setVolume(newVolume);

        if (!audioData && voice) {
            speechSynthesis.cancel();
            speak(text, voice, newVolume);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={containerRef} style={{ display: 'inline-block', position: 'relative' }}>
            <button onClick={handleToggleMute} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                {isMuted ? <FiVolumeX color="white" size={35} /> : <FiVolume2 color="white" size={35} />}
            </button>
            {showVolumeSlider && (
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    style={{
                        position: 'absolute',
                        right: '45%',
                        bottom: 'calc(100% + 40px)',
                        width: '100px',
                        transform: 'translateX(50%) rotate(-90deg)',
                        cursor: 'pointer',
                        zIndex: 1000,
                    }}
                />
            )}
        </div>
    );
};

export default TextNarrator;