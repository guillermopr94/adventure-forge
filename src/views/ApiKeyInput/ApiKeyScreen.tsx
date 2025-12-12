import React from 'react';
import { useTranslation } from '../../common/language/LanguageContext';
import LanguageSelector from '../../common/language/LanguageSelector';
import { useNavigation } from '../../common/contexts/NavigationContext';

const ApiKeyScreen: React.FC = () => {
    const { t, setLanguage } = useTranslation();
    const {
        userToken,
        setUserToken,
        openaiKey,
        setOpenaiKey,
        pollinationsToken,
        setPollinationsToken,
        navigate
    } = useNavigation();

    function handleTokenChange(event: React.ChangeEvent<HTMLInputElement>) {
        setUserToken(event.target.value);
    }

    function handleOpenAiTokenChange(event: React.ChangeEvent<HTMLInputElement>) {
        setOpenaiKey(event.target.value);
    }

    function handlePollinationsTokenChange(event: React.ChangeEvent<HTMLInputElement>) {
        setPollinationsToken(event.target.value);
    }

    function handleTokenSubmit(event: React.FormEvent) {
        event.preventDefault();
        // if (userToken.trim() !== "") {
        navigate('selection');
        // }
    }

    return (
        <div className="step-container fade-in">
            <div className="token-form-container">
                <h3>{t("enter_token")}</h3>
                <form onSubmit={handleTokenSubmit} id="token-form" className="token-form">
                    <input
                        type="text"
                        value={userToken}
                        onChange={handleTokenChange}
                        placeholder="Google API Key"
                        // required
                        className="modern-input"
                    />
                    <input
                        type="text"
                        value={openaiKey}
                        onChange={handleOpenAiTokenChange}
                        placeholder="OpenAI API Key (Optional)"
                        className="modern-input"
                        style={{ marginTop: '10px' }}
                    />
                    <input
                        type="text"
                        value={pollinationsToken}
                        onChange={handlePollinationsTokenChange}
                        placeholder="Pollinations Token (Optional)"
                        className="modern-input"
                        style={{ marginTop: '10px' }}
                    />
                    <button className="modern-button" type="submit">{t("next") || "Next"}</button>
                </form>
                <div className="language-selector-container">
                    <LanguageSelector onLanguageChange={setLanguage} />
                </div>
            </div>
        </div>
    );
};

export default ApiKeyScreen;
