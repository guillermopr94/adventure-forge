import React, { useEffect } from 'react';
import { useTranslation } from '../language/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '../contexts/NavigationContext';
import { ADVENTURE_TYPES } from '../resources/availableTypes';
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const AdventureSelectionScreen: React.FC = () => {
    const { t } = useTranslation();
    const { setTheme } = useTheme();
    const { navigate, selectedGenreIndex, setSelectedGenreIndex } = useNavigation();

    useEffect(() => {
        // Initialize theme based on current index
        setTheme(ADVENTURE_TYPES[selectedGenreIndex].id);
    }, [selectedGenreIndex, setTheme]);

    const selectedGenre = ADVENTURE_TYPES[selectedGenreIndex];

    function rotateGenre(direction: 'prev' | 'next') {
        if (direction === 'prev') {
            setSelectedGenreIndex(selectedGenreIndex === 0 ? ADVENTURE_TYPES.length - 1 : selectedGenreIndex - 1);
        } else {
            setSelectedGenreIndex(selectedGenreIndex === ADVENTURE_TYPES.length - 1 ? 0 : selectedGenreIndex + 1);
        }
    }

    function startGame() {
        navigate('game');
    }

    return (
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
    );
};

export default AdventureSelectionScreen;
