import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextType {
    showSettings: boolean;
    setShowSettings: (show: boolean) => void;
    musicVolume: number;
    setMusicVolume: (volume: number) => void;
    sfxVolume: number;
    setSfxVolume: (volume: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [showSettings, setShowSettings] = useState(false);
    // Initialize from localStorage or default
    const [musicVolume, setMusicVolume] = useState(() => {
        const saved = localStorage.getItem("adventure_forge_music_volume");
        return saved ? parseFloat(saved) : 0.3;
    });
    const [sfxVolume, setSfxVolume] = useState(() => {
        const saved = localStorage.getItem("adventure_forge_sfx_volume");
        return saved ? parseFloat(saved) : 1.0;
    });

    // Persistence
    React.useEffect(() => {
        localStorage.setItem("adventure_forge_music_volume", musicVolume.toString());
    }, [musicVolume]);

    React.useEffect(() => {
        localStorage.setItem("adventure_forge_sfx_volume", sfxVolume.toString());
    }, [sfxVolume]);

    return (
        <SettingsContext.Provider value={{
            showSettings,
            setShowSettings,
            musicVolume,
            setMusicVolume,
            sfxVolume,
            setSfxVolume
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error("useSettings must be used within SettingsProvider");
    return context;
};
