import React, { useState } from "react";
import Game from "../game/Game";
import { useTranslation } from "../language/LanguageContext";
import LanguageSelector from "../language/LanguageSelector";
import "./StartScreen.css";

const StartScreen = (): React.ReactElement => {
    const [step, setStep] = useState<'apikey' | 'selection' | 'game'>('apikey');
    const [userToken, setUserToken] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("fantasy");
    const { t, setLanguage } = useTranslation();

    function handleTokenChange(event: React.ChangeEvent<HTMLInputElement>) {
        setUserToken(event.target.value);
    }

    function handleGenreSelect(genre: string) {
        setSelectedGenre(genre);
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

    // Limpiar el array de utterances
    window.utterances = [];
    speechSynthesis.cancel();

    const genres = ['fantasy', 'scifi', 'horror', 'superheroes', 'romance'];

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
                            <div className="genre-selection">
                                <h3>{t("select_genre")}</h3>
                                <div className="genre-cards">
                                    {genres.map((genre) => (
                                        <div
                                            key={genre}
                                            className={`genre-card ${selectedGenre === genre ? 'selected' : ''}`}
                                            onClick={() => handleGenreSelect(genre)}
                                        >
                                            <div className="genre-icon"></div>
                                            <div className="genre-name">{t(genre).split(' ')[0] + '...'}</div>
                                        </div>
                                    ))}
                                </div>
                                <p className="selected-genre-description">{t(selectedGenre)}</p>
                                <button className="modern-button start-game-btn" onClick={startGame}>{t("play")}</button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <Game userToken={userToken} gameType={t(selectedGenre)} genreKey={selectedGenre} />
            )}
        </div>
    );
};

export default StartScreen;
