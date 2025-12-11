
/**
 * Executes an action on a list of items sequentially until one succeeds.
 * @param items List of service providers (generators).
 * @param action Callback to execute on each item. Should return a Promise.
 * @param logPrefix Optional prefix for log messages.
 * @returns The result of the first successful execution.
 * @throws The error from the last item if all fail.
 */
export async function executeWithFallback<T, R>(
    items: T[],
    action: (item: T) => Promise<R>,
    logPrefix: string = "FallbackUtils"
): Promise<R> {
    let lastError: any;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        try {
            console.log(`${logPrefix}: Trying provider ${i + 1}/${items.length}...`);
            return await action(item);
        } catch (error: any) {
            console.warn(`${logPrefix}: Provider ${i + 1} failed:`, error.message || error);
            lastError = error;
            // Continue to next item
        }
    }

    console.error(`${logPrefix}: All providers failed.`);
    throw lastError || new Error(`${logPrefix}: All services failed.`);
}
