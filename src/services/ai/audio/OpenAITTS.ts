import { AudioGenerator } from "../AudioGenerator";
import { PollinationsTTS } from "./PollinationsTTS";

export class OpenAITTS implements AudioGenerator {
    private apiKey: string;
    private voice: string;
    private onUnauthorized?: () => void;
    public readonly shouldSplitText = false;

    constructor(apiKey: string, genreKey: string, onUnauthorized?: () => void) {
        this.apiKey = apiKey;
        // Reuse mapping from Pollinations since it maps to standard OpenAI voices
        this.voice = PollinationsTTS.getOpenAIVoiceForGenre(genreKey);
        this.onUnauthorized = onUnauthorized;
    }

    async generate(text: string): Promise<string | null> {
        if (!this.apiKey) throw new Error("OpenAI API Key missing");

        try {
            console.log("OpenAITTS: Generating audio...");
            const response = await fetch("https://api.openai.com/v1/audio/speech", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "tts-1",
                    input: text,
                    voice: this.voice,
                }),
            });

            if (response.status === 401) {
                console.warn("OpenAI Unauthorized. Clearing key.");
                if (this.onUnauthorized) this.onUnauthorized();
                throw new Error("OpenAI Invalid API Key (401)");
            }

            if (!response.ok) {
                throw new Error(`OpenAI TTS Error: ${response.status} ${response.statusText}`);
            }

            const blob = await response.blob();

            // Convert Blob to Base64
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        resolve(reader.result.split(',')[1]);
                    } else {
                        reject(new Error("Failed to convert OpenAI blob to base64"));
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

        } catch (error) {
            console.error("OpenAITTS generation failed:", error);
            throw error; // Propagate error for fallback
        }
    }
}
