import React from "react";
import Game from "../Game/Game";
import { useTranslation } from "../../common/language/LanguageContext";
import "./StartScreen.css";

import { ADVENTURE_TYPES } from "../../common/resources/availableTypes";
import { NavigationProvider, useNavigation } from "../../common/contexts/NavigationContext";
import AdventureSelectionScreen from "../AdventureSelection/AdventureSelectionScreen";


import { SettingsProvider, useSettings } from "../../common/contexts/SettingsContext";
import SettingsModal from "../../common/components/modals/SettingsModal/SettingsModal";
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
