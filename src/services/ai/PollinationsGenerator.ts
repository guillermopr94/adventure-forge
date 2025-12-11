
import { TextGenerator } from "./TextGenerator";

export class PollinationsGenerator implements TextGenerator {
    async generate(prompt: string, history: any[]): Promise<string> {
        try {
            console.log("PollinationsGenerator: Generating...");

            // Construct prompt from history for context, similar to Gemini but for a simple endpoint
            // Pollinations text API typically accepts a straightforward prompt or chat structure.
            // Assuming a simple GET/POST to https://text.pollinations.ai/

            let fullPrompt = "";
            history.forEach(msg => {
                const text = msg.parts ? msg.parts[0].text : "";
                fullPrompt += `${msg.role === 'user' ? 'User' : 'Model'}: ${text}\n`;
            });
            fullPrompt += `User: ${prompt}\nModel:`;

            const encodedPrompt = encodeURIComponent(fullPrompt);
            // Using a random seed to vary responses slightly if needed, though text might not use it the same way as images.
            // The text API usually works as https://text.pollinations.ai/{prompt}

            const url = `https://text.pollinations.ai/${encodedPrompt}`;

            const response = await fetch(url);
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
