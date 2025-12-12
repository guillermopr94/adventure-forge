import { TextGenerator } from "./TextGenerator";

export class PollinationsGenerator implements TextGenerator {
    private token?: string;
    private onUnauthorized?: () => void;
    private baseUrl: string = "http://localhost:3001/ai/text";

    constructor(token?: string, onUnauthorized?: () => void) {
        this.token = token;
        this.onUnauthorized = onUnauthorized;
    }

    async generate(prompt: string, history: any[]): Promise<string> {
        try {
            console.log("PollinationsGenerator: Generating via Backend...");

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
                    prompt,
                    history,
                    provider: 'pollinations'
                })
            });

            if (response.status === 401 || response.status === 403) {
                console.warn("PollinationsGenerator Unauthorized. Clearing token.");
                if (this.onUnauthorized) this.onUnauthorized();
            }

            if (!response.ok) throw new Error(`Backend Error: ${response.status} - ${response.statusText}`);

            const data = await response.json();
            if (!data.text) throw new Error("Empty response from Backend");

            return data.text;

        } catch (error: any) {
            console.warn("PollinationsGenerator failed:", error.message || error);
            throw error;
        }
    }
}
