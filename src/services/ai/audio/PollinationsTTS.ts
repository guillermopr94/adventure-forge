import { AudioGenerator } from "../AudioGenerator";
import { AdventureGenre } from "../../../resources/availableTypes";
import { config } from "../../../config";

export class PollinationsTTS implements AudioGenerator {
    private voice: string;
    private genre: string;
    public readonly shouldSplitText = false;
    private baseUrl: string = `${config.apiUrl}/ai/audio`;

    private token?: string;
    private onUnauthorized?: () => void;

    constructor(voice: string = "alloy", genre: string = "fantasy", token?: string, onUnauthorized?: () => void) {
        this.voice = voice;
        this.genre = genre;
        this.token = token; // Can be undefined
        this.onUnauthorized = onUnauthorized;
    }

    static getOpenAIVoiceForGenre(genre: string): string {
        switch (genre.toLowerCase()) {
            case AdventureGenre.FANTASY: return "fable";
            case AdventureGenre.SCIFI: return "nova"; // or alloy
            case AdventureGenre.HORROR: return "onyx";
            case AdventureGenre.SUPERHEROES: return "echo"; // or shimmer
            case AdventureGenre.ROMANCE: return "shimmer";
            default: return "alloy";
        }
    }

    async generate(text: string): Promise<string | null> {
        try {
            console.log("PollinationsTTS: Generating audio via Backend...");

            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };

            if (this.token) {
                headers['x-pollinations-token'] = this.token;
            }

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    text,
                    provider: 'pollinations',
                    voice: this.voice,
                    genre: this.genre
                })
            });

            if (response.status === 403 || response.status === 401) {
                console.warn("Pollinations Unauthorized (Backend). Clearing key.");
                if (this.onUnauthorized) this.onUnauthorized();
                // We don't throw immediately, maybe we can fallback?
                // But generally error is thrown.
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Backend Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            if (!data.audio) throw new Error("Backend returned no audio data");

            return data.audio; // Base64
        } catch (error: any) {
            console.warn("PollinationsTTS failed:", error.message || error);
            throw error;
        }
    }
}
