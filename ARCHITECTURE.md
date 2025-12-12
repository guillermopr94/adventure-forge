# Adventure Forge - Architecture Documentation

## Overview
Adventure Forge is a text-based adventure game built with React, leveraging AI (Gemini, Pollinations) for dynamic storytelling, image generation, and audio narration.

This document serves as a map for understanding the codebase structure, intended for both developers and AI agents.

## Core Architecture
The project follows a **View-Common** architecture to separate UI screens from shared logic.

```
src/
├── common/        # Shared resources, logic, and components
└── views/         # Self-contained UI screens
```

## Directory Reference

### 1. `src/views/`
Contains the top-level screens of the application. Each directory here represents a distinct phase or page of the user journey.

*   **`StartScreen/`**: The entry point UI. Contains welcome message and main layout logic.
*   **`ApiKeyInput/`**: Screen for user to input API keys (Google, OpenAI, etc.).
*   **`AdventureSelection/`**: Carousel UI for selecting the game genre/theme.
*   **`Game/`**: The core game loop UI.
    *   `Game.tsx`: Main game logic controller.
    *   `Game.css`: Specific styles for the game view.
    *   `components/`: Sub-components specific *only* to the game (e.g., `Typewriter`).

### 2. `src/common/`
Contains reusable modules available to any view.

*   **`components/`**: Shared UI components.
    *   `BackgroundMusic/`: Component for handling ambient audio.
    *   `TextNarrator/`: Component for TTS text-to-speech.
    *   `modals/`: Global overlays (e.g., `SettingsModal`).
*   **`contexts/`**: React Context definitions for global state.
    *   `NavigationContext`: Handles app routing (simulated SPA navigation) and API key storage.
    *   `SettingsContext`: Manages user preferences (volume, etc.).
*   **`hooks/`**: Custom React hooks.
    *   `useSmartAudio`: Advanced hook for managing AI audio generation and streaming.
*   **`services/`**: logic for external API interactions.
    *   `ai/`: logic for AI providers (AudioGenerator, TextGenerator).
*   **`resources/`**: Static data definitions.
    *   `availableTypes.ts`: Definitions of game genres and their metadata.
*   **`language/`**: Internationalization (i18n).
    *   `LanguageContext`: Provider for translation strings.
    *   `translations.ts`: Dictionary of strings.
*   **`theme/`**: Theming logic.
    *   `themes.ts`: CSS variable definitions for different genres.
*   **`utils/`**: Pure utility functions.
    *   `textSplitter.ts`, `kokoroTTS.ts`, etc.
*   **`config/`**: App-wide configuration constants.

## Navigation Flow
Navigation is managed essentially by `NavigationContext`, not a router library.
1.  **StartScreen** (checks context)
2.  **ApiKeyInput** (if keys missing)
3.  **AdventureSelection** (select genre)
4.  **Game** (play)

## Key Files for AI Agents
*   `src/index.tsx`: App entry point.
*   `src/views/Game/Game.tsx`: If you are looking for "How the game works".
*   `src/common/contexts/NavigationContext.tsx`: If you are looking for "How state/navigation is shared".
*   `src/common/services/`: If you are debugging API calls.

## Design Principles
*   **Modularity**: Views should not import from other views. They should only import from `common`.
*   **Separation**: Logic that doesn't render UI should be in `hooks` or `services`.
*   **Theming**: All colors/fonts should come from `ThemeContext` or CSS variables, never hardcoded.
