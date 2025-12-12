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

import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from "../../common/contexts/AuthContext";

// ... previous imports

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
    const { login, user, logout } = useAuth();
    const selectedGenre = ADVENTURE_TYPES[selectedGenreIndex];

    return (
        <div className="App">
            {/* Global Settings Button */}
            <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: '10px', zIndex: 100 }}>
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
                        <img src={user.picture} alt="Profile" style={{ width: 30, height: 30, borderRadius: '50%' }} />
                        <span>{user.firstName}</span>
                        <button onClick={logout} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '5px', cursor: 'pointer' }}>Logout</button>
                    </div>
                ) : (
                    <GoogleLogin
                        onSuccess={credentialResponse => {
                            if (credentialResponse.credential) {
                                login(credentialResponse.credential);
                            }
                        }}
                        onError={() => {
                            console.log('Login Failed');
                        }}
                        useOneTap
                        theme="filled_black"
                        shape="pill"
                    />
                )}
                <button
                    className="settings-trigger-btn"
                    onClick={() => setShowSettings(true)}
                    title={t('settings') || "Settings"}
                    style={{ position: 'static' }}
                >
                    <IoSettingsSharp size={30} color="white" />
                </button>
            </div>

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
