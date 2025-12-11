
import { GoogleGenAI } from "@google/genai";
import { TextGenerator } from "./TextGenerator";

export class GeminiGenerator implements TextGenerator {
    private client: any;
    private modelName: string;

    constructor(apiKey: string, modelName: string) {
        this.client = new GoogleGenAI({ apiKey });
        this.modelName = modelName;
    }

    async generate(prompt: string, history: any[]): Promise<string> {
        try {
            console.log(`GeminiGenerator: Generating with model ${this.modelName}...`);

            // Construct prompt from history for context
            let fullPrompt = "";
            history.forEach(msg => {
                const text = msg.parts ? msg.parts[0].text : "";
                fullPrompt += `${msg.role === 'user' ? 'User' : 'Model'}: ${text}\n`;
            });
            fullPrompt += `User: ${prompt}\nModel:`;

            const response = await this.client.models.generateContent({
                model: this.modelName,
                contents: fullPrompt,
                config: {
                    temperature: 0.7,
                }
            });

            const text = response.text;
            if (!text) throw new Error("Empty response from Gemini");

            return text;
        } catch (error: any) {
            console.warn(`GeminiGenerator (${this.modelName}) failed:`, error.message || error);
            throw error;
        }
    }
}
