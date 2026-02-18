import { createContext, useContext, useState, useEffect } from 'react';
import languageBundles, { Language } from '../utils/translations';

const LanguageContext = createContext<{
    language: string;
    setLanguage: React.Dispatch<React.SetStateAction<string>>;
}>({
    language: 'en',
    setLanguage: () => { },
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

// Crea un hook personalizado llamado "useTranslation"
export function useTranslation() {
    const { language, setLanguage } = useContext(LanguageContext);
    const [currentTranslations, setCurrentTranslations] = useState(languageBundles[language as Language]);

    useEffect(() => {
        setCurrentTranslations(languageBundles[language as Language]);
    }, [language]);

    const t = (key: string, variables?: { [key: string]: any }) => {
        if (!currentTranslations) {
            console.error(`Translation bundle not loaded for language: ${language}`);
            return `[MISSING BUNDLE: ${language}] ${key}`;
        }
        
        let text = currentTranslations[key];

        if (!text) {
            console.warn(`Missing translation key: ${key} in language: ${language}`);
            // Fallback to English if not English
            if (language !== 'en' && languageBundles['en'][key]) {
                text = languageBundles['en'][key];
            } else {
                return `[MISSING: ${key}]`;
            }
        }

        if (variables) {
            for (const variable in variables) {
                text = text.replace(`{${variable}}`, String(variables[variable]));
            }
        }

        return text;
    };

    return {
        t,
        language, // Expose language
        setLanguage,
    };
}
