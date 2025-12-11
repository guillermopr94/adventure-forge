import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Screen = 'apikey' | 'selection' | 'game';

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
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [screenStack, setScreenStack] = useState<Screen[]>(['apikey']);

    // Initialize from localStorage
    const [userToken, setUserToken] = useState<string>(() => localStorage.getItem("adventure_forge_token") || "");
    const [openaiKey, setOpenaiKey] = useState<string>(() => localStorage.getItem("adventure_forge_openai_key") || "");
    const [pollinationsToken, setPollinationsToken] = useState<string>(() => localStorage.getItem("adventure_forge_pollinations_token") || "");
    const [selectedGenreIndex, setSelectedGenreIndex] = useState<number>(() => {
        const saved = localStorage.getItem("adventure_forge_genre_index");
        return saved ? parseInt(saved, 10) : 0;
    });

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
            setSelectedGenreIndex
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
