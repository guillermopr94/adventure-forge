import { AudioGenerator } from "../AudioGenerator";

export class GeminiTTS implements AudioGenerator {
    private apiKey: string;
    private onUnauthorized?: () => void;
    public readonly shouldSplitText = false;
    private baseUrl: string = "http://localhost:3001/ai/audio";

    constructor(apiKey: string, onUnauthorized?: () => void) {
        this.apiKey = apiKey;
        this.onUnauthorized = onUnauthorized;
    }

    async generate(text: string): Promise<string | null> {
        try {
            console.log("GeminiTTS: Generating audio via Backend...");

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-google-api-key': this.apiKey
                },
                body: JSON.stringify({
                    text,
                    provider: 'gemini',
                    voice: 'Kore' // Default voice, can be ignored by backend if strict
                })
            });

            if (response.status === 403 || response.status === 401) {
                console.warn("Gemini Unauthorized (Backend). Clearing key.");
                if (this.onUnauthorized) this.onUnauthorized();
                throw new Error("Unauthorized");
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Backend Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            if (!data.audio) throw new Error("Backend returned no audio data");

            return data.audio; // Base64 string
        } catch (error: any) {
            console.warn("GeminiTTS failed:", error.message || error);
            throw error;
        }
    }
}
