import React, { useState } from 'react';
import './SettingsModal.css';
import { useSettings } from '../../contexts/SettingsContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { useTranslation } from '../../language/LanguageContext';
import { IoClose, IoHome } from 'react-icons/io5';
import { ADVENTURE_TYPES } from '../../resources/availableTypes';

const SettingsModal: React.FC = () => {
    const { showSettings, setShowSettings, musicVolume, setMusicVolume, sfxVolume, setSfxVolume } = useSettings();
    const {
        userToken, setUserToken,
        openaiKey, setOpenaiKey,
        pollinationsToken, setPollinationsToken,
        selectedGenreIndex,
        navigate
    } = useNavigation();
    const { t, setLanguage, language } = useTranslation();

    const [activeTab, setActiveTab] = useState<'general' | 'system'>('general');

    if (!showSettings) return null;

    const handleBackToHome = () => {
        // Go back to selection screen
        navigate('selection');
        setShowSettings(false);
        // We might want to stop specific game logic here if needed, 
        // but navigating away usually unmounts Game component.
    };



    // Get current genre style
    // Get current genre style
    const selectedGenre = ADVENTURE_TYPES[selectedGenreIndex];
    const themeColor = selectedGenre?.color || '#ffffff';
    const textColor = selectedGenre?.textColor || '#ffffff';

    // Dynamic styles based on genre
    const modalStyle: React.CSSProperties = {
        fontFamily: selectedGenre?.font || 'inherit',
        border: `2px solid ${themeColor}`,
        boxShadow: `0 0 20px ${themeColor}80`
    };

    const headerStyle: React.CSSProperties = {
        background: `linear-gradient(90deg, transparent, ${themeColor}33, transparent)`,
        color: textColor
    };

    const getLanguageButtonStyle = (langCode: string) => {
        const isActive = language === langCode;
        return {
            border: `1px solid ${isActive ? themeColor : 'rgba(255, 255, 255, 0.3)'}`,
            backgroundColor: isActive ? themeColor : 'transparent',
            color: isActive ? '#000000' : 'white',
            fontWeight: isActive ? 'bold' : 'normal',
            transition: 'all 0.3s',
            boxShadow: isActive ? `0 0 10px ${themeColor}80` : 'none'
        };
    };

    return (
        <div className="settings-overlay">
            <div className="settings-modal glass-panel" style={modalStyle}>
                <div className="settings-header" style={headerStyle}>
                    <h2 style={{ textShadow: '2px 2px 4px black', margin: 0 }}>{t('settings')}</h2>
                    <button onClick={() => setShowSettings(false)} className="close-button">
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="settings-tabs">
                    <button
                        className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                        style={activeTab === 'general' ? { borderBottomColor: themeColor } : {}}
                    >
                        General
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'system' ? 'active' : ''}`}
                        onClick={() => setActiveTab('system')}
                        style={activeTab === 'system' ? { borderBottomColor: themeColor } : {}}
                    >
                        System
                    </button>
                </div>

                <div className="settings-content">
                    {activeTab === 'general' && (
                        <div className="tab-content fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="setting-group">
                                <label>{t('music_volume')} ({Math.round(musicVolume * 100)}%)</label>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.01"
                                    value={musicVolume}
                                    onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                                    className="volume-slider"
                                    style={{ accentColor: themeColor }}
                                />
                            </div>

                            <div className="setting-group">
                                <label>{t('narrator_volume')} ({Math.round(sfxVolume * 100)}%)</label>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.01"
                                    value={sfxVolume}
                                    onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                                    className="volume-slider"
                                    style={{ accentColor: themeColor }}
                                />
                            </div>

                            <div className="setting-group">
                                <label>{t('language')}</label>
                                <div className="language-selector">
                                    <button
                                        onClick={() => setLanguage('en')}
                                        className="lang-btn"
                                        style={getLanguageButtonStyle('en')}
                                    >
                                        🇺🇸 English
                                    </button>
                                    <button
                                        onClick={() => setLanguage('es')}
                                        className="lang-btn"
                                        style={getLanguageButtonStyle('es')}
                                    >
                                        🇪🇸 Español
                                    </button>
                                </div>
                            </div>

                            <div className="setting-actions row">
                                <button onClick={handleBackToHome} className="action-btn" style={{ borderColor: themeColor }}>
                                    <IoHome size={20} /> {t('new_game')}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div className="tab-content fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="setting-group">
                                <label>{t('google_api_key_label')}</label>
                                <input
                                    type="password"
                                    value={userToken}
                                    onChange={(e) => setUserToken(e.target.value)}
                                    placeholder="AIza..."
                                    className="modern-input"
                                />
                            </div>

                            <div className="setting-group">
                                <label>{t('openai_api_key_label')}</label>
                                <input
                                    type="password"
                                    value={openaiKey}
                                    onChange={(e) => setOpenaiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="modern-input"
                                />
                            </div>

                            <div className="setting-group">
                                <label>{t('pollinations_token_label')}</label>
                                <input
                                    type="password"
                                    value={pollinationsToken}
                                    onChange={(e) => setPollinationsToken(e.target.value)}
                                    placeholder="Optional"
                                    className="modern-input"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default SettingsModal;
