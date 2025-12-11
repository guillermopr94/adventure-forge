
export interface AudioGenerator {
    readonly shouldSplitText: boolean;
    generate(text: string): Promise<string | null>;
}
