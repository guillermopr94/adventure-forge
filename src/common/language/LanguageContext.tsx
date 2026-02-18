import { createContext, useContext, useState, useEffect } from 'react';
import translations from '../utils/translations';

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
    const [currentTranslations, setCurrentTranslations] = useState(translations[language]);

    useEffect(() => {
        setCurrentTranslations(translations[language]);
    }, [language]);

    const t = (key: string, variables?: { [key: string]: any }) => {
        if (!currentTranslations) {
            console.error(`Translation bundle not loaded for language: ${language}`);
            return key;
        }
        let text = currentTranslations[key];

        if (!text) {
            console.warn(`Missing translation key: ${key} in language: ${language}`);
            // Fallback to English if not Spanish
            if (language !== 'en' && translations['en'][key]) {
                text = translations['en'][key];
            } else {
                return key;
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
