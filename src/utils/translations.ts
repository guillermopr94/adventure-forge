export interface Translations {
    [language: string]: {
        [key: string]: string;
    };
}

const translations = {
    en: {
        welcome: "Welcome to AdventureForge",
        game_history_content:
            "You are the Game Master of a Choose Your Own Adventure game set in {gameType}. Your goal is to create an immersive and engaging story. For every turn, provide a vivid description of the current situation (about 2-3 paragraphs) and exactly three distinct choices for the player to continue. \n\nIMPORTANT FORMATTING RULES:\n1. Always provide exactly 3 numbered options.\n2. Do not include any text after the options.\n3. Keep the story moving forward.\n4. After 5-7 turns, bring the story to a thrilling conclusion and end your response with 'end of adventure'.\n\nStart the adventure now with a captivating introduction.",
        adventure_start: "Beginning of the {gameType} adventure",
        game_end: "end of adventure",
        game_restart: "The adventure has ended. Restart to forge a new path.",
        intro_prompt: "Start the adventure in {gameType}. Set the scene and give me 3 options.",
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
            "Eres el Game Master de un juego de 'Elige tu propia aventura' ambientado en {gameType}. Tu objetivo es crear una historia inmersiva y emocionante. En cada turno, proporciona una descripción vívida de la situación actual (unos 2-3 párrafos) y exactamente tres opciones distintas para que el jugador continúe.\n\nREGLAS DE FORMATO IMPORTANTES:\n1. Proporciona siempre exactamente 3 opciones numeradas.\n2. No incluyas texto después de las opciones.\n3. Mantén la historia avanzando.\n4. Después de 5-7 turnos, lleva la historia a una conclusión emocionante y termina tu respuesta con 'fin de la aventura'.\n\nComienza la aventura ahora con una introducción cautivadora.",
        adventure_start: "Comienzo de la aventura {gameType}",
        game_end: "fin de la aventura",
        game_restart: "Fin del juego. Reinicia para jugar de nuevo.",
        intro_prompt: "Comienza la aventura en {gameType}. Establece la escena y dame 3 opciones.",
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