
import { AudioGenerator } from "../AudioGenerator";
import { generateKokoroAudio } from "../../../utils/kokoroTTS";

export class KokoroTTS implements AudioGenerator {
    private language: string;
    private genreKey: string;
    public readonly shouldSplitText = true;

    constructor(language: string, genreKey: string) {
        this.language = language;
        this.genreKey = genreKey;
    }

    async generate(text: string): Promise<string | null> {
        try {
            console.log("KokoroTTS: Generating audio...");
            const audioData = await generateKokoroAudio(text, this.language, this.genreKey);
            if (!audioData) throw new Error("Kokoro returned empty audio");
            return audioData; // Already base64
        } catch (error: any) {
            console.warn("KokoroTTS failed:", error.message || error);
            throw error;
        }
    }
}
