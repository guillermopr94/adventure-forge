import React from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LanguageProvider } from "./common/language/LanguageContext";
import { ThemeProvider } from "./common/theme/ThemeContext";
import { AuthProvider } from "./common/contexts/AuthContext";
import StartScreen from "./views/StartScreen/StartScreen";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID_HERE";

const container = document.getElementById("game-layout");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <StartScreen />
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
}
