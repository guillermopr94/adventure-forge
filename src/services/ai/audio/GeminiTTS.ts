
import { AudioGenerator } from "../AudioGenerator";
import { GoogleGenAI } from "@google/genai";

export class GeminiTTS implements AudioGenerator {
    private client: any;
    public readonly shouldSplitText = false;

    constructor(apiKey: string) {
        this.client = new GoogleGenAI({ apiKey });
    }

    async generate(text: string): Promise<string | null> {
        try {
            console.log("GeminiTTS: Generating audio...");
            const response = await this.client.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: text }] }],
                config: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });

            const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!data) throw new Error("Gemini TTS returned no audio data");

            return data;
        } catch (error: any) {
            console.warn("GeminiTTS failed:", error.message || error);
            throw error;
        }
    }
}
