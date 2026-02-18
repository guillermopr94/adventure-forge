import { StreamEvent } from './useGameStream';

/**
 * Robust SSE message extractor.
 * Handles split chunks, multiple messages, and malformed lines.
 */
export const processSSEBuffer = (
    buffer: string, 
    onEvent: (event: StreamEvent) => void
): string => {
    // SSE chunks can be split by \n\n (standard) or single \n (lines within event)
    // We strictly look for \n\n as the boundary of a "message block"
    let boundary = buffer.indexOf('\n\n');
    
    while (boundary !== -1) {
        const block = buffer.substring(0, boundary).trim();
        buffer = buffer.substring(boundary + 2);

        // A block might contain multiple lines (id, event, data, retry)
        // We only care about 'data:' lines for this implementation
        const lines = block.split('\n');
        
        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('data: ')) {
                try {
                    const jsonStr = line.substring(6).trim();
                    if (jsonStr) {
                        const event = JSON.parse(jsonStr) as StreamEvent;
                        onEvent(event);
                    }
                } catch (e) {
                    // Critical improvement: Log but don't crash the loop
                    console.error("Failed to parse SSE JSON block:", line, e);
                }
            }
        }
        
        boundary = buffer.indexOf('\n\n');
    }

    return buffer; // Return remaining partial block
};
