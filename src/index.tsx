import React from "react";
import ReactDOM from "react-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LanguageProvider } from "./common/language/LanguageContext";
import { ThemeProvider } from "./common/theme/ThemeContext";
import { AuthProvider } from "./common/contexts/AuthContext";
import StartScreen from "./views/StartScreen/StartScreen";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID_HERE";

ReactDOM.render(
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
  </React.StrictMode>,
  document.getElementById("game-layout")
);