
export async function generateKokoroAudio(text: string, lang: string, genre: string): Promise<string | null> {
    const url = "https://willyfox94-kokoro-tts-api.hf.space/tts";
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                lang: lang.substring(0, 2).toLowerCase(),
                genre: genre.toLowerCase()
            })
        });

        if (!response.ok) {
            console.warn(`Kokoro TTS API error: ${response.status}`);
            return null;
        }

        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                // Get base64 content
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = () => {
                console.error("Error reading blob");
                resolve(null);
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Kokoro TTS network error:", error);
        return null;
    }
}
