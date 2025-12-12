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
}

export const ADVENTURE_TYPES: AdventureType[] = [
    {
        id: AdventureGenre.FANTASY,
        icon: fantasyIcon,
        music: process.env.PUBLIC_URL + "/music/fantasy.m4a"
    },
    {
        id: AdventureGenre.SCIFI,
        icon: scifiIcon,
        music: process.env.PUBLIC_URL + "/music/scifi.m4a"
    },
    {
        id: AdventureGenre.HORROR,
        icon: horrorIcon,
        music: process.env.PUBLIC_URL + "/music/horror.m4a"
    },
    {
        id: AdventureGenre.SUPERHEROES,
        icon: superheroesIcon,
        music: process.env.PUBLIC_URL + "/music/superheroes.m4a"
    },
    {
        id: AdventureGenre.ROMANCE,
        icon: romanceIcon,
        music: process.env.PUBLIC_URL + "/music/romance.m4a"
    }
];

export const getAdventureType = (id: string | AdventureGenre): AdventureType => {
    return ADVENTURE_TYPES.find(type => type.id === id) || ADVENTURE_TYPES[0];
};
