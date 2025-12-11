import React from "react";
import Game from "../game/Game";
import { useTranslation } from "../language/LanguageContext";
import "./StartScreen.css";

import { ADVENTURE_TYPES } from "../resources/availableTypes";
import { NavigationProvider, useNavigation } from "../contexts/NavigationContext";
import ApiKeyScreen from "../screens/ApiKeyScreen";
import AdventureSelectionScreen from "../screens/AdventureSelectionScreen";


const StartScreen = (): React.ReactElement => {
    return (
        <NavigationProvider>
            <StartScreenContent />
        </NavigationProvider>
    );
};

const StartScreenContent = (): React.ReactElement => {
    const { currentScreen, userToken, selectedGenreIndex, navigate } = useNavigation();
    const { t } = useTranslation();
    const selectedGenre = ADVENTURE_TYPES[selectedGenreIndex];

    return (
        <div className="App">
            {currentScreen !== 'game' ? (
                <div className="start-screen-container">
                    <div id="welcome-message">{t("welcome")}</div>
                    {currentScreen === 'apikey' && <ApiKeyScreen />}
                    {currentScreen === 'selection' && <AdventureSelectionScreen />}
                </div>
            ) : (
                <Game userToken={userToken} gameType={t(selectedGenre.id)} genreKey={selectedGenre.id} />
            )}
        </div>
    );
};

export default StartScreen;
