import { TextGenerator } from "./TextGenerator";

export class PollinationsGenerator implements TextGenerator {
    private token?: string;
    private onUnauthorized?: () => void;

    constructor(token?: string, onUnauthorized?: () => void) {
        this.token = token;
        this.onUnauthorized = onUnauthorized;
    }

    async generate(prompt: string, history: any[]): Promise<string> {
        try {
            console.log("PollinationsGenerator: Generating...");

            let fullPrompt = "";
            history.forEach(msg => {
                const text = msg.parts ? msg.parts[0].text : "";
                fullPrompt += `${msg.role === 'user' ? 'User' : 'Model'}: ${text}\n`;
            });
            fullPrompt += `User: ${prompt}\nModel:`;

            const encodedPrompt = encodeURIComponent(fullPrompt);
            let url = "";

            if (this.token) {
                url = `https://gen.pollinations.ai/text/${encodedPrompt}?key=${this.token}`;
            } else {
                url = `https://text.pollinations.ai/${encodedPrompt}`;
            }

            const headers: HeadersInit = {};
            if (this.token) {
                headers['Authorization'] = `Bearer ${this.token}`;
            }

            const response = await fetch(url, { headers });

            if (response.status === 401 || response.status === 403) {
                console.warn("PollinationsGenerator Unauthorized. Clearing token.");
                if (this.onUnauthorized) this.onUnauthorized();
            }

            if (!response.ok) throw new Error(`Pollinations API error: ${response.statusText}`);

            const text = await response.text();
            if (!text) throw new Error("Empty response from Pollinations");

            return text;

        } catch (error: any) {
            console.warn("PollinationsGenerator failed:", error.message || error);
            throw error;
        }
    }
}
