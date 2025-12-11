
import { AudioGenerator } from "../AudioGenerator";
import { executeWithFallback } from "../FallbackUtils";

export class AudioFallback implements AudioGenerator {
    private generators: AudioGenerator[];

    constructor(generators: AudioGenerator[]) {
        this.generators = generators;
    }

    get shouldSplitText(): boolean {
        // Use the preference of the primary (first) generator
        return this.generators.length > 0 ? this.generators[0].shouldSplitText : false;
    }

    async generate(text: string): Promise<string | null> {
        return executeWithFallback(
            this.generators,
            (generator) => generator.generate(text),
            "AudioFallback"
        );
    }
}
