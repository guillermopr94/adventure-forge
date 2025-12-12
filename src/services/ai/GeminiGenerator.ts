import { TextGenerator } from "./TextGenerator";

export class GeminiGenerator implements TextGenerator {
    private apiKey: string;
    private modelName: string;
    private onUnauthorized?: () => void;
    private baseUrl: string = "http://localhost:3001/ai/text";

    constructor(apiKey: string, modelName: string, onUnauthorized?: () => void) {
        this.apiKey = apiKey;
        this.modelName = modelName;
        this.onUnauthorized = onUnauthorized;
    }

    async generate(prompt: string, history: any[]): Promise<string> {
        try {
            console.log(`GeminiGenerator: Generating with model ${this.modelName} via Backend...`);

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-google-api-key': this.apiKey
                },
                body: JSON.stringify({
                    prompt,
                    history,
                    provider: 'gemini',
                    model: this.modelName
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
            if (!data.text) throw new Error("Empty response from Backend");

            return data.text;
        } catch (error: any) {
            console.warn(`GeminiGenerator (${this.modelName}) failed:`, error.message || error);
            throw error;
        }
    }
}
