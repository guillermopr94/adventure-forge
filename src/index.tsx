import React from "react";
import ReactDOM from "react-dom";
import { LanguageProvider } from "./common/language/LanguageContext";
import { ThemeProvider } from "./common/theme/ThemeContext";
import StartScreen from "./views/StartScreen/StartScreen";

ReactDOM.render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <StartScreen />
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>,
  document.getElementById("game-layout")
);