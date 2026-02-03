
/**
 * Splits text into two parts: the first sentence and the rest of the text.
 * Used to optimize TTS latency by processing the first sentence immediately.
 * 
 * @param text The full text to processing
 * @returns [firstSentence, remainder] - remainder is empty string if text couldn't be split efficiently
 */
export const splitFirstSentence = (text: string): [string, string] => {
    if (!text) return ["", ""];

    // Limits to avoid splitting very short texts or weird artifacts
    if (text.length < 50) return [text, ""];

    // Match the first occurrence of a sentence ending punctuation followed by a space or end of string.
    // We prioritize ., !, ? and maybe newer punctuation.
    // We try to catch "Mr.", "Mrs." simple cases by ensuring a space follows, 
    // but full NLP is overkill here.

    // Regex: 
    // Look for [.!?]
    // A lookahead checking for \s (whitespace) or $ (end of string)
    // We want the shortest match, so we use index lookup.

    const sentEndMatch = text.match(/[.!?](\s|$)/);

    if (sentEndMatch && sentEndMatch.index !== undefined) {
        const splitIndex = sentEndMatch.index + 1; // Include the punctuation

        // Ensure the first part isn't trivially short (e.g. "Oh.") unless it's the whole text
        // If it's very short, it might be better to just grab a bit more, 
        // but "Oh." is a valid sentence to speak. 
        // Let's stick to the split.

        const firstPart = text.substring(0, splitIndex).trim();
        const secondPart = text.substring(splitIndex).trim();

        // If second part is empty, it means we just had one sentence.
        if (!secondPart) return [firstPart, ""];

        return [firstPart, secondPart];
    }

    // Fallback: No punctuation found, return full text
    return [text, ""];
};

export const splitIntoSentences = (text: string): string[] => {
    // Basic sentence splitting using regex
    // Looks for . ! ? followed by space or end of string
    if (!text) return [];
    const segments = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g);
    return segments ? segments.map(s => s.trim()) : [text];
};
