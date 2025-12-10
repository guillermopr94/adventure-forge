import React, { useState, useEffect } from "react";
import Game from "../game/Game";
import { useTranslation } from "../language/LanguageContext";
import LanguageSelector from "../language/LanguageSelector";
import { useTheme } from "../theme/ThemeContext";
import "./StartScreen.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import { ADVENTURE_TYPES } from "../resources/availableTypes";


const StartScreen = (): React.ReactElement => {
    const [step, setStep] = useState<'apikey' | 'selection' | 'game'>('apikey');
    const [userToken, setUserToken] = useState("");
    const { t, setLanguage } = useTranslation();
    const { setTheme } = useTheme();

    const [currentGenreIndex, setCurrentGenreIndex] = useState(0);

    useEffect(() => {
        // Initialize theme based on current index
        setTheme(ADVENTURE_TYPES[currentGenreIndex].id);
    }, [currentGenreIndex, setTheme]);

    function handleTokenChange(event: React.ChangeEvent<HTMLInputElement>) {
        setUserToken(event.target.value);
    }

    function handleTokenSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (userToken.trim() !== "") {
            setStep('selection');
        }
    }

    function startGame() {
        setStep('game');
    }

    function rotateGenre(direction: 'prev' | 'next') {
        if (direction === 'prev') {
            setCurrentGenreIndex((prev) => (prev === 0 ? ADVENTURE_TYPES.length - 1 : prev - 1));
        } else {
            setCurrentGenreIndex((prev) => (prev === ADVENTURE_TYPES.length - 1 ? 0 : prev + 1));
        }
    }

    // Limpiar el array de utterances
    window.utterances = [];
    speechSynthesis.cancel();

    const selectedGenre = ADVENTURE_TYPES[currentGenreIndex];

    return (
        <div className="App">
            {step !== 'game' ? (
                <div className="start-screen-container">
                    <div id="welcome-message">{t("welcome")}</div>

                    {step === 'apikey' && (
                        <div className="step-container fade-in">
                            <div className="token-form-container">
                                <h3>{t("enter_token")}</h3>
                                <form onSubmit={handleTokenSubmit} id="token-form">
                                    <input
                                        type="text"
                                        value={userToken}
                                        onChange={handleTokenChange}
                                        placeholder="Google API Key"
                                        required
                                        className="modern-input"
                                    />
                                    <button className="modern-button" type="submit">{t("next") || "Next"}</button>
                                </form>
                                <div className="language-selector-container">
                                    <LanguageSelector onLanguageChange={setLanguage} />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'selection' && (
                        <div className="step-container fade-in">
                            <div className="genre-selection-carousel">
                                <h3>{t("select_genre")}</h3>

                                <div className="carousel-container">
                                    <button className="carousel-nav prev" onClick={() => rotateGenre('prev')}>
                                        <FiChevronLeft size={40} />
                                    </button>

                                    <div className="selected-genre-display">
                                        <div className="genre-card large selected">
                                            <img src={selectedGenre.icon} alt={selectedGenre.id} className="genre-icon" />
                                            <div className="genre-name">{t('genre_' + selectedGenre.id)}</div>
                                        </div>
                                    </div>

                                    <button className="carousel-nav next" onClick={() => rotateGenre('next')}>
                                        <FiChevronRight size={40} />
                                    </button>
                                </div>

                                <p className="selected-genre-description">{t(selectedGenre.id)}</p>
                                <button className="modern-button start-game-btn" onClick={startGame}>{t("play")}</button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <Game userToken={userToken} gameType={t(selectedGenre.id)} genreKey={selectedGenre.id} />
            )}
        </div>
    );
};

export default StartScreen;
