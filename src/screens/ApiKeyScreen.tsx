import React from 'react';
import { useTranslation } from '../language/LanguageContext';
import LanguageSelector from '../language/LanguageSelector';
import { useNavigation } from '../contexts/NavigationContext';

const ApiKeyScreen: React.FC = () => {
    const { t, setLanguage } = useTranslation();
    const { userToken, setUserToken, navigate } = useNavigation();

    function handleTokenChange(event: React.ChangeEvent<HTMLInputElement>) {
        setUserToken(event.target.value);
    }

    function handleTokenSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (userToken.trim() !== "") {
            navigate('selection');
        }
    }

    return (
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
    );
};

export default ApiKeyScreen;
