
export interface AudioGenerator {
    readonly shouldSplitText: boolean;
    generate(text: string): Promise<string | null>;
    generateBatch?(texts: string[]): Promise<{ audios: (string | null)[] } | null>;
}
