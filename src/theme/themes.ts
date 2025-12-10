import { AdventureGenre } from '../resources/availableTypes';

export interface AdventureTheme {
    primaryColor: string;
    secondaryColor: string;
    bgGradient: string;
    fontHeading: string;
    fontBody: string;
    textColor: string;
    panelBg: string;
    buttonGradient: string;
}

export const themes: Record<AdventureGenre, AdventureTheme> = {
    [AdventureGenre.FANTASY]: {
        primaryColor: '#ffd700',
        secondaryColor: '#8b4513',
        bgGradient: 'radial-gradient(circle at center, #2e1a0f 0%, #1a0f0a 100%)',
        fontHeading: "'IM Fell English', serif",
        fontBody: "'IM Fell English', serif",
        textColor: '#e8dcb5',
        panelBg: 'rgba(46, 26, 15, 0.85)',
        buttonGradient: 'linear-gradient(to bottom right, #785623 0%, #553e1c 100%)'
    },
    [AdventureGenre.SCIFI]: {
        primaryColor: '#00d4ff',
        secondaryColor: '#005bea',
        bgGradient: 'radial-gradient(circle at center, #0f1c30 0%, #050a14 100%)',
        fontHeading: "'Orbitron', sans-serif",
        fontBody: "'Roboto', sans-serif",
        textColor: '#e0f7fa',
        panelBg: 'rgba(15, 28, 48, 0.85)',
        buttonGradient: 'linear-gradient(45deg, #00d4ff, #005bea)'
    },
    [AdventureGenre.HORROR]: {
        primaryColor: '#ff0000',
        secondaryColor: '#4a0000',
        bgGradient: 'radial-gradient(circle at center, #1a0505 0%, #000000 100%)',
        fontHeading: "'Creepster', cursive", // Assuming Creepster or similar is available or fallback
        fontBody: "'Roboto', sans-serif",
        textColor: '#ffcccc',
        panelBg: 'rgba(26, 5, 5, 0.85)',
        buttonGradient: 'linear-gradient(to bottom, #8b0000, #300000)'
    },
    [AdventureGenre.SUPERHEROES]: {
        primaryColor: '#ffcc00', // Comic yellow
        secondaryColor: '#e62429', // Marvel red
        bgGradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', // Blue metallic
        fontHeading: "'Bangers', cursive", // Comic style
        fontBody: "'Roboto', sans-serif",
        textColor: '#ffffff',
        panelBg: 'rgba(30, 60, 114, 0.9)',
        buttonGradient: 'linear-gradient(45deg, #e62429, #f78f3f)'
    },
    [AdventureGenre.ROMANCE]: {
        primaryColor: '#ff69b4',
        secondaryColor: '#ffb6c1',
        bgGradient: 'radial-gradient(circle at center, #3a1c2a 0%, #1a0b12 100%)',
        fontHeading: "'Great Vibes', cursive", // Elegant script
        fontBody: "'Lato', sans-serif",
        textColor: '#fff0f5',
        panelBg: 'rgba(58, 28, 42, 0.85)',
        buttonGradient: 'linear-gradient(to right, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)'
    }
};
