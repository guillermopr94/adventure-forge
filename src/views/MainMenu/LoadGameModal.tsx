import React, { useEffect, useState } from 'react';
import { GameService, GameSaveDTO } from '../../common/services/GameService';
import { useAuth } from '../../common/contexts/AuthContext';
import { useTranslation } from '../../common/language/LanguageContext';
import { ADVENTURE_TYPES } from '../../common/resources/availableTypes';
import { FiTrash2, FiPlay, FiX } from 'react-icons/fi';
import './LoadGameModal.css';

interface LoadGameModalProps {
    onClose: () => void;
    onLoadGame: (saveId: string, genreKey: string) => void;
}

const LoadGameModal: React.FC<LoadGameModalProps> = ({ onClose, onLoadGame }) => {
    const { user, token } = useAuth();
    const { t } = useTranslation();
    const [saves, setSaves] = useState<GameSaveDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSaves();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadSaves = async () => {
        if (!user?.googleId || !token) return;
        setIsLoading(true);
        const list = await GameService.listGames(token);
        setSaves(list);
        setIsLoading(false);
    };

    const handleDelete = async (saveId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user?.googleId || !token) return;
        if (window.confirm("Are you sure you want to delete this save?")) {
            await GameService.deleteGame(token, saveId);
            loadSaves(); // Reload list
        }
    };

    if (!user) return null;

    return (
        <div className="modal-overlay fade-in">
            <div className="modal-content load-game-modal">
                <button className="close-btn" onClick={onClose}><FiX /></button>
                <h2>{t('continue_adventure') || "Load Game"}</h2>

                {isLoading ? (
                    <div className="loading-spinner">Loading saves...</div>
                ) : saves.length === 0 ? (
                    <p className="no-saves">No saved games found.</p>
                ) : (
                    <div className="saves-list">
                        {saves.map(save => {
                            const genre = ADVENTURE_TYPES.find(g => g.id === save.genreKey);
                            return (
                                <div key={save._id} className="save-item" onClick={() => onLoadGame(save._id, save.genreKey)}>
                                    <div className="save-icon">
                                        <img src={genre?.icon || "https://img.icons8.com/dusk/64/question-mark.png"} alt={save.genreKey} />
                                    </div>
                                    <div className="save-details">
                                        <span className="save-genre">{t('genre_' + save.genreKey) || save.genreKey}</span>
                                        <span className="save-date">{new Date(save.updatedAt).toLocaleString()}</span>
                                    </div>
                                    <div className="save-actions">
                                        <button className="action-btn play" onClick={() => onLoadGame(save._id, save.genreKey)}>
                                            <FiPlay />
                                        </button>
                                        <button className="action-btn delete" onClick={(e) => handleDelete(save._id, e)}>
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoadGameModal;
