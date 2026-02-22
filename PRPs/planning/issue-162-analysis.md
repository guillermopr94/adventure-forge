# Analysis: Issue #162 - Infinite Loading on Game Start

## Root Cause Analysis
The issue occurs when the `/game/stream` endpoint fails to deliver data or the frontend fails to process it correctly. 
- `useGameStream` lacks a timeout mechanism.
- If the stream connection is established but no data is sent, the UI stays in `isInitialTurnLoading` state indefinitely.
- The `Stream Error: undefined` logged in the console suggests that the error object in `handleStreamEvent` is not being populated correctly or the event structure from the hook is missing the `error` field.

## Code Audit
### `useGameStream.ts`
- Uses `withRetry` for the initial connection, which is good.
- The `while(true)` loop for reading the stream has no timeout.
- The `catch` block handles `AbortError` but other errors might not be propagating the message correctly to `onEvent`.

### `Game.tsx`
- `isInitialTurnLoading` is set to `true` in `startGame` and `sendChoice`.
- It's only set to `false` in `handleStreamEvent` when a `text_structure` event is received (with a 2s delay) or an `image` event for the current index is received.
- If the stream fails or stalls before these events, the spinner never disappears.
- `StreamErrorState` is only shown if `streamError` from the hook is truthy.

## Proposed Fixes
1. **Add Timeout to `useGameStream`**: Implement a 30s timeout that aborts the stream and triggers an error.
2. **Improve Error Object**: Ensure the `error` event always contains a string message.
3. **Frontend Resilience**: Ensure `setIsInitialTurnLoading(false)` is called in the `error` branch of `handleStreamEvent`.
4. **Validation**: Test the timeout and error handling.
