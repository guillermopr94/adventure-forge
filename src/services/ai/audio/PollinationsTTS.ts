import { AudioGenerator } from "../AudioGenerator";
import { AdventureGenre } from "../../../resources/availableTypes";

export class PollinationsTTS implements AudioGenerator {
    private voice: string;
    private genre: string;
    public readonly shouldSplitText = false;

    private token?: string;
    private onUnauthorized?: () => void;

    constructor(voice: string = "alloy", genre: string = "fantasy", token?: string, onUnauthorized?: () => void) {
        this.voice = voice;
        this.genre = genre;
        this.token = token;
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

    private getStyleInstructions(genre: string): string {
        switch (genre.toLowerCase()) {
            case AdventureGenre.FANTASY:
                return "Voice: Grand Storyteller. Tone: Epic, magical, and immersive. Delivery: Paced, dramatic, and clear. Pronunciation: Clear and distinct.";
            case AdventureGenre.SCIFI:
                return "Voice: AI Interface. Tone: Analytical, futuristic, and precise. Delivery: Clean, slightly processed, and rapid but clear.";
            case AdventureGenre.HORROR:
                return "Voice: Narrator of Dread. Tone: Ominous, whispering, and suspenseful. Delivery: Slow, deliberate, and terrifying.";
            case AdventureGenre.SUPERHEROES:
                return "Voice: Action Narrator. Tone: Heroic, urgent, and energetic. Delivery: Dynamic, punchy, and impactful.";
            case AdventureGenre.ROMANCE:
                return "Voice: Intimate Narrator. Tone: Soft, emotional, and warm. Delivery: Gentle, smooth, and heartfelt.";
            default:
                return "Voice: Clear Narrator. Tone: Engaging and natural.";
        }
    }

    async generate(text: string): Promise<string | null> {
        try {
            console.log("PollinationsTTS: Generating audio via GET with instructions...");

            const instructions = this.getStyleInstructions(this.genre);
            // Construct prompt: Instructions + Command to read text
            const prompt = `${instructions} Say exactly this: ${text}`;

            const encodedText = encodeURIComponent(prompt);
            let url = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=${this.voice}`;

            if (this.token) {
                url += `&key=${this.token}`;
            }

            const response = await fetch(url);

            if (response.status === 401 || response.status === 403) {
                console.warn("Pollinations Unauthorized. Clearing token.");
                if (this.onUnauthorized) this.onUnauthorized();
            }

            if (!response.ok) throw new Error(`Pollinations TTS error: ${response.statusText}`);

            const blob = await response.blob();

            // Convert Blob to Base64 using FileReader (Browser compatible)
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        // Get base64 content only
                        resolve(reader.result.split(',')[1]);
                    } else {
                        reject(new Error("Failed to convert blob to base64 string"));
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error: any) {
            console.warn("PollinationsTTS GET failed:", error.message || error);
            throw error;
        }
    }
}
