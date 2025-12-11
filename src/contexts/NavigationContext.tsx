import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ADVENTURE_TYPES } from '../resources/availableTypes';

export type Screen = 'apikey' | 'selection' | 'game';

interface NavigationContextType {
    currentScreen: Screen;
    navigate: (screen: Screen) => void;
    goBack: () => void;
    userToken: string;
    setUserToken: (token: string) => void;
    selectedGenreIndex: number;
    setSelectedGenreIndex: (index: number) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [screenStack, setScreenStack] = useState<Screen[]>(['apikey']);
    const [userToken, setUserToken] = useState<string>("");
    const [selectedGenreIndex, setSelectedGenreIndex] = useState<number>(0);

    const currentScreen = screenStack[screenStack.length - 1];

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
