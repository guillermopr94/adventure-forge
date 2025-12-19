import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GameSaveData } from '../services/GameService';

export type Screen = 'main_menu' | 'apikey' | 'selection' | 'game';

interface NavigationContextType {
    currentScreen: Screen;
    navigate: (screen: Screen) => void;
    goBack: () => void;
    userToken: string;
    setUserToken: (token: string) => void;
    openaiKey: string;
    setOpenaiKey: (key: string) => void;
    pollinationsToken: string;
    setPollinationsToken: (token: string) => void;
    selectedGenreIndex: number;
    setSelectedGenreIndex: (index: number) => void;
    gameKey: number;
    resetGame: () => void;
    savedGameState: GameSaveData | null;
    setSavedGameState: (data: GameSaveData | null) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Start at main_menu
    const [screenStack, setScreenStack] = useState<Screen[]>(['main_menu']);

    // Initialize from localStorage
    const [userToken, setUserToken] = useState<string>(() => localStorage.getItem("adventure_forge_token") || "");
    const [openaiKey, setOpenaiKey] = useState<string>(() => localStorage.getItem("adventure_forge_openai_key") || "");
    const [pollinationsToken, setPollinationsToken] = useState<string>(() => localStorage.getItem("adventure_forge_pollinations_token") || "");
    const [selectedGenreIndex, setSelectedGenreIndex] = useState<number>(() => {
        const saved = localStorage.getItem("adventure_forge_genre_index");
        return saved ? parseInt(saved, 10) : 0;
    });

    const [savedGameState, setSavedGameState] = useState<GameSaveData | null>(null);

    // Game Reset Mechanism
    const [gameKey, setGameKey] = useState(0);

    const currentScreen = screenStack[screenStack.length - 1];

    // Persistence Effects
    useEffect(() => {
        localStorage.setItem("adventure_forge_token", userToken);
    }, [userToken]);

    useEffect(() => {
        localStorage.setItem("adventure_forge_openai_key", openaiKey);
    }, [openaiKey]);

    useEffect(() => {
        localStorage.setItem("adventure_forge_pollinations_token", pollinationsToken);
    }, [pollinationsToken]);

    useEffect(() => {
        localStorage.setItem("adventure_forge_genre_index", selectedGenreIndex.toString());
    }, [selectedGenreIndex]);

    const navigate = (screen: Screen) => {
        setScreenStack(prev => [...prev, screen]);
    };

    const goBack = () => {
        setScreenStack(prev => {
            if (prev.length > 1) {
                return prev.slice(0, -1);
            }
            return prev;
        });
    };

    const resetGame = () => {
        setGameKey(prev => prev + 1);
    };

    return (
        <NavigationContext.Provider value={{
            currentScreen,
            navigate,
            goBack,
            userToken,
            setUserToken,
            openaiKey,
            setOpenaiKey,
            pollinationsToken,
            setPollinationsToken,
            selectedGenreIndex,
            setSelectedGenreIndex,
            gameKey, // Expose gameKey
            resetGame, // Expose resetGame
            savedGameState,
            setSavedGameState
        }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (context === undefined) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
};

