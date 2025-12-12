import React, { useRef, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

interface BackgroundMusicProps {
    audioFile: string;
}

const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ audioFile }) => {
    const { musicVolume } = useSettings();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.loop = true;
            try {
                audioRef.current.volume = musicVolume;
                audioRef.current.play().catch(e => console.log("Autoplay blocked or waiting for interaction", e));
            } catch (e) {
                console.warn("Audio error", e);
            }
        }
    }, [audioFile]); // Re-run if file changes

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = musicVolume;
        }
    }, [musicVolume]);

    return (
        <div style={{ display: 'none' }}>
            <audio ref={audioRef} src={audioFile} />
        </div>
    );
};

export default BackgroundMusic;
