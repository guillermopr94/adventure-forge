/**
 * Resilient execution wrapper with exponential retry.
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    options: { retries: number; baseDelay: number; name: string } = { retries: 3, baseDelay: 1000, name: 'Operation' }
): Promise<T> {
    let lastError: any;
    for (let i = 0; i < options.retries; i++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;
            
            // Check if error is retryable (Network errors or 429/5xx)
            const status = error.response?.status || error.status;
            const isRetryable = !status || status === 429 || status >= 500 || 
                               error.message?.toLowerCase().includes('network') || 
                               error.message?.toLowerCase().includes('timeout') ||
                               error.code === 'ECONNABORTED';
            
            if (!isRetryable || i === options.retries - 1) {
                throw error;
            }

            const delay = options.baseDelay * Math.pow(2, i);
            console.warn(`[Resilience] ${options.name} failed (attempt ${i + 1}/${options.retries}). Retrying in ${delay}ms... Error: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}
