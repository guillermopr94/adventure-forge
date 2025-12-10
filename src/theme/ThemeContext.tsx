import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes, AdventureTheme } from './themes';
import { AdventureGenre } from '../resources/availableTypes';

interface ThemeContextType {
    theme: AdventureGenre;
    setTheme: (theme: AdventureGenre) => void;
    currentTheme: AdventureTheme;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: AdventureGenre.FANTASY,
    setTheme: () => { },
    currentTheme: themes[AdventureGenre.FANTASY]
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [theme, setTheme] = useState<AdventureGenre>(AdventureGenre.FANTASY);

    useEffect(() => {
        const activeTheme = themes[theme] || themes[AdventureGenre.FANTASY];
        const root = document.documentElement;

        root.style.setProperty('--primary-color', activeTheme.primaryColor);
        root.style.setProperty('--secondary-color', activeTheme.secondaryColor);
        root.style.setProperty('--bg-gradient', activeTheme.bgGradient);
        root.style.setProperty('--font-heading', activeTheme.fontHeading);
        root.style.setProperty('--font-body', activeTheme.fontBody);
        root.style.setProperty('--text-color', activeTheme.textColor);
        root.style.setProperty('--panel-bg', activeTheme.panelBg);
        root.style.setProperty('--button-gradient', activeTheme.buttonGradient);

    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, currentTheme: themes[theme] || themes[AdventureGenre.FANTASY] }}>
            {children}
        </ThemeContext.Provider>
    );
};
