
export interface TextGenerator {
    generate(prompt: string, history: any[]): Promise<string>;
}
