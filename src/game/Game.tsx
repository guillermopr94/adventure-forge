import React, { useRef, useEffect, useState } from "react";
import { useLanguage, useTranslation } from "../language/LanguageContext";
import "./Game.css";
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import TextNarrator from "../textNarrator/TextNarrator";
import { FiRotateCw } from 'react-icons/fi';
import BackgroundMusic from "../backgroundMusic/BackgroundMusic";
import { GoogleGenAI } from "@google/genai";

interface GameProps {
  userToken: string;
  gameType: string;
  genreKey: string;
}

const Game: React.FC<GameProps> = ({ userToken, gameType, genreKey }): React.ReactElement => {

  const option1 = useRef<HTMLButtonElement>(null);
  const option2 = useRef<HTMLButtonElement>(null);
  const option3 = useRef<HTMLButtonElement>(null);
  const spinner = useRef<HTMLDivElement>(null);
  const options = useRef<HTMLDivElement>(null);
  const gameCarousel = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [gameContent, setGameContent] = useState<string[]>([]);
  const [actualContent, setActualContent] = useState<string | null>(null);

  // Dynamic music selection based on genre
  const getMusicFile = (genre: string) => {
    switch (genre) {
      case 'scifi': return process.env.PUBLIC_URL + '/music/scifiMusic.mp3';
      case 'horror': return process.env.PUBLIC_URL + '/music/scifiMusic.mp3'; // Fallback or use specific if available
      case 'superheroes': return process.env.PUBLIC_URL + '/music/scifiMusic.mp3'; // Fallback
      case 'romance': return process.env.PUBLIC_URL + '/music/fantasyMusic.mp3'; // Fallback
      case 'fantasy':
      default: return process.env.PUBLIC_URL + '/music/fantasyMusic.mp3';
    }
  };

  const audioFile = getMusicFile(genreKey);

  const updateVoices = () => {
    const availableVoices = window.speechSynthesis.getVoices();
    setVoices(availableVoices);
    if (availableVoices.length > 0) {
      setVoicesLoaded(true);
    }
  };

  useEffect(() => {
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
    updateVoices();

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
    };
  }, []);

  const selectedVoice = voices.find((voice) => voice.lang.startsWith(language));

  const [gameHistory, setGameHistory] = useState<any[]>([
    {
      role: "user", // Gemini uses 'user' and 'model' roles, but for history context we can adapt
      parts: [{ text: t("game_history_content", { gameType: gameType }) }],
    },
  ]);

  function toggleSpinner(visible: boolean) {
    if (spinner.current && gameCarousel.current) {
      spinner.current.classList.toggle("hidden", !visible);
      gameCarousel.current.classList.toggle("hidden", visible);
    }
  }

  function toggleOptions(visible: boolean) {
    if (options.current) {
      options.current.classList.toggle("hidden", !visible);
    } else {
      console.error("No se encontró el elemento 'options'.");
    }
  }

  function extractOptions(text: string) {
    const lines = text.split('\n');
    const extractedOptions: string[] = [];
    let newText = "";

    for (const line of lines) {
      const lowerCaseLine = line.toLowerCase();
      // Improved regex to catch 1. 2. 3. or 1) 2) 3) or Option 1: etc.
      if (/^(\d+[\.\)]|opci[oó]n\s*\d+\:?)/i.test(lowerCaseLine)) {
        // It's likely an option
        const separatorIndex = line.search(/[\.\)\:]/);
        if (separatorIndex !== -1) {
          const optionText = line.slice(separatorIndex + 1).trim();
          if (optionText) extractedOptions.push(optionText);
        }
      } else {
        newText += line + "\n";
      }
    }

    // Fallback if regex fails but we have 3 distinct short lines at the end? 
    // For now rely on the prompt instructions.

    console.log('Opciones extraídas:', extractedOptions);
    return { options: extractedOptions, newText: newText.trim() };
  }

  async function startGame() {
    toggleSpinner(true);
    toggleOptions(false);
    setActualContent(null);

    const introPrompt = t("intro_prompt", { gameType: gameType });
    // Update history with initial prompt
    setGameHistory(prev => [...prev, { role: "user", parts: [{ text: introPrompt }] }]);
    const introText = await fetchGeminiResponse(introPrompt);
    // Update history with model response
    setGameHistory(prev => [...prev, { role: "model", parts: [{ text: introText }] }]);

    const { options: introOptions, newText } = extractOptions(introText);
    setGameContent((prev) => [...prev, newText]);

    if (!voicesLoaded) {
      const checkVoicesInterval = setInterval(() => {
        if (voicesLoaded) {
          clearInterval(checkVoicesInterval);
          setActualContent(newText);
        }
      }, 100);
    } else {
      setActualContent(newText);
    }

    updateOptionButtons(introOptions);

    toggleSpinner(false);
    toggleOptions(true);
  }

  function updateOptionButtons(currentOptions: string[]) {
    const buttons = [option1, option2, option3];
    for (let i = 0; i < 3; i++) {
      const btn = buttons[i].current;
      if (btn) {
        if (currentOptions[i]) {
          btn.textContent = currentOptions[i];
          btn.disabled = false;
        } else {
          btn.textContent = `Opción ${i + 1}`;
          btn.disabled = true; // Disable if no option found
        }
      }
    }
  }

  async function sendChoice(choiceIndex: number) {
    toggleOptions(false);
    toggleSpinner(true);
    setActualContent(null);

    // Get the text of the chosen option
    const buttons = [option1, option2, option3];
    const choiceText = buttons[choiceIndex - 1].current?.textContent || `Option ${choiceIndex}`;

    const prompt = `I choose option ${choiceIndex}: ${choiceText}. What happens next?`;

    // Update history with user choice
    setGameHistory(prev => [...prev, { role: "user", parts: [{ text: prompt }] }]);

    const response = await fetchGeminiResponse(prompt);

    // Update history with model response
    setGameHistory(prev => [...prev, { role: "model", parts: [{ text: response }] }]);

    const { options: responseOptions, newText } = extractOptions(response);

    updateOptionButtons(responseOptions);

    setGameContent((prev) => [...prev, newText]);
    setActualContent(newText);

    toggleSpinner(false);

    if (response.toLowerCase().includes(t("game_end")) || response.toLowerCase().includes("fin de la aventura")) {
      setGameContent((prev) => [...prev, `<p>${t("game_restart")}</p>`]);
      if (option1.current) option1.current.disabled = true;
      if (option2.current) option2.current.disabled = true;
      if (option3.current) option3.current.disabled = true;
    } else {
      toggleOptions(true);
    }
  }

  // Gemini API Integration
  const [genAIClient, setGenAIClient] = useState<any>(null);

  async function fetchGeminiResponse(prompt: string): Promise<string> {
    try {
      let client = genAIClient;
      if (!client) {
        client = new GoogleGenAI({ apiKey: userToken });
        setGenAIClient(client);
      }

      // Construct prompt from history
      let fullPrompt = "";
      gameHistory.forEach(msg => {
        const text = msg.parts ? msg.parts[0].text : "";
        fullPrompt += `${msg.role === 'user' ? 'User' : 'Model'}: ${text}\n`;
      });
      fullPrompt += `User: ${prompt}\nModel:`;

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
          temperature: 0.7,
        }
      });

      const text = response.text;
      return text || "No response text";

    } catch (error) {
      console.error("Error fetching from Gemini:", error);
      return "Error: Could not connect to the AI. Please check your API key and try again.";
    }
  }

  function resetGame() {
    window.speechSynthesis.cancel();
    toggleOptions(false);
    setGameContent([]);
    setGenAIClient(null); // Reset client to force re-initialization
    setGameHistory([
      {
        role: "user",
        parts: [{ text: t("game_history_content", { gameType: gameType }) }],
      },
    ]);
    startGame();
  }

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    initializeGame();
  }, [voicesLoaded]);

  const initializeGame = () => {
    if (voicesLoaded && !genAIClient) { // Only start if voices are loaded and client is not yet initialized
      startGame();
    }
  };

  return (
    <>
      <div className="tools-buttons-container">
        <div>
          <BackgroundMusic audioFile={audioFile} />
          {(voicesLoaded && actualContent != null) && <TextNarrator text={actualContent} voice={selectedVoice} />}
        </div>
        <button onClick={resetGame} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <FiRotateCw color="white" size={30} />
        </button >
      </div>
      <div ref={gameCarousel}>
        <Carousel
          showArrows={true}
          showStatus={false}
          showThumbs={false}
          showIndicators={false}
          infiniteLoop={false}
          selectedItem={gameContent.length - 1}
        >
          {gameContent.map((item, index) => (
            <div id="game-content" key={index}>
              <p style={{ whiteSpace: 'pre-line' }}>{item}</p>
            </div>
          ))}
        </Carousel>
      </div>
      <div ref={spinner} className="spinner">{t('loadingText')}</div>
      <div ref={options} id="options" className="hidden">
        <button ref={option1} onClick={() => sendChoice(1)}>Opción 1</button>
        <button ref={option2} onClick={() => sendChoice(2)}>Opción 2</button>
        <button ref={option3} onClick={() => sendChoice(3)}>Opción 3</button>
      </div>
    </>
  );

}
export default Game;
