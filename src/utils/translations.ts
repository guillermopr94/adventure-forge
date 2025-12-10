export interface Translations {
    [language: string]: {
        [key: string]: string;
    };
}

const translations = {
    en: {
        welcome: "Welcome to AdventureForge",
        game_history_content:
            "You are the Game Master of a Choose Your Own Adventure game set in {gameType}. Your goal is to create an immersive and engaging story. For every turn, provide a vivid but concise description of the current situation (max 1 short paragraph, approx 60-80 words) and exactly three distinct choices for the player to continue. \n\nIMPORTANT FORMATTING RULES:\n1. Always provide exactly 3 numbered options.\n2. Do not include any text after the options.\n3. Keep the story moving forward fast.\n4. After 5-7 turns, bring the story to a thrilling conclusion and end your response with 'end of adventure'.\n\nStart the adventure now with a captivating but concise introduction.",
        adventure_start: "Beginning of the {gameType} adventure",
        game_end: "end of adventure",
        game_restart: "The adventure has ended. Restart to forge a new path.",
        intro_prompt: "Start the adventure in {gameType}. Set the scene concisely (max 80 words) and give me 3 options.",
        choose_option: "Choose an option...",
        genre_fantasy: "Fantasy",
        genre_scifi: "Sci-Fi",
        genre_horror: "Horror",
        genre_superheroes: "Superheroes",
        genre_romance: "Romance",
        fantasy: "a high fantasy universe like Dungeons & Dragons",
        scifi: "a futuristic Sci-Fi universe like Star Wars",
        horror: "a terrifying Lovecraftian horror universe",
        superheroes: "a superhero universe like Marvel or DC",
        romance: "a romantic drama universe",
        play: "Start Adventure",
        loadingText: "Forging your destiny...",
        reset: "New Adventure",
        select_genre: "Select your Adventure",
        enter_token: "Enter your Google AI Studio API Key"
    },
    es: {
        welcome: "Bienvenido a AdventureForge",
        game_history_content:
            "Eres el Game Master de un juego de 'Elige tu propia aventura' ambientado en {gameType}. Tu objetivo es crear una historia inmersiva y emocionante. En cada turno, proporciona una descripción vívida pero concisa de la situación actual (máximo 1 párrafo corto, aprox 60-80 palabras) y exactamente tres opciones distintas para que el jugador continúe.\n\nREGLAS DE FORMATO IMPORTANTES:\n1. Proporciona siempre exactamente 3 opciones numeradas.\n2. No incluyas texto después de las opciones.\n3. Mantén la historia avanzando rápido.\n4. Después de 5-7 turnos, lleva la historia a una conclusión emocionante y termina tu respuesta con 'fin de la aventura'.\n\nComienza la aventura ahora con una introducción cautivadora pero breve.",
        adventure_start: "Comienzo de la aventura {gameType}",
        game_end: "fin de la aventura",
        game_restart: "Fin del juego. Reinicia para jugar de nuevo.",
        intro_prompt: "Comienza la aventura en {gameType}. Establece la escena de forma concisa (máx 80 palabras) y dame 3 opciones.",
        choose_option: "Elige una opción...",
        genre_fantasy: "Fantasía",
        genre_scifi: "Ciencia Ficción",
        genre_horror: "Terror",
        genre_superheroes: "Superhéroes",
        genre_romance: "Romance",
        fantasy: "un universo de fantasía épica como Dragones y Mazmorras",
        scifi: "un universo de ciencia ficción futurista como Star Wars",
        horror: "un universo de terror lovecraftiano",
        superheroes: "un universo de superhéroes como Marvel o DC",
        romance: "un universo de drama romántico",
        play: "Comenzar Aventura",
        loadingText: "Forjando tu destino...",
        reset: "Nueva Aventura",
        select_genre: "Elige tu Aventura",
        enter_token: "Introduce tu API Key de Google AI Studio"
    },
};

export default translations;