import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes, AdventureTheme } from './themes';

interface ThemeContextType {
    theme: string;
    setTheme: (theme: string) => void;
    currentTheme: AdventureTheme;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'fantasy',
    setTheme: () => { },
    currentTheme: themes['fantasy']
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [theme, setTheme] = useState('fantasy');

    useEffect(() => {
        const activeTheme = themes[theme] || themes['fantasy'];
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
        <ThemeContext.Provider value={{ theme, setTheme, currentTheme: themes[theme] || themes['fantasy'] }}>
            {children}
        </ThemeContext.Provider>
    );
};
