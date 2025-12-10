import React from "react";
import ReactDOM from "react-dom";
import { LanguageProvider } from "./language/LanguageContext";
import { ThemeProvider } from "./theme/ThemeContext";
import StartScreen from "./startScreen/StartScreen";

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