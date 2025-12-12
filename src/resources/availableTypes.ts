import scifiIcon from '../assets/adventure-icons/scifi.png';
import superheroesIcon from '../assets/adventure-icons/superheroes.png';
import fantasyIcon from '../assets/adventure-icons/fantasy.png';
import romanceIcon from '../assets/adventure-icons/romance.png';
import horrorIcon from '../assets/adventure-icons/horror.png';

export enum AdventureGenre {
    FANTASY = 'fantasy',
    SCIFI = 'scifi',
    HORROR = 'horror',
    SUPERHEROES = 'superheroes',
    ROMANCE = 'romance'
}

export interface AdventureType {
    id: AdventureGenre;
    icon: string;
    music: string;
    className?: string; // Kept for legacy CSS classes
    font?: string;      // Specific font family
    color?: string;     // Accent color (borders, active tabs)
    textColor?: string; // Text color (headers)
}

export const ADVENTURE_TYPES: AdventureType[] = [
    {
        id: AdventureGenre.FANTASY,
        icon: fantasyIcon,
        music: process.env.PUBLIC_URL + "/music/fantasy.m4a",
        className: "fantasyTheme",
        font: "'Cinzel', serif",
        color: "#ffd700",
        textColor: "#f0e6d2"
    },
    {
        id: AdventureGenre.SCIFI,
        icon: scifiIcon,
        music: process.env.PUBLIC_URL + "/music/scifi.m4a",
        className: "scifiTheme",
        font: "'Orbitron', sans-serif",
        color: "#00ff9d",
        textColor: "#e0faff"
    },
    {
        id: AdventureGenre.HORROR,
        icon: horrorIcon,
        music: process.env.PUBLIC_URL + "/music/horror.m4a",
        className: "horrorTheme",
        font: "'Creepster', cursive", // Or a scary serif
        color: "#ff3333",
        textColor: "#ffdddd"
    },
    {
        id: AdventureGenre.SUPERHEROES,
        icon: superheroesIcon,
        music: process.env.PUBLIC_URL + "/music/superheroes.m4a",
        className: "superheroesTheme",
        font: "'Bangers', cursive", // Comic style
        color: "#00ccff",
        textColor: "#ffffff"
    },
    {
        id: AdventureGenre.ROMANCE,
        icon: romanceIcon,
        music: process.env.PUBLIC_URL + "/music/romance.m4a",
        className: "romanceTheme",
        font: "'Dancing Script', cursive",
        color: "#ff66b2",
        textColor: "#fff0f5"
    }
];

export const getAdventureType = (id: string | AdventureGenre): AdventureType => {
    return ADVENTURE_TYPES.find(type => type.id === id) || ADVENTURE_TYPES[0];
};
