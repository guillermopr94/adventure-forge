import React from "react";
import Game from "../game/Game";
import { useTranslation } from "../language/LanguageContext";
import "./StartScreen.css";

import { ADVENTURE_TYPES } from "../resources/availableTypes";
import { NavigationProvider, useNavigation } from "../contexts/NavigationContext";
import ApiKeyScreen from "../screens/ApiKeyScreen";
import AdventureSelectionScreen from "../screens/AdventureSelectionScreen";


import { SettingsProvider, useSettings } from "../contexts/SettingsContext";
import SettingsModal from "../components/SettingsModal/SettingsModal";
import { IoSettingsSharp } from "react-icons/io5";

const StartScreen = (): React.ReactElement => {
    return (
        <NavigationProvider>
            <SettingsProvider>
                <StartScreenContent />
            </SettingsProvider>
        </NavigationProvider>
    );
};

const StartScreenContent = (): React.ReactElement => {
    const { currentScreen, userToken, openaiKey, selectedGenreIndex, gameKey } = useNavigation();
    const { setShowSettings } = useSettings();
    const { t } = useTranslation();
    const selectedGenre = ADVENTURE_TYPES[selectedGenreIndex];

    return (
        <div className="App">
            {/* Global Settings Button */}
            <button
                className="settings-trigger-btn"
                onClick={() => setShowSettings(true)}
                title={t('settings') || "Settings"}
            >
                <IoSettingsSharp size={30} color="white" />
            </button>

            <SettingsModal />

            {currentScreen !== 'game' ? (
                <div className="start-screen-container">
                    <div id="welcome-message">{t("welcome")}</div>
                    {/* ApiKeyScreen is effectively skipped by NavigationContext default, but kept for legacy or explicit nav if needed */}
                    {currentScreen === 'apikey' && <ApiKeyScreen />}
                    {currentScreen === 'selection' && <AdventureSelectionScreen />}
                </div>
            ) : (
                <Game
                    key={gameKey} // Force remount on reset
                    userToken={userToken}
                    openaiKey={openaiKey}
                    gameType={t(selectedGenre.id)}
                    genreKey={selectedGenre.id}
                />
            )}
        </div>
    );
};

export default StartScreen;
