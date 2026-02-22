# PRP: Issue #162 - Fix Infinite Loading & Stream Resilience

## Phase 1: Stream Timeout & Error Propagation
### 🎯 Objective
Prevent infinite loading by adding timeouts and ensuring errors are correctly handled and displayed.

### 🛠 Implementation Tasks
1.  **Modify `useGameStream.ts`**:
    *   Add a 30-second timeout to the `startStream` function.
    *   Ensure the timeout aborts the request and triggers a "Timeout Error".
    *   Normalize error messages sent to `onEvent`.
2.  **Update `Game.tsx`**:
    *   Ensure `isInitialTurnLoading` and `isProcessing` are reset to `false` when an error occurs.
    *   Verify `StreamErrorState` is triggered correctly.

### 🧪 Validation (TDD)
1.  **Unit Test**: Update `useGameStream.test.ts` to verify timeout behavior.
2.  **Manual Test**: Simulate a slow/hanging stream by modifying the API URL locally or using a proxy.
3.  **Build**: `npm run build` to ensure no regressions.

### 📁 Files Affected
- `src/common/hooks/useGameStream.ts`
- `src/views/Game/Game.tsx`
- `src/common/hooks/useGameStream.test.ts`
