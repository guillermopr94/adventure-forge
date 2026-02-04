import React, { useEffect, useState } from 'react';
import { useAuth } from '../../common/contexts/AuthContext';
import { useNavigation } from '../../common/contexts/NavigationContext';
import { GameService } from '../../common/services/GameService';
import { useTranslation } from '../../common/language/LanguageContext';
import './MainMenu.css';
import { ADVENTURE_TYPES, AdventureGenre } from '../../common/resources/availableTypes';
import { useTheme } from '../../common/theme/ThemeContext';
import LoadGameModal from './LoadGameModal';

const MainMenu: React.FC = () => {
    const { user, token } = useAuth();
    const { navigate, setSavedGameState, setSelectedGenreIndex } = useNavigation();
    const { t } = useTranslation();
    const { setTheme } = useTheme();
    const [hasSave, setHasSave] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);

    useEffect(() => {
        if (user?.googleId) {
            checkSave();
        }
    }, [user]);

    const checkSave = async () => {
        if (!user || !token) return;
        setIsLoading(true);
        // We just check if there are ANY games to show the button
        const saves = await GameService.listGames(token);
        if (saves && saves.length > 0) {
            setHasSave(true);
            // Optionally set theme from the latest save?
            // Let's stick to the latest one for the menu theme
            const latest = saves[0];
            if (latest.genreKey) {
                setTheme(latest.genreKey as AdventureGenre);
            }
        }
        setIsLoading(false);
    };

    const startNewGame = () => {
        setSavedGameState(null); // Clear any load state
        navigate('selection');
    };

    const onSelectLoadGame = async (saveId: string, genreKey: string) => {
        if (!user || !token) return;
        setIsLoading(true);
        const save = await GameService.loadGame(token, saveId);
        if (save) {
            setSavedGameState(save);
            // Ensure theme is set for game as well (though Game.tsx does it too)
            const genreIndex = ADVENTURE_TYPES.findIndex(g => g.id === genreKey);
            if (genreIndex >= 0) setSelectedGenreIndex(genreIndex);

            navigate('game');
        }
        setIsLoading(false);
        setShowLoadModal(false);
    };

    return (
        <div className="main-menu fade-in">
            {/* Title is handled by parent or header */}
            <div className="menu-buttons">
                <button className="menu-btn primary" onClick={startNewGame}>
                    {t('new_adventure') || "New Adventure"}
                </button>

                {user && hasSave && (
                    <button className="menu-btn secondary" onClick={() => setShowLoadModal(true)} disabled={isLoading}>
                        {isLoading ? "Loading..." : (t('continue_adventure') || "Load Game")}
                    </button>
                )}
            </div>

            {!user && <p className="guest-hint">Login to save your progress</p>}

            {showLoadModal && (
                <LoadGameModal
                    onClose={() => setShowLoadModal(false)}
                    onLoadGame={onSelectLoadGame}
                />
            )}
        </div>
    );
};

export default MainMenu;
