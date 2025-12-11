
import { TextGenerator } from "./TextGenerator";
import { executeWithFallback } from "./FallbackUtils";

export class FallbackGenerator implements TextGenerator {
    private generators: TextGenerator[];

    constructor(generators: TextGenerator[]) {
        this.generators = generators;
    }

    async generate(prompt: string, history: any[]): Promise<string> {
        return executeWithFallback(
            this.generators,
            (generator) => generator.generate(prompt, history),
            "TextFallback"
        );
    }
}
